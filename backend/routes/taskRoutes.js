// import express
const express = require('express')
const router = express.Router()

// import model and middleware
const Task = require('../models/Task')
const User = require('../models/User')
const auth = require('../middleware/authMiddleware')


// =======================
// 🔥 GET ALL TASKS (PERSONAL + TEAM)
// =======================
router.get('/', auth, async (req, res) => {
    try {
        const tasks = await Task.find({
            $or: [
                { userId: req.user.id },        // personal tasks
                { assignedTo: req.user.id }     // team tasks
            ]
        }).populate('assignedTo', 'email').sort({ createdAt: -1 })

        res.json(tasks)
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
})

// =======================
// 🔥 GET TASKS BY DATE
// =======================
router.get('/by-date', auth, async (req, res) => {
    try {
        const { date } = req.query;
        if (!date) return res.status(400).json({ message: 'Date query parameter is required (YYYY-MM-DD)' });

        const startOfDay = new Date(date);
        startOfDay.setUTCHours(0, 0, 0, 0);
        
        const endOfDay = new Date(date);
        endOfDay.setUTCHours(23, 59, 59, 999);

        const tasks = await Task.find({
            $or: [
                { userId: req.user.id },
                { assignedTo: req.user.id }
            ],
            dueDate: {
                $gte: startOfDay,
                $lte: endOfDay
            }
        }).populate('assignedTo', 'email').sort({ createdAt: -1 });

        res.json(tasks);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
})


// =======================
// 🔥 CREATE TASK
// =======================
router.post('/', auth, async (req, res) => {
    try {
        let assignedToId = req.body.assignedTo || null;
        
        if (req.body.assignedToEmail) {
            const user = await User.findOne({ email: req.body.assignedToEmail });
            if (!user) {
                return res.status(404).json({ message: 'User not found with that email' });
            }
            assignedToId = user._id;
        }

        let finalDueDate;
        if (req.body.dueDate) {
            finalDueDate = req.body.dueDate; // Use directly if it's already YYYY-MM-DD
        } else {
            finalDueDate = new Date().toLocaleDateString('en-CA');
        }

        const task = await Task.create({
            userId: req.user.id,
            title: req.body.title,

            // 👇 NEW FEATURES
            assignedTo: assignedToId,
            type: req.body.type || 'personal',
            dueDate: finalDueDate,
            isDateLocked: true
        })

        // Populate so it can be returned fully to the frontend
        await task.populate('assignedTo', 'email');

        res.json(task)
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
})


// =======================
// 🔥 UPDATE TASK
// =======================
router.put('/:id', auth, async (req, res) => {
    try {
        const updateData = { ...req.body };
        
        // Normalize date storage if it's being updated
        if (updateData.dueDate) {
            const normalizedDate = new Date(updateData.dueDate);
            updateData.dueDate = normalizedDate.toLocaleDateString('en-CA');
        }

        const task = await Task.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true }
        )

        res.json(task)
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
})


// =======================
// 🔥 DELETE TASK
// =======================
router.delete('/:id', auth, async (req, res) => {
    try {
        await Task.findByIdAndDelete(req.params.id)
        res.json({ message: 'Deleted' })
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
})


// =======================
// 📊 STATS (DAILY / WEEKLY / MONTHLY)
// =======================
router.get('/stats', auth, async (req, res) => {
    try {
        const today = new Date()

        const startOfDay = new Date()
        startOfDay.setHours(0, 0, 0, 0)

        const startOfWeek = new Date()
        startOfWeek.setDate(today.getDate() - 7)

        const startOfMonth = new Date()
        startOfMonth.setDate(1)

        const daily = await Task.countDocuments({
            userId: req.user.id,
            createdAt: { $gte: startOfDay }
        })

        const weekly = await Task.countDocuments({
            userId: req.user.id,
            createdAt: { $gte: startOfWeek }
        })

        const monthly = await Task.countDocuments({
            userId: req.user.id,
            createdAt: { $gte: startOfMonth }
        })

        const completed = await Task.countDocuments({
            userId: req.user.id,
            completed: true
        })

        res.json({
            daily,
            weekly,
            monthly,
            completed
        })

    } catch (err) {
        res.status(500).json({ message: err.message })
    }
})


// =======================
// 🚀 PRODUCTIVITY SCORE
// =======================
router.get('/productivity', auth, async (req, res) => {
    try {
        const total = await Task.countDocuments({
            userId: req.user.id
        })

        const completed = await Task.countDocuments({
            userId: req.user.id,
            completed: true
        })

        const productivity = total === 0 ? 0 : (completed / total) * 100

        res.json({ productivity })

    } catch (err) {
        res.status(500).json({ message: err.message })
    }
})


// export router
module.exports = router