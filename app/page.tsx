'use client'
import { useState, useEffect } from 'react'
import IntroScreen from '@/components/animations/IntroScreen'
import Navbar from '@/components/sections/Navbar'
import HeroSection from '@/components/sections/HeroSection'
import InfoSection from '@/components/sections/InfoSection'
import QuienesSomosSection from '@/components/sections/QuienesSomosSection'
import Footer from '@/components/sections/Footer'
import { DEFAULT_CONFIG } from '@/lib/wedding'
import { supabase } from '@/lib/supabase'
import type { WeddingConfig } from '@/types'

export default function HomePage() {
  const [showIntro, setShowIntro] = useState(() => {
    if (typeof window === 'undefined') return true
    return !sessionStorage.getItem('intro_seen')
  })
  const [config, setConfig] = useState<WeddingConfig>(DEFAULT_CONFIG)

  useEffect(() => {
    // Load config
    supabase.from('wedding_config').select('*').single().then(({ data }) => {
      if (data) setConfig(data as WeddingConfig)
    })

    // Log access
    supabase.from('access_log').insert({
      page: '/',
      user_agent: navigator.userAgent.slice(0, 200),
    }).then(() => {})
  }, [])

  const handleIntroComplete = () => {
    sessionStorage.setItem('intro_seen', '1')
    setShowIntro(false)
  }

  return (
    <>
      {showIntro && <IntroScreen onComplete={handleIntroComplete} />}
      <div style={{ opacity: showIntro ? 0 : 1, transition: 'opacity 0.5s ease' }}>
        <Navbar />
        <main>
          <HeroSection config={config} />
          <InfoSection config={config} />
          <QuienesSomosSection config={config} />
        </main>
        <Footer config={config} />
      </div>
    </>
  )
}
