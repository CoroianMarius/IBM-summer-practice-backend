const mongoose = require('mongoose')
const bcrypt = require('bcrypt')


const UserSchema = new mongoose.Schema({
    username: {type: String, required: true, unique: true},
    password: { type: String, required: true},
    role: {type: String, enum: ['admin', 'user'],},
})





UserSchema.pre('save', async function(next){
        if(!this.isModified('password')){
            return next()
        }
        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(this.password, salt)
        this.password = hashedPassword
        next()
})

UserSchema.methods.comparePassword = async function(password,cb){
    bcrypt.compare(password, this.password, (err, isMatch) => {
        if(err){
            return cb(err)
        } else {
            if(!isMatch){
                console.log('Password doesnt match')
                return cb(null, isMatch)
            }
            return cb(null, this)
        }
    })
}

const User = mongoose.model('User', UserSchema)

module.exports = User