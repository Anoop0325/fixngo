
import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useAuth } from '@/context/AuthContext'
import Spinner from '@/components/ui/Spinner'
import toast from 'react-hot-toast'

const schema = z.object({
  email:    z.string().email('Enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
})

export default function LoginPage() {
  const { login } = useAuth()
  const navigate  = useNavigate()
  const location  = useLocation()
  const [loading, setLoading] = useState(false)

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
  })

  const from = location.state?.from?.pathname

  const onSubmit = async (data) => {
    setLoading(true)
    try {
      const user = await login(data)
      toast.success(`Welcome back, ${user.first_name || 'there'}!`)
      const dest = from ?? (user.role === 'provider' ? '/provider/dashboard' : user.role === 'admin' ? '/admin' : '/dashboard')
      navigate(dest, { replace: true })
    } catch (err) {
      toast.error(err?.userMessage ?? 'Invalid email or password.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center px-4 py-12">
      {}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-brand-600/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-brand-800/10 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-md animate-slide-up relative">
        {}
        <div className="text-center mb-8">
          <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-600 text-3xl mb-4 shadow-lg shadow-brand-900/50">⚡</div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Welcome back</h1>
          <p className="text-slate-400 mt-1 text-sm">Sign in to your fixngo account</p>
        </div>

        <div className="glass-card p-8 shadow-2xl">
          <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
            {}
            <div>
              <label htmlFor="email" className="form-label">Email address</label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                className={`form-input ${errors.email ? 'border-red-500 focus:ring-red-500' : ''}`}
                {...register('email')}
              />
              {errors.email && <p className="mt-1.5 text-xs text-red-400">{errors.email.message}</p>}
            </div>

            {}
            <div>
              <label htmlFor="password" className="form-label">Password</label>
              <input
                id="password"
                type="password"
                autoComplete="current-password"
                placeholder="••••••••"
                className={`form-input ${errors.password ? 'border-red-500 focus:ring-red-500' : ''}`}
                {...register('password')}
              />
              {errors.password && <p className="mt-1.5 text-xs text-red-400">{errors.password.message}</p>}
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full py-3 text-base mt-2">
              {loading ? <><Spinner size="sm" /> Signing in…</> : 'Sign in'}
            </button>
          </form>

          <p className="text-center text-sm text-slate-500 mt-6">
            Don&apos;t have an account?{' '}
            <Link to="/register" className="text-brand-400 hover:text-brand-300 font-medium transition-colors">
              Create one free
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
