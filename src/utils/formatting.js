export function formatMoney(amount, currency = 'COP') {
  if (amount == null) return '$0'
  const abs = Math.abs(Number(amount))
  if (currency === 'COP') {
    return (amount < 0 ? '-' : '') + '$' + abs.toLocaleString('es-CO', { maximumFractionDigits: 0 })
  }
  return (amount < 0 ? '-' : '') + '$' + abs.toLocaleString('en-US', { minimumFractionDigits: 2 })
}

export function getHealthColor(score) {
  if (score >= 70) return { bg: 'bg-emerald-500/10', text: 'text-emerald-400', ring: 'ring-emerald-500/30', fill: '#34d399' }
  if (score >= 40) return { bg: 'bg-amber-500/10', text: 'text-amber-400', ring: 'ring-amber-500/30', fill: '#fbbf24' }
  return { bg: 'bg-red-500/10', text: 'text-red-400', ring: 'ring-red-500/30', fill: '#f87171' }
}

export function getHealthLabel(score) {
  if (score >= 80) return 'Excelente'
  if (score >= 60) return 'Bueno'
  if (score >= 40) return 'Regular'
  if (score >= 20) return 'En riesgo'
  return 'Crítico'
}

export function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('es-CO', { day: 'numeric', month: 'short' })
}

export function formatDateLong(dateStr) {
  return new Date(dateStr).toLocaleDateString('es-CO', { weekday: 'short', day: 'numeric', month: 'short' })
}
