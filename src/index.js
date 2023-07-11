
const express = require('express')
const mongoose = require('mongoose')
const cookieParser = require('cookie-parser')
const userRouter = require('./routes/User')
const cors = require('cors')

const app = express()
app.use(cors({ origin: 'http://localhost:3000', credentials: true }))
app.use(cookieParser())
app.use(express.json())
app.use('/user',userRouter)


const connect_to_db_and_start_server = async () => {
    try {
        await mongoose.connect('mongodb+srv://vlad:vlad@cluster0.eltutwd.mongodb.net/bazaMea?retryWrites=true&w=majority')
        console.log('Connected to DB')
        app.listen(5000, () => console.log('Server is running on port 5000'))
    } catch (error){
        console.log(error)
    }
}

connect_to_db_and_start_server()





