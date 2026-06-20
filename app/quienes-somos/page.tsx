'use client'
import { useEffect, useState } from 'react'
import Navbar from '@/components/sections/Navbar'
import QuienesSomosSection from '@/components/sections/QuienesSomosSection'
import Footer from '@/components/sections/Footer'
import { DEFAULT_CONFIG } from '@/lib/wedding'
import { supabase } from '@/lib/supabase'
import type { WeddingConfig } from '@/types'

export default function QuienesSomosPage() {
  const [config, setConfig] = useState<WeddingConfig>(DEFAULT_CONFIG)

  useEffect(() => {
    supabase.from('wedding_config').select('*').single().then(({ data }) => {
      if (data) setConfig(data as WeddingConfig)
    })
    supabase.from('access_log').insert({
      page: '/quienes-somos',
      user_agent: navigator.userAgent.slice(0, 200),
    }).then(() => {})
  }, [])

  return (
    <>
      <Navbar />
      <main style={{ paddingTop: 72 }}>
        <div
          style={{
            background: 'linear-gradient(135deg, var(--rose-light), var(--cream))',
            padding: '4rem 1rem 2rem',
            textAlign: 'center',
          }}
        >
          <p
            className="font-inter"
            style={{
              fontSize: '0.75rem', letterSpacing: '0.35em',
              textTransform: 'uppercase', color: 'var(--rose)', marginBottom: 8,
            }}
          >
            Conócenos
          </p>
          <h1
            className="font-display"
            style={{
              fontSize: 'clamp(2.5rem, 5vw, 3.5rem)',
              fontWeight: 400, color: 'var(--charcoal)',
            }}
          >
            Quiénes Somos
          </h1>
        </div>
        <QuienesSomosSection config={config} />
      </main>
      <Footer config={config} />
    </>
  )
}
