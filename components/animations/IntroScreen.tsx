'use client'
import { useEffect, useState } from 'react'

interface IntroScreenProps { onComplete: () => void }

function Petal({ style }: { style: React.CSSProperties }) {
  return <span style={{ position: 'absolute', width: 12, height: 12, borderRadius: '70% 10% 70% 10%', background: 'linear-gradient(135deg, #fff, #c8a7e8)', opacity: .75, ...style }} />
}

function Bride() {
  return (
    <svg viewBox="0 0 120 190" width="118" height="190" aria-label="Novia animada">
      <defs>
        <linearGradient id="dressIntro" x1="0" x2="1">
          <stop offset="0" stopColor="#fff" />
          <stop offset=".55" stopColor="#fff7ee" />
          <stop offset="1" stopColor="#efe0ff" />
        </linearGradient>
        <linearGradient id="bouquetIntro" x1="0" x2="1">
          <stop offset="0" stopColor="#fff" />
          <stop offset="1" stopColor="#c8a7e8" />
        </linearGradient>
      </defs>
      <path d="M58 23 C38 22 28 45 31 72 C34 97 20 121 16 168 C40 181 80 181 104 168 C96 120 88 96 90 70 C92 43 78 24 58 23Z" fill="rgba(255,255,255,.40)" />
      <path d="M42 31 C48 14 78 15 85 32 C77 24 52 24 42 31Z" fill="#6b4a2e" />
      <circle cx="63" cy="43" r="16" fill="#f2caa5" />
      <path d="M47 40 C52 24 75 23 82 40 C73 35 57 34 47 40Z" fill="#6b4a2e" />
      <circle cx="52" cy="24" r="5" fill="#fff" /><circle cx="61" cy="20" r="4" fill="#e8d5ff" /><circle cx="70" cy="23" r="5" fill="#fff" />
      <path d="M49 63 C57 58 70 58 78 63 L82 94 C70 101 55 101 43 94Z" fill="url(#dressIntro)" style={{ animation: 'dressFlow .9s ease-in-out infinite' }} />
      <path d="M43 92 C29 115 21 143 17 176 C46 187 79 187 108 176 C103 143 95 115 82 92 C72 100 53 100 43 92Z" fill="url(#dressIntro)" style={{ animation: 'dressFlow .9s ease-in-out infinite' }} />
      <path d="M19 164 C6 170 0 181 3 190 C21 188 34 181 45 174" fill="rgba(255,255,255,.68)" />
      <path d="M47 70 C33 75 28 86 29 96" stroke="#f2caa5" strokeWidth="7" strokeLinecap="round" fill="none" style={{ animation: 'armSwing .8s ease-in-out infinite' }} />
      <path d="M78 70 C91 76 95 87 92 98" stroke="#f2caa5" strokeWidth="7" strokeLinecap="round" fill="none" style={{ animation: 'armSwing .8s ease-in-out infinite reverse' }} />
      <g transform="translate(88 94)">
        <circle cx="0" cy="0" r="9" fill="url(#bouquetIntro)" /><circle cx="-7" cy="-3" r="6" fill="#fff" /><circle cx="7" cy="-4" r="6" fill="#c8a7e8" /><circle cx="0" cy="7" r="5" fill="#d9a6bb" />
        <path d="M0 10 L-4 24 M1 10 L5 24" stroke="#526b4b" strokeWidth="2" />
      </g>
      <path d="M51 173 C49 180 48 185 47 190" stroke="#f2caa5" strokeWidth="5" strokeLinecap="round" style={{ animation: 'legSwing .65s ease-in-out infinite' }} />
      <path d="M76 173 C78 180 79 185 80 190" stroke="#f2caa5" strokeWidth="5" strokeLinecap="round" style={{ animation: 'legSwing .65s ease-in-out infinite reverse' }} />
      <ellipse cx="47" cy="188" rx="7" ry="3" fill="#c7a15a" /><ellipse cx="81" cy="188" rx="7" ry="3" fill="#c7a15a" />
    </svg>
  )
}

function Groom() {
  return (
    <svg viewBox="0 0 90 160" width="90" height="160" aria-label="Novio esperando">
      <circle cx="45" cy="24" r="14" fill="#f2caa5" />
      <path d="M30 23 C36 8 59 8 65 24 C55 18 41 18 30 23Z" fill="#3a2a22" />
      <path d="M28 45 L62 45 L70 140 L20 140Z" fill="#111" />
      <path d="M40 46 L50 46 L55 138 L35 138Z" fill="#f5efe6" />
      <path d="M45 52 L38 66 L45 72 L52 66Z" fill="#c7a15a" />
      <path d="M26 54 C16 72 14 92 18 112" stroke="#111" strokeWidth="9" strokeLinecap="round" fill="none" />
      <path d="M64 54 C75 73 77 93 72 112" stroke="#111" strokeWidth="9" strokeLinecap="round" fill="none" />
      <path d="M34 140 L32 158 M56 140 L58 158" stroke="#111" strokeWidth="9" strokeLinecap="round" />
    </svg>
  )
}

