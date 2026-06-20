'use client'
import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { DEFAULT_CONFIG, updateWeddingConfig } from '@/lib/wedding'
import { toast } from 'sonner'
import type { WeddingConfig, RsvpResponse, AccessLog } from '@/types'
import {
  Users, Eye, Settings, Link2, LogOut, Copy,
  Check, Download, Trash2, RefreshCw, Heart,
  TrendingUp, Save, ChevronDown, ChevronUp,
} from 'lucide-react'

type Tab = 'overview' | 'responses' | 'access' | 'settings'

function StatCard({ icon, label, value, color }: { icon: React.ReactNode, label: string, value: string | number, color: string }) {
  return (
    <div className="wedding-card p-5 flex items-center gap-4">
      <div style={{ width: 48, height: 48, borderRadius: 12, background: color, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', flexShrink: 0 }}>
        {icon}
      </div>
      <div>
        <p className="font-inter text-xs" style={{ color: 'var(--charcoal-muted)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>{label}</p>
        <p className="font-display text-2xl mt-0.5" style={{ color: 'var(--charcoal)' }}>{value}</p>
      </div>
    </div>
  )
}

function SettingField({ label, value, onChange, type = 'text', placeholder = '' }: {
  label: string, value: string, onChange: (v: string) => void,
  type?: string, placeholder?: string
}) {
  return (
    <div>
      <label className="font-inter text-xs mb-1 block" style={{ letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--charcoal-muted)' }}>
        {label}
      </label>
      {type === 'textarea' ? (
        <textarea
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          rows={3}
          className="w-full px-4 py-3 rounded-xl font-cormorant text-base resize-none"
          style={{ border: '1px solid var(--border)', outline: 'none', background: 'var(--cream)', color: 'var(--charcoal)', fontSize: '1rem' }}
        />
      ) : (
        <input
          type={type}
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full px-4 py-3 rounded-xl font-inter text-sm"
          style={{ border: '1px solid var(--border)', outline: 'none', background: 'var(--cream)', color: 'var(--charcoal)' }}
        />
      )}
    </div>
  )
}

export default function AdminDashboard() {
  const [tab, setTab] = useState<Tab>('overview')
  const [config, setConfig] = useState<WeddingConfig>(DEFAULT_CONFIG)
  const [responses, setResponses] = useState<RsvpResponse[]>([])
  const [accessLog, setAccessLog] = useState<AccessLog[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [copied, setCopied] = useState(false)
  const [expandedResponse, setExpandedResponse] = useState<string | null>(null)
  const router = useRouter()

  const inviteLink = typeof window !== 'undefined'
    ? `${window.location.origin}/invite`
    : '/invite'

  const loadData = useCallback(async () => {
    setLoading(true)
    const [configRes, rsvpRes, logRes] = await Promise.all([
      supabase.from('wedding_config').select('*').single(),
      supabase.from('rsvp_responses').select('*').order('created_at', { ascending: false }),
      supabase.from('access_log').select('*').order('created_at', { ascending: false }).limit(100),
    ])
    if (configRes.data) setConfig(configRes.data as WeddingConfig)
    if (rsvpRes.data) setResponses(rsvpRes.data as RsvpResponse[])
    if (logRes.data) setAccessLog(logRes.data as AccessLog[])
    setLoading(false)
  }, [])

  useEffect(() => {
    let isMounted = true

    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!isMounted) return
      const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL
      if (!session) { router.push('/admin/login'); return }
      if (adminEmail && session.user.email !== adminEmail) {
        await supabase.auth.signOut()
        toast.error('Este usuario no tiene permiso de administrador.')
        router.push('/admin/login')
        return
      }
      await loadData()
    }

    checkAuth()

    return () => {
      isMounted = false
    }
  }, [loadData, router])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  const handleSaveConfig = async () => {
    setSaving(true)
    const { error } = await updateWeddingConfig(config)
    if (error) { toast.error('Error al guardar'); } else { toast.success('¡Cambios guardados!') }
    setSaving(false)
  }

  const copyLink = () => {
    navigator.clipboard.writeText(inviteLink)
    setCopied(true)
    toast.success('¡Link copiado!')
    setTimeout(() => setCopied(false), 2000)
  }

  const deleteResponse = async (id: string) => {
    if (!confirm('¿Eliminar esta respuesta?')) return
    await supabase.from('rsvp_responses').delete().eq('id', id)
    setResponses(prev => prev.filter(r => r.id !== id))
    toast.success('Respuesta eliminada')
  }

  const exportCSV = () => {
    const rows = [
      ['Familia', 'Teléfono', 'Email', 'Integrantes', 'Confirmados', 'Alergias', 'Contribuye', 'Fecha'],
      ...responses.map(r => [
        r.family_name,
        r.phone,
        r.email,
        r.members.map(m => m.name).join(' | '),
        r.total_attending,
        r.dietary_notes,
        r.will_contribute ? 'Sí' : 'No',
        new Date(r.created_at).toLocaleString('es-CL'),
      ])
    ]
    const escapeCsv = (value: string | number | boolean) => `"${String(value ?? '').replaceAll('\"', '\"\"')}"`
    const csv = rows.map(row => row.map(value => escapeCsv(value)).join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a'); a.href = url
    a.download = 'confirmaciones_boda.csv'; a.click()
    URL.revokeObjectURL(url)
  }

  const totalAttending = responses.reduce((sum, r) => sum + r.total_attending, 0)
  const totalFamilies = responses.length
  const willContribute = responses.filter(r => r.will_contribute).length

  const tabs: { id: Tab, label: string, icon: React.ReactNode }[] = [
    { id: 'overview', label: 'Resumen', icon: <TrendingUp size={16} /> },
    { id: 'responses', label: `Respuestas (${totalFamilies})`, icon: <Users size={16} /> },
    { id: 'access', label: 'Accesos', icon: <Eye size={16} /> },
    { id: 'settings', label: 'Configuración', icon: <Settings size={16} /> },
  ]

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--cream)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="text-center">
          <div className="animate-heartbeat"><Heart size={40} fill="var(--rose)" color="var(--rose)" style={{ margin: '0 auto' }} /></div>
          <p className="font-cormorant mt-3" style={{ color: 'var(--charcoal-muted)', fontStyle: 'italic' }}>Cargando panel...</p>
        </div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--cream)' }}>
      {/* Admin navbar */}
      <header className="navbar-glass sticky top-0 z-50 px-4 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Heart size={16} fill="var(--rose)" color="var(--rose)" />
            <span className="font-display" style={{ fontSize: '1.1rem', color: 'var(--gold-dark)' }}>
              Panel Admin
            </span>
            <span className="font-inter text-xs ml-2 px-2 py-0.5 rounded-full" style={{ background: 'var(--rose-light)', color: 'var(--rose)' }}>
              C & E 2027
            </span>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={loadData} className="p-2 rounded-lg transition-colors" style={{ color: 'var(--charcoal-muted)' }} title="Actualizar">
              <RefreshCw size={16} />
            </button>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 font-inter text-sm px-3 py-2 rounded-lg transition-all"
              style={{ color: 'var(--charcoal-muted)', background: 'rgba(44,44,44,0.05)' }}
            >
              <LogOut size={15} /> Salir
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Share link banner */}
        <div
          className="wedding-card p-4 mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
          style={{ background: 'linear-gradient(135deg, var(--ivory), white)', borderLeft: '4px solid var(--gold)' }}
        >
          <div className="flex items-center gap-3">
            <Link2 size={18} style={{ color: 'var(--gold-dark)', flexShrink: 0 }} />
            <div>
              <p className="font-inter text-xs" style={{ color: 'var(--charcoal-muted)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                Link de Encuesta (compartir con invitados)
              </p>
              <p className="font-inter text-sm mt-0.5" style={{ color: 'var(--gold-dark)', wordBreak: 'break-all' }}>
                {inviteLink}
              </p>
            </div>
          </div>
          <button onClick={copyLink} className="btn-gold flex-shrink-0 flex items-center gap-2" style={{ padding: '0.5rem 1.25rem' }}>
            {copied ? <><Check size={14} /> Copiado</> : <><Copy size={14} /> Copiar Link</>}
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 flex-wrap">
          {tabs.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className="flex items-center gap-2 font-inter text-sm px-4 py-2.5 rounded-xl transition-all"
              style={{
                background: tab === t.id ? 'var(--charcoal)' : 'white',
                color: tab === t.id ? 'white' : 'var(--charcoal-muted)',
                border: `1px solid ${tab === t.id ? 'var(--charcoal)' : 'var(--border)'}`,
                fontWeight: tab === t.id ? 500 : 400,
              }}
            >
              {t.icon} {t.label}
            </button>
          ))}
        </div>

        {/* Tab: Overview */}
        {tab === 'overview' && (
          <div style={{ animation: 'fadeInUp 0.5s ease-out' }}>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <StatCard icon={<Users size={22} />} label="Familias" value={totalFamilies} color="linear-gradient(135deg, var(--gold), var(--gold-dark))" />
              <StatCard icon={<Check size={22} />} label="Total Confirmados" value={totalAttending} color="linear-gradient(135deg, var(--sage), #5a7d67)" />
              <StatCard icon={<Heart size={22} />} label="Lluvia de Sobres" value={willContribute} color="linear-gradient(135deg, var(--rose), #9A4A65)" />
              <StatCard icon={<Eye size={22} />} label="Visitas al Portal" value={accessLog.length} color="linear-gradient(135deg, #6B7FD7, #4A5FC4)" />
            </div>

            {/* Recent responses */}
            <h2 className="font-display mb-4" style={{ fontSize: '1.3rem', color: 'var(--charcoal)' }}>
              Últimas Confirmaciones
            </h2>
            <div className="flex flex-col gap-3">
              {responses.slice(0, 5).map(r => (
                <div key={r.id} className="wedding-card p-4 flex items-center justify-between">
                  <div>
                    <p className="font-display" style={{ fontSize: '1rem', color: 'var(--charcoal)' }}>{r.family_name}</p>
                    <p className="font-inter text-xs mt-0.5" style={{ color: 'var(--charcoal-muted)' }}>
                      {r.total_attending} confirmado{r.total_attending !== 1 ? 's' : ''} · {new Date(r.created_at).toLocaleString('es-CL', { dateStyle: 'medium', timeStyle: 'short' })}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {r.will_contribute && <span className="text-sm">💛</span>}
                    <span className="font-inter text-xs px-2 py-1 rounded-full" style={{ background: 'var(--sage-light)', color: 'var(--sage)', fontWeight: 500 }}>
                      {r.total_attending} persona{r.total_attending !== 1 ? 's' : ''}
                    </span>
                  </div>
                </div>
              ))}
              {responses.length === 0 && (
                <div className="wedding-card p-8 text-center">
                  <p className="font-cormorant text-lg" style={{ color: 'var(--charcoal-muted)', fontStyle: 'italic' }}>
                    Aún no hay confirmaciones 💌
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab: Responses */}
        {tab === 'responses' && (
          <div style={{ animation: 'fadeInUp 0.5s ease-out' }}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display" style={{ fontSize: '1.3rem', color: 'var(--charcoal)' }}>
                Todas las Confirmaciones
              </h2>
              {responses.length > 0 && (
                <button onClick={exportCSV} className="flex items-center gap-2 font-inter text-sm btn-gold" style={{ padding: '0.5rem 1rem' }}>
                  <Download size={15} /> Exportar CSV
                </button>
              )}
            </div>
            <div className="flex flex-col gap-3">
              {responses.map(r => (
                <div key={r.id} className="wedding-card overflow-hidden">
                  <div
                    className="p-4 flex items-center justify-between cursor-pointer"
                    onClick={() => setExpandedResponse(expandedResponse === r.id ? null : r.id)}
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--rose-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <span className="font-display" style={{ fontSize: '1rem', color: 'var(--rose)' }}>
                          {r.family_name[0]}
                        </span>
                      </div>
                      <div className="min-w-0">
                        <p className="font-display" style={{ fontSize: '1rem', color: 'var(--charcoal)' }}>{r.family_name}</p>
                        <p className="font-inter text-xs" style={{ color: 'var(--charcoal-muted)' }}>
                          {new Date(r.created_at).toLocaleString('es-CL', { dateStyle: 'medium', timeStyle: 'short' })}
                          {r.phone && ` · ${r.phone}`}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {r.will_contribute && <span title="Lluvia de sobres">💛</span>}
                      <span className="font-inter text-xs px-2 py-1 rounded-full" style={{ background: 'var(--sage-light)', color: 'var(--sage)', fontWeight: 500 }}>
                        {r.total_attending}✓
                      </span>
                      {expandedResponse === r.id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </div>
                  </div>

                  {expandedResponse === r.id && (
                    <div style={{ borderTop: '1px solid var(--border)', padding: '1rem 1.25rem', background: 'var(--ivory)' }}>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                        <div>
                          <p className="font-inter text-xs mb-1" style={{ letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--charcoal-muted)' }}>Integrantes</p>
                          <div className="flex flex-col gap-1">
                            {r.members.map((m, i) => (
                              <div key={i} className="flex items-center gap-2">
                                <span style={{ fontSize: '0.75rem', color: m.attending ? 'var(--sage)' : 'var(--rose)' }}>
                                  {m.attending ? '✓' : '✗'}
                                </span>
                                <span className="font-cormorant" style={{ fontSize: '1rem', color: 'var(--charcoal)' }}>{m.name}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                        <div className="flex flex-col gap-2">
                          {r.email && <p className="font-inter text-sm" style={{ color: 'var(--charcoal-muted)' }}>📧 {r.email}</p>}
                          {r.dietary_notes && <p className="font-inter text-sm" style={{ color: 'var(--charcoal-muted)' }}>🥗 {r.dietary_notes}</p>}
                          {r.envelope_message && <p className="font-cormorant text-sm italic" style={{ color: 'var(--charcoal-muted)' }}>💌 &quot;{r.envelope_message}&quot;</p>}
                        </div>
                      </div>
                      <div className="flex justify-end">
                        <button
                          onClick={() => deleteResponse(r.id)}
                          className="flex items-center gap-1.5 font-inter text-xs px-3 py-1.5 rounded-lg transition-colors"
                          style={{ color: 'var(--rose)', background: 'var(--rose-light)', border: 'none', cursor: 'pointer' }}
                        >
                          <Trash2 size={13} /> Eliminar
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
              {responses.length === 0 && (
                <div className="wedding-card p-10 text-center">
                  <p className="font-cormorant text-xl" style={{ color: 'var(--charcoal-muted)', fontStyle: 'italic' }}>
                    Aún no hay confirmaciones 💌
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab: Access Log */}
        {tab === 'access' && (
          <div style={{ animation: 'fadeInUp 0.5s ease-out' }}>
            <h2 className="font-display mb-4" style={{ fontSize: '1.3rem', color: 'var(--charcoal)' }}>
              Registro de Accesos
            </h2>
            <div className="wedding-card overflow-hidden">
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--border)', background: 'var(--ivory)' }}>
                      {['Página', 'Fecha y Hora', 'Dispositivo'].map(h => (
                        <th key={h} className="font-inter text-xs text-left px-4 py-3" style={{ letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--charcoal-muted)' }}>
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {accessLog.map((log, i) => (
                      <tr key={log.id} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'white' : 'var(--ivory)' }}>
                        <td className="px-4 py-3">
                          <span className="font-inter text-sm px-2 py-0.5 rounded-full" style={{ background: 'var(--sage-light)', color: 'var(--sage)', fontSize: '0.75rem' }}>
                            {log.page}
                          </span>
                        </td>
                        <td className="px-4 py-3 font-inter text-xs" style={{ color: 'var(--charcoal-muted)' }}>
                          {new Date(log.created_at).toLocaleString('es-CL')}
                        </td>
                        <td className="px-4 py-3 font-inter text-xs" style={{ color: 'var(--charcoal-muted)', maxWidth: 250, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {log.user_agent?.slice(0, 60)}...
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {accessLog.length === 0 && (
                  <p className="font-cormorant text-center py-8" style={{ color: 'var(--charcoal-muted)', fontStyle: 'italic' }}>
                    Sin accesos registrados aún
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Tab: Settings */}
        {tab === 'settings' && (
          <div style={{ animation: 'fadeInUp 0.5s ease-out' }}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-display" style={{ fontSize: '1.3rem', color: 'var(--charcoal)' }}>
                Configuración del Portal
              </h2>
              <button
                onClick={handleSaveConfig}
                disabled={saving}
                className="btn-gold flex items-center gap-2"
                style={{ padding: '0.6rem 1.5rem', opacity: saving ? 0.7 : 1 }}
              >
                <Save size={16} /> {saving ? 'Guardando...' : 'Guardar Cambios'}
              </button>
            </div>

            <div className="grid grid-cols-1 gap-6">
              {/* General */}
              <div className="wedding-card p-6">
                <h3 className="font-display mb-4" style={{ fontSize: '1.1rem', color: 'var(--charcoal)' }}>
                  💍 Datos Generales
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <SettingField label="Nombre de la Novia" value={config.bride_name} onChange={v => setConfig(c => ({ ...c, bride_name: v }))} />
                  <SettingField label="Nombre del Novio" value={config.groom_name} onChange={v => setConfig(c => ({ ...c, groom_name: v }))} />
                  <SettingField label="Fecha de Boda" value={config.wedding_date} type="date" onChange={v => setConfig(c => ({ ...c, wedding_date: v }))} />
                  <SettingField label="Hora Ceremonia" value={config.ceremony_time} placeholder="18:00" onChange={v => setConfig(c => ({ ...c, ceremony_time: v }))} />
                  <SettingField label="Lugar / Recinto" value={config.venue_name} onChange={v => setConfig(c => ({ ...c, venue_name: v }))} />
                  <SettingField label="Dirección" value={config.venue_address} onChange={v => setConfig(c => ({ ...c, venue_address: v }))} />
                  <SettingField label="Ciudad" value={config.city} onChange={v => setConfig(c => ({ ...c, city: v }))} />
                  <SettingField label="Código de Vestimenta" value={config.dress_code} placeholder="Formal / Semiformal" onChange={v => setConfig(c => ({ ...c, dress_code: v }))} />
                </div>
                <div className="mt-4">
                  <SettingField label="Mensaje Principal (Hero)" value={config.hero_message} type="textarea" onChange={v => setConfig(c => ({ ...c, hero_message: v }))} />
                </div>
              </div>

              {/* Bios */}
              <div className="wedding-card p-6">
                <h3 className="font-display mb-4" style={{ fontSize: '1.1rem', color: 'var(--charcoal)' }}>
                  💕 Quiénes Somos
                </h3>
                <div className="flex flex-col gap-4">
                  <SettingField label="Nuestra Historia (texto principal)" value={config.love_story} type="textarea" onChange={v => setConfig(c => ({ ...c, love_story: v }))} />
                  <SettingField label="Biografía de la Novia" value={config.bride_bio} type="textarea" onChange={v => setConfig(c => ({ ...c, bride_bio: v }))} />
                  <SettingField label="Biografía del Novio" value={config.groom_bio} type="textarea" onChange={v => setConfig(c => ({ ...c, groom_bio: v }))} />
                </div>
              </div>

              {/* Images */}
              <div className="wedding-card p-6">
                <h3 className="font-display mb-4" style={{ fontSize: '1.1rem', color: 'var(--charcoal)' }}>
                  🖼️ Imágenes del Portal
                </h3>
                <p className="font-cormorant mb-4 text-sm italic" style={{ color: 'var(--charcoal-muted)' }}>
                  Pega enlaces públicos de imágenes. Puedes usar Supabase Storage, Google Drive con enlace directo o una URL de imagen.
                </p>
                <div className="grid grid-cols-1 gap-4">
                  <SettingField label="Imagen principal / portada" value={config.hero_image_url} placeholder="https://..." onChange={v => setConfig(c => ({ ...c, hero_image_url: v }))} />
                  <SettingField label="Foto de la Novia" value={config.bride_image_url} placeholder="https://..." onChange={v => setConfig(c => ({ ...c, bride_image_url: v }))} />
                  <SettingField label="Foto del Novio" value={config.groom_image_url} placeholder="https://..." onChange={v => setConfig(c => ({ ...c, groom_image_url: v }))} />
                </div>
              </div>

              {/* Bank / Lluvia de Sobres */}
              <div className="wedding-card p-6" style={{ border: '2px solid var(--gold-light)' }}>
                <h3 className="font-display mb-1" style={{ fontSize: '1.1rem', color: 'var(--charcoal)' }}>
                  💛 Lluvia de Sobres — Datos Bancarios
                </h3>
                <p className="font-cormorant mb-4 text-sm italic" style={{ color: 'var(--charcoal-muted)' }}>
                  Estos datos aparecerán en el formulario de confirmación de invitados.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <SettingField label="Banco" value={config.bank_name} placeholder="Ej: Banco Estado" onChange={v => setConfig(c => ({ ...c, bank_name: v }))} />
                  <SettingField label="Tipo de Cuenta" value={config.account_type} placeholder="Ej: Cuenta Vista" onChange={v => setConfig(c => ({ ...c, account_type: v }))} />
                  <SettingField label="Número de Cuenta" value={config.account_number} placeholder="Ej: 123-456-789" onChange={v => setConfig(c => ({ ...c, account_number: v }))} />
                  <SettingField label="Nombre del Titular" value={config.account_holder} placeholder="Nombre completo" onChange={v => setConfig(c => ({ ...c, account_holder: v }))} />
                  <SettingField label="RUT del Titular" value={config.account_rut} placeholder="Ej: 12.345.678-9" onChange={v => setConfig(c => ({ ...c, account_rut: v }))} />
                  <SettingField label="Email para transferencia" value={config.bank_email} placeholder="email@banco.cl" type="email" onChange={v => setConfig(c => ({ ...c, bank_email: v }))} />
                </div>
              </div>
            </div>

            <div className="flex justify-end mt-6">
              <button
                onClick={handleSaveConfig}
                disabled={saving}
                className="btn-gold flex items-center gap-2"
                style={{ opacity: saving ? 0.7 : 1, padding: '0.875rem 2rem' }}
              >
                <Save size={16} /> {saving ? 'Guardando...' : 'Guardar Todos los Cambios'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
