import { Link, useNavigate } from 'react-router-dom'
import { useState, useEffect, useRef } from 'react'

export default function Header({ user }) {
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark')
  const [showDropdown, setShowDropdown] = useState(false)
  const [avatarFailed, setAvatarFailed] = useState(false)
  const dropdownRef = useRef(null)
  const navigate = useNavigate()

  useEffect(() => {
    setAvatarFailed(false)
  }, [user?.avatar])

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark')
      localStorage.setItem('theme', 'dark')
    } else {
      document.documentElement.classList.remove('dark')
      localStorage.setItem('theme', 'light')
    }
  }, [theme])

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const toggleTheme = () => setTheme(theme === 'dark' ? 'light' : 'dark')

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    localStorage.removeItem('streak')
    navigate('/login')
  }

  return (
    <header className="mb-9 flex items-center justify-between border-b border-black/10 pb-5 dark:border-white/[0.07]">
      <div>
        <p className="eyebrow mb-1">Personal command / daily practice</p>
        <h1 className="editorial-display text-3xl text-[#242320] dark:text-[#eeece6] sm:text-4xl">Your workspace</h1>
      </div>
      <div className="flex items-center gap-3">
        <button onClick={toggleTheme} aria-label="Toggle theme" className="border border-black/10 p-2.5 text-zinc-500 transition-colors hover:text-black dark:border-white/10 dark:text-zinc-400 dark:hover:text-white">
          {theme === 'dark' ? (
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"/></svg>
          ) : (
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M20.354 15.354A9 9 0 018.646 3.646 9 9 0 0012 21a9 9 0 008.354-5.646z"/></svg>
          )}
        </button>
        <div className="relative" ref={dropdownRef}>
          <button onClick={() => setShowDropdown(!showDropdown)} className="flex items-center gap-3 border border-black/10 px-2.5 py-2 transition-colors hover:bg-black/[0.03] dark:border-white/10 dark:hover:bg-white/[0.04]">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden border border-[#b9a47b]/50 bg-[#b9a47b]/10 font-semibold text-[#c9b58e]">
              {user?.avatar && !avatarFailed ? (
                <img src={user.avatar} alt="Profile avatar" className="h-full w-full object-cover" onError={() => setAvatarFailed(true)} />
              ) : (
                user?.name?.charAt(0)?.toUpperCase() || 'U'
              )}
            </div>
            <span className="hidden text-[12px] font-medium text-zinc-700 dark:text-zinc-200 sm:block">{user?.name || 'User'}</span>
            <svg className="h-3.5 w-3.5 text-zinc-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 9l-7 7-7-7"/></svg>
          </button>
          {showDropdown && (
            <div className="absolute right-0 z-50 mt-2 w-48 border border-black/10 bg-[#f8f6f1] py-1 shadow-xl dark:border-white/10 dark:bg-[#171717]">
              <Link to="/profile" onClick={() => setShowDropdown(false)} className="block px-4 py-2.5 text-[12px] text-zinc-700 hover:bg-black/[0.04] dark:text-zinc-300 dark:hover:bg-white/[0.04]">Account details</Link>
              <div className="mx-3 border-t border-black/10 dark:border-white/10" />
              <button onClick={handleLogout} className="block w-full px-4 py-2.5 text-left text-[12px] text-red-500 hover:bg-black/[0.04] dark:hover:bg-white/[0.04]">Sign out</button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
