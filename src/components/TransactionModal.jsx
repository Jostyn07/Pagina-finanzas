import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { X, TrendingDown, TrendingUp, Save, Loader2 } from 'lucide-react'

export default function TransactionModal({ profile, categories, onClose, onSaved }) {
  const [type, setType] = useState('expense')
  const [amount, setAmount] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [description, setDescription] = useState('')
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [saving, setSaving] = useState(false)

  const filtered = categories.filter(c => c.type === type)

  async function handleSave(e) {
    e.preventDefault()
    setSaving(true)
    const { error } = await supabase.from('transactions').insert({
      user_id: profile.id, type, amount: Number(amount),
      category_id: categoryId || null, description, date,
    })
    setSaving(false)
    if (!error) { onSaved(); onClose() }
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-0 sm:p-4" onClick={onClose}>
      <div onClick={e => e.stopPropagation()} className="w-full sm:max-w-md bg-slate-800 border border-slate-700/50 rounded-t-2xl sm:rounded-2xl p-5 max-h-[85vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-white">Nueva transacción</h3>
          <button onClick={onClose} className="p-1 hover:bg-slate-700 rounded-lg"><X className="w-5 h-5 text-slate-400" /></button>
        </div>

        <form onSubmit={handleSave} className="space-y-4">
          <div className="flex bg-slate-900/50 rounded-xl p-1">
            {[['expense', 'Gasto', TrendingDown], ['income', 'Ingreso', TrendingUp]].map(([t, l, Icon]) => (
              <button key={t} type="button" onClick={() => { setType(t); setCategoryId('') }}
                className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-1.5 ${type === t ? (t === 'expense' ? 'bg-red-500/20 text-red-400' : 'bg-emerald-500/20 text-emerald-400') : 'text-slate-400'}`}>
                <Icon className="w-4 h-4" />{l}
              </button>
            ))}
          </div>

          <div>
            <label className="block text-sm text-slate-300 mb-1.5">Monto</label>
            <input type="number" required min="1" value={amount} onChange={e => setAmount(e.target.value)} placeholder="0"
              className="w-full px-3 py-2.5 bg-slate-900/50 border border-slate-600/50 rounded-xl text-white text-xl font-bold focus:outline-none focus:ring-2 focus:ring-amber-500/50" />
          </div>

          <div>
            <label className="block text-sm text-slate-300 mb-1.5">Categoría</label>
            <div className="grid grid-cols-2 gap-1.5 max-h-36 overflow-y-auto">
              {filtered.map(c => (
                <button key={c.id} type="button" onClick={() => setCategoryId(c.id)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors text-left ${categoryId === c.id ? 'bg-amber-500/20 text-amber-300 ring-1 ring-amber-500/30' : 'bg-slate-900/50 text-slate-300 hover:bg-slate-700/50'}`}>
                  <span>{c.icon}</span><span className="truncate">{c.name}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm text-slate-300 mb-1.5">Fecha</label>
              <input type="date" value={date} onChange={e => setDate(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-900/50 border border-slate-600/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50" />
            </div>
            <div>
              <label className="block text-sm text-slate-300 mb-1.5">Descripción</label>
              <input type="text" value={description} onChange={e => setDescription(e.target.value)} placeholder="Opcional"
                className="w-full px-3 py-2.5 bg-slate-900/50 border border-slate-600/50 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50" />
            </div>
          </div>

          <button type="submit" disabled={saving || !amount}
            className="w-full py-3 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-900 font-semibold rounded-xl transition-colors flex items-center justify-center gap-2">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Guardar
          </button>
        </form>
      </div>
    </div>
  )
}
