const { validationResult } = require('express-validator/check')
const { User } = require('../models')
const { Account } = require('../models')
const { Client } = require('../models')
const Promise = require('bluebird')
const bcrypt = Promise.promisifyAll(require('bcrypt-nodejs'))
const saltRounds = 8

async function addClient (req, res, next) {
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
              sexe: userToAdd.sexe,
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
  try {
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
      account.state = 1
      await account.save()
    } else {
      message = 'already activated user!'
    }

    return res.status(200).json({
      success: true,
      body: account,
      message: message
    })
  } catch (error) {
    res.status(400).send(error)
  }
}
async function deactivateClient (req, res) {
  try {
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
      account.state = 2
      await account.save()
    } else {
      message = 'already activated user!'
    }

    return res.status(200).json({
      success: true,
      body: account,
      message: message
    })
  } catch (error) {
    res.status(400).send(error)
  }
}

module.exports = { addClient, findAllClients, findClientById, deactivateClient, activateClient }
