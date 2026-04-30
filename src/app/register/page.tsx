import Link from 'next/link'
import { signup } from '@/app/login/actions'

export default async function RegisterPage({
  searchParams,
}: {
  searchParams: Promise<{ message: string }>
}) {
  const message = (await searchParams).message

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900 py-12 px-4 sm:px-6 lg:px-8 transition-colors duration-300">
      <div className="max-w-md w-full space-y-8 bg-white dark:bg-slate-800 p-10 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700">
        <div>
          <div className="flex justify-center">
            <div className="flex items-center gap-2 text-slate-900 dark:text-white font-bold text-2xl">
              <span className="material-symbols-outlined text-[var(--color-primary-container)] text-3xl">check_circle</span>
              Календарь задач
            </div>
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-slate-900 dark:text-white">
            Создать аккаунт
          </h2>
          <p className="mt-2 text-center text-sm text-slate-600 dark:text-slate-400">
            Уже есть аккаунт?{' '}
            <Link href="/login" className="font-medium text-[var(--color-primary-container)] hover:text-[var(--color-primary)]">
              Войти
            </Link>
          </p>
        </div>
        <form className="mt-8 space-y-6" action={signup}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="email-address" className="sr-only">
                Email
              </label>
              <input
                id="email-address"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-3 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 placeholder-slate-500 dark:placeholder-slate-400 text-slate-900 dark:text-white rounded-t-md focus:outline-none focus:ring-[var(--color-primary-container)] focus:border-[var(--color-primary-container)] focus:z-10 sm:text-sm transition-colors"
                placeholder="Email адрес"
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                Пароль
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                minLength={6}
                className="appearance-none rounded-none relative block w-full px-3 py-3 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 placeholder-slate-500 dark:placeholder-slate-400 text-slate-900 dark:text-white rounded-b-md focus:outline-none focus:ring-[var(--color-primary-container)] focus:border-[var(--color-primary-container)] focus:z-10 sm:text-sm transition-colors"
                placeholder="Пароль (минимум 6 символов)"
              />
            </div>
          </div>

          {message && (
            <div className="text-red-500 text-sm text-center">
              {message}
            </div>
          )}

          <div>
            <button
              type="submit"
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-[var(--color-primary-container)] hover:bg-[var(--color-primary)] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--color-primary-container)] transition-colors"
            >
              Зарегистрироваться
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
