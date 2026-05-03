const STAGES = [
  {
    emoji: '🌰',
    name: 'Семечко',
    text: 'Добавь привычки и начни отмечать каждый день!',
    bg: 'from-amber-950 to-amber-800',
    ring: 'ring-amber-700',
    minPct: 0,
  },
  {
    emoji: '🌱',
    name: 'Росток',
    text: 'Хорошее начало! Продолжай в том же духе.',
    bg: 'from-green-950 to-green-800',
    ring: 'ring-green-700',
    minPct: 15,
  },
  {
    emoji: '🌿',
    name: 'Саженец',
    text: 'Ты активно растёшь. Не останавливайся!',
    bg: 'from-emerald-900 to-emerald-700',
    ring: 'ring-emerald-600',
    minPct: 30,
  },
  {
    emoji: '🌺',
    name: 'Цветок',
    text: 'Ты расцветаешь! Привычки входят в ритм.',
    bg: 'from-emerald-800 to-teal-600',
    ring: 'ring-teal-500',
    minPct: 45,
  },
  {
    emoji: '🌻',
    name: 'Подсолнух',
    text: 'Тянешься к солнцу! Ты в ударе.',
    bg: 'from-teal-800 to-green-600',
    ring: 'ring-green-500',
    minPct: 60,
  },
  {
    emoji: '🌳',
    name: 'Дерево',
    text: 'Ты стал настоящим деревом! Мощь и дисциплина.',
    bg: 'from-green-800 to-emerald-500',
    ring: 'ring-emerald-400',
    minPct: 75,
  },
  {
    emoji: '🌲',
    name: 'Вековой кедр',
    text: 'Легенда привычек. Ты — пример для всех!',
    bg: 'from-emerald-700 to-green-400',
    ring: 'ring-green-300',
    minPct: 90,
  },
]

function getStage(pct: number) {
  for (let i = STAGES.length - 1; i >= 0; i--) {
    if (pct >= STAGES[i].minPct) return { stage: STAGES[i], index: i }
  }
  return { stage: STAGES[0], index: 0 }
}

export default function PlantWidget({
  completionPct,
  hasHabits,
}: {
  completionPct: number
  hasHabits: boolean
}) {
  const { stage, index } = getStage(completionPct)
  const nextStage = STAGES[index + 1]
  const pctInStage = nextStage
    ? Math.round(((completionPct - stage.minPct) / (nextStage.minPct - stage.minPct)) * 100)
    : 100

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
      <div className="flex flex-col sm:flex-row items-center gap-6">
        {/* Plant visual */}
        <div className={`w-24 h-24 rounded-full bg-gradient-to-br ${stage.bg} ring-4 ${stage.ring} flex items-center justify-center shrink-0 shadow-lg`}>
          <span className="text-5xl" role="img" aria-label={stage.name}>{stage.emoji}</span>
        </div>

        {/* Info */}
        <div className="flex-1 text-center sm:text-left space-y-2">
          <div className="flex items-center gap-2 justify-center sm:justify-start">
            <h3 className="font-bold text-slate-900 dark:text-white text-lg">{stage.name}</h3>
            <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400">
              {completionPct}%
            </span>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {hasHabits ? stage.text : 'Добавь первую привычку, чтобы твой питомец начал расти!'}
          </p>

          {/* Progress to next stage */}
          {nextStage ? (
            <div className="space-y-1">
              <div className="flex justify-between text-xs text-slate-400 dark:text-slate-500">
                <span>{stage.name}</span>
                <span>до «{nextStage.name}»</span>
              </div>
              <div className="h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-green-500 rounded-full transition-all duration-700"
                  style={{ width: `${pctInStage}%` }}
                />
              </div>
            </div>
          ) : (
            <p className="text-xs text-green-500 font-medium">🏆 Максимальный уровень достигнут!</p>
          )}
        </div>
      </div>
    </div>
  )
}
