import { lazy, Suspense } from 'react'
import { createBrowserRouter, Navigate, Outlet, RouterProvider } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'sonner'
import { AuthProvider, useAuth } from '@/lib/hooks/useAuth'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 60_000, retry: 1 },
  },
})

// Lazy-loaded pages
const Login = lazy(() => import('./pages/auth/Login').then(m => ({ default: m.LoginPage })))
const Signup = lazy(() => import('./pages/auth/Signup').then(m => ({ default: m.SignupPage })))
const InviteAccept = lazy(() => import('./pages/auth/InviteAccept').then(m => ({ default: m.InviteAcceptPage })))
const OrgSetup = lazy(() => import('./pages/onboarding/OrgSetup').then(m => ({ default: m.OrgSetupPage })))
const AppShell = lazy(() => import('./components/layout/AppShell').then(m => ({ default: m.AppShell })))
const Dashboard = lazy(() => import('./pages/dashboard/index').then(m => ({ default: m.DashboardPage })))
const Frameworks = lazy(() => import('./pages/frameworks/index').then(m => ({ default: m.FrameworksPage })))
const FrameworkDetail = lazy(() => import('./pages/frameworks/[frameworkId]/index').then(m => ({ default: m.FrameworkDetailPage })))
const PrincipleDetail = lazy(() => import('./pages/frameworks/[frameworkId]/[principleId]').then(m => ({ default: m.PrincipleDetailPage })))
const MyTasks = lazy(() => import('./pages/collection/my-tasks').then(m => ({ default: m.MyTasksPage })))
const QuestionPage = lazy(() => import('./pages/collection/[questionId]').then(m => ({ default: m.QuestionPage })))
const Review = lazy(() => import('./pages/review/index').then(m => ({ default: m.ReviewPage })))
const Reports = lazy(() => import('./pages/reports/index').then(m => ({ default: m.ReportsPage })))
const OrgSettings = lazy(() => import('./pages/settings/org').then(m => ({ default: m.OrgSettingsPage })))
const Users = lazy(() => import('./pages/settings/users').then(m => ({ default: m.UsersPage })))
const Departments = lazy(() => import('./pages/settings/departments').then(m => ({ default: m.DepartmentsPage })))
const Periods = lazy(() => import('./pages/settings/report-periods').then(m => ({ default: m.PeriodsPage })))

function PageLoader() {
  return (
    <div className="flex items-center justify-center h-40">
      <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  )
}

function ProtectedRoute() {
  const { isLoading, isAuthenticated, orgId } = useAuth()

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }
  if (!isAuthenticated) return <Navigate to="/login" replace />
  if (!orgId) return <Navigate to="/onboarding" replace />
  return <Outlet />
}

function OnboardingRoute() {
  const { isLoading, isAuthenticated, orgId } = useAuth()

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }
  if (!isAuthenticated) return <Navigate to="/login" replace />
  if (orgId) return <Navigate to="/dashboard" replace />
  return <Outlet />
}

const router = createBrowserRouter([
  { path: '/login', element: <Suspense fallback={<PageLoader />}><Login /></Suspense> },
  { path: '/signup', element: <Suspense fallback={<PageLoader />}><Signup /></Suspense> },
  { path: '/invite', element: <Suspense fallback={<PageLoader />}><InviteAccept /></Suspense> },
  {
    path: '/onboarding',
    element: <OnboardingRoute />,
    children: [
      { index: true, element: <Suspense fallback={<PageLoader />}><OrgSetup /></Suspense> },
    ],
  },
  {
    path: '/',
    element: <ProtectedRoute />,
    children: [
      {
        element: <Suspense fallback={<PageLoader />}><AppShell /></Suspense>,
        children: [
          { index: true, element: <Navigate to="/dashboard" replace /> },
          { path: 'dashboard', element: <Suspense fallback={<PageLoader />}><Dashboard /></Suspense> },
          { path: 'frameworks', element: <Suspense fallback={<PageLoader />}><Frameworks /></Suspense> },
          { path: 'frameworks/:frameworkId', element: <Suspense fallback={<PageLoader />}><FrameworkDetail /></Suspense> },
          { path: 'frameworks/:frameworkId/:principleId', element: <Suspense fallback={<PageLoader />}><PrincipleDetail /></Suspense> },
          { path: 'collection/tasks', element: <Suspense fallback={<PageLoader />}><MyTasks /></Suspense> },
          { path: 'collection/:questionId', element: <Suspense fallback={<PageLoader />}><QuestionPage /></Suspense> },
          { path: 'review', element: <Suspense fallback={<PageLoader />}><Review /></Suspense> },
          { path: 'reports', element: <Suspense fallback={<PageLoader />}><Reports /></Suspense> },
          { path: 'settings/org', element: <Suspense fallback={<PageLoader />}><OrgSettings /></Suspense> },
          { path: 'settings/users', element: <Suspense fallback={<PageLoader />}><Users /></Suspense> },
          { path: 'settings/departments', element: <Suspense fallback={<PageLoader />}><Departments /></Suspense> },
          { path: 'settings/periods', element: <Suspense fallback={<PageLoader />}><Periods /></Suspense> },
        ],
      },
    ],
  },
  { path: '*', element: <Navigate to="/dashboard" replace /> },
])

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <RouterProvider router={router} />
        <Toaster richColors position="top-right" />
      </AuthProvider>
    </QueryClientProvider>
  )
}
