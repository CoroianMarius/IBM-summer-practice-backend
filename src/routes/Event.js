const express = require('express')
const Event = require('../models/Event')
const passport = require('passport')
const passportConfig = require('../passport')



const eventsRouter = express.Router()

{/*
$_$_$_$_$_$_$_$_$_$_$_$_$_$_$_$_$_$_$_$_$_$_$__DOAR ADMINUL POATE SA FACA CHESTIILE ASTEA :0__$_$_$_$_$_$_$_$_$_$_$_$_$_$_$_$_$_$_$_$_$_$_$_$_$_$_$_$_$_$_$_$_$_$_$_$_$_$_$_$_$_$_$_$_$_$_$_$_$_$_$_$_$_$_$_$_$_$_$_$_
dc citesti aici? <:*/}





//_________________________________________ADAUGA UN EVENIMENT(DOAR ADMIN POATE) ______________________________________________________________________________
eventsRouter.post('/', passport.authenticate('jwt', {session: false}), async(req,res) => {
    try{
        if(req.user.role !== 'admin') return res.status(403).json({message: {msgBody: "not an admin, can't create event", msgError: true}})

        const {title,date,location,description,tags} = req.body
        //nu este neaparat de pus taguri, poate adminul nu vrea sa creeze eveniment cu taguri
        if(!title || !date || !location || !description) return res.status(400).json({message: {msgBody: 'All fields required'},msgError: true})

        const eventExists = await Event.findOne({title})
        if(eventExists) res.status(400).json({message: {msgBody: 'An event with this name exists', msgError: true}})
        await Event.create({title,date,location,description,tags})
        res.status(201).json({message: {msgBody: 'Event successfully created', msgError: false}})
    }catch(err){
        console.log(err)
    }
})







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






//_______________________________________Afiseaza toate events la care userul apare in fieldul participants____________________________________________________________________________
eventsRouter.get('/upcoming', passport.authenticate('jwt',{session: false}) ,async(req,res) => {
    try{

        if(req.user.role === 'admin'){
            return res.status(403).json({message: {msgBody: "admin can't be a participant of an event",msgError: true}})
        }

        const events = await Event.find({participants: req.user.username})

        if(events.length === 0) return res.status(400).json({message: {msgBody: 'you are not participant of any event'},msgError: true})

        res.status(200).json({message: {msgBody: 'all events you are a participant',msgError: false},events})


    }catch(err){
        console.log(err)
    }
})


module.exports = eventsRouter