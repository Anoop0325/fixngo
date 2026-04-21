
import { useState, useEffect } from 'react'
import { requestService } from '@/services/requestService'
import { Link } from 'react-router-dom'
import Spinner from '@/components/ui/Spinner'
import StatusBadge from '@/components/ui/StatusBadge'
import EmptyState from '@/components/ui/EmptyState'

export default function ProviderRequestsPage() {
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    requestService.list()
      .then(({ data }) => setRequests(data.data || []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="flex h-[calc(100vh-64px)] items-center justify-center"><Spinner size="lg" /></div>

  return (
    <div className="page-container py-8 max-w-4xl animate-fade-in">
      <h1 className="section-title text-3xl mb-8">My Job History</h1>
      <div className="glass-card overflow-hidden min-h-[400px]">
        {requests.length === 0 ? (
          <EmptyState 
            icon="📋" 
            title="No Jobs Yet" 
            message="You haven't accepted any roadside requests yet." 
          />
        ) : (
          <div className="divide-y divide-surface-border">
            {requests.map(req => (
              <Link 
                key={req.id} 
                to={`/requests/${req.id}`} 
                className="block p-5 hover:bg-surface-hover transition-colors"
              >
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="text-lg font-bold text-white capitalize">{req.service_type} Service</h3>
                    <p className="text-sm text-slate-400 mt-1">Requested by {req.user?.full_name || 'Customer'}</p>
                  </div>
                  <StatusBadge status={req.status} />
                </div>
                <div className="flex justify-between items-center mt-4 pt-4 border-t border-surface-border/50">
                  <span className="text-xs font-mono text-slate-500">
                    {new Date(req.created_at).toLocaleString()}
                  </span>
                  <span className="text-xs text-brand-400 font-medium">View Details &rarr;</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
