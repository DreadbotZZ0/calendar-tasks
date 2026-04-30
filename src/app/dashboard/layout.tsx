import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { logout } from '@/app/login/actions'
import ThemeToggle from '@/components/ThemeToggle'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // extract name from email for avatar placeholder
  const name = user.email?.split('@')[0] || 'User'

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
        
        <nav className="flex-1 py-6 px-3 space-y-1">
          <Link href="/dashboard" className="flex items-center gap-3 px-3 py-2 bg-indigo-50 dark:bg-indigo-900/20 text-[var(--color-primary-container)] rounded-lg font-medium border-l-4 border-[var(--color-primary-container)]">
            <span className="material-symbols-outlined">dashboard</span>
            Дашборд
          </Link>
          <Link href="/dashboard/habits" className="flex items-center gap-3 px-3 py-2 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white rounded-lg font-medium border-l-4 border-transparent">
            <span className="material-symbols-outlined">list_alt</span>
            Привычки
          </Link>
          <Link href="/dashboard/stats" className="flex items-center gap-3 px-3 py-2 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white rounded-lg font-medium border-l-4 border-transparent">
            <span className="material-symbols-outlined">bar_chart</span>
            Статистика
          </Link>
          <Link href="/dashboard/settings" className="flex items-center gap-3 px-3 py-2 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white rounded-lg font-medium border-l-4 border-transparent">
            <span className="material-symbols-outlined">settings</span>
            Настройки
          </Link>
        </nav>

        <div className="p-4 border-t border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center text-[var(--color-primary-container)] font-bold">
              {name.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-900 dark:text-white truncate">{name}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 truncate">Free план</p>
            </div>
            <ThemeToggle />
          </div>
          <form action={logout}>
            <button type="submit" className="w-full flex items-center justify-center gap-2 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-700 hover:bg-slate-100 dark:hover:bg-slate-600 rounded-lg transition-colors border border-slate-200 dark:border-slate-600">
              <span className="material-symbols-outlined text-sm">logout</span>
              Выйти
            </button>
          </form>
          <button className="w-full mt-2 py-2 text-sm font-medium text-white bg-[var(--color-primary-container)] hover:bg-[var(--color-primary)] rounded-lg transition-colors shadow-sm">
            Upgrade to Pro
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        {/* Mobile header */}
        <header className="h-16 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between px-4 md:hidden">
          <Link href="/" className="flex items-center gap-2 text-slate-900 dark:text-white font-bold text-lg">
            <span className="material-symbols-outlined text-[var(--color-primary-container)]">check_circle</span>
          </Link>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <form action={logout}>
              <button type="submit" className="p-2 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white">
                <span className="material-symbols-outlined">logout</span>
              </button>
            </form>
          </div>
        </header>

        <div className="flex-1 overflow-auto p-4 md:p-8 pb-24 md:pb-8">
          {children}
        </div>

        {/* Mobile Bottom Navigation */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 pb-safe z-50">
          <div className="flex justify-around items-center h-16">
            <Link href="/dashboard" className="flex flex-col items-center justify-center w-full h-full text-[var(--color-primary-container)]">
              <span className="material-symbols-outlined text-2xl">dashboard</span>
              <span className="text-[10px] font-medium mt-1">Дашборд</span>
            </Link>
            <Link href="/dashboard/habits" className="flex flex-col items-center justify-center w-full h-full text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors">
              <span className="material-symbols-outlined text-2xl">list_alt</span>
              <span className="text-[10px] font-medium mt-1">Привычки</span>
            </Link>
            <Link href="/dashboard/stats" className="flex flex-col items-center justify-center w-full h-full text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors">
              <span className="material-symbols-outlined text-2xl">bar_chart</span>
              <span className="text-[10px] font-medium mt-1">Статистика</span>
            </Link>
            <Link href="/dashboard/settings" className="flex flex-col items-center justify-center w-full h-full text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors">
              <span className="material-symbols-outlined text-2xl">settings</span>
              <span className="text-[10px] font-medium mt-1">Настройки</span>
            </Link>
          </div>
        </nav>
      </main>
    </div>
  )
}
