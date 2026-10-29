const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')
require('dotenv').config()

const app = express()

// Allow the deployed Vercel frontend and local development URLs.
// Set FRONTEND_URL in Render if the frontend domain changes.
const allowedOrigins = [
  'https://smart-task-manager-drab.vercel.app',
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  ...(process.env.FRONTEND_URL || '')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean),
]

app.use(cors({
  origin(origin, callback) {
    // Requests without an Origin header (health checks, curl, server-to-server)
    // are not browser CORS requests, so allow them.
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true)
    }
    return callback(new Error(`CORS blocked origin: ${origin}`))
  },
  methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: false,
  optionsSuccessStatus: 204,
}))

// Avatars are resized/compressed in the browser before being sent as data URLs.
app.use(express.json({ limit: '2mb' }))

app.use('/api/auth', require('./routes/authRoutes'))
app.use('/api/tasks', require('./routes/taskRoutes'))
app.use('/api/user', require('./routes/userRoutes'))

app.get('/', (req, res) => res.send('API running'))

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.error(err))

const PORT = process.env.PORT || 5000
app.listen(PORT, () => console.log(`Server running on port ${PORT}`))
