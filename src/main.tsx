import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { LumiereDemoPage } from './components/demo/LumiereDemoPage.tsx'

// /demo route bypasses auth — full AppShell showcase
const isDemo = typeof window !== 'undefined' && window.location.pathname.startsWith('/demo')

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {isDemo ? <LumiereDemoPage /> : <App />}
  </StrictMode>,
)
