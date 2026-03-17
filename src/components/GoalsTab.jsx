import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { formatMoney } from '../utils/formatting'
import {
  Target, Plus, Edit3, Trash2, CheckCircle2, PlusCircle,
  Archive, Trophy, Calendar, TrendingUp, Zap, Shield, Info
} from 'lucide-react'
import GoalModal, { GOAL_TYPE_MAP } from './GoalModal'
import GoalContributeModal from './GoalContributeModal'

// Baby Steps linking
const BABY_STEP_LINKS = {
  emergency_fund: { step: 1, label: 'Baby Step 1 — Fondo inicial $1,000', color: 'text-blue-400' },
  debt_payoff:    { step: 2, label: 'Baby Step 2 — Eliminar deudas', color: 'text-red-400' },
  savings:        { step: 3, label: 'Baby Step 3 — Fondo emergencia completo', color: 'text-amber-400' },
  investment:     { step: 4, label: 'Baby Step 4 — Invertir 15%', color: 'text-emerald-400' },
  education:      { step: 5, label: 'Baby Step 5 — Educación hijos', color: 'text-cyan-400' },
  retirement:     { step: 7, label: 'Baby Step 7 — Construir riqueza', color: 'text-pink-400' },
}

function CelebrationOverlay({ goal, onClose }) {
  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div onClick={e => e.stopPropagation()} className="bg-slate-800 border border-amber-500/30 rounded-2xl p-8 text-center max-w-sm w-full">
        <div className="text-6xl mb-4">🎉</div>
        <Trophy className="w-12 h-12 text-amber-400 mx-auto mb-3" />
        <h2 className="text-2xl font-bold text-white mb-2">¡Meta lograda!</h2>
        <p className="text-amber-400 font-semibold text-lg mb-2">{goal.name}</p>
        <p className="text-slate-400 text-sm mb-6">Has alcanzado tu objetivo. ¡Estás construyendo tu libertad financiera!</p>
        <button onClick={onClose} className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-slate-900 font-semibold rounded-xl">
          ¡Gracias! 🚀
        </button>
      </div>
    </div>
  )
}

