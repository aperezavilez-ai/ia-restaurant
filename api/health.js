function setCors(res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS')
}

export default function handler(req, res) {
  setCors(res)
  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'GET') return res.status(405).json({ error: 'Método no permitido' })

  const supabaseConfigured = Boolean(
    process.env.VITE_SUPABASE_URL && process.env.VITE_SUPABASE_ANON_KEY
  )

  return res.status(200).json({
    status: 'ok',
    service: 'ia-restaurant',
    version: process.env.VITE_APP_VERSION || '1.0.0',
    timestamp: new Date().toISOString(),
    supabase: supabaseConfigured ? 'configured' : 'missing_env',
  })
}
