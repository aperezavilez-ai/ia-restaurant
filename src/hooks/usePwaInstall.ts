import { useCallback, useEffect, useRef, useState } from 'react'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

function detectStandalone() {
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    (navigator as Navigator & { standalone?: boolean }).standalone === true
  )
}

function detectIos() {
  return /iphone|ipad|ipod/i.test(navigator.userAgent)
}

export function usePwaInstall() {
  const deferredRef = useRef<BeforeInstallPromptEvent | null>(null)
  const [canInstall, setCanInstall] = useState(false)
  const [isStandalone, setIsStandalone] = useState(detectStandalone())
  const isIos = detectIos()

  useEffect(() => {
    setIsStandalone(detectStandalone())

    const onChange = () => setIsStandalone(detectStandalone())
    const mq = window.matchMedia('(display-mode: standalone)')
    mq.addEventListener('change', onChange)

    const handler = (e: Event) => {
      e.preventDefault()
      deferredRef.current = e as BeforeInstallPromptEvent
      setCanInstall(true)
    }
    window.addEventListener('beforeinstallprompt', handler)

    return () => {
      mq.removeEventListener('change', onChange)
      window.removeEventListener('beforeinstallprompt', handler)
    }
  }, [])

  const install = useCallback(async () => {
    const prompt = deferredRef.current
    if (!prompt) return false
    await prompt.prompt()
    const { outcome } = await prompt.userChoice
    deferredRef.current = null
    setCanInstall(false)
    return outcome === 'accepted'
  }, [])

  return { canInstall, isStandalone, isIos, install }
}
