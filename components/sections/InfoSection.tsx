'use client'
import { useEffect, useRef } from 'react'
import { Calendar, Clock, MapPin, Navigation, Shirt, Church, MessageCircle } from 'lucide-react'
import type { WeddingConfig } from '@/types'
import { formatWeddingDate } from '@/lib/wedding'

const WHATSAPP_1 = '56926301822'
const WHATSAPP_2 = '56988215400'

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

export default function InfoSection({ config }: { config: WeddingConfig }) {
  const mapQuery = `${config.venue_name}, ${config.venue_address}, ${config.city}`
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(mapQuery)}`
  const mapEmbed = `https://www.google.com/maps?q=${encodeURIComponent(mapQuery)}&output=embed`
  const whatsappText = encodeURIComponent('Hola, tengo una consulta sobre la boda de Carolina y Esthefano.')

  const cards = [
    { icon: <Calendar size={22} />, title: 'Fecha', content: formatWeddingDate(config.wedding_date) },
    { icon: <Clock size={22} />, title: 'Hora', content: `${config.ceremony_time} horas` },
    { icon: <Church size={22} />, title: 'Ceremonia', content: config.venue_name },
    { icon: <Shirt size={22} />, title: 'Vestimenta', content: config.dress_code },
  ]

  return (
    <section id="info" className="section-lux lux-page">
      <div className="section-inner">
        <Reveal className="section-head">
          <p className="section-label">Información</p>
          <h2 className="section-title">Detalles de la boda</h2>
          <div className="gold-divider"><span style={{ color: 'var(--lilac-dark)' }}>♥</span></div>
          <p className="section-copy">Una celebración elegante, romántica y luminosa con flores blancas, lilas, dorado y una noche llena de estrellas.</p>
        </Reveal>

        <div className="info-grid">
          {cards.map((card, i) => (
            <Reveal key={card.title} className="lux-card detail-card" style={{ transitionDelay: `${i * 90}ms` }}>
              <div className="icon">{card.icon}</div>
              <h3>{card.title}</h3>
              <p>{card.content}</p>
            </Reveal>
          ))}
        </div>

        <Reveal className="lux-card story-block">
          <p className="section-label">Nuestra historia</p>
          <h3 className="font-script" style={{ fontSize: 'clamp(3rem, 7vw, 5.4rem)', color: 'var(--lilac-dark)', lineHeight: .9, margin: '0 0 1rem' }}>
            Carolina & Esthefano
          </h3>
          <p className="section-copy" style={{ maxWidth: 780, margin: '0 auto' }}>{config.love_story}</p>
        </Reveal>

        <Reveal className="map-wrap">
          <div className="lux-card map-info">
            <p className="section-label" style={{ margin: 0 }}>Ubicación</p>
            <h3 className="font-display" style={{ margin: 0, fontSize: '2rem', color: 'var(--ink)' }}>{config.venue_name}</h3>
            <p style={{ margin: 0, fontSize: '1.25rem', lineHeight: 1.6, color: 'var(--muted)' }}>
              <MapPin size={18} style={{ display: 'inline', marginRight: 8, color: 'var(--gold-dark)' }} />
              {config.venue_address} · {config.city}
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
              <a className="btn-gold" href={mapsUrl} target="_blank" rel="noreferrer"><Navigation size={16} /> Abrir en Google Maps</a>
              <a className="btn-whatsapp" href={`https://wa.me/${WHATSAPP_1}?text=${whatsappText}`} target="_blank" rel="noreferrer"><MessageCircle size={16} /> WhatsApp</a>
            </div>
            <p style={{ margin: 0, color: 'var(--muted)', fontStyle: 'italic' }}>
              También puedes escribirnos al 926301822 o 988215400 si tienes dudas sobre la ceremonia o la confirmación.
            </p>
          </div>
          <div className="map-frame">
            <iframe
              title="Mapa Catedral de Antofagasta"
              src={mapEmbed}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              allowFullScreen
            />
          </div>
        </Reveal>

        <Reveal className="section-head" style={{ marginTop: 74, marginBottom: 34 }}>
          <p className="section-label">Inspiración</p>
          <h2 className="section-title">Blanco, dorado & lila</h2>
          <div className="gold-divider"><span style={{ color: 'var(--gold-dark)' }}>✦</span></div>
        </Reveal>

        <div className="gallery-grid">
          <Reveal className="gallery-card tall"><img src="/images/wedding/ceremony-aisle.jpeg" alt="Pasillo de ceremonia con flores lilas y blancas" /><span>Ceremonia</span></Reveal>
          <Reveal className="gallery-card"><img src="/images/wedding/bridal-bouquet.jpeg" alt="Ramo de flores blancas y lilas" /><span>Flores</span></Reveal>
          <Reveal className="gallery-card"><img src="/images/wedding/wedding-cake.jpeg" alt="Torta de boda blanca con flores lilas" /><span>Torta</span></Reveal>
          <Reveal className="gallery-card wide"><img src="/images/wedding/lavender-table.jpeg" alt="Mesa de boda con decoración lila y dorada" /><span>Celebración</span></Reveal>
        </div>

        <Reveal className="lux-card" style={{ padding: '28px', marginTop: 28, textAlign: 'center' }}>
          <p className="section-label" style={{ margin: 0 }}>Contacto</p>
          <h3 className="font-display" style={{ margin: '8px 0 14px', fontSize: '1.7rem' }}>¿Necesitas escribirnos?</h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, justifyContent: 'center' }}>
            <a className="btn-whatsapp" href={`https://wa.me/${WHATSAPP_1}?text=${whatsappText}`} target="_blank" rel="noreferrer">WhatsApp 926301822</a>
            <a className="btn-whatsapp" href={`https://wa.me/${WHATSAPP_2}?text=${whatsappText}`} target="_blank" rel="noreferrer">WhatsApp 988215400</a>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
