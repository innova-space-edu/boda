'use client'
import { useEffect, useRef } from 'react'
import type { WeddingConfig } from '@/types'

function Reveal({ children, className = '', style }: { children: React.ReactNode; className?: string; style?: React.CSSProperties }) {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) entry.target.classList.add('visible')
    }, { threshold: 0.12 })
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [])
  return <div ref={ref} className={`reveal ${className}`} style={style}>{children}</div>
}

function ProfileCard({ name, bio, imageUrl, role, fallbackImage, initial }: { name: string; bio: string; imageUrl?: string; role: string; fallbackImage: string; initial: string }) {
  return (
    <Reveal className="lux-card profile-card">
      <div className="profile-photo">
        <div style={{ backgroundImage: `url(${imageUrl || fallbackImage})` }}>
          {!imageUrl && !fallbackImage ? initial : null}
        </div>
      </div>
      <h3>{name.split(' ').slice(0, 2).join(' ')}</h3>
      <p className="profile-role">{role}</p>
      <p>{bio}</p>
    </Reveal>
  )
}

export default function QuienesSomosSection({ config }: { config: WeddingConfig }) {
  return (
    <section id="quienes-somos" className="section-lux" style={{ background: 'linear-gradient(180deg, #fffdf8, #f6edff 48%, #fffaf1)' }}>
      <div className="section-inner">
        <Reveal className="section-head">
          <p className="section-label">Los protagonistas</p>
          <h2 className="section-title">Quiénes somos</h2>
          <div className="gold-divider"><span style={{ color: 'var(--lilac-dark)' }}>♥</span></div>
          <p className="section-copy">Dos almas que se encontraron y decidieron caminar juntas para siempre.</p>
        </Reveal>

        <div className="profile-grid">
          <ProfileCard
            name={config.bride_name}
            role="La Novia"
            initial="C"
            fallbackImage="/images/wedding/bridal-bouquet.jpeg"
            imageUrl={config.bride_image_url}
            bio={config.bride_bio || 'Carolina, con su sonrisa que ilumina cualquier habitación y su corazón lleno de amor, ha sido la luz que guía cada uno de nuestros días juntos.'}
          />

          <div className="heart-column"><span>💕</span></div>

          <ProfileCard
            name={config.groom_name}
            role="El Novio"
            initial="E"
            fallbackImage="/images/wedding/garden-reception.jpeg"
            imageUrl={config.groom_image_url}
            bio={config.groom_bio || 'Esthefano, apasionado, dedicado y lleno de sueños, encontró en Carolina a su compañera de vida perfecta para compartir cada aventura.'}
          />
        </div>

        <Reveal className="lux-card story-block" style={{ marginTop: 26 }}>
          <p className="section-label">Nuestra historia</p>
          <p className="section-copy" style={{ maxWidth: 780, margin: '0 auto' }}>{config.love_story}</p>
        </Reveal>
      </div>
    </section>
  )
}
