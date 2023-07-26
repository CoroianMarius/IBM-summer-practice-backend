const groupRouter = require('express').Router();


const Group = require('../models/Group');
const passport = require('passport')


//_________________________________________IA TOATE GRUPURILE USERULUI (LOGAT) ______________________________________________________________________________
groupRouter.get('/', passport.authenticate('jwt', {session: false}), async(req,res) => {
    try{

        if(req.user.role === 'admin'){
            return res.status(403).json({message: {msgBody: "not an admin, can't get groups", msgError: true}})
        }

        const groups = await Group.find({users: req.user.username}).select('-_id')
        res.status(200).json({groups})
    }catch(err){
        console.log(err)
    }
});


//_________________________________________IA TOATi USERII GRUPULUI (LOGAT) ______________________________________________________________________________
groupRouter.get('/:name', passport.authenticate('jwt', { session: false }), async (req, res) => {
    try {
      if (req.user.role !== 'admin' && req.user.role !== 'user') {
        return res.status(403).json({ message: { msgBody: "Not an admin, can't get groups", msgError: true } });
      }
  
      const groupName = req.params.name;
  
      const group = await Group.findOne({ name: groupName });
  
      if (!group) {
        return res.status(404).json({ message: { msgBody: 'Group not found', msgError: true } });
      }
  
      res.status(200).json({ users: group.users });
    } catch (err) {
      console.log(err);
      res.status(500).json({ message: { msgBody: 'Server error', msgError: true } });
    }
  });


// make the post route for creating a group and adding the user to it
//_________________________________________CREAZA UN GRUP NOU SI ADAUGA USERUL LOGAT IN EL______________________________________________________________________________

groupRouter.post('/', passport.authenticate('jwt', {session: false}), async(req,res) => {
    try{
        if(req.user.role === 'admin'){
            return res.status(403).json({message: {msgBody: "not an admin, can't create groups", msgError: true}})
        }

        let {name, users} = req.body;
        users = users.map(user => user.username)

        //            Adaugare notificare ca grupul a fost creat
        //              Ex: Admin1 created Group1q
        //            Sa se retina data curenta
        // const msg = "nume" + " created " + name
        // notifications = [{message: {msg}, date: "current date"}]

        //console.log(users);
        if(!name) return res.status(400).json({message: {msgBody: 'please provide a name for the group'},msgError: true})
        await Group.create({name, users});
    }catch(err){
        console.log(err)
    }
});



module.exports = groupRouter;