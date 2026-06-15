import { useEffect, useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { QrCode, Download, Printer, ImageIcon, ExternalLink } from 'lucide-react'
import { Card, CardHeader, CardBody } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { cn } from '@/lib/utils'
import { MenuQrCode, comensalMenuUrl } from '@/components/qr/MenuQrCode'
import { useTenantContext } from '@/hooks/useTenantContext'
import { useAuthStore } from '@/store/authStore'
import { tableRepository } from '@/repositories/tableRepository'
import { buildTableQrData, downloadQrPng, downloadQrSvg, printTableQrSheet } from '@/lib/qrExport'
import { toast } from '@/components/ui/Toast'
import type { RestaurantTable } from '@/types'

interface TableQrPrintPanelProps {
  compact?: boolean
  showManageLink?: boolean
}

export function TableQrPrintPanel({ compact, showManageLink = true }: TableQrPrintPanelProps) {
  const ctx = useTenantContext()
  const { tenant, sucursal } = useAuthStore()
  const [tables, setTables] = useState<RestaurantTable[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!ctx) return
    setLoading(true)
    tableRepository.getTables(ctx).then((t) => {
      setTables(t.sort((a, b) => a.number - b.number))
      if (t.length && !selectedId) setSelectedId(t[0].id)
      setLoading(false)
    })
  }, [ctx])

  const selected = useMemo(
    () => tables.find((t) => t.id === selectedId) ?? null,
    [tables, selectedId],
  )

  const svgId = selected ? `qr-print-mesa-${selected.number}` : ''
  const url = selected ? comensalMenuUrl(selected.number) : ''
  const tenantName = tenant?.name || 'Mi Restaurante'

  const handleDownloadSvg = () => {
    if (!selected || !downloadQrSvg(svgId, `qr-mesa-${selected.number}.svg`)) {
      toast('No se pudo descargar el QR', 'error')
      return
    }
    toast(`QR Mesa ${selected.number} descargado (SVG)`, 'success')
  }

  const handleDownloadPng = async () => {
    if (!selected) return
    try {
      await downloadQrPng(svgId, `qr-mesa-${selected.number}.png`)
      toast(`QR Mesa ${selected.number} descargado (PNG)`, 'success')
    } catch {
      toast('No se pudo generar PNG', 'error')
    }
  }

  const handlePrint = () => {
    if (!selected) return
    const ok = printTableQrSheet(
      buildTableQrData(selected.number, tenantName, selected.area?.name, sucursal?.name),
    )
    if (!ok) toast('Permite ventanas emergentes para imprimir', 'error')
    else toast(`Enviando QR Mesa ${selected.number} a impresión`, 'success')
  }

  if (loading) {
    return (
      <Card className="p-4 text-sm text-slate-500 text-center">
        Cargando mesas para QR…
      </Card>
    )
  }

  if (!tables.length) {
    return (
      <Card className="p-4 text-sm text-slate-500 text-center">
        No hay mesas registradas. Agrégalas en Control de piso.
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-brand-50 text-brand-600">
              <QrCode size={compact ? 18 : 20} />
            </div>
            <div>
              <h3 className="font-bold text-slate-800">QR por mesa</h3>
              <p className="text-xs text-slate-500">
                Selecciona mesa → imprime o descarga para colocar en el restaurante
              </p>
            </div>
          </div>
          {showManageLink && !compact && (
            <Link to="/app/qr" className="text-xs font-semibold text-brand-600 hover:underline">
              Ver todas las mesas →
            </Link>
          )}
        </div>
      </CardHeader>
      <CardBody className="space-y-4">
        <div className={cn('grid gap-2', compact ? 'grid-cols-5' : 'grid-cols-6 sm:grid-cols-8')}>
          {tables.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setSelectedId(t.id)}
              className={cn(
                'py-2.5 rounded-xl border font-mono font-bold text-sm transition-all',
                selectedId === t.id
                  ? 'border-brand-400 bg-brand-50 text-brand-700 shadow-glow'
                  : 'border-command-border text-slate-600 hover:border-brand-300 hover:bg-brand-50/50',
              )}
            >
              {t.number}
            </button>
          ))}
        </div>

        {selected && (
          <div className={cn('flex flex-col sm:flex-row gap-4 items-center', compact && 'flex-col')}>
            <MenuQrCode
              id={svgId}
              url={url}
              size={compact ? 140 : 180}
              label={`Mesa ${selected.number}`}
            />
            <div className="flex-1 w-full space-y-3">
              <div>
                <p className="font-black text-xl text-slate-800">Mesa {selected.number}</p>
                <p className="text-xs text-slate-500">
                  {selected.area?.name || 'Sin área'}
                  {sucursal?.name ? ` · ${sucursal.name}` : ''}
                </p>
                <p className="text-[10px] font-mono text-brand-600 mt-2 break-all">{url}</p>
              </div>
              <Badge variant="info" className="text-[10px]">
                Cada mesa tiene un QR único — control por número de mesa
              </Badge>
              <div className="flex flex-wrap gap-2">
                <Button size="sm" onClick={handlePrint}>
                  <Printer size={14} /> Imprimir
                </Button>
                <Button size="sm" variant="outline" onClick={handleDownloadSvg}>
                  <Download size={14} /> SVG
                </Button>
                <Button size="sm" variant="outline" onClick={handleDownloadPng}>
                  <ImageIcon size={14} /> PNG
                </Button>
                <a href={url} target="_blank" rel="noreferrer">
                  <Button size="sm" variant="ghost" type="button">
                    <ExternalLink size={14} /> Probar menú
                  </Button>
                </a>
              </div>
            </div>
          </div>
        )}
      </CardBody>
    </Card>
  )
}
