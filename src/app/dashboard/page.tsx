import { createClient } from '@/utils/supabase/server'
import { getHabits, getCompletions } from './actions'
import HabitsTable from './HabitsTable'
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
  const name = user?.email?.split('@')[0] || 'Арон'

  const dates = getWeekDates(weekOffset)
  const startDate = dates[0].dateString
  const endDate = dates[6].dateString

  const habits = await getHabits()
  const completions = await getCompletions(startDate, endDate)

  const weekLabel = buildWeekLabel(dates)
  const totalCompleted = completions.length

  // Streak always from today backwards (not from viewed week)
  const today = todayInTZ()
  const todayStr = localDateStr(today)
  const thirtyDaysAgo = new Date(today)
  thirtyDaysAgo.setDate(today.getDate() - 30)

  const allCompletionsForStreak = await getCompletions(localDateStr(thirtyDaysAgo), todayStr)
  const completedDates = new Set(allCompletionsForStreak.map(c => c.date))

  let streak = 0
  const cursor = new Date(today)
  
  // Если сегодня еще не отмечено, проверяем, была ли отметка вчера.
  // Серия не прерывается, пока не пропущен весь сегодняшний день.
  if (!completedDates.has(localDateStr(cursor))) {
    cursor.setDate(cursor.getDate() - 1)
  }

  while (completedDates.has(localDateStr(cursor))) {
    streak++
    cursor.setDate(cursor.getDate() - 1)
  }

  const isCurrentWeek = weekOffset === 0

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
        <Link
          href={`/dashboard?week=${weekOffset - 1}`}
          className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg text-slate-500 dark:text-slate-400 transition-colors"
        >
          <span className="material-symbols-outlined">chevron_left</span>
        </Link>

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
      <HabitsTable initialHabits={habits} initialCompletions={completions} dates={dates} />

      {/* Bottom Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center text-xl">
            🔥
          </div>
          <div>
            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Текущая серия</p>
            <p className="text-lg font-bold text-slate-900 dark:text-white">
              {streak} {streak === 1 ? 'день' : streak < 5 ? 'дня' : 'дней'} подряд
            </p>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">прошедших дней</p>
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
