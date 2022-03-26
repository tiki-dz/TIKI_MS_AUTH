require('dotenv').config()
const { validationResult } = require('express-validator/check')
const { Account, User, Administrator } = require('../models')
const jwt = require('jsonwebtoken')
const { Client } = require('../models')
const Promise = require('bluebird')
const bcrypt = Promise.promisifyAll(require('bcrypt-nodejs'))
const saltRounds = 8

function login (req, res) {
  const errors = validationResult(req) // Finds the validation errors in this request and wraps them in an object with handy functions
  if (!errors.isEmpty()) {
    return res.status(422).json({ success: false, message: 'invalid data', errors: errors.array() })
  }
  try {
    Account.findOne({
      where: {
        email: req.body.email
      },
      attributes: ['email', 'password', 'state'],
      include: [
        { model: User, attributes: ['type', 'phoneNumber', 'sexe', 'profilePicture', 'lastName', 'firstName', 'AccountEmail', 'city'] }
      ]
    }).then(function (account) {
    // check the password
      if (account === null) {
        return res.status(404).json({ success: false, message: 'invalid credential', errors: ['account dont exist'] })
      }
      // eslint-disable-next-line node/handle-callback-err
      bcrypt.compare(req.body.password, account.password, (err, data) => {
        if (!data) {
          return res.status(401).json({ success: false, message: 'invalid credential', errors: ['Invalid credentials'] })
        }
        if (account.User.type !== 'admin') {
          return res.status(401).json({ success: false, message: 'invalid credential', errors: ['Unauthorized'] })
        }
        if (account.state === 0) {
          return res.status(403).json({ success: false, message: 'your account is desactivated', errors: ['your account is desactivated'] })
        }
        if (account.state === 2) {
          res.status(403).json({ success: false, message: 'your account is desactivated', errors: ['your account is desactivated by admin'] })
        }
        const token = jwt.sign({ email: req.body.email }, process.env.JWT_AUTHADMIN_KEY, {
          expiresIn: '30d'
        })
        // delete sensitive data
        account.password = undefined
        account.createdAt = undefined
        account.updatedAt = undefined
        return res.status(200).json({
          data: {
            token: token,
            data: account
          },
          message: 'successfully authentificated',
          success: true
        })
      })
    })
  } catch (err) {
    return res.status(500).json({
      success: false,
      errors: [err]
    })
  }
}
function signup (req, res) {
  const errors = validationResult(req) // Finds the validation errors in this request and wraps them in an object with handy functions
  if (!errors.isEmpty()) {
    return res.status(422).json({
      errors: errors.array(),
      success: false,
      message: 'invalid data'
    })
  } try {
    Account.findOne({
      where: {
        email: req.body.email
      }
    }).then(function (account) {
      if (account != null) {
        return res.status(409).json({
          success: false,
          message: 'Account already exist',
          errors: ['account already exist']
        })
      } else {
        bcrypt.hash(req.body.password, 10, function (err, hash) {
          if (err) {
            return res.status(500).json({
              success: false,
              message: 'internal server error',
              errors: ['internal server error']
            })
          }
          Account.create({
            email: req.body.email,
            password: hash,
            state: 1
          }).then((account, err) => {
            if (err) {
              Account.destroy({ where: { email: req.body.email } })
              return res.status(500).json({
                success: false,
                message: 'internal server error',
                errors: ['internal server error']
              })
            }
            User.create({
              AccountEmail: req.body.email,
              firstName: req.body.firstName,
              lastName: req.body.lastName,
              birthDate: req.body.birthDate,
              type: 'admin',
              city: req.body.city,
              sexe: req.body.sexe === 'Homme' ? 1 : 0,
              phoneNumber: req.body.phoneNumber
            }).then((user) => {
              Administrator.create({
                role: 'admin',
                UserIdUser: user.idUser
              }).then((account) => {
                return res.status(200).json({
                  data: null,
                  success: true,
                  message: 'Admin created successfuly'
                })
              })
            })
          })
        })
      }
    })
  } catch (err) {
    return res.status(500).json({
      success: false,
      errors: [err]
    })
  }
}
function profile (req, res) {
  const errors = validationResult(req) // Finds the validation errors in this request and wraps them in an object with handy functions
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array(), success: false, message: 'invalid data' })
  }
  try {
    const token = req.headers['x-access-token']
    const decodedToken = jwt.verify(token, process.env.JWT_AUTHADMIN_KEY)
    User.findOne({
      where: {
        AccountEmail: decodedToken.email
      },
      attributes: ['firstName', 'profilePicture', 'lastName', 'city', 'phoneNumber', 'sexe', 'birthDate', 'AccountEmail']
    }).then(function (user) {
      return res.status(200).json({ data: user, success: true, message: 'success' })
    })
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: 'error',
      errors: [err]
    })
  }
}

