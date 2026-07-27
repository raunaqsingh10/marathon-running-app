import { useState, type FormEvent } from 'react'
import { ArrowRightIcon } from '@phosphor-icons/react'
import { Navigate } from 'react-router-dom'
import { BrandMark } from '../components/BrandMark'
import { useAuth } from '../context/AuthContext'

export function LoginPage() {
  const { userId, isDemo, signIn, demoSignIn } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  if (userId) return <Navigate to="/" replace />

  const submit = async (event: FormEvent) => {
    event.preventDefault(); setSubmitting(true); setError('')
    try { await signIn(email, password) } catch (reason) { setError(reason instanceof Error ? reason.message : 'Unable to sign in') } finally { setSubmitting(false) }
  }

  return <main className="grid min-h-[100dvh] bg-canvas lg:grid-cols-[1.15fr_.85fr]">
    <section className="flex min-h-[58dvh] flex-col justify-between px-6 py-7 sm:px-10 lg:min-h-[100dvh] lg:px-[8vw] lg:py-10">
      <BrandMark />
      <div className="py-16 lg:py-0">
        <p className="eyebrow">Private training club · 02 members</p>
        <h1 className="mt-7 max-w-xl text-[clamp(3.3rem,8vw,7.5rem)] font-semibold leading-[.83] tracking-[-.075em]">RUN<br />TOGETHER.</h1>
        <p className="mt-7 text-lg text-muted">Train. Log. Improve.</p>
      </div>
      <p className="hidden text-xs uppercase tracking-[.12em] text-muted lg:block">Eight weeks · One shared finish line</p>
    </section>
    <section className="flex items-center border-t border-line bg-[#ebe7de] px-6 py-14 sm:px-10 lg:border-l lg:border-t-0 lg:px-[7vw]">
      <div className="w-full max-w-sm">
        <p className="eyebrow">Member access</p>
        <h2 className="mt-5 text-3xl font-semibold tracking-[-.045em]">Welcome back.</h2>
        {isDemo ? <div className="mt-10 space-y-3"><p className="mb-5 text-sm leading-6 text-muted">Preview the full local experience as either runner. Progress stays in this browser.</p>{(['Raunaq', 'Vipul'] as const).map((name) => <button key={name} onClick={() => demoSignIn(name)} className="focus-ring pressable flex min-h-14 w-full items-center justify-between border border-ink px-5 text-left font-semibold hover:bg-ink hover:text-canvas"><span>Continue as {name}</span><ArrowRightIcon size={19} /></button>)}</div> : <form onSubmit={submit} className="mt-10 space-y-5">
          <label className="block"><span className="mb-2 block text-sm font-medium">Email</span><input className="focus-ring min-h-14 w-full border border-line bg-canvas px-4 text-base outline-none focus:border-ink" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} required /></label>
          <label className="block"><span className="mb-2 block text-sm font-medium">Password</span><input className="focus-ring min-h-14 w-full border border-line bg-canvas px-4 text-base outline-none focus:border-ink" type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} required /></label>
          {error && <p role="alert" className="text-sm text-accent-dark">{error}</p>}
          <button disabled={submitting} className="focus-ring pressable flex min-h-14 w-full items-center justify-between bg-ink px-5 font-semibold text-canvas disabled:opacity-50"><span>{submitting ? 'Signing in…' : 'Sign in'}</span><ArrowRightIcon size={19} /></button>
        </form>}
      </div>
    </section>
  </main>
}
