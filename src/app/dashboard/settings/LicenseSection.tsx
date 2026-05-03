'use client'

import { useState } from 'react'
import { activateLicense } from '../actions'

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })
}

function daysLeft(iso: string) {
  return Math.ceil((new Date(iso).getTime() - Date.now()) / 86400000)
}

function ExpiryBadge({ expiresAt }: { expiresAt?: string | null }) {
  if (!expiresAt) return null
  const days = daysLeft(expiresAt)
  if (days <= 0) return (
    <p className="text-xs text-red-500 flex items-center gap-1">
      <span className="material-symbols-outlined text-[14px]">warning</span>
      Подписка истекла {formatDate(expiresAt)}
    </p>
  )
  if (days <= 7) return (
    <p className="text-xs text-amber-500 flex items-center gap-1">
      <span className="material-symbols-outlined text-[14px]">schedule</span>
      Истекает через {days} {days === 1 ? 'день' : days < 5 ? 'дня' : 'дней'} — {formatDate(expiresAt)}
    </p>
  )
  return (
    <p className="text-xs text-slate-400 dark:text-slate-500">до {formatDate(expiresAt)}</p>
  )
}

export default function LicenseSection({
  isPro,
  plan,
  expiresAt,
  isExpired,
}: {
  isPro: boolean
  plan?: string
  expiresAt?: string | null
  isExpired?: boolean
}) {
  const [key, setKey] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [activatedPlan, setActivatedPlan] = useState<string | null>(null)

  const effectivePlan = activatedPlan ?? plan
  const effectiveIsPro = isPro || activatedPlan === 'pro'
  const effectiveIsBasic = !effectiveIsPro && (effectivePlan === 'basic' || (effectivePlan === 'pro' && isExpired))

  const handleActivate = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!key.trim()) return
    setLoading(true)
    setError('')
    const result = await activateLicense(key)
    setLoading(false)
    if (result.error) {
      setError(result.error)
    } else {
      setActivatedPlan(result.plan ?? 'basic')
    }
  }

  const activationForm = (
    <form onSubmit={handleActivate} className="flex gap-2">
      <input
        value={key}
        onChange={e => setKey(e.target.value)}
        placeholder="XXXXXXXX-XXXXXXXX-XXXXXXXX-XXXXXXXX"
        className="flex-1 px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-container)]"
      />
      <button
        disabled={loading || !key.trim()}
        type="submit"
        className="px-4 py-2 bg-[var(--color-primary-container)] text-white text-sm font-medium rounded-lg hover:bg-[var(--color-primary)] transition-colors disabled:opacity-50"
      >
        {loading ? 'Проверка...' : 'Активировать'}
      </button>
    </form>
  )

  if (effectiveIsPro) {
    return (
      <div className="space-y-1.5">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-green-500 text-[18px]">verified</span>
          </div>
          <div>
            <p className="font-semibold text-green-600 dark:text-green-400">Pro активирован</p>
            <p className="text-xs text-slate-400 dark:text-slate-500">Безлимитные привычки и задачи · полная история · уведомления в Telegram</p>
          </div>
        </div>
        {!activatedPlan && <ExpiryBadge expiresAt={expiresAt} />}
      </div>
    )
  }

  // Expired Pro — show re-activation form
  if (isExpired && !activatedPlan) {
    return (
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-red-500 text-[18px]">cancel</span>
          </div>
          <div>
            <p className="font-semibold text-red-500">Подписка истекла</p>
            <ExpiryBadge expiresAt={expiresAt} />
          </div>
        </div>
        <div className="border-t border-slate-200 dark:border-slate-700 pt-3 space-y-2">
          <p className="text-sm text-slate-600 dark:text-slate-400">Введи новый ключ чтобы продолжить.</p>
          {activationForm}
          {error && <p className="text-sm text-red-500 flex items-center gap-1"><span className="material-symbols-outlined text-[16px]">error</span>{error}</p>}
        </div>
      </div>
    )
  }

  if (effectiveIsBasic) {
    return (
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-green-500 text-[18px]">verified</span>
          </div>
          <div>
            <p className="font-semibold text-green-600 dark:text-green-400">Базовый план активирован</p>
            <p className="text-xs text-slate-400 dark:text-slate-500">До 5 привычек · 1 месяц истории</p>
          </div>
        </div>
        {!activatedPlan && <ExpiryBadge expiresAt={expiresAt} />}
        <div className="border-t border-slate-200 dark:border-slate-700 pt-3 space-y-2">
          <p className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-1">
            <span className="material-symbols-outlined text-sm text-[var(--color-primary-container)]">workspace_premium</span>
            Улучшить до Pro
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400">После покупки Pro на Gumroad введите полученный ключ ниже.</p>
          {activationForm}
          {error && <p className="text-sm text-red-500 flex items-center gap-1"><span className="material-symbols-outlined text-[16px]">error</span>{error}</p>}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <p className="text-sm text-slate-600 dark:text-slate-400">После покупки подписки введите полученный ключ ниже.</p>
      {activationForm}
      {error && <p className="text-sm text-red-500 flex items-center gap-1"><span className="material-symbols-outlined text-[16px]">error</span>{error}</p>}
    </div>
  )
}
