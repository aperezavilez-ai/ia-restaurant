import { comensalMenuUrl } from '@/components/qr/MenuQrCode'

export interface TableQrPrintData {
  mesa: number
  url: string
  tenantName: string
  areaName?: string
  sucursalName?: string
}

export function getQrSvgElement(svgId: string): SVGSVGElement | null {
  const el = document.getElementById(svgId)
  return el instanceof SVGSVGElement ? el : null
}

export function downloadQrSvg(svgId: string, filename: string) {
  const svg = getQrSvgElement(svgId)
  if (!svg) return false
  const blob = new Blob([new XMLSerializer().serializeToString(svg)], { type: 'image/svg+xml' })
  const a = document.createElement('a')
  a.href = URL.createObjectURL(blob)
  a.download = filename
  a.click()
  URL.revokeObjectURL(a.href)
  return true
}

export async function downloadQrPng(svgId: string, filename: string, size = 512) {
  const svg = getQrSvgElement(svgId)
  if (!svg) return false

  const svgData = new XMLSerializer().serializeToString(svg)
  const url = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svgData)}`

  await new Promise<void>((resolve, reject) => {
    const img = new Image()
    img.onload = () => {
      const canvas = document.createElement('canvas')
      canvas.width = size
      canvas.height = size
      const ctx = canvas.getContext('2d')
      if (!ctx) {
        reject(new Error('Canvas no disponible'))
        return
      }
      ctx.fillStyle = '#ffffff'
      ctx.fillRect(0, 0, size, size)
      ctx.drawImage(img, 0, 0, size, size)
      canvas.toBlob((blob) => {
        if (!blob) {
          reject(new Error('No se pudo generar PNG'))
          return
        }
        const a = document.createElement('a')
        a.href = URL.createObjectURL(blob)
        a.download = filename
        a.click()
        URL.revokeObjectURL(a.href)
        resolve()
      }, 'image/png')
    }
    img.onerror = () => reject(new Error('Error al renderizar QR'))
    img.src = url
  })
  return true
}

export function printTableQrSheet(data: TableQrPrintData) {
  const win = window.open('', '_blank', 'width=480,height=640')
  if (!win) return false

  const subtitle = [data.areaName, data.sucursalName].filter(Boolean).join(' · ')

  win.document.write(`<!DOCTYPE html>
<html><head><meta charset="utf-8"><title>QR Mesa ${data.mesa}</title>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: system-ui, sans-serif; display: flex; align-items: center; justify-content: center; min-height: 100vh; padding: 24px; }
  .sheet { text-align: center; max-width: 320px; border: 2px dashed #e2e8f0; border-radius: 16px; padding: 24px; }
  h1 { font-size: 14px; font-weight: 800; color: #1e293b; margin-bottom: 4px; }
  h2 { font-size: 42px; font-weight: 900; color: #f59000; margin: 8px 0 16px; }
  .sub { font-size: 11px; color: #64748b; margin-bottom: 16px; }
  img { width: 200px; height: 200px; }
  .hint { font-size: 11px; color: #475569; margin-top: 16px; line-height: 1.5; }
  .url { font-size: 9px; font-family: monospace; color: #94a3b8; margin-top: 8px; word-break: break-all; }
  @media print { body { padding: 0; } .sheet { border: none; } }
</style></head><body>
  <div class="sheet">
    <h1>${escapeHtml(data.tenantName)}</h1>
    ${subtitle ? `<p class="sub">${escapeHtml(subtitle)}</p>` : ''}
    <h2>MESA ${data.mesa}</h2>
    <img src="https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(data.url)}" alt="QR Mesa ${data.mesa}" />
    <p class="hint">Escanea para ver el menú y ordenar desde tu mesa</p>
    <p class="url">${escapeHtml(data.url)}</p>
  </div>
  <script>window.onload = () => { window.print(); window.onafterprint = () => window.close(); }<\/script>
</body></html>`)
  win.document.close()
  return true
}

export function buildTableQrData(
  mesa: number,
  tenantName: string,
  areaName?: string,
  sucursalName?: string,
): TableQrPrintData {
  return {
    mesa,
    url: comensalMenuUrl(mesa),
    tenantName,
    areaName,
    sucursalName,
  }
}

function escapeHtml(text: string) {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}
