import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { X, Save, Loader2, CreditCard, GraduationCap, Home, Car, Heart, Banknote, HelpCircle } from 'lucide-react'

const DEBT_TYPES = [
  { value: 'credit_card', label: 'Tarjeta de crédito', icon: CreditCard },
  { value: 'student_loan', label: 'Crédito educativo', icon: GraduationCap },
  { value: 'mortgage', label: 'Hipoteca', icon: Home },
  { value: 'car_loan', label: 'Crédito vehículo', icon: Car },
  { value: 'personal_loan', label: 'Préstamo personal', icon: Banknote },
  { value: 'medical', label: 'Deuda médica', icon: Heart },
  { value: 'other', label: 'Otro', icon: HelpCircle },
]

export default function DebtModal({ profile, debt = null, onClose, onSaved }) {
  const isEdit = !!debt
  const [form, setForm] = useState({
    name: '', type: 'credit_card', total_amount: '', current_balance: '',
    interest_rate: '', minimum_payment: '', due_day: '',
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (debt) setForm({
      name: debt.name || '', type: debt.type || 'credit_card',
      total_amount: debt.total_amount || '', current_balance: debt.current_balance || '',
      interest_rate: debt.interest_rate || '', minimum_payment: debt.minimum_payment || '',
      due_day: debt.due_day || '',
    })
  }, [debt])

  function update(field, value) { setForm(f => ({ ...f, [field]: value })) }

  async function handleSave(e) {
    e.preventDefault(); setError(''); setSaving(true)
    const payload = {
      user_id: profile.id, name: form.name, type: form.type,
      total_amount: Number(form.total_amount) || 0,
      current_balance: Number(form.current_balance) || 0,
      interest_rate: Number(form.interest_rate) || 0,
      minimum_payment: Number(form.minimum_payment) || 0,
      due_day: Number(form.due_day) || null,
    }
    const result = isEdit
      ? await supabase.from('debts').update(payload).eq('id', debt.id)
      : await supabase.from('debts').insert(payload)
    setSaving(false)
    if (result.error) setError(result.error.message)
    else { onSaved(); onClose() }
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-0 sm:p-4" onClick={onClose}>
      <div onClick={e => e.stopPropagation()} className="w-full sm:max-w-md bg-slate-800 border border-slate-700/50 rounded-t-2xl sm:rounded-2xl p-5 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-white">{isEdit ? 'Editar deuda' : 'Nueva deuda'}</h3>
          <button onClick={onClose} className="p-1 hover:bg-slate-700 rounded-lg"><X className="w-5 h-5 text-slate-400" /></button>
        </div>
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-sm text-slate-300 mb-1.5">Nombre de la deuda</label>
            <input type="text" required value={form.name} onChange={e => update('name', e.target.value)}
              placeholder="Ej: Tarjeta Visa, Icetex, Crédito carro"
              className="w-full px-3 py-2.5 bg-slate-900/50 border border-slate-600/50 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50" />
          </div>
          <div>
            <label className="block text-sm text-slate-300 mb-1.5">Tipo</label>
            <div className="grid grid-cols-2 gap-1.5">
              {DEBT_TYPES.map(dt => {
                const Icon = dt.icon; const active = form.type === dt.value
                return (
                  <button key={dt.value} type="button" onClick={() => update('type', dt.value)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors text-left ${active ? 'bg-amber-500/20 text-amber-300 ring-1 ring-amber-500/30' : 'bg-slate-900/50 text-slate-300 hover:bg-slate-700/50'}`}>
                    <Icon className="w-4 h-4 flex-shrink-0" /><span className="truncate">{dt.label}</span>
                  </button>
                )
              })}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm text-slate-300 mb-1.5">Monto total original</label>
              <input type="number" required min="1" value={form.total_amount} onChange={e => update('total_amount', e.target.value)} placeholder="0"
                className="w-full px-3 py-2.5 bg-slate-900/50 border border-slate-600/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50" />
            </div>
            <div>
              <label className="block text-sm text-slate-300 mb-1.5">Saldo actual</label>
              <input type="number" required min="0" value={form.current_balance} onChange={e => update('current_balance', e.target.value)} placeholder="0"
                className="w-full px-3 py-2.5 bg-slate-900/50 border border-slate-600/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50" />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-sm text-slate-300 mb-1.5">Interés % anual</label>
              <input type="number" min="0" step="0.1" value={form.interest_rate} onChange={e => update('interest_rate', e.target.value)} placeholder="0"
                className="w-full px-3 py-2.5 bg-slate-900/50 border border-slate-600/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50" />
            </div>
            <div>
              <label className="block text-sm text-slate-300 mb-1.5">Pago mínimo</label>
              <input type="number" min="0" value={form.minimum_payment} onChange={e => update('minimum_payment', e.target.value)} placeholder="0"
                className="w-full px-3 py-2.5 bg-slate-900/50 border border-slate-600/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50" />
            </div>
            <div>
              <label className="block text-sm text-slate-300 mb-1.5">Día de pago</label>
              <input type="number" min="1" max="31" value={form.due_day} onChange={e => update('due_day', e.target.value)} placeholder="15"
                className="w-full px-3 py-2.5 bg-slate-900/50 border border-slate-600/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50" />
            </div>
          </div>
          {error && <p className="text-red-400 text-sm">{error}</p>}
          <button type="submit" disabled={saving}
            className="w-full py-3 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-900 font-semibold rounded-xl transition-colors flex items-center justify-center gap-2">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {isEdit ? 'Actualizar' : 'Agregar deuda'}
          </button>
        </form>
      </div>
    </div>
  )
}
