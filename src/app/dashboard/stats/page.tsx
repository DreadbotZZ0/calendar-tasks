import { getHabits, getCompletions } from '../actions'

function localDateStr(date: Date): string {
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, '0'),
    String(date.getDate()).padStart(2, '0'),
  ].join('-')
}

export default async function StatsPage() {
  const habits = await getHabits()

  const today = new Date()
  
  const thirtyDaysAgo = new Date(today)
  thirtyDaysAgo.setDate(today.getDate() - 29)
  const startStr = localDateStr(thirtyDaysAgo)

  // Позволяем захватить до 7 дней вперед, чтобы учесть отметки, проставленные наперед на текущей неделе
  const futureDate = new Date(today)
  futureDate.setDate(today.getDate() + 7)
  const endStr = localDateStr(futureDate)

  const completions = await getCompletions(startStr, endStr)

  // Per-habit completion counts
  const completionsByHabit = new Map<string, number>()
  for (const c of completions) {
    completionsByHabit.set(c.habit_id, (completionsByHabit.get(c.habit_id) ?? 0) + 1)
  }

  // Streak calculation
  const completedDates = new Set(completions.map(c => c.date))
  let currentStreak = 0
  const cursor = new Date(today)
  while (completedDates.has(localDateStr(cursor))) {
    currentStreak++
    cursor.setDate(cursor.getDate() - 1)
  }

  // Best streak
  let bestStreak = 0
  let tempStreak = 0
  const allDates: string[] = []
  for (let i = 0; i < 30; i++) {
    const d = new Date(thirtyDaysAgo)
    d.setDate(thirtyDaysAgo.getDate() + i)
    allDates.push(localDateStr(d))
  }
  for (const dateStr of allDates) {
    if (completedDates.has(dateStr)) {
      tempStreak++
      if (tempStreak > bestStreak) bestStreak = tempStreak
    } else {
      tempStreak = 0
    }
  }

  // Last 4 weeks stats
  const weeks: { label: string; rate: number }[] = []
  for (let w = 3; w >= 0; w--) {
    const weekStart = new Date(today)
    weekStart.setDate(today.getDate() - today.getDay() + 1 - w * 7)
    if (today.getDay() === 0) weekStart.setDate(weekStart.getDate() - 7)
    const weekEnd = new Date(weekStart)
    weekEnd.setDate(weekStart.getDate() + 6)

    const weekDays = 7
    let completed = 0
    for (let i = 0; i < 7; i++) {
      const d = new Date(weekStart)
      d.setDate(weekStart.getDate() + i)
      const ds = localDateStr(d)
      if (completedDates.has(ds)) completed++
    }

    const endDay = weekEnd.getDate()
    const months = ['янв', 'фев', 'мар', 'апр', 'мая', 'июн', 'июл', 'авг', 'сен', 'окт', 'ноя', 'дек']
    const label = w === 0 ? 'Эта неделя' : `${weekStart.getDate()} ${months[weekStart.getMonth()]} — ${endDay} ${months[weekEnd.getMonth()]}`
    weeks.push({ label, rate: weekDays > 0 ? Math.round((completed / weekDays) * 100) : 0 })
  }

  const totalCompletions = completions.length
  const maxPossible = habits.length * 30

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Статистика</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">Последние 30 дней</p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700 text-center">
          <div className="text-3xl font-bold text-slate-900 dark:text-white">{totalCompletions}</div>
          <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">Отметок за 30 дней</div>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700 text-center">
          <div className="text-3xl font-bold text-orange-500">{currentStreak}</div>
          <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">Дней подряд сейчас</div>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700 text-center">
          <div className="text-3xl font-bold text-[var(--color-primary-container)]">{bestStreak}</div>
          <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">Лучшая серия</div>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700 text-center">
          <div className="text-3xl font-bold text-green-500">
            {maxPossible > 0 ? Math.round((totalCompletions / maxPossible) * 100) : 0}%
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">Общий % выполнения</div>
        </div>
      </div>

      {/* Weekly chart */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
        <h2 className="font-bold text-slate-800 dark:text-white mb-6">По неделям</h2>
        <div className="space-y-4">
          {weeks.map((week, i) => (
            <div key={i} className="space-y-1">
              <div className="flex justify-between text-sm">
                <span className="text-slate-600 dark:text-slate-300 font-medium">{week.label}</span>
                <span className="text-slate-500 dark:text-slate-400">{week.rate}%</span>
              </div>
              <div className="h-3 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-700 ${i === 3 ? 'bg-[var(--color-primary-container)]' : 'bg-slate-300 dark:bg-slate-500'}`}
                  style={{ width: `${week.rate}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Per-habit stats */}
      {habits.length > 0 && (
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
          <h2 className="font-bold text-slate-800 dark:text-white mb-6">По привычкам</h2>
          <div className="space-y-5">
            {habits.map(habit => {
              const count = completionsByHabit.get(habit.id) ?? 0
              const rate = Math.round((count / 30) * 100)
              return (
                <div key={habit.id} className="space-y-1.5">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${habit.color} shrink-0`} />
                      <span className="text-slate-700 dark:text-slate-200 font-medium">
                        {habit.emoji && <span className="mr-1">{habit.emoji}</span>}
                        {habit.title}
                      </span>
                    </div>
                    <span className="text-slate-500 dark:text-slate-400">{count} / 30 дней · {rate}%</span>
                  </div>
                  <div className="h-2.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${habit.color} rounded-full transition-all duration-700`}
                      style={{ width: `${rate}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {habits.length === 0 && (
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-12 text-center">
          <span className="material-symbols-outlined text-5xl text-slate-300 dark:text-slate-600">bar_chart</span>
          <p className="mt-4 text-slate-500 dark:text-slate-400">Добавь привычки, чтобы видеть статистику.</p>
        </div>
      )}
    </div>
  )
}
