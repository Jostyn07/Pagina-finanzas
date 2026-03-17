import { useState, useEffect } from 'react'
import { BookOpen, Lightbulb, GraduationCap, Library, HelpCircle, ChevronRight, ChevronDown, Star, CheckCircle2, XCircle, RotateCcw, Trophy } from 'lucide-react'

// ─── DAILY TIPS ───────────────────────────────────────────────────────────────
const DAILY_TIPS = [
  { book: 'The Psychology of Money', author: 'Morgan Housel', tip: 'El mayor obstáculo para construir riqueza no es el conocimiento financiero, sino el comportamiento. Pequeños hábitos consistentes superan grandes estrategias inconsistentes.', emoji: '🧠' },
  { book: 'The Richest Man in Babylon', author: 'George S. Clason', tip: 'Págate a ti mismo primero. Ahorra al menos el 10% de todo lo que ganes antes de pagar cualquier otra cosa.', emoji: '🏛️' },
  { book: 'Rich Dad Poor Dad', author: 'Robert Kiyosaki', tip: 'Un activo pone dinero en tu bolsillo. Un pasivo saca dinero de tu bolsillo. Enfócate en adquirir activos.', emoji: '💡' },
  { book: 'I Will Teach You to Be Rich', author: 'Ramit Sethi', tip: 'Automatiza tus finanzas. El dinero que nunca ves no lo gastas. Configura transferencias automáticas el día que recibes tu salario.', emoji: '⚡' },
  { book: 'The Total Money Makeover', author: 'Dave Ramsey', tip: 'Vive como nadie hoy para poder vivir como nadie mañana. El sacrificio temporal crea libertad permanente.', emoji: '🎯' },
  { book: 'Your Money or Your Life', author: 'Vicki Robin', tip: 'Cada compra es un intercambio de energía vital. Antes de comprar algo, pregúntate: ¿cuántas horas de trabajo representa esto?', emoji: '⚖️' },
  { book: 'The Simple Path to Wealth', author: 'JL Collins', tip: 'La simplicidad supera a la complejidad en inversiones. Un fondo indexado de bajo costo supera a la mayoría de gestores activos a largo plazo.', emoji: '📈' },
  { book: 'Get Good with Money', author: 'Tiffany Aliche', tip: 'No puedes construir riqueza sobre una base rota. Primero ordena tu presupuesto, luego elimina deudas, luego invierte.', emoji: '🔧' },
  { book: 'The Psychology of Money', author: 'Morgan Housel', tip: 'La riqueza es lo que no ves. Los carros lujosos y casas grandes son señales de dinero gastado, no de riqueza acumulada.', emoji: '👁️' },
  { book: 'Rich Dad Poor Dad', author: 'Robert Kiyosaki', tip: 'La educación financiera no se enseña en las escuelas. Es tu responsabilidad aprender cómo funciona el dinero.', emoji: '📚' },
  { book: 'The Richest Man in Babylon', author: 'George S. Clason', tip: 'Haz que tu dinero trabaje para ti. Cada peso ahorrado es un trabajador que labora día y noche sin descanso.', emoji: '💰' },
  { book: 'I Will Teach You to Be Rich', author: 'Ramit Sethi', tip: 'Gasta sin culpa en lo que amas, eliminando sin piedad lo que no. El presupuesto consciente no es restricción, es libertad.', emoji: '🎉' },
  { book: 'Your Money or Your Life', author: 'Vicki Robin', tip: 'El punto de suficiencia es diferente para cada persona. Define qué es "suficiente" para ti antes de perseguir "más".', emoji: '🌱' },
  { book: 'The Total Money Makeover', author: 'Dave Ramsey', tip: 'Si no tienes un presupuesto, alguien más tiene un plan para tu dinero: las empresas de publicidad.', emoji: '📋' },
]

