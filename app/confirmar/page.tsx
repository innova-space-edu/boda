'use client'
import { useEffect, useState } from 'react'
import Navbar from '@/components/sections/Navbar'
import RsvpForm from '@/components/sections/RsvpForm'
import Footer from '@/components/sections/Footer'
import { DEFAULT_CONFIG } from '@/lib/wedding'
import { supabase } from '@/lib/supabase'
import type { WeddingConfig } from '@/types'

export default function ConfirmarPage() {
  const [config, setConfig] = useState<WeddingConfig>(DEFAULT_CONFIG)

  useEffect(() => {
    supabase.from('wedding_config').select('*').single().then(({ data }) => { if (data) setConfig(data as WeddingConfig) })
    supabase.from('access_log').insert({ page: '/confirmar', user_agent: navigator.userAgent.slice(0, 200) }).then(() => {})
  }, [])

  return (
    <>
      <Navbar />
      <main className="rsvp-page starfield">
        <span className="shooting-star" style={{ top: '16%', left: '84%' }} />
        <span className="shooting-star s2" />
        <div className="rsvp-container">
          <div className="section-head" style={{ color: '#fff', marginBottom: 20 }}>
            <p className="section-label" style={{ color: 'rgba(234,211,154,.84)' }}>Con mucho amor</p>
            <h1 className="section-title" style={{ color: '#fffaf1' }}>Confirmar invitación</h1>
            <p className="section-copy" style={{ color: 'rgba(255,250,241,.76)' }}>Tienes una carta especial esperando por ti.</p>
          </div>
          <RsvpForm config={config} />
        </div>
      </main>
      <Footer config={config} />
    </>
  )
}
