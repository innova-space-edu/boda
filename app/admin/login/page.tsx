'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'
import { Lock, Mail, Eye, EyeOff, Heart } from 'lucide-react'

export default function AdminLoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleLogin = async () => {
    if (!email || !password) { toast.error('Ingresa tu correo y contraseña'); return }
    setLoading(true)
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) throw error
      toast.success('¡Bienvenido al panel!')
      router.push('/admin/dashboard')
    } catch {
      toast.error('Credenciales incorrectas. Verifica tu correo y contraseña.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(160deg, #1a0f0a 0%, #2d1810 50%, #0d1a0e 100%)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '1rem',
      }}
    >
      {/* Stars */}
      {Array.from({ length: 20 }).map((_, i) => (
        <div key={i} style={{
          position: 'fixed',
          left: `${(i * 37 + 5) % 100}%`,
          top: `${(i * 23 + 8) % 80}%`,
          width: 2, height: 2, borderRadius: '50%',
          background: 'rgba(232,213,163,0.5)',
          animation: `starTwinkle ${1.5 + (i % 4) * 0.5}s ease-in-out ${(i % 5) * 0.4}s infinite`,
        }} />
      ))}

      <div
        className="wedding-card p-8 md:p-10 w-full"
        style={{
          maxWidth: 420,
          animation: 'fadeInUp 0.8s ease-out',
          position: 'relative', zIndex: 1,
        }}
      >
        {/* Header */}
        <div className="text-center mb-8">
          <div className="animate-heartbeat mb-4">
            <Heart size={32} fill="var(--rose)" color="var(--rose)" style={{ margin: '0 auto' }} />
          </div>
          <h1
            className="font-display mb-1"
            style={{ fontSize: '1.8rem', fontWeight: 400, color: 'var(--charcoal)' }}
          >
            Panel Administrativo
          </h1>
          <p
            className="font-cormorant"
            style={{ fontSize: '1rem', fontStyle: 'italic', color: 'var(--charcoal-muted)' }}
          >
            Carolina & Esthefano · 2027
          </p>
          <div style={{ height: 1, background: 'linear-gradient(to right, transparent, var(--gold), transparent)', margin: '1rem 0' }} />
        </div>

        {/* Form */}
        <div className="flex flex-col gap-4">
          <div>
            <label
              className="font-inter text-xs mb-1.5 block"
              style={{ letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--charcoal-muted)' }}
            >
              Correo electrónico
            </label>
            <div className="relative">
              <Mail size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--gold)' }} />
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleLogin()}
                placeholder="admin@correo.com"
                className="w-full pl-10 pr-4 py-3 rounded-xl font-inter text-sm"
                style={{
                  border: '1px solid var(--border)',
                  outline: 'none', background: 'var(--cream)',
                  color: 'var(--charcoal)',
                }}
              />
            </div>
          </div>

          <div>
            <label
              className="font-inter text-xs mb-1.5 block"
              style={{ letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--charcoal-muted)' }}
            >
              Contraseña
            </label>
            <div className="relative">
              <Lock size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--gold)' }} />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleLogin()}
                placeholder="••••••••"
                className="w-full pl-10 pr-12 py-3 rounded-xl font-inter text-sm"
                style={{
                  border: '1px solid var(--border)',
                  outline: 'none', background: 'var(--cream)',
                  color: 'var(--charcoal)',
                }}
              />
              <button
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)',
                  background: 'none', border: 'none', cursor: 'pointer',
                  color: 'var(--charcoal-muted)',
                }}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button
            onClick={handleLogin}
            disabled={loading}
            className="btn-gold w-full mt-2"
            style={{ opacity: loading ? 0.7 : 1, padding: '0.875rem' }}
          >
            {loading ? '🔐 Iniciando sesión...' : 'Ingresar al Panel'}
          </button>
        </div>

        <p
          className="text-center font-inter text-xs mt-6"
          style={{ color: 'var(--charcoal-muted)' }}
        >
          Acceso exclusivo para administradores
        </p>
      </div>
    </main>
  )
}
