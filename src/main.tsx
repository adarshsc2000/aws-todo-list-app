import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import { COGNITO_AUTHORITY, COGNITO_CLIENT_ID, COGNITO_REDIRECT_URI } from './constants/constants.ts'
import { AuthProvider } from 'react-oidc-context'

const cognitoAuthConfig = {
  authority: COGNITO_AUTHORITY,
  client_id: COGNITO_CLIENT_ID,
  redirect_uri: COGNITO_REDIRECT_URI,
  response_type: "code",
  scope: "phone openid email",
};

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider {...cognitoAuthConfig}>
        <App />
    </AuthProvider>
  </StrictMode>
)
