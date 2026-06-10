import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Toaster } from 'react-hot-toast'
import './index.css'
import App from './App'

const originalWarn = console.warn;
console.warn = (...args) => {
  if (typeof args[0] === 'string' && args[0].includes('The width(-1) and height(-1) of chart should be greater than 0')) {
    return;
  }
  originalWarn(...args);
};

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Toaster
      position="top-right"
      toastOptions={{
        duration: 3000,
        style: {
          background: '#1e1b2e',
          color: '#e2e8f0',
          border: '1px solid rgba(139, 92, 246, 0.2)',
          borderRadius: '12px',
          fontSize: '13px',
        },
        success: {
          iconTheme: {
            primary: '#8B5CF6',
            secondary: '#fff',
          },
        },
        error: {
          iconTheme: {
            primary: '#ef4444',
            secondary: '#fff',
          },
        },
      }}
    />
    <App />
  </StrictMode>,
)
