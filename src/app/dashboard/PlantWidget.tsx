import PetNameForm from './PetNameForm'

// Shared face helpers
function Eyes({ x1, y1, x2, y2, size = 4 }: { x1: number; y1: number; x2: number; y2: number; size?: number }) {
  const p = size * 0.5
  const h = size * 0.18
  return (
    <>
      <g className="plant-eye">
        <circle cx={x1} cy={y1} r={size} fill="white" />
        <circle cx={x1 + p * 0.3} cy={y1 + p * 0.2} r={p} fill="#1a1a2e" />
        <circle cx={x1 + p * 0.55} cy={y1 - p * 0.3} r={h} fill="white" />
      </g>
      <g className="plant-eye-delay">
        <circle cx={x2} cy={y2} r={size} fill="white" />
        <circle cx={x2 + p * 0.3} cy={y2 + p * 0.2} r={p} fill="#1a1a2e" />
        <circle cx={x2 + p * 0.55} cy={y2 - p * 0.3} r={h} fill="white" />
      </g>
    </>
  )
}

function SadEyes({ x1, y1, x2, y2, size = 4 }: { x1: number; y1: number; x2: number; y2: number; size?: number }) {
  return (
    <>
      <circle cx={x1} cy={y1} r={size} fill="white" opacity="0.6" />
      <line x1={x1 - size * 0.6} y1={y1 - size * 0.3} x2={x1 + size * 0.6} y2={y1 + size * 0.1} stroke="#555" strokeWidth="1.2" strokeLinecap="round" />
      <circle cx={x2} cy={y2} r={size} fill="white" opacity="0.6" />
      <line x1={x2 - size * 0.6} y1={y2 - size * 0.3} x2={x2 + size * 0.6} y2={y2 + size * 0.1} stroke="#555" strokeWidth="1.2" strokeLinecap="round" />
    </>
  )
}

function SadMouth({ cx, cy, w = 10 }: { cx: number; cy: number; w?: number }) {
  return (
    <path
      d={`M${cx - w / 2} ${cy + w * 0.4} Q${cx} ${cy - w * 0.15} ${cx + w / 2} ${cy + w * 0.4}`}
      stroke="#555" strokeWidth="1.5" fill="none" strokeLinecap="round"
    />
  )
}

function Smile({ cx, cy, w = 10 }: { cx: number; cy: number; w?: number }) {
  return (
    <path
      d={`M${cx - w / 2} ${cy} Q${cx} ${cy + w * 0.55} ${cx + w / 2} ${cy}`}
      stroke="#1a1a2e" strokeWidth="1.5" fill="none" strokeLinecap="round"
    />
  )
}

function Pot() {
  return (
    <g>
      <rect x="18" y="102" width="64" height="7" rx="3.5" fill="#B5523A" />
      <path d="M24 109 L27 128 L73 128 L76 109 Z" fill="#C8614A" />
      <path d="M30 109 L28 128" stroke="#B5523A" strokeWidth="1" opacity="0.4" />
      <path d="M70 109 L72 128" stroke="#B5523A" strokeWidth="1" opacity="0.4" />
      <ellipse cx="50" cy="108" rx="30" ry="5" fill="#5C3317" />
      <ellipse cx="44" cy="107" rx="13" ry="2.5" fill="#6E3F1E" opacity="0.7" />
    </g>
  )
}

// Dead/wilted version of the seed
function DeadPet() {
  return (
    <g>
      <ellipse cx="50" cy="88" rx="17" ry="14" fill="#5a5a5a" opacity="0.7" />
      <path d="M37 86 Q50 80 63 86" stroke="#444" strokeWidth="1.5" fill="none" opacity="0.5" />
      <SadEyes x1={43} y1={84} x2={57} y2={84} size={4} />
      <SadMouth cx={50} cy={92} w={10} />
      {/* X marks for eyes overlay */}
      <text x="42" y="87" textAnchor="middle" fontSize="9" fill="#555" opacity="0.8">×</text>
      <text x="58" y="87" textAnchor="middle" fontSize="9" fill="#555" opacity="0.8">×</text>
    </g>
  )
}

