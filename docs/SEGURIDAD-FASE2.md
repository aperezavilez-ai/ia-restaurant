# Seguridad — Fase 2

## Migración

```bash
npm run supabase:sql -- supabase/migrations/022_security_phase2.sql
```

## Nuevas capacidades

### 1. Lista blanca de IP (opcional)
- **Seguridad → Política de acceso**
- Activa "Restringir por IP" y agrega IPs del WiFi del local
- Formatos: `192.168.1.100`, `192.168.1.0/24`, `10.0.0.*`

### 2. Alertas WhatsApp
- Equipo nuevo pendiente de aprobación
- Acceso desde IP nueva
- Intento bloqueado por IP no autorizada

Requiere WhatsApp configurado en Ajustes.

### 3. Historial de accesos
- **Seguridad → Historial** — IP, usuario, éxito/bloqueo

### 4. Gestión centralizada
- Ruta: `/app/security`
- Enlace desde Ajustes → Seguridad y equipos

## API

- `GET /api/security/client-ip` — IP del cliente (Vercel headers)
