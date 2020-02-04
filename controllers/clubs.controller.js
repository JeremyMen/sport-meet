const Club = require('../models/users/club.model')
const Base = require('../models/users/base.model')
const Court = require('../models/court.model')
const mongoose = require('mongoose');

const mailer = require('../config/mailer.config');


module.exports.new = (_, res) => {
  res.render('clubs/form', { 
    user: new Club,
    type: 'Club'
  })
}

module.exports.create = (req, res, next) => {
  // const photo = 
  // const imgName = req.file.originalname

  const user = new Club({
    name: req.body.name,
    address: req.body.address,
    city: req.body.city,
    email: req.body.email,
    password: req.body.password,
    openingTime: Number((req.body.openingTime).slice(0,2)),
    closingTime: Number((req.body.closingTime).slice(0,2)),
    photo: req.file ? req.file.url : undefined,
    imgName: req.file ? req.file.originalname : undefined
  })

  user.save()
    .then(user => {
      mailer.sendValidateEmailForClub(user)
      mailer.sendClubRequestToAdmin(user)
      req.session.genericSuccess = "An email has been sent"
      res.redirect('/login')
    })
    .catch(error => {
      if (error instanceof mongoose.Error.ValidationError) {
        res.render('clubs/form', { 
          user, 
          error: error.errors 
        })
      } else {
        next(error);
      }
    })
}

module.exports.validate = (req, res, next) => {
  Base.findOne({ activationToken: req.params.token })
    .then(user => {
      if (user) {
        mailer.validateClub(user)
        user.validated = true
        user.save()
          .then(() => {
            req.session.genericSuccess = "Your account has been validated!"
            res.redirect('/login')
          })
          .catch(next)
      } else {
        res.redirect('/')
      }
    })
    .catch(next)
}

module.exports.profile = (req, res, next) => {
  const name = req.params.name

  Club.findById(req.currentUser._id)
    .then(user => {
      if (user.name === name) {
        Court.find({club: user._id})
          .then(courts => {
            res.render('clubs/index', {
              user,
              courts
            })
          })
      } else {
        res.redirect(`/clubs/${user.name}`)
      }
    })
    .catch(error => next(error))
}

module.exports.edit = (req, res, next) => {
  const name = req.params.name

  const title = {
    firstWord: 'Edit',
    secondWord: 'Club'
  }
  Club.findById(req.currentUser._id)
    .then(user => {
      if (user.name === name) {
        res.render('clubs/form', {
          user,
          title
        })
      }
  })
}

module.exports.doEdit = (req, res, next) => {
  const { 
    address, 
    name, 
    password, 
    openingTime, 
    closingTime, 
    city } = req.body

  Club.findById(req.currentUser._id)
    .then(user => {
      Club.findByIdAndUpdate(
        user._id,
        {
          address: address ? address : user.address,
          name: name ? name : user.name,
          password: password ? password : user.password,
          photo: req.file ? req.file.url : user.photo,
          city: city ? city : user.city,
          imgName: req.file ? req.file.originalname : user.imgName,
          closingTime: closingTime ? closingTime : user.closingTime,
          openingTime: openingTime ? openingTime : user.openingTime
        },
        {new: true}
      )
      .then((user) => {
        //console.log(user)
        res.redirect(`/`)
      })
    })
}