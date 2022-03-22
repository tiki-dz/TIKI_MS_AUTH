require('dotenv').config()
const { validationResult } = require('express-validator/check')
const { User } = require('../models')
const { Account } = require('../models')
// const { Client } = require('../models')
const fs = require('fs')
const nodemailer = require('nodemailer')
const ejs = require('ejs')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const config = process.env

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
function verifyCode (req, res, next) {
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
        Account.findOne({
          where: {
            email: req.body.email
          }
        }).then(function (account) {
          if (account.state === 2) {
            return res.status(409).send({
              message: 'your account is desativated by admin',
              errors: ['your account is desactivated by admin'],
              success: false
            })
          }
          if (account) {
            account.update({
              state: 1
            })
              .then(function (account) {
                const Authtoken = jwt.sign({ email: req.body.email }, process.env.JWT_AUTH_KEY, {
                  expiresIn: '30d'
                })
                res.status(200).send({
                  data: { token: Authtoken },
                  success: true,
                  message: 'User authenficated succefully'
                })
              })
          }
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
          Account.create({
            email: req.body.email,
            password: hash,
            state: 0
          }).then((account, err) => {
            User.create({
              AccountEmail: req.body.email,
              firstName: req.body.firstName,
              lastName: req.body.lastName,
              birthDate: req.body.birthDate,
              type: 'client',
              city: req.body.city,
              sexe: req.body.sexe === 'Homme' ? 1 : 0,
              phoneNumber: req.body.phoneNumber
            }).then((user) => {
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
function resendVerficationCode (req, res) {
  const errors = validationResult(req) // Finds the validation errors in this request and wraps them in an object with handy functions
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() })
  }
  try {
    Account.findOne({
      where: {
        email: req.body.email
      },
      attributes: ['email', 'password', 'state'],
      include: [
        { model: User, attributes: ['type'] }
      ]
    }).then(function (account) {
    // check the password
      console.log(account)
      if (account === null) {
        return res.status(404).json({
          message: 'account dont exist',
          success: false,
          errors: ['account dont exist']
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
        if (account.User.type !== 'client') {
          return res.status(401).json({
            message: 'Unauthorized',
            success: false,
            errors: ['Unauthorized']
          })
        }
        if (account.state === 1) {
          return res.status(200).json({
            message: 'your account is already activated',
            success: false,
            errors: ['your account is already activated']
          })
        }
        if (account.state === 2) {
          return res.status(403).json({
            message: 'your account is desactivated by admin',
            success: false,
            errors: ['your account is desactivated by admin']
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
async function deleteById (req, res) {
  // check the authentification token
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
    return res.status(200).send('deleting the user')
  } catch (error) {
    res.status(400).send(error)
  }
}
// updating an client with id
async function updateById (req, res) {
  // check the authentification token
  const errors = validationResult(req) // Finds the validation errors in this request and wraps them in an object with handy functions
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array(), success: false, message: 'invalid data' })
  }
  // check id data is validated
  const DATAerrors = validationResult(req) // Finds the validation DATAerrors in this request and wraps them in an object with handy functions
  if (!DATAerrors.isEmpty()) {
    res.status(422).json({ DATAerrors: DATAerrors.array() })
    return
  }
  try {
    const token = req.headers['x-access-token']
    const decodedToken = jwt.verify(token, config.JWT_AUTH_KEY)
    // const id = parseInt(req.params.id)
    const data = req.body
    // const userId = await Client.findOne({
    //   where: {
    //     idClient: decodedToken.email
    //   },
    //   attributes: ['idUser']
    // })
    // console.log(userId)

    const userToUpdate = await User.findOne({
      where: {
        AccountEmail: decodedToken.email
      }
    })
    userToUpdate.firstName = data.firstName
    userToUpdate.lastName = data.lastName
    userToUpdate.city = data.city
    userToUpdate.type = 'client'
    userToUpdate.phoneNumber = data.phoneNumber
    userToUpdate.sexe = data.sexe
    userToUpdate.birthDate = data.birthDate
    await userToUpdate.save()
    console.log(userToUpdate)
    return res.status(200).send({ userUpdated: userToUpdate.toJSON() })
  } catch (error) {
    res.status(400).send(error)
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
    const img = req.file.buffer.toString('base64')
    const user = await User.findOne({
      where: {
        AccountEmail: decodedToken.email
      }
    })
    user.profilePicture = img
    user.save()
    res.status(200).send('saved successfuly')
  } catch (error) {
    res.status(400).send(error)
  }
}

module.exports = { login, signup, verifyCode, profile, resendVerficationCode, deleteById, updateimage, updateById, sendClientActivationEmail }
