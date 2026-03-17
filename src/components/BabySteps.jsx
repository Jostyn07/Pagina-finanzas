import { TrendingUp, CheckCircle2 } from 'lucide-react'
import { BABY_STEPS } from '../utils/constants'

export default function BabySteps({ currentStep = 1 }) {
  return (
    <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-4">
      <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
        <TrendingUp className="w-4 h-4 text-amber-400" /> Baby Steps — Paso {currentStep}
      </h3>
      <div className="space-y-2">
        {BABY_STEPS.map(bs => {
          const done = bs.step < currentStep
          const active = bs.step === currentStep
          const Icon = bs.icon
          return (
            <div key={bs.step} className={`flex items-center gap-3 p-2.5 rounded-xl transition-colors ${active ? 'bg-amber-500/10 ring-1 ring-amber-500/20' : done ? 'opacity-50' : 'opacity-30'}`}>
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${done ? 'bg-emerald-500/20' : active ? 'bg-amber-500/20' : 'bg-slate-700/50'}`}>
                {done ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <Icon className={`w-4 h-4 ${active ? 'text-amber-400' : 'text-slate-500'}`} />}
              </div>
              <div className="min-w-0">
                <p className={`text-sm font-medium ${active ? 'text-white' : 'text-slate-400'}`}>{bs.title}</p>
                {active && <p className="text-xs text-slate-500">{bs.desc}</p>}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
