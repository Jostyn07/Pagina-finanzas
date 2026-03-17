import { Brain } from 'lucide-react'
import { formatMoney, getHealthColor } from '../utils/formatting'

export default function AdvisorTab({ profile, monthlyIncome, expenses, totalDebt, healthScore }) {
  const hc = getHealthColor(healthScore)

  return (
    <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-4">
      <div className="text-center py-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-purple-500/20 mb-4">
          <Brain className="w-8 h-8 text-purple-400" />
        </div>
        <h3 className="text-lg font-semibold text-white">Asesor financiero IA</h3>
        <p className="text-sm text-slate-400 mt-2 max-w-xs mx-auto">
          Tu asesor personal analizará tus datos reales y te dará consejos inteligentes basados en tu situación.
        </p>
        <div className="mt-4 bg-slate-900/50 rounded-xl p-4 text-left space-y-2">
          <p className="text-xs text-slate-500 uppercase tracking-wider">Resumen para el asesor</p>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div><span className="text-slate-500">Ingreso: </span><span className="text-white">{formatMoney(monthlyIncome, profile.currency)}</span></div>
            <div><span className="text-slate-500">Gastos: </span><span className="text-white">{formatMoney(expenses, profile.currency)}</span></div>
            <div><span className="text-slate-500">Deudas: </span><span className="text-white">{formatMoney(totalDebt, profile.currency)}</span></div>
            <div><span className="text-slate-500">Score: </span><span className={hc.text}>{healthScore}/100</span></div>
          </div>
        </div>
        <p className="text-xs text-slate-600 mt-4">Módulo completo en la siguiente fase de desarrollo</p>
      </div>
    </div>
  )
}
