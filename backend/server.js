const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')
require('dotenv').config()

const app = express()

// ✅ CORS FIRST — must be before express.json() and routes
app.use(cors({
  origin: [
    'http://localhost:5173',
    'https://smart-task-manager-drab.vercel.app'
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}))

// ✅ Body parser
app.use(express.json())

// ✅ Routes
app.use('/api/auth', require('./routes/authRoutes'))
app.use('/api/tasks', require('./routes/taskRoutes'))
app.use('/api/user', require('./routes/userRoutes'))

// ✅ Health check
app.get('/', (req, res) => {
  res.status(200).json({ status: 'API is running 🚀' })
})

// ✅ MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB Connected'))
  .catch(err => {
    console.error('❌ MongoDB Error:', err.message)
    process.exit(1)
  })

// ✅ Port — critical for Render
const PORT = process.env.PORT || 5000
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`)
})