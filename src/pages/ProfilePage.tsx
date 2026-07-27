import { useState, type FormEvent } from 'react'
import { ArrowLeftIcon, KeyIcon, SignOutIcon } from '@phosphor-icons/react'
import { Link, useNavigate } from 'react-router-dom'
import { ErrorState, PageSkeleton } from '../components/States'
import { useAuth } from '../context/AuthContext'
import { useProfile } from '../hooks/useAppData'

export function ProfilePage() {
  const { signOut, changePassword, isDemo } = useAuth(), profile = useProfile(), navigate = useNavigate()
  const [password, setPassword] = useState('')
  const [confirmation, setConfirmation] = useState('')
  const [passwordError, setPasswordError] = useState('')
  const [passwordStatus, setPasswordStatus] = useState('')
  const [savingPassword, setSavingPassword] = useState(false)

  const submitPassword = async (event: FormEvent) => {
    event.preventDefault()
    setPasswordError('')
    setPasswordStatus('')
    if (password.length < 8) return setPasswordError('Use at least 8 characters.')
    if (password !== confirmation) return setPasswordError('The passwords do not match.')
    setSavingPassword(true)
    try {
      await changePassword(password)
      setPassword('')
      setConfirmation('')
      setPasswordStatus('Password updated.')
    } catch (reason) {
      setPasswordError(reason instanceof Error ? reason.message : 'Unable to update password')
    } finally {
      setSavingPassword(false)
    }
  }

  if (profile.isLoading) return <PageSkeleton />
  if (profile.error) return <ErrorState retry={() => void profile.refetch()} />
  return <div className="mx-auto max-w-3xl px-5 py-10 md:px-10 md:py-16">
    <Link to="/" className="focus-ring pressable inline-flex min-h-12 items-center gap-2 text-sm font-semibold text-muted hover:text-ink"><ArrowLeftIcon size={19} />Today</Link>
    <p className="eyebrow mt-12">Profile</p>
    <h1 className="mt-5 text-5xl font-semibold tracking-[-.065em] md:text-7xl">{profile.data?.displayName}</h1>
    <div className="mt-14 border-t border-line">
      <div className="grid grid-cols-[8rem_1fr] border-b border-line py-6"><span className="text-sm text-muted">Email</span><span className="break-all text-sm font-medium">{profile.data?.email}</span></div>
      <div className="grid grid-cols-[8rem_1fr] border-b border-line py-6"><span className="text-sm text-muted">Units</span><span className="text-sm font-medium">Kilometres</span></div>
      <div className="grid grid-cols-[8rem_1fr] border-b border-line py-6"><span className="text-sm text-muted">Time zone</span><span className="text-sm font-medium">Asia/Kolkata</span></div>
      {isDemo && <div className="grid grid-cols-[8rem_1fr] border-b border-line py-6"><span className="text-sm text-muted">Mode</span><span className="text-sm font-medium">Local preview</span></div>}
    </div>
    {!isDemo && <section className="mt-14 border-t border-line pt-8">
      <div className="flex items-center gap-3"><KeyIcon size={22} /><h2 className="text-xl font-semibold tracking-[-.03em]">Change password</h2></div>
      <p className="mt-3 max-w-lg text-sm leading-6 text-muted">Choose at least 8 characters. Your session will stay signed in after the update.</p>
      <form onSubmit={submitPassword} className="mt-7 max-w-lg space-y-5">
        <label className="block"><span className="mb-2 block text-sm font-medium">New password</span><input className="focus-ring min-h-14 w-full border border-line bg-canvas px-4 text-base outline-none focus:border-ink" type="password" autoComplete="new-password" value={password} onChange={(event) => setPassword(event.target.value)} required minLength={8} /></label>
        <label className="block"><span className="mb-2 block text-sm font-medium">Confirm new password</span><input className="focus-ring min-h-14 w-full border border-line bg-canvas px-4 text-base outline-none focus:border-ink" type="password" autoComplete="new-password" value={confirmation} onChange={(event) => setConfirmation(event.target.value)} required minLength={8} /></label>
        {passwordError && <p role="alert" className="text-sm text-accent-dark">{passwordError}</p>}
        {passwordStatus && <p role="status" className="text-sm font-medium">{passwordStatus}</p>}
        <button disabled={savingPassword} className="focus-ring pressable min-h-12 border border-ink px-5 text-sm font-semibold hover:bg-ink hover:text-canvas disabled:opacity-50">{savingPassword ? 'Updating…' : 'Update password'}</button>
      </form>
    </section>}
    <button onClick={async () => { await signOut(); navigate('/login') }} className="focus-ring pressable mt-14 flex min-h-12 items-center gap-3 border border-ink px-5 text-sm font-semibold hover:bg-ink hover:text-canvas"><SignOutIcon size={19} />Sign out</button>
  </div>
}
