'use client'
import { useState } from 'react'
import { Plus, Trash2, Check, Send } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'
import type { WeddingConfig, RsvpMember } from '@/types'
import { formatWeddingDate } from '@/lib/wedding'

interface RsvpFormProps {
  config: WeddingConfig
}

function EnvelopeAnimation({ onOpen, brideName, groomName, weddingDate }: { onOpen: () => void; brideName: string; groomName: string; weddingDate: string }) {
  const [opening, setOpening] = useState(false)
  const [opened, setOpened] = useState(false)

  const handleOpen = () => {
    if (opening || opened) return
    setOpening(true)
    setTimeout(() => {
      setOpened(true)
      setTimeout(onOpen, 400)
    }, 1200)
  }

  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      {/* Floating particles */}
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} style={{
          position: 'absolute',
          width: 8, height: 8,
          borderRadius: '50% 0 50% 0',
          background: 'var(--rose-muted)',
          left: `${20 + i * 10}%`,
          top: `${10 + (i % 3) * 20}%`,
          opacity: opening ? 1 : 0,
          animation: opening ? `petalFall ${1 + i * 0.2}s ease-out ${i * 0.1}s forwards` : 'none',
          pointerEvents: 'none',
        }} />
      ))}

      <p
        className="font-cormorant text-center mb-8"
        style={{
          fontSize: '1.3rem', fontStyle: 'italic',
          color: 'var(--charcoal-muted)',
          animation: 'fadeIn 1s ease-out',
        }}
      >
        Tienes una invitación especial esperándote...
      </p>

      {/* Envelope */}
      <div
        onClick={handleOpen}
        className="cursor-pointer select-none"
        style={{
          position: 'relative', width: 280, height: 200,
          filter: opening ? 'drop-shadow(0 20px 40px rgba(201,169,110,0.4))' : 'drop-shadow(0 8px 20px rgba(0,0,0,0.15))',
          transition: 'filter 0.5s ease',
          transform: opening ? 'scale(1.05)' : 'scale(1)',
          transitionProperty: 'transform, filter',
          transitionDuration: '0.4s',
          animation: !opening ? 'floatUp 2s ease-in-out infinite' : undefined,
        }}
      >
        {/* Envelope body */}
        <svg viewBox="0 0 280 200" xmlns="http://www.w3.org/2000/svg" width="280" height="200">
          {/* Shadow */}
          <ellipse cx="140" cy="195" rx="100" ry="8" fill="rgba(0,0,0,0.08)" />
          {/* Main body */}
          <rect x="10" y="70" width="260" height="120" rx="8" ry="8"
            fill="url(#envelopeGrad)" />
          {/* Bottom fold lines */}
          <line x1="10" y1="190" x2="140" y2="130" stroke="rgba(201,169,110,0.3)" strokeWidth="1" />
          <line x1="270" y1="190" x2="140" y2="130" stroke="rgba(201,169,110,0.3)" strokeWidth="1" />
          {/* Side folds */}
          <line x1="10" y1="70" x2="140" y2="130" stroke="rgba(201,169,110,0.25)" strokeWidth="1" />
          <line x1="270" y1="70" x2="140" y2="130" stroke="rgba(201,169,110,0.25)" strokeWidth="1" />
          {/* Wax seal */}
          <circle cx="140" cy="130" r="22" fill="url(#sealGrad)"
            style={{
              filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))',
              animation: 'pulseGold 2s ease-in-out infinite',
            }}
          />
          <text x="140" y="135" textAnchor="middle" fontSize="18" fill="white" fontFamily="serif">
            ♥
          </text>
          {/* C & E initials */}
          <text x="132" y="127" textAnchor="middle" fontSize="8" fill="rgba(255,255,255,0.8)" fontFamily="Playfair Display, serif">C</text>
          <text x="148" y="127" textAnchor="middle" fontSize="8" fill="rgba(255,255,255,0.8)" fontFamily="Playfair Display, serif">E</text>
          {/* Lid — animates open */}
          <path
            d="M10 70 L140 140 L270 70 Z"
            fill="url(#lidGrad)"
            style={{
              transformOrigin: '140px 70px',
              animation: opening ? 'envelopeLidOpen 1s ease-in-out forwards' : undefined,
            }}
          />
          {/* Gold border on lid */}
          <path d="M10 70 L140 140 L270 70" stroke="rgba(201,169,110,0.4)" strokeWidth="1.5" fill="none"
            style={{
              transformOrigin: '140px 70px',
              animation: opening ? 'envelopeLidOpen 1s ease-in-out forwards' : undefined,
            }}
          />
          {/* Ribbon at top */}
          <rect x="125" y="10" width="30" height="60" rx="15" fill="url(#ribbonGrad)" opacity="0.6" />
          <ellipse cx="140" cy="10" rx="18" ry="12" fill="url(#ribbonGrad)" />
          {/* Defs */}
          <defs>
            <linearGradient id="envelopeGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#FFF8F0" />
              <stop offset="100%" stopColor="#F5E6D3" />
            </linearGradient>
            <linearGradient id="lidGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#FEF3E8" />
              <stop offset="100%" stopColor="#EDD9C0" />
            </linearGradient>
            <radialGradient id="sealGrad" cx="40%" cy="40%">
              <stop offset="0%" stopColor="#C4748A" />
              <stop offset="100%" stopColor="#9A4A65" />
            </radialGradient>
            <linearGradient id="ribbonGrad" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#C9A96E" />
              <stop offset="50%" stopColor="#E8D5A3" />
              <stop offset="100%" stopColor="#C9A96E" />
            </linearGradient>
          </defs>
        </svg>

        {/* Letter rising from envelope when opening */}
        {opening && (
          <div style={{
            position: 'absolute', left: '50%', top: 0,
            transform: 'translateX(-50%)',
            width: 200, padding: '12px 16px',
            background: 'white',
            border: '1px solid var(--gold-light)',
            borderRadius: 8,
            animation: 'letterRise 1s ease-out 0.3s both',
            boxShadow: '0 4px 20px rgba(201,169,110,0.3)',
            textAlign: 'center',
          }}>
            <p style={{ fontFamily: "'Playfair Display', serif", fontSize: '0.9rem', color: 'var(--gold-dark)' }}>
              ✦ {brideName} & {groomName} ✦
            </p>
            <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '0.75rem', color: 'var(--charcoal-muted)', fontStyle: 'italic', marginTop: 4 }}>
              te invitan a su boda
            </p>
            <p style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.65rem', color: 'var(--gold)', marginTop: 6, letterSpacing: '0.1em' }}>
              {formatWeddingDate(weddingDate)}
            </p>
          </div>
        )}
      </div>

      <p
        className="mt-8 font-inter text-sm animate-float"
        style={{ color: 'var(--charcoal-muted)', letterSpacing: '0.1em' }}
      >
        {opening ? '✨ Abriendo tu invitación...' : '👆 Haz clic para abrir'}
      </p>

      {!opening && (
        <button onClick={handleOpen} className="btn-gold mt-6">
          Abrir Invitación
        </button>
      )}
    </div>
  )
}

