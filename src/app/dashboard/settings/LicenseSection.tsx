'use client'

import { useState } from 'react'
import { activateLicense } from '../actions'

export default function LicenseSection({ isPro, plan }: { isPro: boolean; plan?: string }) {
  const [key, setKey] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [activatedPlan, setActivatedPlan] = useState<string | null>(null)

  const effectivePlan = activatedPlan ?? plan
  const effectiveIsPro = isPro || activatedPlan === 'pro'
  const isBasic = !effectiveIsPro && effectivePlan === 'basic'

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

  // Pro activated (either from props or just upgraded)
  if (effectiveIsPro) {
    return (
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
          <span className="material-symbols-outlined text-green-500 text-[18px]">verified</span>
        </div>
        <div>
          <p className="font-semibold text-green-600 dark:text-green-400">Pro активирован</p>
          <p className="text-xs text-slate-400 dark:text-slate-500">Безлимитные привычки · полная история</p>
        </div>
      </div>
    )
  }

  // Basic plan — show status + upgrade form
  if (isBasic) {
    return (
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
            <span className="material-symbols-outlined text-green-500 text-[18px]">verified</span>
          </div>
          <div>
            <p className="font-semibold text-green-600 dark:text-green-400">Базовый план активирован</p>
            <p className="text-xs text-slate-400 dark:text-slate-500">До 5 привычек · 1 месяц истории</p>
          </div>
        </div>
        <div className="border-t border-slate-200 dark:border-slate-700 pt-3 space-y-2">
          <p className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-1">
            <span className="material-symbols-outlined text-sm text-[var(--color-primary-container)]">workspace_premium</span>
            Улучшить до Pro
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            После покупки Pro на Gumroad введите полученный ключ ниже.
          </p>
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
          {error && (
            <p className="text-sm text-red-500 flex items-center gap-1">
              <span className="material-symbols-outlined text-[16px]">error</span>
              {error}
            </p>
          )}
        </div>
      </div>
    )
  }

  // No subscription — show activation form
  return (
    <div className="space-y-3">
      <p className="text-sm text-slate-600 dark:text-slate-400">
        После покупки подписки введите полученный ключ ниже.
      </p>
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
      {error && (
        <p className="text-sm text-red-500 flex items-center gap-1">
          <span className="material-symbols-outlined text-[16px]">error</span>
          {error}
        </p>
      )}
    </div>
  )
}
