'use client'

import { useState } from 'react'
import { updateDisplayName } from '../actions'

export default function DisplayNameForm({ currentName }: { currentName: string }) {
  const [name, setName] = useState(currentName)
  const [loading, setLoading] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!name.trim() || name.trim() === currentName) return
    setLoading(true)
    setError('')
    setSaved(false)
    const result = await updateDisplayName(name)
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
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          value={name}
          onChange={e => { setName(e.target.value); setSaved(false) }}
          placeholder="Введите имя..."
          maxLength={32}
          className="flex-1 px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-container)]"
        />
        <button
          type="submit"
          disabled={loading || !name.trim() || name.trim() === currentName}
          className="px-4 py-2 bg-[var(--color-primary-container)] text-white text-sm font-medium rounded-lg hover:bg-[var(--color-primary)] transition-colors disabled:opacity-50"
        >
          {loading ? 'Сохраняю...' : saved ? '✓ Сохранено' : 'Сохранить'}
        </button>
      </form>
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  )
}
