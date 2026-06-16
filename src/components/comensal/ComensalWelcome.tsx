import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { QrCode, Loader2 } from 'lucide-react'
import { InstallMenuBanner } from '@/components/comensal/InstallMenuBanner'
import { publicMenuService } from '@/services/publicMenuService'

const LAST_MESA_KEY = 'comensal-last-mesa'
const LAST_TENANT_KEY = 'comensal-last-tenant'

export function ComensalWelcome() {
  const [tenantName, setTenantName] = useState('IA·RESTAURANT')
  const [loading, setLoading] = useState(true)
  const lastMesa = localStorage.getItem(LAST_MESA_KEY)
  const lastTenant = localStorage.getItem(LAST_TENANT_KEY)

  useEffect(() => {
    publicMenuService.getTenantName()
      .then(setTenantName)
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="min-h-screen bg-command-bg max-w-md mx-auto">
      <header className="gradient-amber text-white p-6">
        <p className="text-[10px] opacity-80 uppercase tracking-widest">Menú digital</p>
        <p className="font-black text-2xl mt-1">{tenantName}</p>
      </header>

      <InstallMenuBanner />

      <div className="p-6 flex flex-col items-center text-center">
        {loading ? (
          <Loader2 size={28} className="animate-spin text-brand-500 mt-8" />
        ) : (
          <>
            <div className="w-20 h-20 rounded-2xl bg-brand-100 flex items-center justify-center mb-5">
              <QrCode size={40} className="text-brand-600" />
            </div>
            <h1 className="font-bold text-lg text-slate-800">Escanea el QR de tu mesa</h1>
            <p className="text-sm text-slate-600 mt-2 max-w-xs">
              El código en la mesa abre el menú con tu número de mesa. Si ya instalaste la app, escanea el QR para empezar a pedir.
            </p>

            {lastMesa && (
              <Link
                to={lastTenant ? `/comensal?mesa=${lastMesa}&tenant=${lastTenant}` : `/comensal?mesa=${lastMesa}`}
                className="mt-6 w-full py-3 rounded-xl bg-brand-500 text-white font-bold text-sm hover:bg-brand-600 transition-colors"
              >
                Continuar en mesa {lastMesa}
              </Link>
            )}

            <p className="text-[10px] text-slate-400 mt-8 uppercase tracking-widest">
              Pedidos · Mesero · Cuenta
            </p>
          </>
        )}
      </div>
    </div>
  )
}
