
import { useState, useEffect } from 'react'
import { notificationService } from '@/services/notificationService'
import { useNavigate } from 'react-router-dom'
import Spinner from '@/components/ui/Spinner'
import EmptyState from '@/components/ui/EmptyState'

export default function NotificationsPage() {
  const navigate = useNavigate()
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        
        const { data } = await notificationService.poll({ mark_read: true, all: true })
        setNotifications(data.notifications || [])
      } catch (err) {
        console.error('Failed to load notifications')
      } finally {
        setLoading(false)
      }
    }
    fetchNotifications()
  }, [])

  if (loading) return <div className="flex h-[calc(100vh-64px)] items-center justify-center"><Spinner size="lg" /></div>

  return (
    <div className="page-container py-8 max-w-3xl animate-slide-up">
      <div className="flex items-center justify-between mb-8">
        <h1 className="section-title text-3xl">Notifications</h1>
      </div>

      <div className="glass-card overflow-hidden min-h-[400px]">
        {notifications.length === 0 ? (
          <EmptyState 
            icon="📭" 
            title="All caught up!" 
            message="You don't have any new notifications." 
          />
        ) : (
          <div className="divide-y divide-surface-border">
            {notifications.map((n) => (
              <div 
                key={n.id} 
                className="p-5 bg-surface/50 hover:bg-surface-hover transition-colors flex items-start gap-4 cursor-pointer"
                onClick={() => {
                  if (n.request_id) {
                    navigate(`/requests/${n.request_id}`)
                  }
                }}
              >
                <div className="text-2xl mt-1">
                   {n.type === 'status_update' ? '🔄' : n.type === 'request_matched' ? '🚨' : '🔔'}
                </div>
                <div className="flex-1">
                  <p className="text-base text-white font-medium mb-1">{n.message}</p>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-xs text-slate-400 font-mono">
                      {new Date(n.created_at).toLocaleString()}
                    </span>
                    {n.request_status && (
                      <span className="text-[10px] uppercase font-bold text-brand-400 bg-brand-900/50 px-2 py-1 rounded">
                        {n.request_status}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
