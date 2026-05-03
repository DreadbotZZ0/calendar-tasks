import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { logout } from '@/app/login/actions'
import ThemeToggle from '@/components/ThemeToggle'
import { SidebarNav, BottomNav } from './Navigation'
import PaywallWrapper from './PaywallWrapper'
import SidebarUpgradeButton from './SidebarUpgradeButton'


export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const name = (user.user_metadata?.display_name as string | undefined) || user.email?.split('@')[0] || 'User'
  const displayEmoji = user.user_metadata?.display_emoji as string | undefined | null
  const avatarUrl = user.user_metadata?.avatar_url as string | undefined | null

  const { data: license } = await supabase
    .from('licenses')
    .select('plan')
    .eq('user_id', user.id)
    .single()

  const hasSubscription = !!license
  const isPro = license?.plan === 'pro'
  const planLabel = isPro ? 'Pro' : hasSubscription ? 'Базовый' : 'Нет подписки'

  return (
    <div className="flex h-screen overflow-hidden bg-[var(--color-background)] dark:bg-slate-900">
      {/* Sidebar */}
      <aside className="w-64 bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 flex flex-col hidden md:flex">
        <div className="h-16 flex items-center px-6 border-b border-slate-100 dark:border-slate-700">
          <Link href="/" className="flex items-center gap-2 text-slate-900 dark:text-white font-bold text-lg">
            <span className="material-symbols-outlined text-[var(--color-primary-container)]">check_circle</span>
            Календарь задач
          </Link>
        </div>

        <SidebarNav />

        <div className="p-4 border-t border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center text-[var(--color-primary-container)] font-bold overflow-hidden shrink-0">
              {avatarUrl ? (
                <img src={avatarUrl} alt="Аватар" className="w-full h-full object-cover" />
              ) : displayEmoji ? (
                <span className="text-xl">{displayEmoji}</span>
              ) : (
                name.charAt(0).toUpperCase()
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-900 dark:text-white truncate">{name}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{planLabel}</p>
            </div>
            <ThemeToggle />
          </div>
          <form action={logout}>
            <button type="submit" className="w-full flex items-center justify-center gap-2 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-700 hover:bg-slate-100 dark:hover:bg-slate-600 rounded-lg transition-colors border border-slate-200 dark:border-slate-600">
              <span className="material-symbols-outlined text-sm">logout</span>
              Выйти
            </button>
          </form>
          <SidebarUpgradeButton hasSubscription={hasSubscription} isPro={isPro} />
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        {/* Mobile header */}
        <header className="h-16 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between px-4 md:hidden">
          <Link href="/" className="flex items-center gap-2 text-slate-900 dark:text-white font-bold text-lg">
            <span className="material-symbols-outlined text-[var(--color-primary-container)]">check_circle</span>
            Календарь задач
          </Link>
          <div className="flex items-center gap-2">
            <SidebarUpgradeButton hasSubscription={hasSubscription} isPro={isPro} compact />
            <Link href="/dashboard/settings" className="w-9 h-9 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center text-[var(--color-primary-container)] font-bold overflow-hidden shrink-0">
              {avatarUrl ? (
                <img src={avatarUrl} alt="Аватар" className="w-full h-full object-cover" />
              ) : displayEmoji ? (
                <span className="text-lg">{displayEmoji}</span>
              ) : (
                <span className="text-sm">{name.charAt(0).toUpperCase()}</span>
              )}
            </Link>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto overflow-x-hidden p-4 md:p-8 pb-24 md:pb-8">
          {children}
        </div>

        <BottomNav />
      </main>

      {/* Paywall overlay for users without subscription */}
      <PaywallWrapper hasSubscription={hasSubscription} />
    </div>
  )
}
