'use client'
import { useEffect, useState } from 'react'
import RsvpForm from '@/components/sections/RsvpForm'
import { DEFAULT_CONFIG, formatWeddingDate } from '@/lib/wedding'
import { supabase } from '@/lib/supabase'
import type { WeddingConfig } from '@/types'

export default function InvitePage() {
  const [config, setConfig] = useState<WeddingConfig>(DEFAULT_CONFIG)

  useEffect(() => {
    supabase.from('wedding_config').select('*').single().then(({ data }) => { if (data) setConfig(data as WeddingConfig) })
    supabase.from('access_log').insert({ page: '/invite', user_agent: navigator.userAgent.slice(0, 200) }).then(() => {})
  }, [])

  const brideName = config.bride_name.split(' ')[0]
  const groomName = config.groom_name.split(' ')[0]

  return (
    <main className="rsvp-page starfield">
      <span className="shooting-star" style={{ top: '16%', left: '84%' }} />
      <span className="shooting-star s2" />
      <div className="rsvp-container">
        <div className="section-head" style={{ color: '#fff', marginBottom: 20 }}>
          <p className="section-label" style={{ color: 'rgba(234,211,154,.84)' }}>Invitación privada</p>
          <h1 className="section-title" style={{ color: '#fffaf1' }}>{brideName} & {groomName}</h1>
          <p className="section-copy" style={{ color: 'rgba(255,250,241,.76)' }}>{formatWeddingDate(config.wedding_date)} · {config.venue_name}</p>
        </div>
        <RsvpForm config={config} />
      </div>
    </main>
  )
}
