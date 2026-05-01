'use client'

import { useState } from 'react'
import { activateLicense } from '../actions'

export default function LicenseSection({ isPro, plan }: { isPro: boolean; plan?: string }) {
  const [key, setKey] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const activePlan = success ? 'activated' : plan
  const isActivated = isPro || !!activePlan

  if (isActivated) {
    const isProPlan = activePlan === 'pro' || isPro
    return (
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
            <span className="material-symbols-outlined text-green-500 text-[18px]">verified</span>
          </div>
          <div>
            <p className="font-semibold text-green-600 dark:text-green-400">
              {isProPlan ? 'Pro активирован' : 'Базовый план активирован'}
            </p>
            <p className="text-xs text-slate-400 dark:text-slate-500">
              {isProPlan ? 'Безлимитные привычки · полная история' : 'До 5 привычек · 1 месяц истории'}
            </p>
          </div>
        </div>
        {!isProPlan && (
          <a
            href="https://aronfatima.gumroad.com/l/bzynnz"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full py-2 bg-[var(--color-primary-container)] hover:bg-[var(--color-primary)] text-white text-sm font-medium rounded-lg transition-colors"
          >
            <span className="material-symbols-outlined text-sm">workspace_premium</span>
            Улучшить до Pro
          </a>
        )}
      </div>
    )
  }

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
      setSuccess(true)
    }
  }

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
