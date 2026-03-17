import { Target } from 'lucide-react'
import { formatMoney } from '../utils/formatting'

export default function GoalsTab({ goals, profile }) {
  return (
    <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-4">
      <h3 className="text-lg font-semibold text-white mb-4">Metas financieras</h3>
      {goals.length === 0 ? (
        <div className="text-center py-12">
          <Target className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <p className="text-slate-400">Aún no tienes metas definidas</p>
          <p className="text-xs text-slate-500 mt-1">Próximamente podrás crear y gestionar metas aquí</p>
        </div>
      ) : (
        <div className="space-y-3">
          {goals.map(g => {
            const pct = g.target_amount > 0 ? (g.current_amount / g.target_amount * 100) : 0
            return (
              <div key={g.id} className="bg-slate-900/50 rounded-xl p-3">
                <div className="flex justify-between mb-1.5">
                  <span className="text-sm text-white font-medium">{g.name}</span>
                  <span className="text-xs text-amber-400">{pct.toFixed(0)}%</span>
                </div>
                <div className="h-2 bg-slate-700/50 rounded-full overflow-hidden">
                  <div className="h-full bg-amber-500 rounded-full transition-all" style={{ width: `${Math.min(100, pct)}%` }} />
                </div>
                <div className="flex justify-between mt-1.5 text-xs text-slate-500">
                  <span>{formatMoney(g.current_amount, profile.currency)}</span>
                  <span>{formatMoney(g.target_amount, profile.currency)}</span>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
