'use client'

import { useState } from 'react'
import EmojiPicker, { Theme } from 'emoji-picker-react'
import { useTheme } from 'next-themes'
import { updateDisplayName } from '../actions'

export default function DisplayNameForm({
  currentName,
  currentEmoji,
}: {
  currentName: string
  currentEmoji?: string | null
}) {
  const [name, setName] = useState(currentName)
  const [emoji, setEmoji] = useState<string | null>(currentEmoji ?? null)
  const [showPicker, setShowPicker] = useState(false)
  const [loading, setLoading] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')
  const { resolvedTheme } = useTheme()

  const unchanged = name.trim() === currentName && emoji === (currentEmoji ?? null)

  const handleSubmit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!name.trim() || unchanged) return
    setLoading(true)
    setError('')
    setSaved(false)
    const result = await updateDisplayName(name, emoji)
    setLoading(false)
    if (result.error) {
      setError(result.error)
    } else {
      setSaved(true)
      setTimeout(() => setSaved(false), 2500)
    }
  }

  return (
    <div className="space-y-2">
      <p className="text-sm font-medium text-slate-700 dark:text-slate-300">Отображаемое имя</p>
      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2">
        <div className="flex gap-2 flex-1 min-w-0">
          {/* Emoji button */}
          <div className="relative shrink-0">
            <button
              type="button"
              onClick={() => setShowPicker(v => !v)}
              className="h-full px-3 py-2 flex items-center justify-center bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg text-xl hover:bg-slate-100 dark:hover:bg-slate-600 transition-colors"
            >
              {emoji || '😊'}
            </button>
            {showPicker && (
              <div className="absolute top-full left-0 mt-2 z-50 shadow-xl">
                <EmojiPicker
                  theme={resolvedTheme === 'dark' ? Theme.DARK : Theme.LIGHT}
                  onEmojiClick={(e) => {
                    setEmoji(e.emoji)
                    setShowPicker(false)
                    setSaved(false)
                  }}
                />
              </div>
            )}
          </div>

          <input
            value={name}
            onChange={e => { setName(e.target.value); setSaved(false) }}
            placeholder="Введите имя..."
            maxLength={32}
            className="flex-1 min-w-0 px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-container)]"
          />
        </div>
        <button
          type="submit"
          disabled={loading || !name.trim() || unchanged}
          className="px-4 py-2 bg-[var(--color-primary-container)] text-white text-sm font-medium rounded-lg hover:bg-[var(--color-primary)] transition-colors disabled:opacity-50 shrink-0"
        >
          {loading ? 'Сохраняю...' : saved ? '✓ Сохранено' : 'Сохранить'}
        </button>
      </form>
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  )
}
