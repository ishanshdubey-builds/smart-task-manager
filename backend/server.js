const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')
require('dotenv').config()

const app = express()

// Middleware
app.use(express.json())

// ✅ CORS (FINAL)
app.use(cors({
  origin: [
    "http://localhost:5173",
    "https://smart-task-manager-drab.vercel.app"
  ],
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}))

// ✅ FIX PRE-FLIGHT REQUESTS
app.options('*', cors())

// Routes
app.use('/api/auth', require('./routes/authRoutes'))
app.use('/api/tasks', require('./routes/taskRoutes'))
app.use('/api/user', require('./routes/userRoutes'))

// Health check
app.get('/', (req, res) => {
  res.send('API is running 🚀')
})

// MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB Connected'))
  .catch(err => {
    console.error('❌ MongoDB Error:', err)
    process.exit(1)
  })

// Port (IMPORTANT for Render)
const PORT = process.env.PORT || 5000

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`)
})