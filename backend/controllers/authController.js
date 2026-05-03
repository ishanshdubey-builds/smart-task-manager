const User = require('../models/User')
const Task = require('../models/Task')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

//register user
exports.register = async (req, res) => {
    const {email, password} = req.body

    //hash password
    const hashedPassword = await bcrypt.hash(password, 10)

    //create user
    const user = await User.create({
        email,
        password: hashedPassword
    })
    res.json(user)
}

//login user
exports.login = async (req, res) => {
    const{email, password} = req.body
    
    //check if user exists
    const user = await User.findOne({ email })
    if (!user) return res.status(400).json({message: 'User not found'})
    
    //check password
const isMatch = await bcrypt.compare(password, user.password)
if (!isMatch) return res.status(400).json({message: 'Invalid credentials'})


// 🔥 NEW STREAK LOGIC (BASED ON ACTIVE DAYS)
const today = new Date().toISOString().split("T")[0];

if (!user.lastActiveDate) {
    // first time login
    user.streak = 1;
} else {
    const lastDate = new Date(user.lastActiveDate);
    const currentDate = new Date(today);

    const diffDays = Math.floor(
        (currentDate - lastDate) / (1000 * 60 * 60 * 24)
    );

    if (diffDays === 1) {
        // consecutive day
        user.streak += 1;
    } else if (diffDays > 1) {
        // streak broken
        user.streak = 1;
    }
    // if diffDays === 0 → same day → do nothing
}

user.lastActiveDate = today;
await user.save();
// 🔥 END


//create token
const token = jwt.sign({id: user._id}, process.env.JWT_SECRET)

// ✅ RETURN USER DATA ALSO
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

}