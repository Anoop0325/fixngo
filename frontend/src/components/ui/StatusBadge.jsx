
const CONFIG = {
  pending:     { label: 'Pending',     cls: 'badge-pending',   dot: 'bg-yellow-400' },
  accepted:    { label: 'Accepted',    cls: 'badge-accepted',  dot: 'bg-blue-400'   },
  in_progress: { label: 'In Progress', cls: 'badge-progress',  dot: 'bg-purple-400' },
  completed:   { label: 'Completed',   cls: 'badge-completed', dot: 'bg-green-400'  },
  cancelled:   { label: 'Cancelled',   cls: 'badge-cancelled', dot: 'bg-red-400'    },
  expired:     { label: 'Expired',     cls: 'badge-expired',   dot: 'bg-slate-400'  },
}

export default function StatusBadge({ status }) {
  const cfg = CONFIG[status] ?? { label: status, cls: 'badge bg-slate-700 text-slate-300', dot: 'bg-slate-400' }
  return (
    <span className={cfg.cls}>
      <span className={`inline-block w-1.5 h-1.5 rounded-full ${cfg.dot} animate-pulse`} />
      {cfg.label}
    </span>
  )
}
