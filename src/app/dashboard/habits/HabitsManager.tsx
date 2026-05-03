'use client'

import { useState, useEffect } from 'react'
import { addHabit, updateHabit, deleteHabit } from '../actions'

import EmojiPicker, { Theme } from 'emoji-picker-react'
import { useTheme } from 'next-themes'

type Habit = {
  id: string
  title: string
  color: string
  emoji?: string | null
}

const COLORS = [
  { cls: 'bg-violet-500', label: 'Фиолетовый' },
  { cls: 'bg-fuchsia-500', label: 'Фуксия' },
  { cls: 'bg-pink-500', label: 'Розовый' },
  { cls: 'bg-rose-500', label: 'Малиновый' },
  { cls: 'bg-red-500', label: 'Красный' },
  { cls: 'bg-orange-500', label: 'Оранжевый' },
  { cls: 'bg-amber-400', label: 'Янтарный' },
  { cls: 'bg-yellow-400', label: 'Жёлтый' },
  { cls: 'bg-lime-500', label: 'Лайм' },
  { cls: 'bg-green-500', label: 'Зелёный' },
  { cls: 'bg-emerald-500', label: 'Изумрудный' },
  { cls: 'bg-teal-500', label: 'Бирюзовый' },
  { cls: 'bg-cyan-500', label: 'Циан' },
  { cls: 'bg-sky-500', label: 'Небесный' },
  { cls: 'bg-blue-500', label: 'Синий' },
  { cls: 'bg-indigo-500', label: 'Индиго' },
]

