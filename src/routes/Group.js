const groupRouter = require('express').Router();


const Group = require('../models/Group');
const passport = require('passport')


//_________________________________________IA TOATE GRUPURILE USERULUI (LOGAT) ______________________________________________________________________________
groupRouter.get('/', passport.authenticate('jwt', {session: false}), async(req,res) => {
    try{

        if(req.user.role === 'admin'){
            return res.status(403).json({message: {msgBody: "not an admin, can't get groups", msgError: true}})
        }

        const groups = await Group.find({users: req.user.username}).select('-_id').select('-users')
        res.status(200).json({groups})
    }catch(err){
        console.log(err)
    }
})


module.exports = groupRouter;