import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { X, PlusCircle, Loader2 } from 'lucide-react'
import { formatMoney } from '../utils/formatting'

export default function GoalContributeModal({ profile, goal, onClose, onSaved }) {
  const [amount, setAmount] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const remaining = Number(goal.target_amount) - Number(goal.current_amount)

  const quickAmounts = [
    Math.round(remaining * 0.25),
    Math.round(remaining * 0.5),
    Math.round(remaining),
  ].filter(v => v > 0)

  async function handleContribute(e) {
    e.preventDefault(); setError('')
    const contrib = Number(amount)
    if (!contrib || contrib <= 0) { setError('Ingresa un monto válido'); return }
    setSaving(true)
    const newAmount = Math.min(Number(goal.current_amount) + contrib, Number(goal.target_amount))
    const isComplete = newAmount >= Number(goal.target_amount)
    const { error: err } = await supabase.from('goals').update({
      current_amount: newAmount,
      ...(isComplete ? { status: 'completed' } : {}),
    }).eq('id', goal.id)
    setSaving(false)
    if (err) setError(err.message)
    else { onSaved(); onClose() }
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-0 sm:p-4" onClick={onClose}>
      <div onClick={e => e.stopPropagation()} className="w-full sm:max-w-sm bg-slate-800 border border-slate-700/50 rounded-t-2xl sm:rounded-2xl p-5">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-white">Agregar aporte</h3>
          <button onClick={onClose} className="p-1 hover:bg-slate-700 rounded-lg"><X className="w-5 h-5 text-slate-400" /></button>
        </div>
        <p className="text-sm text-slate-400 mb-4">
          Meta: <span className="text-white font-medium">{goal.name}</span>
          <span className="ml-2 text-slate-500">Falta: {formatMoney(remaining, profile.currency)}</span>
        </p>

        {/* Quick amounts */}
        <div className="flex gap-2 mb-4">
          {quickAmounts.map((q, i) => (
            <button key={i} type="button" onClick={() => setAmount(String(q))}
              className="flex-1 py-2 text-xs bg-slate-700/50 hover:bg-amber-500/20 hover:text-amber-400 rounded-lg transition-colors text-slate-300">
              {['25%', '50%', '100%'][i]}<br/>{formatMoney(q, profile.currency)}
            </button>
          ))}
        </div>

        <form onSubmit={handleContribute} className="space-y-3">
          <input type="number" required min="1" value={amount}
            onChange={e => setAmount(e.target.value)} placeholder="Monto a aportar"
            className="w-full px-3 py-3 bg-slate-900/50 border border-slate-600/50 rounded-xl text-white text-xl font-bold text-center focus:outline-none focus:ring-2 focus:ring-amber-500/50" />
          {error && <p className="text-red-400 text-sm">{error}</p>}
          <button type="submit" disabled={saving}
            className="w-full py-3 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-900 font-semibold rounded-xl transition-colors flex items-center justify-center gap-2">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <PlusCircle className="w-4 h-4" />}
            Agregar aporte
          </button>
        </form>
      </div>
    </div>
  )
}