// ─── GLOSSARY ─────────────────────────────────────────────────────────────────
const GLOSSARY = [
  { term: 'DTI (Debt-to-Income)', def: 'Porcentaje de tu ingreso mensual destinado a pagar deudas. Menor a 36% es saludable. Mayor a 50% es crítico.', emoji: '📊' },
  { term: 'Patrimonio neto', def: 'Total de tus activos menos el total de tus deudas. Es la medida real de tu riqueza. Puede ser negativo si debes más de lo que tienes.', emoji: '⚖️' },
  { term: 'Interés compuesto', def: 'El interés que genera interés. Albert Einstein lo llamó "la octava maravilla del mundo". A favor tuyo en inversiones, en contra en deudas.', emoji: '🔄' },
  { term: 'Fondo de emergencia', def: '3 a 6 meses de gastos guardados en una cuenta líquida. Es tu red de seguridad contra imprevistos sin recurrir a deudas.', emoji: '🛟' },
  { term: 'Tasa de ahorro', def: 'Porcentaje de tu ingreso que ahorras. 20% o más es excelente. Menos del 10% es riesgoso. La meta de retiro anticipado requiere 40-70%.', emoji: '💰' },
  { term: 'Inflación', def: 'Aumento general de precios con el tiempo. El dinero guardado en efectivo pierde poder adquisitivo. Una inflación del 5% reduce tu poder de compra a la mitad en 14 años.', emoji: '📉' },
  { term: 'Activo líquido', def: 'Dinero o bienes que puedes convertir en efectivo rápidamente sin perder valor significativo. Ejemplos: cuenta de ahorros, CDT, acciones de alta liquidez.', emoji: '💧' },
  { term: 'Número de libertad financiera', def: 'Tus gastos anuales multiplicados por 25. Es el capital que necesitas para vivir de tus inversiones indefinidamente (regla del 4%).', emoji: '🎯' },
  { term: 'Baby Steps', def: 'Los 7 pasos de Dave Ramsey para alcanzar la libertad financiera, desde el fondo de emergencia inicial hasta construir riqueza y dar generosamente.', emoji: '👣' },
  { term: 'Regla 50/30/20', def: 'Sistema de presupuesto que divide el ingreso neto en: 50% necesidades, 30% deseos y 20% ahorro. Creado por Elizabeth Warren.', emoji: '🥧' },
  { term: 'Bola de nieve', def: 'Método de pago de deudas de Ramsey: paga primero la más pequeña para ganar motivación. Matemáticamente menos eficiente que la avalancha pero psicológicamente superior.', emoji: '⛄' },
  { term: 'Avalancha', def: 'Método de pago de deudas: paga primero la de mayor tasa de interés. Matemáticamente óptimo para minimizar el total de intereses pagados.', emoji: '🏔️' },
]

