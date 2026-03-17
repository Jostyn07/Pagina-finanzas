import { BarChart3, Wallet, Target, Brain } from 'lucide-react'

const items = [
  { id: 'dashboard', label: 'Inicio', icon: BarChart3 },
  { id: 'transactions', label: 'Movimientos', icon: Wallet },
  { id: 'goals', label: 'Metas', icon: Target },
  { id: 'advisor', label: 'Asesor IA', icon: Brain },
]

export default function BottomNav({ active, onChange }) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-slate-900/95 backdrop-blur-lg border-t border-slate-700/50 z-40">
      <div className="max-w-2xl mx-auto flex">
        {items.map(item => {
          const Icon = item.icon
          const isActive = active === item.id
          return (
            <button key={item.id} onClick={() => onChange(item.id)}
              className={`flex-1 flex flex-col items-center py-2.5 gap-0.5 transition-colors ${isActive ? 'text-amber-400' : 'text-slate-500 hover:text-slate-300'}`}>
              <Icon className="w-5 h-5" />
              <span className="text-[10px] font-medium">{item.label}</span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}
