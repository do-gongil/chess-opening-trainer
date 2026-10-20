import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { I18nProvider } from './i18n/index.tsx'
import { LibraryProvider } from './model/store.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <I18nProvider>
      <LibraryProvider>
        <App />
      </LibraryProvider>
    </I18nProvider>
  </StrictMode>,
)
