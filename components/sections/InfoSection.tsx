'use client'
import { useEffect, useRef } from 'react'
import { Clock, Calendar, Shirt, Church } from 'lucide-react'
import type { WeddingConfig } from '@/types'
import { formatWeddingDate } from '@/lib/wedding'

function InfoCard({
  icon, title, content, delay,
}: {
  icon: React.ReactNode
  title: string
  content: string
  delay: number
}) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) ref.current?.classList.add('visible') },
      { threshold: 0.1 }
    )
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [])

  return (
    <div
      ref={ref}
      className="reveal wedding-card p-6 flex flex-col items-center text-center gap-3"
      style={{ animationDelay: `${delay}ms`, transitionDelay: `${delay}ms` }}
    >
      <div
        className="w-12 h-12 rounded-full flex items-center justify-center"
        style={{ background: 'linear-gradient(135deg, var(--gold-light), var(--gold))', color: 'white' }}
      >
        {icon}
      </div>
      <h3
        className="font-display"
        style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--charcoal)' }}
      >
        {title}
      </h3>
      <p
        className="font-cormorant"
        style={{ fontSize: '1rem', color: 'var(--charcoal-muted)', lineHeight: 1.6 }}
      >
        {content}
      </p>
    </div>
  )
}

export default function InfoSection({ config }: { config: WeddingConfig }) {
  const titleRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) titleRef.current?.classList.add('visible') },
      { threshold: 0.1 }
    )
    if (titleRef.current) observer.observe(titleRef.current)
    return () => observer.disconnect()
  }, [])

  const cards = [
    {
      icon: <Calendar size={20} />,
      title: 'Fecha',
      content: formatWeddingDate(config.wedding_date),
    },
    {
      icon: <Clock size={20} />,
      title: 'Hora de Ceremonia',
      content: `${config.ceremony_time} horas`,
    },
    {
      icon: <Church size={20} />,
      title: 'Lugar',
      content: `${config.venue_name}\n${config.venue_address}\n${config.city}`,
    },
    {
      icon: <Shirt size={20} />,
      title: 'Vestimenta',
      content: config.dress_code,
    },
  ]

  return (
    <section id="info" className="py-20 px-4" style={{ background: 'var(--ivory)' }}>
      <div className="max-w-5xl mx-auto">
        {/* Section header */}
        <div ref={titleRef} className="reveal text-center mb-12">
          <p
            className="font-inter mb-2"
            style={{
              fontSize: '0.75rem', letterSpacing: '0.35em',
              textTransform: 'uppercase', color: 'var(--gold)',
            }}
          >
            Información
          </p>
          <h2
            className="font-display"
            style={{ fontSize: 'clamp(2rem, 4vw, 2.8rem)', fontWeight: 400, color: 'var(--charcoal)' }}
          >
            Detalles de la Boda
          </h2>
          <div className="gold-divider" style={{ maxWidth: 300, margin: '1rem auto' }}>
            <span className="font-display" style={{ color: 'var(--gold)', fontSize: '1.2rem' }}>✦</span>
          </div>
        </div>

        {/* Cards grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-12">
          {cards.map((card, i) => (
            <InfoCard key={i} {...card} delay={i * 100} />
          ))}
        </div>

        {/* Love story */}
        <div
          className="wedding-card p-8 md:p-12 text-center"
          style={{ background: 'linear-gradient(135deg, white, var(--rose-light))' }}
        >
          <div className="animate-heartbeat mb-4">
            <span style={{ fontSize: '2rem' }}>💕</span>
          </div>
          <h3
            className="font-display mb-4"
            style={{ fontSize: '1.6rem', fontWeight: 400, color: 'var(--charcoal)' }}
          >
            Nuestra Historia
          </h3>
          <p
            className="font-cormorant"
            style={{
              fontSize: '1.2rem', lineHeight: 1.9,
              color: 'var(--charcoal-muted)', maxWidth: 600, margin: '0 auto',
              fontStyle: 'italic',
            }}
          >
            {config.love_story}
          </p>
        </div>
      </div>
    </section>
  )
}
