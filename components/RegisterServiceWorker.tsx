'use client'

import { useEffect } from "react"

export default function RegisterServiceWorker() {
  useEffect(() => {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      const wb = (window as any).workbox;
      if (wb) {
        wb.register();
      } else {
        navigator.serviceWorker.register('/sw.js');
      }
    }
  }, [])

  return null
}