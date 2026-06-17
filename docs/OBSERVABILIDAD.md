# Observabilidad — IA·RESTAURANT (Go-live Día 5)

## Checks automatizados

```bash
npm run qa:health    # Producción + API health + RLS tablas críticas
npm run qa:smoke     # Lógica turno de caja
npm run build        # Compilación sin errores
```

## Monitoreo en producción

| Recurso | URL / acción |
|---------|----------------|
| App | https://www.iarestaurant.mx |
| Health API | https://www.iarestaurant.mx/api/health |
| Vercel logs | Dashboard → proyecto → Logs / Functions |
| Supabase | https://supabase.com/dashboard/project/pssycnwgolxiwoyzdsdg |
| Auth / usuarios | Supabase → Authentication |
| RLS / SQL | Supabase → SQL Editor o `npm run supabase:sql` |

### Health API

`GET /api/health` devuelve:

```json
{
  "status": "ok",
  "service": "ia-restaurant",
  "version": "1.0.0",
  "timestamp": "...",
  "supabase": "configured"
}
```

Útil para uptime checks externos (UptimeRobot, Better Stack, etc.).

## Tablas críticas con RLS

Verificadas por `qa:health`:

- `tenants`, `organizations`, `users`
- `orders`, `order_items`, `payments`, `cash_registers`
- `products`, `tables`
- `tenant_devices`, `login_audit`

**Criterio:** RLS activo (`relrowsecurity = true`) y anon sin JWT no puede insertar en `orders`.

## Indicadores en la app

- **En línea / Sin red** — header del panel de comando
- **Sync pendiente** — badge naranja con cantidad de operaciones en cola local
- Al recuperar internet, la cola se procesa automáticamente (cada 30 s + evento `online`)

## Respaldo de datos

| Qué | Cómo |
|-----|------|
| Base de datos | Supabase → Settings → Database → Backups (plan Pro: PITR) |
| Export manual | SQL Editor → `pg_dump` vía CLI o export CSV por tabla |
| Credenciales | `.env` local + Vercel Environment Variables (nunca en git) |

**Frecuencia recomendada:** backups automáticos diarios de Supabase; export semanal de catálogo y usuarios antes de cambios grandes.

## Errores en consola (F12)

Al reportar un incidente, capturar:

1. Hora exacta (zona `America/Mexico_City`)
2. Usuario y rol
3. Pantalla / acción (ej. "Cobrar en POS mesa 5")
4. Mensaje de error en consola (rojo)
5. Estado de red (En línea / Sin red / sync pendiente)

## Protocolos operativos

Ver también:

- `docs/CONTINGENCIA.md` — sin internet, turno, impresión, QR
- `docs/GO-LIVE-CHECKLIST.md` — criterios de salida

### Sin internet

1. Seguir operando — datos en IndexedDB local
2. Cobros y pedidos entran a **cola de sync**
3. Badge **sync pendiente** en header cuando hay operaciones por subir
4. Al volver la red: sync automática en ~30 s

### Impresión fallida

1. Permitir pop-ups en `iarestaurant.mx`
2. Corte X → **Reimprimir**
3. Corte Z → impresión al confirmar; si falla, reabrir historial de ventas y reimprimir ticket

## Escalamiento

| Severidad | Tiempo respuesta | Acción |
|-----------|------------------|--------|
| Crítico | Inmediato | Detener cobros si no cuadra, usar contingencia manual |
| Alto | < 1 h | Operar local, revisar `qa:health` y logs Vercel |
| Medio | Próximo turno | Documentar, planear fix |
