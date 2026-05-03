'use client'

import { useState } from 'react'
import { addReminder, deleteReminder } from './actions'

type Habit = {
  id: string
  title: string
  emoji?: string | null
}

type Reminder = {
  id: string
  habit_id: string | null
  notify_time: string
  is_recurring: boolean
  habits: { title: string; emoji?: string | null }[] | null
}

export default function TelegramReminders({
  habits,
  initialReminders,
}: {
  habits: Habit[]
  initialReminders: Reminder[]
}) {
  const [reminders, setReminders] = useState<Reminder[]>(initialReminders)
  const [habitId, setHabitId] = useState('')
  const [time, setTime] = useState('09:00')
  const [isRecurring, setIsRecurring] = useState(true)
  const [adding, setAdding] = useState(false)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [error, setError] = useState('')

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    setAdding(true)
    setError('')
    const result = await addReminder(habitId || null, time, isRecurring)
    setAdding(false)
    if (result.error) {
      setError(result.error)
    } else {
      window.location.reload()
    }
  }

  const handleDelete = async (id: string) => {
    setDeleting(id)
    await deleteReminder(id)
    setReminders(prev => prev.filter(r => r.id !== id))
    setDeleting(null)
  }

  const habitLabel = (r: Reminder) => {
    if (!r.habit_id) return 'Все привычки'
    const h = r.habits?.[0]
    if (!h) return 'Привычка'
    return `${h.emoji ? h.emoji + ' ' : ''}${h.title}`
  }

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
      <div className="flex items-center gap-3 p-4 border-b border-slate-200 dark:border-slate-700">
        <div className="w-8 h-8 rounded-full bg-[#2AABEE]/20 flex items-center justify-center shrink-0">
          <svg className="w-4 h-4 text-[#2AABEE]" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.562 8.248l-2.038 9.61c-.148.658-.537.818-1.084.508l-3-2.21-1.447 1.394c-.16.16-.295.295-.605.295l.213-3.053 5.56-5.023c.242-.213-.054-.333-.373-.12L7.09 14.309l-2.956-.924c-.643-.204-.657-.643.136-.953l11.552-4.453c.537-.194 1.006.131.74.269z" />
          </svg>
        </div>
        <h2 className="font-bold text-slate-800 dark:text-white">Уведомления в Telegram</h2>
      </div>

      <div className="p-4 space-y-3">
        {reminders.length === 0 && (
          <p className="text-sm text-slate-400 dark:text-slate-500">Нет напоминаний. Добавь первое!</p>
        )}

        {reminders.map(r => (
          <div key={r.id} className="flex items-center justify-between py-2 px-3 rounded-lg bg-slate-50 dark:bg-slate-700/50 gap-3">
            <div className="flex items-center gap-2 flex-wrap min-w-0">
              <span className="text-sm font-medium text-slate-700 dark:text-slate-200 truncate">{habitLabel(r)}</span>
              <span className="text-xs text-slate-400 shrink-0">{r.notify_time}</span>
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium shrink-0 ${r.is_recurring ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' : 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400'}`}>
                {r.is_recurring ? 'Каждый день' : 'Единоразово'}
              </span>
            </div>
            <button
              onClick={() => handleDelete(r.id)}
              disabled={deleting === r.id}
              className="text-red-400 hover:text-red-500 transition-colors p-1 shrink-0 disabled:opacity-50"
            >
              <span className="material-symbols-outlined text-[16px]">delete</span>
            </button>
          </div>
        ))}

        <form onSubmit={handleAdd} className="flex flex-wrap gap-2 pt-2 border-t border-slate-100 dark:border-slate-700">
          <select
            value={habitId}
            onChange={e => setHabitId(e.target.value)}
            className="flex-1 min-w-[140px] px-3 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-container)]"
          >
            <option value="">Все привычки</option>
            {habits.map(h => (
              <option key={h.id} value={h.id}>
                {h.emoji ? h.emoji + ' ' : ''}{h.title}
              </option>
            ))}
          </select>
          <input
            type="time"
            value={time}
            onChange={e => setTime(e.target.value)}
            className="px-3 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-container)]"
          />
          <div className="flex rounded-lg border border-slate-300 dark:border-slate-600 overflow-hidden text-sm">
            <button
              type="button"
              onClick={() => setIsRecurring(true)}
              className={`px-3 py-2 transition-colors ${isRecurring ? 'bg-[var(--color-primary-container)] text-white' : 'bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-600'}`}
            >
              Каждый день
            </button>
            <button
              type="button"
              onClick={() => setIsRecurring(false)}
              className={`px-3 py-2 transition-colors ${!isRecurring ? 'bg-[var(--color-primary-container)] text-white' : 'bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-600'}`}
            >
              Единоразово
            </button>
          </div>
          <button
            type="submit"
            disabled={adding}
            className="px-4 py-2 bg-[var(--color-primary-container)] text-white text-sm font-medium rounded-lg hover:bg-[var(--color-primary)] transition-colors disabled:opacity-50"
          >
            {adding ? '...' : '+ Добавить'}
          </button>
        </form>

        {error && <p className="text-xs text-red-500">{error}</p>}
        <p className="text-xs text-slate-400">Время по Алматы (UTC+5)</p>
      </div>
    </div>
  )
}
