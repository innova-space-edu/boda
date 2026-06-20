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
    supabase.from('wedding_config').select('*').single().then(({ data }) => {
      if (data) setConfig(data as WeddingConfig)
    })
    supabase.from('access_log').insert({
      page: '/confirmar',
      user_agent: navigator.userAgent.slice(0, 200),
    }).then(() => {})
  }, [])

  return (
    <>
      <Navbar />
      <main style={{ paddingTop: 72, minHeight: '100vh', background: 'var(--cream)' }}>
        {/* Page header */}
        <div
          style={{
            background: 'linear-gradient(160deg, #2C1810 0%, #3D2415 50%, #1F2D20 100%)',
            padding: '3rem 1rem',
            textAlign: 'center',
          }}
        >
          <p
            className="font-inter"
            style={{
              fontSize: '0.75rem', letterSpacing: '0.4em',
              textTransform: 'uppercase', color: 'rgba(201,169,110,0.7)',
              marginBottom: 8,
            }}
          >
            Con mucho amor
          </p>
          <h1
            className="font-display"
            style={{
              fontSize: 'clamp(2rem, 5vw, 3rem)',
              fontWeight: 400, color: '#F5EFE6',
            }}
          >
            Confirmar Invitación
          </h1>
          <p
            className="font-cormorant"
            style={{
              fontSize: '1.1rem', fontStyle: 'italic',
              color: 'rgba(232,213,163,0.7)', marginTop: 8,
            }}
          >
            Tienes una invitación esperándote 💌
          </p>
        </div>

        {/* Form section */}
        <div className="max-w-2xl mx-auto px-4 py-10" style={{ position: 'relative' }}>
          <RsvpForm config={config} />
        </div>
      </main>
      <Footer config={config} />
    </>
  )
}
