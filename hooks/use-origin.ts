import { useEffect, useState } from 'react'

export const useOrigin = () => {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const origin = process.env.NEXT_PUBLIC_SITE_URL || 
    (typeof window !== 'undefined' && window.location.origin
      ? window.location.origin
      : '')

  if (!mounted) {
    return ''
  }

  return origin
}