export default function IntroScreen({ onComplete }: IntroScreenProps) {
  const [phase, setPhase] = useState<'intro' | 'fade'>('intro')
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => setProgress(p => Math.min(100, p + 1.15)), 42)
    const timer = setTimeout(() => {
      setPhase('fade')
      setTimeout(onComplete, 850)
    }, 4800)
    return () => { clearInterval(interval); clearTimeout(timer) }
  }, [onComplete])

  const petals = Array.from({ length: 22 }, (_, i) => ({ left: `${(i * 9 + 4) % 100}%`, animationDelay: `${i * .25}s`, animationDuration: `${4 + (i % 4) * .35}s` }))

  return (
    <div className="intro-scene starfield" style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'linear-gradient(180deg, #08050d 0%, #1b0f24 38%, #271b17 70%, #0b0a09 100%)', animation: phase === 'fade' ? 'introFadeOut .85s ease forwards' : undefined }}>
      <span className="shooting-star" style={{ top: '16%', left: '84%' }} />
      <span className="shooting-star s2" />
      <span className="shooting-star s3" />

      <div style={{ position: 'absolute', top: '10%', right: '12%', width: 86, height: 86, borderRadius: '50%', background: 'radial-gradient(circle at 35% 35%, #fff9d8, #d9bd74 62%, #9b7132)', boxShadow: '0 0 60px rgba(234,211,154,.45)' }} />

      <svg viewBox="0 0 1000 520" preserveAspectRatio="xMidYMax slice" style={{ position: 'absolute', inset: 'auto 0 72px', width: '100%', height: '68%', opacity: .95 }}>
        <defs>
          <linearGradient id="churchGlow" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0" stopColor="#2a1916" />
            <stop offset="1" stopColor="#070505" />
          </linearGradient>
        </defs>
        <path d="M0 500 H1000 V520 H0Z" fill="#090707" />
        <path d="M370 500 V252 H420 V160 L455 132 L490 160 V252 H535 V500Z" fill="url(#churchGlow)" />
        <path d="M451 128 V76 H463 V128 M431 100 H483 V112 H431Z" fill="#7d5722" opacity=".7" />
        <path d="M220 500 V325 H350 V500Z M555 500 V325 H720 V500Z" fill="#160f0d" />
        <path d="M273 325 V275 H318 V325 M625 325 V275 H670 V325" fill="#19100e" />
        <path d="M443 250 C455 230 479 230 491 250 V285 H443Z" fill="#090606" opacity=".78" />
        <path d="M420 500 C430 420 480 420 535 500Z" fill="#120b0a" />
        <path d="M0 520 C210 480 790 480 1000 520Z" fill="rgba(199,161,90,.12)" />
      </svg>

      <div style={{ position: 'absolute', left: '50%', bottom: 72, transform: 'translateX(-50%)', width: 'min(500px, 52vw)', height: 210, background: 'linear-gradient(180deg, rgba(199,161,90,.10), rgba(255,250,241,.03))', clipPath: 'polygon(42% 0, 58% 0, 100% 100%, 0 100%)', borderLeft: '1px solid rgba(199,161,90,.16)', borderRight: '1px solid rgba(199,161,90,.16)' }} />

      {petals.map((p, i) => <Petal key={i} style={{ left: p.left, top: -20, animation: `petalFall ${p.animationDuration} linear ${p.animationDelay} infinite` }} />)}

      <div style={{ position: 'absolute', bottom: 168, left: '50%', transform: 'translateX(152px)', zIndex: 4 }}><Groom /></div>
      <div style={{ position: 'absolute', bottom: 132, left: '50%', transform: 'translateX(-50%)', zIndex: 5, animation: 'brideWalk 4.6s cubic-bezier(.35,.02,.2,1) forwards' }}><Bride /></div>

      <div style={{ position: 'absolute', inset: '12% 20px auto', textAlign: 'center', zIndex: 6 }}>
        <p className="font-cinzel" style={{ margin: '0 0 .4rem', color: 'rgba(234,211,154,.76)', letterSpacing: '.36em', textTransform: 'uppercase', fontSize: 'clamp(.74rem, 2vw, 1rem)' }}>Abriendo el portal de</p>
        <h1 className="font-script" style={{ margin: 0, color: '#f7efe4', fontSize: 'clamp(3.4rem, 10vw, 7.2rem)', fontWeight: 400, lineHeight: .9, textShadow: '0 12px 48px rgba(0,0,0,.45)' }}>Carolina & Esthefano</h1>
        <p className="font-cormorant" style={{ color: 'rgba(255,250,241,.72)', fontStyle: 'italic', fontSize: '1.2rem' }}>La novia camina hacia la iglesia, donde la espera el novio.</p>
      </div>

      <div style={{ position: 'absolute', left: '50%', bottom: 38, transform: 'translateX(-50%)', width: 'min(580px, 72vw)', zIndex: 7 }}>
        <div style={{ height: 2, background: 'rgba(255,255,255,.13)', borderRadius: 99, overflow: 'hidden' }}>
          <div style={{ width: `${progress}%`, height: '100%', background: 'linear-gradient(90deg, var(--lilac), var(--gold))', transition: 'width .12s linear' }} />
        </div>
        <p className="font-cinzel" style={{ textAlign: 'center', color: 'rgba(234,211,154,.78)', letterSpacing: '.28em', fontSize: '.72rem', marginTop: 14 }}>Entrando a la invitación...</p>
      </div>
    </div>
  )
}