// ─── MINI-LESSONS ─────────────────────────────────────────────────────────────
const MINI_LESSONS = [
  {
    id: 'emergency',
    title: 'El fondo de emergencia',
    emoji: '🛟',
    duration: '3 min',
    color: 'blue',
    sections: [
      { title: '¿Qué es?', content: 'Un fondo de emergencia es dinero guardado específicamente para gastos inesperados: pérdida de empleo, emergencias médicas, reparaciones urgentes. No es para vacaciones ni caprichos.' },
      { title: '¿Cuánto necesito?', content: 'Dave Ramsey recomienda dos etapas: primero $1,000 USD (Baby Step 1) como buffer inicial mientras pagas deudas. Luego 3 a 6 meses de gastos totales (Baby Step 3) como colchón completo.' },
      { title: '¿Dónde guardarlo?', content: 'En una cuenta de ahorros separada de tu cuenta corriente. Debe ser líquido (accesible en 24-48 horas) pero no tan accesible que lo uses para gastos cotidianos.' },
      { title: 'Por qué importa', content: 'Sin fondo de emergencia, cualquier imprevisto se convierte en deuda. Con él, una emergencia es solo un inconveniente temporal que no daña tu progreso financiero.' },
    ]
  },
  {
    id: 'snowball',
    title: 'Método bola de nieve',
    emoji: '⛄',
    duration: '4 min',
    color: 'emerald',
    sections: [
      { title: '¿Cómo funciona?', content: 'Lista todas tus deudas de menor a mayor saldo. Paga el mínimo en todas excepto la más pequeña. Todo el dinero extra va a la deuda más pequeña hasta eliminarla.' },
      { title: 'El efecto bola de nieve', content: 'Cuando eliminas la deuda más pequeña, tomas ese pago y lo sumas al siguiente. El pago crece como una bola de nieve, acelerando cada vez más.' },
      { title: '¿Por qué no la de mayor interés?', content: 'El método avalancha (mayor interés primero) es matemáticamente superior. Pero la psicología importa más que las matemáticas. Las victorias rápidas de la bola de nieve mantienen la motivación.' },
      { title: 'Ejemplo práctico', content: 'Deuda A: $500k. Deuda B: $2M. Deuda C: $8M. Pagas primero A, luego B+pago_A, luego C+pago_B+pago_A. El momentum se construye con cada victoria.' },
    ]
  },
  {
    id: 'budget5030',
    title: 'Regla 50/30/20',
    emoji: '🥧',
    duration: '3 min',
    color: 'amber',
    sections: [
      { title: 'El concepto', content: 'Divide tu ingreso NETO (después de impuestos) en tres categorías: 50% para necesidades, 30% para deseos y 20% para ahorro. Simple pero poderoso.' },
      { title: '50% — Necesidades', content: 'Lo que necesitas para vivir: vivienda, comida, transporte, servicios básicos, salud, ropa básica, pagos mínimos de deudas. Si supera el 50%, necesitas reducir costos fijos.' },
      { title: '30% — Deseos', content: 'Lo que mejora tu vida pero no es esencial: restaurantes, entretenimiento, vacaciones, suscripciones, ropa de marca, hobbies. El lugar donde más libertad tienes.' },
      { title: '20% — Ahorro', content: 'Fondo de emergencia, pago extra de deudas, inversiones, retiro. Este 20% construye tu futuro. Ramit Sethi recomienda automatizarlo el día que recibes tu salario.' },
    ]
  },
  {
    id: 'compound',
    title: 'Interés compuesto',
    emoji: '🔄',
    duration: '4 min',
    color: 'purple',
    sections: [
      { title: 'La maravilla del mundo', content: 'Einstein llamó al interés compuesto "la octava maravilla del mundo". Es el proceso por el cual el interés genera más interés, creando crecimiento exponencial.' },
      { title: 'Cómo funciona', content: '$1,000 al 10% anual: año 1 = $1,100. Año 2 = $1,210. Año 10 = $2,594. Año 20 = $6,727. Año 30 = $17,449. No es lineal, es exponencial.' },
      { title: 'El tiempo es tu mejor aliado', content: 'Invertir $500k/mes desde los 25 años genera más riqueza que invertir $1M/mes desde los 35. 10 años de ventaja valen más que el doble del monto.' },
      { title: 'En tu contra', content: 'El mismo poder trabaja en tu contra con deudas. Una tarjeta al 30% anual duplica tu deuda en menos de 3 años si solo pagas el mínimo. Por eso Ramsey prioriza eliminar deudas primero.' },
    ]
  },
]

// ─── BOOKS BY BABY STEP ───────────────────────────────────────────────────────
const BOOKS_BY_STEP = {
  1: { title: 'The Total Money Makeover', author: 'Dave Ramsey', why: 'El libro perfecto para tu momento: explica los Baby Steps en detalle y cómo construir tu fondo de emergencia inicial.', emoji: '💪', color: 'amber' },
  2: { title: 'The Total Money Makeover', author: 'Dave Ramsey', why: 'Ramsey explica el método bola de nieve con historias reales de personas que eliminaron deudas enormes con disciplina.', emoji: '⛄', color: 'red' },
  3: { title: 'I Will Teach You to Be Rich', author: 'Ramit Sethi', why: 'Sethi te enseña a automatizar tus ahorros y construir sistemas que funcionan sin que pienses en ellos constantemente.', emoji: '⚡', color: 'emerald' },
  4: { title: 'The Simple Path to Wealth', author: 'JL Collins', why: 'El libro más claro sobre cómo invertir el 15% de tu ingreso en fondos indexados de bajo costo para el retiro.', emoji: '📈', color: 'blue' },
  5: { title: 'Get Good with Money', author: 'Tiffany Aliche', why: 'Aliche aborda la planificación familiar y educativa de manera práctica y accesible para el contexto latinoamericano.', emoji: '🎓', color: 'cyan' },
  6: { title: 'Your Money or Your Life', author: 'Vicki Robin', why: 'Cuando ya casi tienes tu casa pagada, este libro te ayuda a redefinir tu relación con el dinero y hacia dónde va tu vida.', emoji: '🏠', color: 'purple' },
  7: { title: 'The Psychology of Money', author: 'Morgan Housel', why: 'En la cima financiera, este libro te ayuda a mantener la perspectiva y entender por qué el comportamiento importa más que el conocimiento.', emoji: '🧠', color: 'pink' },
}

