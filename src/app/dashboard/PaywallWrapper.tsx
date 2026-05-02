'use client'

import { useState } from 'react'
import { usePathname } from 'next/navigation'
import Paywall from './Paywall'

export default function PaywallWrapper({ hasSubscription }: { hasSubscription: boolean }) {
  const [dismissed, setDismissed] = useState(false)
  const pathname = usePathname()
  if (hasSubscription || pathname === '/dashboard/settings') return null
  if (dismissed) return null
  return <Paywall onClose={() => setDismissed(true)} />
}
