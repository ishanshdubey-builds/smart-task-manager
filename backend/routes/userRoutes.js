const express = require('express');
const router = express.Router();
const User = require('../models/User');
const auth = require('../middleware/authMiddleware');

// =======================
// 🔥 GET CURRENT USER PROFILE
// =======================
router.get('/me', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        if (!user) return res.status(404).json({ message: 'User not found' });

        // 🔥 UPDATE STREAK LOGIC
        const today = new Date().toISOString().split("T")[0];

        if (!user.lastActiveDate) {
            user.streak = 1;
        } else {
            const lastDate = new Date(user.lastActiveDate);
            const currentDate = new Date(today);
            const diffDays = Math.floor((currentDate - lastDate) / (1000 * 60 * 60 * 24));

            if (diffDays === 1) {
                user.streak += 1;
            } else if (diffDays > 1) {
                user.streak = 1;
            }
        }

        user.lastActiveDate = today;
        await user.save();

        res.json(user);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// =======================
// 🔥 UPDATE CURRENT USER PROFILE
// =======================
router.put('/update', auth, async (req, res) => {
    try {
        const { name, bio, avatar } = req.body;
        
        const user = await User.findByIdAndUpdate(
            req.user.id,
            { name, bio, avatar },
            { new: true, runValidators: true }
        ).select('-password');

        res.json(user);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
