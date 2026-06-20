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
    supabase.from('wedding_config').select('*').single().then(({ data }) => { if (data) setConfig(data as WeddingConfig) })
    supabase.from('access_log').insert({ page: '/quienes-somos', user_agent: navigator.userAgent.slice(0, 200) }).then(() => {})
  }, [])

  return (
    <>
      <Navbar />
      <main>
        <section className="lux-hero starfield" style={{ minHeight: '58vh' }}>
          <span className="shooting-star" style={{ top: '20%', left: '78%' }} />
          <div className="section-head" style={{ color: '#fff', position: 'relative', zIndex: 2 }}>
            <p className="section-label" style={{ color: 'rgba(234,211,154,.84)' }}>Conócenos</p>
            <h1 className="section-title" style={{ color: '#fffaf1' }}>Quiénes somos</h1>
            <p className="section-copy" style={{ color: 'rgba(255,250,241,.74)' }}>Nuestra historia, nuestros sueños y la alegría de compartir este día.</p>
          </div>
        </section>
        <QuienesSomosSection config={config} />
      </main>
      <Footer config={config} />
    </>
  )
}
