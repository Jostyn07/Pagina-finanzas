import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { formatMoney } from '../utils/formatting'
import { CreditCard, Plus, Edit3, Trash2, AlertTriangle, CheckCircle2, TrendingDown, Calendar } from 'lucide-react'
import DebtModal from './DebtModal'
import SnowballSimulator from './SnowballSimulator'

function DTIGauge({ dti, income, totalMinPayments, currency }) {
  const clampedDti = Math.min(100, dti)
  const getColor = () => {
    if (dti <= 15) return { color: '#34d399', label: 'Excelente', desc: 'Tu nivel de deuda es muy saludable' }
    if (dti <= 25) return { color: '#fbbf24', label: 'Aceptable', desc: 'Margen razonable, evita nuevas deudas' }
    if (dti <= 36) return { color: '#f97316', label: 'Moderado', desc: 'Cerca del límite recomendado (36%)' }
    if (dti <= 50) return { color: '#f87171', label: 'Alto', desc: 'Difícil obtener créditos nuevos' }
    return { color: '#dc2626', label: 'Crítico', desc: 'Prioriza reducir deudas urgentemente' }
  }
  const { color, label, desc } = getColor()

  return (
    <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-4">
      <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
        <TrendingDown className="w-4 h-4 text-amber-400" /> Ratio deuda-ingreso (DTI)
      </h3>
      <div className="flex items-center gap-4">
        <div className="relative w-24 h-24 flex-shrink-0">
          <svg width="96" height="96" className="-rotate-90">
            <circle cx="48" cy="48" r="38" fill="none" stroke="#334155" strokeWidth="8" />
            <circle cx="48" cy="48" r="38" fill="none" stroke={color} strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={2 * Math.PI * 38}
              strokeDashoffset={2 * Math.PI * 38 * (1 - clampedDti / 100)}
              style={{ transition: 'stroke-dashoffset 0.8s ease' }} />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-xl font-bold" style={{ color }}>{dti.toFixed(1)}%</span>
          </div>
        </div>
        <div className="space-y-1.5 min-w-0">
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full" style={{ background: color }} />
            <span className="text-sm font-semibold text-white">{label}</span>
          </div>
          <p className="text-xs text-slate-400">{desc}</p>
          <div className="text-xs text-slate-500 space-y-0.5">
            <p>Pagos mensuales: {formatMoney(totalMinPayments, currency)}</p>
            <p>Ingreso mensual: {formatMoney(income, currency)}</p>
          </div>
          <div className="flex gap-1 mt-1">
            {[15, 25, 36, 50].map(threshold => (
              <div key={threshold} className={`text-[9px] px-1.5 py-0.5 rounded ${dti <= threshold ? 'bg-slate-700 text-slate-400' : 'bg-red-500/10 text-red-400'}`}>
                {threshold}%
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function DebtsTab({ debts, profile, onRefresh }) {
  const [showModal, setShowModal] = useState(false)
  const [editingDebt, setEditingDebt] = useState(null)
  const [showSimulator, setShowSimulator] = useState(false)

  const activeDebts = debts.filter(d => d.is_active)
  const totalBalance = activeDebts.reduce((s, d) => s + Number(d.current_balance), 0)
  const totalMinPayments = activeDebts.reduce((s, d) => s + Number(d.minimum_payment || 0), 0)
  const monthlyIncome = Number(profile.monthly_income) || 1
  const dti = (totalMinPayments / monthlyIncome) * 100

  function handleEdit(debt) {
    setEditingDebt(debt)
    setShowModal(true)
  }

  async function handleDelete(id) {
    await supabase.from('debts').delete().eq('id', id)
    onRefresh()
  }

  async function handleMarkPaid(id) {
    await supabase.from('debts').update({ is_active: false, current_balance: 0, paid_off_date: new Date().toISOString().split('T')[0] }).eq('id', id)
    onRefresh()
  }

  const typeIcons = {
    credit_card: '💳', student_loan: '🎓', mortgage: '🏠', car_loan: '🚗',
    personal_loan: '💰', medical: '🏥', other: '📦',
  }

  function getDaysUntilDue(dueDay) {
    if (!dueDay) return null
    const now = new Date()
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), dueDay)
    const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, dueDay)
    const target = thisMonth >= now ? thisMonth : nextMonth
    return Math.ceil((target - now) / (1000 * 60 * 60 * 24))
  }

  return (
    <div className="space-y-4">
      {/* Summary cards */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-4">
          <p className="text-xs text-slate-500">Deuda total</p>
          <p className="text-xl font-bold text-red-400 mt-1">{formatMoney(totalBalance, profile.currency)}</p>
          <p className="text-xs text-slate-500 mt-1">{activeDebts.length} deuda{activeDebts.length !== 1 ? 's' : ''} activa{activeDebts.length !== 1 ? 's' : ''}</p>
        </div>
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-4">
          <p className="text-xs text-slate-500">Pago mínimo mensual</p>
          <p className="text-xl font-bold text-amber-400 mt-1">{formatMoney(totalMinPayments, profile.currency)}</p>
          <p className="text-xs text-slate-500 mt-1">{((totalMinPayments / monthlyIncome) * 100).toFixed(1)}% de tu ingreso</p>
        </div>
      </div>

      {/* DTI Gauge */}
      <DTIGauge dti={dti} income={monthlyIncome} totalMinPayments={totalMinPayments} currency={profile.currency} />

      {/* Debt list */}
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-4">
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-sm font-semibold text-white flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-amber-400" /> Deudas activas
          </h3>
          <button onClick={() => { setEditingDebt(null); setShowModal(true) }}
            className="flex items-center gap-1 text-xs text-amber-400 hover:text-amber-300 transition-colors">
            <Plus className="w-3.5 h-3.5" /> Agregar
          </button>
        </div>

        {activeDebts.length === 0 ? (
          <div className="text-center py-8">
            <CheckCircle2 className="w-12 h-12 text-emerald-500/30 mx-auto mb-3" />
            <p className="text-slate-400">No tienes deudas registradas</p>
            <p className="text-xs text-slate-500 mt-1">Agrega tus deudas para analizarlas y crear un plan de pago</p>
            <button onClick={() => { setEditingDebt(null); setShowModal(true) }}
              className="mt-3 px-4 py-2 bg-amber-500 text-slate-900 rounded-xl text-sm font-semibold">
              Agregar primera deuda
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            {activeDebts.map(d => {
              const paidPct = d.total_amount > 0 ? ((d.total_amount - d.current_balance) / d.total_amount * 100) : 0
              const daysUntil = getDaysUntilDue(d.due_day)
              const isUrgent = daysUntil !== null && daysUntil <= 5
              return (
                <div key={d.id} className="bg-slate-900/50 rounded-xl p-3 group">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="text-xl flex-shrink-0">{typeIcons[d.type] || '📦'}</span>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-white truncate">{d.name}</p>
                        <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                          {d.interest_rate > 0 && <span>{d.interest_rate}% anual</span>}
                          {d.due_day && (
                            <span className={`flex items-center gap-0.5 ${isUrgent ? 'text-red-400' : ''}`}>
                              <Calendar className="w-3 h-3" />
                              Día {d.due_day}
                              {daysUntil !== null && <span>({daysUntil}d)</span>}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-sm font-bold text-red-400">{formatMoney(d.current_balance, profile.currency)}</p>
                      {d.minimum_payment > 0 && (
                        <p className="text-[10px] text-slate-500">min: {formatMoney(d.minimum_payment, profile.currency)}/mes</p>
                      )}
                    </div>
                  </div>
                  {/* Progress bar */}
                  <div className="mt-2">
                    <div className="flex justify-between text-[10px] text-slate-500 mb-0.5">
                      <span>Pagado: {paidPct.toFixed(0)}%</span>
                      <span>de {formatMoney(d.total_amount, profile.currency)}</span>
                    </div>
                    <div className="h-1.5 bg-slate-700/50 rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-500 rounded-full transition-all" style={{ width: `${Math.min(100, paidPct)}%` }} />
                    </div>
                  </div>
                  {/* Actions */}
                  <div className="flex gap-1.5 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => handleEdit(d)} className="flex items-center gap-1 text-[10px] text-slate-400 hover:text-white px-2 py-1 bg-slate-800 rounded-lg">
                      <Edit3 className="w-3 h-3" /> Editar
                    </button>
                    <button onClick={() => handleMarkPaid(d.id)} className="flex items-center gap-1 text-[10px] text-emerald-400 hover:text-emerald-300 px-2 py-1 bg-slate-800 rounded-lg">
                      <CheckCircle2 className="w-3 h-3" /> Pagada
                    </button>
                    <button onClick={() => handleDelete(d.id)} className="flex items-center gap-1 text-[10px] text-red-400 hover:text-red-300 px-2 py-1 bg-slate-800 rounded-lg">
                      <Trash2 className="w-3 h-3" /> Eliminar
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Snowball Simulator toggle */}
      {activeDebts.length >= 2 && (
        <>
          <button onClick={() => setShowSimulator(!showSimulator)}
            className="w-full py-3 bg-slate-800/50 border border-slate-700/50 rounded-2xl text-sm font-medium text-white hover:bg-slate-700/50 transition-colors flex items-center justify-center gap-2">
            {showSimulator ? 'Ocultar simulador' : '⚡ Simular plan de pago (Bola de nieve vs Avalancha)'}
          </button>
          {showSimulator && <SnowballSimulator debts={activeDebts} profile={profile} />}
        </>
      )}

      {/* Modal */}
      {showModal && (
        <DebtModal profile={profile} debt={editingDebt}
          onClose={() => { setShowModal(false); setEditingDebt(null) }}
          onSaved={onRefresh} />
      )}
    </div>
  )
}
