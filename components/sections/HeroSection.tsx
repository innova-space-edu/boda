'use client'
import Link from 'next/link'
import { CalendarDays, Clock, MapPin, MessageCircle, Navigation } from 'lucide-react'
import Countdown from './Countdown'
import type { WeddingConfig } from '@/types'

const WHATSAPP_1 = '56926301822'
const WHATSAPP_2 = '56988215400'

function MiniCalendar() {
  const days = ['L', 'M', 'M', 'J', 'V', 'S', 'D']
  const cells = ['', '', '', '', '', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20', '21', '22', '23', '24', '25', '26', '27', '28']
  return (
    <table className="calendar-mini calendar-ornate" aria-label="Calendario febrero 2027">
      <caption>Febrero 2027</caption>
      <thead>
        <tr>{days.map((d, i) => <th key={`${d}-${i}`}>{d}</th>)}</tr>
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
  const mapQuery = `${config.venue_name}, ${config.venue_address}, ${config.city}`
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(mapQuery)}`
  const whatsappText = encodeURIComponent('Hola, tengo una consulta sobre la boda de Carolina y Esthefano.')

  return (
    <section className="baroque-hero starfield" id="inicio">
      <span className="shooting-star" style={{ top: '11%', left: '90%' }} />
      <span className="shooting-star s2" />
      <span className="shooting-star s3" />
      <span className="shooting-star s4" />
      <span className="shooting-star s5" />
      <span className="floating-orb orb-lilac" />
      <span className="floating-orb orb-gold" />

      <div className="baroque-stage">
        <article className="invitation-showcase" aria-label="Invitación digital de boda religiosa">
          <div className="invitation-glow" aria-hidden="true" />
          <div className="invitation-image-frame">
            <img
              src="/images/wedding/invitacion-iglesia-editada.png"
              alt="Invitación de iglesia de Carolina Vega Carrera y Esthefano Morales Campaña, 6 de febrero de 2027"
              className="church-invitation-img"
            />
          </div>

          <div className="invitation-actions-panel" aria-label="Acciones principales de la invitación">
            <Link href="/confirmar" className="btn-gold">💌 Confirmar asistencia</Link>
            <a href={mapsUrl} className="btn-ghost light" target="_blank" rel="noreferrer"><Navigation size={16} /> Ver ubicación</a>
          </div>
        </article>

        <aside className="baroque-side">
          <div className="side-photo-card hero-photo-main">
            <img src="/images/wedding/hero-sign.jpeg" alt="Cartel floral elegante de boda" />
            <span>Invitación Iglesia</span>
          </div>

          <div className="side-mini-grid">
            <div className="side-photo-card small"><img src="/images/wedding/bridal-bouquet.jpeg" alt="Ramo de flores blancas y lilas" /><span>Flores</span></div>
            <div className="side-photo-card small"><img src="/images/wedding/wedding-cake.jpeg" alt="Torta blanca con flores lilas" /><span>Dorado & lila</span></div>
          </div>

          <div className="countdown-card ornate-panel">
            <p className="countdown-title">Faltan</p>
            <Countdown weddingDate={config.wedding_date} />
          </div>

          <div className="calendar-card ornate-panel">
            <MiniCalendar />
          </div>

          <div className="contact-panel ornate-panel">
            <p className="section-label" style={{ margin: 0, letterSpacing: '.22em' }}>Contacto</p>
            <a className="btn-whatsapp" href={`https://wa.me/${WHATSAPP_1}?text=${whatsappText}`} target="_blank" rel="noreferrer">
              <MessageCircle size={16} /> 926301822
            </a>
            <a className="btn-whatsapp" href={`https://wa.me/${WHATSAPP_2}?text=${whatsappText}`} target="_blank" rel="noreferrer">
              <MessageCircle size={16} /> 988215400
            </a>
          </div>
        </aside>
      </div>

      <div className="hero-bottom-ribbon" aria-hidden="true">
        <span><CalendarDays size={16} /> 6 febrero 2027</span>
        <span><Clock size={16} /> 18:00 hrs</span>
        <span><MapPin size={16} /> Catedral de Antofagasta</span>
      </div>
    </section>
  )
}
