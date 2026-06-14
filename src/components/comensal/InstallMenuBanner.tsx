import { useState } from 'react'
import { Download, Share, X } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { usePwaInstall } from '@/hooks/usePwaInstall'

const DISMISS_KEY = 'comensal-install-dismissed'

export function InstallMenuBanner() {
  const { canInstall, isStandalone, isIos, install } = usePwaInstall()
  const [dismissed, setDismissed] = useState(() => localStorage.getItem(DISMISS_KEY) === '1')
  const [showIosSteps, setShowIosSteps] = useState(false)

  if (isStandalone || dismissed) return null
  if (!canInstall && !isIos) return null

  const dismiss = () => {
    localStorage.setItem(DISMISS_KEY, '1')
    setDismissed(true)
  }

  return (
    <div className="mx-4 mt-3 p-3 rounded-xl bg-white border border-brand-200 shadow-glow relative">
      <button
        type="button"
        onClick={dismiss}
        className="absolute top-2 right-2 p-1 text-slate-400 hover:text-slate-600"
        aria-label="Cerrar"
      >
        <X size={14} />
      </button>
      <p className="text-xs font-bold text-slate-800 pr-6">Instala el menú en tu celular</p>
      <p className="text-[11px] text-slate-600 mt-1">
        Acceso rápido sin buscar el QR cada vez. Al abrir, escanea el código de tu mesa.
      </p>
      <div className="flex gap-2 mt-3 flex-wrap">
        {canInstall && (
          <Button size="sm" className="gap-1" onClick={() => install()}>
            <Download size={14} /> Instalar
          </Button>
        )}
        {isIos && (
          <Button size="sm" variant="outline" className="gap-1" onClick={() => setShowIosSteps((v) => !v)}>
            <Share size={14} /> {showIosSteps ? 'Ocultar' : 'iPhone: agregar a inicio'}
          </Button>
        )}
      </div>
      {showIosSteps && (
        <ol className="mt-3 text-[11px] text-slate-600 space-y-1 list-decimal list-inside">
          <li>Toca el ícono Compartir en Safari</li>
          <li>Selecciona «Agregar a pantalla de inicio»</li>
          <li>Abre la app y escanea el QR de tu mesa</li>
        </ol>
      )}
    </div>
  )
}
