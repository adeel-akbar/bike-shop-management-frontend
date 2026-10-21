import type { Metadata, Viewport } from 'next'
import type { ReactNode } from 'react'
import '../src/styles.css'

export const metadata: Metadata = {
  title: 'MotoDesk — Dealership workspace',
  description: 'MotoDesk — a considered workspace for your motorcycle dealership. Manage inventory, sales, and business finances.',
}

export const viewport: Viewport = { themeColor: '#eef1f8' }

export default function RootLayout({ children }: { children: ReactNode }) {
  return <html lang="en"><body>{children}</body></html>
}