// Stage 0 — Seed 🌰
function SeedPet() {
  return (
    <g className="plant-bounce">
      <ellipse cx="50" cy="84" rx="19" ry="16" fill="#8B6914" />
      <ellipse cx="50" cy="84" rx="19" ry="16" fill="url(#seedGrad)" />
      <path d="M35 82 Q50 74 65 82" stroke="#7A5C10" strokeWidth="1.5" fill="none" opacity="0.5" />
      <ellipse cx="42" cy="79" rx="7" ry="4" fill="rgba(255,220,100,0.25)" />
      <Eyes x1={43} y1={81} x2={57} y2={81} size={4} />
      <Smile cx={50} cy={90} w={10} />
      <defs>
        <radialGradient id="seedGrad" cx="35%" cy="30%">
          <stop offset="0%" stopColor="rgba(255,200,80,0.3)" />
          <stop offset="100%" stopColor="rgba(0,0,0,0.1)" />
        </radialGradient>
      </defs>
    </g>
  )
}

// Stage 1 — Sprout 🌱
function SproutPet() {
  return (
    <g className="plant-sway">
      <line x1="50" y1="102" x2="50" y2="72" stroke="#43A047" strokeWidth="4" strokeLinecap="round" />
      <ellipse cx="38" cy="82" rx="12" ry="7" fill="#66BB6A" transform="rotate(-30,38,82)" />
      <ellipse cx="62" cy="78" rx="12" ry="7" fill="#81C784" transform="rotate(25,62,78)" />
      <circle cx="50" cy="63" r="14" fill="#4CAF50" />
      <circle cx="50" cy="63" r="14" fill="url(#sproutGrad)" />
      <Eyes x1={44} y1={61} x2={56} y2={61} size={4} />
      <Smile cx={50} cy={68} w={9} />
      <defs>
        <radialGradient id="sproutGrad" cx="35%" cy="30%">
          <stop offset="0%" stopColor="rgba(255,255,255,0.3)" />
          <stop offset="100%" stopColor="rgba(0,0,0,0.1)" />
        </radialGradient>
      </defs>
    </g>
  )
}

// Stage 2 — Sapling 🌿
function SaplingPet() {
  return (
    <g className="plant-sway">
      <line x1="50" y1="102" x2="50" y2="62" stroke="#388E3C" strokeWidth="5" strokeLinecap="round" />
      <ellipse cx="34" cy="86" rx="14" ry="8" fill="#66BB6A" transform="rotate(-35,34,86)" />
      <ellipse cx="66" cy="80" rx="14" ry="8" fill="#81C784" transform="rotate(30,66,80)" />
      <ellipse cx="40" cy="72" rx="11" ry="6" fill="#4CAF50" transform="rotate(-20,40,72)" />
      <ellipse cx="60" cy="68" rx="11" ry="6" fill="#A5D6A7" transform="rotate(20,60,68)" />
      <circle cx="50" cy="53" r="16" fill="#43A047" />
      <circle cx="50" cy="53" r="16" fill="url(#sapGrad)" />
      <Eyes x1={43} y1={50} x2={57} y2={50} size={4.5} />
      <Smile cx={50} cy={58} w={10} />
      <defs>
        <radialGradient id="sapGrad" cx="35%" cy="30%">
          <stop offset="0%" stopColor="rgba(255,255,255,0.3)" />
          <stop offset="100%" stopColor="rgba(0,0,0,0.1)" />
        </radialGradient>
      </defs>
    </g>
  )
}

