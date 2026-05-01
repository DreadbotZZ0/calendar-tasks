'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

export function SidebarNav() {
  const pathname = usePathname()

  const links = [
    { href: '/dashboard', icon: 'dashboard', label: 'Дашборд' },
    { href: '/dashboard/habits', icon: 'list_alt', label: 'Привычки' },
    { href: '/dashboard/stats', icon: 'bar_chart', label: 'Статистика' },
    { href: '/dashboard/settings', icon: 'settings', label: 'Настройки' },
  ]

  return (
    <nav className="flex-1 py-6 px-3 space-y-1">
      {links.map((link) => {
        const isActive = pathname === link.href
        return (
          <Link
            key={link.href}
            href={link.href}
            className={`flex items-center gap-3 px-3 py-2 rounded-lg font-medium transition-colors border-l-4 ${
              isActive
                ? 'bg-indigo-50 dark:bg-indigo-900/20 text-[var(--color-primary-container)] border-[var(--color-primary-container)]'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white border-transparent'
            }`}
          >
            <span className="material-symbols-outlined">{link.icon}</span>
            {link.label}
          </Link>
        )
      })}
    </nav>
  )
}

export function BottomNav() {
  const pathname = usePathname()

  const links = [
    { href: '/dashboard', icon: 'dashboard', label: 'Дашборд' },
    { href: '/dashboard/habits', icon: 'list_alt', label: 'Привычки' },
    { href: '/dashboard/stats', icon: 'bar_chart', label: 'Статистика' },
    { href: '/dashboard/settings', icon: 'settings', label: 'Настройки' },
  ]

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 pb-safe z-50">
      <div className="flex justify-around items-center h-16">
        {links.map((link) => {
          const isActive = pathname === link.href
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex flex-col items-center justify-center w-full h-full transition-colors ${
                isActive
                  ? 'text-[var(--color-primary-container)]'
                  : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
              }`}
            >
              <span className="material-symbols-outlined text-2xl">{link.icon}</span>
              <span className="text-[10px] font-medium mt-1">{link.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
