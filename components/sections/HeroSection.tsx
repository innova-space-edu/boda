'use client'
import Link from 'next/link'
import { CalendarDays, Clock, MapPin, MessageCircle, Navigation, Sparkles } from 'lucide-react'
import Countdown from './Countdown'
import type { WeddingConfig } from '@/types'
import { formatWeddingDate } from '@/lib/wedding'

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
  const brideName = config.bride_name.split(' ')[0]
  const groomName = config.groom_name.split(' ')[0]
  const mapQuery = `${config.venue_name}, ${config.venue_address}, ${config.city}`
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(mapQuery)}`
  const whatsappText = encodeURIComponent('Hola, tengo una consulta sobre la boda de Carolina y Esthefano.')

  return (
    <section className="baroque-hero starfield" id="inicio">
      <span className="shooting-star" style={{ top: '11%', left: '90%' }} />
      <span className="shooting-star s2" />
      <span className="shooting-star s3" />
      <span className="floating-orb orb-lilac" />
      <span className="floating-orb orb-gold" />

      <div className="baroque-stage">
        <article className="baroque-card" aria-label="Invitación digital de boda religiosa">
          <div className="ornate-frame" />
          <div className="ornate-corner ornate-corner-tl" />
          <div className="ornate-corner ornate-corner-tr" />
          <div className="ornate-corner ornate-corner-bl" />
          <div className="ornate-corner ornate-corner-br" />

          <div className="monogram-wrap">
            <div className="monogram-ring">
              <span>C</span><span>E</span>
            </div>
          </div>

          <p className="invitation-kicker">Con mucho amor, queremos que formes parte</p>
          <p className="invitation-subkicker">de este momento tan especial ante Dios</p>

          <h1 className="names-metallic" aria-label={`${brideName} y ${groomName}`}>
            <span>{brideName}</span>
            <em>y</em>
            <span>{groomName}</span>
          </h1>

          <div className="surname-line">
            <span>Vega Carrera</span>
            <i />
            <span>Morales Campaña</span>
          </div>

          <div className="baroque-divider"><Sparkles size={16} /></div>

          <p className="church-invite-copy">
            {config.hero_message || 'Con la bendición de Dios y el amor de nuestras familias, queremos compartir contigo el inicio de nuestra nueva vida juntos.'}
          </p>

          <div className="date-luxury">
            <span>{formatWeddingDate(config.wedding_date).replace(',', '')}</span>
            <strong>{config.ceremony_time} hrs</strong>
            <span>{config.venue_name}</span>
          </div>

          <div className="hero-actions ornate-actions">
            <Link href="/confirmar" className="btn-gold">💌 Confirmar asistencia</Link>
            <a href={mapsUrl} className="btn-ghost" target="_blank" rel="noreferrer"><Navigation size={16} /> Ver ubicación</a>
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
