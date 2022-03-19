require('dotenv').config()
const { validationResult } = require('express-validator/check')
const { Account, User, Code } = require('../models')
const fs = require('fs')
const nodemailer = require('nodemailer')
const ejs = require('ejs')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
function login (req, res, next) {
  const errors = validationResult(req) // Finds the validation errors in this request and wraps them in an object with handy functions
  if (!errors.isEmpty()) {
    res.status(422).json({ errors: errors.array() })
  }
  Account.findOne({
    where: {
      email: req.body.email
    }
  }).then(function (account) {
    // check the password
    if (account === null) {
      res.status(422).json({ errors: ['invalid credentials'] })
    }
    if (account.state === 0) {
      res.status(422).json({ errors: ['invalid token'] })
    }
  })
}
function verifyCode (req, res, next) {
  const errors = validationResult(req) // Finds the validation errors in this request and wraps them in an object with handy functions
  if (!errors.isEmpty()) {
    res.status(422).json({ errors: errors.array() })
  }
  try {
    const decodedToken = jwt.verify(req.headers['x-access-token'], process.env.JWT_NOTAUTH_KEY)
    console.log(decodedToken)
    console.log(decodedToken.email === req.body.email)
    if (decodedToken.email === req.body.email && decodedToken.code.toString() === req.body.code.toString()) {
      console.log('dkhalna hna')
      Account.findOne({
        where: {
          email: req.body.email
        }
      }).then(function (account) {
        // Check if record exists in db
        if (account) {
          account.update({
            state: 1
          })
            .then(function (account) {
              const Authtoken = jwt.sign({ email: req.body.email }, process.env.JWT_AUTH_KEY, {
                expiresIn: '30d'
              })
              res.status(200).send({
                token: Authtoken,
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
  } catch (err) {
    console.log(err)
  }
}
function signup (req, res, next) {
  // check id data is validated
  const errors = validationResult(req) // Finds the validation errors in this request and wraps them in an object with handy functions
  if (!errors.isEmpty()) {
    res.status(422).json({ errors: errors.array() })
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
          errors: ['account already exist']
        })
      } else {
        bcrypt.hash(req.body.password, 10, function (err, hash) {
          if (err) {
            return res.status(500).json({
              errors: ['internal server error']
            })
          }
          Account.create({
            email: req.body.email,
            password: hash,
            state: 0
          }).then((account, err) => {
            if (err) {
              Account.destroy({ where: { email: req.body.email } })
              return res.status(500).json({
                errors: ['internal server error']
              })
            }
            User.create({
              email: req.body.email,
              firstName: req.body.firstName,
              lastName: req.body.lastName,
              birthDate: req.body.birthDate,
              type: 'client',
              sexe: req.body.sexe === 'Homme' ? 1 : 0,
              phoneNumber: req.body.phoneNumber
            }).then((user) => {
              const codeSended = Math.round(Math.random() * (999999 - 100000) + 100000)
              Code.create({
                code: codeSended,
                email: req.body.email
              }).then((code) => {
                const token = jwt.sign({ email: req.body.email, code: codeSended }, process.env.JWT_NOTAUTH_KEY, {
                  expiresIn: 1200
                })
                sendClientActivationEmail(req.body.email, codeSended)
                return res.status(200).json({
                  token: token,
                  success: true,
                  message: 'User created successfuly Please check your email to activate your account'
                })
              })
            })
          })
        })
      }
    })
  } catch (e) {

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
      pass: 'process.env.TIKI_PASSWORD'
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

module.exports = { login, signup, verifyCode }
