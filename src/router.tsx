import {
  createRouter,
  createRoute,
  createRootRoute,
  redirect,
} from '@tanstack/react-router'
import { RootLayout } from './layouts/root-layout'
import { LoginPage } from './pages/login'
import { DashboardPage } from './pages/dashboard'

// ─── Root Route ───
const rootRoute = createRootRoute({
  component: RootLayout,
})

// ─── Index Route (redirect) ───
const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  beforeLoad: () => {
    const token = localStorage.getItem('pel_token')
    if (token) {
      throw redirect({ to: '/dashboard' })
    } else {
      throw redirect({ to: '/login' })
    }
  },
})

// ─── Login Route ───
const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/login',
  component: LoginPage,
})

// ─── Dashboard Route ───
const dashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/dashboard',
  component: DashboardPage,
})

// ─── Router ───
const routeTree = rootRoute.addChildren([indexRoute, loginRoute, dashboardRoute])

export const router = createRouter({ routeTree })

// ─── Type Registration ───
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}
