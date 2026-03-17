import { supabase } from '../lib/supabase'
import { Wallet, Trash2 } from 'lucide-react'
import { formatMoney, formatDateLong } from '../utils/formatting'

export default function TransactionList({ transactions, profile, onRefresh, compact = false }) {
  const list = compact ? transactions.slice(0, 5) : transactions

  async function handleDelete(id) {
    await supabase.from('transactions').delete().eq('id', id)
    onRefresh()
  }

  if (transactions.length === 0) {
    return (
      <div className="text-center py-8">
        <Wallet className="w-12 h-12 text-slate-600 mx-auto mb-3" />
        <p className="text-slate-400">No hay movimientos todavía</p>
      </div>
    )
  }

  return (
    <div className="space-y-1.5">
      {list.map(tx => (
        <div key={tx.id} className="flex items-center justify-between py-2 px-2 hover:bg-slate-700/30 rounded-lg group">
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="text-lg flex-shrink-0">{tx.categories?.icon || (tx.type === 'income' ? '💰' : '📦')}</span>
            <div className="min-w-0">
              <p className="text-sm text-white truncate">{tx.description || tx.categories?.name || 'Sin categoría'}</p>
              <p className="text-xs text-slate-500">{formatDateLong(tx.date)}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <span className={`text-sm font-bold ${tx.type === 'income' ? 'text-emerald-400' : 'text-red-400'}`}>
              {tx.type === 'income' ? '+' : '-'}{formatMoney(tx.amount, profile.currency)}
            </span>
            {!compact && (
              <button onClick={() => handleDelete(tx.id)}
                className="p-1 opacity-0 group-hover:opacity-100 hover:bg-red-500/20 rounded transition-all">
                <Trash2 className="w-3.5 h-3.5 text-red-400" />
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
