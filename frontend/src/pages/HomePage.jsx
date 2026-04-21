
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'

export default function HomePage() {
  const { isAuthenticated, user } = useAuth()
  const navigate = useNavigate()
  
  return (
    <div className="min-h-[calc(100vh-64px)] flex flex-col items-center justify-center p-6 text-center">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-brand-600/10 rounded-full blur-[100px]" />
        <div className="absolute bottom-0 left-1/4 w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[100px]" />
      </div>

      <div className="z-10 animate-slide-up max-w-3xl">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-surface-card border border-surface-border text-xs text-brand-400 font-semibold tracking-wide uppercase mb-6 shadow-xl">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-500" />
          </span>
          Instant Roadside Assistance
        </div>

        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-white leading-tight mb-6">
          Stranded? We'll get you <br className="hidden md:block" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-400 to-brand-600">moving again.</span>
        </h1>
        
        <p className="text-lg md:text-xl text-slate-400 mb-10 max-w-2xl mx-auto">
          Connect instantly with nearby mechanics, tow trucks, and fuel delivery providers. Real-time tracking so you never guess when help will arrive.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          {isAuthenticated ? (
            <button onClick={() => navigate(user?.role === 'provider' ? '/provider/dashboard' : '/dashboard')} className="btn-primary px-8 py-4 text-base w-full sm:w-auto shadow-lg shadow-brand-500/25">
              Go to Dashboard
            </button>
          ) : (
            <>
              <Link to="/register" className="btn-primary px-8 py-4 text-base w-full sm:w-auto shadow-lg shadow-brand-500/25">
                Get Help Now
              </Link>
              <Link to="/login" className="btn-secondary px-8 py-4 text-base w-full sm:w-auto bg-surface-card backdrop-blur-sm">
                User Login
              </Link>
              <Link to="/login" className="btn-secondary px-8 py-4 text-base w-full sm:w-auto bg-surface-card backdrop-blur-sm border-brand-500/30">
                Provider Login
              </Link>
            </>
          )}
        </div>

        <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { icon: '📍', title: 'Smart Routing', desc: 'We find the absolute closest available provider using precise geolocation.' },
            { icon: '⚡', title: 'Lightning Fast', desc: 'Providers are notified instantly and you can track their ETA live.' },
            { icon: '🛡️', title: 'Verified Pros', desc: 'Only vetted and rated roadside professionals join our network.' },
          ].map((feat, i) => (
            <div key={i} className="glass-card p-6 text-left">
              <span className="text-3xl mb-4 block">{feat.icon}</span>
              <h3 className="text-lg font-semibold text-white mb-2">{feat.title}</h3>
              <p className="text-sm text-slate-400">{feat.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