export default function RsvpForm({ config }: RsvpFormProps) {
  const [showEnvelope, setShowEnvelope] = useState(true)
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)

  const [familyName, setFamilyName] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [dietary, setDietary] = useState('')
  const [members, setMembers] = useState<RsvpMember[]>([
    { name: '', attending: true },
  ])
  const [willContribute, setWillContribute] = useState(false)
  const [envelopeMessage, setEnvelopeMessage] = useState('')

  const brideName = config.bride_name.split(' ')[0]
  const groomName = config.groom_name.split(' ')[0]

  const addMember = () => {
    if (members.length < 10) {
      setMembers([...members, { name: '', attending: true }])
    }
  }

  const removeMember = (i: number) => {
    setMembers(members.filter((_, idx) => idx !== i))
  }

  const updateMember = (i: number, field: keyof RsvpMember, value: string | boolean) => {
    const updated = [...members]
    updated[i] = { ...updated[i], [field]: value }
    setMembers(updated)
  }

  const totalAttending = members.filter(m => m.attending).length

  const handleSubmit = async () => {
    if (!familyName.trim()) { toast.error('Por favor ingresa el nombre de tu familia'); return }
    const validMembers = members.filter(m => m.name.trim())
    if (validMembers.length === 0) { toast.error('Agrega al menos un integrante'); return }

    setLoading(true)
    try {
      const { error } = await supabase.from('rsvp_responses').insert({
        family_name: familyName.trim(),
        phone: phone.trim(),
        email: email.trim(),
        members: validMembers,
        total_attending: validMembers.filter(m => m.attending).length,
        dietary_notes: dietary.trim(),
        envelope_message: envelopeMessage.trim(),
        will_contribute: willContribute,
        user_agent: navigator.userAgent.slice(0, 200),
      })

      if (error) throw error
      setSubmitted(true)
      toast.success('¡Confirmación enviada con éxito!')
    } catch (err) {
      console.error(err)
      toast.error('Hubo un error. Por favor intenta nuevamente.')
    } finally {
      setLoading(false)
    }
  }

  if (showEnvelope) {
    return (
      <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <EnvelopeAnimation onOpen={() => setShowEnvelope(false)} brideName={brideName} groomName={groomName} weddingDate={config.wedding_date} />
      </div>
    )
  }

  if (submitted) {
    return (
      <div
        className="text-center py-16 px-4"
        style={{ animation: 'fadeInUp 0.8s ease-out' }}
      >
        {/* Confetti */}
        {Array.from({ length: 20 }).map((_, i) => (
          <div key={i} style={{
            position: 'absolute',
            width: 10, height: 10,
            borderRadius: i % 2 === 0 ? '50%' : '0',
            background: ['var(--gold)', 'var(--rose)', 'var(--sage)', 'var(--gold-light)'][i % 4],
            left: `${5 + i * 5}%`,
            top: '0',
            animation: `confettiFall ${2 + (i % 3)}s ease-out ${i * 0.1}s both`,
            pointerEvents: 'none',
          }} />
        ))}

        <div className="animate-heartbeat mb-4">
          <span style={{ fontSize: '4rem' }}>🎊</span>
        </div>
        <h2
          className="font-display mb-4"
          style={{ fontSize: 'clamp(1.8rem, 4vw, 2.5rem)', color: 'var(--gold-dark)' }}
        >
          ¡Gracias, {familyName}!
        </h2>
        <p className="font-cormorant" style={{ fontSize: '1.2rem', color: 'var(--charcoal-muted)', fontStyle: 'italic', maxWidth: 500, margin: '0 auto 1.5rem' }}>
          Hemos recibido tu confirmación. ¡Estamos emocionados de celebrar este día especial contigo!
        </p>
        <div className="wedding-card p-6 max-w-xs mx-auto">
          <p className="font-inter text-sm" style={{ color: 'var(--charcoal-muted)' }}>
            Confirmados de tu familia
          </p>
          <p className="font-display text-3xl mt-1" style={{ color: 'var(--gold-dark)' }}>
            {totalAttending} persona{totalAttending !== 1 ? 's' : ''}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div style={{ animation: 'fadeInUp 0.8s ease-out', maxWidth: 640, margin: '0 auto' }}>
      {/* Header */}
      <div className="text-center mb-8">
        <span style={{ fontSize: '2rem' }}>💌</span>
        <h2 className="font-display mt-3" style={{ fontSize: '2rem', color: 'var(--charcoal)' }}>
          Confirma tu Asistencia
        </h2>
        <p className="font-cormorant mt-2" style={{ fontSize: '1.1rem', fontStyle: 'italic', color: 'var(--charcoal-muted)' }}>
          a la boda de {brideName} & {groomName}
        </p>
        <p className="font-inter mt-1 text-sm" style={{ color: 'var(--gold)' }}>
          {formatWeddingDate(config.wedding_date)} · {config.ceremony_time} hrs
        </p>
      </div>

      <div className="flex flex-col gap-5">
        {/* Family info */}
        <div className="wedding-card p-6">
          <h3 className="font-display mb-4" style={{ fontSize: '1.1rem', color: 'var(--charcoal)' }}>
            👨‍👩‍👧‍👦 Datos de tu Familia
          </h3>
          <div className="flex flex-col gap-3">
            <div>
              <label className="font-inter text-xs mb-1 block" style={{ letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--charcoal-muted)' }}>
                Nombre de familia / apellido *
              </label>
              <input
                type="text"
                value={familyName}
                onChange={e => setFamilyName(e.target.value)}
                placeholder="Ej: Familia González"
                className="w-full px-4 py-3 rounded-xl font-cormorant text-base"
                style={{ border: '1px solid var(--border)', outline: 'none', background: 'var(--cream)', color: 'var(--charcoal)', fontSize: '1rem' }}
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="font-inter text-xs mb-1 block" style={{ letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--charcoal-muted)' }}>
                  Teléfono
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  placeholder="+56 9 XXXX XXXX"
                  className="w-full px-4 py-3 rounded-xl font-cormorant text-base"
                  style={{ border: '1px solid var(--border)', outline: 'none', background: 'var(--cream)', color: 'var(--charcoal)', fontSize: '1rem' }}
                />
              </div>
              <div>
                <label className="font-inter text-xs mb-1 block" style={{ letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--charcoal-muted)' }}>
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="tu@email.com"
                  className="w-full px-4 py-3 rounded-xl font-cormorant text-base"
                  style={{ border: '1px solid var(--border)', outline: 'none', background: 'var(--cream)', color: 'var(--charcoal)', fontSize: '1rem' }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Members */}
        <div className="wedding-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display" style={{ fontSize: '1.1rem', color: 'var(--charcoal)' }}>
              👥 Integrantes que asistirán
            </h3>
            <span
              className="font-inter text-xs px-3 py-1 rounded-full"
              style={{ background: 'var(--rose-light)', color: 'var(--rose)' }}
            >
              {totalAttending} confirmado{totalAttending !== 1 ? 's' : ''}
            </span>
          </div>

          <div className="flex flex-col gap-3">
            {members.map((member, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="flex-1">
                  <input
                    type="text"
                    value={member.name}
                    onChange={e => updateMember(i, 'name', e.target.value)}
                    placeholder={`Nombre integrante ${i + 1}`}
                    className="w-full px-4 py-2.5 rounded-xl font-cormorant text-base"
                    style={{ border: '1px solid var(--border)', outline: 'none', background: 'var(--cream)', color: 'var(--charcoal)', fontSize: '1rem' }}
                  />
                </div>
                {/* Attending toggle */}
                <button
                  onClick={() => updateMember(i, 'attending', !member.attending)}
                  className="flex-shrink-0 w-24 py-2 rounded-xl font-inter text-xs transition-all"
                  style={{
                    background: member.attending ? 'var(--sage-light)' : 'var(--rose-light)',
                    color: member.attending ? 'var(--sage)' : 'var(--rose)',
                    border: 'none', cursor: 'pointer', fontWeight: 500,
                  }}
                >
                  {member.attending ? '✓ Asiste' : '✗ No asiste'}
                </button>
                {members.length > 1 && (
                  <button
                    onClick={() => removeMember(i)}
                    className="text-rose-300 hover:text-rose-500 transition-colors flex-shrink-0"
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
            ))}
          </div>

          {members.length < 10 && (
            <button
              onClick={addMember}
              className="mt-4 flex items-center gap-2 font-inter text-sm"
              style={{ color: 'var(--gold-dark)', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
            >
              <Plus size={16} /> Agregar integrante
            </button>
          )}

          <div className="mt-4">
            <label className="font-inter text-xs mb-1 block" style={{ letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--charcoal-muted)' }}>
              Restricciones alimentarias / alergias
            </label>
            <input
              type="text"
              value={dietary}
              onChange={e => setDietary(e.target.value)}
              placeholder="Ej: vegetariano, celíaco, alérgico a mariscos..."
              className="w-full px-4 py-3 rounded-xl font-cormorant text-base"
              style={{ border: '1px solid var(--border)', outline: 'none', background: 'var(--cream)', color: 'var(--charcoal)', fontSize: '1rem' }}
            />
          </div>
        </div>

        {/* Lluvia de Sobres */}
        <div
          className="wedding-card p-6"
          style={{ background: 'linear-gradient(135deg, white, var(--ivory))', border: '2px solid var(--gold-light)' }}
        >
          <div className="text-center mb-5">
            <span style={{ fontSize: '2.5rem' }}>💛</span>
            <h3 className="font-display mt-2" style={{ fontSize: '1.3rem', color: 'var(--gold-dark)' }}>
              Lluvia de Sobres
            </h3>
            <p className="font-cormorant mt-2" style={{ fontSize: '1.05rem', fontStyle: 'italic', color: 'var(--charcoal-muted)', lineHeight: 1.7 }}>
              En lugar de regalos físicos, hemos elegido recibir tu cariño a través de una contribución monetaria.
              El monto es completamente a tu elección, lo que más te nazca del corazón.
            </p>
          </div>

          {/* Bank info */}
          {config.account_number ? (
            <div
              className="rounded-xl p-5 mb-4"
              style={{ background: 'rgba(201,169,110,0.08)', border: '1px solid rgba(201,169,110,0.25)' }}
            >
              <p className="font-inter text-xs mb-3" style={{ letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--gold-dark)' }}>
                Datos de Transferencia
              </p>
              <div className="grid grid-cols-1 gap-2 text-sm font-inter" style={{ color: 'var(--charcoal)' }}>
                {config.bank_name && <div className="flex justify-between"><span style={{ color: 'var(--charcoal-muted)' }}>Banco</span><span className="font-medium">{config.bank_name}</span></div>}
                {config.account_type && <div className="flex justify-between"><span style={{ color: 'var(--charcoal-muted)' }}>Tipo</span><span className="font-medium">{config.account_type}</span></div>}
                {config.account_number && <div className="flex justify-between"><span style={{ color: 'var(--charcoal-muted)' }}>N° Cuenta</span><span className="font-medium">{config.account_number}</span></div>}
                {config.account_holder && <div className="flex justify-between"><span style={{ color: 'var(--charcoal-muted)' }}>Titular</span><span className="font-medium">{config.account_holder}</span></div>}
                {config.account_rut && <div className="flex justify-between"><span style={{ color: 'var(--charcoal-muted)' }}>RUT</span><span className="font-medium">{config.account_rut}</span></div>}
                {config.bank_email && <div className="flex justify-between"><span style={{ color: 'var(--charcoal-muted)' }}>Email</span><span className="font-medium">{config.bank_email}</span></div>}
              </div>
            </div>
          ) : (
            <div
              className="rounded-xl p-4 mb-4 text-center font-cormorant"
              style={{ background: 'rgba(201,169,110,0.06)', border: '1px dashed rgba(201,169,110,0.4)', color: 'var(--charcoal-muted)', fontStyle: 'italic' }}
            >
              Los datos de transferencia estarán disponibles pronto 💌
            </div>
          )}

          <label className="flex items-center gap-3 cursor-pointer">
            <div
              onClick={() => setWillContribute(!willContribute)}
              className="w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0 transition-all"
              style={{
                background: willContribute ? 'var(--gold)' : 'transparent',
                border: `2px solid ${willContribute ? 'var(--gold)' : 'var(--border)'}`,
              }}
            >
              {willContribute && <Check size={14} color="white" />}
            </div>
            <span className="font-cormorant" style={{ fontSize: '1rem', color: 'var(--charcoal-muted)', fontStyle: 'italic' }}>
              Me gustaría contribuir con la lluvia de sobres 💛
            </span>
          </label>

          {willContribute && (
            <div className="mt-3">
              <textarea
                value={envelopeMessage}
                onChange={e => setEnvelopeMessage(e.target.value)}
                placeholder="Un mensaje para los novios (opcional)..."
                rows={2}
                className="w-full px-4 py-3 rounded-xl font-cormorant text-base resize-none"
                style={{ border: '1px solid var(--border)', outline: 'none', background: 'var(--cream)', color: 'var(--charcoal)', fontSize: '1rem' }}
              />
            </div>
          )}
        </div>

        {/* Submit */}
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="btn-gold w-full flex items-center justify-center gap-3"
          style={{ fontSize: '1rem', padding: '1rem', opacity: loading ? 0.7 : 1 }}
        >
          {loading ? (
            <span className="animate-heartbeat">💌 Enviando...</span>
          ) : (
            <>
              <Send size={18} /> Confirmar Asistencia
            </>
          )}
        </button>

        <p className="text-center font-inter text-xs" style={{ color: 'var(--charcoal-muted)', marginTop: -8 }}>
          ¡Esperamos verte el 6 de Febrero de 2027! 🥂
        </p>
      </div>
    </div>
  )
}
