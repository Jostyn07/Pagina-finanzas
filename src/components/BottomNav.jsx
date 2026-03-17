import { BarChart3, Wallet, CreditCard, Target, Brain, TrendingUp } from 'lucide-react'

const items = [
  { id: 'dashboard',    label: 'Inicio',      icon: BarChart3 },
  { id: 'transactions', label: 'Movimientos', icon: Wallet },
  { id: 'debts',        label: 'Deudas',      icon: CreditCard },
  { id: 'goals',        label: 'Metas',       icon: Target },
  { id: 'analytics',   label: 'Analytics',   icon: TrendingUp },
  { id: 'advisor',      label: 'Asesor IA',   icon: Brain },
]

export default function BottomNav({ active, onChange }) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-slate-900/95 backdrop-blur-lg border-t border-slate-700/50 z-40">
      <div className="max-w-2xl mx-auto flex overflow-x-auto scrollbar-hide">
        {items.map(item => {
          const Icon = item.icon
          const isActive = active === item.id
          return (
            <button key={item.id} onClick={() => onChange(item.id)}
              className={`flex-1 min-w-0 flex flex-col items-center py-2.5 gap-0.5 transition-colors flex-shrink-0 ${isActive ? 'text-amber-400' : 'text-slate-500 hover:text-slate-300'}`}>
              <Icon className="w-5 h-5" />
              <span className="text-[9px] font-medium truncate w-full text-center px-0.5">{item.label}</span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}
