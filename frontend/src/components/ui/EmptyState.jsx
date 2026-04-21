
export default function EmptyState({ icon = '📭', title, message, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center animate-fade-in">
      <span className="text-5xl mb-4">{icon}</span>
      <h3 className="text-lg font-semibold text-white mb-1">{title}</h3>
      {message && <p className="text-slate-400 text-sm max-w-xs">{message}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  )
}
