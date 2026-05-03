// Import required packages
const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')
require('dotenv').config()

const app = express()

// ✅ Middleware
app.use(express.json())

// ✅ PROPER CORS
app.use(cors({
  origin: [
    "http://localhost:5173",
    "https://smart-task-manager-drab.vercel.app"
  ],
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"]
}))


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