import { createClient } from '@/utils/supabase/server'
import { getHabits, getCompletions, getLicense, getTelegramConnection, getTelegramReminders, getPetState } from './actions'
import HabitsTable from './HabitsTable'
import TelegramReminders from './TelegramReminders'
import PlantWidget from './PlantWidget'
import Link from 'next/link'
import WeekPicker from './WeekPicker'

const TZ = 'Asia/Almaty'

function localDateStr(date: Date): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: TZ }).format(date)
}

// Returns a Date whose .getDate()/.getMonth()/.getFullYear() match today in Almaty
function todayInTZ(): Date {
  const str = localDateStr(new Date())
  return new Date(str + 'T00:00:00')
}

function getWeekDates(weekOffset: number) {
  const today = todayInTZ()
  const day = today.getDay()
  const diff = today.getDate() - day + (day === 0 ? -6 : 1)

  const monday = new Date(today)
  monday.setDate(diff + weekOffset * 7)

  const dates = []
  const dayNames = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс']
  const monthNames = ['янв', 'фев', 'мар', 'апр', 'мая', 'июн', 'июл', 'авг', 'сен', 'окт', 'ноя', 'дек']

  for (let i = 0; i < 7; i++) {
    const d = new Date(monday)
    d.setDate(monday.getDate() + i)
    dates.push({
      date: d,
      dateString: localDateStr(d),
      dayName: dayNames[i],
      dayNumber: d.getDate().toString(),
      monthName: monthNames[d.getMonth()],
      year: d.getFullYear(),
    })
  }
  return dates
}

