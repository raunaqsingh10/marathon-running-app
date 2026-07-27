import { CalendarDotsIcon, ChartLineUpIcon, ClockCounterClockwiseIcon, HouseIcon, UserCircleIcon } from '@phosphor-icons/react'
import { NavLink, Outlet } from 'react-router-dom'
import { useProfile } from '../hooks/useAppData'
import { BrandMark } from './BrandMark'

const nav = [
  { to: '/', label: 'Today', icon: HouseIcon },
  { to: '/plan', label: 'Plan', icon: CalendarDotsIcon },
  { to: '/progress', label: 'Progress', icon: ChartLineUpIcon },
  { to: '/history', label: 'History', icon: ClockCounterClockwiseIcon },
]

export function AppShell() {
  const { data: profile } = useProfile()
  return <div className="min-h-[100dvh] bg-canvas">
    <header className="border-b border-line bg-canvas/95">
      <div className="mx-auto flex h-18 max-w-7xl items-center justify-between px-5 md:px-10">
        <BrandMark />
        <nav className="hidden items-center gap-8 md:flex" aria-label="Primary navigation">{nav.map(({ to, label }) => <NavLink key={to} to={to} end={to === '/'} className={({ isActive }) => `focus-ring border-b py-6 text-sm font-medium transition-colors ${isActive ? 'border-ink text-ink' : 'border-transparent text-muted hover:text-ink'}`}>{label}</NavLink>)}</nav>
        <NavLink to="/profile" className="focus-ring pressable flex min-h-12 items-center gap-2 text-sm font-medium text-muted hover:text-ink" aria-label="Open profile"><span className="hidden sm:block">{profile?.displayName ?? 'Profile'}</span><UserCircleIcon size={24} weight="light" /></NavLink>
      </div>
    </header>
    <main className="pb-28 md:pb-8"><Outlet /></main>
    <nav className="safe-bottom fixed inset-x-0 bottom-0 border-t border-line bg-canvas/95 px-3 pt-2 backdrop-blur-sm md:hidden" aria-label="Primary navigation">
      <div className="mx-auto grid max-w-md grid-cols-4">{nav.map(({ to, label, icon: Icon }) => <NavLink key={to} to={to} end={to === '/'} className={({ isActive }) => `focus-ring pressable flex min-h-14 flex-col items-center justify-center gap-1 text-[.66rem] font-medium ${isActive ? 'text-accent' : 'text-muted'}`}><Icon size={21} weight="regular" /><span>{label}</span></NavLink>)}</div>
    </nav>
  </div>
}
