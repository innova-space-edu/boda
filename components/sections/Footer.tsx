import Link from 'next/link'
import { Heart } from 'lucide-react'
import type { WeddingConfig } from '@/types'

export default function Footer({ config }: { config: WeddingConfig }) {
  const brideName = config.bride_name.split(' ')[0]
  const groomName = config.groom_name.split(' ')[0]

  return (
    <footer
      className="py-12 px-4 text-center"
      style={{ background: 'var(--charcoal)', color: 'rgba(245,239,230,0.7)' }}
    >
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-center gap-3 mb-4">
          <Heart size={16} fill="var(--rose-muted)" color="var(--rose-muted)" className="animate-heartbeat" />
          <h3
            className="font-display"
            style={{ fontSize: '1.5rem', fontWeight: 400, color: '#F5EFE6' }}
          >
            {brideName} & {groomName}
          </h3>
          <Heart size={16} fill="var(--rose-muted)" color="var(--rose-muted)" className="animate-heartbeat" />
        </div>
        <p
          className="font-cormorant mb-6"
          style={{ fontSize: '1rem', fontStyle: 'italic', color: 'var(--gold-light)' }}
        >
          6 de Febrero, 2027 · {config.venue_name} · {config.city}
        </p>
        <div style={{ height: 1, background: 'rgba(201,169,110,0.2)', marginBottom: 24 }} />
        <div className="flex flex-wrap justify-center gap-6 mb-6">
          {[
            { href: '/', label: 'Inicio' },
            { href: '/quienes-somos', label: 'Quiénes Somos' },
            { href: '/confirmar', label: 'Confirmar Asistencia' },
          ].map(link => (
            <Link
              key={link.href}
              href={link.href}
              className="font-inter text-sm transition-colors hover:opacity-100"
              style={{ color: 'rgba(201,169,110,0.7)', textDecoration: 'none', fontSize: '0.8rem', letterSpacing: '0.05em' }}
            >
              {link.label}
            </Link>
          ))}
        </div>
        <Link
          href="/admin/login"
          className="font-inter text-xs"
          style={{ color: 'rgba(245,239,230,0.2)', textDecoration: 'none' }}
        >
          Acceso Administrador
        </Link>
      </div>
    </footer>
  )
}
