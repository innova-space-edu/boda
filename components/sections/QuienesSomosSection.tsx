'use client'
import { useEffect, useRef } from 'react'
import type { WeddingConfig } from '@/types'

function ProfileCard({
  name, bio, imageUrl, isLeft, delay,
}: {
  name: string
  bio: string
  imageUrl?: string
  isLeft: boolean
  delay: number
}) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) ref.current?.classList.add('visible') },
      { threshold: 0.15 }
    )
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [])

  const initial = name.split(' ')[0][0]

  return (
    <div
      ref={ref}
      className="reveal wedding-card p-8 flex flex-col items-center text-center"
      style={{
        transitionDelay: `${delay}ms`,
        animation: isLeft ? undefined : undefined,
        flex: 1,
        minWidth: 280,
      }}
    >
      {/* Avatar with initials */}
      <div
        className="relative mb-5"
        style={{ width: 120, height: 120 }}
      >
        {/* Outer ring */}
        <div style={{
          position: 'absolute', inset: -4, borderRadius: '50%',
          background: 'linear-gradient(135deg, var(--gold-light), var(--rose-light), var(--gold))',
          animation: 'floatUp 3s ease-in-out infinite',
        }} />
        {/* Inner circle */}
        <div style={{
          position: 'absolute', inset: 0, borderRadius: '50%',
          background: imageUrl
            ? `center / cover no-repeat url(${imageUrl})`
            : `linear-gradient(135deg, ${isLeft ? '#F0D4DC, #C4748A' : '#D4E8DC, #7A9E87'})`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1,
          overflow: 'hidden',
          boxShadow: imageUrl ? 'inset 0 0 0 3px rgba(255,255,255,0.75)' : undefined,
        }}>
          {!imageUrl && (
            <span
              className="font-display"
              style={{ fontSize: '3rem', fontWeight: 400, color: 'white' }}
            >
              {initial}
            </span>
          )}
        </div>
        {/* Flower decoration */}
        <div style={{
          position: 'absolute', bottom: -2, right: -2,
          fontSize: '1.5rem', zIndex: 2,
        }}>
          {isLeft ? '🌸' : '💙'}
        </div>
      </div>

      <h3
        className="font-display mb-1"
        style={{ fontSize: '1.5rem', fontWeight: 400, color: 'var(--charcoal)' }}
      >
        {name.split(' ').slice(0, 2).join(' ')}
      </h3>
      <p
        className="font-inter text-xs mb-4"
        style={{
          letterSpacing: '0.25em', textTransform: 'uppercase',
          color: isLeft ? 'var(--rose)' : 'var(--sage)',
        }}
      >
        {isLeft ? 'La Novia' : 'El Novio'}
      </p>

      <div style={{ height: 1, width: 60, background: 'linear-gradient(to right, transparent, var(--gold), transparent)', marginBottom: 16 }} />

      <p
        className="font-cormorant"
        style={{
          fontSize: '1.1rem', lineHeight: 1.8,
          color: 'var(--charcoal-muted)', fontStyle: 'italic',
        }}
      >
        {bio}
      </p>
    </div>
  )
}

export default function QuienesSomosSection({ config }: { config: WeddingConfig }) {
  const titleRef = useRef<HTMLDivElement>(null)
  const storyRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) entry.target.classList.add('visible') },
      { threshold: 0.1 }
    )
    if (titleRef.current) observer.observe(titleRef.current)
    if (storyRef.current) observer.observe(storyRef.current)
    return () => observer.disconnect()
  }, [])

  return (
    <section
      id="quienes-somos"
      className="py-20 px-4"
      style={{ background: 'var(--cream)' }}
    >
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div ref={titleRef} className="reveal text-center mb-14">
          <p
            className="font-inter mb-2"
            style={{
              fontSize: '0.75rem', letterSpacing: '0.35em',
              textTransform: 'uppercase', color: 'var(--gold)',
            }}
          >
            Los Protagonistas
          </p>
          <h2
            className="font-display"
            style={{ fontSize: 'clamp(2rem, 4vw, 2.8rem)', fontWeight: 400, color: 'var(--charcoal)' }}
          >
            Quiénes Somos
          </h2>
          <div className="gold-divider" style={{ maxWidth: 300, margin: '1rem auto' }}>
            <span style={{ color: 'var(--rose)', fontSize: '1.3rem' }}>♥</span>
          </div>
          <p
            className="font-cormorant"
            style={{
              fontSize: '1.2rem', color: 'var(--charcoal-muted)',
              fontStyle: 'italic', maxWidth: 500, margin: '0 auto',
              lineHeight: 1.8,
            }}
          >
            Dos almas que se encontraron y decidieron caminar juntas para siempre.
          </p>
        </div>

        {/* Profile cards */}
        <div className="flex flex-col md:flex-row gap-6 mb-12">
          <ProfileCard
            name={config.bride_name}
            bio={config.bride_bio || `${config.bride_name.split(' ')[0]} es una persona maravillosa que ilumina cada espacio con su presencia. Con su amor, dedicación y esa sonrisa que enamora, ha hecho de cada día algo especial.`}
            imageUrl={config.bride_image_url}
            isLeft={true}
            delay={0}
          />

          {/* Center heart connector (desktop) */}
          <div className="hidden md:flex flex-col items-center justify-center px-2 gap-3" style={{ color: 'var(--gold-light)' }}>
            <div style={{ width: 1, flex: 1, background: 'linear-gradient(180deg, transparent, var(--gold-light), transparent)' }} />
            <div className="animate-heartbeat">
              <span style={{ fontSize: '2.5rem' }}>💕</span>
            </div>
            <div style={{ width: 1, flex: 1, background: 'linear-gradient(180deg, transparent, var(--gold-light), transparent)' }} />
          </div>

          {/* Mobile heart */}
          <div className="flex md:hidden justify-center my-2">
            <span className="animate-heartbeat" style={{ fontSize: '2rem' }}>💕</span>
          </div>

          <ProfileCard
            name={config.groom_name}
            bio={config.groom_bio || `${config.groom_name.split(' ')[0]} es un hombre apasionado por la vida, lleno de sueños y proyectos. Encontró en ${config.bride_name.split(' ')[0]} a su compañera perfecta para construir un futuro juntos.`}
            imageUrl={config.groom_image_url}
            isLeft={false}
            delay={150}
          />
        </div>

        {/* Our story */}
        <div
          ref={storyRef}
          className="reveal wedding-card p-8 md:p-12 text-center"
          style={{
            background: 'linear-gradient(135deg, var(--ivory), white)',
            borderLeft: '4px solid var(--gold)',
          }}
        >
          <span style={{ fontSize: '2rem' }}>📖</span>
          <h3
            className="font-display mt-3 mb-4"
            style={{ fontSize: '1.5rem', fontWeight: 400, color: 'var(--charcoal)' }}
          >
            Nuestra Historia
          </h3>
          <p
            className="font-cormorant"
            style={{
              fontSize: '1.15rem', lineHeight: 2,
              color: 'var(--charcoal-muted)', fontStyle: 'italic',
              maxWidth: 680, margin: '0 auto',
            }}
          >
            {config.love_story}
          </p>
        </div>
      </div>
    </section>
  )
}
