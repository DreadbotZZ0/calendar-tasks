import { getHabits, getCompletions, getLicense } from '../actions'
import Link from 'next/link'

const TZ = 'Asia/Almaty'

function localDateStr(date: Date): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: TZ }).format(date)
}

function todayInTZ(): Date {
  const str = localDateStr(new Date())
  return new Date(str + 'T00:00:00')
}

const DOW_NAME: Record<number, string> = { 1: 'Пн', 2: 'Вт', 3: 'Ср', 4: 'Чт', 5: 'Пт', 6: 'Сб', 0: 'Вс' }
const DOW_ORDER = [1, 2, 3, 4, 5, 6, 0]

function barColor(rate: number) {
  if (rate >= 70) return 'bg-green-500'
  if (rate >= 40) return 'bg-amber-400'
  return 'bg-red-400'
}

export default async function StatsPage() {
  const today = todayInTZ()

  const thirtyDaysAgo = new Date(today)
  thirtyDaysAgo.setDate(today.getDate() - 29)

  const ninetyDaysAgo = new Date(today)
  ninetyDaysAgo.setDate(today.getDate() - 89)

  const [habits, completions30, completions90, license] = await Promise.all([
    getHabits(),
    getCompletions(localDateStr(thirtyDaysAgo), localDateStr(today)),
    getCompletions(localDateStr(ninetyDaysAgo), localDateStr(today)),
    getLicense(),
  ])

  const isExpired = license?.expires_at ? new Date(license.expires_at) < new Date() : false
  const isPro = license?.plan === 'pro' && !isExpired

  // --- Existing stats (30 days) ---
  const completionsByHabit = new Map<string, number>()
  for (const c of completions30) {
    completionsByHabit.set(c.habit_id, (completionsByHabit.get(c.habit_id) ?? 0) + 1)
  }

  const completedDates30 = new Set(completions30.map(c => c.date))
  let currentStreak = 0
  const cursor = new Date(today)
  if (!completedDates30.has(localDateStr(cursor))) cursor.setDate(cursor.getDate() - 1)
  while (completedDates30.has(localDateStr(cursor))) {
    currentStreak++
    cursor.setDate(cursor.getDate() - 1)
  }

  let bestStreak = 0, tempStreak = 0
  for (let i = 0; i < 30; i++) {
    const d = new Date(thirtyDaysAgo)
    d.setDate(thirtyDaysAgo.getDate() + i)
    if (completedDates30.has(localDateStr(d))) {
      if (++tempStreak > bestStreak) bestStreak = tempStreak
    } else {
      tempStreak = 0
    }
  }

  const months = ['янв', 'фев', 'мар', 'апр', 'мая', 'июн', 'июл', 'авг', 'сен', 'окт', 'ноя', 'дек']
  const weeks: { label: string; rate: number }[] = []
  for (let w = 3; w >= 0; w--) {
    const weekStart = new Date(today)
    const dayOfWeek = today.getDay() === 0 ? 7 : today.getDay()
    weekStart.setDate(today.getDate() - (dayOfWeek - 1) - w * 7)
    const weekEnd = new Date(weekStart)
    weekEnd.setDate(weekStart.getDate() + 6)
    const ws = localDateStr(weekStart), we = localDateStr(weekEnd)
    const cnt = completions30.filter(c => c.date >= ws && c.date <= we).length
    const possible = habits.length * 7
    weeks.push({
      label: w === 0 ? 'Эта неделя' : `${weekStart.getDate()} ${months[weekStart.getMonth()]} — ${weekEnd.getDate()} ${months[weekEnd.getMonth()]}`,
      rate: possible > 0 ? Math.round(cnt / possible * 100) : 0,
    })
  }

  const totalCompletions = completions30.length
  const maxPossible = habits.length * 30

  // --- Pro: day-of-week analysis (90 days) ---
  const weekdayCompletions = new Array(7).fill(0)
  const weekdayOccurrences = new Array(7).fill(0)

  for (let i = 0; i < 90; i++) {
    const d = new Date(ninetyDaysAgo)
    d.setDate(ninetyDaysAgo.getDate() + i)
    weekdayOccurrences[d.getDay()]++
  }
  for (const c of completions90) {
    weekdayCompletions[new Date(c.date + 'T00:00:00').getDay()]++
  }

  const weekdayStats = DOW_ORDER.map(dow => ({
    name: DOW_NAME[dow],
    rate: weekdayOccurrences[dow] > 0 && habits.length > 0
      ? Math.round(weekdayCompletions[dow] / (habits.length * weekdayOccurrences[dow]) * 100)
      : 0,
  }))

  const maxDow = weekdayStats.reduce((a, b) => a.rate >= b.rate ? a : b, weekdayStats[0])
  const minDow = weekdayStats.reduce((a, b) => a.rate <= b.rate ? a : b, weekdayStats[0])

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
            {maxPossible > 0 ? Math.round(totalCompletions / maxPossible * 100) : 0}%
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">Общий % выполнения</div>
        </div>
      </div>

      {/* Day-of-week analysis — Pro */}
      {isPro ? (
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
          <div className="flex items-center gap-2 mb-1">
            <h2 className="font-bold text-slate-800 dark:text-white">По дням недели</h2>
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400">PRO</span>
          </div>
          <p className="text-xs text-slate-400 dark:text-slate-500 mb-6">
            Средний % выполнения привычек за последние 90 дней
          </p>

          {habits.length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-4">Добавь привычки, чтобы увидеть анализ.</p>
          ) : (
            <>
              <div className="space-y-3">
                {weekdayStats.map(({ name, rate }) => {
                  const isBest = name === maxDow.name && rate > 0
                  const isWorst = name === minDow.name && rate < 100 && weekdayStats.some(d => d.rate !== rate)
                  return (
                    <div key={name} className="flex items-center gap-3">
                      <span className="w-6 text-xs font-semibold text-slate-500 dark:text-slate-400 shrink-0">{name}</span>
                      <div className="flex-1 h-7 bg-slate-100 dark:bg-slate-700 rounded-lg overflow-hidden">
                        <div
                          className={`h-full ${barColor(rate)} rounded-lg transition-all duration-700 flex items-center justify-end pr-2`}
                          style={{ width: `${Math.max(rate, 4)}%` }}
                        />
                      </div>
                      <span className="w-10 text-right text-sm font-semibold text-slate-700 dark:text-slate-300 shrink-0">{rate}%</span>
                      {isBest && <span title="Лучший день">🏆</span>}
                      {!isBest && isWorst && <span title="Слабый день">😴</span>}
                      {!isBest && !isWorst && <span className="w-5" />}
                    </div>
                  )
                })}
              </div>
              <div className="mt-4 flex items-center gap-4 text-xs text-slate-400 dark:text-slate-500">
                <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm bg-green-500 inline-block" /> ≥70%</span>
                <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm bg-amber-400 inline-block" /> 40–70%</span>
                <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm bg-red-400 inline-block" /> &lt;40%</span>
              </div>
            </>
          )}
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 relative overflow-hidden">
          <div className="flex items-center gap-2 mb-4">
            <h2 className="font-bold text-slate-800 dark:text-white">По дням недели</h2>
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400">PRO</span>
          </div>
          {/* blurred preview */}
          <div className="space-y-3 blur-sm pointer-events-none select-none" aria-hidden>
            {['Пн','Вт','Ср','Чт','Пт','Сб','Вс'].map((name, i) => (
              <div key={name} className="flex items-center gap-3">
                <span className="w-6 text-xs font-semibold text-slate-400 shrink-0">{name}</span>
                <div className="flex-1 h-7 bg-slate-100 dark:bg-slate-700 rounded-lg overflow-hidden">
                  <div className="h-full bg-green-400 rounded-lg" style={{ width: `${[80,65,90,55,70,40,50][i]}%` }} />
                </div>
                <span className="w-10 text-right text-sm font-semibold text-slate-400 shrink-0">{[80,65,90,55,70,40,50][i]}%</span>
              </div>
            ))}
          </div>
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/70 dark:bg-slate-800/70 backdrop-blur-[2px]">
            <span className="material-symbols-outlined text-4xl text-slate-300 dark:text-slate-600 mb-2">lock</span>
            <p className="font-semibold text-slate-700 dark:text-slate-200 text-sm">Только для Pro</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 mb-3">Узнай в какие дни ты чаще всего сбиваешься</p>
            <Link
              href="/dashboard/settings"
              className="px-4 py-1.5 bg-[var(--color-primary-container)] text-white text-xs font-semibold rounded-lg hover:bg-[var(--color-primary)] transition-colors"
            >
              Перейти на Pro
            </Link>
          </div>
        </div>
      )}

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
      {habits.length > 0 ? (
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
          <h2 className="font-bold text-slate-800 dark:text-white mb-6">По привычкам</h2>
          <div className="space-y-5">
            {habits.map(habit => {
              const count = completionsByHabit.get(habit.id) ?? 0
              const rate = Math.round(count / 30 * 100)
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
                    <span className="text-slate-500 dark:text-slate-400">{count} / 30 · {rate}%</span>
                  </div>
                  <div className="h-2.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                    <div className={`h-full ${habit.color} rounded-full transition-all duration-700`} style={{ width: `${rate}%` }} />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-12 text-center">
          <span className="material-symbols-outlined text-5xl text-slate-300 dark:text-slate-600">bar_chart</span>
          <p className="mt-4 text-slate-500 dark:text-slate-400">Добавь привычки, чтобы видеть статистику.</p>
        </div>
      )}
    </div>
  )
}
