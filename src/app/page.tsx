import Link from 'next/link';
import ThemeToggle from '@/components/ThemeToggle';
import ReviewsCarousel from '@/components/ReviewsCarousel';

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 transition-colors duration-300">
      <header className="fixed top-0 left-0 right-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md z-50 border-b border-slate-200 dark:border-slate-800 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2 text-slate-900 dark:text-white font-bold text-xl">
              <span className="material-symbols-outlined text-[var(--color-primary-container)]">check_circle</span>
              Календарь задач
            </div>
            <nav className="hidden md:flex space-x-8">
              <Link href="#features" className="text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white font-medium transition-colors">Преимущества</Link>
              <Link href="#pricing" className="text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white font-medium transition-colors">Тарифы</Link>
              <a className="text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white font-medium transition-colors" href="#reviews">Отзывы</a>
            </nav>
            <div className="flex items-center gap-4">
              <ThemeToggle />
              <Link className="text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white font-medium hidden md:block transition-colors" href="/login">Войти</Link>
              <Link className="bg-[var(--color-primary-container)] text-white hover:bg-[var(--color-primary)] hover:-translate-y-0.5 transition-all duration-200 px-4 py-2 rounded-lg font-medium text-sm" href="/register">
                Регистрация
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-grow pt-24 pb-20">
        <section className="max-w-7xl mx-auto px-6 pt-12 lg:pt-20 pb-20 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="flex flex-col gap-6">
            <h1 className="text-4xl lg:text-6xl font-bold text-slate-900 dark:text-white tracking-tight leading-tight">
              Отслеживай привычки.<br />
              <span className="text-[var(--color-primary-container)]">Достигай целей.</span>
            </h1>
            <p className="text-lg lg:text-xl text-slate-600 dark:text-slate-400 max-w-lg leading-relaxed">
              Простой и красивый трекер привычек. Ставь галочки каждый день и наблюдай за своим прогрессом.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 mt-4">
              <Link href="/register" className="bg-[var(--color-primary-container)] text-white px-8 py-3.5 rounded-lg font-medium hover:bg-[var(--color-primary)] hover:-translate-y-0.5 transition-all shadow-sm text-center">
                Начать
              </Link>
            </div>
          </div>
          <div className="relative w-full aspect-[4/3] rounded-xl overflow-hidden shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)] border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-800">
            <img 
              alt="Habit Tracker Dashboard Mockup" 
              className="w-full h-full object-cover" 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuAUYh1Q6S7f5K6GXtDkGxOTAEu5DqlyBR4d3Eek2fsBOwPRPEcG2jfXJ_HnnHNbiVUjnCxQnGlEAq3VfkepqSch_8SgAMWQCO_pBr9H9OL-CrdC0iiVjySFC9hzjJuFek-TimN-urHZ1wkrsilnvaUIiMXtire1VMhSUzp-BQoOPDNQBmxi3sL-oj5pCiIlKqc_uX0mSZPjbFdWC2pNVbSdvjziEtO636zhDxp7So4oGi-EvGHfQcg10RjYMOeyZil2UZB3J1IBfaY" 
            />
          </div>
        </section>

        <section className="border-y border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 py-12 transition-colors duration-300">
          <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-8 text-center divide-y md:divide-y-0 md:divide-x divide-slate-200 dark:divide-slate-800">
            <div className="pt-6 md:pt-0">
              <div className="text-3xl font-bold text-slate-900 dark:text-white mb-1">10,000+</div>
              <div className="text-slate-500 dark:text-slate-400 text-sm">пользователей</div>
            </div>
            <div className="pt-6 md:pt-0">
              <div className="text-3xl font-bold text-slate-900 dark:text-white mb-1">1M+</div>
              <div className="text-slate-500 dark:text-slate-400 text-sm">привычек отмечено</div>
            </div>
            <div className="pt-6 md:pt-0">
              <div className="text-3xl font-bold text-slate-900 dark:text-white mb-1">98%</div>
              <div className="text-slate-500 dark:text-slate-400 text-sm">довольных клиентов</div>
            </div>
          </div>
        </section>

        <section id="features" className="max-w-7xl mx-auto px-6 py-24">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">Всё что нужно для продуктивности</h2>
            <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">Инструменты, которые помогут вам сформировать полезные привычки и не сбиться с пути.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white dark:bg-slate-800 rounded-xl p-8 border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-900/40 rounded-lg flex items-center justify-center mb-6 text-[var(--color-primary-container)]">
                <span className="material-symbols-outlined">grid_on</span>
              </div>
              <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-3">Трекер привычек</h3>
              <p className="text-slate-600 dark:text-slate-400">Наглядная сетка на неделю. Отмечайте выполнение в один клик.</p>
            </div>
            <div className="bg-white dark:bg-slate-800 rounded-xl p-8 border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-900/40 rounded-lg flex items-center justify-center mb-6 text-[var(--color-primary-container)]">
                <span className="material-symbols-outlined">bar_chart</span>
              </div>
              <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-3">Статистика</h3>
              <p className="text-slate-600 dark:text-slate-400">Подробные графики вашего прогресса. Анализируйте свои успехи.</p>
            </div>
            <div className="bg-white dark:bg-slate-800 rounded-xl p-8 border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-900/40 rounded-lg flex items-center justify-center mb-6 text-[var(--color-primary-container)]">
                <span className="material-symbols-outlined">notifications</span>
              </div>
              <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-3">Напоминания</h3>
              <p className="text-slate-600 dark:text-slate-400">Не забывайте о важных делах. Настраиваемые уведомления.</p>
            </div>
          </div>
        </section>
        <section id="pricing" className="max-w-5xl mx-auto px-6 py-24">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">Тарифы</h2>
            <p className="text-slate-600">Простые и прозрачные условия для достижения ваших целей.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col transition-colors duration-300">
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Базовый</h3>
              <div className="text-4xl font-extrabold text-slate-900 dark:text-white mb-6">1990₸<span className="text-base font-normal text-slate-500 dark:text-slate-400">/мес</span></div>
              <ul className="space-y-4 mb-8 flex-grow">
                <li className="flex items-center gap-3 text-slate-700 dark:text-slate-300">
                  <span className="material-symbols-outlined text-green-500 text-xl">check</span>
                  До 5 привычек
                </li>
                <li className="flex items-center gap-3 text-slate-700 dark:text-slate-300">
                  <span className="material-symbols-outlined text-green-500 text-xl">check</span>
                  1 месяц истории
                </li>
                <li className="flex items-center gap-3 text-slate-700 dark:text-slate-300">
                  <span className="material-symbols-outlined text-green-500 text-xl">check</span>
                  Базовая статистика
                </li>
              </ul>
              <a href="https://aronfatima.gumroad.com/l/oxcbh" target="_blank" rel="noopener noreferrer" className="block text-center w-full py-3 rounded-lg border-2 border-[var(--color-primary-container)] text-[var(--color-primary-container)] font-medium hover:bg-indigo-50 dark:hover:bg-indigo-900/30 transition-colors">
                Выбрать
              </a>
            </div>
            <div className="bg-slate-900 rounded-2xl p-8 border border-slate-800 shadow-lg flex flex-col relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-[var(--color-primary-container)] text-white text-xs font-bold px-3 py-1 rounded-bl-lg">Популярный</div>
              <h3 className="text-2xl font-bold text-white mb-2">Pro</h3>
              <div className="text-4xl font-extrabold text-white mb-6">4990₸<span className="text-base font-normal text-slate-400">/мес</span></div>
              <ul className="space-y-4 mb-8 flex-grow">
                <li className="flex items-center gap-3 text-slate-300">
                  <span className="material-symbols-outlined text-[var(--color-primary-fixed-dim)] text-xl">check</span>
                  Безлимитные привычки
                </li>
                <li className="flex items-center gap-3 text-slate-300">
                  <span className="material-symbols-outlined text-[var(--color-primary-fixed-dim)] text-xl">check</span>
                  Полная статистика и история
                </li>
                <li className="flex items-center gap-3 text-slate-300">
                  <span className="material-symbols-outlined text-[var(--color-primary-fixed-dim)] text-xl">check</span>
                  Экспорт данных
                </li>
                <li className="flex items-center gap-3 text-slate-300">
                  <span className="material-symbols-outlined text-[var(--color-primary-fixed-dim)] text-xl">check</span>
                  Приоритетная поддержка
                </li>
              </ul>
              <a href="https://aronfatima.gumroad.com/l/bzynnz" target="_blank" rel="noopener noreferrer" className="block text-center w-full py-3 rounded-lg bg-[var(--color-primary-container)] text-white font-medium hover:bg-[var(--color-primary)] transition-colors">
                Оформить Pro
              </a>
            </div>
          </div>
        </section>
        <ReviewsCarousel />
      </main>

      <footer className="bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 w-full py-12 mt-auto transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <span className="material-symbols-outlined text-[var(--color-primary-container)]">check_circle</span>
            Календарь задач
          </div>
          <div className="flex flex-wrap gap-4 text-sm text-slate-500 dark:text-slate-400 md:justify-end">
            <a className="hover:text-[var(--color-primary-container)] underline underline-offset-4 transition-all duration-200" href="#features">Возможности</a>
            <a className="hover:text-[var(--color-primary-container)] underline underline-offset-4 transition-all duration-200" href="#pricing">Тарифы</a>
            <a className="hover:text-[var(--color-primary-container)] underline underline-offset-4 transition-all duration-200" href="#reviews">Отзывы</a>
            <a className="hover:text-[var(--color-primary-container)] underline underline-offset-4 transition-all duration-200" href="#">Политика конфиденциальности</a>
          </div>
          <div className="text-sm text-slate-500 dark:text-slate-400 md:col-span-2">
            © 2026 Календарь задач. Все права защищены.
          </div>
        </div>
      </footer>
    </div>
  );
}
