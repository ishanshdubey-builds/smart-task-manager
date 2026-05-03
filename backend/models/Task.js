const mongoose = require('mongoose')

//Schema for task
const taskSchema = new mongoose.Schema({
    userId: String,
    title: String,
    completed: {
        type: Boolean,
        default: false
    },
    assignedTo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },

    type: {
        type: String,
        enum: ['personal','team'],
        default: 'personal'
    },
    dueDate: {
        type: String,
        default: null
    },
    isDateLocked: {
        type: Boolean,
        default: false
    }
}, {timestamps: true})// timeStamp

module.exports = mongoose.model('Task', taskSchema)