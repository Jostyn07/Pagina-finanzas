import { PieChart as PieIcon } from 'lucide-react'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts'
import { formatMoney } from '../utils/formatting'
import { BUDGET_GROUPS } from '../utils/constants'

export default function BudgetBars({ profile, transactions }) {
  const monthlyIncome = Number(profile.monthly_income) || 0

  const budgetData = Object.entries(BUDGET_GROUPS).map(([key, { label, color }]) => {
    const total = transactions
      .filter(t => t.type === 'expense' && t.categories?.budget_group === key)
      .reduce((s, t) => s + Number(t.amount), 0)
    const limit = monthlyIncome * (profile[`budget_${key}_pct`] || 0) / 100
    return { key, label, color, total, limit, pct: limit > 0 ? (total / limit * 100) : 0 }
  })

  const pieData = budgetData.filter(d => d.total > 0).map(d => ({ name: d.label, value: d.total, fill: d.color }))

  return (
    <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-4">
      <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
        <PieIcon className="w-4 h-4 text-amber-400" /> Presupuesto del mes
      </h3>
      <div className="space-y-3">
        {budgetData.map(b => (
          <div key={b.key}>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-slate-300">{b.label} ({profile[`budget_${b.key}_pct`]}%)</span>
              <span className={b.pct > 100 ? 'text-red-400 font-bold' : 'text-slate-400'}>
                {formatMoney(b.total, profile.currency)} / {formatMoney(b.limit, profile.currency)}
              </span>
            </div>
            <div className="h-2.5 bg-slate-700/50 rounded-full overflow-hidden">
              <div className="h-full rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, b.pct)}%`, backgroundColor: b.pct > 100 ? '#f87171' : b.color }} />
            </div>
          </div>
        ))}
      </div>
      {pieData.length > 0 && (
        <div className="mt-4 h-48">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={pieData} cx="50%" cy="50%" innerRadius={45} outerRadius={70} paddingAngle={3} dataKey="value">
                {pieData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
              </Pie>
              <Tooltip formatter={(val) => formatMoney(val, profile.currency)}
                contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 12, color: '#fff' }} />
              <Legend formatter={(val) => <span style={{ color: '#94a3b8', fontSize: 12 }}>{val}</span>} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  )
}
