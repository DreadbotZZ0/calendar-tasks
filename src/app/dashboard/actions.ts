'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

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

export async function getLicense() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data } = await supabase
    .from('licenses')
    .select('*')
    .eq('user_id', user.id)
    .single()

  return data
}

export async function activateLicense(licenseKey: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const { data: existing } = await supabase
    .from('licenses')
    .select('id')
    .eq('user_id', user.id)
    .single()

  if (existing) return { error: 'Pro уже активирован на этом аккаунте.' }

  const PRODUCTS = [
    { permalink: 'oxcbh', plan: 'basic' },
    { permalink: 'bzynnz', plan: 'pro' },
  ]

  let plan: string | null = null
  for (const product of PRODUCTS) {
    const res = await fetch('https://api.gumroad.com/v2/licenses/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        product_permalink: product.permalink,
        license_key: licenseKey.trim(),
        increment_uses_count: 'true',
      }),
    })
    const result = await res.json()
    console.log(`Gumroad [${product.permalink}]:`, JSON.stringify(result))
    if (result.success) {
      plan = product.plan
      break
    }
  }

  if (!plan) {
    return { error: 'Недействительный ключ. Проверь правильность ввода.' }
  }

  const { error } = await supabase
    .from('licenses')
    .insert({ user_id: user.id, license_key: licenseKey.trim(), plan })

  if (error) return { error: error.message }

  revalidatePath('/dashboard/settings')
  revalidatePath('/dashboard')
  return { success: true }
}

export async function addHabit(title: string, color: string = 'bg-indigo-500', emoji: string | null = null) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const { data: license } = await supabase
    .from('licenses')
    .select('plan')
    .eq('user_id', user.id)
    .single()

  if (!license) {
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
