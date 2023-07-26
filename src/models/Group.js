const mongoose = require('mongoose')


const NotificationSchema = new mongoose.Schema({
    message: String,
    date: Date,
    _id: false
    
})

const GroupSchema = new mongoose.Schema({
    name: {type: String, required: true,unique: [true, 'A group with this name exists'] },
    users: [String],
    notifications: [NotificationSchema],
})

const Group = mongoose.model('Group', GroupSchema)

module.exports = Group