'use client'
import { useEffect, useState } from 'react'

interface IntroScreenProps { onComplete: () => void }

function Petal({ style }: { style: React.CSSProperties }) {
  return <span className="intro-petal" style={style} />
}

function Bride3D() {
  return (
    <svg className="character-svg bride-3d" viewBox="0 0 150 230" aria-label="Novia caminando hacia el novio">
      <defs>
        <linearGradient id="brideSkin" x1="0" x2="1">
          <stop offset="0" stopColor="#f7d5b7" />
          <stop offset="1" stopColor="#d49b75" />
        </linearGradient>
        <linearGradient id="brideDress" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset=".48" stopColor="#fff8ef" />
          <stop offset="1" stopColor="#e9dafc" />
        </linearGradient>
        <radialGradient id="brideGlow" cx="45%" cy="25%" r="80%">
          <stop offset="0" stopColor="#ffffff" stopOpacity="1" />
          <stop offset="1" stopColor="#d6c0ee" stopOpacity=".15" />
        </radialGradient>
        <filter id="charShadow" x="-40%" y="-20%" width="180%" height="150%">
          <feDropShadow dx="0" dy="10" stdDeviation="6" floodColor="#000" floodOpacity=".28" />
        </filter>
      </defs>
      <g filter="url(#charShadow)">
        <path className="veil-animated" d="M73 20 C42 28 28 72 38 112 C46 149 28 181 9 214 C47 222 105 222 139 213 C113 180 102 150 108 113 C116 68 103 30 73 20Z" fill="url(#brideGlow)" opacity=".72" />
        <path d="M48 40 C54 16 94 15 101 42 C88 32 61 32 48 40Z" fill="#7b5539" />
        <circle cx="76" cy="55" r="19" fill="url(#brideSkin)" />
        <path d="M54 52 C58 30 92 27 101 53 C87 45 66 44 54 52Z" fill="#6b4a2e" />
        <circle cx="60" cy="31" r="6" fill="#fff" /><circle cx="71" cy="25" r="5" fill="#e7d4ff" /><circle cx="83" cy="28" r="6" fill="#fff" /><circle cx="94" cy="35" r="5" fill="#f4e3c1" />
        <path className="dress-sway" d="M57 80 C67 71 87 71 97 80 L105 120 C91 130 65 130 50 120Z" fill="url(#brideDress)" />
        <path className="dress-sway" d="M51 117 C33 144 22 178 16 220 C55 232 100 232 138 220 C130 178 118 144 101 117 C88 128 65 128 51 117Z" fill="url(#brideDress)" />
        <path d="M22 203 C7 207 -1 218 3 229 C26 226 45 218 60 208" fill="rgba(255,255,255,.62)" />
        <path className="bride-arm arm-left" d="M55 88 C36 98 31 116 35 130" stroke="url(#brideSkin)" strokeWidth="8" strokeLinecap="round" fill="none" />
        <path className="bride-arm arm-right" d="M96 88 C115 98 119 116 113 130" stroke="url(#brideSkin)" strokeWidth="8" strokeLinecap="round" fill="none" />
        <g transform="translate(116 126)">
          <circle cx="0" cy="0" r="10" fill="#d8c0f4" /><circle cx="-8" cy="-3" r="7" fill="#fff" /><circle cx="8" cy="-5" r="7" fill="#c8a7e8" /><circle cx="0" cy="8" r="6" fill="#d9a6bb" />
          <path d="M0 11 L-4 31 M2 11 L8 31" stroke="#526b4b" strokeWidth="2.4" />
        </g>
        <path className="bride-leg leg-left" d="M62 215 C60 222 58 227 56 232" stroke="url(#brideSkin)" strokeWidth="7" strokeLinecap="round" />
        <path className="bride-leg leg-right" d="M94 215 C97 222 99 227 101 232" stroke="url(#brideSkin)" strokeWidth="7" strokeLinecap="round" />
        <ellipse cx="55" cy="230" rx="9" ry="4" fill="#c7a15a" /><ellipse cx="103" cy="230" rx="9" ry="4" fill="#c7a15a" />
      </g>
    </svg>
  )
}

