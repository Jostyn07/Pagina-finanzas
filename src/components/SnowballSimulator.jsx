import { useState, useMemo } from 'react'
import { formatMoney } from '../utils/formatting'
import { Zap, Snowflake, ArrowDown, TrendingDown, Calendar, DollarSign, AlertTriangle } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend, Cell } from 'recharts'

function simulatePayoff(debts, method, extraPayment = 0) {
  if (!debts.length) return { months: 0, totalInterest: 0, totalPaid: 0, timeline: [] }

  let remaining = debts.map(d => ({
    name: d.name,
    balance: Number(d.current_balance),
    rate: Number(d.interest_rate) / 100 / 12,
    minPayment: Number(d.minimum_payment),
  }))

  const totalMinPayments = remaining.reduce((s, d) => s + d.minPayment, 0)
  const monthlyBudget = totalMinPayments + extraPayment

  let months = 0
  let totalInterest = 0
  let totalPaid = 0
  const timeline = []
  const maxMonths = 360

  while (remaining.some(d => d.balance > 0) && months < maxMonths) {
    months++
    let budgetLeft = monthlyBudget

    remaining.forEach(d => {
      if (d.balance <= 0) return
      const interest = d.balance * d.rate
      d.balance += interest
      totalInterest += interest
    })

    if (method === 'snowball') {
      remaining.sort((a, b) => a.balance - b.balance)
    } else {
      remaining.sort((a, b) => b.rate - a.rate)
    }

    remaining.forEach(d => {
      if (d.balance <= 0 || budgetLeft <= 0) return
      const payment = Math.min(d.balance, budgetLeft)
      d.balance -= payment
      budgetLeft -= payment
      totalPaid += payment
      if (d.balance < 0.01) d.balance = 0
    })

    if (months % 3 === 0 || remaining.every(d => d.balance <= 0)) {
      timeline.push({
        month: months,
        totalBalance: remaining.reduce((s, d) => s + d.balance, 0),
      })
    }
  }

  return { months, totalInterest, totalPaid, timeline }
}

