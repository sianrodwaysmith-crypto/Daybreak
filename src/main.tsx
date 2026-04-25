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
