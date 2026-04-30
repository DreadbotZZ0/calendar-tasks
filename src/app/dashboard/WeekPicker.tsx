'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

const MONTH_NAMES = [
  'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
  'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь',
]
const DAY_NAMES = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс']

function localDateStr(date: Date): string {
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, '0'),
    String(date.getDate()).padStart(2, '0'),
  ].join('-')
}

function getMondayOf(date: Date): Date {
  const d = new Date(date)
  d.setHours(0, 0, 0, 0)
  const dow = d.getDay()
  d.setDate(d.getDate() - dow + (dow === 0 ? -6 : 1))
  return d
}

function getWeekOffsetFromDate(targetDate: Date): number {
  const currentMonday = getMondayOf(new Date())
  const targetMonday = getMondayOf(targetDate)
  const diffMs = targetMonday.getTime() - currentMonday.getTime()
  return Math.round(diffMs / (7 * 24 * 60 * 60 * 1000))
}

function getCalendarDays(year: number, month: number): Date[] {
  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)

  const start = new Date(firstDay)
  const startDow = start.getDay()
  start.setDate(start.getDate() - startDow + (startDow === 0 ? -6 : 1))

  const end = new Date(lastDay)
  const endDow = end.getDay()
  if (endDow !== 0) end.setDate(end.getDate() + (7 - endDow))

  const days: Date[] = []
  const cursor = new Date(start)
  while (cursor <= end) {
    days.push(new Date(cursor))
    cursor.setDate(cursor.getDate() + 1)
  }
  return days
}

export default function WeekPicker({
  weekOffset,
  weekLabel,
}: {
  weekOffset: number
  weekLabel: string
}) {
  const router = useRouter()

  // Start calendar on the month of the currently viewed week
  const viewedMonday = getMondayOf(new Date())
  viewedMonday.setDate(viewedMonday.getDate() + weekOffset * 7)
  const viewedMondayStr = localDateStr(viewedMonday)

  const [open, setOpen] = useState(false)
  const [calYear, setCalYear] = useState(viewedMonday.getFullYear())
  const [calMonth, setCalMonth] = useState(viewedMonday.getMonth())

  const days = getCalendarDays(calYear, calMonth)
  const todayStr = localDateStr(new Date())

  const navigate = (day: Date) => {
    const offset = getWeekOffsetFromDate(day)
    router.push(offset === 0 ? '/dashboard' : `/dashboard?week=${offset}`)
    setOpen(false)
  }

  const prevMonth = () => {
    if (calMonth === 0) { setCalMonth(11); setCalYear(y => y - 1) }
    else setCalMonth(m => m - 1)
  }

  const nextMonth = () => {
    if (calMonth === 11) { setCalMonth(0); setCalYear(y => y + 1) }
    else setCalMonth(m => m + 1)
  }

  return (
    <div className="relative">
      {/* Trigger button */}
      <button
        onClick={() => setOpen(v => !v)}
        className="flex items-center gap-1.5 font-semibold text-slate-700 dark:text-slate-200 hover:text-[var(--color-primary-container)] transition-colors text-sm sm:text-base"
      >
        <span className="material-symbols-outlined text-[18px] text-slate-400">calendar_month</span>
        {weekLabel}
        <span className="material-symbols-outlined text-[16px] text-slate-400">{open ? 'expand_less' : 'expand_more'}</span>
      </button>

      {open && (
        <>
          {/* Backdrop */}
          <div className="fixed inset-0 z-20" onClick={() => setOpen(false)} />

          {/* Calendar popup */}
          <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 z-30 bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 p-4 w-72">
            {/* Month navigation */}
            <div className="flex items-center justify-between mb-3">
              <button
                onClick={prevMonth}
                className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 transition-colors"
              >
                <span className="material-symbols-outlined text-[20px]">chevron_left</span>
              </button>
              <span className="font-bold text-slate-800 dark:text-white text-sm">
                {MONTH_NAMES[calMonth]} {calYear}
              </span>
              <button
                onClick={nextMonth}
                className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 transition-colors"
              >
                <span className="material-symbols-outlined text-[20px]">chevron_right</span>
              </button>
            </div>

            {/* Day headers */}
            <div className="grid grid-cols-7 mb-1">
              {DAY_NAMES.map(d => (
                <div key={d} className="text-center text-[11px] font-semibold text-slate-400 dark:text-slate-500 py-1">
                  {d}
                </div>
              ))}
            </div>

            {/* Days */}
            <div className="grid grid-cols-7">
              {days.map((day, i) => {
                const ds = localDateStr(day)
                const dayMonday = getMondayOf(day)
                const inSelected = localDateStr(dayMonday) === viewedMondayStr
                const isToday = ds === todayStr
                const inCurrentMonth = day.getMonth() === calMonth
                const dow = day.getDay() === 0 ? 6 : day.getDay() - 1

                return (
                  <button
                    key={i}
                    onClick={() => navigate(day)}
                    className={[
                      'h-8 text-xs font-medium transition-colors relative',
                      inSelected
                        ? 'bg-indigo-100 dark:bg-indigo-900/50 text-[var(--color-primary-container)]'
                        : 'hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200',
                      inSelected && dow === 0 ? 'rounded-l-full' : '',
                      inSelected && dow === 6 ? 'rounded-r-full' : '',
                      !inCurrentMonth ? 'opacity-30' : '',
                    ].join(' ')}
                  >
                    {isToday && (
                      <span className="absolute top-0.5 right-0.5 w-1.5 h-1.5 rounded-full bg-[var(--color-primary-container)]" />
                    )}
                    <span className={isToday && !inSelected ? 'font-bold text-[var(--color-primary-container)]' : ''}>
                      {day.getDate()}
                    </span>
                  </button>
                )
              })}
            </div>

            {/* Today shortcut */}
            <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-700">
              <button
                onClick={() => { router.push('/dashboard'); setOpen(false) }}
                className="w-full py-2 text-sm font-medium text-[var(--color-primary-container)] hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition-colors"
              >
                Сегодня
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
