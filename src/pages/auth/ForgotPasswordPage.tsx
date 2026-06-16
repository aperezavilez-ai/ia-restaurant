import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Mail, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Logo } from '@/components/brand/Logo'
import { toast } from '@/components/ui/Toast'
import { authRepository } from '@/repositories/authRepository'

export default function ForgotPasswordPage() {
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [email, setEmail] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      await authRepository.requestPasswordReset(email)
      toast('Enlace de recuperación enviado a tu correo', 'success')
      setSent(true)
    } catch (err) {
      toast(err instanceof Error ? err.message : 'No se pudo enviar el enlace', 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-command-bg ops-grid-bg flex items-center justify-center p-6">
      <div className="w-full max-w-sm animate-fadeUp">
        <div className="text-center mb-8"><Logo size="md" /></div>
        <div className="glass-panel rounded-2xl p-8 bg-white shadow-panel">
          <h2 className="text-xl font-black text-slate-800 mb-1">Recuperar contraseña</h2>
          <p className="text-sm text-slate-500 mb-6">
            {sent
              ? 'Revisa tu correo para restablecer la contraseña.'
              : 'Te enviaremos un enlace para restablecer tu contraseña'}
          </p>
          {!sent && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input label="Correo" type="email" placeholder="tu@restaurante.com" icon={<Mail size={16} />} value={email} onChange={e => setEmail(e.target.value)} required />
              <Button type="submit" loading={loading} className="w-full">Enviar enlace</Button>
            </form>
          )}
          <Link to="/login" className="flex items-center gap-2 text-sm text-brand-600 font-semibold mt-6 hover:underline">
            <ArrowLeft size={14} /> Volver al login
          </Link>
        </div>
      </div>
    </div>
  )
}
