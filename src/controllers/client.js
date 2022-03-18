const { validationResult } = require('express-validator/check')
const { User } = require('../models')
const { Account } = require('../models')
const { Client } = require('../models')
const Promise = require('bluebird')
const bcrypt = Promise.promisifyAll(require('bcrypt-nodejs'))
const saltRounds = 8
function login (req, res, next) {}

function signup (req, res, next) {
  // check id data is validated
  const errors = validationResult(req) // Finds the validation errors in this request and wraps them in an object with handy functions
  if (!errors.isEmpty()) {
    res.status(422).json({ errors: errors.array() })
    return
  }
  try {
    return res.send('test')
  } catch (e) {

  }

  // if data is validated add in database;
}

// ****************************************************************************************************
async function add (req, res, next) {
  // check id data is validated
  const errors = validationResult(req) // Finds the validation errors in this request and wraps them in an object with handy functions
  if (!errors.isEmpty()) {
    res.status(422).json({ errors: errors.array() })
    return
  }
  try {
    const userToAdd = req.body
    bcrypt.genSalt(saltRounds, function (err, salt) {
      if (err) {
        console.log('error')
      } else {
        bcrypt.hash(userToAdd.password, salt, null, async function (err, hash) {
          if (err) {
            console.log('error')
          } else {
            console.log(hash)
            const newAccount = await Account.create({
              email: userToAdd.email,
              password: hash,
              state: 1
            })
            const newUser = await User.create({
              firstName: userToAdd.firstName,
              lastName: userToAdd.lastName,
              city: userToAdd.city,
              type: 'Client',
              phoneNumber: userToAdd.phoneNumber,
              sexe: userToAdd.sexe,
              birthDate: userToAdd.birthDate,
              email: newAccount.dataValues.email
            })
            const newClient = await Client.create({
              idUser: newUser.dataValues.idUser
            })
            console.log('new user ID:', newUser, newClient)
          }
        })
      }
    })
    return res.status(200).send('user add')
  } catch (e) {
    res.status(400).send(e)
  }

  // if data is validated add in database;
}

module.exports = { login, signup, add }