function GoalCard({ goal, profile, expenses, onEdit, onContribute, onDelete, onArchive }) {
  const pct = goal.target_amount > 0 ? Math.min(100, (goal.current_amount / goal.target_amount) * 100) : 0
  const remaining = Number(goal.target_amount) - Number(goal.current_amount)
  const typeInfo = GOAL_TYPE_MAP[goal.type] || GOAL_TYPE_MAP['other']
  const Icon = typeInfo.icon
  const babyLink = BABY_STEP_LINKS[goal.type]

  // Monthly savings needed
  let monthlySavings = null
  if (goal.target_date && remaining > 0) {
    const monthsLeft = Math.max(1, Math.ceil((new Date(goal.target_date) - new Date()) / (1000 * 60 * 60 * 24 * 30)))
    monthlySavings = Math.ceil(remaining / monthsLeft)
  }

  // Days left
  let daysLeft = null, isOverdue = false
  if (goal.target_date) {
    daysLeft = Math.ceil((new Date(goal.target_date) - new Date()) / (1000 * 60 * 60 * 24))
    isOverdue = daysLeft < 0
  }

  const isComplete = pct >= 100
  const priorityStars = '★'.repeat(goal.priority || 1) + '☆'.repeat(5 - (goal.priority || 1))

  // Emergency fund: auto months
  let emergencyMonths = null
  if (goal.type === 'emergency_fund' && expenses > 0) {
    emergencyMonths = (Number(goal.target_amount) / expenses).toFixed(1)
  }

  return (
    <div className={`bg-slate-900/50 rounded-2xl p-4 border transition-all ${isComplete ? 'border-amber-500/30' : 'border-slate-700/30'} group`}>
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${typeInfo.bg}`}>
            <Icon className={`${typeInfo.color}`} style={{ width: 18, height: 18 }} />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-white truncate">{goal.name}</p>
            <p className={`text-[10px] font-medium ${typeInfo.color}`}>{typeInfo.label}</p>
          </div>
        </div>
        {isComplete && (
          <div className="flex items-center gap-1 bg-amber-500/10 px-2 py-1 rounded-lg flex-shrink-0">
            <Trophy className="w-3 h-3 text-amber-400" />
            <span className="text-[10px] text-amber-400 font-semibold">¡Lograda!</span>
          </div>
        )}
      </div>

      {/* Baby Step link */}
      {babyLink && (
        <div className={`flex items-center gap-1.5 mb-2 text-[10px] ${babyLink.color}`}>
          <Info className="w-3 h-3" />
          <span>{babyLink.label}</span>
        </div>
      )}

      {/* Emergency fund months badge */}
      {emergencyMonths && (
        <div className="flex items-center gap-1.5 mb-2 bg-blue-500/10 rounded-lg px-2 py-1">
          <Shield className="w-3 h-3 text-blue-400" />
          <span className="text-[10px] text-blue-400">
            Cubre {emergencyMonths} {Number(emergencyMonths) === 1 ? 'mes' : 'meses'} de gastos
          </span>
        </div>
      )}

      {/* Progress */}
      <div className="mb-3">
        <div className="flex justify-between text-xs mb-1">
          <span className="text-slate-400">{pct.toFixed(0)}% completado</span>
          <span className="text-white font-semibold">{formatMoney(goal.current_amount, profile.currency)}</span>
        </div>
        <div className="h-2.5 bg-slate-700/50 rounded-full overflow-hidden">
          <div className={`h-full rounded-full transition-all duration-700 ${isComplete ? 'bg-amber-500' : 'bg-emerald-500'}`}
            style={{ width: `${pct}%` }} />
        </div>
        <div className="flex justify-between text-[10px] text-slate-500 mt-1">
          <span>Falta: {formatMoney(remaining, profile.currency)}</span>
          <span>Meta: {formatMoney(goal.target_amount, profile.currency)}</span>
        </div>
      </div>

      {/* Metadata row */}
      <div className="flex flex-wrap gap-2 mb-3">
        <span className="text-[10px] text-amber-400/70">{priorityStars}</span>
        {goal.target_date && (
          <div className={`flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-lg ${isOverdue ? 'bg-red-500/10 text-red-400' : daysLeft <= 30 ? 'bg-orange-500/10 text-orange-400' : 'bg-slate-700/40 text-slate-400'}`}>
            <Calendar className="w-3 h-3" />
            {isOverdue ? `Venció hace ${Math.abs(daysLeft)}d` : `${daysLeft}d restantes`}
          </div>
        )}
        {monthlySavings && !isComplete && (
          <div className="flex items-center gap-1 text-[10px] bg-slate-700/40 text-slate-400 px-2 py-0.5 rounded-lg">
            <TrendingUp className="w-3 h-3" />
            {formatMoney(monthlySavings, profile.currency)}/mes
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
        {!isComplete && (
          <button onClick={() => onContribute(goal)}
            className="flex items-center gap-1 text-[10px] text-emerald-400 hover:text-emerald-300 px-2.5 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 rounded-lg transition-colors">
            <PlusCircle className="w-3 h-3" /> Aportar
          </button>
        )}
        <button onClick={() => onEdit(goal)}
          className="flex items-center gap-1 text-[10px] text-slate-400 hover:text-white px-2.5 py-1.5 bg-slate-800 rounded-lg">
          <Edit3 className="w-3 h-3" /> Editar
        </button>
        {isComplete && (
          <button onClick={() => onArchive(goal.id)}
            className="flex items-center gap-1 text-[10px] text-amber-400 px-2.5 py-1.5 bg-amber-500/10 rounded-lg">
            <Archive className="w-3 h-3" /> Archivar
          </button>
        )}
        <button onClick={() => onDelete(goal.id)}
          className="flex items-center gap-1 text-[10px] text-red-400 px-2.5 py-1.5 bg-slate-800 rounded-lg ml-auto">
          <Trash2 className="w-3 h-3" /> Eliminar
        </button>
      </div>
    </div>
  )
}

export default function GoalsTab({ goals, profile, onRefresh, monthlyIncome, expenses }) {
  const [showModal, setShowModal] = useState(false)
  const [editingGoal, setEditingGoal] = useState(null)
  const [contributeGoal, setContributeGoal] = useState(null)
  const [celebration, setCelebration] = useState(null)
  const [showCompleted, setShowCompleted] = useState(false)
  const [showEmergencyHelper, setShowEmergencyHelper] = useState(false)
  const [emergencyMonths, setEmergencyMonths] = useState(3)

  const activeGoals = goals.filter(g => g.status === 'active').sort((a, b) => (b.priority || 1) - (a.priority || 1))
  const completedGoals = goals.filter(g => g.status === 'completed')

  const totalMonthlyNeeded = activeGoals.reduce((acc, goal) => {
    if (!goal.target_date) return acc
    const monthsLeft = Math.max(1, Math.ceil((new Date(goal.target_date) - new Date()) / (1000 * 60 * 60 * 24 * 30)))
    const rem = Number(goal.target_amount) - Number(goal.current_amount)
    return acc + Math.max(0, Math.ceil(rem / monthsLeft))
  }, 0)

  const totalSaved = activeGoals.reduce((s, g) => s + Number(g.current_amount), 0)

  // Emergency fund auto-create
  const emergencyTarget = Math.round((expenses || monthlyIncome * 0.7) * emergencyMonths)

  async function createEmergencyFund() {
    await supabase.from('goals').insert({
      user_id: profile.id,
      name: `Fondo de emergencia (${emergencyMonths} meses)`,
      type: 'emergency_fund',
      target_amount: emergencyTarget,
      current_amount: 0,
      priority: 5,
      status: 'active',
    })
    setShowEmergencyHelper(false)
    onRefresh()
  }

  function handleEdit(goal) { setEditingGoal(goal); setShowModal(true) }
  function handleContribute(goal) { setContributeGoal(goal) }

  async function handleDelete(id) {
    if (!confirm('¿Eliminar esta meta?')) return
    await supabase.from('goals').delete().eq('id', id)
    onRefresh()
  }

  async function handleArchive(id) {
    await supabase.from('goals').update({ status: 'completed' }).eq('id', id)
    onRefresh()
  }

  async function handleContributed() {
    await onRefresh()
    const { data } = await supabase.from('goals').select('*')
      .eq('user_id', profile.id).eq('status', 'completed')
      .order('updated_at', { ascending: false }).limit(1)
    if (data?.length) {
      const recent = data[0]
      if (new Date() - new Date(recent.updated_at) < 5000) setCelebration(recent)
    }
  }

  const hasEmergencyGoal = goals.some(g => g.type === 'emergency_fund')

  return (
    <div className="space-y-4">
      {/* Summary */}
      <div className="grid grid-cols-3 gap-2">
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-3 text-center">
          <p className="text-lg font-bold text-amber-400">{activeGoals.length}</p>
          <p className="text-[10px] text-slate-500 mt-0.5">Activas</p>
        </div>
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-3 text-center">
          <p className="text-sm font-bold text-emerald-400 truncate">{formatMoney(totalSaved, profile.currency)}</p>
          <p className="text-[10px] text-slate-500 mt-0.5">Ahorrado</p>
        </div>
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-3 text-center">
          <p className="text-sm font-bold text-blue-400 truncate">{formatMoney(totalMonthlyNeeded, profile.currency)}</p>
          <p className="text-[10px] text-slate-500 mt-0.5">Necesitas/mes</p>
        </div>
      </div>

      {/* Savings capacity warning */}
      {totalMonthlyNeeded > 0 && monthlyIncome > 0 && (
        <div className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs ${totalMonthlyNeeded > monthlyIncome * 0.3 ? 'bg-red-500/10 text-red-400' : 'bg-emerald-500/10 text-emerald-400'}`}>
          <Zap className="w-4 h-4 flex-shrink-0" />
          {totalMonthlyNeeded > monthlyIncome * 0.3
            ? `Tus metas requieren ${((totalMonthlyNeeded / monthlyIncome) * 100).toFixed(0)}% de tu ingreso. Considera extender las fechas.`
            : `Tus metas usan ${((totalMonthlyNeeded / monthlyIncome) * 100).toFixed(0)}% de tu ingreso. ¡Muy bien!`}
        </div>
      )}

      {/* Emergency fund quick create */}
      {!hasEmergencyGoal && expenses > 0 && (
        <div className="bg-blue-500/10 border border-blue-500/20 rounded-2xl p-4">
          <div className="flex items-start gap-3">
            <Shield className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-semibold text-white">¿Tienes fondo de emergencia?</p>
              <p className="text-xs text-slate-400 mt-0.5">
                Ramsey recomienda 3-6 meses de gastos. Basado en tus gastos: {formatMoney(expenses, profile.currency)}/mes
              </p>
              {!showEmergencyHelper ? (
                <button onClick={() => setShowEmergencyHelper(true)}
                  className="mt-2 text-xs text-blue-400 hover:text-blue-300 underline">
                  Crear meta automáticamente →
                </button>
              ) : (
                <div className="mt-3 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400">Meses de cobertura: <span className="text-white font-bold">{emergencyMonths}</span></span>
                    <span className="text-blue-400 font-semibold">{formatMoney(emergencyTarget, profile.currency)}</span>
                  </div>
                  <input type="range" min="1" max="12" value={emergencyMonths}
                    onChange={e => setEmergencyMonths(Number(e.target.value))} className="w-full" />
                  <div className="flex gap-2">
                    <button onClick={createEmergencyFund}
                      className="flex-1 py-2 bg-blue-500 hover:bg-blue-400 text-white rounded-xl text-xs font-semibold">
                      Crear meta ({emergencyMonths} meses)
                    </button>
                    <button onClick={() => setShowEmergencyHelper(false)}
                      className="px-3 py-2 bg-slate-700 rounded-xl text-xs text-slate-400">
                      Cancelar
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Goals list */}
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-4">
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-sm font-semibold text-white flex items-center gap-2">
            <Target className="w-4 h-4 text-amber-400" /> Metas activas
          </h3>
          <button onClick={() => { setEditingGoal(null); setShowModal(true) }}
            className="flex items-center gap-1 text-xs text-amber-400 hover:text-amber-300">
            <Plus className="w-3.5 h-3.5" /> Nueva
          </button>
        </div>

        {activeGoals.length === 0 ? (
          <div className="text-center py-10">
            <Target className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <p className="text-slate-400">No tienes metas activas</p>
            <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">Define hacia dónde va tu dinero.</p>
            <button onClick={() => { setEditingGoal(null); setShowModal(true) }}
              className="mt-4 px-4 py-2 bg-amber-500 text-slate-900 rounded-xl text-sm font-semibold">
              Crear primera meta
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {activeGoals.map(g => (
              <GoalCard key={g.id} goal={g} profile={profile} expenses={expenses}
                onEdit={handleEdit} onContribute={handleContribute}
                onDelete={handleDelete} onArchive={handleArchive} />
            ))}
          </div>
        )}
      </div>

      {/* Completed goals */}
      {completedGoals.length > 0 && (
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-4">
          <button onClick={() => setShowCompleted(s => !s)}
            className="w-full flex justify-between items-center text-sm font-semibold text-white">
            <span className="flex items-center gap-2">
              <Trophy className="w-4 h-4 text-amber-400" /> Logradas ({completedGoals.length})
            </span>
            <span className="text-slate-500 text-xs">{showCompleted ? '▲' : '▼'}</span>
          </button>
          {showCompleted && (
            <div className="mt-3 space-y-2">
              {completedGoals.map(g => {
                const typeInfo = GOAL_TYPE_MAP[g.type] || GOAL_TYPE_MAP['other']
                const Icon = typeInfo.icon
                return (
                  <div key={g.id} className="flex items-center gap-3 py-2 opacity-70">
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${typeInfo.bg}`}>
                      <Icon className={`w-4 h-4 ${typeInfo.color}`} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm text-slate-300 truncate">{g.name}</p>
                      <p className="text-xs text-slate-500">{formatMoney(g.target_amount, profile.currency)}</p>
                    </div>
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}

      {/* Modals */}
      {showModal && (
        <GoalModal profile={profile} goal={editingGoal}
          onClose={() => { setShowModal(false); setEditingGoal(null) }}
          onSaved={onRefresh} />
      )}
      {contributeGoal && (
        <GoalContributeModal profile={profile} goal={contributeGoal}
          onClose={() => setContributeGoal(null)}
          onSaved={handleContributed} />
      )}
      {celebration && (
        <CelebrationOverlay goal={celebration} onClose={() => setCelebration(null)} />
      )}
    </div>
  )
}
