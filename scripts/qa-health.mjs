/**
 * Health checks go-live Día 5 — producción, API y RLS Supabase.
 * Ejecutar: npm run qa:health
 */
import { createClient } from '@supabase/supabase-js'
import { loadEnv, PROJECT_REF } from './load-env.mjs'

loadEnv()

const APP_URL = process.env.VITE_APP_URL || 'https://www.iarestaurant.mx'
const SUPABASE_URL = process.env.VITE_SUPABASE_URL
const ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY
const TOKEN = process.env.SUPABASE_ACCESS_TOKEN

const CRITICAL_TABLES = [
  'tenants', 'organizations', 'users', 'orders', 'order_items', 'payments',
  'cash_registers', 'products', 'tables', 'tenant_devices', 'login_audit',
]

let passed = 0
let failed = 0

function assert(name, cond, detail = '') {
  if (cond) {
    passed++
    console.log(`  ✓ ${name}${detail ? ` — ${detail}` : ''}`)
  } else {
    failed++
    console.error(`  ✗ ${name}${detail ? ` — ${detail}` : ''}`)
  }
}

async function fetchStatus(url) {
  const res = await fetch(url, { redirect: 'follow' })
  return { ok: res.ok, status: res.status }
}

async function checkRls() {
  if (!TOKEN) {
    assert('RLS audit (requiere SUPABASE_ACCESS_TOKEN)', false, 'token ausente')
    return
  }

  const query = `
    SELECT c.relname AS table_name, c.relrowsecurity AS rls_enabled
    FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname = 'public' AND c.relkind = 'r'
      AND c.relname = ANY(ARRAY[${CRITICAL_TABLES.map(t => `'${t}'`).join(',')}])
    ORDER BY c.relname;
  `

  const res = await fetch(`https://api.supabase.com/v1/projects/${PROJECT_REF}/database/query`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query }),
  })

  if (!res.ok) {
    assert('RLS audit query', false, await res.text())
    return
  }

  const rows = JSON.parse(await res.text())
  const byName = Object.fromEntries(rows.map(r => [r.table_name, r.rls_enabled]))

  for (const table of CRITICAL_TABLES) {
    assert(`RLS activo: ${table}`, byName[table] === true, byName[table] ? 'ok' : 'desactivado o ausente')
  }
}

async function checkAnonIsolation() {
  if (!SUPABASE_URL || !ANON_KEY) {
    assert('anon sin auth no inserta orders', false, 'faltan vars Supabase')
    return
  }

  const anon = createClient(SUPABASE_URL, ANON_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  })

  const { error } = await anon.from('orders').insert({
    id: '00000000-0000-0000-0000-000000000099',
    tenant_id: '00000000-0000-0000-0000-000000000001',
    sucursal_id: '00000000-0000-0000-0000-000000000001',
    status: 'abierta',
    total: 0,
  })

  assert('anon sin auth no inserta orders', Boolean(error), error?.message || 'insertó sin permiso')
}

console.log('QA Health — Observabilidad Día 5\n')

try {
  const app = await fetchStatus(APP_URL)
  assert(`App producción ${APP_URL}`, app.ok, `HTTP ${app.status}`)
} catch (e) {
  assert(`App producción ${APP_URL}`, false, e.message)
}

try {
  const health = await fetchStatus(`${APP_URL}/api/health`)
  assert('API /api/health', health.ok, `HTTP ${health.status}`)
} catch (e) {
  assert('API /api/health', false, e.message)
}

try {
  const supa = await fetchStatus(`${SUPABASE_URL}/rest/v1/`)
  assert('Supabase REST alcanzable', supa.status === 200 || supa.status === 401, `HTTP ${supa.status}`)
} catch (e) {
  assert('Supabase REST alcanzable', false, e.message)
}

await checkRls()
await checkAnonIsolation()

console.log(`\n${passed} passed, ${failed} failed`)
process.exit(failed > 0 ? 1 : 0)
