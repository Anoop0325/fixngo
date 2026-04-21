
import { useState, useCallback, useRef } from 'react'
import { Outlet } from 'react-router-dom'
import Navbar from './Navbar'
import { useAuth } from '@/context/AuthContext'
import { usePolling } from '@/hooks/usePolling'
import { notificationService } from '@/services/notificationService'
import toast from 'react-hot-toast'

export default function AppLayout() {
  const { isAuthenticated } = useAuth()
  const [unreadCount, setUnreadCount] = useState(0)
  const seenNotifsRef = useRef(new Set())

  const poll = useCallback(async () => {
    if (!isAuthenticated) return
    const { data } = await notificationService.poll({ mark_read: false })
    const newCount = data?.count ?? 0
    
    if (newCount > 0) {
      const notifs = data?.notifications ?? []
      
      
      const newNotifs = notifs.filter(n => !seenNotifsRef.current.has(n.id))
      
      newNotifs.slice(0, 3).forEach(n => {
        toast(n.message, { icon: '🔔', style: { background: '#1e293b', color: '#f1f5f9', border: '1px solid #334155' } })
        seenNotifsRef.current.add(n.id)
      })
      
      setUnreadCount(newCount)
    } else if (unreadCount > 0 && newCount === 0) {
      
      setUnreadCount(0)
    }
  }, [isAuthenticated, unreadCount])

  usePolling(poll, { interval: 8000, enabled: isAuthenticated })

  return (
    <div className="min-h-screen bg-surface">
      <Navbar unreadCount={unreadCount} />
      <main className="animate-fade-in">
        <Outlet />
      </main>
    </div>
  )
}
