'use client'

import dynamic from 'next/dynamic'

// HashRouter relies on the browser; keep the existing SPA client-rendered.
const App = dynamic(() => import('../src/main'), { ssr: false })

export default function Page() {
  return <App />
}
