import { NextRequest, NextResponse } from 'next/server'
import { Receiver } from '@upstash/qstash'
import { createAdminClient } from '@/utils/supabase/admin'

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN!
const APP_URL = process.env.NEXT_PUBLIC_APP_URL!

function secondsUntilNextTime(timeStr: string): number {
  const now = new Date()
  const tz = 'Asia/Almaty'
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: tz, hour: '2-digit', minute: '2-digit', hour12: false,
  })
  const parts = formatter.formatToParts(now)
  const currentHour = parseInt(parts.find(p => p.type === 'hour')!.value)
  const currentMin = parseInt(parts.find(p => p.type === 'minute')!.value)

  const [targetHour, targetMin] = timeStr.split(':').map(Number)

  let secondsUntil = ((targetHour - currentHour) * 60 + (targetMin - currentMin)) * 60
  if (secondsUntil <= 0) secondsUntil += 86400
  return secondsUntil
}

async function scheduleReminder(userId: string, reminderId: string, notifyTime: string) {
  const delay = secondsUntilNextTime(notifyTime)
  const res = await fetch(`https://qstash.upstash.io/v2/publish/${APP_URL}/api/telegram/notify`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.QSTASH_TOKEN}`,
      'Content-Type': 'application/json',
      'Upstash-Delay': `${delay}s`,
    },
    body: JSON.stringify({ userId, reminderId }),
  })
  const data = await res.json()
  return data.messageId as string | undefined
}

export async function POST(req: NextRequest) {
  const receiver = new Receiver({
    currentSigningKey: process.env.QSTASH_CURRENT_SIGNING_KEY!,
    nextSigningKey: process.env.QSTASH_NEXT_SIGNING_KEY!,
  })
  const body = await req.text()
  const isValid = await receiver.verify({
    signature: req.headers.get('Upstash-Signature') ?? '',
    body,
  }).catch(() => false)

  if (!isValid) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const payload = JSON.parse(body)
  const { userId } = payload
  const supabase = createAdminClient()

  // Per-habit reminder format
  if (payload.reminderId) {
    const { reminderId } = payload

    const { data: reminder } = await supabase
      .from('telegram_reminders')
      .select('id, habit_id, notify_time, is_recurring, habits(title, emoji)')
      .eq('id', reminderId)
      .eq('user_id', userId)
      .single()

    if (!reminder) return NextResponse.json({ ok: false })

    const { data: conn } = await supabase
      .from('telegram_connections')
      .select('chat_id')
      .eq('user_id', userId)
      .single()

    if (!conn) return NextResponse.json({ ok: false })

    let text: string
    const habitRow = Array.isArray(reminder.habits) ? reminder.habits[0] : reminder.habits
    if (reminder.habit_id && habitRow) {
      const h = habitRow as { title: string; emoji?: string | null }
      const habitLabel = `${h.emoji ? h.emoji + ' ' : ''}<b>${h.title}</b>`
      text = `🔔 Не забудь отметить: ${habitLabel}`
    } else {
      text = '🔥 <b>Привет!</b> Не забудь отметить свои привычки и задачи сегодня.'
    }

    await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: conn.chat_id,
        text,
        parse_mode: 'HTML',
        reply_markup: {
          inline_keyboard: [[{ text: '✅ Открыть дашборд', url: `${APP_URL}/dashboard` }]],
        },
      }),
    })

    if (reminder.is_recurring) {
      const messageId = await scheduleReminder(userId, reminderId, reminder.notify_time)
      if (messageId) {
        await supabase
          .from('telegram_reminders')
          .update({ qstash_message_id: messageId })
          .eq('id', reminderId)
      }
    } else {
      await supabase.from('telegram_reminders').delete().eq('id', reminderId)
    }

    return NextResponse.json({ ok: true })
  }

  // Legacy global notify format (userId + notifyTime)
  const { notifyTime } = payload

  const { data: conn } = await supabase
    .from('telegram_connections')
    .select('chat_id, notify_time')
    .eq('user_id', userId)
    .single()

  if (!conn) return NextResponse.json({ ok: false })

  await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: conn.chat_id,
      text: '🔥 <b>Привет!</b> Не забудь отметить свои привычки и задачи сегодня.',
      parse_mode: 'HTML',
      reply_markup: {
        inline_keyboard: [[{ text: '✅ Открыть дашборд', url: `${APP_URL}/dashboard` }]],
      },
    }),
  })

  const delay = secondsUntilNextTime(notifyTime)
  const res = await fetch(`https://qstash.upstash.io/v2/publish/${APP_URL}/api/telegram/notify`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.QSTASH_TOKEN}`,
      'Content-Type': 'application/json',
      'Upstash-Delay': `${delay}s`,
    },
    body: JSON.stringify({ userId, notifyTime }),
  })
  const data = await res.json()
  if (data.messageId) {
    await supabase
      .from('telegram_connections')
      .update({ qstash_message_id: data.messageId })
      .eq('user_id', userId)
  }

  return NextResponse.json({ ok: true })
}
