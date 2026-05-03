const User = require('../models/User')
const Task = require('../models/Task')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

// Register user
exports.register = async (req, res) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' })
    }

    // Check if user already exists
    const existing = await User.findOne({ email })
    if (existing) {
      return res.status(400).json({ message: 'Email already registered' })
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Create user
    const user = await User.create({ email, password: hashedPassword })

    res.status(201).json({ message: 'User registered successfully' })
  } catch (err) {
    console.error('Register error:', err.message)
    res.status(500).json({ message: 'Server error during registration' })
  }
}

// Login user
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' })
    }

    // Check if user exists
    const user = await User.findOne({ email })
    if (!user) return res.status(400).json({ message: 'User not found' })

    // Check password
    const isMatch = await bcrypt.compare(password, user.password)
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' })

    // Streak logic (based on active days)
    const today = new Date().toISOString().split('T')[0]

    if (!user.lastActiveDate) {
      user.streak = 1
    } else {
      const lastDate = new Date(user.lastActiveDate)
      const currentDate = new Date(today)
      const diffDays = Math.floor((currentDate - lastDate) / (1000 * 60 * 60 * 24))

      if (diffDays === 1) {
        user.streak += 1
      } else if (diffDays > 1) {
        user.streak = 1
      }
      // if diffDays === 0 → same day → do nothing
    }

    user.lastActiveDate = today
    await user.save()

    // Create token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET)

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        streak: user.streak,
        avatar: user.avatar
      }
    })
  } catch (err) {
    console.error('Login error:', err.message)
    res.status(500).json({ message: 'Server error during login' })
  }
}