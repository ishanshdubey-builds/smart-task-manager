//import express(framework), mongoose(MongoDB),cors(allow frontend req)
const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')
require('dotenv').config()

const app = express()    
app.use(express.json())  
// app.use(cors())
app.use(cors({
  origin: "*"
}));

//import routes
const authRoutes = require('./routes/authRoutes')
const taskRoutes = require('./routes/taskRoutes')
const userRoutes = require('./routes/userRoutes')

//use routes
app.use('/api/auth', authRoutes)
app.use('/api/tasks', taskRoutes)
app.use('/api/user', userRoutes)

//connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
.then(() => console.log('MongoDB Connected'))
.catch(err => console.log(err))

//start server
app.listen(5000, () => console.log('Server started on port 5000'))