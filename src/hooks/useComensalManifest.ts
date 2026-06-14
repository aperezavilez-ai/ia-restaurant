import { useEffect } from 'react'

const DEFAULT_MANIFEST = '/manifest.webmanifest'
const COMENSAL_MANIFEST = '/comensal-manifest.webmanifest'

export function useComensalManifest() {
  useEffect(() => {
    const link = document.querySelector<HTMLLinkElement>('link[rel="manifest"]')
    const previous = link?.getAttribute('href') || DEFAULT_MANIFEST

    if (link) link.setAttribute('href', COMENSAL_MANIFEST)

    const appleTitle = document.querySelector<HTMLMetaElement>('meta[name="apple-mobile-web-app-title"]')
    const prevTitle = appleTitle?.getAttribute('content')
    if (appleTitle) appleTitle.setAttribute('content', 'Menú')

    return () => {
      if (link) link.setAttribute('href', previous)
      if (appleTitle && prevTitle) appleTitle.setAttribute('content', prevTitle)
    }
  }, [])
}
