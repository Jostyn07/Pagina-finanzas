import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import { formatMoney } from '../utils/formatting'
import { Heart, ArrowRight, ArrowLeft, CheckCircle2, DollarSign, Loader2 } from 'lucide-react'
import { PieChart } from 'lucide-react'

export default function Onboarding() {
  const { profile, refreshProfile } = useAuth()
  const [step, setStep] = useState(1)
  const [data, setData] = useState({
    full_name: profile?.full_name || '',
    currency: profile?.currency || 'COP',
    monthly_income: profile?.monthly_income || '',
    budget_needs_pct: 50, budget_wants_pct: 30, budget_savings_pct: 20,
  })
  const [saving, setSaving] = useState(false)

  function update(field, value) { setData(d => ({ ...d, [field]: value })) }

  async function finish() {
    setSaving(true)
    await supabase.from('profiles').update({
      ...data,
      monthly_income: Number(data.monthly_income) || 0,
      onboarding_completed: true
    }).eq('id', profile.id)
    setSaving(false)
    refreshProfile()
  }

  const totalPct = Number(data.budget_needs_pct) + Number(data.budget_wants_pct) + Number(data.budget_savings_pct)
  const pctValid = totalPct === 100

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <div className="w-full max-w-lg">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-white">Configuremos tu perfil</h1>
          <p className="text-slate-400 mt-1">Paso {step} de 3</p>
          <div className="flex gap-2 justify-center mt-3">
            {[1,2,3].map(s => (
              <div key={s} className={`h-1.5 w-12 rounded-full transition-colors ${s <= step ? 'bg-amber-500' : 'bg-slate-700'}`} />
            ))}
          </div>
        </div>

        <div className="bg-slate-800/50 backdrop-blur border border-slate-700/50 rounded-2xl p-6">
          {step === 1 && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-white flex items-center gap-2"><Heart className="w-5 h-5 text-amber-400" /> Datos básicos</h2>
              <div>
                <label className="block text-sm text-slate-300 mb-1.5">Tu nombre</label>
                <input type="text" value={data.full_name} onChange={e => update('full_name', e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-900/50 border border-slate-600/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50" />
              </div>
              <div>
                <label className="block text-sm text-slate-300 mb-1.5">Moneda principal</label>
                <select value={data.currency} onChange={e => update('currency', e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-900/50 border border-slate-600/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50">
                  <option value="COP">COP — Peso Colombiano</option>
                  <option value="USD">USD — Dólar Americano</option>
                  <option value="EUR">EUR — Euro</option>
                  <option value="MXN">MXN — Peso Mexicano</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-slate-300 mb-1.5">Ingreso mensual neto</label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input type="number" value={data.monthly_income} onChange={e => update('monthly_income', e.target.value)}
                    placeholder="0"
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-900/50 border border-slate-600/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50" />
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-white flex items-center gap-2"><PieChart className="w-5 h-5 text-amber-400" /> Regla de presupuesto</h2>
              <p className="text-sm text-slate-400">Ajusta los porcentajes según tu realidad. La recomendación clásica es 50/30/20.</p>
              {[
                { key: 'budget_needs_pct', label: 'Necesidades', desc: 'Vivienda, comida, transporte, deudas mínimas', color: 'blue' },
                { key: 'budget_wants_pct', label: 'Deseos', desc: 'Entretenimiento, restaurantes, hobbies', color: 'amber' },
                { key: 'budget_savings_pct', label: 'Ahorro', desc: 'Fondo emergencia, inversión, pago extra deudas', color: 'emerald' },
              ].map(item => (
                <div key={item.key} className="space-y-1">
                  <div className="flex justify-between">
                    <span className="text-sm text-slate-300">{item.label}</span>
                    <span className={`text-sm font-bold text-${item.color}-400`}>{data[item.key]}%</span>
                  </div>
                  <input type="range" min="0" max="100" value={data[item.key]}
                    onChange={e => update(item.key, Number(e.target.value))} className="w-full" />
                  <p className="text-xs text-slate-500">{item.desc}</p>
                </div>
              ))}
              <div className={`text-center py-2 rounded-xl text-sm font-medium ${pctValid ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
                Total: {totalPct}% {pctValid ? '✓' : '(debe sumar 100%)'}
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-white flex items-center gap-2"><CheckCircle2 className="w-5 h-5 text-amber-400" /> Resumen</h2>
              <div className="bg-slate-900/50 rounded-xl p-4 space-y-3">
                <div className="flex justify-between"><span className="text-slate-400">Nombre</span><span className="text-white font-medium">{data.full_name || '—'}</span></div>
                <div className="flex justify-between"><span className="text-slate-400">Moneda</span><span className="text-white font-medium">{data.currency}</span></div>
                <div className="flex justify-between"><span className="text-slate-400">Ingreso mensual</span><span className="text-amber-400 font-bold">{formatMoney(data.monthly_income, data.currency)}</span></div>
                <div className="h-px bg-slate-700" />
                <div className="flex justify-between"><span className="text-slate-400">Necesidades ({data.budget_needs_pct}%)</span><span className="text-blue-400">{formatMoney(data.monthly_income * data.budget_needs_pct / 100, data.currency)}</span></div>
                <div className="flex justify-between"><span className="text-slate-400">Deseos ({data.budget_wants_pct}%)</span><span className="text-amber-300">{formatMoney(data.monthly_income * data.budget_wants_pct / 100, data.currency)}</span></div>
                <div className="flex justify-between"><span className="text-slate-400">Ahorro ({data.budget_savings_pct}%)</span><span className="text-emerald-400">{formatMoney(data.monthly_income * data.budget_savings_pct / 100, data.currency)}</span></div>
              </div>
              <p className="text-xs text-slate-500 text-center">Podrás cambiar todo esto después en Configuración</p>
            </div>
          )}

          <div className="flex gap-3 mt-6">
            {step > 1 && (
              <button onClick={() => setStep(s => s - 1)} className="flex-1 py-2.5 border border-slate-600 text-slate-300 rounded-xl hover:bg-slate-700/50 transition-colors flex items-center justify-center gap-1">
                <ArrowLeft className="w-4 h-4" /> Atrás
              </button>
            )}
            {step < 3 ? (
              <button onClick={() => setStep(s => s + 1)} disabled={step === 2 && !pctValid}
                className="flex-1 py-2.5 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-900 font-semibold rounded-xl transition-colors flex items-center justify-center gap-1">
                Siguiente <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button onClick={finish} disabled={saving}
                className="flex-1 py-2.5 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-900 font-semibold rounded-xl transition-colors flex items-center justify-center gap-2">
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                {saving ? 'Guardando...' : 'Empezar a usar FinWise'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
