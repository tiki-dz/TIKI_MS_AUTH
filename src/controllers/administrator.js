const { validationResult } = require('express-validator/check')
const { User } = require('../models')
const { Account } = require('../models')
const { Client } = require('../models')
const Promise = require('bluebird')
const bcrypt = Promise.promisifyAll(require('bcrypt-nodejs'))
const saltRounds = 8

// adding one client
async function addClient (req, res) {
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
    return res.status(200).send(Clients)
  } catch (error) {
    res.status(400).send(error)
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
    return res.status(200).send({ client: theFullClient })
  } catch (error) {
    res.status(400).send(error)
  }
}

async function activateClient (req, res) {
  const errors = validationResult(req) // Finds the validation errors in this request and wraps them in an object with handy functions
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() })
  } try {
    const email = req.body.email
    const account = await Account.findOne({
      where: {
        email: email
      }
    })
    let message = 'Account activated successfuly'
    if (account) {
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
    } else {
      return res.status(404).json({
        success: false,
        message: "Account doesn't exist"
      })
    }
  } catch (error) {
    res.status(400).send(error)
  }
}
async function deactivateClient (req, res) {
  const errors = validationResult(req) // Finds the validation errors in this request and wraps them in an object with handy functions
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() })
  } try {
    const email = req.body.email
    const account = await Account.findOne({
      where: {
        email: email
      }
    })
    let message = 'Account Deactivated successfuly'
    if (account) {
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
    } else {
      return res.status(404).json({
        success: false,
        message: "Account doesn't exist"
      })
    }
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: 'error',
      errors: [error]
    })
  }
}

module.exports = { addClient, findAllClients, findClientById, deactivateClient, activateClient }
