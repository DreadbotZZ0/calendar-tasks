'use client'

import { useState } from 'react'
import Paywall from './Paywall'

export default function SidebarUpgradeButton({
  hasSubscription,
  isPro,
}: {
  hasSubscription: boolean
  isPro: boolean
}) {
  const [open, setOpen] = useState(false)

  if (isPro) return null

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="w-full mt-2 py-2 text-sm font-medium text-white bg-[var(--color-primary-container)] hover:bg-[var(--color-primary)] rounded-lg transition-colors shadow-sm flex items-center justify-center gap-1 cursor-pointer"
      >
        <span className="material-symbols-outlined text-sm">workspace_premium</span>
        {hasSubscription ? 'Перейти на Pro' : 'Приобрести подписку'}
      </button>
      {open && <Paywall onClose={() => setOpen(false)} />}
    </>
  )
}