// Stage 3 — Flower 🌺
function FlowerPet() {
  return (
    <g>
      <line x1="50" y1="102" x2="50" y2="65" stroke="#388E3C" strokeWidth="5" strokeLinecap="round" />
      <ellipse cx="36" cy="85" rx="12" ry="6" fill="#66BB6A" transform="rotate(-30,36,85)" />
      <ellipse cx="64" cy="82" rx="12" ry="6" fill="#81C784" transform="rotate(25,64,82)" />
      {/* Petals — spinning slowly */}
      <g className="petal-spin" style={{ transformOrigin: '50px 50px' }}>
        {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, i) => (
          <ellipse
            key={i}
            cx={50 + 18 * Math.cos((angle * Math.PI) / 180)}
            cy={50 + 18 * Math.sin((angle * Math.PI) / 180)}
            rx="8" ry="5"
            fill={i % 2 === 0 ? '#F06292' : '#F48FB1'}
            transform={`rotate(${angle},${50 + 18 * Math.cos((angle * Math.PI) / 180)},${50 + 18 * Math.sin((angle * Math.PI) / 180)})`}
          />
        ))}
      </g>
      <circle cx="50" cy="50" r="16" fill="#FFB300" />
      <circle cx="50" cy="50" r="16" fill="url(#flowerGrad)" />
      <Eyes x1={43} y1={47} x2={57} y2={47} size={4.5} />
      <Smile cx={50} cy={55} w={11} />
      <defs>
        <radialGradient id="flowerGrad" cx="35%" cy="30%">
          <stop offset="0%" stopColor="rgba(255,255,255,0.4)" />
          <stop offset="100%" stopColor="rgba(0,0,0,0.1)" />
        </radialGradient>
      </defs>
    </g>
  )
}

// Stage 4 — Sunflower 🌻
function SunflowerPet() {
  return (
    <g className="plant-bounce">
      <line x1="50" y1="102" x2="50" y2="58" stroke="#2E7D32" strokeWidth="6" strokeLinecap="round" />
      <ellipse cx="35" cy="85" rx="14" ry="7" fill="#66BB6A" transform="rotate(-30,35,85)" />
      <ellipse cx="65" cy="80" rx="14" ry="7" fill="#81C784" transform="rotate(25,65,80)" />
      {/* Petals */}
      {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((angle, i) => (
        <ellipse
          key={i}
          cx={50 + 22 * Math.cos((angle * Math.PI) / 180)}
          cy={44 + 22 * Math.sin((angle * Math.PI) / 180)}
          rx="9" ry="5"
          fill="#FDD835"
          transform={`rotate(${angle},${50 + 22 * Math.cos((angle * Math.PI) / 180)},${44 + 22 * Math.sin((angle * Math.PI) / 180)})`}
        />
      ))}
      <circle cx="50" cy="44" r="18" fill="#6D4C41" />
      <circle cx="50" cy="44" r="18" fill="url(#sunGrad)" />
      <Eyes x1={43} y1={40} x2={57} y2={40} size={5} />
      <Smile cx={50} cy={49} w={13} />
      {/* Cheeks */}
      <ellipse cx="37" cy="48" rx="5" ry="3" fill="rgba(255,120,80,0.4)" />
      <ellipse cx="63" cy="48" rx="5" ry="3" fill="rgba(255,120,80,0.4)" />
      <defs>
        <radialGradient id="sunGrad" cx="35%" cy="30%">
          <stop offset="0%" stopColor="rgba(255,255,255,0.3)" />
          <stop offset="100%" stopColor="rgba(0,0,0,0.2)" />
        </radialGradient>
      </defs>
    </g>
  )
}

