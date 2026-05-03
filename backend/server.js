// Import required packages
const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')
require('dotenv').config()

const app = express()

// ✅ Middleware
app.use(express.json())

// ✅ PROPER CORS (FINAL FIX)
const allowedOrigins = [
  "http://localhost:5173",
  "https://smart-task-manager-drab.vercel.app"
]

app.use(cors({
  origin: function (origin, callback) {
    // allow requests with no origin (like Postman)
    if (!origin) return callback(null, true)

    if (allowedOrigins.includes(origin)) {
      callback(null, true)
    } else {
      callback(new Error("Not allowed by CORS"))
    }
  },
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true
}))

// ✅ VERY IMPORTANT (fix preflight issues)
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", req.headers.origin)
  res.header("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS")
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization")
  res.header("Access-Control-Allow-Credentials", "true")

  if (req.method === "OPTIONS") {
    return res.sendStatus(200)
  }
  next()
})

// Routes
const authRoutes = require('./routes/authRoutes')
const taskRoutes = require('./routes/taskRoutes')
const userRoutes = require('./routes/userRoutes')

app.use('/api/auth', authRoutes)
app.use('/api/tasks', taskRoutes)
app.use('/api/user', userRoutes)

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

// Port
const PORT = process.env.PORT || 5000

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`)
})