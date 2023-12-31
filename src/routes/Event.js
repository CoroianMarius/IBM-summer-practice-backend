const express = require('express')
const Event = require('../models/Event')
const passport = require('passport')
const passportConfig = require('../passport')
const Group = require('../models/Group')
const User = require('../models/User')
const sgMail = require('@sendgrid/mail')


const eventsRouter = express.Router()

{/*
$_$_$_$_$_$_$_$_$_$_$_$_$_$_$_$_$_$_$_$_$_$_$__DOAR ADMINUL POATE SA FACA CHESTIILE ASTEA :0__$_$_$_$_$_$_$_$_$_$_$_$_$_$_$_$_$_$_$_$_$_$_$_$_$_$_$_$_$_$_$_$_$_$_$_$_$_$_$_$_$_$_$_$_$_$_$_$_$_$_$_$_$_$_$_$_$_$_$_$_
dc citesti aici? <:*/}




async function getGroupUsers(group){
    const groups = await Group.findById({id: group._id})
    const groupUsers = []
    groups.forEach(group => {
        groupUsers.push(...group.users)
    })
    console.log(groupUsers)
    return groupUsers
}

//_________________________________________ADAUGA UN EVENIMENT(DOAR ADMIN POATE) ______________________________________________________________________________
eventsRouter.post('/', passport.authenticate('jwt', { session: false }), async (req, res) => {
    try {
      const { title, date, location, description, tags, invites } = req.body;
      console.log(req.body);
  
      // Check if all required fields are provided
      if (!title || !date || !location || !description) {
        return res.status(400).json({ message: { msgBody: 'All fields required' }, msgError: true });
      }
  
      const eventExists = await Event.findOne({ title });
      if (eventExists) {
        return res.status(400).json({ message: { msgBody: 'An event with this name exists', msgError: true } });
      }
  
      await Event.create({ title, date, location, description, tags, invites});
      res.status(201).json({ message: { msgBody: 'Event successfully created', msgError: false } });
    } catch (err) {
      console.log(err);
    }
  });
  







//_________________________________________EDITEAZA UN EVENIMENT(DOAR ADMINUL POATE) ______________________________________________________________________________
eventsRouter.put('/:id', passport.authenticate('jwt',{session: false}),async(req,res) => {
    try{
        if(req.user.role !== 'admin') return res.status(403).json({message: {msgBody: "not an admin, can't edit event", msgError: true}})
        const {id} = req.params

        const {title,date,location,description,tags} = req.body
        const updatedEvent = await Event.findByIdAndUpdate(id,{
            title,
            date,
            location,
            description,
            tags,
        },{new: true}) 

        res.status(200).json({message: {msgBody: 'Event successfully updated',event: updatedEvent,msgError: false}})

    }catch(err){
        console.log(err)
    }
})







//_________________________________________STERGE UN EVENIMENT(DOAR ADMINUL POATE) ______________________________________________________________________________
eventsRouter.delete('/:id', passport.authenticate('jwt',{session: false}),async(req,res) => {
    try{
        if(req.user.role !=='admin') return res.status(403).json({message: {msgBoddy: "not an admin, can't delete event "}})

        const {id} = req.params
        const exists = await Event.findById(id)
        if(!exists) return res.status(403).json({message: {msgBody: "no event with this id", msgError: true}})

        await Event.findByIdAndDelete(id)
        
        res.status(200).json({message: {msgBody: 'event deleted successfully'}, msgError: false})

    }catch(err){
        console.log(err)
    }
})








//_________________________________________STERGE TOATE EVENIMENTELE(DOAR ADMINUL POATE) ______________________________________________________________________________
eventsRouter.delete('/', passport.authenticate('jwt',{session: false}),async(req,res) => {
    try{
        if(req.user.role !== 'admin') return res.status(403).json({message: "not an admin, can't delete all events", msgError: true})
        //pentru ca doar adminul poate sa creeze evenimente si ESTE UN SINGUR ADMIN , nu trebuie sa ne complicam cu findById(req.user)
        const events = await Event.find({})
        if(events.length === 0){
            return res.status(400).json({message: {msgBody: "you don't have any events to delete"},msgError: true})
        }
        await Event.find({}).deleteMany({})

        res.status(200).json({message: {msgBody: 'all events have been deleted',msgError: false}})

    }catch(err){
        console.log(err)
    }
})




//_______________________________________Afiseaza eventurile care nu au useri in fieldu-rile  [invites / participants]______________________________________________________________________________
eventsRouter.get('/discover', async(req,res) => {

    const events = await Event.find({$and: [{invites: {$size: 0}},{participants: {$size: 0}}]})

    if(events.length === 0) return res.status(400).json({message: {msgBody: 'no events to discover'},msgError: true})

    res.status(200).json({message: {msgBody: 'events discovered',msgError: false},events})
    

})


//_______________________________________Afiseaza toti useri care nu apar la invites / participants ______________________________________________________________________________
eventsRouter.get('/users/:id', async(req,res) => {

    const event = await Event.findById(req.params.id)

    const users = await User.find({
        name: { $nin: [...event.invites, ...event.participants] },
      });

    if(users.length === 0) return res.status(400).json({message: {msgBody: 'no users found'},msgError: true})

    res.status(200).json({message: {msgBody: 'events discovered',msgError: false},users})
    

})





