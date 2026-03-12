import { Outlet } from '@tanstack/react-router'
import { TooltipProvider } from '@/components/ui/tooltip'
import { QueryProvider } from '@/lib/query-provider'
import { AuthProvider } from '@/lib/auth-context'
import { StoreProvider } from '@/lib/store/store-provider'
import { Toaster } from 'sonner'

export function RootLayout() {
  return (
    <StoreProvider>
      <QueryProvider>
        <AuthProvider>
          <TooltipProvider>
            <Outlet />
            <Toaster richColors position="top-right" />
          </TooltipProvider>
        </AuthProvider>
      </QueryProvider>
    </StoreProvider>
  )
}
