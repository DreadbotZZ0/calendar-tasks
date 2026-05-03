'use server'

import { createClient } from '@/utils/supabase/server'
import { createAdminClient } from '@/utils/supabase/admin'
import { revalidatePath } from 'next/cache'

const TZ = 'Asia/Almaty'

function secondsUntilNextTime(timeStr: string): number {
  const now = new Date()
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: TZ, hour: '2-digit', minute: '2-digit', hour12: false,
  })
  const parts = formatter.formatToParts(now)
  const currentHour = parseInt(parts.find(p => p.type === 'hour')!.value)
  const currentMin = parseInt(parts.find(p => p.type === 'minute')!.value)
  const [targetHour, targetMin] = timeStr.split(':').map(Number)
  let seconds = ((targetHour - currentHour) * 60 + (targetMin - currentMin)) * 60
  if (seconds <= 0) seconds += 86400
  return seconds
}

export async function getHabits() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data, error } = await supabase
    .from('habits')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: true })

  if (error) {
    console.error('Error fetching habits:', error)
    return []
  }

  return data
}

export async function getCompletions(startDate: string, endDate: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data, error } = await supabase
    .from('completions')
    .select('*')
    .eq('user_id', user.id)
    .gte('date', startDate)
    .lte('date', endDate)

  if (error) {
    console.error('Error fetching completions:', error)
    return []
  }

  return data
}

export async function toggleCompletion(habitId: string, date: string, isCompleted: boolean) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  if (isCompleted) {
    // Delete completion
    const { error } = await supabase
      .from('completions')
      .delete()
      .match({ habit_id: habitId, date: date, user_id: user.id })
    if (error) return { error: error.message }
  } else {
    // Add completion
    const { error } = await supabase
      .from('completions')
      .insert({ habit_id: habitId, date: date, user_id: user.id })
    if (error) return { error: error.message }
  }

  revalidatePath('/dashboard')
  return { success: true }
}

export async function updateDisplayName(displayName: string, emoji?: string | null) {
  const supabase = await createClient()
  const { error } = await supabase.auth.updateUser({
    data: { display_name: displayName.trim(), display_emoji: emoji ?? null }
  })
  if (error) return { error: error.message }
  revalidatePath('/dashboard')
  revalidatePath('/dashboard/settings')
  return { success: true }
}

export async function uploadAvatar(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const file = formData.get('avatar') as File
  if (!file || !file.size) return { error: 'Файл не выбран' }
  if (file.size > 2 * 1024 * 1024) return { error: 'Файл слишком большой (макс 2 МБ)' }

  const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg'
  const path = `${user.id}.${ext}`

  const { error: uploadError } = await supabase.storage
    .from('avatars')
    .upload(path, file, { upsert: true, contentType: file.type })

  if (uploadError) return { error: uploadError.message }

  const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(path)

  const { error: updateError } = await supabase.auth.updateUser({
    data: { avatar_url: publicUrl }
  })

  if (updateError) return { error: updateError.message }

  revalidatePath('/dashboard')
  revalidatePath('/dashboard/settings')
  return { success: true, url: publicUrl }
}

export async function deleteAvatar() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const extensions = ['jpg', 'jpeg', 'png', 'webp']
  for (const ext of extensions) {
    await supabase.storage.from('avatars').remove([`${user.id}.${ext}`])
  }

  const { error } = await supabase.auth.updateUser({ data: { avatar_url: null } })
  if (error) return { error: error.message }

  revalidatePath('/dashboard')
  revalidatePath('/dashboard/settings')
  return { success: true }
}

const PLAN_PRODUCT_IDS: Record<string, string> = {
  basic: '2jcg5ZAW32iLGtkfMe8ZPA==',
  pro: 'f0cLBqj46i4YEcIsv3PhBg==',
}

async function checkGumroadActive(licenseKey: string, plan: string): Promise<boolean> {
  const productId = PLAN_PRODUCT_IDS[plan]
  if (!productId) return false
  try {
    const res = await fetch('https://api.gumroad.com/v2/licenses/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        product_id: productId,
        license_key: licenseKey,
        increment_uses_count: 'false',
      }),
    })
    const data = await res.json()
    if (!data.success) return false
    const p = data.purchase
    return !p.subscription_cancelled_at && !p.subscription_ended_at && !p.refunded && !p.chargebacked
  } catch {
    return true // Gumroad API down — benefit of the doubt
  }
}

