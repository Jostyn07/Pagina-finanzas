import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { X, Save, Loader2, Shield, CreditCard, PiggyBank, TrendingUp, GraduationCap, Home, Heart, ShoppingBag, HelpCircle } from 'lucide-react'

const GOAL_TYPES = [
  { value: 'emergency_fund', label: 'Fondo emergencia', icon: Shield, color: 'text-blue-400', ring: 'ring-blue-500/30', bg: 'bg-blue-500/20' },
  { value: 'debt_payoff',    label: 'Pagar deuda',      icon: CreditCard, color: 'text-red-400', ring: 'ring-red-500/30', bg: 'bg-red-500/20' },
  { value: 'savings',        label: 'Ahorro general',   icon: PiggyBank, color: 'text-amber-400', ring: 'ring-amber-500/30', bg: 'bg-amber-500/20' },
  { value: 'investment',     label: 'Inversión',        icon: TrendingUp, color: 'text-emerald-400', ring: 'ring-emerald-500/30', bg: 'bg-emerald-500/20' },
  { value: 'purchase',       label: 'Compra grande',    icon: ShoppingBag, color: 'text-purple-400', ring: 'ring-purple-500/30', bg: 'bg-purple-500/20' },
  { value: 'retirement',     label: 'Retiro',           icon: Heart, color: 'text-pink-400', ring: 'ring-pink-500/30', bg: 'bg-pink-500/20' },
  { value: 'education',      label: 'Educación',        icon: GraduationCap, color: 'text-cyan-400', ring: 'ring-cyan-500/30', bg: 'bg-cyan-500/20' },
  { value: 'other',          label: 'Otro',             icon: HelpCircle, color: 'text-slate-400', ring: 'ring-slate-500/30', bg: 'bg-slate-500/20' },
]

export const GOAL_TYPE_MAP = Object.fromEntries(GOAL_TYPES.map(g => [g.value, g]))

export default function GoalModal({ profile, goal = null, onClose, onSaved }) {
  const isEdit = !!goal
  const [form, setForm] = useState({
    name: '', type: 'savings', target_amount: '', current_amount: '',
    target_date: '', priority: 3,
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (goal) setForm({
      name: goal.name || '',
      type: goal.type || 'savings',
      target_amount: goal.target_amount || '',
      current_amount: goal.current_amount || '',
      target_date: goal.target_date || '',
      priority: goal.priority || 3,
    })
  }, [goal])

  function update(field, value) { setForm(f => ({ ...f, [field]: value })) }

  async function handleSave(e) {
    e.preventDefault(); setError(''); setSaving(true)
    const payload = {
      user_id: profile.id, name: form.name, type: form.type,
      target_amount: Number(form.target_amount) || 0,
      current_amount: Number(form.current_amount) || 0,
      target_date: form.target_date || null,
      priority: Number(form.priority),
      status: 'active',
    }
    const result = isEdit
      ? await supabase.from('goals').update(payload).eq('id', goal.id)
      : await supabase.from('goals').insert(payload)
    setSaving(false)
    if (result.error) setError(result.error.message)
    else { onSaved(); onClose() }
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-0 sm:p-4" onClick={onClose}>
      <div onClick={e => e.stopPropagation()} className="w-full sm:max-w-md bg-slate-800 border border-slate-700/50 rounded-t-2xl sm:rounded-2xl p-5 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-white">{isEdit ? 'Editar meta' : 'Nueva meta'}</h3>
          <button onClick={onClose} className="p-1 hover:bg-slate-700 rounded-lg"><X className="w-5 h-5 text-slate-400" /></button>
        </div>
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-sm text-slate-300 mb-1.5">Nombre de la meta</label>
            <input type="text" required value={form.name} onChange={e => update('name', e.target.value)}
              placeholder="Ej: Fondo de emergencia, Viaje a Europa, iPhone..."
              className="w-full px-3 py-2.5 bg-slate-900/50 border border-slate-600/50 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50" />
          </div>

          <div>
            <label className="block text-sm text-slate-300 mb-1.5">Tipo de meta</label>
            <div className="grid grid-cols-2 gap-1.5">
              {GOAL_TYPES.map(gt => {
                const Icon = gt.icon; const active = form.type === gt.value
                return (
                  <button key={gt.value} type="button" onClick={() => update('type', gt.value)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors text-left ${active ? `${gt.bg} ${gt.color} ring-1 ${gt.ring}` : 'bg-slate-900/50 text-slate-300 hover:bg-slate-700/50'}`}>
                    <Icon className="w-4 h-4 flex-shrink-0" /><span className="truncate">{gt.label}</span>
                  </button>
                )
              })}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm text-slate-300 mb-1.5">Meta total</label>
              <input type="number" required min="1" value={form.target_amount}
                onChange={e => update('target_amount', e.target.value)} placeholder="0"
                className="w-full px-3 py-2.5 bg-slate-900/50 border border-slate-600/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50" />
            </div>
            <div>
              <label className="block text-sm text-slate-300 mb-1.5">Ya tengo</label>
              <input type="number" min="0" value={form.current_amount}
                onChange={e => update('current_amount', e.target.value)} placeholder="0"
                className="w-full px-3 py-2.5 bg-slate-900/50 border border-slate-600/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm text-slate-300 mb-1.5">Fecha objetivo</label>
              <input type="date" value={form.target_date} onChange={e => update('target_date', e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-900/50 border border-slate-600/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50" />
            </div>
            <div>
              <label className="block text-sm text-slate-300 mb-1.5">Prioridad ({form.priority}/5)</label>
              <input type="range" min="1" max="5" value={form.priority}
                onChange={e => update('priority', e.target.value)} className="w-full mt-3" />
            </div>
          </div>

          {error && <p className="text-red-400 text-sm">{error}</p>}
          <button type="submit" disabled={saving}
            className="w-full py-3 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-900 font-semibold rounded-xl transition-colors flex items-center justify-center gap-2">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {isEdit ? 'Actualizar meta' : 'Crear meta'}
          </button>
        </form>
      </div>
    </div>
  )
}
