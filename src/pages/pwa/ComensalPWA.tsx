import { useState, useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { QrCode, ShoppingCart, Bell, CreditCard, Star, Plus, Minus, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { formatCurrency } from '@/lib/utils'
import { useLiveFlowStore } from '@/store/liveFlowStore'
import { useLiveFlowSync } from '@/hooks/useLiveFlowSync'
import { useComensalManifest } from '@/hooks/useComensalManifest'
import { toast } from '@/components/ui/Toast'
import { InstallMenuBanner } from '@/components/comensal/InstallMenuBanner'
import { ComensalWelcome } from '@/components/comensal/ComensalWelcome'
import { ProductMenuCard } from '@/components/comensal/ProductMenuCard'
import { ProductAddSheet } from '@/components/comensal/ProductAddSheet'
import { publicMenuService } from '@/services/publicMenuService'
import { isSupabaseConfigured } from '@/lib/config'
import type { Category, Product } from '@/types'

const STATUS_LABELS: Record<string, string> = {
  enviado: 'Enviado — esperando caja',
  validado: 'Validado',
  en_preparacion: 'En preparación',
  listo: '¡Listo! En camino',
  entregado: 'Entregado',
  rechazado: 'Rechazado',
}

const LAST_MESA_KEY = 'comensal-last-mesa'
const LAST_TENANT_KEY = 'comensal-last-tenant'

interface CartLine {
  lineId: string
  product_id: string
  name: string
  price: number
  qty: number
  notes?: string
}

type ResolvedTable = NonNullable<Awaited<ReturnType<typeof publicMenuService.resolveTableByNumber>>>

function ComensalMenuView({ mesa, tenantHint }: { mesa: number; tenantHint?: string }) {
  const [table, setTable] = useState<ResolvedTable | null>(null)
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [tenantName, setTenantName] = useState('IA·RESTAURANT')
  const [loading, setLoading] = useState(true)
  const [sheetProduct, setSheetProduct] = useState<Product | null>(null)

  const [cart, setCart] = useState<CartLine[]>([])
  const [sending, setSending] = useState(false)
  const [activeOrderId, setActiveOrderId] = useState<string | null>(null)

  const submitQROrder = useLiveFlowStore((s) => s.submitQROrder)
  const addWaiterAlert = useLiveFlowStore((s) => s.addWaiterAlert)
  const hydrateFromRemote = useLiveFlowStore((s) => s.hydrateFromRemote)
  const { qrOrders } = useLiveFlowSync(1500)

  const activeOrders = qrOrders
    .filter((o) => o.table_number === mesa && !['entregado', 'rechazado'].includes(o.status))
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
  const activeOrder = activeOrderId
    ? activeOrders.find((o) => o.id === activeOrderId) ?? activeOrders[0]
    : activeOrders[0]

  const total = cart.reduce((s, i) => s + i.price * i.qty, 0)

  useEffect(() => {
    localStorage.setItem(LAST_MESA_KEY, String(mesa))
    if (tenantHint) localStorage.setItem(LAST_TENANT_KEY, tenantHint)
    if (isSupabaseConfigured()) hydrateFromRemote()
  }, [mesa, tenantHint, hydrateFromRemote])

  useEffect(() => {
    setLoading(true)
    Promise.all([publicMenuService.resolveTableByNumber(mesa, tenantHint)])
      .then(async ([tbl]) => {
        setTable(tbl)
        if (tbl?.tenant_id) localStorage.setItem(LAST_TENANT_KEY, tbl.tenant_id)
        const tenantId = tbl?.tenant_id
        const [menu, name] = await Promise.all([
          publicMenuService.getMenu(tenantId),
          publicMenuService.getTenantName(tenantId),
        ])
        setProducts(menu.products)
        setCategories(menu.categories)
        setTenantName(name)
      })
      .finally(() => setLoading(false))
  }, [mesa, tenantHint])

  useEffect(() => {
    if (activeOrder && activeOrder.id !== activeOrderId) setActiveOrderId(activeOrder.id)
  }, [activeOrder, activeOrderId])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-command-bg">
        <Loader2 size={28} className="animate-spin text-brand-500" />
      </div>
    )
  }

  if (!table) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-command-bg max-w-md mx-auto">
        <div className="text-center">
          <p className="text-slate-800 font-bold">Mesa {mesa} no encontrada</p>
          <p className="text-sm text-slate-600 mt-2">Escanea el QR correcto de tu mesa.</p>
          <a href="/comensal" className="text-brand-600 text-sm mt-4 inline-block">Volver</a>
        </div>
      </div>
    )
  }

  const addFromSheet = (product: Product, qty: number, notes: string) => {
    const normNotes = notes.trim()
    setCart((c) => {
      const existing = c.find(
        (i) => i.product_id === product.id && (i.notes || '') === normNotes
      )
      if (existing) {
        return c.map((i) =>
          i.lineId === existing.lineId ? { ...i, qty: i.qty + qty } : i
        )
      }
      return [
        ...c,
        {
          lineId: crypto.randomUUID(),
          product_id: product.id,
          name: product.name,
          price: product.price,
          qty,
          notes: normNotes || undefined,
        },
      ]
    })
  }

  const updateQty = (lineId: string, delta: number) => {
    setCart((c) =>
      c.map((i) => (i.lineId === lineId ? { ...i, qty: i.qty + delta } : i)).filter((i) => i.qty > 0)
    )
  }

  const qtyForProduct = (productId: string) =>
    cart.filter((c) => c.product_id === productId).reduce((s, i) => s + i.qty, 0)

  const sendOrder = async () => {
    if (!cart.length) return
    setSending(true)
    try {
      const order = await submitQROrder({
        table_id: table.id,
        table_number: table.number,
        area: table.area_name,
        waiter_id: table.waiter_id,
        waiter_name: table.waiter_name,
        items: cart.map((c) => ({
          product_id: c.product_id,
          product_name: c.name,
          quantity: c.qty,
          unit_price: c.price,
          notes: c.notes,
        })),
      })
      setActiveOrderId(order.id)
      setCart([])
      toast(
        activeOrders.length > 0
          ? 'Adicional enviado — se sumó a tu mesa'
          : 'Pedido enviado — ' + (order.status === 'en_preparacion' ? 'ya va a cocina' : 'caja lo validará'),
        'success'
      )
    } finally {
      setSending(false)
    }
  }

  const callWaiter = (type: 'ayuda' | 'cuenta' | 'servicio') => {
    const msgs = { ayuda: 'Necesito ayuda', cuenta: 'Quiero pagar la cuenta', servicio: 'Solicito servicio' }
    addWaiterAlert({
      type: type === 'cuenta' ? 'solicitud_cuenta' : type === 'ayuda' ? 'solicitud_ayuda' : 'solicitud_servicio',
      table_number: mesa,
      message: `Mesa ${mesa}: ${msgs[type]}`,
    })
    toast('Mesero notificado', 'success')
  }

  const renderProductGrid = (items: Product[]) => (
    <div className="grid grid-cols-2 gap-2">
      {items.map((p) => (
        <ProductMenuCard
          key={p.id}
          product={p}
          qtyInCart={qtyForProduct(p.id) || undefined}
          disabled={false}
          onClick={() => setSheetProduct(p)}
        />
      ))}
    </div>
  )

  return (
    <div className="min-h-screen bg-command-bg max-w-md mx-auto pb-44">
      <ProductAddSheet
        product={sheetProduct}
        open={!!sheetProduct}
        onClose={() => setSheetProduct(null)}
        onAdd={(qty, notes) => sheetProduct && addFromSheet(sheetProduct, qty, notes)}
      />
      <header className="gradient-amber text-white p-4 sticky top-0 z-10 shadow-glow">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[10px] opacity-80 uppercase tracking-widest">{tenantName}</p>
            <p className="font-black text-lg">Mesa {table.number} · {table.area_name}</p>
          </div>
          <QrCode size={24} />
        </div>
        <p className="text-xs opacity-80 mt-1">Mesero: {table.waiter_name}</p>
      </header>

      <InstallMenuBanner />

      {activeOrders.length > 0 && (
        <div className="mx-4 mt-4 p-4 rounded-xl bg-white border-2 border-brand-200 shadow-glow">
          <p className="text-[10px] font-mono text-slate-500 uppercase">Pedidos de tu mesa</p>
          <p className="font-bold text-slate-800 mt-1">
            {activeOrders.length} ticket{activeOrders.length > 1 ? 's' : ''} activo{activeOrders.length > 1 ? 's' : ''}
          </p>
          <div className="mt-3 space-y-3">
            {activeOrders.slice(0, 4).map((order) => (
              <div key={order.id} className="rounded-lg border border-brand-100 p-2.5 bg-brand-50/40">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-xs font-mono text-brand-700">{order.folio}</p>
                  <p className="text-xs font-bold text-slate-700">{STATUS_LABELS[order.status] || order.status}</p>
                </div>
                <ul className="mt-1.5 text-xs text-slate-600 space-y-0.5">
                  {order.items.slice(0, 3).map((item, i) => (
                    <li key={i}>
                      {item.quantity}x {item.product_name}
                    </li>
                  ))}
                  {order.items.length > 3 && <li className="text-slate-400">+{order.items.length - 3} más</li>}
                </ul>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="p-4 space-y-6">
        {categories.length > 0
          ? categories.map((cat) => {
              const items = products.filter((p) => p.category_id === cat.id)
              if (!items.length) return null
              return (
                <section key={cat.id}>
                  <h2 className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">{cat.name}</h2>
                  {renderProductGrid(items)}
                </section>
              )
            })
          : renderProductGrid(products)}
      </div>

      <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white border-t border-command-border p-4 shadow-panel z-20">
        {cart.length > 0 && (
          <div className="mb-3 space-y-1 max-h-28 overflow-y-auto">
            {cart.map((i) => (
              <div key={i.lineId} className="flex justify-between items-start text-xs gap-2">
                <div className="min-w-0 flex-1">
                  <span>{i.name} ×{i.qty}</span>
                  {i.notes && <p className="text-ops-warning text-[10px] mt-0.5 truncate">↳ {i.notes}</p>}
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => updateQty(i.lineId, -1)}
                    className="w-6 h-6 rounded bg-gray-100 flex items-center justify-center"
                  >
                    <Minus size={10} />
                  </button>
                  <button
                    onClick={() => updateQty(i.lineId, 1)}
                    className="w-6 h-6 rounded bg-brand-100 flex items-center justify-center"
                  >
                    <Plus size={10} />
                  </button>
                  <span className="font-mono w-14 text-right">{formatCurrency(i.price * i.qty)}</span>
                </div>
              </div>
            ))}
          </div>
        )}
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" className="flex-1" onClick={() => callWaiter('ayuda')}>
            <Bell size={14} /> Mesero
          </Button>
          <Button size="sm" className="flex-1" disabled={!cart.length || sending} onClick={sendOrder}>
            {sending ? <Loader2 size={14} className="animate-spin" /> : <ShoppingCart size={14} />}
            {total > 0 ? ` ${activeOrders.length ? 'Enviar adicional' : 'Enviar'} ${formatCurrency(total)}` : ' Pedir'}
          </Button>
          {activeOrders.length > 0 && (
            <Button size="sm" variant="outline" className="flex-1" onClick={() => callWaiter('cuenta')}>
              <CreditCard size={14} /> Pedir cuenta
            </Button>
          )}
        </div>
        <button
          className="w-full mt-2 text-xs text-brand-600 flex items-center justify-center gap-1"
          onClick={() => toast('+20 puntos de lealtad', 'success')}
        >
          <Star size={12} /> Registrarme y ganar puntos
        </button>
      </div>
    </div>
  )
}

export default function ComensalPWA() {
  const [params] = useSearchParams()
  const navigate = useNavigate()
  useComensalManifest()

  const mesaParam = params.get('mesa')
  const tenantHint = params.get('tenant') || undefined
  const mesaNum = mesaParam ? Number(mesaParam) : NaN
  const hasValidMesa = mesaParam && !Number.isNaN(mesaNum) && mesaNum > 0
  const lastMesa = localStorage.getItem(LAST_MESA_KEY)
  const lastTenant = localStorage.getItem(LAST_TENANT_KEY)

  useEffect(() => {
    // If user launches installed app without QR params, restore last visited table.
    if (hasValidMesa || !lastMesa) return
    const next = lastTenant ? `/comensal?mesa=${lastMesa}&tenant=${lastTenant}` : `/comensal?mesa=${lastMesa}`
    navigate(next, { replace: true })
  }, [hasValidMesa, lastMesa, lastTenant, navigate])

  if (!hasValidMesa) return <ComensalWelcome />

  return <ComensalMenuView mesa={mesaNum} tenantHint={tenantHint} />
}
