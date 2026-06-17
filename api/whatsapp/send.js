import { createClient } from '@supabase/supabase-js'

function setCors(res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'authorization, content-type')
}

function normalizePhone(phone) {
  const digits = String(phone || '').replace(/\D/g, '')
  if (digits.length === 10) return `52${digits}`
  if (digits.length === 12 && digits.startsWith('52')) return digits
  return digits
}

function buildWaLink(phone, message) {
  const to = normalizePhone(phone)
  if (!to) return ''
  return `https://wa.me/${to}?text=${encodeURIComponent(message)}`
}

async function verifyUser(req) {
  const url = process.env.VITE_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  const anonKey = process.env.VITE_SUPABASE_ANON_KEY
  if (!url || !serviceKey || !anonKey) {
    return { error: 'Servidor sin configurar SUPABASE_SERVICE_ROLE_KEY', status: 500 }
  }

  const authHeader = req.headers.authorization || ''
  if (!authHeader.startsWith('Bearer ')) {
    return { error: 'No autorizado', status: 401 }
  }

  const token = authHeader.slice(7)
  const userClient = createClient(url, anonKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  })
  const { data: authData, error: authErr } = await userClient.auth.getUser(token)
  if (authErr || !authData.user) return { error: 'Sesión inválida', status: 401 }

  const admin = createClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  })
  const { data: profile } = await admin
    .from('users')
    .select('id, tenant_id')
    .eq('id', authData.user.id)
    .single()

  if (!profile?.tenant_id) return { error: 'Usuario sin restaurante', status: 403 }

  const { data: organization } = await admin
    .from('organizations')
    .select('whatsapp_alerts, whatsapp_config')
    .eq('tenant_id', profile.tenant_id)
    .maybeSingle()

  return { admin, profile, organization: organization || {} }
}

async function sendCloudApi(config, to, body) {
  const phoneNumberId = config?.phone_number_id
  const accessToken = config?.access_token
  if (!phoneNumberId || !accessToken) return null

  const res = await fetch(`https://graph.facebook.com/v21.0/${phoneNumberId}/messages`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      messaging_product: 'whatsapp',
      to: normalizePhone(to),
      type: 'text',
      text: { body },
    }),
  })

  const data = await res.json()
  if (!res.ok) {
    const msg = data?.error?.message || 'WhatsApp API rechazó el envío'
    throw new Error(msg)
  }
  return data
}

async function logNotification(admin, tenantId, entry) {
  const { data } = await admin.from('notifications').insert({
    tenant_id: tenantId,
    channel: 'whatsapp',
    title: entry.title,
    message: entry.message,
    recipient: entry.recipient,
    status: entry.status,
    metadata: entry.metadata || {},
  }).select().single()
  return data
}

export default async function handler(req, res) {
  setCors(res)
  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'POST') return res.status(405).json({ error: 'Método no permitido' })

  const gate = await verifyUser(req)
  if (gate.error) return res.status(gate.status).json({ error: gate.error })

  const { admin, profile, organization } = gate
  const { type, title, message, recipient } = req.body || {}

  if (!title || !message) {
    return res.status(400).json({ error: 'Título y mensaje requeridos' })
  }

  const config = organization.whatsapp_config || {}
  const alerts = config.alerts || {}
  const teamPhone = recipient || organization.whatsapp_alerts

  if (type === 'order_ready' && alerts.order_ready === false) {
    return res.status(200).json({ status: 'skipped', reason: 'alert_disabled' })
  }
  if (type === 'payment_complete' && alerts.payment_complete === false) {
    return res.status(200).json({ status: 'skipped', reason: 'alert_disabled' })
  }
  const securityTypes = ['security_new_device', 'security_new_ip', 'security_ip_blocked']
  if (securityTypes.includes(type) && alerts.security === false) {
    return res.status(200).json({ status: 'skipped', reason: 'security_alert_disabled' })
  }

  if (!teamPhone) {
    return res.status(400).json({ error: 'Configura el WhatsApp para alertas en Ajustes' })
  }

  const fullMessage = `*${title}*\n${message}`

  try {
    const apiResult = await sendCloudApi(config, teamPhone, fullMessage)
    if (apiResult) {
      const row = await logNotification(admin, profile.tenant_id, {
        title,
        message,
        recipient: teamPhone,
        status: 'enviada',
        metadata: { type, mode: 'cloud_api', wamid: apiResult.messages?.[0]?.id },
      })
      return res.status(200).json({ status: 'enviada', notification_id: row?.id })
    }

    const waUrl = buildWaLink(teamPhone, fullMessage)
    const row = await logNotification(admin, profile.tenant_id, {
      title,
      message,
      recipient: teamPhone,
      status: 'pendiente',
      metadata: { type, mode: 'wa_me', wa_url: waUrl },
    })
    return res.status(200).json({ status: 'pendiente', wa_url: waUrl, notification_id: row?.id })
  } catch (e) {
    const waUrl = buildWaLink(teamPhone, fullMessage)
    await logNotification(admin, profile.tenant_id, {
      title,
      message,
      recipient: teamPhone,
      status: 'fallida',
      metadata: { type, error: e instanceof Error ? e.message : 'error', wa_url: waUrl },
    })
    return res.status(400).json({
      error: e instanceof Error ? e.message : 'No se pudo enviar',
      wa_url: waUrl,
    })
  }
}