// Stage 5 — Tree 🌳
function TreePet() {
  return (
    <g className="plant-float">
      {/* Trunk */}
      <rect x="43" y="75" width="14" height="28" rx="5" fill="#795548" />
      <rect x="46" y="80" width="4" height="20" rx="2" fill="#6D4C41" opacity="0.5" />
      {/* Canopy */}
      <circle cx="50" cy="55" r="28" fill="#2E7D32" />
      <circle cx="50" cy="55" r="28" fill="url(#treeGrad)" />
      {/* Leaf clusters */}
      <circle cx="32" cy="62" r="14" fill="#388E3C" />
      <circle cx="68" cy="62" r="14" fill="#43A047" />
      <circle cx="50" cy="38" r="16" fill="#4CAF50" />
      <Eyes x1={43} y1={53} x2={57} y2={53} size={5} />
      <Smile cx={50} cy={61} w={13} />
      {/* Cheeks */}
      <ellipse cx="37" cy="61" rx="5" ry="3" fill="rgba(255,150,100,0.35)" />
      <ellipse cx="63" cy="61" rx="5" ry="3" fill="rgba(255,150,100,0.35)" />
      <defs>
        <radialGradient id="treeGrad" cx="40%" cy="30%">
          <stop offset="0%" stopColor="rgba(255,255,255,0.25)" />
          <stop offset="100%" stopColor="rgba(0,0,0,0.15)" />
        </radialGradient>
      </defs>
    </g>
  )
}

// Stage 6 — Ancient Cedar 🌲
function CedarPet() {
  return (
    <g className="plant-float">
      {/* Trunk */}
      <rect x="44" y="83" width="12" height="20" rx="4" fill="#4E342E" />
      {/* Cedar layers */}
      <polygon points="50,12 68,45 32,45" fill="#1B5E20" />
      <polygon points="50,22 71,58 29,58" fill="#2E7D32" />
      <polygon points="50,35 73,72 27,72" fill="#388E3C" />
      <polygon points="50,48 74,85 26,85" fill="#43A047" />
      {/* Face on middle layer */}
      <circle cx="50" cy="58" r="14" fill="#2E7D32" opacity="0" />
      <Eyes x1={43} y1={57} x2={57} y2={57} size={5} />
      <Smile cx={50} cy={64} w={12} />
      {/* Cheeks */}
      <ellipse cx="37" cy="64" rx="5" ry="3" fill="rgba(255,200,100,0.4)" />
      <ellipse cx="63" cy="64" rx="5" ry="3" fill="rgba(255,200,100,0.4)" />
      {/* Star on top */}
      <text x="50" y="16" textAnchor="middle" fontSize="12" fill="#FFD700">★</text>
      {/* Sparkles */}
      <g className="plant-sparkle-1">
        <text x="15" y="40" fontSize="10" fill="#FFD700">✦</text>
      </g>
      <g className="plant-sparkle-2">
        <text x="78" y="35" fontSize="10" fill="#FFD700">✦</text>
      </g>
      <g className="plant-sparkle-3">
        <text x="20" y="68" fontSize="8" fill="#A5D6A7">✦</text>
      </g>
    </g>
  )
}

