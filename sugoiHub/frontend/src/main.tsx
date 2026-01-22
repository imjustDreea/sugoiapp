import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { App } from './App.tsx'
import { AuthProvider } from './context/AuthContext'
import { ToastProvider } from './context/ToastContext'
import { LikesProvider } from './context/LikesContext'
import { applyTheme, loadThemeFromLocalStorage } from './theme'

const savedTheme = loadThemeFromLocalStorage();
if (savedTheme) {
  applyTheme(savedTheme);
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <LikesProvider>
        <ToastProvider>
          <App />
        </ToastProvider>
      </LikesProvider>
    </AuthProvider>
  </StrictMode>,
)
  