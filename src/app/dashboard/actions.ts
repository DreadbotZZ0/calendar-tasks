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

export async function addHabit(title: string, color: string = 'bg-indigo-500') {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const { error } = await supabase
    .from('habits')
    .insert({ title, color, user_id: user.id })

  if (error) return { error: error.message }

  revalidatePath('/dashboard')
  return { success: true }
}

export async function updateHabit(habitId: string, title: string, color: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const { error } = await supabase
    .from('habits')
    .update({ title, color })
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
