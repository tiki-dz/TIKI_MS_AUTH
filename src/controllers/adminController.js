require('dotenv').config()
const { validationResult } = require('express-validator/check')
const { Account, User, Administrator, FaqCategorie, Faq } = require('../models')
const jwt = require('jsonwebtoken')

// const Promise = require('bluebird')
// const bcrypt = Promise.promisifyAll(require('bcrypt-nodejs'))

const { Client, Notification, NotificationAll } = require('../models')

const { sendNotifToOneUser, sendNotifToTopic } = require('../utils/notification')
const tedfsst = require('../utils')

// const { Client } = require('../models')
const bcrypt = require('bcrypt')
const Op = require('sequelize').Op
const rabbitMq = require('../utils')
const { STATISTIC_BINDING_KEY } = require('../config/config.js')

const saltRounds = 8
// ***********************************************************
const getPagingData = (data, page, limit) => {
  const { count: totalItems, rows: clients } = data
  const currentPage = page ? +page : 0
  const totalPages = Math.ceil(totalItems / limit)
  return { totalItems, clients, totalPages, currentPage }
}
const getPagination = (page, size) => {
  const limit = size ? +size : 10
  const offset = page ? page * limit : 0
  return { limit, offset }
}
// ***********************************************************
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
        if (account.User.type !== 'admin' && account.User.type !== 'superadmin') {
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
    console.log('dkhalna  hna')
    Account.findOne({
      where: {
        email: req.body.email
      }
    }).then(function (account) {
      console.log('dkhalna  hna2')
      if (account != null) {
        return res.status(409).json({
          success: false,
          message: 'Account already exist',
          errors: ['account already exist']
        })
      } else {
        console.log('dkhalna  hna3')
        try {
          bcrypt.hash(req.body.password, 10, function (err, hash) {
            console.log('dkhalna  hna4')
            console.log(err)
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
              console.log('here')
              console.log(err)
              if (err) {
              // Account.destroy({ where: { email: req.body.email } })
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
                profilePicture: (process.env.UPLOAD_URL + 'ProfileImage/user-default.jpg-1648754555891.jpg'),
                type: 'admin',
                city: req.body.city,
                sexe: req.body.sexe === 'Homme' ? 1 : 0,
                phoneNumber: req.body.phoneNumber
              }).then((user) => {
                Administrator.create({
                  role: 'admin',
                  UserIdUser: user.idUser
                }).then((account) => {
                  // send event to rabbitMq
                  const channel = rabbitMq.channel
                  const payload = { city: req.body.city }
                  const message = [{ event: 'ADD-TO-CITY', payload: payload }]
                  rabbitMq.PublishMessage(channel, STATISTIC_BINDING_KEY, message)
                  return res.status(200).json({
                    data: null,
                    success: true,
                    message: 'Admin created successfuly'
                  })
                })
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
    const userExist = await Account.findOne({
      where: {
        email: userToAdd.email
      }
    })
    if (!userExist) {
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
                profilePicture: (process.env.UPLOAD_URL + 'ProfileImage/user-default.jpg-1648754555891.jpg'),
                type: 'client',
                phoneNumber: userToAdd.phoneNumber,
                sexe: userToAdd.sexe === 'Homme' ? 1 : 0,
                birthDate: userToAdd.birthDate,
                AccountEmail: newAccount.dataValues.email
              })
              const newClient = await Client.create({
                UserIdUser: newUser.dataValues.idUser
              })
              // send event to rabbitMq
              const channel = rabbitMq.channel
              const payload = { city: userToAdd.city }
              const message = [{ event: 'ADD-TO-CITY', payload: payload }]
              rabbitMq.PublishMessage(channel, STATISTIC_BINDING_KEY, message)
              console.log('new user ID:', newUser, newClient)
              return res.status(200).send({ data: newUser.toJSON(), success: true, message: 'the client has been added' })
            }
          })
        }
      })
    } else {
      res.status(409).send({ error: 'This email is already in use.' })
    }
  } catch (e) {
    res.status(500).send({ error: e, success: false, message: 'processing err' })
  }

// if data is validated add in database;
}
// get all clients
// the default page is 0 and the default size is 10
async function findAllClients (req, res) {
  try {
    const { page, size } = req.query
    const { limit, offset } = getPagination(page, size)
    await User.findAndCountAll({
      where: {
        type: 'client'
      },
      include: [{ model: Client }],
      limit,
      offset
    }).then(data => {
      const response = getPagingData(data, page, limit)
      return res.status(200).send({ data: response, success: true })
    })
  } catch (error) {
    res.status(500).send({ errors: error, success: false, message: 'processing err' })
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
    res.status(500).send({ error: error, success: false, message: 'processing err' })
  }
}
// activate client by id
async function activateClient (req, res) {
  const errors = validationResult(req)
  console.log(errors) // Finds the validation errors in this request and wraps them in an object with handy functions
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
    res.status(500).send({ error: error, success: false, message: 'processing err' })
  }
}
// deactivate client by id
async function deactivateClient (req, res) {
  const errors = validationResult(req) // Finds the validation errors in this request and wraps them in an object with handy functions
  console.log(errors)
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
    console.log(error)
    return res.status(500).json({
      success: false,
      message: 'error',
      errors: [error]
    })
  }
}