export async function getLicense() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data } = await supabase
    .from('licenses')
    .select('*')
    .eq('user_id', user.id)
    .single()

  if (!data) return null

  // Auto-verify when expires_at is within 3 days or already past
  if (data.expires_at && data.license_key && data.plan) {
    const threeDaysFromNow = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000)
    if (new Date(data.expires_at) <= threeDaysFromNow) {
      const isActive = await checkGumroadActive(data.license_key, data.plan)
      if (isActive) {
        const newExpiresAt = new Date(Date.now() + 31 * 24 * 60 * 60 * 1000).toISOString()
        await supabase
          .from('licenses')
          .update({ expires_at: newExpiresAt })
          .eq('user_id', user.id)
        data.expires_at = newExpiresAt
      }
    }
  }

  return data
}

export async function activateLicense(licenseKey: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const { data: existing } = await supabase
    .from('licenses')
    .select('id, plan')
    .eq('user_id', user.id)
    .single()

  if (existing?.plan === 'pro') return { error: 'Pro уже активирован на этом аккаунте.' }

  const PRODUCTS = [
    { product_id: '2jcg5ZAW32iLGtkfMe8ZPA==', plan: 'basic' },
    { product_id: 'f0cLBqj46i4YEcIsv3PhBg==', plan: 'pro' },
  ]

  let plan: string | null = null
  for (const product of PRODUCTS) {
    const res = await fetch('https://api.gumroad.com/v2/licenses/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        product_id: product.product_id,
        license_key: licenseKey.trim(),
        increment_uses_count: 'true',
      }),
    })
    const result = await res.json()
    if (result.success) {
      plan = product.plan
      break
    }
  }

  if (!plan) {
    return { error: 'Недействительный ключ. Проверь правильность ввода.' }
  }

  const expiresAt = new Date(Date.now() + 31 * 24 * 60 * 60 * 1000).toISOString()

  const { error } = await supabase
    .from('licenses')
    .upsert({ user_id: user.id, license_key: licenseKey.trim(), plan, expires_at: expiresAt }, { onConflict: 'user_id' })

  if (error) return { error: error.message }

  revalidatePath('/dashboard/settings')
  revalidatePath('/dashboard')
  return { success: true, plan }
}

export async function addHabit(title: string, color: string = 'bg-indigo-500', emoji: string | null = null) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const { data: license } = await supabase
    .from('licenses')
    .select('plan, expires_at')
    .eq('user_id', user.id)
    .single()

  const isExpired = license?.expires_at ? new Date(license.expires_at) < new Date() : false
  if (!license || isExpired) {
    return { error: 'Требуется подписка. Приобрети план для добавления привычек.' }
  }

  if (license.plan !== 'pro') {
    const { count, error: countError } = await supabase
      .from('habits')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)

    if (countError) return { error: countError.message }
    if (count !== null && count >= 5) {
      return { error: 'В Базовом плане доступно до 5 привычек. Перейди на Pro для безлимитного доступа.' }
    }
  }

  const { error } = await supabase
    .from('habits')
    .insert({ title, color, emoji, user_id: user.id })

  if (error) return { error: error.message }

  revalidatePath('/dashboard')
  return { success: true }
}

export async function updateHabit(habitId: string, title: string, color: string, emoji: string | null = null) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const { error } = await supabase
    .from('habits')
    .update({ title, color, emoji })
    .match({ id: habitId, user_id: user.id })

  if (error) return { error: error.message }
  revalidatePath('/dashboard/habits')
  revalidatePath('/dashboard')
  return { success: true }
}

export async function deleteHabit(habitId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const { error } = await supabase
    .from('habits')
    .delete()
    .match({ id: habitId, user_id: user.id })

  if (error) return { error: error.message }

  revalidatePath('/dashboard')
  return { success: true }
}

export async function getTelegramConnection() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  const admin = createAdminClient()
  const { data } = await admin
    .from('telegram_connections')
    .select('chat_id, notify_time')
    .eq('user_id', user.id)
    .single()
  return data
}

