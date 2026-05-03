// Import required packages
const express = require('express')              // Express framework
const mongoose = require('mongoose')            // MongoDB connection
const cors = require('cors')                    // CORS middleware
require('dotenv').config()                      // Load .env variables

const app = express()

// Middleware
app.use(express.json()) // Parse JSON requests

// ✅ FIXED CORS (IMPORTANT)
app.use(cors({
  origin: [
    "http://localhost:5173", // local frontend
    "https://smart-task-manager-drub.vercel.app" // deployed frontend
  ],
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true
}))

// ✅ Optional: Handle preflight requests
app.options('*', cors())

// Import routes
const authRoutes = require('./routes/authRoutes')
const taskRoutes = require('./routes/taskRoutes')
const userRoutes = require('./routes/userRoutes')

// Use routes
app.use('/api/auth', authRoutes)
app.use('/api/tasks', taskRoutes)
app.use('/api/user', userRoutes)

// ✅ Health check route (VERY USEFUL)
app.get('/', (req, res) => {
  res.send('API is running 🚀')
})

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB Connected'))
  .catch(err => {
    console.error('❌ MongoDB Error:', err)
    process.exit(1)
  })

// ✅ Use dynamic port for Render
const PORT = process.env.PORT || 5000

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`)
})