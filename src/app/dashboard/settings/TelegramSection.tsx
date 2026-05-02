'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { setNotifyTime, disconnectTelegram } from '../actions'

const BOT_USERNAME = process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME

export default function TelegramSection({
  userId,
  connected,
  currentNotifyTime,
}: {
  userId: string
  connected: boolean
  currentNotifyTime?: string | null
}) {
  const [notifyTime, setNotifyTimeState] = useState(currentNotifyTime ?? '09:00')
  const [loading, setLoading] = useState(false)
  const [disconnecting, setDisconnecting] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')
  const [opened, setOpened] = useState(false)
  const router = useRouter()

  const botUrl = `https://t.me/${BOT_USERNAME}?start=${userId}`

  const handleSave = async () => {
    setLoading(true)
    setError('')
    const result = await setNotifyTime(notifyTime)
    setLoading(false)
    if (result.error) {
      setError(result.error)
    } else {
      setSaved(true)
      setTimeout(() => setSaved(false), 2500)
    }
  }

  const handleDisconnect = async () => {
    if (!confirm('Отключить Telegram? Уведомления перестанут приходить.')) return
    setDisconnecting(true)
    await disconnectTelegram()
    setDisconnecting(false)
  }

  if (!connected) {
    return (
      <div className="space-y-3">
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Подключи Telegram — бот будет напоминать об отметке привычек в выбранное время.
        </p>
        <a
          href={botUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => setOpened(true)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-[#2AABEE] hover:bg-[#1a9bde] text-white text-sm font-medium rounded-lg transition-colors"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.562 8.248l-2.038 9.61c-.148.658-.537.818-1.084.508l-3-2.21-1.447 1.394c-.16.16-.295.295-.605.295l.213-3.053 5.56-5.023c.242-.213-.054-.333-.373-.12L7.09 14.309l-2.956-.924c-.643-.204-.657-.643.136-.953l11.552-4.453c.537-.194 1.006.131.74.269z"/>
          </svg>
          Подключить Telegram
        </a>
        {opened ? (
          <button
            type="button"
            onClick={() => router.refresh()}
            className="inline-flex items-center gap-2 px-4 py-2 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 text-sm font-medium rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
          >
            ✓ Я нажал Start — проверить подключение
          </button>
        ) : (
          <p className="text-xs text-slate-400">
            После нажатия кнопки откроется бот — нажми <b>Start</b> и готово.
          </p>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-[#2AABEE]/20 flex items-center justify-center">
          <svg className="w-4 h-4 text-[#2AABEE]" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.562 8.248l-2.038 9.61c-.148.658-.537.818-1.084.508l-3-2.21-1.447 1.394c-.16.16-.295.295-.605.295l.213-3.053 5.56-5.023c.242-.213-.054-.333-.373-.12L7.09 14.309l-2.956-.924c-.643-.204-.657-.643.136-.953l11.552-4.453c.537-.194 1.006.131.74.269z"/>
          </svg>
        </div>
        <div>
          <p className="font-semibold text-[#2AABEE] text-sm">Telegram подключён</p>
          <p className="text-xs text-slate-400">Уведомления активны</p>
        </div>
      </div>

      <div className="space-y-2">
        <p className="text-sm font-medium text-slate-700 dark:text-slate-300">Время уведомления</p>
        <div className="flex gap-2 items-center">
          <input
            type="time"
            value={notifyTime}
            onChange={e => { setNotifyTimeState(e.target.value); setSaved(false) }}
            className="px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-container)]"
          />
          <button
            type="button"
            onClick={handleSave}
            disabled={loading}
            className="px-4 py-2 bg-[var(--color-primary-container)] text-white text-sm font-medium rounded-lg hover:bg-[var(--color-primary)] transition-colors disabled:opacity-50"
          >
            {loading ? 'Сохраняю...' : saved ? '✓ Сохранено' : 'Сохранить'}
          </button>
        </div>
        <p className="text-xs text-slate-400">По времени Алматы (UTC+5)</p>
        {error && <p className="text-xs text-red-500">{error}</p>}
      </div>

      <button
        type="button"
        onClick={handleDisconnect}
        disabled={disconnecting}
        className="text-sm text-red-500 hover:underline disabled:opacity-50"
      >
        {disconnecting ? 'Отключаю...' : 'Отключить Telegram'}
      </button>
    </div>
  )
}
