
import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { requestService } from '@/services/requestService'
import { useAuth } from '@/context/AuthContext'
import { usePolling } from '@/hooks/usePolling'
import StatusBadge from '@/components/ui/StatusBadge'
import Spinner from '@/components/ui/Spinner'
import RatingModal from '@/components/ui/RatingModal'
import toast from 'react-hot-toast'

export default function RequestTrackingPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [request, setRequest] = useState(null)
  const [loading, setLoading] = useState(true)
  const [ratingOpen, setRatingOpen] = useState(false)
  const [ratingLoading, setRatingLoading] = useState(false)
  
  const isProviderUser = user?.role === 'provider'

  const fetchRequest = useCallback(async () => {
    try {
      const { data } = await requestService.getById(id)
      setRequest(data.data)
    } catch (err) {
      toast.error('Could not load request details.')
      navigate(isProviderUser ? '/provider/dashboard' : '/dashboard')
    } finally {
      setLoading(false)
    }
  }, [id, navigate, isProviderUser])

  useEffect(() => { fetchRequest() }, [fetchRequest])

  
  useEffect(() => {
    if (request?.status === 'completed') {
      const hasRated = isProviderUser ? !!request.provider_rating : !!request.user_rating
      if (!hasRated) {
        setRatingOpen(true)
      }
    }
  }, [request?.status, isProviderUser, request?.provider_rating, request?.user_rating])

  
  const shouldPoll = request && !['completed', 'cancelled', 'expired'].includes(request.status)
  usePolling(fetchRequest, { interval: 5000, enabled: !!shouldPoll })

  if (loading) return <div className="flex h-screen items-center justify-center"><Spinner size="lg" /></div>
  if (!request) return null

  const handleUpdateStatus = async (newStatus) => {
    try {
      const { data } = await requestService.updateStatus(id, newStatus)
      setRequest(data.data)
      toast.success(`Status updated to ${newStatus}`)
    } catch (err) {
      toast.error(err.userMessage || 'Failed to update status')
    }
  }

  const handleRate = async ({ rating, feedback }) => {
    setRatingLoading(true)
    try {
      const { data } = await requestService.rate(id, { rating, feedback })
      setRequest(data.data)
      setRatingOpen(false)
      toast.success('Thank you for your rating!')
    } catch (err) {
      toast.error(err?.userMessage || 'Failed to submit rating.')
    } finally {
      setRatingLoading(false)
    }
  }

  
  const steps = ['pending', 'accepted', 'in_progress', 'completed']
  let currentStepIdx = steps.indexOf(request.status)
  if (['cancelled', 'expired'].includes(request.status)) currentStepIdx = -1

  return (
    <div className="page-container py-8 max-w-4xl animate-fade-in">
      
      {}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 bg-surface-card p-6 rounded-2xl border border-surface-border shadow-lg">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-2xl font-bold text-white capitalize">{request.service_type} Service</h1>
            <StatusBadge status={request.status} />
          </div>
          <p className="text-sm text-slate-400 font-mono tracking-wider">ID: {request.id}</p>
        </div>
        
        {}
        <div className="mt-4 sm:mt-0 flex gap-2">
          {request.status === 'pending' && !isProviderUser && (
            <button onClick={() => handleUpdateStatus('cancelled')} className="btn-danger">Cancel Request</button>
          )}
          {request.status === 'pending' && isProviderUser && (
            <button onClick={async () => {
              try {
                await requestService.accept(request.id)
                toast.success('Accepted successfully')
                fetchRequest()
              } catch(e) {
                toast.error('Failed to accept')
              }
            }} className="btn-primary bg-green-600 hover:bg-green-700">Accept Request</button>
          )}
        </div>
      </div>

      {}
      {currentStepIdx >= 0 && (
        <div className="mb-8 p-6 glass-card">
          <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wide mb-6">Service Progress</h3>
          <div className="relative">
            <div className="overflow-hidden h-2 mb-4 text-xs flex rounded-full bg-surface-border">
              <div 
                style={{ width: `${(Math.max(0, currentStepIdx) / (steps.length - 1)) * 100}%` }} 
                className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-brand-500 transition-all duration-500" 
              />
            </div>
            <div className="flex justify-between text-xs font-semibold text-slate-400 px-1">
              <span className={currentStepIdx >= 0 ? "text-brand-400" : ""}>Finding Pro</span>
              <span className={currentStepIdx >= 1 ? "text-brand-400" : ""}>Provider En Route</span>
              <span className={currentStepIdx >= 2 ? "text-brand-400" : ""}>Working</span>
              <span className={currentStepIdx >= 3 ? "text-brand-400" : ""}>Done</span>
            </div>
          </div>
        </div>
      )}

      {}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {}
        <div className="glass-card p-6">
           <h3 className="text-lg font-bold text-white border-b border-surface-border pb-3 mb-4">Contact Details</h3>
           
           {!isProviderUser ? (
             <div className="space-y-4">
               <div>
                 <p className="text-xs text-slate-400 font-semibold uppercase tracking-wide mb-1">Your Professional</p>
                 {request.provider ? (
                   <div>
                     <p className="text-lg text-white font-medium">{request.provider.user.full_name}</p>
                     <p className="text-sm text-brand-400">⭐ {request.provider.rating} Rating</p>
                     {request.provider.user.phone && (
                       <a href={`tel:${request.provider.user.phone}`} className="inline-flex mt-3 btn-secondary text-sm px-4">
                         📞 Call Provider
                       </a>
                     )}
                   </div>
                 ) : (
                   <div className="flex items-center gap-2 text-slate-400">
                     <Spinner size="sm" /> <span>Matching you with a professional...</span>
                   </div>
                 )}
               </div>
             </div>
           ) : (
             <div className="space-y-4">
                <div>
                 <p className="text-xs text-slate-400 font-semibold uppercase tracking-wide mb-1">Client Details</p>
                 <p className="text-lg text-white font-medium">{request.user.full_name}</p>
                 {request.user.phone && (
                   <a href={`tel:${request.user.phone}`} className="inline-flex mt-3 btn-secondary text-sm px-4">
                     📞 Call Client
                   </a>
                 )}
               </div>
             </div>
           )}
        </div>

        {}
        <div className="glass-card p-6">
           <h3 className="text-lg font-bold text-white border-b border-surface-border pb-3 mb-4">Job Info</h3>
           <p className="text-xs text-slate-400 font-semibold uppercase tracking-wide mb-1">Location Coordinates</p>
           <p className="text-sm text-white font-mono mb-4">{request.user_latitude}, {request.user_longitude}</p>

           <p className="text-xs text-slate-400 font-semibold uppercase tracking-wide mb-1">Description</p>
           <p className="text-sm text-slate-300 mb-6">{request.description || "No extra details provided."}</p>

           {}
           {isProviderUser && request.status !== 'completed' && request.status !== 'cancelled' && (
             <div className="pt-4 border-t border-surface-border">
                <p className="text-xs font-semibold text-slate-300 uppercase mb-3">Update Status</p>
                <div className="flex gap-2">
                  {request.status === 'accepted' && (
                    <button onClick={() => handleUpdateStatus('in_progress')} className="btn-primary flex-1 bg-purple-600 hover:bg-purple-700">Mark Arrived</button>
                  )}
                  {request.status === 'in_progress' && (
                    <button onClick={() => handleUpdateStatus('completed')} className="btn-primary flex-1 bg-green-600 hover:bg-green-700">Complete Job</button>
                  )}
                  <button onClick={() => handleUpdateStatus('cancelled')} className="btn-secondary text-red-400 hover:text-red-300 hover:border-red-500/50">Cancel</button>
                </div>
             </div>
           )}
        </div>
      </div>


      <RatingModal 
        isOpen={ratingOpen}
        onClose={() => setRatingOpen(false)}
        onSubmit={handleRate}
        loading={ratingLoading}
        title={isProviderUser ? `Rate Client` : `Rate Provider`}
      />
    </div>
  )
}
