const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')
require('dotenv').config()

const app = express()

// ✅ 1. Middleware
app.use(express.json())

// ✅ 2. CORS Configuration (Proper for Production)
const allowedOrigins = [
  "http://localhost:5173",
  "https://smart-task-manager-drab.vercel.app"
]

app.use(cors({
  origin: function (origin, callback) {
    // allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true)
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true)
    } else {
      callback(new Error('Not allowed by CORS'))
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}))

// ✅ 3. Routes
app.use('/api/auth', require('./routes/authRoutes'))
app.use('/api/tasks', require('./routes/taskRoutes'))
app.use('/api/user', require('./routes/userRoutes'))

// ✅ 4. Health Check (No wildcard used here to avoid Express 5 PathError)
app.get('/', (req, res) => {
  res.status(200).json({ status: 'API is running 🚀', timestamp: new Date() })
})

// ✅ 5. MongoDB Connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB Connected'))
  .catch(err => {
    console.error('❌ MongoDB Connection Error:', err)
    process.exit(1)
  })

// ✅ 6. Start Server
const PORT = process.env.PORT || 5000
app.listen(PORT, () => {
  console.log(`🚀 Server listening on port ${PORT}`)
})