import { lazy, Suspense, useLayoutEffect } from 'react'
import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { AppShell } from './components/AppShell'
import { PageSkeleton } from './components/States'
import { useAuth } from './context/AuthContext'

const HistoryPage = lazy(() => import('./pages/HistoryPage').then((module) => ({ default: module.HistoryPage })))
const LoginPage = lazy(() => import('./pages/LoginPage').then((module) => ({ default: module.LoginPage })))
const LogRunPage = lazy(() => import('./pages/LogRunPage').then((module) => ({ default: module.LogRunPage })))
const PlanPage = lazy(() => import('./pages/PlanPage').then((module) => ({ default: module.PlanPage })))
const ProfilePage = lazy(() => import('./pages/ProfilePage').then((module) => ({ default: module.ProfilePage })))
const ProgressPage = lazy(() => import('./pages/ProgressPage').then((module) => ({ default: module.ProgressPage })))
const TodayPage = lazy(() => import('./pages/TodayPage').then((module) => ({ default: module.TodayPage })))

function ProtectedShell() {
  const { userId, loading } = useAuth()
  const location = useLocation()
  if (loading) return <PageSkeleton />
  if (!userId) return <Navigate to="/login" replace state={{ from: location }} />
  return <AppShell />
}

function ScrollToTop() {
  const { pathname } = useLocation()
  useLayoutEffect(() => { window.scrollTo({ top: 0, left: 0 }) }, [pathname])
  return null
}

export default function App() {
  return <Suspense fallback={<PageSkeleton />}><ScrollToTop /><Routes>
    <Route path="/login" element={<LoginPage />} />
    <Route element={<ProtectedShell />}>
      <Route index element={<TodayPage />} />
      <Route path="plan" element={<PlanPage />} />
      <Route path="progress" element={<ProgressPage />} />
      <Route path="history" element={<HistoryPage />} />
      <Route path="profile" element={<ProfilePage />} />
      <Route path="log" element={<LogRunPage />} />
    </Route>
    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes></Suspense>
}
