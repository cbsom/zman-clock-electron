import React from 'react'
import ReactDOM from 'react-dom/client'
import { SettingsProvider } from './settingsContext'
import App from './App'
import './samples/node-api'
import './index.css'

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <SettingsProvider>
      <App />
    </SettingsProvider>
  </React.StrictMode>,
)

postMessage({ payload: 'removeLoading' }, '*')
