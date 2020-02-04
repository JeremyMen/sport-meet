//mongoDB and mongoose connections

//Node.js module. It is a MongoDB object modeling tool designed to work in an asynchronous environment
const mongoose = require('mongoose')
require('dotenv').config()

//mongoose connection
let mongodbConnection = (process.env.NODE_ENV === 'dev') ? 'mongodb://localhost:27017/SportMeet' : process.env.MONGODB_URI

mongoose.connect(mongodbConnection, { useNewUrlParser: true })
    .then(() => console.info(`Successfully connected to the database ${mongodbConnection}`))
    .catch(error => console.error(`An error ocurred trying to connect to de database ${mongodbConnection}`, error))

//when you received the event 'SIGINT' (SIGINT = CTRL+C),
// close the connection with mongoose (function - second param)
process.on('SIGINT', function () {
    mongoose.connection.close(function () {
        console.log('Mongoose disconnected on app termination')
        process.exit(0);
    })
})