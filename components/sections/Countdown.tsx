'use client'
import { useState, useEffect } from 'react'
import { getCountdown } from '@/lib/wedding'

interface CountdownProps { weddingDate: string }

export default function Countdown({ weddingDate }: CountdownProps) {
  const [time, setTime] = useState(getCountdown(weddingDate))

  useEffect(() => {
    const interval = setInterval(() => setTime(getCountdown(weddingDate)), 1000)
    return () => clearInterval(interval)
  }, [weddingDate])

  const units = [
    { value: time.days, label: 'Días' },
    { value: time.hours, label: 'Horas' },
    { value: time.minutes, label: 'Minutos' },
    { value: time.seconds, label: 'Segundos' },
  ]

  return (
    <div className="countdown-grid">
      {units.map(unit => (
        <div className="countdown-item" key={unit.label}>
          <span className="countdown-num">{String(unit.value).padStart(2, '0')}</span>
          <span className="countdown-label">{unit.label}</span>
        </div>
      ))}
    </div>
  )
}
