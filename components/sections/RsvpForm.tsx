'use client'
import { useState } from 'react'
import Link from 'next/link'
import { Heart, Plus, Send, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { supabase } from '@/lib/supabase'
import { formatWeddingDate } from '@/lib/wedding'
import type { RsvpMember, WeddingConfig } from '@/types'

interface RsvpFormProps { config: WeddingConfig }

function EnvelopeAnimation({ onOpen, brideName, groomName, weddingDate }: { onOpen: () => void; brideName: string; groomName: string; weddingDate: string }) {
  const [opening, setOpening] = useState(false)
  const handleOpen = () => {
    setOpening(true)
    setTimeout(onOpen, 1600)
  }

  return (
    <div className="envelope-stage">
      <div>
        <div className={`envelope-box ${opening ? 'open' : ''}`} onClick={handleOpen} role="button" tabIndex={0} onKeyDown={(e) => e.key === 'Enter' && handleOpen()}>
          <div className="envelope-letter">
            <p className="section-label" style={{ margin: 0, letterSpacing: '.22em' }}>Invitación</p>
            <h2 className="font-script" style={{ fontSize: '3rem', color: 'var(--lilac-dark)', margin: '.5rem 0 0' }}>{brideName} & {groomName}</h2>
            <p style={{ color: 'var(--gold-dark)', margin: '.6rem 0 0' }}>{formatWeddingDate(weddingDate)}</p>
            <div className="gold-divider" style={{ margin: '1rem auto' }}><Heart size={16} fill="var(--lilac-dark)" color="var(--lilac-dark)" /></div>
            <p style={{ color: 'var(--muted)', fontStyle: 'italic', margin: 0 }}>Gracias por acompañarnos en este momento tan especial.</p>
          </div>
          <div className="envelope-lid" />
          <div className="envelope-body" />
          <div className="envelope-seal"><Heart size={26} fill="currentColor" /></div>
        </div>
        <p style={{ color: 'rgba(255,250,241,.78)', textAlign: 'center', marginTop: 32, fontFamily: 'Cinzel', letterSpacing: '.18em', fontSize: '.75rem', textTransform: 'uppercase' }}>
          {opening ? 'Abriendo invitación...' : 'Haz clic para abrir el sobre'}
        </p>
        {!opening && <button className="btn-gold" onClick={handleOpen} style={{ margin: '18px auto 0', display: 'flex' }}>Abrir invitación</button>}
      </div>
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
  const [members, setMembers] = useState<RsvpMember[]>([{ name: '', attending: true }])
  const [willContribute, setWillContribute] = useState(false)
  const [envelopeMessage, setEnvelopeMessage] = useState('')

  const brideName = config.bride_name.split(' ')[0]
  const groomName = config.groom_name.split(' ')[0]

  const addMember = () => {
    if (members.length < 12) setMembers([...members, { name: '', attending: true }])
  }
  const removeMember = (index: number) => setMembers(members.filter((_, i) => i !== index))
  const updateMember = (index: number, field: keyof RsvpMember, value: string | boolean) => {
    const copy = [...members]
    copy[index] = { ...copy[index], [field]: value }
    setMembers(copy)
  }

  const totalAttending = members.filter(m => m.name.trim() && m.attending).length

  const handleSubmit = async () => {
    if (!familyName.trim()) { toast.error('Ingresa el nombre de tu familia o núcleo familiar.'); return }
    const validMembers = members.filter(m => m.name.trim())
    if (validMembers.length === 0) { toast.error('Agrega al menos un integrante.'); return }

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
      toast.error('Hubo un error al enviar. Intenta nuevamente.')
    } finally {
      setLoading(false)
    }
  }

  if (showEnvelope) {
    return <EnvelopeAnimation onOpen={() => setShowEnvelope(false)} brideName={brideName} groomName={groomName} weddingDate={config.wedding_date} />
  }

  if (submitted) {
    return (
      <div className="lux-card rsvp-card" style={{ textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        <img src="/images/wedding/bridal-bouquet.jpeg" alt="Flores de boda" style={{ width: 150, height: 150, objectFit: 'cover', borderRadius: '999px', margin: '0 auto 18px', border: '6px solid rgba(200,167,232,.25)' }} />
        <h2 className="rsvp-title">¡Gracias!</h2>
        <p className="section-copy" style={{ maxWidth: 600, margin: '0 auto 1.5rem' }}>
          Tu confirmación fue enviada. Nos alegra compartir este momento contigo.
        </p>
        <Link className="btn-gold" href="/">Volver al portal</Link>
      </div>
    )
  }

  return (
    <div className="lux-card rsvp-card">
      <div style={{ textAlign: 'center', marginBottom: 28 }}>
        <p className="section-label">Confirmación</p>
        <h2 className="rsvp-title">¿Vendrás?</h2>
        <p className="section-copy" style={{ maxWidth: 620, margin: '0 auto' }}>
          Indícanos quiénes asistirán de tu núcleo familiar para preparar todo con cariño.
        </p>
      </div>

      <div className="form-grid">
        <div>
          <label className="field-label">Nombre de familia o núcleo familiar</label>
          <input className="input-lux" value={familyName} onChange={e => setFamilyName(e.target.value)} placeholder="Ej: Familia Morales Vega" />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
          <div>
            <label className="field-label">Teléfono de contacto</label>
            <input className="input-lux" value={phone} onChange={e => setPhone(e.target.value)} placeholder="Ej: 9 1234 5678" />
          </div>
          <div>
            <label className="field-label">Correo electrónico opcional</label>
            <input className="input-lux" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="correo@ejemplo.cl" />
          </div>
        </div>

        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'center', marginBottom: 10 }}>
            <label className="field-label" style={{ margin: 0 }}>Integrantes del núcleo familiar</label>
            <button type="button" className="btn-ghost" onClick={addMember} style={{ padding: '.55rem .9rem', fontSize: '.72rem' }}><Plus size={14} /> Agregar</button>
          </div>
          <div style={{ display: 'grid', gap: 12 }}>
            {members.map((member, i) => (
              <div className="member-row" key={i}>
                <input className="input-lux" value={member.name} onChange={e => updateMember(i, 'name', e.target.value)} placeholder={`Nombre integrante ${i + 1}`} />
                <label className="switch-pill">
                  <input type="checkbox" checked={member.attending} onChange={e => updateMember(i, 'attending', e.target.checked)} />
                  Asiste
                </label>
                {members.length > 1 && <button type="button" className="btn-ghost" onClick={() => removeMember(i)} style={{ padding: '.65rem .8rem' }} aria-label="Eliminar integrante"><Trash2 size={16} /></button>}
              </div>
            ))}
          </div>
          <p style={{ color: 'var(--gold-dark)', margin: '12px 0 0', fontFamily: 'Inter', fontSize: '.86rem' }}>Total confirmados: <strong>{totalAttending}</strong></p>
        </div>

        <div>
          <label className="field-label">Alergias, dieta especial u observaciones</label>
          <textarea className="textarea-lux" value={dietary} onChange={e => setDietary(e.target.value)} placeholder="Ej: vegetariano, alergia, adulto mayor, silla de ruedas, etc." />
        </div>

        <div className="envelope-note">
          <h3 className="font-display" style={{ margin: '0 0 .5rem', fontSize: '1.45rem' }}>💛 Lluvia de sobres</h3>
          <p style={{ color: 'var(--muted)', lineHeight: 1.65, margin: 0 }}>
            Nuestro mejor regalo será contar con tu presencia. Si deseas regalarnos algo, agradeceremos una contribución monetaria voluntaria en nuestra lluvia de sobres. El monto es completamente libre.
          </p>
          {(config.bank_name || config.account_number || config.account_holder) && (
            <div className="bank-grid">
              {config.bank_name && <div className="bank-item"><small>Banco</small><strong>{config.bank_name}</strong></div>}
              {config.account_type && <div className="bank-item"><small>Tipo de cuenta</small><strong>{config.account_type}</strong></div>}
              {config.account_number && <div className="bank-item"><small>Número</small><strong>{config.account_number}</strong></div>}
              {config.account_holder && <div className="bank-item"><small>Titular</small><strong>{config.account_holder}</strong></div>}
              {config.account_rut && <div className="bank-item"><small>RUT</small><strong>{config.account_rut}</strong></div>}
              {config.bank_email && <div className="bank-item"><small>Email</small><strong>{config.bank_email}</strong></div>}
            </div>
          )}
          <label className="switch-pill" style={{ marginTop: 16 }}>
            <input type="checkbox" checked={willContribute} onChange={e => setWillContribute(e.target.checked)} />
            Quiero considerar lluvia de sobres
          </label>
        </div>

        <div>
          <label className="field-label">Mensaje para los novios opcional</label>
          <textarea className="textarea-lux" value={envelopeMessage} onChange={e => setEnvelopeMessage(e.target.value)} placeholder="Escribe un mensaje corto para Carolina y Esthefano..." />
        </div>

        <button type="button" className="btn-gold" onClick={handleSubmit} disabled={loading}>
          <Send size={17} /> {loading ? 'Enviando...' : 'Enviar confirmación'}
        </button>
      </div>
    </div>
  )
}
