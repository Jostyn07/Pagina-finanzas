import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useFinancialData } from '../hooks/useFinancialData'
import { formatMoney } from '../utils/formatting'
import { Wallet, Plus, LogOut, Loader2 } from 'lucide-react'

import HealthRing from '../components/HealthRing'
import BudgetBars from '../components/BudgetBars'
import BabySteps from '../components/BabySteps'
import TransactionList from '../components/TransactionList'
import TransactionModal from '../components/TransactionModal'
import BottomNav from '../components/BottomNav'
import GoalsTab from '../components/GoalsTab'
import AdvisorTab from '../components/AdvisorTab'

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
      {/* Header */}
      <header className="sticky top-0 z-40 bg-slate-900/80 backdrop-blur-lg border-b border-slate-700/50">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Wallet className="w-5 h-5 text-amber-400" />
            <span className="font-bold text-white">FinWise</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-slate-400">Hola, {profile.full_name?.split(' ')[0] || 'Usuario'}</span>
            <button onClick={signOut} className="p-2 hover:bg-slate-800 rounded-lg" title="Cerrar sesión">
              <LogOut className="w-4 h-4 text-slate-400" />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-4 space-y-4">

        {/* ===== DASHBOARD ===== */}
        {tab === 'dashboard' && (
          <>
            {/* Health Score + Summary */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-4 flex flex-col items-center">
                <HealthRing score={data.healthScore} />
                <p className="text-xs text-slate-400 mt-2">Salud financiera</p>
              </div>
              <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-4 flex flex-col justify-center space-y-3">
                <div>
                  <p className="text-xs text-slate-500">Patrimonio neto</p>
                  <p className={`text-xl font-bold ${data.netWorth >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                    {formatMoney(data.netWorth, profile.currency)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Flujo del mes</p>
                  <p className={`text-lg font-bold ${data.netCashFlow >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                    {formatMoney(data.netCashFlow, profile.currency)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Tasa de ahorro</p>
                  <p className={`text-sm font-bold ${data.savingsRate >= 20 ? 'text-emerald-400' : data.savingsRate >= 10 ? 'text-amber-400' : 'text-red-400'}`}>
                    {data.savingsRate.toFixed(1)}%
                  </p>
                </div>
              </div>
            </div>

            <BudgetBars profile={profile} transactions={data.transactions} />
            <BabySteps currentStep={profile.current_baby_step || 1} />

            {/* Recent Transactions */}
            <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-4">
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-sm font-semibold text-white">Últimos movimientos</h3>
                <button onClick={() => setTab('transactions')} className="text-xs text-amber-400 hover:underline">Ver todos</button>
              </div>
              <TransactionList transactions={data.transactions} profile={profile} onRefresh={data.loadData} compact />
            </div>
          </>
        )}

        {/* ===== TRANSACTIONS ===== */}
        {tab === 'transactions' && (
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-4">
            <h3 className="text-lg font-semibold text-white mb-4">Movimientos del mes</h3>
            <TransactionList transactions={data.transactions} profile={profile} onRefresh={data.loadData} />
            {data.transactions.length === 0 && (
              <div className="text-center mt-4">
                <button onClick={() => setShowAddTx(true)} className="px-4 py-2 bg-amber-500 text-slate-900 rounded-xl text-sm font-semibold">
                  Registrar el primero
                </button>
              </div>
            )}
          </div>
        )}

        {/* ===== GOALS ===== */}
        {tab === 'goals' && <GoalsTab goals={data.goals} profile={profile} />}

        {/* ===== AI ADVISOR ===== */}
        {tab === 'advisor' && (
          <AdvisorTab profile={profile} monthlyIncome={data.monthlyIncome}
            expenses={data.expenses} totalDebt={data.totalDebt} healthScore={data.healthScore} />
        )}
      </main>

      {/* FAB */}
      <button onClick={() => setShowAddTx(true)}
        className="fixed bottom-24 right-4 sm:right-auto sm:left-1/2 sm:translate-x-[280px] w-14 h-14 bg-amber-500 hover:bg-amber-400 rounded-2xl shadow-lg shadow-amber-500/25 flex items-center justify-center transition-transform hover:scale-105 z-30">
        <Plus className="w-6 h-6 text-slate-900" />
      </button>

      <BottomNav active={tab} onChange={setTab} />

      {showAddTx && (
        <TransactionModal profile={profile} categories={data.categories}
          onClose={() => setShowAddTx(false)} onSaved={data.loadData} />
      )}
    </div>
  )
}
