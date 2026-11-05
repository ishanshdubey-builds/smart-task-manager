import { useState } from 'react'
import API from '../api/api'
import { useNavigate, Link } from 'react-router-dom'

export default function Register() {
  const [formData, setFormData] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const handleRegister = async (e) => {
    e.preventDefault()
    try {
      await API.post('auth/register', formData)
      navigate('/login')
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed')
    }
  }

  return (
    <div className="flex min-h-screen items-stretch bg-[#f5f3ee] text-[#242320] transition-colors dark:bg-[#0d0d0e] dark:text-[#eeece6]">
      <div className="hidden w-1/2 flex-col justify-between border-r border-black/10 bg-[#eeece5] p-12 dark:border-white/[0.07] dark:bg-[#111113] lg:flex xl:p-20">
        <Link to="/" className="flex items-center gap-3 text-xs font-semibold uppercase tracking-[.16em]"><span className="flex h-8 w-8 items-center justify-center border border-[#b9a47b] text-[#9d855c]"><span className="editorial-display text-xl">S</span></span>Stillpoint</Link>
        <div className="max-w-xl">
          <p className="eyebrow mb-7">Make a considered start</p>
          <h1 className="editorial-display text-6xl leading-[1.08]">Build a steadier relationship with your time.</h1>
        </div>
        <p className="text-[10px] uppercase tracking-[.18em] text-[#8a867d]">Personal focus / Team clarity / Steady progress</p>
      </div>
      <div className="flex w-full items-center justify-center px-6 py-16 lg:w-1/2">
        <div className="w-full max-w-[390px]">
          <div className="mb-12 lg:hidden"><Link to="/" className="text-xs font-semibold uppercase tracking-[.16em]">Stillpoint</Link></div>
          <p className="eyebrow mb-4">Create your account</p>
          <h2 className="editorial-display mb-3 text-4xl">Start with clarity.</h2>
          <p className="mb-10 text-sm leading-6 text-[#77746c] dark:text-zinc-400">Set up your account and make this space your own.</p>

          {error && <div className="mb-6 border-l-2 border-red-500 bg-red-500/[0.06] px-4 py-3 text-sm text-red-500">{error}</div>}

          <form onSubmit={handleRegister} className="space-y-6">
            <div>
              <label className="mb-2 block text-[11px] font-semibold uppercase tracking-[.14em] text-[#77746c] dark:text-zinc-400">Email address</label>
              <input type="email" className="workspace-input px-4 py-3.5 text-sm" placeholder="you@example.com" onChange={(e) => setFormData({...formData, email: e.target.value})} required />
            </div>
            <div>
              <label className="mb-2 block text-[11px] font-semibold uppercase tracking-[.14em] text-[#77746c] dark:text-zinc-400">Password</label>
              <input type="password" className="workspace-input px-4 py-3.5 text-sm" placeholder="Create a password" onChange={(e) => setFormData({...formData, password: e.target.value})} required />
            </div>
            <button className="editorial-button mt-2 w-full bg-[#242320] py-4 text-xs font-semibold uppercase tracking-[.16em] text-[#f5f3ee] hover:bg-black dark:bg-[#eeece6] dark:text-[#0d0d0e] dark:hover:bg-white">Create account <span className="ml-2">↗</span></button>
          </form>
          <p className="mt-9 text-center text-sm text-[#77746c] dark:text-zinc-400">Already registered? <Link to="/login" className="font-semibold text-[#9d855c] underline underline-offset-4">Sign in</Link></p>
        </div>
      </div>
    </div>
  )
}
