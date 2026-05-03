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
      await API.post('/api/auth/register', formData)
      navigate('/login')
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0B0F19] flex items-center justify-center p-4 transition-colors">
      <div className="w-full max-w-md bg-white dark:bg-white/5 backdrop-blur-xl border border-gray-200 dark:border-white/10 p-8 rounded-3xl shadow-xl dark:shadow-[0_0_40px_rgba(139,92,246,0.1)]">
        
        <div className="flex justify-center mb-6">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center shadow-lg">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
          </div>
        </div>

        <h2 className="text-3xl font-extrabold text-center mb-2 text-gray-900 dark:text-white tracking-tight">Join Workspace</h2>
        <p className="text-center text-gray-500 dark:text-gray-400 mb-8 font-medium">Create an account to get started.</p>
        
        {error && <div className="bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400 p-3 rounded-xl mb-6 text-sm font-semibold text-center border border-red-100 dark:border-red-500/20">{error}</div>}
        
        <form onSubmit={handleRegister} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Email Address</label>
            <input 
              type="email" 
              className="w-full p-3.5 bg-gray-50 dark:bg-[#111827] border border-gray-200 dark:border-white/10 rounded-xl text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 outline-none transition-all placeholder-gray-400"
              placeholder="you@example.com"
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              required 
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Password</label>
            <input 
              type="password" 
              className="w-full p-3.5 bg-gray-50 dark:bg-[#111827] border border-gray-200 dark:border-white/10 rounded-xl text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 outline-none transition-all placeholder-gray-400"
              placeholder="••••••••"
              onChange={(e) => setFormData({...formData, password: e.target.value})}
              required 
            />
          </div>
          <button className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white p-3.5 rounded-xl font-bold text-lg shadow-lg dark:shadow-[0_0_20px_rgba(139,92,246,0.3)] transition-all transform hover:-translate-y-0.5">
            Create Account
          </button>
        </form>

        <p className="mt-8 text-center text-gray-500 dark:text-gray-400 font-medium">
          Already have an account? <Link to="/login" className="text-purple-600 dark:text-purple-400 hover:text-purple-500 underline decoration-2 underline-offset-4">Sign in</Link>
        </p>
      </div>
    </div>
  )
}