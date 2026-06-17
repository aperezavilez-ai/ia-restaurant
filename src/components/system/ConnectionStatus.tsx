import { useEffect, useState } from 'react'
import { Wifi, WifiOff, CloudUpload } from 'lucide-react'
import { syncService } from '@/services/syncService'

export function ConnectionStatus({ compact }: { compact?: boolean }) {
  const [online, setOnline] = useState(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  )
  const [pending, setPending] = useState(0)

  useEffect(() => {
    const refreshPending = () => {
      syncService.getPendingCount().then(setPending).catch(() => {})
    }

    const onOnline = () => setOnline(true)
    const onOffline = () => setOnline(false)

    window.addEventListener('online', onOnline)
    window.addEventListener('offline', onOffline)
    window.addEventListener('sync-queue-changed', refreshPending)

    refreshPending()
    const timer = setInterval(refreshPending, 15000)

    return () => {
      window.removeEventListener('online', onOnline)
      window.removeEventListener('offline', onOffline)
      window.removeEventListener('sync-queue-changed', refreshPending)
      clearInterval(timer)
    }
  }, [])

  return (
    <span className={`flex items-center gap-2 ${compact ? 'text-[10px]' : 'text-xs'}`}>
      <span
        className={`flex items-center gap-1 ${online ? 'text-ops-success' : 'text-ops-danger'}`}
        title={online ? 'Conectado a internet' : 'Sin conexión — operando en local'}
      >
        {online ? <Wifi size={compact ? 10 : 12} /> : <WifiOff size={compact ? 10 : 12} />}
        {online ? 'En línea' : 'Sin red'}
      </span>
      {pending > 0 && (
        <span
          className="flex items-center gap-0.5 text-amber-600 font-semibold"
          title="Operaciones pendientes de sincronizar con el servidor"
        >
          <CloudUpload size={compact ? 10 : 11} />
          {pending} sync
        </span>
      )}
    </span>
  )
}
