import axios from 'axios'

// Get raw URL from env
let rawBaseURL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

// Resiliency: Ensure the URL ends with /api if it's missing (common deployment mistake)
if (!rawBaseURL.includes('/api')) {
  rawBaseURL = rawBaseURL.endsWith('/') ? `${rawBaseURL}api` : `${rawBaseURL}/api`
}

// Ensure it ends with a trailing slash for relative pathing
const baseURL = rawBaseURL.endsWith('/') ? rawBaseURL : `${rawBaseURL}/`

const API = axios.create({
  baseURL: baseURL
})

// Add token to every request if it exists
API.interceptors.request.use((req) => {
  const token = localStorage.getItem('token')
  if (token) {
    req.headers.Authorization = token
  }
  return req
})

// Handle 401 errors globally
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