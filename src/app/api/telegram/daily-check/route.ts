import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/utils/supabase/admin'

const TZ = 'Asia/Almaty'
const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN!
const APP_URL = process.env.NEXT_PUBLIC_APP_URL!

function todayInAlmaty(): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: TZ }).format(new Date())
}

async function sendTelegram(chatId: string, text: string) {
  await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: chatId,
      text,
      parse_mode: 'HTML',
      reply_markup: {
        inline_keyboard: [[{ text: '🌿 Открыть дашборд', url: `${APP_URL}/dashboard` }]],
      },
    }),
  })
}

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization')
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const admin = createAdminClient()
  const today = todayInAlmaty()

  const { data: connections } = await admin
    .from('telegram_connections')
    .select('user_id, chat_id')

  if (!connections?.length) return NextResponse.json({ ok: true, processed: 0 })

  let processed = 0
  for (const conn of connections) {
    try {
      const { data: habits } = await admin
        .from('habits')
        .select('id')
        .eq('user_id', conn.user_id)

      if (!habits?.length) continue

      const { data: completions } = await admin
        .from('completions')
        .select('id')
        .eq('user_id', conn.user_id)
        .eq('date', today)

      const hasCompletionsToday = (completions?.length ?? 0) > 0

      const { data: ps } = await admin
        .from('plant_state')
        .select('state, pet_name')
        .eq('user_id', conn.user_id)
        .single()

      const currentState = ps?.state ?? 'healthy'
      const name = ps?.pet_name ? `<b>${ps.pet_name}</b>` : 'Ваш питомец'

      if (hasCompletionsToday) {
        if (currentState === 'warning_sent' || currentState === 'dead') {
          await admin
            .from('plant_state')
            .upsert(
              { user_id: conn.user_id, state: 'healthy', updated_at: new Date().toISOString() },
              { onConflict: 'user_id' }
            )
          if (currentState === 'dead') {
            await sendTelegram(
              conn.chat_id,
              `🌱 ${name} начинает возрождаться! Продолжай отмечать привычки каждый день — и он снова расцветёт.`
            )
          }
        }
      } else {
        if (currentState === 'healthy') {
          await admin
            .from('plant_state')
            .upsert(
              { user_id: conn.user_id, state: 'warning_sent', updated_at: new Date().toISOString() },
              { onConflict: 'user_id' }
            )
          await sendTelegram(
            conn.chat_id,
            `😰 ${name} умирает...\n\nСегодня ты ещё не отметил ни одной привычки. Успей до конца дня — иначе завтра будет поздно!`
          )
        } else if (currentState === 'warning_sent') {
          await admin
            .from('plant_state')
            .upsert(
              { user_id: conn.user_id, state: 'dead', updated_at: new Date().toISOString() },
              { onConflict: 'user_id' }
            )
          await sendTelegram(
            conn.chat_id,
            `💀 ${name} погиб...\n\nДва дня без привычек — и он не выдержал. Но всё не потеряно: начни снова, и он возродится с нуля!`
          )
        }
      }

      processed++
    } catch (e) {
      console.error(`daily-check error for user ${conn.user_id}:`, e)
    }
  }

  return NextResponse.json({ ok: true, processed })
}
