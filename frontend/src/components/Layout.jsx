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

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0B0F19] text-gray-900 dark:text-white transition-colors duration-300">
      <Sidebar streak={user?.streak || 1} />
      
      {/* Main Content Area */}
      <div className="ml-64 min-h-screen flex flex-col">
        <div className="p-6">
          <Header user={user} setUser={setUser} />
        </div>
        
        <main className="p-6 pt-0 overflow-y-auto flex-1 custom-scrollbar">
          {children}
        </main>
      </div>
    </div>
  )
}
