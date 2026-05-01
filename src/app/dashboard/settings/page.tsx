import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { logout } from '@/app/login/actions'
import ThemeToggle from '@/components/ThemeToggle'
import LicenseSection from './LicenseSection'
import { getLicense } from '../actions'

export default async function SettingsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const name = user.email?.split('@')[0] || 'User'
  const joinedAt = new Date(user.created_at).toLocaleDateString('ru-RU', {
    day: 'numeric', month: 'long', year: 'numeric'
  })
  const license = await getLicense()
  const isPro = !!license

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Настройки</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">Управление аккаунтом и внешним видом.</p>
      </div>

      {/* Profile */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 space-y-4">
        <h2 className="font-semibold text-slate-800 dark:text-white text-sm uppercase tracking-wide">Профиль</h2>
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center text-[var(--color-primary-container)] text-2xl font-bold">
            {name.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="font-semibold text-slate-900 dark:text-white text-lg">{name}</p>
            <p className="text-slate-500 dark:text-slate-400 text-sm">{user.email}</p>
            <p className="text-slate-400 dark:text-slate-500 text-xs mt-1">Зарегистрирован {joinedAt}</p>
          </div>
        </div>
      </div>

      {/* Appearance */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 space-y-4">
        <h2 className="font-semibold text-slate-800 dark:text-white text-sm uppercase tracking-wide">Внешний вид</h2>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-slate-800 dark:text-slate-200 font-medium">Тема</p>
            <p className="text-slate-500 dark:text-slate-400 text-sm">Светлая, тёмная или системная</p>
          </div>
          <ThemeToggle />
        </div>
      </div>

      {/* Plan */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-slate-800 dark:text-white text-sm uppercase tracking-wide">Тариф</h2>
          <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${isPro ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400' : 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400'}`}>
            {isPro ? 'PRO' : 'БАЗОВЫЙ'}
          </span>
        </div>
        {!isPro && (
          <p className="text-sm text-slate-500 dark:text-slate-400">До 8 привычек · 1 месяц истории</p>
        )}
        <LicenseSection isPro={isPro} plan={license?.plan ?? undefined} />
      </div>

      {/* Danger zone */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-red-200 dark:border-red-900/40 p-6 space-y-4">
        <h2 className="font-semibold text-red-600 dark:text-red-400 text-sm uppercase tracking-wide">Опасная зона</h2>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-slate-800 dark:text-slate-200 font-medium">Выйти из аккаунта</p>
            <p className="text-slate-500 dark:text-slate-400 text-sm">Завершить текущую сессию</p>
          </div>
          <form action={logout}>
            <button type="submit" className="px-4 py-2 border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 text-sm font-medium rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
              Выйти
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
