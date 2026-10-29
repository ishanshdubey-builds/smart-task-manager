import { useState, useEffect, useRef } from 'react'
import API from '../api/api'

const MAX_FILE_SIZE = 5 * 1024 * 1024

function compressImage(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onerror = () => reject(new Error('Could not read this image. Please try another file.'))
    reader.onload = () => {
      const image = new Image()
      image.onerror = () => reject(new Error('This image could not be opened. Please choose a JPG, PNG, or WebP image.'))
      image.onload = () => {
        const maxDimension = 320
        const scale = Math.min(1, maxDimension / Math.max(image.width, image.height))
        const canvas = document.createElement('canvas')
        canvas.width = Math.max(1, Math.round(image.width * scale))
        canvas.height = Math.max(1, Math.round(image.height * scale))
        const context = canvas.getContext('2d')
        if (!context) return reject(new Error('Your browser could not process this image.'))
        context.drawImage(image, 0, 0, canvas.width, canvas.height)
        resolve(canvas.toDataURL('image/jpeg', 0.78))
      }
      image.src = reader.result
    }
    reader.readAsDataURL(file)
  })
}

export default function Profile() {
  const [profile, setProfile] = useState({ name: '', email: '', bio: '', avatar: '' })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [fileName, setFileName] = useState('')
  const fileInputRef = useRef(null)

  useEffect(() => {
    API.get('user/me')
      .then(res => {
        setProfile(res.data)
        setLoading(false)
      })
      .catch(err => {
        console.error(err)
        setMessage('Could not load your profile. Please refresh and try again.')
        setLoading(false)
      })
  }, [])

  const handleChange = (e) => {
    const { name, value } = e.target
    setProfile(current => ({ ...current, [name]: value }))
  }

  const handleAvatarUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setMessage('')
    setFileName('')
    if (!['image/jpeg', 'image/png', 'image/webp', 'image/gif'].includes(file.type)) {
      setMessage('Please choose a JPG, PNG, WebP, or GIF image.')
      e.target.value = ''
      return
    }
    if (file.size > MAX_FILE_SIZE) {
      setMessage('Please choose an image smaller than 5 MB.')
      e.target.value = ''
      return
    }
    try {
      const compressedImage = await compressImage(file)
      setProfile(current => ({ ...current, avatar: compressedImage }))
      setFileName(file.name)
      setMessage('Image ready. Click Save Profile to save your avatar.')
    } catch (error) {
      setMessage(error.message || 'Could not process this image.')
    }
    e.target.value = ''
  }

  const removeAvatar = () => {
    setProfile(current => ({ ...current, avatar: '' }))
    setFileName('')
    if (fileInputRef.current) fileInputRef.current.value = ''
    setMessage('Avatar removed. Click Save Profile to confirm.')
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
      setFileName('')
      // Keep the current session's cached user details in sync where possible.
      try {
        const cachedUser = JSON.parse(localStorage.getItem('user') || '{}')
        localStorage.setItem('user', JSON.stringify({ ...cachedUser, name: res.data.name, avatar: res.data.avatar, email: res.data.email }))
      } catch {
        // The profile has still been saved successfully on the server.
      }
      window.dispatchEvent(new Event('profile-updated'))
      setMessage('Profile updated successfully! 🎉')
    } catch (err) {
      console.error(err)
      setMessage(err.response?.data?.message || 'Error updating profile. Please try again.')
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
          <div className={`p-4 rounded-xl mb-6 font-medium ${message.includes('Error') || message.includes('Please') || message.includes('could not') || message.includes('Could not') ? 'bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400' : 'bg-green-50 text-green-600 dark:bg-green-500/10 dark:text-green-400'}`}>
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 mb-8">
            <div className="w-28 h-28 shrink-0 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center font-bold text-4xl text-white shadow-lg overflow-hidden border-4 border-white dark:border-gray-800">
              {profile.avatar ? (
                <img src={profile.avatar} alt="Profile avatar preview" className="w-full h-full object-cover" />
              ) : (
                profile.name?.charAt(0)?.toUpperCase() || '?'
              )}
            </div>
            <div className="flex-1 w-full">
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Profile Avatar</label>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/webp,image/gif"
                onChange={handleAvatarUpload}
                className="block w-full text-sm text-gray-600 dark:text-gray-300 file:mr-4 file:rounded-xl file:border-0 file:bg-purple-600 file:px-4 file:py-3 file:font-semibold file:text-white hover:file:bg-purple-700 file:cursor-pointer"
              />
              <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                Choose an image from your device (JPG, PNG, WebP, or GIF; up to 5 MB). It will be resized before saving.
              </p>
              {fileName && <p className="mt-1 text-xs text-purple-600 dark:text-purple-400">Selected: {fileName}</p>}
              {profile.avatar && (
                <button type="button" onClick={removeAvatar} className="mt-3 text-sm font-semibold text-red-500 hover:text-red-600">
                  Remove avatar
                </button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Full Name</label>
              <input type="text" name="name" value={profile.name || ''} onChange={handleChange} className="w-full p-3 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none transition-all dark:text-white" required />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Email Address</label>
              <input type="email" value={profile.email || ''} disabled className="w-full p-3 bg-gray-100 dark:bg-gray-900 border border-gray-200 dark:border-white/5 rounded-xl text-gray-500 cursor-not-allowed outline-none" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Bio / Motivation</label>
            <textarea name="bio" value={profile.bio || ''} onChange={handleChange} rows="4" placeholder="What motivates you to get things done?" className="w-full p-3 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none transition-all dark:text-white resize-none"></textarea>
          </div>

          <div className="flex justify-end pt-4">
            <button type="submit" disabled={saving} className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-8 rounded-xl shadow-lg transition-all disabled:opacity-70 disabled:cursor-not-allowed">
              {saving ? 'Saving...' : 'Save Profile'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
