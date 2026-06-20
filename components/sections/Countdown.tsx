'use client'
import { useState, useEffect } from 'react'
import { getCountdown } from '@/lib/wedding'

interface CountdownProps {
  weddingDate: string
}

export default function Countdown({ weddingDate }: CountdownProps) {
  const [time, setTime] = useState(getCountdown(weddingDate))

  useEffect(() => {
    const interval = setInterval(() => {
      setTime(getCountdown(weddingDate))
    }, 1000)
    return () => clearInterval(interval)
  }, [weddingDate])

  const units = [
    { value: time.days, label: 'Días' },
    { value: time.hours, label: 'Horas' },
    { value: time.minutes, label: 'Minutos' },
    { value: time.seconds, label: 'Segundos' },
  ]

  return (
    <div className="flex justify-center gap-3 md:gap-6 flex-wrap">
      {units.map((unit, i) => (
        <div key={unit.label} className="flex flex-col items-center">
          <div
            className="wedding-card flex items-center justify-center"
            style={{
              width: 'clamp(64px, 15vw, 88px)',
              height: 'clamp(64px, 15vw, 88px)',
              position: 'relative',
              animation: `countdownTick 1s ease-in-out ${i * 0.1}s infinite`,
            }}
          >
            {/* Gold border accent */}
            <div style={{
              position: 'absolute', inset: 0, borderRadius: 16,
              background: 'linear-gradient(135deg, rgba(201,169,110,0.15), transparent)',
            }} />
            <span
              className="font-display"
              style={{
                fontSize: 'clamp(1.5rem, 4vw, 2.2rem)',
                fontWeight: 700,
                color: 'var(--gold-dark)',
                lineHeight: 1,
              }}
            >
              {String(unit.value).padStart(2, '0')}
            </span>
          </div>
          <span
            className="font-inter mt-2"
            style={{
              fontSize: '0.65rem',
              letterSpacing: '0.15em',
              textTransform: 'uppercase',
              color: 'var(--charcoal-muted)',
            }}
          >
            {unit.label}
          </span>
        </div>
      ))}
    </div>
  )
}
