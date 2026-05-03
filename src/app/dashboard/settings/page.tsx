export const dynamic = 'force-dynamic'

import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { logout } from '@/app/login/actions'
import ThemeToggle from '@/components/ThemeToggle'
import LicenseSection from './LicenseSection'
import DisplayNameForm from './DisplayNameForm'
import AvatarUpload from './AvatarUpload'
import TelegramSection from './TelegramSection'
import { getLicense, getTelegramConnection } from '../actions'

export default async function SettingsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const displayEmoji = user.user_metadata?.display_emoji as string | undefined | null
  const name = (user.user_metadata?.display_name as string | undefined) || user.email?.split('@')[0] || 'User'
  const avatarUrl = user.user_metadata?.avatar_url as string | undefined | null
  const joinedAt = new Date(user.created_at).toLocaleDateString('ru-RU', {
    day: 'numeric', month: 'long', year: 'numeric'
  })
  const license = await getLicense()
  const isExpired = license?.expires_at ? new Date(license.expires_at) < new Date() : false
  const isPro = license?.plan === 'pro' && !isExpired
  const hasActivePlan = !!license && !isExpired
  const telegramConn = await getTelegramConnection()

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Настройки</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">Управление аккаунтом и внешним видом.</p>
      </div>

      {/* Profile */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 space-y-4">
        <h2 className="font-semibold text-slate-800 dark:text-white text-sm uppercase tracking-wide">Профиль</h2>
        <AvatarUpload currentUrl={avatarUrl} name={name} emoji={displayEmoji} />
        <div>
          <p className="font-semibold text-slate-900 dark:text-white text-lg">
            {displayEmoji && <span className="mr-2">{displayEmoji}</span>}
            {name}
          </p>
          <p className="text-slate-500 dark:text-slate-400 text-sm">{user.email}</p>
          <p className="text-slate-400 dark:text-slate-500 text-xs mt-1">Зарегистрирован {joinedAt}</p>
        </div>
        <DisplayNameForm currentName={name} currentEmoji={displayEmoji} />
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
          <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${isPro ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400' : hasActivePlan ? 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400' : 'bg-red-100 dark:bg-red-900/30 text-red-500 dark:text-red-400'}`}>
            {isPro ? 'PRO' : hasActivePlan ? 'БАЗОВЫЙ' : 'НЕТ ПЛАНА'}
          </span>
        </div>
        {!isPro && hasActivePlan && (
          <p className="text-sm text-slate-500 dark:text-slate-400">До 5 привычек · 1 месяц истории</p>
        )}
        <LicenseSection
          isPro={isPro}
          plan={license?.plan ?? undefined}
          expiresAt={license?.expires_at ?? null}
          isExpired={isExpired}
        />
      </div>

      {/* Telegram notifications — Pro only */}
      {isPro && (
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 space-y-4">
          <div className="flex items-center gap-2">
            <h2 className="font-semibold text-slate-800 dark:text-white text-sm uppercase tracking-wide">Уведомления</h2>
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400">PRO</span>
          </div>
          <TelegramSection
            userId={user.id}
            connected={!!telegramConn}
          />
        </div>
      )}

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
