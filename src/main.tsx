import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.tsx'
import Splash from './components/Splash.tsx'
import { DayBreakProvider } from './contexts/DayBreakContext.tsx'

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {})
  })
}

// Ask the browser to mark our storage as persistent so iOS Safari and
// other browsers don't evict the IndexedDB-backed photos and movement
// history under their automatic clean-up policies. Auto-granted on
// installed PWAs in capable browsers; harmlessly no-ops elsewhere.
if (typeof navigator !== 'undefined' && navigator.storage?.persist) {
  navigator.storage.persist().catch(() => {})
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <DayBreakProvider>
        <App />
        <Splash />
      </DayBreakProvider>
    </BrowserRouter>
  </StrictMode>,
)
