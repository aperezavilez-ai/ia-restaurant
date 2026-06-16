import { useCallback, useEffect, useState } from 'react'
import { useAuthStore } from '@/store/authStore'
import { useTenantContext } from '@/hooks/useTenantContext'
import { requiresCashShift } from '@/config/cashShift'
import { cashRepository } from '@/repositories/cashRepository'
import type { CashRegister } from '@/types'

export function useCashShiftGate() {
  const ctx = useTenantContext()
  const { user } = useAuthStore()
  const [register, setRegister] = useState<CashRegister | null>(null)
  const [checking, setChecking] = useState(true)

  const mustOpenShift = requiresCashShift(user?.role)

  const refresh = useCallback(async () => {
    if (!ctx || !mustOpenShift) {
      setRegister(null)
      setChecking(false)
      return null
    }
    setChecking(true)
    try {
      const reg = await cashRepository.getOpenRegister(ctx)
      setRegister(reg)
      return reg
    } finally {
      setChecking(false)
    }
  }, [ctx, mustOpenShift])

  useEffect(() => {
    refresh()
  }, [refresh])

  useEffect(() => {
    const onFocus = () => { refresh() }
    window.addEventListener('focus', onFocus)
    return () => window.removeEventListener('focus', onFocus)
  }, [refresh])

  const shiftOpen = !!register
  const blocked = mustOpenShift && !checking && !shiftOpen

  return {
    mustOpenShift,
    shiftOpen,
    blocked,
    checking,
    register,
    refresh,
  }
}
