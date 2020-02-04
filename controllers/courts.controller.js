const createError = require('http-errors');
const Court = require('../models/court.model')
const Club = require('../models/users/club.model')
const Sport = require('../models/sport.model')

module.exports.new = (req, res, next) => {  
  const user = req.session.user
  const title = {
    firstWord: 'Add',
    secondWord: 'Court',
  }
  Club.findById(user._id)
    .then(user => {
      if (user.name === req.params.name) {
        Sport.find({})
          .then(sports => {
            res.render('courts/form', {
              title,
              user,
              sports
            })
          })
      } else {
        //console.log('Club not found')
      }
    })
}

module.exports.add = (req, res, next) => {

  const user = req.session.user
  const { courtName, sport, indoorOrOutdoor } = req.body

  Club.findById(user._id)
    .then(user => {
      if(!courtName){
        res.redirect(`/clubs/${user.name}/courts/new`)
      } else {
        const court = new Court({
          club: user._id,
          name: courtName,
          sports: sport,
          indoorOrOutdoor: indoorOrOutdoor
        })
        //console.log(court)
        court.save()
          .then(court => {
            req.session.genericSuccess = `${court.name} has been added to your club!`
            res.redirect(`/clubs/${user.name}/courts/new`)
          })
      }
    })
  
}

module.exports.chooseCourtTodelete = (req, res, next) => {
  const user = req.session.user
  const title = {
    firstWord: 'Delete',
    secondWord: 'Court',
  }
  Court.find({club: user._id})
    .populate('sports')
    .then(courtsOfCurrentClub => {
      const sports = courtsOfCurrentClub.map(sports => sports)
      res.render('courts/form', {
        title,
        sports,
        user,
        court: "delete"
      })
    })
}

module.exports.delete = (req, res, next) => {
  const { params } = req
  const { user } = req.session

  //console.log(params)
  //console.log(user)

  Court.deleteOne({_id: params.courtId})
    .then(response => {
      console.log(response)
      return res.send('ok')
    })
    .catch(error => {
      return res.send('ok')
    })
}
