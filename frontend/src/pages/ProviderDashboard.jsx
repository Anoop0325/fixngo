
import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { providerService } from '@/services/providerService'
import { requestService } from '@/services/requestService'
import { usePolling } from '@/hooks/usePolling'
import { useGeolocation } from '@/hooks/useGeolocation'
import StatCard from '@/components/ui/StatCard'
import StatusBadge from '@/components/ui/StatusBadge'
import EmptyState from '@/components/ui/EmptyState'
import Spinner from '@/components/ui/Spinner'
import toast from 'react-hot-toast'

export default function ProviderDashboard() {
  const navigate = useNavigate()
  const { location, getLocation } = useGeolocation()
  
  const [profile, setProfile] = useState(null)
  const [pendingRequests, setPendingRequests] = useState([])
  const [loading, setLoading] = useState(true)

  
  const fetchProfile = useCallback(async () => {
    try {
      const { data } = await providerService.getMyProfile()
      setProfile(data.data)
    } catch {
      toast.error('Failed to load profile.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchProfile() }, [fetchProfile])

  
  const pollRequests = useCallback(async () => {
    if (!profile?.is_available) return
    try {
      const { data } = await requestService.getPending()
      setPendingRequests(data.data || [])
    } catch (e) {  }
  }, [profile])

  usePolling(pollRequests, { interval: 5000, enabled: profile?.is_available })

  
  useEffect(() => {
    if (profile?.is_available && !location) getLocation()
  }, [profile?.is_available, location, getLocation])

  useEffect(() => {
    if (location && profile?.is_available) {
      providerService.updateLocation({ latitude: location.lat, longitude: location.lng }).catch(() => {})
    }
  }, [location, profile?.is_available])

  const toggleAvailability = async () => {
    try {
      const newStatus = !profile.is_available
      await providerService.updateProfile({ is_available: newStatus })
      setProfile({ ...profile, is_available: newStatus })
      toast.success(newStatus ? 'You are now online' : 'You are now offline')
      if (newStatus && !location) getLocation()
    } catch {
      toast.error('Failed to update availability.')
    }
  }

  if (loading) return <div className="flex h-[calc(100vh-64px)] items-center justify-center"><Spinner size="lg" /></div>

  return (
    <div className="page-container py-8 max-w-5xl">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="section-title">Provider Dashboard</h1>
          <p className="text-slate-400 text-sm mt-1">Manage your status and incoming jobs.</p>
        </div>
        
        {}
        <div className="flex items-center gap-3 bg-surface-card px-4 py-2 rounded-xl border border-surface-border">
          <span className="text-sm font-medium text-slate-300">Status:</span>
          <button 
            onClick={toggleAvailability}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${profile?.is_available ? 'bg-brand-500' : 'bg-slate-600'}`}
          >
            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${profile?.is_available ? 'translate-x-6' : 'translate-x-1'}`} />
          </button>
          <span className={`text-sm font-bold ${profile?.is_available ? 'text-brand-400' : 'text-slate-500'}`}>
            {profile?.is_available ? 'ONLINE' : 'OFFLINE'}
          </span>
        </div>
      </div>

      {}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
        <StatCard icon="⭐" label="Your Rating" value={profile?.rating || 'New'} color="yellow" />
        <StatCard icon="🔧" label="Jobs Completed" value={profile?.total_jobs || 0} color="green" />
        <StatCard 
          icon="📡" 
          label="Supported Services" 
          value="Local" 
          color="purple" 
          sub={profile?.service_types?.length ? profile.service_types.join(', ').toUpperCase() : 'None'} 
        />
      </div>

      {}
      <div className="glass-card overflow-hidden border border-surface-border">
        <div className="bg-surface-border/30 px-6 py-4 border-b border-surface-border">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            Incoming Requests
            {profile?.is_available && <span className="flex h-2.5 w-2.5 rounded-full bg-brand-500 animate-pulse" />}
          </h3>
        </div>
        
        <div className="p-6">
          {!profile?.is_available ? (
            <EmptyState icon="⏸️" title="You are offline" message="Toggle your status to online to start receiving jobs." />
          ) : pendingRequests.length === 0 ? (
            <EmptyState icon="📡" title="Scanning for jobs" message="Waiting for new requests in your area..." />
          ) : (
            <div className="space-y-4">
              {pendingRequests.map(req => (
                <div key={req.id} className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-surface p-4 rounded-xl border border-surface-border hover:border-brand-500/50 transition-colors">
                  <div className="mb-4 sm:mb-0">
                    <div className="flex items-center gap-2 mb-1">
                      <StatusBadge status={req.status} />
                      <span className="text-sm font-semibold text-white">{req.user?.full_name || req.user?.email}</span>
                    </div>
                    <p className="text-xs text-slate-400 mt-2">
                       📍 Coordinates: {parseFloat(req.user_latitude).toFixed(4)}, {parseFloat(req.user_longitude).toFixed(4)}
                    </p>
                    <p className="text-sm text-slate-300 mt-1">"{req.description}"</p>
                  </div>
                  <div className="flex gap-2 w-full sm:w-auto">
                    <button onClick={() => navigate(`/requests/${req.id}`)} className="btn-secondary w-full sm:w-auto">
                      View Details
                    </button>
                    <button onClick={async () => {
                        try {
                          await requestService.accept(req.id);
                          toast.success('Job accepted!');
                          navigate(`/requests/${req.id}`);
                        } catch(e) {
                          toast.error(e.userMessage || 'Failed to accept');
                        }
                      }} 
                      className="btn-primary w-full sm:w-auto bg-green-600 hover:bg-green-700 focus:ring-green-500">
                      Accept Job
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
