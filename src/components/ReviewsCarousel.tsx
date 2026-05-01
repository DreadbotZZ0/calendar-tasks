'use client'

import { useState } from 'react'

const REVIEWS = [
  {
    name: 'Алина Козлова',
    role: 'Фитнес-тренер',
    avatar: 'https://i.pravatar.cc/80?img=47',
    text: 'Наконец-то нашла трекер, который не перегружен лишним. Веду 4 привычки уже 2 месяца — спорт, вода, чтение и сон. Стрик в 47 дней говорит сам за себя!',
    stars: 5,
  },
  {
    name: 'Максим Петров',
    role: 'Разработчик',
    avatar: 'https://i.pravatar.cc/80?img=12',
    text: 'Пробовал десятки подобных приложений. Этот — лучший по соотношению простоты и функциональности. Особенно нравится недельный вид и статистика по дням.',
    stars: 5,
  },
  {
    name: 'Дарья Соколова',
    role: 'Студентка',
    avatar: 'https://i.pravatar.cc/80?img=32',
    text: 'Использую уже три недели для подготовки к экзаменам. Очень помогает видеть прогресс визуально. Интерфейс приятный, не надоедает открывать каждый день.',
    stars: 5,
  },
  {
    name: 'Игорь Воронов',
    role: 'Предприниматель',
    avatar: 'https://i.pravatar.cc/80?img=59',
    text: 'Взял Pro план — не пожалел. Веду 12 привычек одновременно: утренние ритуалы, рабочие задачи, спорт. История за несколько месяцев мотивирует не сбиваться.',
    stars: 5,
  },
]

export default function ReviewsCarousel() {
  const [current, setCurrent] = useState(0)

  const prev = () => setCurrent(i => (i === 0 ? REVIEWS.length - 1 : i - 1))
  const next = () => setCurrent(i => (i === REVIEWS.length - 1 ? 0 : i + 1))

  const review = REVIEWS[current]

  return (
    <section id="reviews" className="max-w-3xl mx-auto px-6 py-24">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">Что говорят пользователи</h2>
        <p className="text-slate-600 dark:text-slate-400">Реальные отзывы от людей, которые изменили свои привычки.</p>
      </div>

      <div className="relative bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm p-8 text-center">
        {/* Stars */}
        <div className="flex justify-center gap-1 mb-6">
          {Array.from({ length: review.stars }).map((_, i) => (
            <span key={i} className="text-yellow-400 text-xl">★</span>
          ))}
        </div>

        {/* Text */}
        <p className="text-slate-700 dark:text-slate-300 text-lg leading-relaxed mb-8 min-h-[80px]">
          &ldquo;{review.text}&rdquo;
        </p>

        {/* Author */}
        <div className="flex items-center justify-center gap-3">
          <img
            src={review.avatar}
            alt={review.name}
            className="w-12 h-12 rounded-full object-cover border-2 border-slate-200 dark:border-slate-600"
          />
          <div className="text-left">
            <p className="font-semibold text-slate-900 dark:text-white text-sm">{review.name}</p>
            <p className="text-slate-500 dark:text-slate-400 text-xs">{review.role}</p>
          </div>
        </div>

        {/* Nav buttons */}
        <button
          type="button"
          onClick={prev}
          className="absolute left-4 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 flex items-center justify-center transition-colors"
          aria-label="Предыдущий"
        >
          <span className="material-symbols-outlined text-slate-600 dark:text-slate-300 text-[18px]">chevron_left</span>
        </button>
        <button
          type="button"
          onClick={next}
          className="absolute right-4 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 flex items-center justify-center transition-colors"
          aria-label="Следующий"
        >
          <span className="material-symbols-outlined text-slate-600 dark:text-slate-300 text-[18px]">chevron_right</span>
        </button>
      </div>

      {/* Dots */}
      <div className="flex justify-center gap-2 mt-6">
        {REVIEWS.map((_, i) => (
          <button
            key={i}
            type="button"
            onClick={() => setCurrent(i)}
            className={`w-2 h-2 rounded-full transition-colors ${i === current ? 'bg-[var(--color-primary-container)]' : 'bg-slate-300 dark:bg-slate-600'}`}
            aria-label={`Отзыв ${i + 1}`}
          />
        ))}
      </div>
    </section>
  )
}
