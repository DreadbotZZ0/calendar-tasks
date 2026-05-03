'use client'

import { useState } from 'react'
import Link from 'next/link'

const PLANS = {
  basic: {
    name: 'Базовая',
    price: '$1',
    url: 'https://aronfatima.gumroad.com/l/oxcbh',
    features: ['До 5 привычек', '1 месяц истории', 'Статистика', '🌱 Питомец-растение'],
    popular: false,
  },
  pro: {
    name: 'Pro',
    price: '$2',
    url: 'https://aronfatima.gumroad.com/l/bzynnz',
    features: ['Безлимит привычек', 'Полная история', 'Аналитика по дням недели', 'Уведомления в Telegram', '🌱 Питомец + предупреждения'],
    popular: true,
  },
}

export default function Paywall({ onClose }: { onClose?: () => void }) {
  const [selected, setSelected] = useState<'basic' | 'pro'>('pro')

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 backdrop-blur-sm p-4"
      onClick={onClose ? (e) => { if (e.target === e.currentTarget) onClose() } : undefined}
    >
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 max-w-md w-full p-8 text-center space-y-6 relative">

        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        )}

        <div className="w-16 h-16 rounded-full bg-indigo-100 dark:bg-indigo-900/40 flex items-center justify-center mx-auto">
          <span className="material-symbols-outlined text-3xl text-[var(--color-primary-container)]">lock</span>
        </div>

        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Требуется подписка</h2>
          <p className="text-slate-500 dark:text-slate-400 mt-2">
            Выбери план и начни отслеживать привычки прямо сейчас
          </p>
        </div>

        {/* Selectable plan cards */}
        <div className="grid grid-cols-2 gap-3 text-left">
          {(Object.entries(PLANS) as [keyof typeof PLANS, typeof PLANS.basic][]).map(([key, plan]) => (
            <button
              key={key}
              type="button"
              onClick={() => setSelected(key)}
              className={[
                'rounded-xl p-4 border-2 text-left transition-all relative focus:outline-none cursor-pointer',
                selected === key
                  ? 'border-[var(--color-primary-container)] bg-indigo-50 dark:bg-indigo-900/30'
                  : 'border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700/50 hover:border-slate-300 dark:hover:border-slate-500',
              ].join(' ')}
            >
              {plan.popular && (
                <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-[var(--color-primary-container)] text-white text-[10px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap pointer-events-none">
                  Популярный
                </span>
              )}
              {selected === key && (
                <span className="absolute top-2 right-2 w-4 h-4 rounded-full bg-[var(--color-primary-container)] flex items-center justify-center pointer-events-none">
                  <span className="material-symbols-outlined text-white text-[12px]">check</span>
                </span>
              )}
              <p className="font-bold text-slate-800 dark:text-white text-sm">{plan.name}</p>
              <p className="text-xl font-bold text-[var(--color-primary-container)] mt-1">
                {plan.price}<span className="text-xs font-normal text-slate-400">/мес</span>
              </p>
              <ul className="mt-2 space-y-1">
                {plan.features.map(f => (
                  <li key={f} className="text-xs text-slate-600 dark:text-slate-300 flex items-center gap-1">
                    <span className="material-symbols-outlined text-green-500 text-[14px] pointer-events-none">check</span>
                    {f}
                  </li>
                ))}
              </ul>
            </button>
          ))}
        </div>

        <a
          href={PLANS[selected].url}
          target="_blank"
          rel="noopener noreferrer"
          className="block w-full py-3 bg-[var(--color-primary-container)] hover:bg-[var(--color-primary)] text-white font-semibold rounded-xl transition-colors"
        >
          Приобрести подписку
        </a>

        <Link
          href="/dashboard/settings"
          onClick={onClose}
          className="block w-full py-2.5 border border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-300 text-sm font-medium rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors text-center"
        >
          Уже купил? Ввести ключ
        </Link>
      </div>
    </div>
  )
}
