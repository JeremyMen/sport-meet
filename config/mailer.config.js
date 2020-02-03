const nodemailer = require('nodemailer');

const APP_HOST = (process.env.NODE_ENV === 'devMailer') ? 'http://localhost:3000' : process.env.APP_HOST

const user = process.env.MAIL_USER
const pass = process.env.MAIL_PASS

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: { user, pass }
});

module.exports.sendValidateEmail = (targetUser) => {
  transporter.sendMail({
    from: `"SportMeet" <${user}>`,
    to: targetUser.email,
    subject: 'Welcome to SportMeet!',
    html: `
      <h1>Welcome ${targetUser.name}</h1>
      <p><a href='${APP_HOST}/players/${targetUser.activationToken}/validate'>Confirm</a> your account and start to play!</p>
    `
  })
    .then(info => console.log(info))
    .catch(error => console.log(error))
}

module.exports.sendValidateEmailForClub = (targetUser) => {
  transporter.sendMail({
    from: `"SportMeet" <${user}>`,
    to: targetUser.email,
    subject: 'Welcome to SportMeet!',
    html: `
      <h1>Welcome ${targetUser.name}</h1>
      <p>We are going to check your form data. Shortly you can start adding your courts<p>
      `
  })
    .then(info => console.log(info))
    .catch(error => console.log(error))
}

module.exports.sendClubRequestToAdmin = (targetUser) => {
  transporter.sendMail({
    from: `${targetUser.name} <${targetUser.email}>`,
    to: user,
    subject: 'You have a new club to review!',
    html: `
      <h1>${targetUser.name}</h1>
      <ul>
        <li>name: ${targetUser.name}</li>
        <li>address: ${targetUser.address}</li>
        <li>city: ${targetUser.city}</li>
      </ul>
      <a href='${APP_HOST}/clubs/${targetUser.activationToken}/validate'>Confirm account</a>

      `
  })
    .then(info => console.log(info))
    .catch(error => console.log(error))
}

module.exports.validateClub = (targetUser) => {
  transporter.sendMail({
    from: `"SportMeet" <${user}>`,
    to: targetUser.email,
    subject: 'Your club has been confirmed!',
    html: `
      <h1>Welcome ${targetUser.name}</h1> 
      <p>Your account has been confirmed. You can <a href='${APP_HOST}/login'>log in</a> right now.
    `
  })
    .then(info => console.log(info))
    .catch(error => console.log(error))
}

module.exports.sendValidateMatchEmail = (targetUser, targetSport, targetClub, targetDate, targetStartTime, targetEndTime) => {
  transporter.sendMail({
    from: `"SportMeet" <${user}>`,
    to: targetUser.email,
    subject: `You have a ${targetSport.name} match!`,
    html: `
      <h1>Congratulations! You have a ${targetSport.name} match!</h1>
      <h4>Club: <b>${targetClub.name}</b></h4>
      <h4>Date: <b>${targetDate}</b></h4>
      <h4>Start Time: <b>${targetStartTime}</b></h4>
      <h4>Duration: 1 hour</h4>
    `
    //<a href='${APP_HOST}/players/${targetUser.activationToken}/validate'>Confirm account</a>

  })
    .then(info => console.log(info))
    .catch(error => console.log(error))
}