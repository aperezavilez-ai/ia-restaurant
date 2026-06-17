import { Link } from 'react-router-dom'
import { Shield, Users } from 'lucide-react'
import { SecurityPolicyPanel } from '@/components/security/SecurityPolicyPanel'
import { AuthorizedDevicesPanel } from '@/components/security/AuthorizedDevicesPanel'
import { LoginAuditPanel } from '@/components/security/LoginAuditPanel'
import { Card, CardBody } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { useAuthStore } from '@/store/authStore'
import { Navigate } from 'react-router-dom'

export default function SecurityPage() {
  const { user } = useAuthStore()
  const canAccess = user?.role === 'admin_restaurant' || user?.role === 'gerente' || user?.role === 'admin_saas'

  if (!canAccess) {
    return <Navigate to="/app/dashboard" replace />
  }

  return (
    <div className="max-w-3xl space-y-6 pb-safe">
      <Card>
        <CardBody className="p-5">
          <div className="flex items-start gap-3">
            <Shield size={22} className="text-brand-600 shrink-0 mt-0.5" />
            <div>
              <h2 className="font-black text-slate-800">Seguridad del restaurante</h2>
              <p className="text-sm text-slate-500 mt-1">
                Equipos autorizados, redes permitidas y alertas de acceso sospechoso.
              </p>
            </div>
          </div>
        </CardBody>
      </Card>

      <SecurityPolicyPanel />
      <AuthorizedDevicesPanel />
      <LoginAuditPanel />

      <Card>
        <CardBody className="p-5 flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <Users size={16} />
            Rotación de contraseñas del personal
          </div>
          <Link to="/app/users">
            <Button variant="outline" size="sm">Gestionar equipo</Button>
          </Link>
        </CardBody>
      </Card>
    </div>
  )
}
