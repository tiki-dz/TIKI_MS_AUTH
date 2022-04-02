const { Account, User, Client, Partner } = require('../models')
const { validationResult } = require('express-validator/check')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const fs = require('fs')
const nodemailer = require('nodemailer')
const ejs = require('ejs')
function login (req, res, next) {
  const errors = validationResult(req) // Finds the validation errors in this request and wraps them in an object with handy functions
  if (!errors.isEmpty()) {
    return res.status(422).json(
      { errors: errors.array(), success: false, message: 'invalid data' })
  }
  try {
    // check if the account exist
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
      // return if account is not active
      if (account.state === 0) {
        return res.status(403).json({
          success: false,
          message: 'your account is not active',
          errors: ['your account is not active']
        })
      }
      // return if account is desactivated by admin
      if (account.state === 2) {
        return res.status(403).json({
          success: false,
          message: 'your account is desactivated by admin',
          errors: ['your account is desactivated by admin']
        })
      }
      // check password
      // eslint-disable-next-line node/handle-callback-err
      bcrypt.compare(req.body.password, account.password, (err, data) => {
        if (!data) {
          return res.status(401).json({
            success: false,
            message: 'invalid credentials',
            errors: ['invalid credentials']
          })
        }
        if (account.User.type !== 'client' && account.User.type !== 'partner') {
          return res.status(401).send({
            errors: ['Unauthorized'],
            success: false,
            message: 'Unauthorized'
          }
          )
        }
        // check if partner or client
        const token = jwt.sign({ email: req.body.email }, account.User.type === 'client' ? process.env.JWT_AUTH_KEY : process.env.JWT_AUTHPARTNER_KEY, {
          expiresIn: '30d'
        })
        // delete sensitive data
        account.password = undefined
        account.createdAt = undefined
        account.updatedAt = undefined
        User.findOne({
          where: {
            AccountEmail: req.body.email
          },
          include: [
            { model: account.User.type === 'client' ? Client : Partner }
          ]
        }).then((user) => {
          return res.status(200).send({
            message: 'success',
            data: {
              token: token,
              typeAccount: account.User.type,
              User: user
            },
            success: true
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
function forgetPasswordVerifyAccount (req, res, next) {
  const errors = validationResult(req) // Finds the validation errors in this request and wraps them in an object with handy functions
  if (!errors.isEmpty()) {
    return res.status(422).json(
      { errors: errors.array(), success: false, message: 'invalid data' })
  }
  try {
    // check if the account exist
    Account.findOne({
      where: {
        email: req.body.email
      },
      attributes: ['email', 'password', 'state']
    }).then(function (account) {
    // check the password
      if (account === null) {
        return res.status(404).json({
          success: false,
          message: 'Account don"t exist',
          errors: ['account d"ont exist']
        })
      }
      // return if account is not active
      if (account.state === 0) {
        return res.status(403).json({
          success: false,
          message: 'your account is not active',
          errors: ['your account is not active']
        })
      }
      const codeSended = Math.round(Math.random() * (999999 - 100000) + 100000)
      // eslint-disable-next-line node/handle-callback-err
      bcrypt.hash(codeSended.toString(), 10, function (err, hash) {
        const token = jwt.sign({ email: req.body.email, code: hash }, process.env.JWT_FORGET_CONFIRMPIN, {
          expiresIn: 600000
        })
        sendClientActivationEmail(req.body.email, codeSended)
        return res.status(200).json({
          data: {
            token: token
          },
          success: true,
          message: 'verify your email '
        })
      })
      // eslint-disable-next-line node/handle-callback-err
    })
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: 'error',
      errors: [err]
    })
  }
}
function forgetPasswordValidateAccount (req, res, next) {
  const errors = validationResult(req) // Finds the validation errors in this request and wraps them in an object with handy functions
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array(), success: false, message: 'invalid data' })
  }
  try {
    const decodedToken = jwt.verify(req.headers['x-access-token'], process.env.JWT_FORGET_CONFIRMPIN)
    // eslint-disable-next-line node/handle-callback-err
    bcrypt.compare(req.body.code, decodedToken.code, (err, data) => {
      if (!data || decodedToken.email !== req.body.email) {
        return res.status(401).json({
          success: false,
          message: 'invalid credentials',
          errors: ['Invalid credentials']
        })
      }
      const token = jwt.sign({ email: req.body.email }, process.env.JWT_FORGET_CONFIRMPASSWORD, {
        expiresIn: 600000
      })
      return res.status(200).json({
        data: {
          token: token
        },
        success: true,
        message: 'your account is valid you can now change your password '
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
function forgetPasswordChangePassword (req, res, next) {
  const errors = validationResult(req) // Finds the validation errors in this request and wraps them in an object with handy functions
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array(), success: false, message: 'invalid data' })
  }
  try {
    const decodedToken = jwt.verify(req.headers['x-access-token'], process.env.JWT_FORGET_CONFIRMPASSWORD)
    if (decodedToken.email !== req.body.email) {
      return res.status(401).json({
        success: false,
        message: 'invalid credentials',
        errors: ['Invalid credentials']
      })
    }
    bcrypt.hash(req.body.password, 10, function (err, hash) {
      if (err) {
        return res.status(500).json({
          success: false,
          message: 'Hash error',
          errors: ['internal server error']
        })
      }
      Account.update({
        password: hash
      }, {
        where: { email: req.body.email }
      }).then((account) => {
        return res.status(200).json({
          data: null,
          success: true,
          message: 'Your account has been updated successfully'
        })
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
module.exports = { login, forgetPasswordVerifyAccount, forgetPasswordValidateAccount, forgetPasswordChangePassword }
