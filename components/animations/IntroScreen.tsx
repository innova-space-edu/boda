'use client'
import { useEffect, useState } from 'react'

interface IntroScreenProps {
  onComplete: () => void
}

function Petal({ style }: { style: React.CSSProperties }) {
  return (
    <div
      style={{
        position: 'absolute',
        width: 10,
        height: 10,
        borderRadius: '50% 0 50% 0',
        background: 'rgba(232, 180, 192, 0.85)',
        ...style,
      }}
    />
  )
}

function Star({ x, y, delay }: { x: number; y: number; delay: number }) {
  return (
    <div
      style={{
        position: 'absolute',
        left: `${x}%`,
        top: `${y}%`,
        width: 3,
        height: 3,
        borderRadius: '50%',
        background: 'rgba(232,213,163,0.9)',
        animation: `starTwinkle ${1.5 + delay}s ease-in-out infinite`,
        animationDelay: `${delay}s`,
      }}
    />
  )
}

export default function IntroScreen({ onComplete }: IntroScreenProps) {
  const [phase, setPhase] = useState<'walking' | 'fadeout'>('walking')
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    // Progress bar
    const interval = setInterval(() => {
      setProgress(p => {
        if (p >= 100) { clearInterval(interval); return 100 }
        return p + 0.8
      })
    }, 40)

    // Trigger fade after bride walks
    const timer = setTimeout(() => {
      setPhase('fadeout')
      setTimeout(onComplete, 900)
    }, 5200)

    return () => { clearInterval(interval); clearTimeout(timer) }
  }, [onComplete])

  const stars = Array.from({ length: 30 }, (_, i) => ({
    x: (i * 37 + 11) % 100,
    y: (i * 19 + 7) % 60,
    delay: ((i * 11) % 20) / 10,
  }))

  const petals = Array.from({ length: 18 }, (_, i) => ({
    left: `${(i * 7) % 100}%`,
    animationDelay: `${i * 0.3}s`,
    animationDuration: `${3 + (i % 3)}s`,
  }))

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        background: 'linear-gradient(180deg, #0a0510 0%, #1a0d1a 25%, #2d1510 55%, #4a2818 80%, #6b3d22 100%)',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'flex-end',
        overflow: 'hidden',
        animation: phase === 'fadeout' ? 'introFadeOut 0.9s ease-out forwards' : undefined,
      }}
    >
      {/* Stars */}
      {stars.map((s, i) => <Star key={i} x={s.x} y={s.y} delay={s.delay} />)}

      {/* Moon */}
      <div style={{
        position: 'absolute', top: '8%', right: '15%',
        width: 55, height: 55, borderRadius: '50%',
        background: 'radial-gradient(circle at 35% 35%, #FFF8E1 0%, #F5D98B 60%, #C9A040 100%)',
        boxShadow: '0 0 30px rgba(245,217,139,0.5), 0 0 60px rgba(245,217,139,0.2)',
        animation: 'skyGlow 4s ease-in-out infinite',
      }} />

      {/* Church silhouette */}
      <svg
        viewBox="0 0 800 300"
        style={{ position: 'absolute', bottom: 120, width: '100%', opacity: 0.35 }}
        preserveAspectRatio="xMidYMax meet"
      >
        {/* Main cathedral body */}
        <path d="M320 300 L320 160 L340 160 L340 80 L360 60 L380 80 L380 160 L400 160 L400 300 Z"
          fill="#3d2010" />
        {/* Cross on top */}
        <path d="M357 60 L363 60 L363 40 L357 40 Z M350 50 L370 50 L370 44 L350 44 Z"
          fill="#5a3018" />
        {/* Left wing */}
        <path d="M200 300 L200 200 L240 200 L240 180 L260 180 L260 200 L320 200 L320 300 Z"
          fill="#2d1810" />
        {/* Right wing */}
        <path d="M400 300 L400 200 L460 200 L460 180 L480 180 L480 200 L520 200 L520 300 Z"
          fill="#2d1810" />
        {/* Arch window details */}
        <path d="M345 150 Q360 135 375 150 L375 160 L345 160 Z"
          fill="#1a0f08" opacity="0.5" />
        {/* Steps */}
        <path d="M300 300 L500 300 L490 295 L310 295 Z" fill="#1a0f08" />
        {/* Bell towers far sides */}
        <path d="M120 300 L120 220 L160 220 L160 190 L170 185 L180 190 L180 220 L220 220 L220 300 Z"
          fill="#1a0f08" opacity="0.4" />
        <path d="M580 300 L580 220 L620 220 L620 190 L630 185 L640 190 L640 220 L680 220 L680 300 Z"
          fill="#1a0f08" opacity="0.4" />
      </svg>

      {/* Path / ground */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0, height: 130,
        background: 'linear-gradient(0deg, #1a0d06 0%, #2d1810 50%, transparent 100%)',
      }} />
      {/* Path center aisle */}
      <div style={{
        position: 'absolute', bottom: 0, left: '42%', right: '42%', height: 130,
        background: 'linear-gradient(0deg, rgba(201,169,110,0.15) 0%, transparent 100%)',
        borderLeft: '1px solid rgba(201,169,110,0.1)',
        borderRight: '1px solid rgba(201,169,110,0.1)',
      }} />

      {/* Falling petals */}
      {petals.map((p, i) => (
        <Petal key={i} style={{
          left: p.left, top: '-20px',
          animation: `petalFall ${p.animationDuration} linear ${p.animationDelay} infinite`,
        }} />
      ))}

      {/* BRIDE SVG walking */}
      <div style={{
        position: 'absolute',
        bottom: 85,
        width: 80,
        height: 160,
        animation: 'brideWalk 5s linear forwards',
        zIndex: 10,
      }}>
        <svg viewBox="0 0 80 160" xmlns="http://www.w3.org/2000/svg" width="80" height="160">
          {/* Veil */}
          <ellipse cx="40" cy="8" rx="16" ry="10" fill="rgba(255,255,255,0.9)"
            style={{ animation: 'veilFloat 1.5s ease-in-out infinite' }} />
          <path d="M24 8 Q18 20 22 40 Q26 55 20 65" stroke="rgba(255,255,255,0.7)" strokeWidth="1.5"
            fill="none" style={{ animation: 'veilFloat 1.5s ease-in-out infinite' }} />

          {/* Head */}
          <circle cx="40" cy="22" r="11" fill="#F5CBA7" />
          {/* Hair */}
          <path d="M29 18 Q40 10 51 18 Q52 14 40 11 Q28 12 29 18 Z" fill="#5D3A1A" />
          {/* Bun with flowers */}
          <ellipse cx="40" cy="12" rx="8" ry="5" fill="#5D3A1A" />
          <circle cx="40" cy="8" r="3" fill="white" opacity="0.9" />
          <circle cx="35" cy="10" r="2" fill="#F0D4DC" opacity="0.9" />
          <circle cx="45" cy="10" r="2" fill="#F0D4DC" opacity="0.9" />

          {/* Neck */}
          <rect x="37" y="33" width="6" height="6" rx="2" fill="#F5CBA7" />

          {/* Dress bodice */}
          <path d="M30 38 Q40 35 50 38 L52 65 Q40 68 28 65 Z"
            fill="white" style={{ animation: 'dressFlow 0.6s ease-in-out infinite' }} />
          {/* Lace detail */}
          <path d="M30 38 Q40 42 50 38" stroke="rgba(232,213,163,0.6)" strokeWidth="1" fill="none" />
          <path d="M29 50 Q40 53 51 50" stroke="rgba(232,213,163,0.4)" strokeWidth="0.8" fill="none" />

          {/* Dress skirt - bell shape */}
          <path d="M28 65 Q18 85 15 120 Q40 125 65 120 Q62 85 52 65 Q40 68 28 65 Z"
            fill="white" style={{ animation: 'dressFlow 0.6s ease-in-out infinite' }} />
          {/* Skirt layers */}
          <path d="M20 90 Q40 95 60 90 Q58 105 40 107 Q22 105 20 90 Z"
            fill="rgba(240,212,220,0.4)" />
          <path d="M16 110 Q40 116 64 110 Q60 124 40 126 Q20 124 16 110 Z"
            fill="rgba(240,212,220,0.3)" />

          {/* Train */}
          <path d="M15 115 Q5 125 8 135 Q20 132 28 125"
            fill="rgba(255,255,255,0.8)" stroke="rgba(240,212,220,0.5)" strokeWidth="0.5" />

          {/* Left arm */}
          <path d="M30 42 Q22 52 24 60" stroke="#F5CBA7" strokeWidth="5" strokeLinecap="round" fill="none"
            style={{ animation: 'armSwing 0.6s ease-in-out infinite' }}
          />
          {/* Right arm holding bouquet */}
          <path d="M50 42 Q56 52 54 58" stroke="#F5CBA7" strokeWidth="5" strokeLinecap="round" fill="none"
            style={{ animation: 'armSwing 0.6s ease-in-out infinite reverse' }}
          />
          {/* Bouquet */}
          <circle cx="55" cy="60" r="7" fill="#C4748A" opacity="0.9" />
          <circle cx="52" cy="57" r="4" fill="#E8B4C0" opacity="0.8" />
          <circle cx="58" cy="58" r="4" fill="#F0D4DC" opacity="0.8" />
          <circle cx="54" cy="62" r="3.5" fill="#C4748A" opacity="0.7" />
          <path d="M55 67 L55 75" stroke="#7A9E87" strokeWidth="1.5" />
          <path d="M53 67 L51 74" stroke="#7A9E87" strokeWidth="1.5" />

          {/* Left leg */}
          <path d="M32 118 Q30 135 31 155" stroke="#F5CBA7" strokeWidth="4" strokeLinecap="round" fill="none"
            style={{ animation: 'legSwing 0.5s ease-in-out infinite', transformOrigin: '32px 118px' }}
          />
          {/* Right leg */}
          <path d="M48 118 Q50 135 49 155" stroke="#F5CBA7" strokeWidth="4" strokeLinecap="round" fill="none"
            style={{ animation: 'legSwing 0.5s ease-in-out infinite reverse', transformOrigin: '48px 118px' }}
          />
          {/* Shoes */}
          <ellipse cx="31" cy="156" rx="5" ry="3" fill="#C9A96E" />
          <ellipse cx="49" cy="156" rx="5" ry="3" fill="#C9A96E" />
        </svg>
      </div>

      {/* Text overlay */}
      <div style={{
        position: 'absolute', top: '18%', left: 0, right: 0,
        textAlign: 'center',
        animation: 'fadeIn 2s ease-out 0.5s both',
      }}>
        <p style={{
          fontFamily: "'Cormorant Garamond', serif",
          fontSize: 'clamp(0.9rem, 2.5vw, 1.1rem)',
          color: 'rgba(232,213,163,0.8)',
          letterSpacing: '0.35em',
          textTransform: 'uppercase',
          marginBottom: 12,
        }}>
          Bienvenidos a la celebración de
        </p>
        <h1 style={{
          fontFamily: "'Playfair Display', serif",
          fontSize: 'clamp(2rem, 5vw, 3.5rem)',
          fontWeight: 400,
          color: '#E8D5A3',
          letterSpacing: '0.05em',
          margin: 0,
          textShadow: '0 2px 20px rgba(201,169,110,0.4)',
        }}>
          Carolina <span style={{ color: 'rgba(232,180,192,0.9)', fontStyle: 'italic' }}>&</span> Esthefano
        </h1>
        <p style={{
          fontFamily: "'Cormorant Garamond', serif",
          fontSize: 'clamp(1rem, 2.5vw, 1.3rem)',
          color: 'rgba(232,213,163,0.6)',
          letterSpacing: '0.2em',
          marginTop: 10,
          fontStyle: 'italic',
        }}>
          6 · febrero · 2027
        </p>
      </div>

      {/* Progress bar */}
      <div style={{
        position: 'absolute', bottom: 20, left: '10%', right: '10%',
        height: 2, background: 'rgba(201,169,110,0.2)', borderRadius: 2,
      }}>
        <div style={{
          height: '100%', width: `${progress}%`, borderRadius: 2,
          background: 'linear-gradient(90deg, var(--gold-dark), var(--gold))',
          transition: 'width 0.1s linear',
        }} />
      </div>
      <p style={{
        position: 'absolute', bottom: 28,
        fontFamily: "'Inter', sans-serif",
        fontSize: '0.7rem', letterSpacing: '0.3em',
        color: 'rgba(201,169,110,0.5)',
        textTransform: 'uppercase',
      }}>
        Entrando al portal...
      </p>
    </div>
  )
}
