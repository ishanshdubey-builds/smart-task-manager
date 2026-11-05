import { NavLink, useNavigate } from 'react-router-dom'

const links = [
  { to: '/dashboard', label: 'Overview', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3.5" y="3.5" width="7" height="7"/><rect x="13.5" y="3.5" width="7" height="7"/><rect x="3.5" y="13.5" width="7" height="7"/><rect x="13.5" y="13.5" width="7" height="7"/></svg> },
  { to: '/tasks', label: 'My tasks', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M7 4.5h10M7 8.5h10M7 12.5h6M5 3.5h14v17H5z"/></svg> },
  { to: '/calendar', label: 'Calendar', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3.5" y="5" width="17" height="15"/><path d="M7.5 3v4M16.5 3v4M3.5 9.5h17"/></svg> },
  { to: '/team', label: 'Team space', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="9" cy="8" r="3"/><circle cx="17" cy="9" r="2.5"/><path d="M3.5 20c.3-4 2.1-6 5.5-6s5.2 2 5.5 6M15 15c3.3-.2 5 1.5 5.5 4.5"/></svg> },
  { to: '/analytics', label: 'Insights', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M4 20V11h4v9M10 20V4h4v16M16 20v-7h4v7"/></svg> },
]

export default function Sidebar({ streak }) {
  const navigate = useNavigate()
  const navClass = ({ isActive }) =>
    `relative flex items-center gap-3 pl-4 pr-3 py-3 text-[13px] tracking-wide transition-colors border-l-2 ${
      isActive
        ? 'border-[#b9a47b] text-[#f0eee8] bg-white/[0.035] font-semibold'
        : 'border-transparent text-zinc-500 hover:text-zinc-200 hover:bg-white/[0.025]'
    }`

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    localStorage.removeItem('streak')
    navigate('/login')
  }

  return (
    <aside className="hidden md:flex fixed left-0 top-0 z-40 h-screen w-[248px] flex-col justify-between border-r border-zinc-800/50 bg-[#0d0d0e] text-zinc-100">
      <div className="px-7 pt-8">
        <div className="mb-16 flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center border border-[#b9a47b]/60 text-[#c9b58e]">
            <span className="editorial-display text-xl">S</span>
          </div>
          <div>
            <p className="text-[13px] font-semibold tracking-[.16em] uppercase">Stillpoint</p>
            <p className="mt-0.5 text-[9px] tracking-[.2em] uppercase text-zinc-600">Task workspace</p>
          </div>
        </div>

        <p className="eyebrow mb-4 pl-4">Workspace</p>
        <nav className="space-y-1">
          {links.map(link => (
            <NavLink key={link.to} to={link.to} className={navClass}>
              <span className="h-[17px] w-[17px] shrink-0">{link.icon}</span>
              {link.label}
            </NavLink>
          ))}
        </nav>
      </div>

      <div className="px-7 pb-7">
        <div className="mb-5 border-y border-zinc-800/70 py-4">
          <p className="eyebrow mb-2">Consistency record</p>
          <div className="flex items-end justify-between">
            <span className="editorial-display text-3xl text-zinc-100">{streak || 0}</span>
            <span className="pb-1 text-[10px] uppercase tracking-[.16em] text-zinc-500">day streak</span>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 py-2 text-left text-[12px] tracking-wide text-zinc-500 transition-colors hover:text-zinc-100"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M10 17l5-5-5-5m5 5H3m10-7V4a1 1 0 011-1h6a1 1 0 011 1v16a1 1 0 01-1 1h-6a1 1 0 01-1-1v-3"/></svg>
          Sign out
        </button>
      </div>
    </aside>
  )
}
