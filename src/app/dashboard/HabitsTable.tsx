'use client'

import { useState, useRef, useEffect } from 'react'
import { toggleCompletion, addHabit, deleteHabit } from './actions'

import EmojiPicker, { Theme } from 'emoji-picker-react'
import { useTheme } from 'next-themes'

type Habit = {
  id: string
  title: string
  color: string
  emoji?: string | null
}

type Completion = {
  habit_id: string
  date: string
}

export default function HabitsTable({
  initialHabits,
  initialCompletions,
  dates,
  habitStreaks = {},
}: {
  initialHabits: Habit[]
  initialCompletions: Completion[]
  dates: { date: Date; dateString: string; dayName: string; dayNumber: string }[]
  habitStreaks?: Record<string, number>
}) {
  const [habits, setHabits] = useState<Habit[]>(initialHabits)
  const [completions, setCompletions] = useState<Completion[]>(initialCompletions)
  const [popping, setPopping] = useState<Set<string>>(new Set())

  useEffect(() => {
    setHabits(initialHabits)
  }, [initialHabits])

  useEffect(() => {
    setCompletions(initialCompletions)
  }, [initialCompletions])

  const [isAdding, setIsAdding] = useState(false)
  const [newHabitTitle, setNewHabitTitle] = useState('')
  const [newHabitEmoji, setNewHabitEmoji] = useState<string | null>(null)
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const [loading, setLoading] = useState(false)
  const [showScrollHint, setShowScrollHint] = useState(true)
  const scrollRef = useRef<HTMLDivElement>(null)
  const { resolvedTheme } = useTheme()

  useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    const handleScroll = () => setShowScrollHint(el.scrollLeft < 10)
    el.addEventListener('scroll', handleScroll, { passive: true })
    return () => el.removeEventListener('scroll', handleScroll)
  }, [])

  const isCompleted = (habitId: string, dateStr: string) => {
    return completions.some((c) => c.habit_id === habitId && c.date === dateStr)
  }

  const handleToggle = async (habitId: string, dateStr: string) => {
    const currentlyCompleted = isCompleted(habitId, dateStr)

    if (!currentlyCompleted) {
      const key = `${habitId}-${dateStr}`
      setPopping(prev => new Set(prev).add(key))
      setTimeout(() => setPopping(prev => { const n = new Set(prev); n.delete(key); return n }), 320)
    }

    // Optimistic update
    if (currentlyCompleted) {
      setCompletions(completions.filter(c => !(c.habit_id === habitId && c.date === dateStr)))
    } else {
      setCompletions([...completions, { habit_id: habitId, date: dateStr }])
    }

    const { error } = await toggleCompletion(habitId, dateStr, currentlyCompleted)
    
    // Revert on error
    if (error) {
      if (currentlyCompleted) {
        setCompletions([...completions, { habit_id: habitId, date: dateStr }])
      } else {
        setCompletions(completions.filter(c => !(c.habit_id === habitId && c.date === dateStr)))
      }
      alert('Ошибка при сохранении: ' + error)
    }
  }

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newHabitTitle.trim()) return
    setLoading(true)
    const { error } = await addHabit(newHabitTitle.trim(), 'bg-indigo-500', newHabitEmoji)
    setLoading(false)
    if (error) {
      alert('Ошибка: ' + error)
    } else {
      setNewHabitTitle('')
      setNewHabitEmoji(null)
      setShowEmojiPicker(false)
      setIsAdding(false)
      // The page will revalidate and update the props, but we could also do optimistic update here
    }
  }

  const calculateHabitProgress = (habitId: string) => {
    let completedDays = 0
    dates.forEach(d => {
      if (isCompleted(habitId, d.dateString)) completedDays++
    })
    return Math.round((completedDays / dates.length) * 100)
  }

  const calculateTotalProgress = () => {
    if (habits.length === 0) return 0
    let totalCompleted = completions.length
    let totalPossible = habits.length * dates.length
    return Math.round((totalCompleted / totalPossible) * 100)
  }

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden relative">
      <div className="flex justify-between items-center p-4 border-b border-slate-200 dark:border-slate-700">
        <h2 className="font-bold text-slate-800 dark:text-white">Твои привычки</h2>
        <button
          onClick={() => setIsAdding(!isAdding)}
          className="flex items-center gap-1 text-sm font-medium text-[var(--color-primary-container)] hover:text-[var(--color-primary)] transition-colors"
        >
          <span className="material-symbols-outlined text-[18px]">add</span>
          Добавить
        </button>
      </div>

      <div ref={scrollRef} className="overflow-x-auto relative">
        {showScrollHint && (
          <div className="md:hidden pointer-events-none absolute top-0 right-0 bottom-0 w-12 bg-gradient-to-l from-white dark:from-slate-800 to-transparent z-10" />
        )}

      <table className="w-full text-left border-collapse min-w-[800px]">
        <thead>
          <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700 text-sm text-slate-500 dark:text-slate-400">
            <th className="py-4 px-3 md:px-6 font-medium w-1/3">Привычка</th>
            {dates.map((d) => (
              <th key={d.dateString} className={`py-4 px-2 text-center font-medium ${new Date().toLocaleDateString('en-CA') === d.dateString ? 'text-[var(--color-primary-container)] bg-indigo-50/50 dark:bg-indigo-900/20' : ''}`}>
                {d.dayName} {d.dayNumber}
              </th>
            ))}
            <th className="py-4 px-3 md:px-6 text-right font-medium">Прогресс</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
          {habits.length === 0 && !isAdding ? (
            <tr>
              <td colSpan={dates.length + 2} className="py-8 text-center text-slate-500">
                Нет привычек. Добавь первую привычку, чтобы начать!
              </td>
            </tr>
          ) : null}
          
          {habits.map((habit) => (
            <tr key={habit.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors group">
              <td className="py-4 px-3 md:px-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${habit.color} shrink-0`}></div>
                    <span className="font-medium text-slate-700 dark:text-slate-200">
                      {habit.emoji && <span className="mr-2">{habit.emoji}</span>}
                      {habit.title}
                    </span>
                    {(habitStreaks[habit.id] ?? 0) > 0 && (
                      <span className="flex items-center gap-0.5 text-xs font-semibold text-orange-500 bg-orange-50 dark:bg-orange-900/20 px-1.5 py-0.5 rounded-full shrink-0">
                        🔥{habitStreaks[habit.id]}
                      </span>
                    )}
                  </div>
                  <button 
                    onClick={() => {
                      if(confirm('Удалить привычку?')) deleteHabit(habit.id)
                    }} 
                    className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-500 transition-opacity p-1"
                  >
                    <span className="material-symbols-outlined text-[16px]">delete</span>
                  </button>
                </div>
              </td>
              {dates.map((d) => {
                const checked = isCompleted(habit.id, d.dateString)
                return (
                  <td key={d.dateString} className={`py-4 px-2 text-center ${new Date().toLocaleDateString('en-CA') === d.dateString ? 'bg-indigo-50/20 dark:bg-indigo-900/10' : ''}`}>
                    <button
                      onClick={() => handleToggle(habit.id, d.dateString)}
                      className={`w-6 h-6 mx-auto rounded-md flex items-center justify-center transition-colors shadow-sm
                        ${checked ? 'bg-green-500 hover:bg-green-600 text-white border-transparent' : 'border-2 border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 hover:border-slate-300 dark:hover:border-slate-500'}
                        ${popping.has(`${habit.id}-${d.dateString}`) ? 'animate-pop' : ''}`}
                    >
                      {checked && <span className="material-symbols-outlined text-[16px] font-bold">check</span>}
                    </button>
                  </td>
                )
              })}
              <td className="py-4 px-3 md:px-6">
                <div className="flex items-center gap-3 justify-end">
                  <div className="w-24 h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                    <div className={`h-full ${habit.color} rounded-full transition-all duration-500`} style={{ width: `${calculateHabitProgress(habit.id)}%` }}></div>
                  </div>
                  <span className="text-sm font-medium text-slate-500 w-8 text-right">{calculateHabitProgress(habit.id)}%</span>
                </div>
              </td>
            </tr>
          ))}

          {isAdding && (
            <tr className="bg-slate-50 dark:bg-slate-800/50">
              <td className="py-3 px-3 md:px-6" colSpan={dates.length + 2}>
                <form onSubmit={handleAdd} className="flex gap-2 relative">
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                      className="h-full px-3 py-2 flex items-center justify-center bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg text-xl hover:bg-slate-50 dark:hover:bg-slate-600 transition-colors"
                    >
                      {newHabitEmoji || '😊'}
                    </button>
                    {showEmojiPicker && (
                      <div className="absolute top-full left-0 mt-2 z-50 shadow-xl">
                        <EmojiPicker 
                          theme={resolvedTheme === 'dark' ? Theme.DARK : Theme.LIGHT}
                          onEmojiClick={(e) => {
                            setNewHabitEmoji(e.emoji)
                            setShowEmojiPicker(false)
                          }}
                        />
                      </div>
                    )}
                  </div>
                  <input 
                    type="text" 
                    value={newHabitTitle}
                    onChange={(e) => setNewHabitTitle(e.target.value)}
                    placeholder="Название привычки..." 
                    className="flex-1 px-3 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-container)]"
                    autoFocus
                  />
                  <button disabled={loading} type="submit" className="px-4 py-2 bg-[var(--color-primary-container)] text-white text-sm font-medium rounded-lg hover:bg-[var(--color-primary)] transition-colors">
                    {loading ? 'Добавление...' : 'Сохранить'}
                  </button>
                  <button type="button" onClick={() => { setIsAdding(false); setShowEmojiPicker(false); setNewHabitEmoji(null); }} className="px-4 py-2 border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 text-sm font-medium rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
                    Отмена
                  </button>
                </form>
              </td>
            </tr>
          )}
        </tbody>
        <tfoot className="bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-700">
          <tr>
            <td className="py-4 px-6 font-bold text-slate-800 dark:text-white">Итого за неделю:</td>
            <td colSpan={dates.length}></td>
            <td className="py-4 px-6">
              <div className="flex items-center gap-3 justify-end">
                <div className="w-24 h-2.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden shadow-inner">
                  <div className="h-full bg-green-500 rounded-full transition-all duration-500" style={{ width: `${calculateTotalProgress()}%` }}></div>
                </div>
                <span className="text-base font-bold text-green-600 w-9 text-right">{calculateTotalProgress()}%</span>
              </div>
            </td>
          </tr>
        </tfoot>
      </table>
      </div>
    </div>
  )
}