function Groom3D() {
  return (
    <svg className="character-svg groom-3d" viewBox="0 0 130 230" aria-label="Novio esperando en la puerta de la iglesia">
      <defs>
        <linearGradient id="groomSuit" x1="0" x2="1">
          <stop offset="0" stopColor="#050505" />
          <stop offset=".5" stopColor="#1d1a19" />
          <stop offset="1" stopColor="#000" />
        </linearGradient>
        <linearGradient id="groomSkin" x1="0" x2="1">
          <stop offset="0" stopColor="#f1c19b" />
          <stop offset="1" stopColor="#c4825d" />
        </linearGradient>
      </defs>
      <g filter="url(#charShadow)">
        <circle cx="65" cy="45" r="20" fill="url(#groomSkin)" />
        <path d="M41 44 C48 19 82 16 91 45 C76 35 56 34 41 44Z" fill="#2c211d" />
        <path d="M39 75 L91 75 L104 205 L26 205Z" fill="url(#groomSuit)" />
        <path d="M56 77 L74 77 L81 202 L49 202Z" fill="#fffaf1" />
        <path d="M65 87 L55 105 L65 114 L75 105Z" fill="#c7a15a" />
        <path d="M38 88 C23 112 20 142 24 164" stroke="#0a0909" strokeWidth="12" strokeLinecap="round" fill="none" />
        <path d="M92 88 C108 112 111 142 106 164" stroke="#0a0909" strokeWidth="12" strokeLinecap="round" fill="none" />
        <path d="M48 205 L45 229 M82 205 L85 229" stroke="#0a0909" strokeWidth="12" strokeLinecap="round" />
        <ellipse cx="45" cy="229" rx="12" ry="4" fill="#070707" /><ellipse cx="86" cy="229" rx="12" ry="4" fill="#070707" />
        <circle cx="88" cy="84" r="5" fill="#c8a7e8" />
      </g>
    </svg>
  )
}

export default function IntroScreen({ onComplete }: IntroScreenProps) {
  const [phase, setPhase] = useState<'intro' | 'fade'>('intro')
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => setProgress(p => Math.min(100, p + 0.95)), 42)
    const timer = setTimeout(() => {
      setPhase('fade')
      setTimeout(onComplete, 900)
    }, 5600)
    return () => { clearInterval(interval); clearTimeout(timer) }
  }, [onComplete])

  const petals = Array.from({ length: 30 }, (_, i) => ({
    left: `${(i * 7 + 3) % 100}%`,
    animationDelay: `${i * .18}s`,
    animationDuration: `${4.3 + (i % 5) * .32}s`,
  }))

  return (
    <div className={`intro-scene intro-luxury starfield ${phase === 'fade' ? 'intro-out' : ''}`}>
      <span className="shooting-star" style={{ top: '12%', left: '88%' }} />
      <span className="shooting-star s2" />
      <span className="shooting-star s3" />
      <span className="intro-moon" />
      <span className="intro-aurora intro-aurora-left" />
      <span className="intro-aurora intro-aurora-right" />

      <div className="intro-title-block">
        <p>Invitación religiosa</p>
        <h1>Carolina & Esthefano</h1>
        <span>La novia llega a la iglesia donde la espera el novio</span>
      </div>

      <div className="cathedral-stage" aria-hidden="true">
        <div className="cathedral-skyline">
          <div className="cathedral-side left" />
          <div className="cathedral-main">
            <div className="cathedral-cross" />
            <div className="cathedral-window" />
            <div className="cathedral-door" />
          </div>
          <div className="cathedral-side right" />
        </div>
        <div className="church-light" />
        <div className="aisle-runway" />
        <div className="groom-position"><Groom3D /></div>
        <div className="bride-position"><Bride3D /></div>
      </div>

      {petals.map((p, i) => <Petal key={i} style={{ left: p.left, top: -30, animationDelay: p.animationDelay, animationDuration: p.animationDuration }} />)}

      <div className="intro-progress">
        <div className="intro-progress-track"><div style={{ width: `${progress}%` }} /></div>
        <p>Abriendo la invitación...</p>
      </div>
    </div>
  )
}
