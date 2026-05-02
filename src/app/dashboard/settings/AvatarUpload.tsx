'use client'

import { useRef, useState } from 'react'
import { uploadAvatar, deleteAvatar } from '../actions'

export default function AvatarUpload({
  currentUrl,
  name,
  emoji,
}: {
  currentUrl?: string | null
  name: string
  emoji?: string | null
}) {
  const [url, setUrl] = useState(currentUrl)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setLoading(true)
    setError('')
    const fd = new FormData()
    fd.append('avatar', file)
    const result = await uploadAvatar(fd)
    setLoading(false)
    if (result.error) {
      setError(result.error)
    } else if (result.url) {
      setUrl(result.url)
    }
    e.target.value = ''
  }

  const handleDelete = async () => {
    setLoading(true)
    setError('')
    const result = await deleteAvatar()
    setLoading(false)
    if (result.error) {
      setError(result.error)
    } else {
      setUrl(null)
    }
  }

  return (
    <div className="flex items-center gap-4">
      <button
        type="button"
        onClick={() => !loading && inputRef.current?.click()}
        className="relative w-16 h-16 rounded-full overflow-hidden bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center text-[var(--color-primary-container)] text-2xl font-bold group cursor-pointer shrink-0"
      >
        {url ? (
          <img src={url} alt="Аватар" className="w-full h-full object-cover" />
        ) : emoji ? (
          <span className="text-3xl">{emoji}</span>
        ) : (
          name.charAt(0).toUpperCase()
        )}
        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-full">
          <span className="material-symbols-outlined text-white text-[20px]">photo_camera</span>
        </div>
      </button>

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => !loading && inputRef.current?.click()}
          className="text-sm font-medium text-[var(--color-primary-container)] hover:underline disabled:opacity-50"
          disabled={loading}
        >
          {loading ? 'Загрузка...' : 'Сменить фото'}
        </button>

        {url && !loading && (
          <button
            type="button"
            onClick={handleDelete}
            className="text-sm font-medium text-red-500 hover:underline"
          >
            Удалить
          </button>
        )}
      </div>

      {error && <p className="text-xs text-red-500">{error}</p>}

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={handleChange}
      />
    </div>
  )
}