//_______________________________________Afiseaza toate events la care userul apare in fieldul participants____________________________________________________________________________
eventsRouter.get('/upcoming', passport.authenticate('jwt',{session: false}) ,async(req,res) => {
    try{


        const events = await Event.find({participants: req.user.username})
        if(events.length === 0) return res.status(400).json({message: {msgBody: 'you are not participant of any event'},msgError: true}, events)

        res.status(200).json({message: {msgBody: 'all events you are a participant',msgError: false},events})


    }catch(err){
        console.log(err)
    }
});







//_____________________________________________ Move the user from invites to participants_______________________________________________________________________________________
eventsRouter.put('/upcoming/:id', passport.authenticate('jwt',{session: false}), async(req,res) => {
    try{
        const {id} = req.params;
        const event = await Event.findById(id);
        if(!event) return res.status(400).json({message: {msgBody: 'no event with this id'},msgError: true});

        const user = req.user.username;
        const invites = event.invites;
        // if(!invites.includes(user)) return res.status(400).json({message: {msgBody: 'you are not invited to this event'},msgError: true});

        const participants = event.participants;
        if(participants.includes(user)) return res.status(400).json({message: {msgBody: 'you are already a participant of this event'},msgError: true});

        const updatedEvent = await Event.findByIdAndUpdate(id,{
            $pull: {invites: user},
            $push: {participants: user}
        },{new: true});

        res.status(200).json({message: {msgBody: 'you are now a participant of this event',msgError: false},event: updatedEvent});

    }catch(err){
        console.log(err);
    }
});

//_____________________________________________ Remove the user from participants_______________________________________________________________________________________
eventsRouter.put('/remove/:id', passport.authenticate('jwt',{session: false}), async(req,res) => {
    try{
        const {id} = req.params;
        const event = await Event.findById(id);
        if(!event) return res.status(400).json({message: {msgBody: 'no event with this id'},msgError: true});

        const user = req.user.username;
        console.log(user)
        const participant = event.participants;
        if(!participant.includes(user)) return res.status(400).json({message: {msgBody: 'you are not a participant to this event'},msgError: true});

        const updatedEvent = await Event.findByIdAndUpdate(id,{
            $pull: {participants: user}
        },{new: true});

        res.status(200).json({message: {msgBody: 'you left the event',msgError: false},event: updatedEvent});

    }catch(err){
        console.log(err);
    }
});





//______________________________________________toate events la care userul apare in fieldul invites______________________________________________
eventsRouter.get('/invites', passport.authenticate('jwt',{session: false}) ,async(req,res) => {
    try{
        
        const events = await Event.find({invites: req.user.username})

        if(events.length === 0) return res.status(400).json({message: {msgBody: 'you are not invited to any event'},msgError: true})

        res.status(200).json({message: {msgBody: 'all events you are invited to',msgError: false},events})

    }catch(err){
        console.log(err)
    }
})






//______________________________________________get all events_______________________________________________________________________________________
eventsRouter.get('/', passport.authenticate('jwt',{session: false}), async(req,res) => {
    try{

        if(req.user.role === 'admin' || req.user.role === 'user'){
            const events = await Event.find({})
    
            if(events.length === 0) return res.status(400).json({message: {msgBody: 'no events to get'},msgError: true})
    
            return res.status(200).json({message: {msgBody: 'all events',msgError: false},events})
        }

        return res.status(403).json({message: {msgBody: "not an admin or user, can't get events",msgError: true}})

    }catch(err){
        console.log(err)
    }
})


//_________________________________________ SEND INVITES ______________________________________________________________________________
eventsRouter.post('/invites', passport.authenticate('jwt', { session: false }), async (req, res) => {
    try {
      const { event, users } = req.body;
  
      const invites = users.filter(user => !event.invites.includes(user) && !event.participants.includes(user));

      // Add all the users from invites to the invites array inside the event
      event.invites.push(...invites);
  
      // Update the event in the database
      await Event.findByIdAndUpdate(event._id, { invites: event.invites });


      console.log(event.invites);

    
    
      const nodemailer = require("nodemailer");
    const sgTransport = require("nodemailer-sendgrid-transport");

    const options = {
    auth: {
        api_key: "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",
    },
    };

    const transporter = nodemailer.createTransport(sgTransport(options));

    for (let i = 0; i < invites.length; i++) {
        
        const emailMessage = {
            to: invites[i],
            from: "eventplanneremailsender13245@aol.com",
            subject: `New invite`,
            text: `You have been invited to: ${event.title}`,
            };
        
            try {
            await transporter.sendMail(emailMessage);
            console.log(emailMessage);
            console.log("Email sent successfully.");
            } catch (err) {
            console.error(`Failed to send email to ${invites[i]}`, err);
            }

    }




  
      res.status(201).json({ message: { msgBody: 'Event successfully created', msgError: false } });
    } catch (err) {
      console.log(err);
    }
  });






module.exports = eventsRouter