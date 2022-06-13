require('dotenv').config()
const { validationResult } = require('express-validator/check')
const { User, Administrator, Client, Partner } = require('../models')
const jwt = require('jsonwebtoken')

// adding one client
async function TokenCheck (req, res) {
// check id data is validated
  const errors = validationResult(req) // Finds the validation errors in this request and wraps them in an object with handy functions
  if (!errors.isEmpty()) {
    res.status(422).json({ errors: errors.array(), success: false, message: 'invalid data' })
    return
  }
  try {
    const token = req.headers['x-access-token']
    const tokenType = req.headers.role
    console.log(tokenType)
    let decodedToken
    if (tokenType === 'admin') {
      decodedToken = jwt.verify(token, process.env.JWT_AUTHADMIN_KEY)
    } else if (tokenType === 'client') {
      decodedToken = jwt.verify(token, process.env.JWT_AUTH_KEY)
    } else {
      decodedToken = jwt.verify(token, process.env.JWT_AUTHPARTNER_KEY)
    }
    const user = await User.findOne({
      where: {
        AccountEmail: decodedToken.email
      },
      attributes: ['idUser', 'type', 'phoneNumber', 'sexe', 'profilePicture', 'lastName', 'firstName', 'AccountEmail', 'city']
    })
    if (user) {
      if (user.type === 'admin') {
        const admin = await Administrator.findOne({
          where: {
            UserIdUser: user.idUser
          },
          include: [
            { model: User, attributes: ['type', 'phoneNumber', 'sexe', 'profilePicture', 'lastName', 'firstName', 'AccountEmail', 'city'] }
          ]
        })
        res.status(200).send({ data: { message: 'the token is valide', adminrs: admin }, success: true, message: 'success' })
      } else if (user.type === 'client') {
        console.log(user.idUser)
        const client = await Client.findOne({
          where: {
            UserIdUser: user.idUser
          },
          include: [
            { model: User, attributes: ['type', 'phoneNumber', 'sexe', 'profilePicture', 'lastName', 'firstName', 'AccountEmail', 'city'] }
          ]
        })
        res.status(200).send({ data: { message: 'the token is valide', client: client }, success: true, message: 'success' })
      } else {
        const partner = await Partner.findOne({
          where: {
            UserIdUser: user.idUser
          },
          include: [
            { model: User, attributes: ['type', 'phoneNumber', 'sexe', 'profilePicture', 'lastName', 'firstName', 'AccountEmail', 'city'] }
          ]
        })
        res.status(200).send({ data: { message: 'the token is valide', partner: partner }, success: true, message: 'success' })
      }
    } else {
      res.status(400).send({ error: 'unknown user', success: false, message: 'processing err' })
    }
  } catch (e) {
    res.status(500).send({ error: e, success: false, message: 'processing err' })
  }

// if data is validated add in database;
}

module.exports = { TokenCheck }
