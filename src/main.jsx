import './auth/cognitoConfig.js'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import AuthProvider from './context/AuthContext.jsx'
import { BrowserRouter } from 'react-router-dom'
import { MsalProvider } from '@azure/msal-react'
import { EventType } from '@azure/msal-browser'
import { msalInstance } from './auth/msalConfig'

async function bootstrap() {
  await msalInstance.initialize()
  window.msalInstance = msalInstance // TEMPORAL

  msalInstance.addEventCallback((event) => {
    if (event.eventType === EventType.LOGIN_SUCCESS && event.payload?.account) {
      msalInstance.setActiveAccount(event.payload.account)
    }
  })

  try {
    const result = await msalInstance.handleRedirectPromise()
  } catch (error) {
    console.error('ERROR en handleRedirectPromise:', error)
  }

  createRoot(document.getElementById('root')).render(
    <StrictMode>
      <MsalProvider instance={msalInstance}>
        <BrowserRouter>
          <AuthProvider>
            <App />
          </AuthProvider>
        </BrowserRouter>
      </MsalProvider>
    </StrictMode>
  )
}

bootstrap()