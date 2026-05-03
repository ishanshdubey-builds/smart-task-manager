const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')
require('dotenv').config()

const app = express()

// ✅ 1. CORS Configuration MUST BE FIRST (before express.json)
const allowedOrigins = [
  "http://localhost:5173",
  "https://smart-task-manager-drab.vercel.app"
]

app.use(cors({
  origin: allowedOrigins,
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}))

// ✅ 2. Middleware
app.use(express.json())

// ✅ 3. Routes
app.use('/api/auth', require('./routes/authRoutes'))
app.use('/api/tasks', require('./routes/taskRoutes'))
app.use('/api/user', require('./routes/userRoutes'))

// Health check
app.get('/', (req, res) => {
  res.status(200).json({ status: 'API is running 🚀' })
})

// MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB Connected'))
  .catch(err => {
    console.error('❌ MongoDB Connection Error:', err)
    process.exit(1)
  })

// Port
const PORT = process.env.PORT || 5000
app.listen(PORT, () => {
  console.log(`🚀 Server listening on port ${PORT}`)
})