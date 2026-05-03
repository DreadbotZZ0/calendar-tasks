'use client'
import { useState } from 'react'
import { setPetName } from './actions'

export default function PetNameForm({ initialName, stageName }: { initialName: string | null; stageName: string }) {
  const [name, setName] = useState(initialName ?? '')
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)

  const displayName = name || stageName

  async function handleSave() {
    setSaving(true)
    await setPetName(name)
    setSaving(false)
    setEditing(false)
  }

  if (editing) {
    return (
      <div className="flex items-center gap-2 mt-1">
        <input
          type="text"
          value={name}
          onChange={e => setName(e.target.value)}
          maxLength={24}
          placeholder="Имя питомца"
          className="text-sm border border-slate-300 dark:border-slate-600 rounded px-2 py-0.5 bg-white dark:bg-slate-700 text-slate-900 dark:text-white w-36 outline-none focus:border-indigo-400"
          autoFocus
          onKeyDown={e => { if (e.key === 'Enter') handleSave(); if (e.key === 'Escape') setEditing(false) }}
        />
        <button
          onClick={handleSave}
          disabled={saving}
          className="text-xs text-indigo-500 font-medium hover:text-indigo-700 disabled:opacity-50"
        >
          {saving ? '...' : 'Сохранить'}
        </button>
        <button onClick={() => setEditing(false)} className="text-xs text-slate-400 hover:text-slate-600">
          Отмена
        </button>
      </div>
    )
  }

  return (
    <button
      onClick={() => setEditing(true)}
      className="flex items-center gap-1 text-sm text-slate-500 dark:text-slate-400 hover:text-indigo-500 dark:hover:text-indigo-400 transition-colors mt-0.5 group"
    >
      <span className="font-medium">{displayName}</span>
      <span className="material-symbols-outlined text-sm opacity-0 group-hover:opacity-100 transition-opacity" style={{ fontSize: '14px' }}>
        edit
      </span>
    </button>
  )
}