// ─── QUIZ ─────────────────────────────────────────────────────────────────────
const QUIZ_QUESTIONS = [
  {
    q: '¿Qué porcentaje del ingreso recomienda la regla 50/30/20 para ahorro?',
    options: ['10%', '20%', '30%', '50%'],
    correct: 1,
    explanation: 'La regla 50/30/20 destina el 20% al ahorro e inversión. Este porcentaje incluye fondo de emergencia, pago extra de deudas e inversiones.',
  },
  {
    q: '¿Cuál es el Baby Step 1 de Dave Ramsey?',
    options: ['Pagar todas las deudas', 'Invertir 15% del ingreso', 'Ahorrar $1,000 de emergencia', 'Pagar la hipoteca'],
    correct: 2,
    explanation: 'El Baby Step 1 es ahorrar $1,000 USD (o equivalente) como fondo de emergencia inicial antes de atacar las deudas.',
  },
  {
    q: '¿Qué es el DTI?',
    options: ['Tasa de interés de tu banco', 'Ratio deuda-ingreso mensual', 'Impuesto sobre inversiones', 'Tipo de cuenta de ahorros'],
    correct: 1,
    explanation: 'DTI (Debt-to-Income) es el porcentaje de tu ingreso mensual que destinas a pagar deudas. Menos del 36% es saludable.',
  },
  {
    q: 'En el método "bola de nieve", ¿qué deuda pagas primero?',
    options: ['La de mayor tasa de interés', 'La más antigua', 'La de menor saldo', 'La del banco más grande'],
    correct: 2,
    explanation: 'La bola de nieve prioriza la deuda de menor saldo para generar victorias rápidas y mantener la motivación.',
  },
  {
    q: '¿Cuántos meses de gastos debe tener un fondo de emergencia completo?',
    options: ['1-2 meses', '3-6 meses', '8-10 meses', '12 meses'],
    correct: 1,
    explanation: 'Dave Ramsey recomienda 3 a 6 meses de gastos totales como fondo de emergencia completo (Baby Step 3).',
  },
  {
    q: '¿Qué es el interés compuesto?',
    options: ['Interés fijo mensual', 'Interés que genera más interés', 'Interés de dos bancos', 'Interés deducible de impuestos'],
    correct: 1,
    explanation: 'El interés compuesto es cuando el interés generado se suma al capital y también genera interés, creando crecimiento exponencial.',
  },
  {
    q: 'Según Morgan Housel, ¿qué importa más para construir riqueza?',
    options: ['Conocimiento financiero', 'Altos ingresos', 'Comportamiento y hábitos', 'Invertir en acciones'],
    correct: 2,
    explanation: 'En "The Psychology of Money", Housel argumenta que el comportamiento y los hábitos consistentes importan más que el conocimiento técnico.',
  },
]

const COLOR_MAP = {
  blue: { bg: 'bg-blue-500/20', text: 'text-blue-400', border: 'border-blue-500/30' },
  emerald: { bg: 'bg-emerald-500/20', text: 'text-emerald-400', border: 'border-emerald-500/30' },
  amber: { bg: 'bg-amber-500/20', text: 'text-amber-400', border: 'border-amber-500/30' },
  purple: { bg: 'bg-purple-500/20', text: 'text-purple-400', border: 'border-purple-500/30' },
  red: { bg: 'bg-red-500/20', text: 'text-red-400', border: 'border-red-500/30' },
  cyan: { bg: 'bg-cyan-500/20', text: 'text-cyan-400', border: 'border-cyan-500/30' },
  pink: { bg: 'bg-pink-500/20', text: 'text-pink-400', border: 'border-pink-500/30' },
}

// ─── SECTION COMPONENTS ───────────────────────────────────────────────────────

