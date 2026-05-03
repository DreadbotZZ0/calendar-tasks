'use client'
import { useState } from 'react'
import { setPetName } from './actions'

export default function PetNameForm({
  initialName,
  stageName,
  isDead,
}: {
  initialName: string | null
  stageName: string
  isDead?: boolean
}) {
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

  if (isDead) {
    return <span className="font-bold text-slate-900 dark:text-white text-lg">Питомец погиб</span>
  }

  if (editing) {
    return (
      <div className="flex items-center gap-2">
        <input
          type="text"
          value={name}
          onChange={e => setName(e.target.value)}
          maxLength={24}
          placeholder={stageName}
          className="font-bold text-lg border-b-2 border-indigo-400 bg-transparent text-slate-900 dark:text-white outline-none w-40"
          autoFocus
          onKeyDown={e => {
            if (e.key === 'Enter') handleSave()
            if (e.key === 'Escape') setEditing(false)
          }}
        />
        <button
          onClick={handleSave}
          disabled={saving}
          className="text-sm text-indigo-500 font-semibold hover:text-indigo-700 disabled:opacity-50"
        >
          {saving ? '...' : 'OK'}
        </button>
        <button
          onClick={() => setEditing(false)}
          className="text-sm text-slate-400 hover:text-slate-600"
        >
          ✕
        </button>
      </div>
    )
  }

  return (
    <button
      onClick={() => setEditing(true)}
      title="Нажми, чтобы дать имя питомцу"
      className="font-bold text-slate-900 dark:text-white text-lg hover:text-indigo-500 dark:hover:text-indigo-400 transition-colors text-left group"
    >
      {displayName}
      <span
        className="material-symbols-outlined ml-1 opacity-0 group-hover:opacity-40 transition-opacity align-middle"
        style={{ fontSize: '14px' }}
      >
        edit
      </span>
    </button>
  )
}