const STAGES = [
  { component: SeedPet, name: 'Семечко', text: 'Добавь привычки и начни отмечать каждый день!', bg: 'from-amber-950 to-amber-800', minPct: 0 },
  { component: SproutPet, name: 'Росток', text: 'Хорошее начало! Продолжай в том же духе.', bg: 'from-green-950 to-green-800', minPct: 15 },
  { component: SaplingPet, name: 'Саженец', text: 'Ты активно растёшь. Не останавливайся!', bg: 'from-emerald-900 to-emerald-700', minPct: 30 },
  { component: FlowerPet, name: 'Цветок', text: 'Ты расцветаешь! Привычки входят в ритм.', bg: 'from-pink-900 to-rose-700', minPct: 45 },
  { component: SunflowerPet, name: 'Подсолнух', text: 'Тянешься к солнцу! Ты в настоящем ударе.', bg: 'from-yellow-900 to-amber-700', minPct: 60 },
  { component: TreePet, name: 'Дерево', text: 'Ты стал настоящим деревом! Сила и дисциплина.', bg: 'from-green-900 to-teal-700', minPct: 75 },
  { component: CedarPet, name: 'Вековой кедр', text: 'Легенда привычек. Ты — пример для всех!', bg: 'from-emerald-900 to-green-600', minPct: 90 },
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
  petState = 'healthy',
  petName,
}: {
  completionPct: number
  hasHabits: boolean
  petState?: 'healthy' | 'warning_sent' | 'dead'
  petName?: string | null
}) {
  const isDying = petState === 'warning_sent'
  const isDead = petState === 'dead'

  const displayPct = isDead ? 0 : completionPct
  const { stage, index } = getStage(displayPct)
  const PlantComponent = isDead ? DeadPet : stage.component
  const nextStage = STAGES[index + 1]
  const pctInStage = nextStage
    ? Math.round(((displayPct - stage.minPct) / (nextStage.minPct - stage.minPct)) * 100)
    : 100

  const cardBorder = isDead
    ? 'border-slate-300 dark:border-slate-600'
    : isDying
    ? 'border-orange-400 dark:border-orange-500 ring-2 ring-orange-200 dark:ring-orange-800/50'
    : 'border-slate-200 dark:border-slate-700'

  const bgGradient = isDead ? 'from-slate-700 to-slate-600' : stage.bg

  const pctBadgeClass = isDead
    ? 'bg-slate-100 dark:bg-slate-700 text-slate-400 dark:text-slate-500'
    : isDying
    ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400'
    : 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'

  const barColor = isDying ? 'bg-orange-400' : 'bg-green-500'

  return (
    <div className={`bg-white dark:bg-slate-800 rounded-xl shadow-sm border ${cardBorder} p-6 transition-all`}>
      {isDying && (
        <div className="flex items-center gap-2 text-orange-600 dark:text-orange-400 text-sm font-medium mb-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg px-3 py-2">
          <span className="material-symbols-outlined text-base" style={{ fontSize: '18px' }}>warning</span>
          Питомец умирает! Отметь хотя бы одну привычку сегодня, чтобы спасти его.
        </div>
      )}
      {isDead && (
        <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-sm font-medium mb-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg px-3 py-2">
          <span>💀</span>
          Питомец погиб... Начни отмечать привычки — он возродится!
        </div>
      )}

      <div className="flex flex-col sm:flex-row items-center gap-6">
        {/* Plant character */}
        <div className={`w-28 h-32 rounded-2xl bg-gradient-to-b ${bgGradient} flex items-center justify-center shrink-0 shadow-lg overflow-hidden`}>
          <svg
            viewBox="0 0 100 130"
            width="100"
            height="130"
            xmlns="http://www.w3.org/2000/svg"
            style={isDead ? { filter: 'grayscale(1) brightness(0.55)' } : undefined}
          >
            <PlantComponent />
            <Pot />
          </svg>
        </div>

        {/* Info */}
        <div className="flex-1 text-center sm:text-left space-y-1">
          <div className="flex items-center gap-2 justify-center sm:justify-start flex-wrap">
            <h3 className="font-bold text-slate-900 dark:text-white text-lg">
              {isDead ? 'Питомец погиб' : stage.name}
            </h3>
            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${pctBadgeClass}`}>
              {displayPct}%
            </span>
          </div>

          <PetNameForm initialName={petName ?? null} stageName={stage.name} />

          <p className="text-sm text-slate-500 dark:text-slate-400 pt-1">
            {!hasHabits
              ? 'Добавь первую привычку, чтобы твой питомец начал расти!'
              : isDead
              ? 'Отметь привычку — и питомец начнёт возрождаться с нуля.'
              : isDying
              ? 'Помоги питомцу — отметь привычку прямо сейчас!'
              : stage.text}
          </p>

          {!isDead && nextStage ? (
            <div className="space-y-1 pt-1">
              <div className="flex justify-between text-xs text-slate-400 dark:text-slate-500">
                <span>{stage.name}</span>
                <span>до «{nextStage.name}»</span>
              </div>
              <div className="h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                <div
                  className={`h-full ${barColor} rounded-full transition-all duration-700`}
                  style={{ width: `${pctInStage}%` }}
                />
              </div>
            </div>
          ) : !isDead ? (
            <p className="text-xs text-yellow-500 font-medium pt-1">🏆 Максимальный уровень достигнут!</p>
          ) : null}
        </div>
      </div>
    </div>
  )
}