export async function setNotifyTime(notifyTime: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const { data: conn } = await supabase
    .from('telegram_connections')
    .select('chat_id, qstash_message_id')
    .eq('user_id', user.id)
    .single()

  if (!conn) return { error: 'Telegram не подключён' }

  if (conn.qstash_message_id) {
    await fetch(`https://qstash.upstash.io/v2/messages/${conn.qstash_message_id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${process.env.QSTASH_TOKEN}` },
    }).catch(() => null)
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL!
  const delay = secondsUntilNextTime(notifyTime)
  const res = await fetch(`https://qstash.upstash.io/v2/publish/${appUrl}/api/telegram/notify`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.QSTASH_TOKEN}`,
      'Content-Type': 'application/json',
      'Upstash-Delay': `${delay}s`,
    },
    body: JSON.stringify({ userId: user.id, notifyTime }),
  })

  const data = await res.json()
  await supabase
    .from('telegram_connections')
    .update({ notify_time: notifyTime, qstash_message_id: data.messageId ?? null })
    .eq('user_id', user.id)

  revalidatePath('/dashboard/settings')
  return { success: true }
}

export async function disconnectTelegram() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const admin = createAdminClient()

  const { data: conn } = await supabase
    .from('telegram_connections')
    .select('qstash_message_id')
    .eq('user_id', user.id)
    .single()

  if (conn?.qstash_message_id) {
    await fetch(`https://qstash.upstash.io/v2/messages/${conn.qstash_message_id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${process.env.QSTASH_TOKEN}` },
    }).catch(() => null)
  }

  // Cancel all reminder QStash messages
  const { data: reminders } = await admin
    .from('telegram_reminders')
    .select('qstash_message_id')
    .eq('user_id', user.id)
    .not('qstash_message_id', 'is', null)

  if (reminders) {
    await Promise.all(reminders.map(r =>
      fetch(`https://qstash.upstash.io/v2/messages/${r.qstash_message_id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${process.env.QSTASH_TOKEN}` },
      }).catch(() => null)
    ))
  }

  await admin.from('telegram_reminders').delete().eq('user_id', user.id)
  await supabase.from('telegram_connections').delete().eq('user_id', user.id)
  revalidatePath('/dashboard/settings')
  revalidatePath('/dashboard')
  return { success: true }
}

export async function getTelegramReminders() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []
  const admin = createAdminClient()
  const { data } = await admin
    .from('telegram_reminders')
    .select('id, habit_id, notify_time, is_recurring, habits(title, emoji)')
    .eq('user_id', user.id)
    .order('created_at', { ascending: true })
  return (data ?? []) as unknown as {
    id: string
    habit_id: string | null
    notify_time: string
    is_recurring: boolean
    habits: { title: string; emoji?: string | null }[] | null
  }[]
}

export async function addReminder(habitId: string | null, notifyTime: string, isRecurring: boolean) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const { data: license } = await supabase
    .from('licenses')
    .select('plan, expires_at')
    .eq('user_id', user.id)
    .single()
  const isExpiredR = license?.expires_at ? new Date(license.expires_at) < new Date() : false
  if (license?.plan !== 'pro' || isExpiredR) return { error: 'Требуется активная Pro подписка' }

  const admin = createAdminClient()
  const { data: conn } = await admin
    .from('telegram_connections')
    .select('chat_id')
    .eq('user_id', user.id)
    .single()
  if (!conn) return { error: 'Telegram не подключён' }

  const { data: reminder, error: insertError } = await admin
    .from('telegram_reminders')
    .insert({ user_id: user.id, habit_id: habitId || null, notify_time: notifyTime, is_recurring: isRecurring })
    .select('id')
    .single()
  if (insertError || !reminder) return { error: insertError?.message ?? 'Ошибка создания' }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL!
  const delay = secondsUntilNextTime(notifyTime)
  const res = await fetch(`https://qstash.upstash.io/v2/publish/${appUrl}/api/telegram/notify`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.QSTASH_TOKEN}`,
      'Content-Type': 'application/json',
      'Upstash-Delay': `${delay}s`,
    },
    body: JSON.stringify({ userId: user.id, reminderId: reminder.id }),
  })
  const qdata = await res.json()

  if (qdata.messageId) {
    await admin
      .from('telegram_reminders')
      .update({ qstash_message_id: qdata.messageId })
      .eq('id', reminder.id)
  }

  revalidatePath('/dashboard')
  return { success: true }
}

export async function deleteReminder(reminderId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const admin = createAdminClient()
  const { data: reminder } = await admin
    .from('telegram_reminders')
    .select('qstash_message_id')
    .eq('id', reminderId)
    .eq('user_id', user.id)
    .single()

  if (reminder?.qstash_message_id) {
    await fetch(`https://qstash.upstash.io/v2/messages/${reminder.qstash_message_id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${process.env.QSTASH_TOKEN}` },
    }).catch(() => null)
  }

  await admin.from('telegram_reminders').delete().eq('id', reminderId).eq('user_id', user.id)
  revalidatePath('/dashboard')
  return { success: true }
}
