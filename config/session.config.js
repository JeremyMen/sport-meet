//package to generate sessions in Express
const session = require('express-session')

//to store session data inside our database
const MongoStore = require("connect-mongo")(session);

//UUIDs generator (Universally unique identifier)
//v4 => version 4
const uuid = require('uuid/v4')

const mongoose = require('mongoose')

require('dotenv').config()

//if "npm run dev", it will create an ID
let sessionSecret = (!process.env.SECRET_SESSION && process.env.NODE_ENV === 'dev') ?  uuid() : process.env.SECRET_SESSION

if (!sessionSecret) throw new Error('Env var SECRET_SESSION not found or invalid')

module.exports = session({
  secret: sessionSecret,
  resave: true,
  saveUninitialized: true,
  cookie: { 
    secure: process.env.SESSION_SECURE || false,
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000 // 1 day
  },
  store: new MongoStore({
    useUnifiedTopology: true,
    mongooseConnection: mongoose.connection,
    ttl: 24 * 60 * 60 // 1 day
  })
})