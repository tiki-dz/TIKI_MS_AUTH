require('dotenv').config()
const { validationResult } = require('express-validator/check')
const { User, UserClientInvalid, Client } = require('../models')
const { Account, Notification, NotificationAll } = require('../models')

// const { Client } = require('../models')
const fs = require('fs')
const nodemailer = require('nodemailer')
const ejs = require('ejs')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const config = process.env
function resetPassword (req, res, next) {
  const errors = validationResult(req) // Finds the validation errors in this request and wraps them in an object with handy functions
  if (!errors.isEmpty()) {
    return res.status(422).json(
      { errors: errors.array(), success: false, message: 'invalid data' })
  }
  const token = req.headers['x-access-token']
  const decodedToken = jwt.verify(token, process.env.JWT_AUTH_KEY)
  Account.findOne({
    where: {
      email: decodedToken.email
    },
    attributes: ['email', 'password', 'state']
  }).then(function (account) {
    console.log(account)
    if (account === null) {
      return res.status(404).json({
        success: false,
        message: 'Account don"t exist',
        errors: ['account d"ont exist']
      })
    }
    // eslint-disable-next-line node/handle-callback-err
    bcrypt.compare(req.body.password, account.password, (err, data) => {
      if (err) {
        return res.status(500).json({
          success: false,
          message: 'decode password error',
          errors: [err]
        })
      }
      if (!data) {
        return res.status(401).json({
          success: false,
          message: 'invalid credentials',
          errors: ['invalid credentials']
        })
      }
      bcrypt.hash(req.body.newPassword, 10, function (err, hash) {
        if (err) {
          return res.status(500).json({
            success: false,
            message: 'Hash error',
            errors: ['internal server error']
          })
        }
        account.update(
          {
            password: hash
          }
        ).then((data) => {
          return res.status(200).send({
            message: 'password updated successfully',
            data: null,
            success: true
          })
        })
      })
      // password are same
    })
  })
}
function login (req, res, next) {
  const errors = validationResult(req) // Finds the validation errors in this request and wraps them in an object with handy functions
  if (!errors.isEmpty()) {
    return res.status(422).json(
      { errors: errors.array(), success: false, message: 'invalid data' })
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
        return res.status(404).json({
          success: false,
          message: 'Account don"t exist',
          errors: ['account d"ont exist']
        })
      }
      // eslint-disable-next-line node/handle-callback-err
      bcrypt.compare(req.body.password, account.password, (err, data) => {
        if (!data) {
          return res.status(401).json({
            success: false,
            message: 'invalid credentials',
            errors: ['invalid credentials']
          })
        }
        if (account.User.type !== 'client') {
          return res.status(401).json({
            success: false,
            message: 'not authorized',
            errors: ['not authorized']
          })
        }
        if (account.state === 0) {
          return res.status(403).json({
            success: false,
            message: 'your account is not active',
            errors: ['your account is not active']
          })
        }
        if (account.state === 2) {
          return res.status(403).json({
            success: false,
            message: 'your account is desactivated by admin',
            errors: ['your account is desactivated by admin']
          })
        }
        const token = jwt.sign({ email: req.body.email }, process.env.JWT_AUTH_KEY, {
          expiresIn: '30d'
        })
        // delete sensitive data
        account.password = undefined
        account.createdAt = undefined
        account.updatedAt = undefined
        return res.status(200).send({
          message: 'success',
          data: {
            token: token,
            account: account
          },
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
function verifyCode (req, res) {
  const errors = validationResult(req) // Finds the validation errors in this request and wraps them in an object with handy functions
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array(), success: false, message: 'invalid data' })
  }
  try {
    const decodedToken = jwt.verify(req.headers['x-access-token'], process.env.JWT_NOTAUTH_KEY)
    // eslint-disable-next-line node/handle-callback-err
    bcrypt.compare(req.body.code, decodedToken.code, (err, data) => {
      if (!data || decodedToken.email !== req.body.email) {
        return res.status(401).json({
          success: false,
          message: 'invalid credentials',
          errors: ['Invalid credentials']
        })
      }
      if (decodedToken.email === req.body.email) {
        UserClientInvalid.findOne({
          where: {
            email: req.body.email
          }
        }).then((invalidUser) => {
          Account.create({
            email: invalidUser.email,
            password: invalidUser.password,
            state: 1
          }).then((account, err) => {
            User.create({
              AccountEmail: invalidUser.email,
              firstName: invalidUser.firstName,
              lastName: invalidUser.lastName,
              birthDate: invalidUser.birthDate,
              type: 'client',
              city: invalidUser.city,
              sexe: invalidUser.sexe === 'Homme' ? 1 : 0,
              notificationToken: req.body.fcm_token
            }).then((user) => {
              Client.create({
                UserIdUser: user.idUser
              }).then((client) => {
                UserClientInvalid.destroy({
                  where: {
                    email: invalidUser.email
                  }
                }).then((userClientInvalid) => {
                  const Authtoken = jwt.sign({ email: req.body.email }, process.env.JWT_AUTH_KEY, {
                    expiresIn: '30d'
                  })
                  User.findOne({
                    where: {
                      AccountEmail: req.body.email

                    },
                    include: [
                      { model: Client }]
                  }).then(user => {
                    res.status(200).send({
                      data: {
                        token: Authtoken,
                        typeAccount: user.type,
                        User: user
                      },
                      success: true,
                      message: 'User authenficated succefully'
                    })
                  })
                })
              })
            })
          })
        })
      } else {
        res.status(400).json({
          success: false,
          errors: ['invalid code']
        })
      }
    })
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: 'error',
      errors: [err]
    })
  }
}
function signup (req, res, next) {
  // check id data is validated
  const errors = validationResult(req) // Finds the validation errors in this request and wraps them in an object with handy functions
  if (!errors.isEmpty()) {
    res.status(422).json({ errors: errors.array(), success: false, message: 'invalid data' })
    return
  }
  try {
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
              message: 'Hash error',
              errors: ['internal server error']
            })
          }
          UserClientInvalid.destroy({
            where: {
              email: req.body.email
            }
          }).then((user) => {
            UserClientInvalid.create({
              password: hash,
              email: req.body.email,
              firstName: req.body.firstName,
              lastName: req.body.lastName,
              birthDate: req.body.birthDate,
              profilePicture: (process.env.UPLOAD_URL + 'ProfileImage/user-default.jpg-1648754555891.jpg'),
              type: 'client',
              city: req.body.city,
              sexe: req.body.sexe === 'Homme' ? 1 : 0
            }).then((user) => {
              const codeSended = Math.round(Math.random() * (999999 - 100000) + 100000)
              // eslint-disable-next-line node/handle-callback-err
              bcrypt.hash(codeSended.toString(), 10, function (err, hash) {
                const token = jwt.sign({ email: req.body.email, code: hash }, process.env.JWT_NOTAUTH_KEY, {
                  expiresIn: '300s'
                })
                sendClientActivationEmail(req.body.email, codeSended)
                return res.status(200).json({
                  data: {
                    token: token
                  },
                  success: true,
                  message: 'User created successfuly Please check your email to activate your account'
                })
              })
            })
          })
        })
      }
    })
  } catch (err) {
    return res.status(500).json({
      message: 'internal server error',
      success: false,
      errors: [err]
    })
  }
  // if data is validated add in database;
}
function sendClientActivationEmail (email, code) {
  const template = fs.readFileSync('views/template/mail/verify.ejs').toString()
  const html = ejs.render(template, {
    email: email,
    code: code
  })
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.TIKI_EMAIL,
      pass: process.env.TIKI_PASSWORD
    }
  })
  // adding mailOptions
  const mailOptions = {
    user: process.env.TIKI_EMAIL,
    to: email,
    subject: 'Valider votre compte',
    html: html
  }
  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      console.log(error)
    }
  })
}
function profile (req, res) {
  const errors = validationResult(req) // Finds the validation errors in this request and wraps them in an object with handy functions
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array(), success: false, message: 'invalid data' })
  }
  try {
    const token = req.headers['x-access-token']
    const decodedToken = jwt.verify(token, process.env.JWT_AUTH_KEY)
    console.log(decodedToken.email)
    User.findOne({
      where: {
        AccountEmail: decodedToken.email
      },
      include: [
        { model: Client }]
    }).then(user => {
      res.status(200).send({
        data: {
          typeAccount: user.type,
          User: user
        },
        success: true,
        message: 'User authenficated succefully'
      })
    })
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: 'error',
      errors: [err]
    })
  }
}
function resendVerficationCode (req, res) {
  const errors = validationResult(req) // Finds the validation errors in this request and wraps them in an object with handy functions
  if (!errors.isEmpty()) {
    return res.status(422).json({
      message: 'invalid data',
      success: false,
      errors: errors.array()
    })
  }
  try {
    UserClientInvalid.findOne({
      where: {
        email: req.body.email
      },
      attributes: ['email', 'password']
    }).then(function (account) {
      if (account === null) {
        return res.status(404).json({
          message: 'invalid data',
          success: false,
          errors: ['invalid data']
        })
      }
      // eslint-disable-next-line node/handle-callback-err
      bcrypt.compare(req.body.password, account.password, (err, data) => {
        if (!data) {
          return res.status(401).json({
            message: 'Invalid credentials',
            success: false,
            errors: ['Invalid credentials']
          })
        }
        const codeSended = Math.round(Math.random() * (999999 - 100000) + 100000)
        bcrypt.hash(codeSended.toString(), 10, function (err, hash) {
          if (err) {
            console.log(err)
            return res.status(500).json({
              message: 'internal server error',
              success: false,
              errors: ['internal server error']
            })
          }
          const token = jwt.sign({ email: req.body.email, code: hash }, process.env.JWT_NOTAUTH_KEY, {
            expiresIn: 60
          })
          sendClientActivationEmail(req.body.email, codeSended)
          return res.status(200).json({
            data: {
              token: token
            },
            success: true,
            message: 'code resended successfully'
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
// ****************************************************************************************************
// deleting an client with id
async function deleteClientByToken (req, res) {
  // check id data is validated
  const errors = validationResult(req) // Finds the validation errors in this request and wraps them in an object with handy functions
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array(), success: false, message: 'invalid data' })
  }
  try {
    const token = req.headers['x-access-token']
    const decodedToken = jwt.verify(token, config.JWT_AUTH_KEY)
    console.log('deleting Client with email = ', decodedToken.email)
    const account = await Account.findOne({
      where: {
        email: decodedToken.email
      }
    })
    account.state = 10
    account.save()
    return res.status(200).send({ success: true, message: 'deleting the user' })
  } catch (error) {
    res.status(400).send({ errors: errors, success: false, message: 'processing err' })
  }
}
// updating an client with token
async function updateClientByToken (req, res) {
  // check the authentification token
  const errors = validationResult(req) // Finds the validation errors in this request and wraps them in an object with handy functions
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array(), success: false, message: 'invalid data' })
  }
  try {
    const token = req.headers['x-access-token']
    const decodedToken = jwt.verify(token, config.JWT_AUTH_KEY)
    const data = req.body
    const userToUpdate = await User.findOne({
      where: {
        AccountEmail: decodedToken.email
      }
    })
    userToUpdate.firstName = data.firstName == null ? userToUpdate.firstName : data.firstName
    userToUpdate.lastName = data.lastName == null ? userToUpdate.lastName : data.lastName
    userToUpdate.city = data.city == null ? userToUpdate.city : data.city
    userToUpdate.phoneNumber = data.phoneNumber == null ? userToUpdate.phoneNumber : data.phoneNumber
    userToUpdate.birthDate = data.birthDate == null ? userToUpdate.birthDate : data.birthDate
    await userToUpdate.save()
    console.log('user id= ' + userToUpdate.idUser + ' has been updated')
    return res.status(200).send({ data: { User: userToUpdate.toJSON() }, success: true, message: 'the client has been updated' })
  } catch (error) {
    console.log(error)
    res.status(500).send({ errors: errors, success: false, message: 'processing err' })
  }
}
// updating profil image client with id
async function updateimage (req, res) {
  // check the authentification token
  const errors = validationResult(req) // Finds the validation errors in this request and wraps them in an object with handy functions
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array(), success: false, message: 'invalid data' })
  }

  try {
    const token = req.headers['x-access-token']
    const decodedToken = jwt.verify(token, config.JWT_AUTH_KEY)
    const imgUrl = req.file.filename.toString()
    const user = await User.findOne({
      where: {
        AccountEmail: decodedToken.email
      }
    })
    // test the default image and deleting the the previous one
    if (user.profilePicture !== (process.env.UPLOAD_URL + 'ProfileImage/user-default.jpg-1648754555891.jpg')) {
      const filePath = user.profilePicture.replace(process.env.UPLOAD_URL, '')
      if (user.profilePicture !== null) {
        console.log(filePath)
        fs.unlinkSync('./Upload/' + filePath)
      }
    }
    // updating the url in the database
    user.profilePicture = process.env.UPLOAD_URL + 'ProfileImage/' + imgUrl
    user.save()
    res.status(200).send({ url: user.profilePicture, success: true, message: 'Image saved successfuly' })
  } catch (error) {
    console.log(error)
    res.status(500).send({ errors: error.message, success: false, message: 'processing err' })
  }
}
// check the authentification token
function passwordVerify (req, res, next) {
  // check id data is validated
  const errors = validationResult(req) // Finds the validation errors in this request and wraps them in an object with handy functions
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array(), success: false, message: 'invalid data' })
  }
  try {
    Account.findOne({
      where: {
        email: req.body.email
      }
    }).then(function (account) {
      if (account == null) {
        return res.status(409).json({
          success: false,
          message: 'This user does not exist try to creat account',
          errors: ['This user does not exist try to creat account']
        })
      } else {
        const codeSended = Math.round(Math.random() * (999999 - 100000) + 100000)
        // eslint-disable-next-line node/handle-callback-err
        bcrypt.hash(codeSended.toString(), 10, function (err, hash) {
          const token = jwt.sign({ email: req.body.email, code: hash }, process.env.JWT_NOTAUTH_KEY, {
            expiresIn: 60
          })
          sendClientActivationEmail(req.body.email, codeSended)
          return res.status(200).json({
            data: {
              token: token
            },
            success: true,
            message: 'Code sent successfuly Please check your email to activate your account'
          })
        })
      }
    })
  } catch (err) {
    return res.status(500).json({
      message: 'internal server error',
      success: false,
      errors: [err]
    })
  }
}
async function getNotification (req, res, next) {
  const { page, size } = req.query
  const { limit, offset } = getPaginationNotification(page, size)
  const token = req.headers['x-access-token']
  const decodedToken = jwt.verify(token, config.JWT_AUTH_KEY)
  console.log('deleting Client with email = ', decodedToken.email)
  Account.findOne({
    where: {
      email: decodedToken.email
    },
    include: [
      { model: User }]
  }).then((user) => {
    Notification.findAndCountAll({
      where: {
        UserIdUser: user.User.idUser
      },
      limit,
      offset
    }).then((notifs) => {
      const response = getPagingDataNotifcation(notifs, page, limit)
      return res.status(200).send({ data: response, success: true, message: 'notification get succes' })
    })
  })
}
function getNotificationAll (req, res, next) {
  const { page, size } = req.query
  const { limit, offset } = getPaginationNotification(page, size)
  NotificationAll.findAndCountAll({
    limit,
    offset
  }).then((notifs) => {
    const response = getPagingDataNotifcation(notifs, page, limit)
    return res.status(200).send({ data: response, success: true, message: 'notification get succes' })
  })
}
const getPagingDataNotifcation = (data, page, limit) => {
  const { count: totalItems, rows: notifs } = data
  const currentPage = page ? +page : 0
  const totalPages = Math.ceil(totalItems / limit)
  return { totalItems, notifs, totalPages, currentPage }
}
const getPaginationNotification = (page, size) => {
  const limit = size ? +size : 10
  const offset = page ? page * limit : 0
  return { limit, offset }
}
module.exports = { resetPassword, login, signup, verifyCode, profile, resendVerficationCode, deleteClientByToken, updateimage, updateClientByToken, sendClientActivationEmail, passwordVerify, getNotification, getNotificationAll }
