import Link from 'next/link'

const GUMROAD_URL = 'https://aronfatima.gumroad.com/l/bzynnz'

export default function Paywall() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 max-w-md w-full p-8 text-center space-y-6">
        {/* Icon */}
        <div className="w-16 h-16 rounded-full bg-indigo-100 dark:bg-indigo-900/40 flex items-center justify-center mx-auto">
          <span className="material-symbols-outlined text-3xl text-[var(--color-primary-container)]">lock</span>
        </div>

        {/* Title */}
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Требуется подписка</h2>
          <p className="text-slate-500 dark:text-slate-400 mt-2">
            Выбери план и начни отслеживать привычки прямо сейчас
          </p>
        </div>

        {/* Plans preview */}
        <div className="grid grid-cols-2 gap-3 text-left">
          <div className="bg-slate-50 dark:bg-slate-700/50 rounded-xl p-4 border border-slate-200 dark:border-slate-600">
            <p className="font-bold text-slate-800 dark:text-white text-sm">Базовая</p>
            <p className="text-xl font-bold text-[var(--color-primary-container)] mt-1">$1<span className="text-xs font-normal text-slate-400">/мес</span></p>
            <ul className="mt-2 space-y-1">
              <li className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                <span className="material-symbols-outlined text-green-500 text-[14px]">check</span>
                До 5 привычек
              </li>
              <li className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                <span className="material-symbols-outlined text-green-500 text-[14px]">check</span>
                Статистика
              </li>
            </ul>
          </div>
          <div className="bg-indigo-50 dark:bg-indigo-900/30 rounded-xl p-4 border-2 border-[var(--color-primary-container)] relative">
            <span className="absolute -top-2 left-1/2 -translate-x-1/2 bg-[var(--color-primary-container)] text-white text-[10px] font-bold px-2 py-0.5 rounded-full">Популярный</span>
            <p className="font-bold text-slate-800 dark:text-white text-sm">Pro</p>
            <p className="text-xl font-bold text-[var(--color-primary-container)] mt-1">$2<span className="text-xs font-normal text-slate-400">/мес</span></p>
            <ul className="mt-2 space-y-1">
              <li className="text-xs text-slate-600 dark:text-slate-300 flex items-center gap-1">
                <span className="material-symbols-outlined text-green-500 text-[14px]">check</span>
                Безлимит привычек
              </li>
              <li className="text-xs text-slate-600 dark:text-slate-300 flex items-center gap-1">
                <span className="material-symbols-outlined text-green-500 text-[14px]">check</span>
                Полная история
              </li>
            </ul>
          </div>
        </div>

        {/* CTA */}
        <a
          href={GUMROAD_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="block w-full py-3 bg-[var(--color-primary-container)] hover:bg-[var(--color-primary)] text-white font-semibold rounded-xl transition-colors"
        >
          Приобрести подписку
        </a>

        {/* Already purchased */}
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Уже купил?{' '}
          <Link href="/dashboard/settings" className="text-[var(--color-primary-container)] underline hover:opacity-80">
            Активировать ключ →
          </Link>
        </p>
      </div>
    </div>
  )
}
