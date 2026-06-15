export const DEMO_TENANT_ID = '00000000-0000-0000-0000-000000000001'
export const DEMO_SUCURSAL_ID = '00000000-0000-0000-0000-000000000002'
export const DEMO_ORG_ID = '00000000-0000-0000-0000-000000000003'

/** Dominio de producción (Vercel custom domain) */
export const PRODUCTION_APP_URL = 'https://iarestaurant.mx'

export function isSupabaseConfigured(): boolean {
  const url = import.meta.env.VITE_SUPABASE_URL
  const key = import.meta.env.VITE_SUPABASE_ANON_KEY
  return Boolean(
    url &&
    key &&
    !url.includes('tu-proyecto') &&
    !url.includes('your-project') &&
    key !== 'tu-anon-key-aqui' &&
    key !== 'your-anon-key'
  )
}

export function getDataMode(): 'local' | 'remote' {
  return isSupabaseConfigured() ? 'remote' : 'local'
}

/** URL pública de la app (Vercel o local). Usada en redirects de Auth y QR. */
export function getAppUrl(): string {
  const fromEnv = import.meta.env.VITE_APP_URL as string | undefined
  if (fromEnv && !fromEnv.includes('localhost') && !fromEnv.includes('tu-app') && !fromEnv.includes('tu-proyecto')) {
    return fromEnv.replace(/\/$/, '')
  }
  if (typeof window !== 'undefined') {
    const { origin, hostname } = window.location
    if (hostname === 'iarestaurant.mx' || hostname === 'www.iarestaurant.mx') {
      return 'https://iarestaurant.mx'
    }
    if (hostname.endsWith('.vercel.app') || hostname === 'localhost' || hostname === '127.0.0.1') {
      return origin
    }
  }
  if (import.meta.env.PROD) return PRODUCTION_APP_URL
  return 'http://localhost:5173'
}
