import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { formatMoney, getHealthColor } from '../utils/formatting'
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line,
  XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  Legend, Cell
} from 'recharts'
import {
  TrendingUp, TrendingDown, BarChart3, Calendar,
  Zap, Award, ArrowUp, ArrowDown, Minus
} from 'lucide-react'

const MONTH_NAMES = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic']

function StatCard({ label, value, sub, trend, color = 'text-white' }) {
  return (
    <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-4">
      <p className="text-xs text-slate-500 mb-1">{label}</p>
      <p className={`text-xl font-bold ${color}`}>{value}</p>
      {sub && <p className="text-xs text-slate-500 mt-1">{sub}</p>}
      {trend !== undefined && (
        <div className={`flex items-center gap-1 mt-1 text-xs ${trend > 0 ? 'text-emerald-400' : trend < 0 ? 'text-red-400' : 'text-slate-400'}`}>
          {trend > 0 ? <ArrowUp className="w-3 h-3" /> : trend < 0 ? <ArrowDown className="w-3 h-3" /> : <Minus className="w-3 h-3" />}
          {Math.abs(trend).toFixed(1)}% vs mes anterior
        </div>
      )}
    </div>
  )
}

const CustomTooltip = ({ active, payload, label, currency }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-slate-800 border border-slate-600/50 rounded-xl p-3 text-xs shadow-xl">
      <p className="text-slate-400 mb-1.5 font-medium">{label}</p>
      {payload.map((p, i) => (
        <div key={i} className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full" style={{ background: p.color }} />
          <span className="text-slate-300">{p.name}:</span>
          <span className="text-white font-semibold">{formatMoney(p.value, currency)}</span>
        </div>
      ))}
    </div>
  )
}

