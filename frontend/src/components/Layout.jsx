import { useState, useEffect } from 'react'
import Sidebar from './Sidebar'
import Header from './Header'
import API from '../api/api'

export default function Layout({ children }) {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('user')
    return savedUser ? JSON.parse(savedUser) : { name: 'User', email: '', streak: 1 }
  })

  useEffect(() => {
    API.get('user/me').then(res => {
      setUser(res.data)
      localStorage.setItem('user', JSON.stringify(res.data))
      localStorage.setItem('streak', res.data.streak)
    }).catch(err => console.log(err))
  }, [])

  useEffect(() => {
    const handleProfileUpdate = () => {
      try {
        const savedUser = localStorage.getItem('user')
        if (savedUser) setUser(JSON.parse(savedUser))
      } catch (error) {
        console.error('Could not refresh user profile in header:', error)
      }
    }
    window.addEventListener('profile-updated', handleProfileUpdate)
    return () => window.removeEventListener('profile-updated', handleProfileUpdate)
  }, [])

  return (
    <div className="min-h-screen bg-[#f5f3ee] dark:bg-[#0d0d0e] text-[#242320] dark:text-[#eeece6] transition-colors duration-300">
      <Sidebar streak={user?.streak || 1} />
      <div className="md:ml-[248px] min-h-screen flex flex-col">
        <div className="px-5 sm:px-8 lg:px-12 pt-7">
          <Header user={user} setUser={setUser} />
        </div>
        <main className="px-5 sm:px-8 lg:px-12 pb-12 pt-2 overflow-y-auto flex-1 custom-scrollbar">
          {children}
        </main>
      </div>
    </div>
  )
}
