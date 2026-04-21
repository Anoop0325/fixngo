
import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useAuth } from '@/context/AuthContext'
import { authService } from '@/services/authService'
import Spinner from '@/components/ui/Spinner'
import toast from 'react-hot-toast'


const profileSchema = z.object({
  first_name: z.string().min(1, 'First name is required'),
  last_name:  z.string().min(1, 'Last name is required'),
  phone:      z.string().regex(/^\+?[0-9]{9,15}$/, 'Enter a valid phone number').optional().or(z.literal('')),
  service_types: z.array(z.string()).optional()
})


const passwordSchema = z.object({
  old_password: z.string().min(1, 'Current password is required'),
  new_password: z.string().min(8, 'Must be at least 8 characters'),
  new_password_confirm: z.string().min(1, 'Please confirm'),
}).refine(d => d.new_password === d.new_password_confirm, {
  message: 'Passwords do not match',
  path: ['new_password_confirm']
})

export default function ProfilePage() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [savingProfile, setSavingProfile] = useState(false)
  const [savingPassword, setSavingPassword] = useState(false)

  const { 
    register: registerProfile, 
    handleSubmit: handleProfileSubmit, 
    reset: resetProfile, 
    formState: { errors: profileErrors, isDirty: isProfileDirty } 
  } = useForm({ resolver: zodResolver(profileSchema) })

  const { 
    register: registerPassword, 
    handleSubmit: handlePasswordSubmit, 
    reset: resetPassword, 
    formState: { errors: passwordErrors } 
  } = useForm({ resolver: zodResolver(passwordSchema) })

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data } = await authService.getProfile()
        resetProfile({
          first_name: data.data.first_name || '',
          last_name: data.data.last_name || '',
          phone: data.data.phone || '',
          service_types: data.data.service_types || []
        })
      } catch (err) {
        toast.error('Failed to load profile details.')
      } finally {
        setLoading(false)
      }
    }
    fetchProfile()
  }, [resetProfile])

  const onProfileSubmit = async (formData) => {
    setSavingProfile(true)
    try {
      await authService.updateProfile(formData)
      toast.success('Profile updated successfully!')
      resetProfile(formData)
    } catch (err) {
      toast.error(err?.userMessage || 'Failed to update profile.')
    } finally {
      setSavingProfile(false)
    }
  }

  const onPasswordSubmit = async (formData) => {
    setSavingPassword(true)
    try {
      await authService.changePassword({
        old_password: formData.old_password,
        new_password: formData.new_password,
        new_password_confirm: formData.new_password_confirm
      })
      toast.success('Password changed safely!')
      resetPassword()
    } catch (err) {
      toast.error(err?.userMessage || 'Failed to change password.')
    } finally {
      setSavingPassword(false)
    }
  }

  if (loading) return <div className="flex h-[calc(100vh-64px)] items-center justify-center"><Spinner size="lg" /></div>

  return (
    <div className="page-container py-8 max-w-2xl animate-fade-in">
      <div className="mb-8">
        <h1 className="section-title text-3xl">My Profile</h1>
        <p className="text-slate-400 mt-1">Manage your personal information, contact details, and security.</p>
      </div>

      <div className="glass-card p-6 md:p-8 mb-8">
        <div className="mb-8 pb-8 border-b border-surface-border">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-2xl bg-brand-600 flex items-center justify-center text-2xl font-bold text-white shadow-lg">
              {user?.fullName?.[0] || user?.email?.[0]?.toUpperCase()}
            </div>
            <div>
              <p className="text-white font-medium text-lg">{user?.email}</p>
              <div className="flex gap-2 mt-1">
                <span className="text-[10px] px-2 py-0.5 rounded uppercase font-bold tracking-wider bg-brand-900 text-brand-300">
                  {user?.role} Account
                </span>
              </div>
            </div>
          </div>
        </div>

        {}
        <form onSubmit={handleProfileSubmit(onProfileSubmit)} className="space-y-5">
          <h2 className="text-xl font-bold text-white mb-4">Personal Details</h2>
          
          {user?.role === 'provider' && (
            <div className="p-4 bg-brand-900/20 border border-brand-500/30 rounded-xl mb-6">
              <label className="form-label text-brand-300">Your Active Services</label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-3">
                {[
                  { value: 'mechanic', label: 'Mechanic', icon: '🔧' },
                  { value: 'fuel',     label: 'Fuel',     icon: '⛽' },
                  { value: 'towing',   label: 'Towing',   icon: '🚛' },
                  { value: 'battery',  label: 'Battery',  icon: '🔋' },
                  { value: 'tyre',     label: 'Tyre',     icon: '🔄' },
                ].map(svc => (
                  <label key={svc.value} className="flex items-center gap-2 cursor-pointer p-2 rounded hover:bg-surface-hover">
                    <input type="checkbox" value={svc.value} className="text-brand-500 bg-surface border-surface-border rounded focus:ring-brand-500" {...registerProfile('service_types')} />
                    <span>{svc.icon}</span>
                    <span className="text-sm text-white">{svc.label}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="form-label">First name</label>
              <input className={`form-input ${profileErrors.first_name ? 'border-red-500' : ''}`} {...registerProfile('first_name')} />
              {profileErrors.first_name && <p className="mt-1 text-xs text-red-400">{profileErrors.first_name.message}</p>}
            </div>
            <div>
              <label className="form-label">Last name</label>
              <input className={`form-input ${profileErrors.last_name ? 'border-red-500' : ''}`} {...registerProfile('last_name')} />
              {profileErrors.last_name && <p className="mt-1 text-xs text-red-400">{profileErrors.last_name.message}</p>}
            </div>
          </div>

          <div>
            <label className="form-label">Phone number</label>
            <input type="tel" className={`form-input ${profileErrors.phone ? 'border-red-500' : ''}`} {...registerProfile('phone')} />
            <p className="mt-1 text-xs text-slate-500">Providers and customers use this number to contact you.</p>
            {profileErrors.phone && <p className="mt-1 text-xs text-red-400">{profileErrors.phone.message}</p>}
          </div>

          <div className="pt-4 flex justify-end">
            <button type="submit" disabled={!isProfileDirty || savingProfile} className="btn-primary px-8">
              {savingProfile ? <><Spinner size="sm" /> Saving...</> : 'Save Profile'}
            </button>
          </div>
        </form>
      </div>

      <div className="glass-card p-6 md:p-8">
        {}
        <form onSubmit={handlePasswordSubmit(onPasswordSubmit)} className="space-y-5">
          <h2 className="text-xl font-bold text-white mb-4">Security</h2>
          <p className="text-sm text-slate-400 mb-6">Update your account password. You will not be logged out of your current session.</p>

          <div>
            <label className="form-label">Current password</label>
            <input type="password" placeholder="Enter current password" className={`form-input ${passwordErrors.old_password ? 'border-red-500' : ''}`} {...registerPassword('old_password')} />
            {passwordErrors.old_password && <p className="mt-1 text-xs text-red-400">{passwordErrors.old_password.message}</p>}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="form-label">New password</label>
              <input type="password" placeholder="At least 8 characters" className={`form-input ${passwordErrors.new_password ? 'border-red-500' : ''}`} {...registerPassword('new_password')} />
              {passwordErrors.new_password && <p className="mt-1 text-xs text-red-400">{passwordErrors.new_password.message}</p>}
            </div>
            <div>
              <label className="form-label">Confirm new password</label>
              <input type="password" placeholder="Re-enter password" className={`form-input ${passwordErrors.new_password_confirm ? 'border-red-500' : ''}`} {...registerPassword('new_password_confirm')} />
              {passwordErrors.new_password_confirm && <p className="mt-1 text-xs text-red-400">{passwordErrors.new_password_confirm.message}</p>}
            </div>
          </div>

          <div className="pt-4 flex justify-end">
            <button type="submit" disabled={savingPassword} className="btn-secondary px-8 border-brand-500/30">
              {savingPassword ? <><Spinner size="sm" /> Saving...</> : 'Update Password'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