export default function AnalyticsTab({ profile, transactions, healthScore, monthlyIncome, expenses, savingsRate }) {
  const [monthlyData, setMonthlyData] = useState([])
  const [topCategories, setTopCategories] = useState([])
  const [scoreHistory, setScoreHistory] = useState([])
  const [heatmapData, setHeatmapData] = useState([])
  const [loading, setLoading] = useState(true)
  const currency = profile.currency

  const loadHistoricalData = useCallback(async () => {
    setLoading(true)
    const now = new Date()

    // Load last 6 months of transactions
    const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1)
    const { data: txData } = await supabase
      .from('transactions')
      .select('*, categories(name, icon, budget_group)')
      .gte('date', sixMonthsAgo.toISOString().split('T')[0])
      .eq('user_id', profile.id)
      .order('date', { ascending: true })

    const txs = txData || []

    // Build monthly trend data (6 months)
    const monthly = []
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const month = d.getMonth()
      const year = d.getFullYear()
      const monthTxs = txs.filter(t => {
        const td = new Date(t.date)
        return td.getMonth() === month && td.getFullYear() === year
      })
      const inc = monthTxs.filter(t => t.type === 'income').reduce((s, t) => s + Number(t.amount), 0)
      const exp = monthTxs.filter(t => t.type === 'expense').reduce((s, t) => s + Number(t.amount), 0)
      const inc_ = monthlyIncome || inc
      monthly.push({
        name: MONTH_NAMES[month],
        Ingresos: Math.round(inc_ || inc),
        Gastos: Math.round(exp),
        Ahorro: Math.max(0, Math.round((inc_ || inc) - exp)),
        month, year,
      })
    }
    setMonthlyData(monthly)

    // Top 5 categories this month
    const thisMonthTxs = txs.filter(t => {
      const td = new Date(t.date)
      return td.getMonth() === now.getMonth() && td.getFullYear() === now.getFullYear() && t.type === 'expense'
    })
    const catMap = {}
    thisMonthTxs.forEach(t => {
      const name = t.categories?.name || 'Sin categoría'
      const icon = t.categories?.icon || '📦'
      if (!catMap[name]) catMap[name] = { name, icon, total: 0 }
      catMap[name].total += Number(t.amount)
    })
    const sorted = Object.values(catMap).sort((a, b) => b.total - a.total).slice(0, 5)
    const maxVal = sorted[0]?.total || 1
    setTopCategories(sorted.map(c => ({ ...c, pct: (c.total / maxVal) * 100 })))

    // Health score history (snapshots or estimated)
    const { data: snapshots } = await supabase
      .from('financial_snapshots')
      .select('month, year, health_score')
      .eq('user_id', profile.id)
      .order('year', { ascending: true })
      .order('month', { ascending: true })
      .limit(6)

    if (snapshots?.length) {
      setScoreHistory(snapshots.map(s => ({
        name: MONTH_NAMES[s.month - 1],
        Score: s.health_score,
      })))
    } else {
      // Estimate from monthly data
      setScoreHistory(monthly.map((m, i) => ({
        name: m.name,
        Score: i === monthly.length - 1 ? healthScore : Math.max(10, healthScore - (monthly.length - 1 - i) * 3),
      })))
    }

    // Heatmap: last 35 days of expenses
    const heatmap = []
    for (let i = 34; i >= 0; i--) {
      const d = new Date()
      d.setDate(d.getDate() - i)
      const dateStr = d.toISOString().split('T')[0]
      const dayTxs = txs.filter(t => t.date === dateStr && t.type === 'expense')
      const total = dayTxs.reduce((s, t) => s + Number(t.amount), 0)
      heatmap.push({ date: dateStr, day: d.getDate(), total, dayOfWeek: d.getDay() })
    }
    setHeatmapData(heatmap)
    setLoading(false)
  }, [profile.id, healthScore, monthlyIncome])

  useEffect(() => { loadHistoricalData() }, [loadHistoricalData])

  // Savings projection (next 6 months)
  const monthlySavings = Math.max(0, monthlyIncome - expenses)
  const projectionData = Array.from({ length: 7 }, (_, i) => ({
    name: i === 0 ? 'Hoy' : MONTH_NAMES[(new Date().getMonth() + i) % 12],
    Proyección: Math.round(monthlySavings * i),
  }))

  // MoM comparison
  const lastMonth = monthlyData[monthlyData.length - 2]
  const thisMonth = monthlyData[monthlyData.length - 1]
  const expenseTrend = lastMonth?.Gastos > 0
    ? ((thisMonth?.Gastos - lastMonth?.Gastos) / lastMonth?.Gastos) * 100
    : 0

  // Heatmap color intensity
  const maxDayExpense = Math.max(...heatmapData.map(d => d.total), 1)
  function heatColor(total) {
    if (total === 0) return 'bg-slate-800/30'
    const intensity = total / maxDayExpense
    if (intensity < 0.25) return 'bg-emerald-500/30'
    if (intensity < 0.5) return 'bg-amber-500/40'
    if (intensity < 0.75) return 'bg-orange-500/50'
    return 'bg-red-500/60'
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="text-center">
          <BarChart3 className="w-8 h-8 text-amber-400 animate-pulse mx-auto mb-2" />
          <p className="text-slate-400 text-sm">Cargando analytics...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* MoM Summary cards */}
      <div className="grid grid-cols-2 gap-3">
        <StatCard
          label="Gastos este mes"
          value={formatMoney(expenses, currency)}
          trend={expenseTrend * -1}
          color={expenseTrend < 0 ? 'text-emerald-400' : 'text-red-400'}
        />
        <StatCard
          label="Tasa de ahorro"
          value={`${savingsRate?.toFixed(1)}%`}
          sub={savingsRate >= 20 ? '✅ Meta cumplida (≥20%)' : `Faltan ${(20 - savingsRate).toFixed(1)}% para la meta`}
          color={savingsRate >= 20 ? 'text-emerald-400' : savingsRate >= 10 ? 'text-amber-400' : 'text-red-400'}
        />
      </div>

      {/* Monthly trend - Area chart */}
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-4">
        <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-amber-400" /> Tendencia últimos 6 meses
        </h3>
        <div className="h-52">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={monthlyData}>
              <defs>
                <linearGradient id="colorIngresos" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorGastos" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f87171" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#f87171" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 11 }} />
              <YAxis tick={{ fill: '#94a3b8', fontSize: 10 }} tickFormatter={v => formatMoney(v, currency).replace(/\$/, '$').slice(0, 8)} width={65} />
              <Tooltip content={<CustomTooltip currency={currency} />} />
              <Legend formatter={v => <span style={{ color: '#94a3b8', fontSize: 12 }}>{v}</span>} />
              <Area type="monotone" dataKey="Ingresos" stroke="#10b981" strokeWidth={2} fill="url(#colorIngresos)" />
              <Area type="monotone" dataKey="Gastos" stroke="#f87171" strokeWidth={2} fill="url(#colorGastos)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top 5 categories */}
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-4">
        <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-amber-400" /> Top 5 categorías del mes
        </h3>
        {topCategories.length === 0 ? (
          <p className="text-slate-400 text-sm text-center py-4">Sin gastos registrados este mes</p>
        ) : (
          <div className="space-y-3">
            {topCategories.map((cat, i) => (
              <div key={cat.name}>
                <div className="flex items-center justify-between text-xs mb-1">
                  <div className="flex items-center gap-2">
                    <span className="text-base">{cat.icon}</span>
                    <span className="text-slate-300">{cat.name}</span>
                    {i === 0 && <span className="text-[9px] bg-red-500/20 text-red-400 px-1.5 py-0.5 rounded">Mayor gasto</span>}
                  </div>
                  <span className="text-white font-semibold">{formatMoney(cat.total, currency)}</span>
                </div>
                <div className="h-2 bg-slate-700/50 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{
                      width: `${cat.pct}%`,
                      background: i === 0 ? '#f87171' : i === 1 ? '#fb923c' : i === 2 ? '#fbbf24' : '#94a3b8'
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Savings projection */}
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-4">
        <h3 className="text-sm font-semibold text-white mb-1 flex items-center gap-2">
          <Zap className="w-4 h-4 text-amber-400" /> Proyección de ahorro
        </h3>
        <p className="text-xs text-slate-500 mb-4">
          Si sigues ahorrando {formatMoney(monthlySavings, currency)}/mes...
        </p>
        {monthlySavings <= 0 ? (
          <div className="text-center py-4 text-sm text-red-400">
            Tus gastos superan tus ingresos este mes. Registra tus datos para ver la proyección.
          </div>
        ) : (
          <div className="h-44">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={projectionData}>
                <defs>
                  <linearGradient id="colorProyeccion" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                <YAxis tick={{ fill: '#94a3b8', fontSize: 10 }} tickFormatter={v => formatMoney(v, currency).slice(0, 8)} width={65} />
                <Tooltip content={<CustomTooltip currency={currency} />} />
                <Area type="monotone" dataKey="Proyección" stroke="#f59e0b" strokeWidth={2} fill="url(#colorProyeccion)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Health Score evolution */}
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-4">
        <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
          <Award className="w-4 h-4 text-amber-400" /> Evolución Health Score
        </h3>
        <div className="h-44">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={scoreHistory}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 11 }} />
              <YAxis domain={[0, 100]} tick={{ fill: '#94a3b8', fontSize: 11 }} width={30} />
              <Tooltip
                contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 12, color: '#fff' }}
                formatter={v => [`${v}/100`, 'Health Score']}
              />
              <Line type="monotone" dataKey="Score" stroke="#f59e0b" strokeWidth={2.5}
                dot={{ fill: '#f59e0b', strokeWidth: 0, r: 4 }}
                activeDot={{ r: 6, fill: '#f59e0b' }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Expense heatmap */}
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-4">
        <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
          <Calendar className="w-4 h-4 text-amber-400" /> Heatmap de gastos (últimos 35 días)
        </h3>
        <div className="grid gap-1" style={{ gridTemplateColumns: 'repeat(7, 1fr)' }}>
          {['D','L','M','X','J','V','S'].map(d => (
            <div key={d} className="text-[9px] text-slate-500 text-center pb-1">{d}</div>
          ))}
          {/* Padding for first day */}
          {Array.from({ length: heatmapData[0]?.dayOfWeek || 0 }).map((_, i) => (
            <div key={`pad-${i}`} />
          ))}
          {heatmapData.map(d => (
            <div key={d.date} className={`aspect-square rounded-md ${heatColor(d.total)} flex items-center justify-center relative group cursor-default`}>
              <span className="text-[8px] text-slate-400">{d.day}</span>
              {d.total > 0 && (
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 bg-slate-700 text-white text-[10px] px-2 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 pointer-events-none">
                  {d.date.slice(5)}: {formatMoney(d.total, currency)}
                </div>
              )}
            </div>
          ))}
        </div>
        {/* Legend */}
        <div className="flex items-center gap-2 mt-3 text-[10px] text-slate-500">
          <span>Menos</span>
          <div className="flex gap-1">
            {['bg-slate-800/30', 'bg-emerald-500/30', 'bg-amber-500/40', 'bg-orange-500/50', 'bg-red-500/60'].map((c, i) => (
              <div key={i} className={`w-4 h-4 rounded ${c}`} />
            ))}
          </div>
          <span>Más</span>
        </div>
      </div>

      {/* Month comparison */}
      {monthlyData.length >= 2 && (
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-4">
          <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
            <TrendingDown className="w-4 h-4 text-amber-400" /> Este mes vs mes anterior
          </h3>
          <div className="h-44">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData.slice(-2)} barGap={8}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                <YAxis tick={{ fill: '#94a3b8', fontSize: 10 }} tickFormatter={v => formatMoney(v, currency).slice(0, 8)} width={65} />
                <Tooltip content={<CustomTooltip currency={currency} />} />
                <Legend formatter={v => <span style={{ color: '#94a3b8', fontSize: 12 }}>{v}</span>} />
                <Bar dataKey="Ingresos" fill="#10b981" opacity={0.8} radius={[4,4,0,0]} barSize={30} />
                <Bar dataKey="Gastos" fill="#f87171" opacity={0.8} radius={[4,4,0,0]} barSize={30} />
                <Bar dataKey="Ahorro" fill="#f59e0b" opacity={0.8} radius={[4,4,0,0]} barSize={30} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  )
}
