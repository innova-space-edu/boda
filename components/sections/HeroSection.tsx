'use client'
import Link from 'next/link'
import { Calendar, Clock, MapPin, MessageCircle, Navigation, Sparkles } from 'lucide-react'
import Countdown from './Countdown'
import type { WeddingConfig } from '@/types'
import { formatWeddingDate } from '@/lib/wedding'

const WHATSAPP_1 = '56926301822'
const WHATSAPP_2 = '56988215400'

function MiniCalendar() {
  const days = ['L', 'M', 'M', 'J', 'V', 'S', 'D']
  const cells = ['', '', '', '', '', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20', '21', '22', '23', '24', '25', '26', '27', '28']
  return (
    <table className="calendar-mini" aria-label="Calendario febrero 2027">
      <caption>Febrero 2027</caption>
      <thead>
        <tr>{days.map(d => <th key={d}>{d}</th>)}</tr>
      </thead>
      <tbody>
        {Array.from({ length: 5 }).map((_, row) => (
          <tr key={row}>
            {Array.from({ length: 7 }).map((_, col) => {
              const value = cells[row * 7 + col]
              return (
                <td key={col} className={!value ? 'empty' : value === '6' ? 'heart-day' : ''}>
                  <span>{value || '0'}</span>
                </td>
              )
            })}
          </tr>
        ))}
      </tbody>
    </table>
  )
}

export default function HeroSection({ config }: { config: WeddingConfig }) {
  const brideName = config.bride_name.split(' ')[0]
  const groomName = config.groom_name.split(' ')[0]
  const mapQuery = `${config.venue_name}, ${config.venue_address}, ${config.city}`
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(mapQuery)}`
  const whatsappText = encodeURIComponent('Hola, tengo una consulta sobre la boda de Carolina y Esthefano.')

  return (
    <section className="lux-hero starfield" id="inicio">
      <span className="shooting-star" style={{ top: '13%', left: '78%' }} />
      <span className="shooting-star s2" />
      <span className="shooting-star s3" />

      <div className="invitation-stage">
        <article
          className="invitation-card"
          style={{
            backgroundImage: config.hero_image_url
              ? `linear-gradient(180deg, rgba(255,255,255,.94), rgba(255,250,241,.96)), url(${config.hero_image_url})`
              : undefined,
          }}
        >
          <div className="invitation-border" />
          <div className="invitation-content">
            <p className="kicker">Con amor y alegría te invitamos</p>
            <h1 className="hero-names">
              {brideName}
              <span className="hero-amp">&</span>
              {groomName}
            </h1>

            <div className="gold-divider"><Sparkles size={18} color="var(--gold-dark)" /></div>

            <p className="hero-message">
              {config.hero_message || '¡Nos casamos! Únete a nosotros en el día más especial de nuestras vidas.'}
            </p>

            <div className="hero-date-line">
              <span><Calendar size={16} style={{ display: 'inline', marginRight: 6 }} />{formatWeddingDate(config.wedding_date)}</span>
              <span>•</span>
              <span><Clock size={16} style={{ display: 'inline', marginRight: 6 }} />{config.ceremony_time} hrs</span>
              <span>•</span>
              <span><MapPin size={16} style={{ display: 'inline', marginRight: 6 }} />{config.venue_name}</span>
            </div>

            <div className="hero-actions">
              <Link href="/confirmar" className="btn-gold">💌 Confirmar asistencia</Link>
              <a href={mapsUrl} className="btn-ghost" target="_blank" rel="noreferrer"><Navigation size={16} /> Ver ubicación</a>
            </div>
          </div>
        </article>

        <aside className="side-panel">
          <div className="photo-tile">
            <img src="/images/wedding/floral-arch.jpeg" alt="Decoración floral lila y blanca para boda" />
            <span className="photo-caption">Nuestra boda</span>
          </div>

          <div className="countdown-card">
            <p className="countdown-title">Faltan</p>
            <Countdown weddingDate={config.wedding_date} />
          </div>

          <div className="calendar-card">
            <MiniCalendar />
          </div>

          <div className="lux-card" style={{ padding: 20, display: 'grid', gap: 12 }}>
            <p className="section-label" style={{ margin: 0, letterSpacing: '.22em' }}>Contáctanos</p>
            <a className="btn-whatsapp" href={`https://wa.me/${WHATSAPP_1}?text=${whatsappText}`} target="_blank" rel="noreferrer">
              <MessageCircle size={16} /> WhatsApp 1
            </a>
            <a className="btn-whatsapp" href={`https://wa.me/${WHATSAPP_2}?text=${whatsappText}`} target="_blank" rel="noreferrer">
              <MessageCircle size={16} /> WhatsApp 2
            </a>
          </div>
        </aside>
      </div>
    </section>
  )
}
