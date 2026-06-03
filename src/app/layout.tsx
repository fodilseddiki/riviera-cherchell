// app/layout.tsx
import type { Metadata } from 'next'
import { Playfair_Display, DM_Sans } from 'next/font/google'
import { Toaster } from 'react-hot-toast'
import './globals.css'

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
})

const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-body',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Riviera Cherchell — Gestion immobilière',
  description: 'Tableau de bord de vente et suivi de construction — Résidence Riviera Cherchell',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className={`${playfair.variable} ${dmSans.variable}`}>
      <body className="font-body bg-sand-50 text-rc-900 antialiased">
        <Toaster
          position="top-right"
          toastOptions={{
            style: { fontFamily: 'var(--font-body)', fontSize: '14px', borderRadius: '8px' },
            success: { iconTheme: { primary: '#1D9E75', secondary: '#fff' } },
          }}
        />
        {children}
      </body>
    </html>
  )
}