// adding one client
async function addAdmin (req, res) {
  // check id data is validated
  const errors = validationResult(req) // Finds the validation errors in this request and wraps them in an object with handy functions
  if (!errors.isEmpty()) {
    res.status(422).json({ errors: errors.array(), success: false, message: 'invalid data' })
    return
  }
  try {
    const userToAdd = req.body
    const userExist = await Account.findOne({
      where: {
        email: userToAdd.email
      }
    })
    if (!userExist) {
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
                profilePicture: (process.env.UPLOAD_URL + 'ProfileImage/user-default.jpg-1648754555891.jpg'),
                type: 'admin',
                phoneNumber: userToAdd.phoneNumber,
                sexe: userToAdd.sexe === 'Homme' ? 1 : 0,
                birthDate: userToAdd.birthDate,
                AccountEmail: newAccount.dataValues.email
              })
              const newAdmin = await Administrator.create({
                role: 'admin',
                UserIdUser: newUser.dataValues.idUser
              })
              // send event to rabbitMq
              const channel = rabbitMq.channel
              const payload = { city: userToAdd.city }
              const message = [{ event: 'ADD-TO-CITY', payload: payload }]
              rabbitMq.PublishMessage(channel, STATISTIC_BINDING_KEY, message)
              console.log('new user ID:', newUser, newAdmin)
              return res.status(200).send({ data: newUser.toJSON(), success: true, message: 'the client has been added' })
            }
          })
        }
      })
    } else {
      res.status(409).send({ error: 'This email is already in use.' })
    }
  } catch (e) {
    res.status(500).send({ error: e, success: false, message: 'processing err' })
  }

// if data is validated add in database;
}
async function getAccounts (req, res) {
  const { page, size, search, filter } = req.query
  let condition = null
  if (filter && search) {
    condition = { [Op.and]: [{ [Op.or]: [{ firstName: { [Op.like]: `%${search}%` } }, { lastName: { [Op.like]: `%${search}%` } }, { AccountEmail: { [Op.like]: `%${search}%` } }] }, { type: { [Op.eq]: filter } }] }
  } else if (filter) {
    condition = { type: { [Op.eq]: filter } }
  } else if (search) {
    condition = { [Op.or]: [{ firstName: { [Op.like]: `%${search}%` } }, { lastName: { [Op.like]: `%${search}%` } }, { AccountEmail: { [Op.like]: `%${search}%` } }] }
  }
  const { limit, offset } = getPagination(page, size)
  console.log(limit, offset)
  const total = await Account.count({
    limit: limit,
    offset: offset,
    include: [{
      model: User,
      required: true,
      where: condition
    }]
  })
  Account.findAndCountAll({
    limit,
    offset,
    include: [{
      model: User,
      required: true,
      where: condition
    }]
  })
    .then(data => {
      data.count = total
      const response = getPagingData(data, page, limit)
      res.send({ ...response, success: true })
    })
}
async function sendNotification (req, res, next) {
  const errors = validationResult(req) // Finds the validation errors in this request and wraps them in an object with handy functions
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array(), success: false, message: 'invalid data' })
  }
  try {
    Account.findOne({
      where: {
        email: req.body.email
      },
      include: [
        { model: User }
      ]
    }).then((user) => {
      console.log(user.User)
      Notification.create({
        title: req.body.title,
        body: req.body.body,
        UserIdUser: user.User.idUser
      }).then((notif) => {
        if (!user.User.notificationToken) {
          return res.status(200).send({ message: 'notification sended successfully just to the collection', data: req.body, success: true })
        }
        sendNotifToOneUser(req, res, user.User.notificationToken)
      })
    })
  } catch (error) {
  }
}
async function sendNotificationAll (req, res, next) {
  const errors = validationResult(req) // Finds the validation errors in this request and wraps them in an object with handy functions
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array(), success: false, message: 'invalid data' })
  }
  try {
    NotificationAll.create({
      title: req.body.title,
      body: req.body.body
    }).then((notfs) => {
      console.log(notfs)
      sendNotifToTopic(req, res, req.body.topic)
    })
  } catch (error) {
  }
}
function scheduledNotification (req, res) {
  const errors = validationResult(req) // Finds the validation errors in this request and wraps them in an object with handy functions
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array(), success: false, message: 'invalid data' })
  }
  Account.findOne({
    where: {
      email: req.body.email
    },
    include: [
      { model: User }
    ]
  }).then((user) => {
    scheduleMessageForOneUser(req.body.date, req.body.hour, {
      title: req.body.title,
      body: req.body.body
    }, user.User.notificationToken)
  })
}
function addFaqCategorie (req, res) {
  const errors = validationResult(req) // Finds the validation errors in this request and wraps them in an object with handy functions
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array(), success: false, message: 'invalid data' })
  }
  FaqCategorie.create({
    nom: req.body.name
  }).then((faqCategorie) => {
    return res.status(200).json({ success: true, data: faqCategorie, message: 'success' })
  })
}
function deleteFaqCategorie (req, res) {
  const errors = validationResult(req) // Finds the validation errors in this request and wraps them in an object with handy functions
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array(), success: false, message: 'invalid data' })
  }
  FaqCategorie.destroy({
    where: {
      idFaqCategorie: req.params.id
    }
  }).then((faqCategorie) => {
    return res.status(200).json({ success: true, data: faqCategorie, message: 'success' })
  })
}
function getFaqCategorie (req, res) {
  FaqCategorie.findAll({
  }).then((faqCategorie) => {
    return res.status(200).json({ success: true, data: faqCategorie, message: 'success' })
  })
}

