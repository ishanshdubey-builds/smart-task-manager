import axios from 'axios'

// Use the current deployed Render API directly to avoid a stale Vercel
// VITE_API_URL value continuing to point at the retired backend.
const baseURL = 'https://smart-task-manager-backend-rn4t.onrender.com/api/'

const API = axios.create({
  baseURL,
})

// Add token to every request if it exists.
API.interceptors.request.use((req) => {
  const token = localStorage.getItem('token')
  if (token) {
    req.headers.Authorization = token
  }
  return req
})

// Handle 401 errors globally.
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.clear()
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default API
