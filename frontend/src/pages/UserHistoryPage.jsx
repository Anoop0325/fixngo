
import { useState, useEffect } from 'react'
import { requestService } from '@/services/requestService'
import { Link } from 'react-router-dom'
import Spinner from '@/components/ui/Spinner'
import StatusBadge from '@/components/ui/StatusBadge'
import EmptyState from '@/components/ui/EmptyState'
import RatingModal from '@/components/ui/RatingModal'
import toast from 'react-hot-toast'

export default function UserHistoryPage() {
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [ratingTarget, setRatingTarget] = useState(null)
  const [ratingLoading, setRatingLoading] = useState(false)

  const fetchHistory = async () => {
    try {
      const { data } = await requestService.list()
      setRequests(data.data || [])
    } catch (e) {
      toast.error('Failed to load history.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchHistory()
  }, [])

  const handleRate = async ({ rating, feedback }) => {
    setRatingLoading(true)
    try {
      await requestService.rate(ratingTarget.id, { rating, feedback })
      toast.success('Rating submitted, thank you!')
      setRatingTarget(null)
      fetchHistory() 
    } catch (err) {
      toast.error(err?.userMessage || 'Failed to submit rating.')
    } finally {
      setRatingLoading(false)
    }
  }

  if (loading) return <div className="flex h-[calc(100vh-64px)] items-center justify-center"><Spinner size="lg" /></div>

  return (
    <div className="page-container py-8 max-w-4xl animate-fade-in">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="section-title text-3xl">Request History</h1>
          <p className="text-slate-400 mt-1">Track all your past roadside assistance requests.</p>
        </div>
      </div>

      <div className="glass-card overflow-hidden min-h-[400px]">
        {requests.length === 0 ? (
          <EmptyState 
            icon="📋" 
            title="No History" 
            message="You haven't made any roadside assistance requests yet." 
          />
        ) : (
          <div className="divide-y divide-surface-border">
            {requests.map(req => (
              <div key={req.id} className="p-5 hover:bg-surface-hover/30 transition-colors">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-white capitalize">{req.service_type} Service</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-slate-500">
                        {new Date(req.created_at).toLocaleString()}
                      </span>
                      <span className="text-slate-700">•</span>
                      <StatusBadge status={req.status} />
                    </div>
                  </div>
                  
                  {req.status === 'completed' && !req.user_rating && (
                    <button 
                      onClick={() => setRatingTarget(req)}
                      className="btn-primary py-1 px-3 text-xs bg-yellow-500/20 text-yellow-500 border-yellow-500/30 hover:bg-yellow-500 hover:text-black"
                    >
                      Rate Provider
                    </button>
                  )}

                  {req.user_rating && (
                    <div className="flex flex-col items-end">
                      <div className="flex text-yellow-400 text-sm">
                        {'★'.repeat(req.user_rating)}{'☆'.repeat(5 - req.user_rating)}
                      </div>
                      <span className="text-[10px] text-slate-500 mt-1 uppercase font-bold tracking-tighter">You Rated</span>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center mt-2">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 shrink-0 rounded-lg bg-surface-card border border-surface-border flex items-center justify-center text-lg">
                      {req.provider ? '👤' : '⌛'}
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 uppercase font-bold tracking-wider">Provider</p>
                      <p className="text-sm text-slate-200">
                        {req.provider?.user?.full_name || (req.status === 'pending' ? 'Searching...' : 'N/A')}
                      </p>
                    </div>
                  </div>

                  <div className="flex md:justify-end gap-3">
                    <Link 
                      to={`/requests/${req.id}`} 
                      className="text-xs font-medium text-brand-400 hover:text-brand-300 transition-colors flex items-center gap-1"
                    >
                      View Full Details &rarr;
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <RatingModal 
        isOpen={!!ratingTarget} 
        onClose={() => setRatingTarget(null)}
        onSubmit={handleRate}
        loading={ratingLoading}
        title={`Rate ${ratingTarget?.provider?.user?.full_name || 'Provider'}`}
      />
    </div>
  )
}
