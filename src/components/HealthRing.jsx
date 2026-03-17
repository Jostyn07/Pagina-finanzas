import { getHealthColor, getHealthLabel } from '../utils/formatting'

export default function HealthRing({ score, size = 120 }) {
  const { text, fill } = getHealthColor(score)
  const r = (size - 16) / 2
  const circ = 2 * Math.PI * r
  const offset = circ - (score / 100) * circ

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="currentColor" strokeWidth="8" className="text-slate-700/50" />
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={fill} strokeWidth="8"
          strokeLinecap="round" strokeDasharray={circ} strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 1s ease' }} />
      </svg>
      <div className="absolute text-center">
        <div className={`text-3xl font-bold ${text}`}>{score}</div>
        <div className="text-xs text-slate-400">{getHealthLabel(score)}</div>
      </div>
    </div>
  )
}
