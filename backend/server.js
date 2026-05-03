const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')
require('dotenv').config()

const app = express()

app.use(express.json())


app.use(cors({
  origin: [
    "http://localhost:5173",
    "https://smart-task-manager-drab.vercel.app"
  ],
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true
}))

// 🔥 THIS IS THE MOST IMPORTANT LINE
app.options("/*", cors())

app.use('/api/auth', require('./routes/authRoutes'))
app.use('/api/tasks', require('./routes/taskRoutes'))
app.use('/api/user', require('./routes/userRoutes'))

app.get('/', (req, res) => {
  res.send('API is running 🚀')
})

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.log(err))

const PORT = process.env.PORT || 5000

app.listen(PORT, () => console.log(`Server running on ${PORT}`))




// const express = require('express')
// const mongoose = require('mongoose')
// const cors = require('cors')
// require('dotenv').config()

// const app = express()

// // ✅ 1. JSON middleware
// app.use(express.json())

// // ✅ 2. CORS (PUT IT HERE)
// const allowedOrigins = [
//   "http://localhost:5173",
//   "https://smart-task-manager-drab.vercel.app"
// ]

// app.use(cors({
//   origin: "https://smart-task-manager-drab.vercel.app",
//   methods: ["GET", "POST", "PUT", "DELETE"],
//   allowedHeaders: ["Content-Type", "Authorization"]
// }))

// app.use((req, res, next) => {
//   res.header("Access-Control-Allow-Origin", "https://smart-task-manager-drab.vercel.app")
//   res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization")
//   res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
//   next()
// })

// // ✅ 3. ROUTES (AFTER CORS)
// app.use('/api/auth', require('./routes/authRoutes'))
// app.use('/api/tasks', require('./routes/taskRoutes'))
// app.use('/api/user', require('./routes/userRoutes'))

// // ✅ 4. HEALTH CHECK
// app.get('/', (req, res) => {
//   res.send('API is running 🚀')
// })

// // ✅ 5. DATABASE
// mongoose.connect(process.env.MONGO_URI)
//   .then(() => console.log('✅ MongoDB Connected'))
//   .catch(err => {
//     console.error(err)
//     process.exit(1)
//   })

// // ✅ 6. PORT (RENDER IMPORTANT)
// const PORT = process.env.PORT || 5000

// app.listen(PORT, () => {
//   console.log(`🚀 Server running on port ${PORT}`)
// })




// // const express = require('express')
// // const mongoose = require('mongoose')
// // const cors = require('cors')
// // require('dotenv').config()

// // const app = express()

// // // ✅ 1. CORS Configuration MUST BE FIRST (before express.json)
// // const allowedOrigins = [
// //   "http://localhost:5173",
// //   "https://smart-task-manager-drab.vercel.app"
// // ]

// // app.use(cors({
// //   origin: allowedOrigins,
// //   credentials: true,
// //   methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
// //   allowedHeaders: ["Content-Type", "Authorization"]
// // }))

// // // ✅ 2. Middleware
// // app.use(express.json())

// // // ✅ 3. Routes
// // app.use('/api/auth', require('./routes/authRoutes'))
// // app.use('/api/tasks', require('./routes/taskRoutes'))
// // app.use('/api/user', require('./routes/userRoutes'))

// // // Health check
// // app.get('/', (req, res) => {
// //   res.status(200).json({ status: 'API is running 🚀' })
// // })

// // // MongoDB
// // mongoose.connect(process.env.MONGO_URI)
// //   .then(() => console.log('✅ MongoDB Connected'))
// //   .catch(err => {
// //     console.error('❌ MongoDB Connection Error:', err)
// //     process.exit(1)
// //   })

// // // Port
// // const PORT = process.env.PORT || 5000
// // app.listen(PORT, () => {
// //   console.log(`🚀 Server listening on port ${PORT}`)
// // })