export default function SnowballSimulator({ debts, profile }) {
  const [extraPayment, setExtraPayment] = useState(0)

  const activeDebts = debts.filter(d => Number(d.current_balance) > 0)

  const snowball = useMemo(() => simulatePayoff(activeDebts, 'snowball', extraPayment), [activeDebts, extraPayment])
  const avalanche = useMemo(() => simulatePayoff(activeDebts, 'avalanche', extraPayment), [activeDebts, extraPayment])

  if (activeDebts.length === 0) return null

  const interestSaved = snowball.totalInterest - avalanche.totalInterest
  const monthsDiff = snowball.months - avalanche.months

  const sortedSnowball = [...activeDebts].sort((a, b) => Number(a.current_balance) - Number(b.current_balance))
  const sortedAvalanche = [...activeDebts].sort((a, b) => Number(b.interest_rate) - Number(a.interest_rate))

  const comparisonData = [
    { name: 'Bola de nieve', months: snowball.months, interest: Math.round(snowball.totalInterest), fill: '#3b82f6' },
    { name: 'Avalancha', months: avalanche.months, interest: Math.round(avalanche.totalInterest), fill: '#10b981' },
  ]

  return (
    <div className="space-y-4">
      {/* Extra payment slider */}
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-4">
        <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
          <Zap className="w-4 h-4 text-amber-400" /> Simulador de pago de deudas
        </h3>
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-slate-400">Pago extra mensual</span>
            <span className="text-amber-400 font-bold">{formatMoney(extraPayment, profile.currency)}</span>
          </div>
          <input type="range" min="0" max={Math.max(500000, Number(profile.monthly_income) * 0.3)}
            step={profile.currency === 'COP' ? 10000 : 50}
            value={extraPayment} onChange={e => setExtraPayment(Number(e.target.value))}
            className="w-full" />
          <p className="text-xs text-slate-500">Cuánto extra puedes destinar mensualmente por encima de los pagos mínimos</p>
        </div>
      </div>

      {/* Method comparison */}
      <div className="grid grid-cols-2 gap-3">
        {/* Snowball */}
        <div className="bg-slate-800/50 border border-blue-500/20 rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center">
              <Snowflake className="w-4 h-4 text-blue-400" />
            </div>
            <div>
              <p className="text-sm font-semibold text-white">Bola de nieve</p>
              <p className="text-[10px] text-slate-500">Menor saldo primero</p>
            </div>
          </div>
          <div className="space-y-2">
            <div>
              <p className="text-xs text-slate-500">Tiempo total</p>
              <p className="text-lg font-bold text-blue-400">{snowball.months} meses</p>
            </div>
            <div>
              <p className="text-xs text-slate-500">Interés total</p>
              <p className="text-sm font-semibold text-slate-300">{formatMoney(snowball.totalInterest, profile.currency)}</p>
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-700/50">
            <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-1.5">Orden de pago</p>
            {sortedSnowball.map((d, i) => (
              <div key={d.id} className="flex items-center gap-1.5 py-0.5">
                <span className="text-[10px] text-blue-400 font-bold w-4">{i + 1}.</span>
                <span className="text-xs text-slate-300 truncate">{d.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Avalanche */}
        <div className="bg-slate-800/50 border border-emerald-500/20 rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center">
              <ArrowDown className="w-4 h-4 text-emerald-400" />
            </div>
            <div>
              <p className="text-sm font-semibold text-white">Avalancha</p>
              <p className="text-[10px] text-slate-500">Mayor interés primero</p>
            </div>
          </div>
          <div className="space-y-2">
            <div>
              <p className="text-xs text-slate-500">Tiempo total</p>
              <p className="text-lg font-bold text-emerald-400">{avalanche.months} meses</p>
            </div>
            <div>
              <p className="text-xs text-slate-500">Interés total</p>
              <p className="text-sm font-semibold text-slate-300">{formatMoney(avalanche.totalInterest, profile.currency)}</p>
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-700/50">
            <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-1.5">Orden de pago</p>
            {sortedAvalanche.map((d, i) => (
              <div key={d.id} className="flex items-center gap-1.5 py-0.5">
                <span className="text-[10px] text-emerald-400 font-bold w-4">{i + 1}.</span>
                <span className="text-xs text-slate-300 truncate">{d.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Insight */}
      {Math.abs(interestSaved) > 1 && (
        <div className={`rounded-xl p-3 flex items-start gap-2 ${interestSaved > 0 ? 'bg-emerald-500/10' : 'bg-blue-500/10'}`}>
          <AlertTriangle className={`w-4 h-4 mt-0.5 flex-shrink-0 ${interestSaved > 0 ? 'text-emerald-400' : 'text-blue-400'}`} />
          <p className="text-xs text-slate-300">
            {interestSaved > 0 ? (
              <>Con <span className="text-emerald-400 font-semibold">avalancha</span> ahorras {formatMoney(Math.abs(interestSaved), profile.currency)} en intereses
              {monthsDiff !== 0 && <> y {Math.abs(monthsDiff)} meses</>}. Pero <span className="text-blue-400 font-semibold">bola de nieve</span> te da victorias rápidas que mantienen la motivación.</>
            ) : (
              <>Ambos métodos son muy similares en tu caso. Elige el que prefieras: <span className="text-blue-400 font-semibold">bola de nieve</span> para motivación rápida, o <span className="text-emerald-400 font-semibold">avalancha</span> para optimizar matemáticamente.</>
            )}
          </p>
        </div>
      )}

      {/* Chart */}
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-4">
        <h4 className="text-sm font-semibold text-white mb-3">Comparación</h4>
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={comparisonData} barGap={8}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 12 }} />
              <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} tickFormatter={v => `${v}m`} yAxisId="left" />
              <YAxis orientation="right" tick={{ fill: '#94a3b8', fontSize: 11 }} tickFormatter={v => formatMoney(v, profile.currency)} yAxisId="right" />
              <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 12, color: '#fff' }}
                formatter={(val, name) => [name === 'months' ? `${val} meses` : formatMoney(val, profile.currency), name === 'months' ? 'Tiempo' : 'Interés']} />
              <Bar dataKey="months" yAxisId="left" radius={[6,6,0,0]} barSize={40}>
                {comparisonData.map((entry, i) => <Cell key={i} fill={entry.fill} opacity={0.7} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}
