const mongoose = require('mongoose')

//Schema for user
const userSchema = new mongoose.Schema({
    name: {type: String, default: 'User'},
    email: String,
    password: String,
    bio: {type: String, default: ''},
    avatar: {type: String, default: ''},
    streak: {type: Number, default: 1},
    lastActiveDate: {type: String, default: null}
})

//export model
module.exports = mongoose.model('User', userSchema)