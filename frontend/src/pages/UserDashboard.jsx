
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useGeolocation } from '@/hooks/useGeolocation'
import { providerService } from '@/services/providerService'
import { requestService } from '@/services/requestService'
import MapView from '@/features/map/MapView'
import Spinner from '@/components/ui/Spinner'
import StatusBadge from '@/components/ui/StatusBadge'
import EmptyState from '@/components/ui/EmptyState'
import toast from 'react-hot-toast'

const SERVICES = [
  { id: 'mechanic', icon: '🔧', label: 'Mechanic' },
  { id: 'fuel',     icon: '⛽', label: 'Fuel' },
  { id: 'towing',   icon: '🚛', label: 'Towing' },
  { id: 'battery',  icon: '🔋', label: 'Battery' },
  { id: 'tyre',     icon: '🔄', label: 'Tyre' },
]

export default function UserDashboard() {
  const navigate = useNavigate()
  const { location, error: geoError, loading: geoLoading, getLocation } = useGeolocation()
  
  const [activeRequest, setActiveRequest] = useState(null)
  const [providers, setProviders] = useState([])
  const [selectedService, setSelectedService] = useState('')
  const [loadingProviders, setLoadingProviders] = useState(false)
  const [selectedProviderId, setSelectedProviderId] = useState(null)
  
  
  useEffect(() => {
    const fetchActiveRequest = async () => {
      try {
        const { data } = await requestService.list()
        
        const active = data.data?.find(r => ['pending', 'accepted', 'in_progress'].includes(r.status))
        if (active) setActiveRequest(active)
      } catch (err) {
        console.error('Failed to fetch requests', err)
      }
    }
    fetchActiveRequest()
  }, [])

  
  useEffect(() => {
    if (!activeRequest && !location && !geoError) {
      getLocation()
    }
  }, [activeRequest, location, geoError, getLocation])

  
  useEffect(() => {
    if (!location || activeRequest) return

    const fetchProviders = async () => {
      setLoadingProviders(true)
      try {
        const params = { lat: location.lat, lon: location.lng, radius_km: 50 }
        if (selectedService) params.service_type = selectedService
        
        const { data } = await providerService.getNearest(params)
        setProviders(data.data || [])
      } catch (err) {
        toast.error('Failed to find providers.')
      } finally {
        setLoadingProviders(false)
      }
    }
    
    fetchProviders()
  }, [location, selectedService, activeRequest])

  const handleCreateRequest = async () => {
    if (!selectedService || !location) {
      toast.error('Please select a service type and ensure location is enabled.')
      return
    }
    
    try {
      const { data } = await requestService.create({
        service_type: selectedService,
        user_latitude: location.lat,
        user_longitude: location.lng,
        description: 'Needs immediate assistance.'
      })
      toast.success('Request sent! Waiting for providers...')
      setActiveRequest(data.data)
      navigate(`/requests/${data.data.id}`)
    } catch (err) {
      toast.error(err.userMessage || 'Failed to create request')
    }
  }

  
  if (activeRequest) {
    return (
      <div className="page-container py-12">
        <div className="max-w-2xl mx-auto text-center animate-slide-up">
          <div className="inline-flex items-center justify-center h-20 w-20 rounded-full bg-brand-500/20 text-4xl mb-6">🔔</div>
          <h1 className="section-title mb-4">You have an active request</h1>
          <p className="text-slate-400 mb-8">
            You currently have a {activeRequest.service_type} request that is <StatusBadge status={activeRequest.status} />.
          </p>
          <button onClick={() => navigate(`/requests/${activeRequest.id}`)} className="btn-primary w-full sm:w-auto px-8">
            Go to Request Tracking
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] lg:flex-row shadow-inner">
      {}
      <div className="w-full lg:w-96 flex-shrink-0 bg-surface-card border-r border-surface-border flex flex-col z-10 overflow-hidden">
        
        {}
        <div className="p-4 border-b border-surface-border bg-surface shadow-sm">
          <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-wide mb-3">1. Select Service</h2>
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none snap-x">
            {SERVICES.map((s) => (
              <button key={s.id} onClick={() => setSelectedService(s.id === selectedService ? '' : s.id)}
                className={`snap-start flex-shrink-0 flex flex-col items-center justify-center w-[72px] h-[72px] rounded-xl border-2 transition-all ${
                  selectedService === s.id ? 'border-brand-500 bg-brand-500/10 text-brand-400' : 'border-surface-border hover:border-slate-500 text-slate-400'
                }`}>
                <span className="text-2xl mb-1">{s.icon}</span>
                <span className="text-[10px] font-medium">{s.label}</span>
              </button>
            ))}
          </div>
        </div>

        {}
        <div className="p-4 border-b border-surface-border bg-surface/50">
          <button 
            disabled={!selectedService || !location} 
            onClick={handleCreateRequest}
            className="btn-primary w-full py-3 h-auto"
          >
            Request Selected Service Now
          </button>
        </div>

        {}
        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
          <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-wide mb-4">
            2. Nearby Providers {providers.length > 0 && `(${providers.length})`}
          </h2>
          
          {geoLoading && (
            <div className="flex flex-col items-center justify-center h-32 text-slate-400 gap-2">
              <Spinner size="md" /> 
              <span className="text-sm">Locating you...</span>
            </div>
          )}
          
          {geoError && (
            <EmptyState icon="📍" title="Location Denied" message={geoError} />
          )}

          {!geoLoading && !geoError && loadingProviders && (
             <div className="flex items-center justify-center p-8"><Spinner /></div>
          )}

          {!geoLoading && !geoError && !loadingProviders && providers.length === 0 && (
            <EmptyState icon="🏜️" title="No providers found" message="Try selecting a different service type." />
          )}

          <div className="space-y-3">
             {providers.map(p => (
               <div key={p.id} 
                    onMouseEnter={() => setSelectedProviderId(p.id)}
                    onMouseLeave={() => setSelectedProviderId(null)}
                    className={`p-3 rounded-xl border transition-colors cursor-pointer ${
                      selectedProviderId === p.id 
                        ? 'bg-surface-hover border-brand-500/50' 
                        : 'bg-surface border-surface-border'
                    }`}>
                 <div className="flex justify-between items-start">
                   <div>
                     <h4 className="text-sm font-bold text-white">{p.full_name}</h4>
                     <p className="text-xs text-brand-400">
                      {p.service_types?.length ? p.service_types.join(', ') : 'mechanic'}
                    </p>
                   </div>
                   <div className="text-right">
                     <span className="text-xs font-semibold bg-surface-card px-2 py-1 rounded text-slate-300">
                       {p.distance_km} km
                     </span>
                   </div>
                 </div>
                 <div className="mt-2 text-xs text-yellow-400 font-medium">
                   ⭐ {p.rating} / 5 <span className="text-slate-500">({p.total_jobs} jobs)</span>
                 </div>
               </div>
             ))}
          </div>
        </div>
      </div>

      {}
      <div className="flex-1 relative bg-slate-900 border-l border-surface-border">
        {location ? (
          <MapView 
            userLocation={location} 
            providers={providers} 
            onProviderSelect={(p) => setSelectedProviderId(p.id)} 
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            {geoLoading ? <Spinner size="lg" /> : <p className="text-slate-500">Waiting for location...</p>}
          </div>
        )}
      </div>
    </div>
  )
}