function buildWeekLabel(dates: ReturnType<typeof getWeekDates>): string {
  const first = dates[0]
  const last = dates[6]
  const currentYear = new Date().getFullYear()

  const startPart = `${first.dayNumber} ${first.monthName}`
  const endYear = last.year !== currentYear ? ` ${last.year}` : ''
  const endPart = `${last.dayNumber} ${last.monthName}${endYear}`

  if (first.year !== currentYear) {
    return `${first.dayNumber} ${first.monthName} ${first.year} — ${endPart}`
  }
  return `${startPart} — ${endPart}`
}

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ week?: string }>
}) {
  const { week } = await searchParams
  const weekOffset = parseInt(week ?? '0', 10) || 0

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const name = (user?.user_metadata?.display_name as string | undefined) || user?.email?.split('@')[0] || 'Арон'

  const dates = getWeekDates(weekOffset)
  const startDate = dates[0].dateString
  const endDate = dates[6].dateString

  const [habits, completions, license, telegramConn, telegramReminders, petState] = await Promise.all([
    getHabits(),
    getCompletions(startDate, endDate),
    getLicense(),
    getTelegramConnection(),
    getTelegramReminders(),
    getPetState(),
  ])

  const weekLabel = buildWeekLabel(dates)
  const totalCompleted = completions.length

  // Streak always from today backwards (not from viewed week)
  const today = todayInTZ()
  const todayStr = localDateStr(today)
  const thirtyDaysAgo = new Date(today)
  thirtyDaysAgo.setDate(today.getDate() - 30)

  const allCompletionsForStreak = await getCompletions(localDateStr(thirtyDaysAgo), todayStr)

  // Per-habit streak calculation
  function calcStreak(habitId: string): number {
    const dates = new Set(
      allCompletionsForStreak.filter(c => c.habit_id === habitId).map(c => c.date)
    )
    let s = 0
    const cur = new Date(today)
    if (!dates.has(localDateStr(cur))) cur.setDate(cur.getDate() - 1)
    while (dates.has(localDateStr(cur))) { s++; cur.setDate(cur.getDate() - 1) }
    return s
  }

  const habitStreaks: Record<string, number> = {}
  for (const h of habits) habitStreaks[h.id] = calcStreak(h.id)

  const maxStreak = habits.length > 0 ? Math.max(...Object.values(habitStreaks)) : 0

  const isCurrentWeek = weekOffset === 0
  const isExpired = license?.expires_at ? new Date(license.expires_at) < new Date() : false
  const isPro = license?.plan === 'pro' && !isExpired

  // Count days where ALL habits were completed (1 perfect day = 1 point out of 30)
  const completionsByDate = new Map<string, Set<string>>()
  for (const c of allCompletionsForStreak) {
    if (!completionsByDate.has(c.date)) completionsByDate.set(c.date, new Set())
    completionsByDate.get(c.date)!.add(c.habit_id)
  }
  const perfectDays = [...completionsByDate.values()].filter(
    ids => habits.every(h => ids.has(h.id))
  ).length
  const plantPct = habits.length > 0 ? Math.min(100, Math.round(perfectDays / 30 * 100)) : 0
  const MAX_WEEK_BASIC = -4 // ~28 days back

  const canGoBack = isPro || weekOffset > MAX_WEEK_BASIC
  const historyLocked = !isPro && weekOffset < MAX_WEEK_BASIC

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Greeting — always visible */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
          Добро пожаловать, {name}!
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">
          Сегодня: {new Date().toLocaleDateString('ru-RU', { weekday: 'long', day: 'numeric', month: 'long', timeZone: TZ })}
        </p>
      </div>

      {/* Week Navigation */}
      <div className="flex items-center justify-between bg-white dark:bg-slate-800 p-2 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
        {canGoBack ? (
          <Link
            href={`/dashboard?week=${weekOffset - 1}`}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg text-slate-500 dark:text-slate-400 transition-colors"
          >
            <span className="material-symbols-outlined">chevron_left</span>
          </Link>
        ) : (
          <span className="p-2 rounded-lg text-slate-200 dark:text-slate-600 cursor-not-allowed">
            <span className="material-symbols-outlined">chevron_left</span>
          </span>
        )}

        {/* Clickable date label → mini calendar */}
        <WeekPicker weekOffset={weekOffset} weekLabel={weekLabel} />

        <div className="flex items-center gap-2">
          {weekOffset < 0 ? (
            <Link
              href={`/dashboard?week=${weekOffset + 1}`}
              className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg text-slate-500 dark:text-slate-400 transition-colors"
            >
              <span className="material-symbols-outlined">chevron_right</span>
            </Link>
          ) : (
            <span className="p-2 rounded-lg text-slate-200 dark:text-slate-600 cursor-not-allowed">
              <span className="material-symbols-outlined">chevron_right</span>
            </span>
          )}
        </div>
      </div>

      {/* Habit Tracker Table */}
      {historyLocked ? (
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-12 text-center space-y-4">
          <span className="material-symbols-outlined text-5xl text-slate-300 dark:text-slate-600">lock</span>
          <div>
            <p className="font-semibold text-slate-700 dark:text-slate-200">История за этот период недоступна</p>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Базовый план включает только последний месяц. Перейди на Pro для полной истории.</p>
          </div>
          <Link
            href="/dashboard/settings"
            className="inline-block px-6 py-2.5 bg-[var(--color-primary-container)] text-white text-sm font-medium rounded-lg hover:bg-[var(--color-primary)] transition-colors"
          >
            Перейти на Pro
          </Link>
        </div>
      ) : (
        <HabitsTable initialHabits={habits} initialCompletions={completions} dates={dates} habitStreaks={habitStreaks} />
      )}

      {/* Telegram Reminders — only for Pro + connected */}
      {isPro && telegramConn && (
        <TelegramReminders habits={habits} initialReminders={telegramReminders} />
      )}

      {/* Plant Widget */}
      <PlantWidget
        completionPct={plantPct}
        hasHabits={habits.length > 0}
        petState={petState?.state ?? 'healthy'}
        petName={petState?.pet_name ?? null}
      />

      {/* Bottom Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center text-xl">
            🔥
          </div>
          <div>
            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Макс. серия</p>
            <p className="text-lg font-bold text-slate-900 dark:text-white">
              {maxStreak} {maxStreak === 1 ? 'день' : maxStreak < 5 ? 'дня' : 'дней'} подряд
            </p>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">лучшая привычка</p>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-xl">
            ⭐
          </div>
          <div>
            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">
              {isCurrentWeek ? 'Отмечено за неделю' : 'Отмечено за эту неделю'}
            </p>
            <p className="text-lg font-bold text-slate-900 dark:text-white">{totalCompleted} галочек</p>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-xl">
            📈
          </div>
          <div>
            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Всего привычек</p>
            <p className="text-lg font-bold text-slate-900 dark:text-white">{habits.length}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
