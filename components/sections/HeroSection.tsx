'use client'
import Link from 'next/link'
import { MapPin, Clock, Calendar, ChevronDown } from 'lucide-react'
import Countdown from './Countdown'
import type { WeddingConfig } from '@/types'
import { formatWeddingDate } from '@/lib/wedding'

export default function HeroSection({ config }: { config: WeddingConfig }) {
  const brideName = config.bride_name.split(' ')[0]
  const groomName = config.groom_name.split(' ')[0]

  return (
    <section
      className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden"
      style={{
        background: 'linear-gradient(160deg, #2C1810 0%, #3D2415 35%, #1F2D20 65%, #0D1A0E 100%)',
      }}
    >
      {config.hero_image_url && (
        <div style={{
          position: 'absolute', inset: 0,
          background: `center / cover no-repeat url(${config.hero_image_url})`,
          opacity: 0.18,
          filter: 'saturate(0.85)',
        }} />
      )}

      {/* Ambient glow circles */}
      <div style={{
        position: 'absolute', top: '15%', left: '10%',
        width: 350, height: 350, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(201,169,110,0.08) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute', bottom: '20%', right: '8%',
        width: 300, height: 300, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(196,116,138,0.08) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      {/* Stars */}
      {Array.from({ length: 25 }).map((_, i) => (
        <div key={i} style={{
          position: 'absolute',
          left: `${(i * 37 + 5) % 100}%`,
          top: `${(i * 23 + 8) % 55}%`,
          width: i % 3 === 0 ? 3 : 2,
          height: i % 3 === 0 ? 3 : 2,
          borderRadius: '50%',
          background: 'rgba(232,213,163,0.7)',
          animation: `starTwinkle ${1.5 + (i % 4) * 0.5}s ease-in-out ${(i % 5) * 0.4}s infinite`,
        }} />
      ))}

      {/* Ornamental top line */}
      <div className="animate-fade-in-up" style={{ animationDelay: '0.2s', textAlign: 'center', marginBottom: 8 }}>
        <p style={{
          fontFamily: "'Cormorant Garamond', serif",
          fontSize: 'clamp(0.8rem, 2vw, 1rem)',
          color: 'rgba(232,213,163,0.7)',
          letterSpacing: '0.4em',
          textTransform: 'uppercase',
        }}>
          Con amor y alegría te invitamos
        </p>
      </div>

      {/* Names */}
      <div className="text-center px-4" style={{ animation: 'fadeInUp 1s ease-out 0.4s both' }}>
        <h1 style={{
          fontFamily: "'Playfair Display', serif",
          fontSize: 'clamp(3.5rem, 10vw, 8rem)',
          fontWeight: 400,
          lineHeight: 1,
          color: '#F5EFE6',
          margin: 0,
          textShadow: '0 4px 30px rgba(0,0,0,0.4)',
        }}>
          {brideName}
        </h1>

        {/* Ampersand with ring */}
        <div style={{ margin: '0.5rem 0', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16 }}>
          <div style={{ height: 1, width: 60, background: 'linear-gradient(to right, transparent, rgba(201,169,110,0.6))' }} />
          <div className="animate-heartbeat" style={{ position: 'relative' }}>
            <span style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: 'clamp(2rem, 5vw, 3.5rem)',
              fontStyle: 'italic',
              color: 'var(--rose-muted)',
            }}>
              &amp;
            </span>
            {/* Ring icon */}
            <span style={{ position: 'absolute', top: -8, right: -8, fontSize: '0.7rem' }}>💍</span>
          </div>
          <div style={{ height: 1, width: 60, background: 'linear-gradient(to left, transparent, rgba(201,169,110,0.6))' }} />
        </div>

        <h1 style={{
          fontFamily: "'Playfair Display', serif",
          fontSize: 'clamp(3.5rem, 10vw, 8rem)',
          fontWeight: 400,
          lineHeight: 1,
          color: '#F5EFE6',
          margin: 0,
          textShadow: '0 4px 30px rgba(0,0,0,0.4)',
        }}>
          {groomName}
        </h1>
      </div>

      {/* Message */}
      <p
        className="text-center px-6 mt-6"
        style={{
          fontFamily: "'Cormorant Garamond', serif",
          fontSize: 'clamp(1rem, 2.5vw, 1.3rem)',
          color: 'rgba(245,239,230,0.75)',
          fontStyle: 'italic',
          maxWidth: 520,
          lineHeight: 1.7,
          animation: 'fadeIn 1s ease-out 0.8s both',
        }}
      >
        {config.hero_message}
      </p>

      {/* Info cards */}
      <div
        className="flex flex-wrap justify-center gap-4 mt-8 px-4"
        style={{ animation: 'fadeInUp 1s ease-out 1s both' }}
      >
        {[
          { icon: <Calendar size={16} />, text: formatWeddingDate(config.wedding_date) },
          { icon: <Clock size={16} />, text: `${config.ceremony_time} hrs` },
          { icon: <MapPin size={16} />, text: `${config.venue_name} · ${config.city}` },
        ].map((item, i) => (
          <div
            key={i}
            className="flex items-center gap-2 px-4 py-2 rounded-full font-inter text-sm"
            style={{
              background: 'rgba(255,255,255,0.07)',
              border: '1px solid rgba(201,169,110,0.25)',
              color: 'rgba(232,213,163,0.85)',
              backdropFilter: 'blur(10px)',
              fontSize: '0.8rem',
              letterSpacing: '0.02em',
            }}
          >
            <span style={{ color: 'var(--gold)' }}>{item.icon}</span>
            {item.text}
          </div>
        ))}
      </div>

      {/* Countdown */}
      <div className="mt-10 px-4 w-full max-w-lg" style={{ animation: 'fadeInUp 1s ease-out 1.2s both' }}>
        <p style={{
          fontFamily: "'Cormorant Garamond', serif",
          fontSize: '0.85rem',
          letterSpacing: '0.3em',
          textTransform: 'uppercase',
          color: 'rgba(201,169,110,0.6)',
          textAlign: 'center',
          marginBottom: 16,
        }}>
          Faltan
        </p>
        <Countdown weddingDate={config.wedding_date} />
      </div>

      {/* CTA Button */}
      <div className="mt-10" style={{ animation: 'fadeInUp 1s ease-out 1.4s both' }}>
        <Link href="/confirmar" className="btn-gold">
          💌 Confirmar mi Asistencia
        </Link>
      </div>

      {/* Scroll indicator */}
      <div
        className="absolute bottom-8 animate-float"
        style={{ color: 'rgba(201,169,110,0.5)' }}
      >
        <ChevronDown size={28} />
      </div>

      {/* Bottom fade */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0, height: 80,
        background: 'linear-gradient(0deg, var(--cream) 0%, transparent 100%)',
      }} />
    </section>
  )
}
