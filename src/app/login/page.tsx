import Link from 'next/link'
import { login } from './actions'

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ message: string }>
}) {
  const message = (await searchParams).message
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-sm border border-slate-200">
        <div>
          <Link href="/" className="flex justify-center items-center gap-2 text-slate-900 font-bold text-xl mb-6">
            <span className="material-symbols-outlined text-[var(--color-primary-container)]">check_circle</span>
            Календарь задач
          </Link>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-slate-900">
            Вход в аккаунт
          </h2>
          <p className="mt-2 text-center text-sm text-slate-600">
            Или{' '}
            <Link href="/register" className="font-medium text-[var(--color-primary-container)] hover:text-[var(--color-primary)]">
              создайте новый аккаунт
            </Link>
          </p>
        </div>
        <form className="mt-8 space-y-6" action={login}>
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
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-slate-300 placeholder-slate-500 text-slate-900 rounded-t-md focus:outline-none focus:ring-[var(--color-primary-container)] focus:border-[var(--color-primary-container)] focus:z-10 sm:text-sm"
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
                autoComplete="current-password"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-slate-300 placeholder-slate-500 text-slate-900 rounded-b-md focus:outline-none focus:ring-[var(--color-primary-container)] focus:border-[var(--color-primary-container)] focus:z-10 sm:text-sm"
                placeholder="Пароль"
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
              Войти
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
