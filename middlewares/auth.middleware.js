//check if current user is authenticated (session exists)
module.exports.isAuthenticated = (req, res, next) => {
  if (req.session.user) {
    next()
  } else {
    req.session.genericError = 'User is not authenticated!'
    res.redirect('/login')
  }
}

//check if current user is not authenticated (session doesn´t exist)
module.exports.isNotAuthenticated = (req, res, next) => {
  if (req.session.user) {
    res.redirect('/');
  } else {
    next()
  }
}

//check if current user is a Player
module.exports.isPlayer = (req, res, next) => {
  if (req.session.user.__type === "Player") {
    next()
  } else {
    req.session.genericError = 'User is not a player'
    res.redirect('/clubs/:username')
  }
}

//check if current user is a Club
module.exports.isClub = (req, res, next) => {
  if (req.session.user.__type === "Club") {
    next()
  } else {
    req.session.genericError = 'User is not a club'
    res.redirect('/players/:username')
  }
}