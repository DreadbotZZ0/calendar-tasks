'use client'

import { usePathname } from 'next/navigation'
import Paywall from './Paywall'

export default function PaywallWrapper({ hasSubscription }: { hasSubscription: boolean }) {
  const pathname = usePathname()
  if (hasSubscription || pathname === '/dashboard/settings') return null
  return <Paywall />
}
