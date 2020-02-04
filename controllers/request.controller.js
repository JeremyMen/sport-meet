/* TODO:
    - new
    - create
*/

const Sport = require('../models/sport.model')
const Player = require('../models/users/player.model')
const Club = require('../models/users/club.model')  
const Court = require('../models/court.model')  
const Request = require('../models/request.model')
const Match = require('../models/match.model')

const mailer = require('../config/mailer.config');

function uniqueClubs(arr, field1) {
  let unique = arr.map(e => e[field1])
  for (i = 0; i < unique.length; i++) {
    for (j = i + 1; j < unique.length; j++) {
      if (unique[i]["_id"].equals(unique[j]["_id"])) {
        unique.splice(j, 1)
        j--
      } 
    }
  }
  return unique
}

module.exports.selectSport = (req, res, next) => {
  const user = req.session.user
  const username = req.params.username
  const title = {
    firstWord: 'New',
    secondWord: 'Request',
  }

  if (user.username === username) {
    Player.findOne({username: user.username})
    .populate('sports')
    .then(user => {
      if (user.sports.length === 0) {
        req.session.genericError = "You don't have any favourite sport yet. Add at least one sport"
        res.redirect(`/players/${username}/sports/new`)
      } else {
        const sports = user.sports
        res.render('requests/selectSport', {
          title,
          user,
          sports,
        })
      }
    })
  }
}

module.exports.new = (req, res, next) => {
  const user = req.session.user
  const username = req.params.username
  const selectedSportId = req.body.sport

  if (user.username === username) {
    Sport.findOne({_id: selectedSportId})
      .then(sportRequest => {
        const title = {
          firstWord: `${sportRequest.name}`,
          secondWord: 'Request',
        }
        if (!sportRequest) {
          req.session.genericError = "You must select a sport before."
          res.redirect(`/players/${username}/request/new`)
        } else {
            Court.find({sports: {$in: sportRequest._id}})
              .populate('club')
              .then(courts => {
                const clubs = uniqueClubs(courts, 'club')
                res.render('requests/new', {
                  title,
                  user,
                  sportRequest,
                  clubs,
                })
              })
          }
      })
  }
}

module.exports.addNewRequest = (req, res, next) => {
  const user = req.session.user
  const username = req.params.username
  const sportName = req.params.sport
  const selectedClubId = req.body.club
  const selectedDate = req.body.date
  const selectedStartTime = req.body.openingTime
  const selectedEndTime = Number(selectedStartTime) + 1
  const currentDate = new Date()
  const dateRequest = new Date(`${selectedDate}`)
  const startDateRequest = new Date(dateRequest.setHours(selectedStartTime))
  const endDateRequest = new Date(dateRequest.setHours(selectedEndTime))

  if (user.username === username) {
    Sport.findOne({name: sportName})
      .then(sportRequest => {
        const title = {
          firstWord: `${sportRequest.name}`,
          secondWord: 'Request',
        }

        Court.find({sports: {$in: sportRequest._id}})
        .populate('club')
        .then(courts => {
          const clubs = uniqueClubs(courts, 'club')
        //})

          Club.findOne({_id: selectedClubId})
            .then(clubRequest => {
              if (clubRequest.openingTime > selectedStartTime || clubRequest.closingTime < selectedEndTime) {
                res.locals.genericError = `${clubRequest.name} opens at ${clubRequest.openingTime}:00 and closes at ${clubRequest.closingTime}:00. Check your selected start and end times.`
                res.render('requests/new', {
                  title,
                  user,
                  sportRequest,
                  clubs,
                  clubRequest,
                  selectedDate,
                  selectedStartTime,
                  selectedEndTime
                })
              } else if (selectedStartTime > selectedEndTime) {
                res.locals.genericError = `Start time can´t be greater than end time. Check your selected start and end times.`
                res.render('requests/new', {
                  title,
                  user,
                  sportRequest,
                  clubs,
                  clubRequest,
                  selectedDate,
                  selectedStartTime,
                  selectedEndTime
                })
              } else if(startDateRequest < currentDate) {
                res.locals.genericError = `Sorry, we can´t travel to the past, your request is earlier than the current time. Check your selected start time and date.`
                res.render('requests/new', {
                  title,
                  user,
                  sportRequest,
                  clubs,
                  clubRequest,
                  selectedDate,
                  selectedStartTime,
                  selectedEndTime
                })
              } else {
              const request = new Request({
                player: user._id,
                sport: sportRequest._id,
                club: clubRequest._id,
                startDate: startDateRequest,
                endDate: endDateRequest
              })

              request.save()
                .then(() => {
                  Request.find({
                    active: true,
                    sport: sportRequest._id,
                    club: clubRequest._id,
                    startDate: startDateRequest,
                    endDate: endDateRequest
                    //level: 
                  }) 
                  .limit(sportRequest.numberOfPlayers)
                  .then(requestToMatch => {
                    if (requestToMatch.length === sportRequest.numberOfPlayers) {
                      const match = new Match({
                        sport: sportRequest._id,
                        club: clubRequest._id,
                        //court: clubRequest.courts[Math.floor(Math.random() * clubRequest.courts.length)],
                        startDate: startDateRequest,
                        endDate: endDateRequest,
                        confirmed: []
                      })

                      match.save()
                        .then(() => {
                          req.session.genericSuccess = `You have a ${sportRequest.name} match!`
                          res.redirect(`/players/${user.username}`)
                        })
                        .catch(error => next(error))

                      requestToMatch.map(request => {
                        Request.findByIdAndUpdate(
                          request._id,
                          { 
                            active: false
                          },
                          { new: true }
                        )
                          .populate('player')
                          .then((request) => {
                            match.players.push(request.player._id)
                            mailer.sendValidateMatchEmail(request.player, sportRequest, clubRequest, selectedDate, selectedStartTime, selectedStartTime)
                          })
                          .catch(error => next(error))
                      })

                    } else {
                      req.session.genericSuccess = `The ${sportRequest.name} request has been created. When we found a match we will send you an email.`
                      res.redirect(`/players/${user.username}`)
                    }
                  })
                })
              }
            })
            .catch(error => next(error))

        })//

    })
  }
}


//////// revisar hora al crear requests!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!1