import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useFinancialData } from '../hooks/useFinancialData'
import { formatMoney } from '../utils/formatting'
import { Wallet, Plus, LogOut, Loader2, Download } from 'lucide-react'

import HealthRing from '../components/HealthRing'
import BudgetBars from '../components/BudgetBars'
import BabySteps from '../components/BabySteps'
import TransactionList from '../components/TransactionList'
import TransactionModal from '../components/TransactionModal'
import BottomNav from '../components/BottomNav'
import GoalsTab from '../components/GoalsTab'
import AdvisorTab from '../components/AdvisorTab'
import DebtsTab from '../components/DebtsTab'
import AnalyticsTab from '../components/AnalyticsTab'
import EducationTab from '../components/EducationTab'

function exportPDF(profile, data) {
  const { monthlyIncome, expenses, netWorth, savingsRate, healthScore, debts, goals, transactions } = data
  const now = new Date()
  const monthName = now.toLocaleDateString('es-CO', { month: 'long', year: 'numeric' })
  const totalDebt = debts.reduce((s, d) => s + Number(d.current_balance), 0)
  const topCats = {}
  transactions.filter(t => t.type === 'expense').forEach(t => {
    const n = t.categories?.name || 'Otro'
    topCats[n] = (topCats[n] || 0) + Number(t.amount)
  })
  const topSorted = Object.entries(topCats).sort((a, b) => b[1] - a[1]).slice(0, 5)

  const html = `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: 'Segoe UI', Arial, sans-serif; color: #1e293b; background: #fff; padding: 40px; }
  .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 3px solid #f59e0b; padding-bottom: 16px; margin-bottom: 24px; }
  .logo { font-size: 28px; font-weight: 800; color: #0f172a; }
  .logo span { color: #f59e0b; }
  .date { font-size: 13px; color: #64748b; }
  h2 { font-size: 14px; font-weight: 700; color: #0f172a; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 12px; border-left: 3px solid #f59e0b; padding-left: 8px; }
  .grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-bottom: 24px; }
  .card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 14px; }
  .card-label { font-size: 11px; color: #64748b; margin-bottom: 4px; }
  .card-value { font-size: 18px; font-weight: 700; }
  .green { color: #10b981; } .red { color: #ef4444; } .amber { color: #f59e0b; }
  .section { margin-bottom: 24px; }
  .bar-wrap { margin: 6px 0; }
  .bar-label { display: flex; justify-content: space-between; font-size: 12px; margin-bottom: 3px; }
  .bar-bg { background: #e2e8f0; border-radius: 99px; height: 8px; }
  .bar-fill { height: 8px; border-radius: 99px; }
  .footer { margin-top: 32px; text-align: center; font-size: 11px; color: #94a3b8; border-top: 1px solid #e2e8f0; padding-top: 16px; }
  .score-circle { display: inline-block; width: 60px; height: 60px; border-radius: 50%; border: 4px solid #f59e0b; line-height: 52px; text-align: center; font-size: 20px; font-weight: 800; color: #f59e0b; }
  .score-row { display: flex; align-items: center; gap: 16px; margin-bottom: 16px; }
</style>
</head>
<body>
<div class="header">
  <div class="logo">Fin<span>Wise</span></div>
  <div class="date">Reporte financiero — ${monthName}<br/>${profile.full_name}</div>
</div>
<div class="score-row">
  <div class="score-circle">${healthScore}</div>
  <div>
    <div style="font-size:15px;font-weight:700;">Health Score: ${healthScore}/100</div>
    <div style="font-size:12px;color:#64748b;">${healthScore >= 70 ? '✅ Salud financiera buena' : healthScore >= 40 ? '⚠️ Salud financiera regular' : '🔴 Requiere atención'}</div>
  </div>
</div>
<div class="grid">
  <div class="card"><div class="card-label">Ingreso mensual</div><div class="card-value green">${formatMoney(monthlyIncome, profile.currency)}</div></div>
  <div class="card"><div class="card-label">Gastos del mes</div><div class="card-value red">${formatMoney(expenses, profile.currency)}</div></div>
  <div class="card"><div class="card-label">Flujo de caja</div><div class="card-value ${monthlyIncome - expenses >= 0 ? 'green' : 'red'}">${formatMoney(monthlyIncome - expenses, profile.currency)}</div></div>
  <div class="card"><div class="card-label">Patrimonio neto</div><div class="card-value ${netWorth >= 0 ? 'green' : 'red'}">${formatMoney(netWorth, profile.currency)}</div></div>
  <div class="card"><div class="card-label">Tasa de ahorro</div><div class="card-value ${savingsRate >= 20 ? 'green' : savingsRate >= 10 ? 'amber' : 'red'}">${savingsRate.toFixed(1)}%</div></div>
  <div class="card"><div class="card-label">Total deudas</div><div class="card-value red">${formatMoney(totalDebt, profile.currency)}</div></div>
</div>
${topSorted.length > 0 ? `<div class="section"><h2>Top categorías de gasto</h2>${topSorted.map(([name, val], i) => `<div class="bar-wrap"><div class="bar-label"><span>${name}</span><span><b>${formatMoney(val, profile.currency)}</b></span></div><div class="bar-bg"><div class="bar-fill" style="width:${(val/topSorted[0][1]*100).toFixed(0)}%;background:${['#ef4444','#f97316','#f59e0b','#94a3b8','#94a3b8'][i]}"></div></div></div>`).join('')}</div>` : ''}
${goals.length > 0 ? `<div class="section"><h2>Metas financieras</h2>${goals.filter(g=>g.status==='active').map(g=>{const pct=g.target_amount>0?Math.min(100,(g.current_amount/g.target_amount*100)).toFixed(0):0;return`<div class="bar-wrap"><div class="bar-label"><span>${g.name}</span><span>${pct}% — ${formatMoney(g.current_amount,profile.currency)} de ${formatMoney(g.target_amount,profile.currency)}</span></div><div class="bar-bg"><div class="bar-fill" style="width:${pct}%;background:#10b981"></div></div></div>`}).join('')}</div>` : ''}
<div class="footer">Generado por FinWise · ${new Date().toLocaleDateString('es-CO', { day: 'numeric', month: 'long', year: 'numeric' })} · Para uso personal</div>
</body></html>`

  const blob = new Blob([html], { type: 'text/html' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `FinWise-Reporte-${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}.html`
  a.click()
  URL.revokeObjectURL(url)
}

export default function Dashboard() {
  const { profile, signOut } = useAuth()
  const data = useFinancialData(profile)
  const [tab, setTab] = useState('dashboard')
  const [showAddTx, setShowAddTx] = useState(false)

  if (data.loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
        <Loader2 className="w-8 h-8 text-amber-400 animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen pb-20 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <header className="sticky top-0 z-40 bg-slate-900/80 backdrop-blur-lg border-b border-slate-700/50">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Wallet className="w-5 h-5 text-amber-400" />
            <span className="font-bold text-white">FinWise</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-slate-400">Hola, {profile.full_name?.split(' ')[0] || 'Usuario'}</span>
            {tab === 'analytics' && (
              <button onClick={() => exportPDF(profile, data)} className="p-2 hover:bg-slate-800 rounded-lg" title="Exportar reporte">
                <Download className="w-4 h-4 text-amber-400" />
              </button>
            )}
            <button onClick={signOut} className="p-2 hover:bg-slate-800 rounded-lg" title="Cerrar sesión">
              <LogOut className="w-4 h-4 text-slate-400" />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-4 space-y-4">
        {tab === 'dashboard' && (
          <>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-4 flex flex-col items-center">
                <HealthRing score={data.healthScore} />
                <p className="text-xs text-slate-400 mt-2">Salud financiera</p>
              </div>
              <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-4 flex flex-col justify-center space-y-3">
                <div>
                  <p className="text-xs text-slate-500">Patrimonio neto</p>
                  <p className={`text-xl font-bold ${data.netWorth >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>{formatMoney(data.netWorth, profile.currency)}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Flujo del mes</p>
                  <p className={`text-lg font-bold ${data.netCashFlow >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>{formatMoney(data.netCashFlow, profile.currency)}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Tasa de ahorro</p>
                  <p className={`text-sm font-bold ${data.savingsRate >= 20 ? 'text-emerald-400' : data.savingsRate >= 10 ? 'text-amber-400' : 'text-red-400'}`}>{data.savingsRate.toFixed(1)}%</p>
                </div>
              </div>
            </div>
            <BudgetBars profile={profile} transactions={data.transactions} />
            <BabySteps currentStep={profile.current_baby_step || 1} />
            <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-4">
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-sm font-semibold text-white">Últimos movimientos</h3>
                <button onClick={() => setTab('transactions')} className="text-xs text-amber-400 hover:underline">Ver todos</button>
              </div>
              <TransactionList transactions={data.transactions} profile={profile} onRefresh={data.loadData} compact />
            </div>
          </>
        )}
        {tab === 'transactions' && (
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-4">
            <h3 className="text-lg font-semibold text-white mb-4">Movimientos del mes</h3>
            <TransactionList transactions={data.transactions} profile={profile} onRefresh={data.loadData} />
            {data.transactions.length === 0 && (
              <div className="text-center mt-4">
                <button onClick={() => setShowAddTx(true)} className="px-4 py-2 bg-amber-500 text-slate-900 rounded-xl text-sm font-semibold">Registrar el primero</button>
              </div>
            )}
          </div>
        )}
        {tab === 'debts' && <DebtsTab debts={data.debts} profile={profile} onRefresh={data.loadData} />}
        {tab === 'goals' && <GoalsTab goals={data.goals} profile={profile} onRefresh={data.loadData} monthlyIncome={data.monthlyIncome} expenses={data.expenses} />}
        {tab === 'analytics' && <AnalyticsTab profile={profile} transactions={data.transactions} healthScore={data.healthScore} monthlyIncome={data.monthlyIncome} expenses={data.expenses} savingsRate={data.savingsRate} />}
        {tab === 'education' && <EducationTab profile={profile} />}
        {tab === 'advisor' && <AdvisorTab profile={profile} monthlyIncome={data.monthlyIncome} expenses={data.expenses} totalDebt={data.totalDebt} healthScore={data.healthScore} netWorth={data.netWorth} savingsRate={data.savingsRate} debts={data.debts} goals={data.goals} />}
      </main>

      <button onClick={() => setShowAddTx(true)}
        className="fixed bottom-24 right-4 sm:right-auto sm:left-1/2 sm:translate-x-[280px] w-14 h-14 bg-amber-500 hover:bg-amber-400 rounded-2xl shadow-lg shadow-amber-500/25 flex items-center justify-center transition-transform hover:scale-105 z-30">
        <Plus className="w-6 h-6 text-slate-900" />
      </button>

      <BottomNav active={tab} onChange={setTab} />

      {showAddTx && (
        <TransactionModal profile={profile} categories={data.categories} onClose={() => setShowAddTx(false)} onSaved={data.loadData} />
      )}
    </div>
  )
}
