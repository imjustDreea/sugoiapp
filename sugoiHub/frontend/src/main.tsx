import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { App } from './App.tsx'
import { AuthProvider } from './context/AuthContext'
import { applyTheme, loadThemeFromLocalStorage } from './theme'

const savedTheme = loadThemeFromLocalStorage();
if (savedTheme) {
  applyTheme(savedTheme);
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </StrictMode>,
)
  