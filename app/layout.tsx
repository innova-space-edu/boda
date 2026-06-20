import type { Metadata } from 'next'
import './globals.css'
import { Toaster } from '@/components/ui/sonner'

export const metadata: Metadata = {
  title: 'Carolina & Esthefano — 6 Febrero 2027',
  description: 'Portal de invitación y confirmación para la boda de Carolina y Esthefano',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>
        {children}
        <Toaster position="top-center" richColors />
      </body>
    </html>
  )
}
