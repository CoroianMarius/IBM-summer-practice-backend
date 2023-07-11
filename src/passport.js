const passport = require('passport')
const LocalStrategy = require('passport-local').Strategy
const User = require('./models/User')
const JWTStrategy = require('passport-jwt').Strategy

const cookieExtractor = req => {
    let token = null
    if(req && req.cookies){
        token = req.cookies['access_token']
    }
    return token
}
// authorization cu un jwt
passport.use(new JWTStrategy({
    jwtFromRequest: cookieExtractor,
    secretOrKey: 'secret'
}, async(payload, done) => {
    const user = await User.findById({_id: payload.sub})
    if(!user){
        return done(null, false)
    }
    return done(null, user)
}))

// authenticare cu un username si un password
passport.use(new LocalStrategy(async(username, password, done) => {
    const user = await User.findOne({username})
    if(!user){
        return done(null, false)
    }
    user.comparePassword(password,done)
}))


