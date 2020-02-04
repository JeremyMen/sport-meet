const Player = require('../models/users/player.model')
const Sport = require('../models/sport.model')
const mongoose = require('mongoose');
const mailer = require('../config/mailer.config');

module.exports.new = (_, res) => {

  Sport.find()
    //it returns an array of sports
    .then(sports => {
      const data = {
        sports,
        user: new Player()
      }
      res.render('players/form', data)
    })
    .catch(error => next(error))
}

module.exports.create = (req, res, next) => {
  
  const user = new Player({
    name: req.body.name,
    surname: req.body.surname,
    username: req.body.username,
    email: req.body.email,
    password: req.body.password,
    photo: req.file ? req.file.url : undefined,
    imgName: req.file ? req.file.originalname : undefined
  })

  console.log(req.file)

  user.save()
    .then(user => {
      mailer.sendValidateEmail(user)
      req.session.genericSuccess = "A validation email has been sent"
      res.redirect('/login')
    })
    .catch(error => {
      if (error instanceof mongoose.Error.ValidationError) {
        // console.log(error.errors)
        res.render('players/form', { 
          user, 
          error: error.errors 
        })
      } else {
        next(error)
      }
    })
  }  

module.exports.validate = (req, res, next) => {
  Player.findOne({ activationToken: req.params.token })
    .then(user => {
      if (user) {
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
  const username = req.params.username

  Player.findById(req.currentUser._id)
  .populate('sports')
   .then(user => {
     if (user.username === username) {
       //console.log(typeof user._id)
       user._id = user._id.toString()
       //console.log(user)
       res.render('players/index', {user})
     } else {
       res.redirect(`/players/${user.username}`)
     }
   })
}

module.exports.edit = (req, res, next) => {
  const title = {
    firstWord: 'Edit',
    secondWord: 'Profile'
  }
  const username = req.params.username
  Player.findById(req.currentUser._id)
    .then(user => {
      if (user.username === username) {
        res.render('players/form', {
          user,
          title
        })
      }
  })
}

module.exports.doEdit = (req, res, next) => {
  const username = req.params.username

  const { name, surname, password } = req.body

  Player.findById(req.currentUser._id)
    .then(user => {
      Player.findByIdAndUpdate(
        user._id,
        {
          name: name ? name : user.name,
          surname: surname ? surname : user.surname,
          username: user.username,
          email: user.email,
          password: password ? password : user.password,
          photo: req.file ? req.file.url : user.photo,
          imgName: req.file ? req.file.originalname : user.imgName
        },
        {new: true}
      )
      .then((user) => {
        res.redirect(`/`)
      })
    })
}

module.exports.newSport = (req, res, next) => {
  const user = req.session.user
  const username = req.params.username
  const title = {
    firstWord: 'Handle',
    secondWord: 'Sports'
  }

  if (user.username === username && user.__type === 'Player') {

    Sport.find()
      .then(sports => {
        res.render('sports/new', {
          user,
          sports,
          title
        })
      })
      .catch(error => next(error))
  }
}

module.exports.addNewSport = (req, res, next) => {
  const user = req.session.user

  Player.findById(req.currentUser._id)
    .then(user => {
      if (!user.sports.includes(req.body.sport)){
        Player.findByIdAndUpdate(
          user._id,
          {
            $push: { sports: req.body.sport }
          },
          {new: true}
        )
        .populate('sports')
        .then((user) => {
          const addedSport = user.sports.reduce((_, sport) => {
            if (sport.id === req.body.sport) {
              return sport.name
            }
          }, '')
          req.session.genericSuccess = `'${addedSport}' has been added on your list!`
          res.redirect(`/players/${user.username}/sports/new`)
        })
        .catch(error => next(error))
      } else {
        Player.findOne({username: user.username})
        .populate('sports')
        .then(user => {
          const allSports = user.sports.map(sports => {
            return sports.name
          })
          req.session.genericError = `This sport is already on your list.
            Your favorite sports are: ${allSports}`
          res.redirect(`/players/${user.username}/sports/new`)
        })
        .catch(error => next(error))
      }
    })
}

module.exports.delete = (req, res, next) => {
  const { params } = req
  const { user } = req.session

  Player.updateOne({
    _id: user._id
  }, {
    $pull: { 'sports' : params.sportId}
  }
  )
  .then(response => {
    console.log(response)
    return res.send('ok')
  })
  .catch(err => {
    console.log(err)
    return res.send('ok')
  })
}