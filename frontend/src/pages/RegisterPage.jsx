
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useAuth } from '@/context/AuthContext'
import Spinner from '@/components/ui/Spinner'
import toast from 'react-hot-toast'

const schema = z.object({
  first_name:       z.string().min(1, 'First name is required'),
  last_name:        z.string().min(1, 'Last name is required'),
  email:            z.string().email('Enter a valid email address'),
  phone:            z.string().regex(/^\+?[0-9]{9,15}$/, 'Enter a valid phone number').optional().or(z.literal('')),
  role:             z.enum(['user', 'provider']),
  service_types:    z.array(z.string()).default([]),
  password:         z.string().min(8, 'Password must be at least 8 characters'),
  password_confirm: z.string().min(1, 'Please confirm your password'),
}).refine(d => d.password === d.password_confirm, {
  message: 'Passwords do not match',
  path: ['password_confirm'],
}).refine(d => {
  if (d.role === 'provider' && d.service_types.length === 0) return false;
  return true;
}, {
  message: 'Please select at least one service type',
  path: ['service_types'],
})

const Field = ({ label, id, error, children }) => (
  <div>
    <label htmlFor={id} className="form-label">{label}</label>
    {children}
    {error && <p className="mt-1.5 text-xs text-red-400">{error.message}</p>}
  </div>
)

export default function RegisterPage() {
  const { register: registerUser } = useAuth()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)

  const { register, handleSubmit, watch, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { role: 'user' },
  })
  const role = watch('role')

  const inputCls = (field) => `form-input ${errors[field] ? 'border-red-500 focus:ring-red-500' : ''}`

  const onSubmit = async (data) => {
    setLoading(true)
    try {
      const user = await registerUser(data)
      toast.success('Account created! Welcome to fixngo 🎉')
      navigate(user.role === 'provider' ? '/provider/dashboard' : '/dashboard', { replace: true })
    } catch (err) {
      const msg = err?.response?.data?.errors?.email?.[0]
        ?? err?.response?.data?.errors?.phone?.[0]
        ?? err?.userMessage
        ?? 'Registration failed. Please try again.'
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center px-4 py-12">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-brand-600/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-brand-800/10 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-lg animate-slide-up relative">
        <div className="text-center mb-8">
          <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-600 text-3xl mb-4 shadow-lg shadow-brand-900/50">⚡</div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Create your account</h1>
          <p className="text-slate-400 mt-1 text-sm">Join fixngo — help or get helped, instantly</p>
        </div>

        <div className="glass-card p-8 shadow-2xl">
          <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">

            {}
            <div>
              <label className="form-label">I want to…</label>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { value: 'user',     icon: '🚗', label: 'Get assistance',   sub: 'I need roadside help' },
                  { value: 'provider', icon: '🔧', label: 'Provide service',  sub: 'I help stranded drivers' },
                ].map(opt => (
                  <label key={opt.value}
                    className={`relative flex flex-col items-center gap-1 p-4 rounded-xl border-2 cursor-pointer transition-all
                      ${role === opt.value ? 'border-brand-500 bg-brand-600/10' : 'border-surface-border hover:border-slate-500'}`}>
                    <input type="radio" value={opt.value} className="sr-only" {...register('role')} />
                    <span className="text-2xl">{opt.icon}</span>
                    <span className="text-sm font-semibold text-white">{opt.label}</span>
                    <span className="text-[11px] text-slate-500 text-center">{opt.sub}</span>
                    {role === opt.value && (
                      <span className="absolute top-2 right-2 h-4 w-4 rounded-full bg-brand-600 flex items-center justify-center">
                        <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 12 12">
                          <path d="M10 3L5 8.5 2 5.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" fill="none"/>
                        </svg>
                      </span>
                    )}
                  </label>
                ))}
              </div>
            </div>

            {}
            {role === 'provider' && (
              <div className="animate-slide-up p-4 bg-brand-900/20 border border-brand-500/30 rounded-xl">
                <label className="form-label text-brand-300">What services do you provide?</label>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {[
                    { value: 'mechanic', label: 'Mechanic', icon: '🔧' },
                    { value: 'fuel',     label: 'Fuel',     icon: '⛽' },
                    { value: 'towing',   label: 'Towing',   icon: '🚛' },
                    { value: 'battery',  label: 'Battery',  icon: '🔋' },
                    { value: 'tyre',     label: 'Tyre',     icon: '🔄' },
                  ].map(svc => (
                    <label key={svc.value} className="flex items-center gap-2 cursor-pointer p-2 rounded hover:bg-surface-hover">
                      <input type="checkbox" value={svc.value} className="text-brand-500 bg-surface border-surface-border rounded focus:ring-brand-500" {...register('service_types')} />
                      <span>{svc.icon}</span>
                      <span className="text-sm text-white">{svc.label}</span>
                    </label>
                  ))}
                </div>
                {errors.service_types && <p className="mt-1.5 text-xs text-red-400">{errors.service_types.message}</p>}
              </div>
            )}

            {}
            <div className="grid grid-cols-2 gap-4">
              <Field label="First name" id="first_name" error={errors.first_name}>
                <input id="first_name" placeholder="Ada" className={inputCls('first_name')} {...register('first_name')} />
              </Field>
              <Field label="Last name" id="last_name" error={errors.last_name}>
                <input id="last_name" placeholder="Lovelace" className={inputCls('last_name')} {...register('last_name')} />
              </Field>
            </div>

            <Field label="Email address" id="email" error={errors.email}>
              <input id="email" type="email" autoComplete="email" placeholder="you@example.com" className={inputCls('email')} {...register('email')} />
            </Field>

            <Field label="Phone number (optional)" id="phone" error={errors.phone}>
              <input id="phone" type="tel" placeholder="+91 98765 43210" className={inputCls('phone')} {...register('phone')} />
            </Field>

            <Field label="Password" id="password" error={errors.password}>
              <input id="password" type="password" autoComplete="new-password" placeholder="Min. 8 characters" className={inputCls('password')} {...register('password')} />
            </Field>

            <Field label="Confirm password" id="password_confirm" error={errors.password_confirm}>
              <input id="password_confirm" type="password" autoComplete="new-password" placeholder="Re-enter password" className={inputCls('password_confirm')} {...register('password_confirm')} />
            </Field>

            <button type="submit" disabled={loading} className="btn-primary w-full py-3 text-base mt-2">
              {loading ? <><Spinner size="sm" /> Creating account…</> : 'Create account'}
            </button>
          </form>

          <p className="text-center text-sm text-slate-500 mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-brand-400 hover:text-brand-300 font-medium transition-colors">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
