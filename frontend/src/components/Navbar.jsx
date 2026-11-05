import { Link, useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'

export default function Navbar() {
  const navigate = useNavigate()
  const token = localStorage.getItem('token')
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark')

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark')
      localStorage.setItem('theme', 'dark')
    } else {
      document.documentElement.classList.remove('dark')
      localStorage.setItem('theme', 'light')
    }
  }, [theme])

  const toggleTheme = () => setTheme(theme === 'dark' ? 'light' : 'dark')

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('streak')
    navigate('/login')
  }

  return (
    <nav className="sticky top-0 z-50 flex items-center justify-between border-b border-black/10 bg-[#f5f3ee]/90 px-5 py-4 backdrop-blur-md dark:border-white/[0.06] dark:bg-[#0d0d0e]/90 sm:px-8">
      <Link to="/" className="flex items-center gap-3 text-sm font-semibold uppercase tracking-[.16em] text-[#242320] dark:text-[#eeece6]">
        <span className="flex h-8 w-8 items-center justify-center border border-[#b9a47b] text-[#9d855c]">
          <span className="editorial-display text-xl">S</span>
        </span>
        Stillpoint
      </Link>
      <div className="flex items-center gap-5 text-[12px] font-medium tracking-wide">
        <button onClick={toggleTheme} aria-label="Toggle theme" className="border border-black/10 p-2 text-[#77746c] transition-colors hover:text-black dark:border-white/10 dark:text-zinc-400 dark:hover:text-white">
          {theme === 'dark' ? (
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"/></svg>
          ) : (
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M20.354 15.354A9 9 0 018.646 3.646 9 9 0 0012 21a9 9 0 008.354-5.646z"/></svg>
          )}
        </button>
        {token ? (
          <>
            <Link to="/dashboard" className="text-zinc-600 transition-colors hover:text-black dark:text-zinc-400 dark:hover:text-white">Workspace</Link>
            <button onClick={handleLogout} className="editorial-button border border-black/15 px-4 py-2 text-[#242320] hover:bg-black hover:text-white dark:border-white/15 dark:text-zinc-200 dark:hover:bg-white dark:hover:text-black">Sign out</button>
          </>
        ) : (
          <>
            <Link to="/login" className="text-zinc-600 transition-colors hover:text-black dark:text-zinc-400 dark:hover:text-white">Sign in</Link>
            <Link to="/register" className="editorial-button bg-[#242320] px-5 py-2.5 text-[#f5f3ee] hover:bg-black dark:bg-[#eeece6] dark:text-[#0d0d0e] dark:hover:bg-white">Create account</Link>
          </>
        )}
      </div>
    </nav>
  )
}
