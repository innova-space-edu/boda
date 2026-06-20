import Link from 'next/link'
import { Heart, MessageCircle } from 'lucide-react'
import type { WeddingConfig } from '@/types'

export default function Footer({ config }: { config: WeddingConfig }) {
  const brideName = config.bride_name.split(' ')[0]
  const groomName = config.groom_name.split(' ')[0]
  const text = encodeURIComponent('Hola, tengo una consulta sobre la boda de Carolina y Esthefano.')

  return (
    <footer className="starfield" style={{ position: 'relative', overflow: 'hidden', background: 'linear-gradient(145deg, #090607, #1a0f24 45%, #10160f)', color: 'rgba(255,250,241,.78)', padding: '70px 18px 40px', textAlign: 'center' }}>
      <span className="shooting-star" style={{ top: '22%', left: '84%' }} />
      <div style={{ position: 'relative', zIndex: 2, width: 'min(900px, 100%)', margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 12, marginBottom: 12 }}>
          <Heart size={18} fill="var(--lilac)" color="var(--lilac)" className="animate-heartbeat" />
          <h3 className="font-script" style={{ margin: 0, fontSize: 'clamp(3rem, 7vw, 5rem)', fontWeight: 400, color: '#fffaf1' }}>{brideName} & {groomName}</h3>
          <Heart size={18} fill="var(--lilac)" color="var(--lilac)" className="animate-heartbeat" />
        </div>
        <p className="font-cinzel" style={{ color: 'var(--gold-soft)', letterSpacing: '.14em', fontSize: '.82rem', textTransform: 'uppercase' }}>6 de febrero de 2027 · {config.venue_name} · {config.city}</p>
        <div className="gold-divider"><span style={{ color: 'var(--lilac)' }}>✦</span></div>
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 10, marginBottom: 20 }}>
          <Link className="btn-ghost" href="/">Inicio</Link>
          <Link className="btn-ghost" href="/quienes-somos">Quiénes Somos</Link>
          <Link className="btn-gold" href="/confirmar">Confirmar Asistencia</Link>
          <a className="btn-whatsapp" href={`https://wa.me/56926301822?text=${text}`} target="_blank" rel="noreferrer"><MessageCircle size={16} /> WhatsApp</a>
        </div>
        <Link href="/admin/login" className="font-inter" style={{ color: 'rgba(255,250,241,.36)', textDecoration: 'none', fontSize: '.78rem' }}>Acceso administrador</Link>
      </div>
    </footer>
  )
}
