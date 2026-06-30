import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

async function waitForIconFont() {
  const timeout = new Promise((resolve) => setTimeout(resolve, 2500))
  const load = document.fonts.load('24px "Material Symbols Outlined"').catch(() => {})
  await Promise.race([load, timeout])
}

waitForIconFont().finally(() => {
  createRoot(document.getElementById('root')).render(
    <StrictMode>
      <App />
    </StrictMode>,
  )
})
