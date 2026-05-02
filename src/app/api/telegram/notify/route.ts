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

async function scheduleNext(userId: string, notifyTime: string, notifyUrl: string) {
  const delay = secondsUntilNextTime(notifyTime)
  const res = await fetch(`https://qstash.upstash.io/v2/publish/${notifyUrl}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.QSTASH_TOKEN}`,
      'Content-Type': 'application/json',
      [`Upstash-Delay`]: `${delay}s`,
    },
    body: JSON.stringify({ userId, notifyTime }),
  })
  const data = await res.json()
  return data.messageId as string | undefined
}

export async function POST(req: NextRequest) {
  // Verify QStash signature
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

  const { userId, notifyTime } = JSON.parse(body)
  const supabase = createAdminClient()

  const { data: conn } = await supabase
    .from('telegram_connections')
    .select('chat_id, notify_time')
    .eq('user_id', userId)
    .single()

  if (!conn) return NextResponse.json({ ok: false })

  // Send notification
  await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: conn.chat_id,
      text: '🔥 <b>Привет!</b> Не забудь отметить свои привычки сегодня.',
      parse_mode: 'HTML',
      reply_markup: {
        inline_keyboard: [[{ text: '✅ Открыть дашборд', url: `${APP_URL}/dashboard` }]],
      },
    }),
  })

  // Reschedule for next day
  const notifyUrl = `${APP_URL}/api/telegram/notify`
  const messageId = await scheduleNext(userId, notifyTime, notifyUrl)
  if (messageId) {
    await supabase
      .from('telegram_connections')
      .update({ qstash_message_id: messageId })
      .eq('user_id', userId)
  }

  return NextResponse.json({ ok: true })
}