function DailyTip() {
  const dayOfYear = Math.floor((new Date() - new Date(new Date().getFullYear(), 0, 0)) / 86400000)
  const tip = DAILY_TIPS[dayOfYear % DAILY_TIPS.length]
  return (
    <div className="bg-gradient-to-br from-amber-500/10 to-amber-500/5 border border-amber-500/20 rounded-2xl p-4">
      <div className="flex items-center gap-2 mb-3">
        <Lightbulb className="w-4 h-4 text-amber-400" />
        <span className="text-xs font-semibold text-amber-400 uppercase tracking-wider">Tip del día</span>
      </div>
      <div className="text-3xl mb-3">{tip.emoji}</div>
      <p className="text-sm text-slate-200 leading-relaxed mb-3">"{tip.tip}"</p>
      <div className="flex items-center gap-2">
        <div className="w-1 h-8 bg-amber-500/40 rounded-full" />
        <div>
          <p className="text-xs font-semibold text-white">{tip.book}</p>
          <p className="text-xs text-slate-500">{tip.author}</p>
        </div>
      </div>
    </div>
  )
}

function Glossary() {
  const [search, setSearch] = useState('')
  const [expanded, setExpanded] = useState(null)
  const filtered = GLOSSARY.filter(g =>
    g.term.toLowerCase().includes(search.toLowerCase()) ||
    g.def.toLowerCase().includes(search.toLowerCase())
  )
  return (
    <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-4">
      <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
        <Library className="w-4 h-4 text-amber-400" /> Glosario financiero
      </h3>
      <input
        type="text" value={search} onChange={e => setSearch(e.target.value)}
        placeholder="Buscar término..."
        className="w-full px-3 py-2 bg-slate-900/50 border border-slate-600/50 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50 mb-3"
      />
      <div className="space-y-1.5 max-h-72 overflow-y-auto">
        {filtered.map((g, i) => (
          <div key={i} className="bg-slate-900/50 rounded-xl overflow-hidden">
            <button onClick={() => setExpanded(expanded === i ? null : i)}
              className="w-full flex items-center justify-between px-3 py-2.5 text-left">
              <div className="flex items-center gap-2">
                <span className="text-base">{g.emoji}</span>
                <span className="text-sm font-medium text-white">{g.term}</span>
              </div>
              <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${expanded === i ? 'rotate-180' : ''}`} />
            </button>
            {expanded === i && (
              <div className="px-3 pb-3">
                <p className="text-xs text-slate-400 leading-relaxed">{g.def}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

function MiniLessons() {
  const [activeLesson, setActiveLesson] = useState(null)
  const [activeSection, setActiveSection] = useState(0)

  if (activeLesson !== null) {
    const lesson = MINI_LESSONS[activeLesson]
    const colors = COLOR_MAP[lesson.color]
    return (
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-4">
        <button onClick={() => { setActiveLesson(null); setActiveSection(0) }}
          className="flex items-center gap-1 text-xs text-slate-400 hover:text-white mb-4 transition-colors">
          ← Volver a lecciones
        </button>
        <div className="flex items-center gap-3 mb-4">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${colors.bg}`}>
            <span className="text-xl">{lesson.emoji}</span>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white">{lesson.title}</h3>
            <p className="text-xs text-slate-500">{lesson.duration} de lectura</p>
          </div>
        </div>
        {/* Progress */}
        <div className="flex gap-1 mb-4">
          {lesson.sections.map((_, i) => (
            <div key={i} className={`flex-1 h-1 rounded-full transition-colors ${i <= activeSection ? colors.bg.replace('/20', '') : 'bg-slate-700'}`}
              style={{ background: i <= activeSection ? undefined : '#334155' }} />
          ))}
        </div>
        {/* Content */}
        <div className={`${colors.bg} border ${colors.border} rounded-xl p-4 mb-4`}>
          <h4 className={`text-sm font-semibold ${colors.text} mb-2`}>{lesson.sections[activeSection].title}</h4>
          <p className="text-sm text-slate-300 leading-relaxed">{lesson.sections[activeSection].content}</p>
        </div>
        {/* Navigation */}
        <div className="flex gap-2">
          {activeSection > 0 && (
            <button onClick={() => setActiveSection(s => s - 1)}
              className="flex-1 py-2 bg-slate-700/50 rounded-xl text-sm text-slate-300">
              ← Anterior
            </button>
          )}
          {activeSection < lesson.sections.length - 1 ? (
            <button onClick={() => setActiveSection(s => s + 1)}
              className="flex-1 py-2 bg-amber-500 hover:bg-amber-400 rounded-xl text-sm font-semibold text-slate-900">
              Siguiente →
            </button>
          ) : (
            <button onClick={() => { setActiveLesson(null); setActiveSection(0) }}
              className="flex-1 py-2 bg-emerald-500 hover:bg-emerald-400 rounded-xl text-sm font-semibold text-white flex items-center justify-center gap-1">
              <CheckCircle2 className="w-4 h-4" /> ¡Completado!
            </button>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-4">
      <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
        <GraduationCap className="w-4 h-4 text-amber-400" /> Mini-lecciones
      </h3>
      <div className="grid grid-cols-2 gap-2">
        {MINI_LESSONS.map((lesson, i) => {
          const colors = COLOR_MAP[lesson.color]
          return (
            <button key={i} onClick={() => setActiveLesson(i)}
              className={`${colors.bg} border ${colors.border} rounded-xl p-3 text-left hover:opacity-80 transition-opacity`}>
              <div className="text-2xl mb-2">{lesson.emoji}</div>
              <p className="text-xs font-semibold text-white leading-tight">{lesson.title}</p>
              <p className="text-[10px] text-slate-500 mt-1">{lesson.duration} · {lesson.sections.length} partes</p>
            </button>
          )
        })}
      </div>
    </div>
  )
}

function BookRecommendation({ currentStep }) {
  const book = BOOKS_BY_STEP[currentStep] || BOOKS_BY_STEP[1]
  const colors = COLOR_MAP[book.color]
  return (
    <div className={`${colors.bg} border ${colors.border} rounded-2xl p-4`}>
      <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
        <BookOpen className="w-4 h-4 text-amber-400" /> Libro recomendado para tu Baby Step {currentStep}
      </h3>
      <div className="flex items-start gap-3">
        <div className={`w-12 h-16 ${colors.bg} border ${colors.border} rounded-lg flex items-center justify-center flex-shrink-0`}>
          <span className="text-2xl">{book.emoji}</span>
        </div>
        <div>
          <p className="text-sm font-bold text-white">{book.title}</p>
          <p className="text-xs text-slate-400 mb-2">{book.author}</p>
          <p className="text-xs text-slate-300 leading-relaxed">{book.why}</p>
        </div>
      </div>
    </div>
  )
}

function Quiz() {
  const [current, setCurrent] = useState(0)
  const [selected, setSelected] = useState(null)
  const [answers, setAnswers] = useState([])
  const [finished, setFinished] = useState(false)

  function handleAnswer(idx) {
    if (selected !== null) return
    setSelected(idx)
    setAnswers(a => [...a, idx === QUIZ_QUESTIONS[current].correct])
  }

  function handleNext() {
    if (current < QUIZ_QUESTIONS.length - 1) {
      setCurrent(c => c + 1)
      setSelected(null)
    } else {
      setFinished(true)
    }
  }

  function handleReset() {
    setCurrent(0); setSelected(null); setAnswers([]); setFinished(false)
  }

  const score = answers.filter(Boolean).length
  const pct = Math.round((score / QUIZ_QUESTIONS.length) * 100)

  if (finished) {
    return (
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-4 text-center">
        <Trophy className={`w-12 h-12 mx-auto mb-3 ${pct >= 80 ? 'text-amber-400' : pct >= 60 ? 'text-blue-400' : 'text-slate-400'}`} />
        <h3 className="text-lg font-bold text-white mb-1">{pct >= 80 ? '¡Excelente!' : pct >= 60 ? '¡Bien!' : 'Sigue practicando'}</h3>
        <p className="text-3xl font-bold mb-1" style={{ color: pct >= 80 ? '#fbbf24' : pct >= 60 ? '#60a5fa' : '#94a3b8' }}>{score}/{QUIZ_QUESTIONS.length}</p>
        <p className="text-sm text-slate-400 mb-4">{pct}% correcto</p>
        <p className="text-xs text-slate-500 mb-4">
          {pct >= 80 ? 'Tienes una base financiera sólida. ¡Sigue aprendiendo!' : pct >= 60 ? 'Vas bien. Repasa las mini-lecciones para mejorar.' : 'Te recomendamos repasar el glosario y las mini-lecciones.'}
        </p>
        <button onClick={handleReset}
          className="flex items-center gap-2 mx-auto px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-900 font-semibold rounded-xl text-sm">
          <RotateCcw className="w-4 h-4" /> Intentar de nuevo
        </button>
      </div>
    )
  }

  const q = QUIZ_QUESTIONS[current]

  return (
    <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-white flex items-center gap-2">
          <HelpCircle className="w-4 h-4 text-amber-400" /> Quiz financiero
        </h3>
        <span className="text-xs text-slate-500">{current + 1}/{QUIZ_QUESTIONS.length}</span>
      </div>
      {/* Progress */}
      <div className="h-1.5 bg-slate-700 rounded-full mb-4 overflow-hidden">
        <div className="h-full bg-amber-500 rounded-full transition-all"
          style={{ width: `${((current) / QUIZ_QUESTIONS.length) * 100}%` }} />
      </div>
      <p className="text-sm font-medium text-white mb-3 leading-relaxed">{q.q}</p>
      <div className="space-y-2 mb-3">
        {q.options.map((opt, i) => {
          let style = 'bg-slate-900/50 border-slate-600/50 text-slate-300 hover:bg-slate-700/50'
          if (selected !== null) {
            if (i === q.correct) style = 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300'
            else if (i === selected && i !== q.correct) style = 'bg-red-500/20 border-red-500/50 text-red-300'
            else style = 'bg-slate-900/30 border-slate-700/30 text-slate-500'
          }
          return (
            <button key={i} onClick={() => handleAnswer(i)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl border text-sm text-left transition-colors ${style}`}>
              {selected !== null && (
                i === q.correct ? <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" /> :
                i === selected ? <XCircle className="w-4 h-4 text-red-400 flex-shrink-0" /> :
                <div className="w-4 h-4 flex-shrink-0" />
              )}
              <span>{opt}</span>
            </button>
          )
        })}
      </div>
      {selected !== null && (
        <div className={`rounded-xl p-3 mb-3 text-xs leading-relaxed ${selected === q.correct ? 'bg-emerald-500/10 text-emerald-300' : 'bg-red-500/10 text-red-300'}`}>
          {q.explanation}
        </div>
      )}
      {selected !== null && (
        <button onClick={handleNext}
          className="w-full py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-900 font-semibold rounded-xl text-sm">
          {current < QUIZ_QUESTIONS.length - 1 ? 'Siguiente pregunta →' : 'Ver resultados'}
        </button>
      )}
    </div>
  )
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
const SECTIONS = [
  { id: 'tip', label: 'Tip del día', icon: Lightbulb },
  { id: 'lessons', label: 'Lecciones', icon: GraduationCap },
  { id: 'quiz', label: 'Quiz', icon: HelpCircle },
  { id: 'glossary', label: 'Glosario', icon: Library },
  { id: 'books', label: 'Libros', icon: BookOpen },
]

export default function EducationTab({ profile }) {
  const [section, setSection] = useState('tip')
  const currentStep = profile.current_baby_step || 1

  return (
    <div className="space-y-4">
      {/* Section tabs */}
      <div className="flex gap-1.5 overflow-x-auto pb-1">
        {SECTIONS.map(s => {
          const Icon = s.icon
          const active = section === s.id
          return (
            <button key={s.id} onClick={() => setSection(s.id)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-colors flex-shrink-0 ${active ? 'bg-amber-500 text-slate-900' : 'bg-slate-800/50 text-slate-400 hover:text-white border border-slate-700/50'}`}>
              <Icon className="w-3.5 h-3.5" />
              {s.label}
            </button>
          )
        })}
      </div>

      {section === 'tip' && <DailyTip />}
      {section === 'lessons' && <MiniLessons />}
      {section === 'quiz' && <Quiz />}
      {section === 'glossary' && <Glossary />}
      {section === 'books' && <BookRecommendation currentStep={currentStep} />}
    </div>
  )
}