const Queue = require('bull')
const notificationQueue = new Queue('NotificationBull', 'redis://127.0.0.1:6379')
console.log(notificationQueue)
async function scheduleMessageForOneUser (date, token) {

}
async function addFaq (req, res, next) {
  const errors = validationResult(req) // Finds the validation errors in this request and wraps them in an object with handy functions
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array(), success: false, message: 'invalid data' })
  }
  FaqCategorie.findOne({
    where: {
      idFaqCategorie: req.body.id
    }
  }).then((data) => {
    if (!data) {
      return res.status(404).json({ errors: errors.array(), success: false, message: 'categoryFaqNotFound' })
    } else {
      Faq.create({
        Question: req.body.question,
        Reponse: req.body.reponse,
        FaqCategorieIdFaqCategorie: req.body.id
      }).then((faq) => {
        return res.status(200).json({ data: faq, success: true, message: 'added successfully' })
      })
    }
  })
}
function deleteFaq (req, res) {
  const errors = validationResult(req) // Finds the validation errors in this request and wraps them in an object with handy functions
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array(), success: false, message: 'invalid data' })
  }
  Faq.destroy({
    where: {
      idFaq: req.params.id
    }
  }).then((faq) => {
    return res.status(200).json({ success: true, data: faq, message: 'success' })
  })
}
function patchFaq (req, res) {
  const errors = validationResult(req) // Finds the validation errors in this request and wraps them in an object with handy functions
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array(), success: false, message: 'invalid data' })
  }
  Faq.findOne({ where: { idFaq: req.params.id } }).then((faq) => {
    if (!faq) {
      return res.status(404).json({ errors: errors.array(), success: false, message: 'faq not found' })
    }
    faq.Question = req.body.question ?? faq.Question
    faq.Reponse = req.body.reponse ?? faq.Reponse
    faq.save().then((faq) => {
      return res.status(200).json({ success: true, data: faq, message: 'success' })
    })
  })
}
function patchFaqCategorie (req, res) {
  const errors = validationResult(req) // Finds the validation errors in this request and wraps them in an object with handy functions
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array(), success: false, message: 'invalid data' })
  }
  FaqCategorie.findOne({ where: { idFaqCategorie: req.params.id } }).then((faqCategorie) => {
    if (!faqCategorie) {
      return res.status(404).json({ errors: errors.array(), success: false, message: 'faq not found' })
    }
    faqCategorie.nom = req.body.nom ?? faqCategorie.nom
    faqCategorie.save().then((faq) => {
      return res.status(200).json({ success: true, data: faq, message: 'success' })
    })
  })
}

function testingRabbitmq (req, res) {
  try {
    const channel = tedfsst.channel
    const payload = { token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImEuaGFyaXJpQGVzaS1zYmEuZHoiLCJpYXQiOjE2NTMzMDg5NzEsImV4cCI6MTY1NTkwMDk3MX0.0JTsh8CtuC2eX6lTWj6jD7TeGs0RJ9kBzQQOijNsb4c', score: 5 }
    const message = [{ event: 'ADD-SCORE', payload: payload }]
    tedfsst.PublishMessage(channel, 'AUTH_SERVICE', message)
    res.status(200).send('succes')
  } catch (error) {
    res.send(error)
  }
}

module.exports = { login, getAccounts, signup, profile, addClient, findAllClients, findClientById, deactivateClient, activateClient, addAdmin, sendNotification, sendNotificationAll, scheduledNotification, addFaqCategorie, deleteFaqCategorie, getFaqCategorie, addFaq, deleteFaq, patchFaq, patchFaqCategorie, testingRabbitmq }
