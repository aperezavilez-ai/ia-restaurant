import { QRCodeSVG } from 'qrcode.react'
import { cn } from '@/lib/utils'
import { getAppUrl } from '@/lib/config'

interface MenuQrCodeProps {
  url: string
  size?: number
  className?: string
  label?: string
  id?: string
}

export function MenuQrCode({ url, size = 160, className, label, id }: MenuQrCodeProps) {
  return (
    <div className={cn('flex flex-col items-center gap-2', className)}>
      <div className="bg-white p-3 rounded-xl border-2 border-brand-200 shadow-glow">
        <QRCodeSVG
          id={id}
          value={url}
          size={size}
          level="M"
          includeMargin={false}
          bgColor="#ffffff"
          fgColor="#1e293b"
        />
      </div>
      {label && <p className="text-[10px] font-mono text-slate-500 text-center max-w-[200px] truncate">{label}</p>}
    </div>
  )
}

export function comensalMenuUrl(mesa: number, origin?: string, tenantId?: string) {
  const base = origin || getAppUrl()
  const url = new URL(`${base.replace(/\/$/, '')}/comensal`)
  url.searchParams.set('mesa', String(mesa))
  if (tenantId) url.searchParams.set('tenant', tenantId)
  return url.toString()
}
