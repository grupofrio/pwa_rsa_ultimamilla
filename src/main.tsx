/* eslint-disable react-refresh/only-export-components */
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { StrictMode, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { App } from '@/app/App'
import { AppErrorBoundary } from '@/app/ErrorBoundary'
import { AuthProvider } from '@/auth/AuthProvider'
import { ConnectionProvider } from '@/app/ConnectionProvider'
import './index.css'

function Root() {
  const [client] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: { retry: 1, refetchOnWindowFocus: false, staleTime: 15_000 },
        },
      }),
  )

  return (
    <StrictMode>
      <AppErrorBoundary>
        <QueryClientProvider client={client}>
          <AuthProvider>
            <ConnectionProvider>
              <BrowserRouter>
                <App />
              </BrowserRouter>
            </ConnectionProvider>
          </AuthProvider>
        </QueryClientProvider>
      </AppErrorBoundary>
    </StrictMode>
  )
}

createRoot(document.getElementById('root')!).render(<Root />)
