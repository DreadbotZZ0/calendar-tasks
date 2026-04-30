import { createClient } from '@/utils/supabase/server'
import { getHabits, getCompletions } from './actions'
import HabitsTable from './HabitsTable'

// Helper to get dates for the current week (Monday to Sunday)
function getCurrentWeekDates() {
  const today = new Date()
  const day = today.getDay()
  // Adjust so Monday is 0, Sunday is 6
  const diff = today.getDate() - day + (day === 0 ? -6 : 1) 
  
  const monday = new Date(today.setDate(diff))
  
  const dates = []
  const dayNames = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс']
  const monthNames = ['янв', 'фев', 'мар', 'апр', 'мая', 'июн', 'июл', 'авг', 'сен', 'окт', 'ноя', 'дек']
  
  for (let i = 0; i < 7; i++) {
    const d = new Date(monday)
    d.setDate(monday.getDate() + i)
    dates.push({
      date: d,
      dateString: d.toISOString().split('T')[0],
      dayName: dayNames[i],
      dayNumber: d.getDate().toString(),
      monthName: monthNames[d.getMonth()]
    })
  }
  return dates
}

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const name = user?.email?.split('@')[0] || 'Арон'

  const dates = getCurrentWeekDates()
  const startDate = dates[0].dateString
  const endDate = dates[6].dateString

  const habits = await getHabits()
  const completions = await getCompletions(startDate, endDate)

  const monthName = dates[0].monthName
  const endMonthName = dates[6].monthName
  const weekLabel = `${dates[0].dayNumber} ${monthName} — ${dates[6].dayNumber} ${endMonthName}`

  // Stats calculation
  const totalCompleted = completions.length
  let streak = 0
  
  // Calculate streak backwards from today
  const todayStr = new Date().toISOString().split('T')[0]
  const allCompletionsForStreak = await getCompletions(
    new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0], 
    todayStr
  )
  // simple streak calculation (ignoring missing habits for now, just counting days with at least 1 completion)
  const completedDates = new Set(allCompletionsForStreak.map(c => c.date))
  let d = new Date()
  while (true) {
    if (completedDates.has(d.toISOString().split('T')[0])) {
      streak++
      d.setDate(d.getDate() - 1)
    } else {
      break
    }
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Top Bar */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Доброе утро, {name}!</h1>
          <p className="text-slate-500 mt-1">Сегодня: {new Date().toLocaleDateString('ru-RU')}</p>
        </div>
      </div>

      {/* Week Navigation */}
      <div className="flex items-center justify-between bg-white p-2 rounded-xl shadow-sm border border-slate-200">
        <button className="p-2 hover:bg-slate-100 rounded-lg text-slate-500 transition-colors">
          <span className="material-symbols-outlined">chevron_left</span>
        </button>
        <div className="font-semibold text-slate-700">
          {weekLabel}
        </div>
        <div className="flex items-center gap-2">
          <button className="px-3 py-1.5 text-sm font-medium bg-indigo-100 text-[var(--color-primary-container)] rounded-md hover:bg-indigo-200 transition-colors hidden sm:block">
            Сегодня
          </button>
          <button className="p-2 hover:bg-slate-100 rounded-lg text-slate-500 transition-colors">
            <span className="material-symbols-outlined">chevron_right</span>
          </button>
        </div>
      </div>

      {/* Habit Tracker Table */}
      <HabitsTable initialHabits={habits} initialCompletions={completions} dates={dates} />

      {/* Bottom Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center text-xl">
            🔥
          </div>
          <div>
            <p className="text-sm text-slate-500 font-medium">Текущая серия</p>
            <p className="text-lg font-bold text-slate-900">{streak} дней</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-xl">
            ⭐
          </div>
          <div>
            <p className="text-sm text-slate-500 font-medium">Отмечено за неделю</p>
            <p className="text-lg font-bold text-slate-900">{totalCompleted} галочек</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center text-xl">
            📈
          </div>
          <div>
            <p className="text-sm text-slate-500 font-medium">Всего привычек</p>
            <p className="text-lg font-bold text-slate-900">{habits.length}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