export default function HabitsManager({ initialHabits }: { initialHabits: Habit[] }) {
  const [habits, setHabits] = useState<Habit[]>(initialHabits)

  useEffect(() => {
    setHabits(initialHabits)
  }, [initialHabits])
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editTitle, setEditTitle] = useState('')
  const [editColor, setEditColor] = useState('')
  const [editEmoji, setEditEmoji] = useState<string | null>(null)
  const [showEditEmojiPicker, setShowEditEmojiPicker] = useState(false)
  
  const [isAdding, setIsAdding] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const [newColor, setNewColor] = useState('bg-indigo-500')
  const [newEmoji, setNewEmoji] = useState<string | null>(null)
  const [showNewEmojiPicker, setShowNewEmojiPicker] = useState(false)
  
  const [loading, setLoading] = useState(false)
  const { resolvedTheme } = useTheme()

  const startEdit = (habit: Habit) => {
    setEditingId(habit.id)
    setEditTitle(habit.title)
    setEditColor(habit.color)
    setEditEmoji(habit.emoji || null)
    setShowEditEmojiPicker(false)
  }

  const cancelEdit = () => {
    setEditingId(null)
    setEditTitle('')
    setEditColor('')
    setEditEmoji(null)
    setShowEditEmojiPicker(false)
  }

  const handleUpdate = async (habitId: string) => {
    if (!editTitle.trim()) return
    setLoading(true)
    const { error } = await updateHabit(habitId, editTitle.trim(), editColor, editEmoji)
    setLoading(false)
    if (error) { alert('Ошибка: ' + error); return }
    setHabits(habits.map(h => h.id === habitId ? { ...h, title: editTitle.trim(), color: editColor, emoji: editEmoji } : h))
    cancelEdit()
  }

  const handleDelete = async (habitId: string) => {
    if (!confirm('Удалить привычку? Все отметки тоже удалятся.')) return
    await deleteHabit(habitId)
    setHabits(habits.filter(h => h.id !== habitId))
  }

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTitle.trim()) return
    setLoading(true)
    const { error } = await addHabit(newTitle.trim(), newColor, newEmoji)
    setLoading(false)
    if (error) { alert('Ошибка: ' + error); return }
    setNewTitle('')
    setNewColor('bg-indigo-500')
    setNewEmoji(null)
    setIsAdding(false)
  }

  return (
    <div className="space-y-4">
      {habits.length === 0 && !isAdding && (
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-12 text-center">
          <span className="material-symbols-outlined text-5xl text-slate-300 dark:text-slate-600">list_alt</span>
          <p className="mt-4 text-slate-500 dark:text-slate-400">Нет привычек. Добавь первую!</p>
        </div>
      )}

      {habits.map(habit => (
        <div key={habit.id} className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
          {editingId === habit.id ? (
            <div className="space-y-3">
              <div className="flex gap-2 relative">
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setShowEditEmojiPicker(!showEditEmojiPicker)}
                    className="h-full px-3 py-2 flex items-center justify-center bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg text-xl hover:bg-slate-50 dark:hover:bg-slate-600 transition-colors"
                  >
                    {editEmoji || '😊'}
                  </button>
                  {showEditEmojiPicker && (
                    <div className="absolute top-full left-0 mt-2 z-50 shadow-xl">
                      <EmojiPicker 
                        theme={resolvedTheme === 'dark' ? Theme.DARK : Theme.LIGHT}
                        onEmojiClick={(e) => {
                          setEditEmoji(e.emoji)
                          setShowEditEmojiPicker(false)
                        }}
                      />
                    </div>
                  )}
                </div>
                <input
                  value={editTitle}
                  onChange={e => setEditTitle(e.target.value)}
                  className="flex-1 px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-container)]"
                  autoFocus
                />
              </div>
              <div className="flex gap-2 flex-wrap">
                {COLORS.map(c => (
                  <button
                    key={c.cls}
                    onClick={() => setEditColor(c.cls)}
                    title={c.label}
                    className={`w-7 h-7 rounded-full ${c.cls} transition-transform ${editColor === c.cls ? 'ring-2 ring-offset-2 ring-slate-400 scale-110' : 'hover:scale-110'}`}
                  />
                ))}
              </div>
              <div className="flex gap-2">
                <button
                  disabled={loading}
                  onClick={() => handleUpdate(habit.id)}
                  className="px-4 py-2 bg-[var(--color-primary-container)] text-white text-sm font-medium rounded-lg hover:bg-[var(--color-primary)] transition-colors"
                >
                  {loading ? 'Сохранение...' : 'Сохранить'}
                </button>
                <button onClick={cancelEdit} className="px-4 py-2 border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 text-sm font-medium rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
                  Отмена
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-4 h-4 rounded-full ${habit.color} shrink-0`} />
                <span className="font-medium text-slate-800 dark:text-slate-100">
                  {habit.emoji && <span className="mr-2">{habit.emoji}</span>}
                  {habit.title}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => startEdit(habit)}
                  className="p-2 text-slate-400 hover:text-[var(--color-primary-container)] transition-colors rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700"
                >
                  <span className="material-symbols-outlined text-[18px]">edit</span>
                </button>
                <button
                  onClick={() => handleDelete(habit.id)}
                  className="p-2 text-slate-400 hover:text-red-500 transition-colors rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20"
                >
                  <span className="material-symbols-outlined text-[18px]">delete</span>
                </button>
              </div>
            </div>
          )}
        </div>
      ))}

      {isAdding ? (
        <form onSubmit={handleAdd} className="bg-white dark:bg-slate-800 rounded-xl border border-dashed border-[var(--color-primary-container)] p-4 space-y-3">
          <div className="flex gap-2 relative">
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowNewEmojiPicker(!showNewEmojiPicker)}
                className="h-full px-3 py-2 flex items-center justify-center bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg text-xl hover:bg-slate-50 dark:hover:bg-slate-600 transition-colors"
              >
                {newEmoji || '😊'}
              </button>
              {showNewEmojiPicker && (
                <div className="absolute top-full left-0 mt-2 z-50 shadow-xl">
                  <EmojiPicker 
                    theme={resolvedTheme === 'dark' ? Theme.DARK : Theme.LIGHT}
                    onEmojiClick={(e) => {
                      setNewEmoji(e.emoji)
                      setShowNewEmojiPicker(false)
                    }}
                  />
                </div>
              )}
            </div>
            <input
              value={newTitle}
              onChange={e => setNewTitle(e.target.value)}
              placeholder="Название привычки..."
              className="flex-1 px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-container)]"
              autoFocus
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            {COLORS.map(c => (
              <button
                type="button"
                key={c.cls}
                onClick={() => setNewColor(c.cls)}
                title={c.label}
                className={`w-7 h-7 rounded-full ${c.cls} transition-transform ${newColor === c.cls ? 'ring-2 ring-offset-2 ring-slate-400 scale-110' : 'hover:scale-110'}`}
              />
            ))}
          </div>
          <div className="flex gap-2">
            <button disabled={loading} type="submit" className="px-4 py-2 bg-[var(--color-primary-container)] text-white text-sm font-medium rounded-lg hover:bg-[var(--color-primary)] transition-colors">
              {loading ? 'Добавление...' : 'Добавить'}
            </button>
            <button type="button" onClick={() => setIsAdding(false)} className="px-4 py-2 border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 text-sm font-medium rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
              Отмена
            </button>
          </div>
        </form>
      ) : (
        <button
          onClick={() => setIsAdding(true)}
          className="w-full py-3 rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:border-[var(--color-primary-container)] hover:text-[var(--color-primary-container)] transition-colors flex items-center justify-center gap-2 font-medium"
        >
          <span className="material-symbols-outlined text-[20px]">add</span>
          Добавить привычку
        </button>
      )}
    </div>
  )
}
