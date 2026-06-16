/** Normaliza teléfono MX a dígitos E.164 sin + (ej. 5215512345678) */
export function normalizeWhatsAppPhone(phone: string): string {
  const digits = phone.replace(/\D/g, '')
  if (digits.length === 10) return `52${digits}`
  if (digits.length === 12 && digits.startsWith('52')) return digits
  if (digits.length === 11 && digits.startsWith('1')) return digits
  return digits
}

export function buildWhatsAppLink(phone: string, message: string): string {
  const to = normalizeWhatsAppPhone(phone)
  if (!to) return ''
  return `https://wa.me/${to}?text=${encodeURIComponent(message)}`
}

export function isValidWhatsAppPhone(phone: string): boolean {
  const n = normalizeWhatsAppPhone(phone)
  return n.length >= 10 && n.length <= 15
}
