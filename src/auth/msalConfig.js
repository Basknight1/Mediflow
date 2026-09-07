import { PublicClientApplication, BrowserCacheLocation, LogLevel } from '@azure/msal-browser'

const clientId = import.meta.env.VITE_CLIENT_ID
const tenantId = import.meta.env.VITE_TENANT_ID
const redirectUri = import.meta.env.VITE_REDIRECT_URI ?? 'http://localhost:5173'

export const msalConfig = {
    auth: {
        clientId,
        authority: `https://login.microsoftonline.com/${tenantId}`,
        redirectUri,
        postLogoutRedirectUri: redirectUri,
        navigateToLoginRequestUrl: false,
    },
    cache: {
        cacheLocation: BrowserCacheLocation.LocalStorage,
    },
    system: {
        loggerOptions: {
            logLevel: LogLevel.Warning,
            piiLoggingEnabled: false,
        },
    },
}

export const msalInstance = new PublicClientApplication(msalConfig)