'use client'

import { useState } from 'react'
import { disconnectTelegram } from '../actions'

const BOT_USERNAME = process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME

export default function TelegramSection({
  userId,
  connected,
}: {
  userId: string
  connected: boolean
}) {
  const [disconnecting, setDisconnecting] = useState(false)
  const [opened, setOpened] = useState(false)

  const botUrl = `https://t.me/${BOT_USERNAME}?start=${userId}`

  const handleDisconnect = async () => {
    if (!confirm('Отключить Telegram? Все напоминания будут удалены.')) return
    setDisconnecting(true)
    await disconnectTelegram()
    setDisconnecting(false)
  }

  if (!connected) {
    return (
      <div className="space-y-3">
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Подключи Telegram — настраивай напоминания прямо в дашборде.
        </p>
        <a
          href={botUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => setOpened(true)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-[#2AABEE] hover:bg-[#1a9bde] text-white text-sm font-medium rounded-lg transition-colors"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.562 8.248l-2.038 9.61c-.148.658-.537.818-1.084.508l-3-2.21-1.447 1.394c-.16.16-.295.295-.605.295l.213-3.053 5.56-5.023c.242-.213-.054-.333-.373-.12L7.09 14.309l-2.956-.924c-.643-.204-.657-.643.136-.953l11.552-4.453c.537-.194 1.006.131.74.269z" />
          </svg>
          Подключить Telegram
        </a>
        {opened ? (
          <button
            type="button"
            onClick={() => window.location.reload()}
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
            <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.562 8.248l-2.038 9.61c-.148.658-.537.818-1.084.508l-3-2.21-1.447 1.394c-.16.16-.295.295-.605.295l.213-3.053 5.56-5.023c.242-.213-.054-.333-.373-.12L7.09 14.309l-2.956-.924c-.643-.204-.657-.643.136-.953l11.552-4.453c.537-.194 1.006.131.74.269z" />
          </svg>
        </div>
        <div>
          <p className="font-semibold text-[#2AABEE] text-sm">Telegram подключён</p>
          <p className="text-xs text-slate-400">Настрой напоминания в дашборде</p>
        </div>
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
