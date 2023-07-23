const mongoose = require('mongoose')

const GroupSchema = new mongoose.Schema({
    name: {type: String, required: true,unique: [true, 'A group with this name exists'] },
    users: [String],
    notifications: [{
        title: String,
        date: Date,
    }],
})

const Group = mongoose.model('Group', GroupSchema)

module.exports = Group