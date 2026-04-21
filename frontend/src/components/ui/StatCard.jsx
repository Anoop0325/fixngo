
export default function StatCard({ icon, label, value, sub, color = 'brand' }) {
  const colorMap = {
    brand:  'from-brand-600/20 to-brand-800/10 border-brand-700/30 text-brand-400',
    green:  'from-green-600/20  to-green-800/10  border-green-700/30  text-green-400',
    yellow: 'from-yellow-500/20 to-yellow-700/10 border-yellow-600/30 text-yellow-400',
    red:    'from-red-600/20    to-red-800/10    border-red-700/30    text-red-400',
    purple: 'from-purple-600/20 to-purple-800/10 border-purple-700/30 text-purple-400',
  }
  return (
    <div className={`glass-card p-5 bg-gradient-to-br ${colorMap[color]} animate-fade-in`}>
      <div className="flex items-center justify-between mb-3">
        <span className="text-2xl">{icon}</span>
        {sub && <span className="text-xs text-slate-500">{sub}</span>}
      </div>
      <p className="text-3xl font-bold text-white">{value}</p>
      <p className="text-sm text-slate-400 mt-1">{label}</p>
    </div>
  )
}
