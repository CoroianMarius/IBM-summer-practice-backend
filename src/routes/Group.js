const groupRouter = require('express').Router();


const Group = require('../models/Group');
const passport = require('passport')


//_________________________________________IA TOATE GRUPURILE USERULUI (LOGAT) ______________________________________________________________________________
groupRouter.get('/', passport.authenticate('jwt', {session: false}), async(req,res) => {
    try{
        const groups = await Group.find({users: req.user.username}).select('-_id')
        res.status(200).json({groups})
    }catch(err){
        console.log(err)
    }
});


groupRouter.get('/all', passport.authenticate('jwt', {session: false}), async(req,res) => {
  try{
      const groups = await Group.find()
      res.status(200).json({groups})
  }catch(err){
      console.log(err)
  }
});




//_________________________________________IA TOATE GRUPURILE USERULUI (LOGAT) ______________________________________________________________________________
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

groupRouter.post('/', passport.authenticate('jwt', { session: false }), async (req, res) => {
  try {
    if (req.user.role === 'admin') {
      return res.status(403).json({ message: { msgBody: "not an admin, can't create groups", msgError: true } });
    }

    const { name, users } = req.body;
    const userIds = users.map(user => user.username);

    // Check if a group with the same name already exists
    const existingGroup = await Group.findOne({ name });
    if (existingGroup) {
      return res.status(400).json({ message: { msgBody: 'A group with the same name already exists', msgError: true } });
    }

    // Create the new group
    

    // Create a notification for the group creation
    const msg = `${req.user.username} created ${name}`;
    const notification = { message:  msg , date: new Date() };
    const newGroup = await Group.create({ name, users: userIds, notifications: [notification] });
    //const newGroup = { name, users: userIds, notifications: [notification] };
    console.log(newGroup);

    // Add the notification to the user's notifications array

    res.status(201).json({ message: { msgBody: 'Group created successfully', msgError: false }, group: newGroup });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: { msgBody: 'Something went wrong', msgError: true } });
  }
});



module.exports = groupRouter;