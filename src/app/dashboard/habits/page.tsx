import { getHabits } from '../actions'
import HabitsManager from './HabitsManager'

export default async function HabitsPage() {
  const habits = await getHabits()

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Мои привычки / задачи</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">Управляй списком привычек и задач, меняй названия и цвета.</p>
      </div>
      <HabitsManager initialHabits={habits} />
    </div>
  )
}
