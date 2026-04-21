
import { useState, useEffect } from 'react'
import api from '@/services/api'
import StatCard from '@/components/ui/StatCard'
import StatusBadge from '@/components/ui/StatusBadge'
import Spinner from '@/components/ui/Spinner'

export default function AdminDashboard() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data } = await api.get('/admin-panel/stats/')
        setStats(data.data)
      } catch (err) {
         console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchStats()
  }, [])

  if (loading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>

  return (
    <div className="page-container py-8">
      <h1 className="section-title mb-6 text-xl">Platform Overview</h1>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
        <StatCard icon="👥" label="Users" value={stats?.total_users || 0} color="blue" />
        <StatCard icon="🔧" label="Providers" value={stats?.total_providers || 0} color="green" />
        <StatCard icon="📡" label="Online Pros" value={stats?.active_providers || 0} color="purple" />
        <StatCard icon="📝" label="Requests" value={stats?.total_requests || 0} color="yellow" />
      </div>

      <div className="glass-card p-6">
        <h2 className="text-lg font-bold text-white mb-4">Request Status Breakdown</h2>
        <div className="space-y-4">
           <div className="flex justify-between items-center bg-surface p-3 rounded-lg border border-surface-border">
             <StatusBadge status="pending" />
             <span className="font-bold text-white">{stats?.pending_requests || 0}</span>
           </div>
           <div className="flex justify-between items-center bg-surface p-3 rounded-lg border border-surface-border">
             <StatusBadge status="completed" />
             <span className="font-bold text-white">{stats?.completed_requests || 0}</span>
           </div>
           <div className="flex justify-between items-center bg-surface p-3 rounded-lg border border-surface-border">
             <StatusBadge status="cancelled" />
             <span className="font-bold text-white">{stats?.cancelled_requests || 0}</span>
           </div>
        </div>
      </div>
    </div>
  )
}
