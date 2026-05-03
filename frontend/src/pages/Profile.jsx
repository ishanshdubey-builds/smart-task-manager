import { useState, useEffect } from 'react'
import API from '../api/api'

export default function Profile() {
  const [profile, setProfile] = useState({ name: '', email: '', bio: '', avatar: '' })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    API.get('user/me')
      .then(res => {
        setProfile(res.data)
        setLoading(false)
      })
      .catch(err => {
        console.error(err)
        setLoading(false)
      })
  }, [])

  const handleChange = (e) => {
    setProfile({ ...profile, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setMessage('')
    try {
      const res = await API.put('user/update', {
        name: profile.name,
        bio: profile.bio,
        avatar: profile.avatar
      })
      setProfile(res.data)
      setMessage('Profile updated successfully! 🎉')
    } catch (err) {
      setMessage('Error updating profile.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <div className="p-8 text-center text-gray-500">Loading profile...</div>
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white dark:bg-white/5 backdrop-blur-lg border border-gray-200 dark:border-white/10 rounded-3xl p-8 shadow-sm">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">User Profile</h2>
        
        {message && (
          <div className={`p-4 rounded-xl mb-6 font-medium ${message.includes('Error') ? 'bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400' : 'bg-green-50 text-green-600 dark:bg-green-500/10 dark:text-green-400'}`}>
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex items-center gap-6 mb-8">
            <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center font-bold text-3xl text-white shadow-lg overflow-hidden border-4 border-white dark:border-gray-800">
              {profile.avatar ? <img src={profile.avatar} alt="avatar" className="w-full h-full object-cover"/> : profile.name?.charAt(0)?.toUpperCase()}
            </div>
            <div className="flex-1">
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Avatar URL</label>
              <input 
                type="text" 
                name="avatar"
                value={profile.avatar || ''} 
                onChange={handleChange}
                placeholder="https://example.com/avatar.png"
                className="w-full p-3 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none transition-all dark:text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Full Name</label>
              <input 
                type="text" 
                name="name"
                value={profile.name || ''} 
                onChange={handleChange}
                className="w-full p-3 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none transition-all dark:text-white"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Email Address</label>
              <input 
                type="email" 
                value={profile.email || ''} 
                disabled
                className="w-full p-3 bg-gray-100 dark:bg-gray-900 border border-gray-200 dark:border-white/5 rounded-xl text-gray-500 cursor-not-allowed outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Bio / Motivation</label>
            <textarea 
              name="bio"
              value={profile.bio || ''} 
              onChange={handleChange}
              rows="4"
              placeholder="What motivates you to get things done?"
              className="w-full p-3 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none transition-all dark:text-white resize-none"
            ></textarea>
          </div>

          <div className="flex justify-end pt-4">
            <button 
              type="submit" 
              disabled={saving}
              className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-8 rounded-xl shadow-lg transition-all disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {saving ? 'Saving...' : 'Save Profile'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
