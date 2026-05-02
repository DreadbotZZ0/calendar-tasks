import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/utils/supabase/admin'

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN!

async function sendMessage(chatId: number, text: string) {
  await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: chatId, text, parse_mode: 'HTML' }),
  })
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const message = body.message
  if (!message) return NextResponse.json({ ok: true })

  const text: string = message.text || ''
  const chatId: number = message.chat.id

  if (text.startsWith('/start')) {
    const parts = text.split(' ')
    const userId = parts[1]?.trim()

    if (!userId) {
      await sendMessage(chatId, '👋 Привет! Открой настройки в приложении и нажми «Подключить Telegram».')
      return NextResponse.json({ ok: true })
    }

    const supabase = createAdminClient()
    const { error } = await supabase
      .from('telegram_connections')
      .upsert({ user_id: userId, chat_id: chatId }, { onConflict: 'user_id' })

    if (error) {
      await sendMessage(chatId, '❌ Ошибка подключения. Попробуй ещё раз.')
    } else {
      await sendMessage(
        chatId,
        '✅ <b>Telegram подключён!</b>\n\nТеперь зайди в Настройки → Уведомления и выбери удобное время.'
      )
    }
  }

  return NextResponse.json({ ok: true })
}