// adding one client
async function addClient (req, res) {
// check id data is validated
  const errors = validationResult(req) // Finds the validation errors in this request and wraps them in an object with handy functions
  if (!errors.isEmpty()) {
    res.status(422).json({ errors: errors.array(), success: false, message: 'invalid data' })
    return
  }
  try {
    const userToAdd = req.body
    bcrypt.genSalt(saltRounds, function (err, salt) {
      if (err) {
        console.log('error in bcrypt.genSalt')
        res.status(422).json({ errors: err, success: false, message: 'error in bcrypt.genSalt' })
      } else {
        bcrypt.hash(userToAdd.password, salt, null, async function (err, hash) {
          if (err) {
            console.log('error in bcrypt.hash')
            res.status(422).json({ errors: err, success: false, message: 'error in bcrypt.hash' })
            return res.status(500).send('err in bcrypt')
          } else {
            console.log(hash)
            // todo
            // new err controle (ali) for multipal creation
            const newAccount = await Account.create({
              email: userToAdd.email,
              password: hash,
              state: 1
            })
            const newUser = await User.create({
              firstName: userToAdd.firstName,
              lastName: userToAdd.lastName,
              city: userToAdd.city,
              type: 'client',
              phoneNumber: userToAdd.phoneNumber,
              sexe: userToAdd.sexe === 'Homme' ? 1 : 0,
              birthDate: userToAdd.birthDate,
              AccountEmail: newAccount.dataValues.email
            })
            const newClient = await Client.create({
              UserIdUser: newUser.dataValues.idUser
            })
            console.log('new user ID:', newUser, newClient)
            return res.status(200).send({ data: newUser.toJSON(), success: true, message: 'the client has been added' })
          }
        })
      }
    })
  } catch (e) {
    res.status(400).send({ error: e, success: false, message: 'processing err' })
  }

// if data is validated add in database;
}
// get all clients
async function findAllClients (req, res) {
  try {
    const Clients = await User.findAll({
      where: {
        type: 'client'
      },
      include: [{ model: Client }],
      limit: 50
    })
    return res.status(200).send({ data: Clients.toJSON(), success: true })
  } catch (error) {
    res.status(400).send({ error: error, success: false, message: 'processing err' })
  }
}
// get one client by id
async function findClientById (req, res) {
  try {
    const id = parseInt(req.params.id)
    const client = await Client.findOne({
      where: {
        idClient: id
      }
    })
    const theFullClient = await User.findOne({
      where: {
        idUser: client.dataValues.UserIdUser
      },
      include: [{ model: Client }]
    })
    return res.status(200).send({ data: theFullClient, success: true })
  } catch (error) {
    res.status(400).send({ error: error, success: false, message: 'processing err' })
  }
}
// activate client by id
async function activateClient (req, res) {
  const errors = validationResult(req) // Finds the validation errors in this request and wraps them in an object with handy functions
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() })
  } try {
    const id = parseInt(req.params.id)
    const client = await Client.findOne({
      where: {
        idClient: id
      }
    })
    const user = await User.findOne({
      where: {
        idUser: client.dataValues.UserIdUser
      }
    })
    const account = await Account.findOne({
      where: {
        email: user.dataValues.AccountEmail
      }
    })
    let message = 'Account activated successfuly'
    if (account.state !== 1) {
      account.update({
        state: req.body.state
      })
    } else {
      message = 'already activated user!'
    }

    return res.status(200).json({
      success: true,
      message: message
    })
  } catch (error) {
    res.status(400).send({ error: error, success: false, message: 'processing err' })
  }
}
// deactivate client by id
async function deactivateClient (req, res) {
  const errors = validationResult(req) // Finds the validation errors in this request and wraps them in an object with handy functions
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() })
  } try {
    const id = parseInt(req.params.id)
    const client = await Client.findOne({
      where: {
        idClient: id
      }
    })
    const user = await User.findOne({
      where: {
        idUser: client.dataValues.UserIdUser
      }
    })
    const account = await Account.findOne({
      where: {
        email: user.dataValues.AccountEmail
      }
    })
    let message = 'Account Deactivated successfuly'
    if (account.state !== 2) {
      account.update({
        state: req.body.state
      })
    } else {
      message = 'already deactivated user!'
    }

    return res.status(200).json({
      success: true,
      message: message
    })
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: 'error',
      errors: [error]
    })
  }
}

module.exports = { login, signup, profile, addClient, findAllClients, findClientById, deactivateClient, activateClient }
