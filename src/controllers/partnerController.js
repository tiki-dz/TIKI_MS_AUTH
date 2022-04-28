require('dotenv').config()
const { validationResult } = require('express-validator/check')
const { Account, User, Partner, Cinema, Stadium, Other, Theatre, UserPartnerInvalid } = require('../models')
const fs = require('fs')
const nodemailer = require('nodemailer')
const ejs = require('ejs')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
function resetPassword (req, res, next) {
  const errors = validationResult(req) // Finds the validation errors in this request and wraps them in an object with handy functions
  if (!errors.isEmpty()) {
    return res.status(422).json(
      { errors: errors.array(), success: false, message: 'invalid data' })
  }
  const token = req.headers['x-access-token']
  const decodedToken = jwt.verify(token, process.env.JWT_AUTHPARTNER_KEY)
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
        { model: User, attributes: ['type', 'idUser', 'phoneNumber', 'sexe', 'profilePicture', 'lastName', 'firstName', 'AccountEmail', 'city'] }
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
        if (account.User.type !== 'partner') {
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
        const token = jwt.sign({ email: req.body.email }, process.env.JWT_AUTHPARTNER_KEY, {
          expiresIn: '30d'
        })
        // delete sensitive data
        account.password = undefined
        account.createdAt = undefined
        account.updatedAt = undefined
        Partner.findOne({
          UserIdUser: account.User.idUser
        }).then((partner) => {
          return res.status(200).send({
            message: 'success',
            data: {
              token: token,
              account: account,
              partner: partner
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
function verifyCode (req, res, next) {
  const errors = validationResult(req) // Finds the validation errors in this request and wraps them in an object with handy functions
  if (!errors.isEmpty()) {
    console.log('ow')
    return res.status(422).json({ errors: errors.array(), success: false, message: 'invalid data' })
  }
  try {
    const decodedToken = jwt.verify(req.headers['x-access-token'], process.env.JWT_NOTAUTHPARTNER_KEY)
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
        UserPartnerInvalid.findOne({
          where: {
            email: req.body.email
          }
        }).then(function (accountV) {
          Account.create({
            email: accountV.email,
            password: accountV.password,
            state: 1
          }).then((account, err) => {
            User.create({
              AccountEmail: accountV.email,
              firstName: accountV.firstName,
              lastName: accountV.lastName,
              birthDate: accountV.birthDate,
              type: 'partner',
              city: accountV.city,
              sexe: accountV.sexe === 'Homme' ? 1 : 0,
              phoneNumber: '0' + accountV.phoneNumber
            }).then((user) => {
              Partner.create({
                orgaName: accountV.orgaName,
                orgaDesc: accountV.orgaDesc,
                orgaType: accountV.orgaType,
                orgaAddress: accountV.orgaAddress,
                UserIdUser: user.idUser
              }).then((partner) => {
                if (partner.orgaType === 'Cinema') {
                  Cinema.create({
                    PartnerIdPartner: partner.idPartner
                  })
                } else if (partner.orgaType === 'Stadium') {
                  Stadium.create({
                    PartnerIdPartner: partner.idPartner,
                    capacity: 0
                  })
                } else if (partner.orgaType === 'Theatre') {
                  Theatre.create({
                    PartnerIdPartner: partner.idPartner,
                    capacity: 0
                  })
                } else {
                  Other.create({
                    PartnerIdPartner: partner.idPartner,
                    capacity: 0
                  })
                }
                UserPartnerInvalid.destroy({
                  where: {
                    email: req.body.email
                  }
                })
                const Authtoken = jwt.sign({ email: req.body.email }, process.env.JWT_AUTHPARTNER_KEY, {
                  expiresIn: '30d'
                })
                res.status(200).send({
                  data: { token: Authtoken },
                  success: true,
                  message: 'User authenficated succefully'
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
          UserPartnerInvalid.destroy({
            where: {
              email: req.body.email
            }
          }).then((user) => {
            UserPartnerInvalid.create({
              email: req.body.email,
              firstName: req.body.firstName,
              lastName: req.body.lastName,
              birthDate: req.body.birthDate,
              profilePicture: (process.env.UPLOAD_URL + 'ProfileImage/user-default.jpg-1648754555891.jpg'),
              type: 'partner',
              city: req.body.city,
              sexe: req.body.sexe === 'Homme' ? 1 : 0,
              phoneNumber: req.body.phoneNumber,
              orgaName: req.body.orgaName,
              orgaDesc: req.body.orgaDesc,
              orgaType: req.body.orgaType,
              orgaAddress: req.body.orgaAddress,
              password: hash
            }).then((user) => {
              const codeSended = Math.round(Math.random() * (999999 - 100000) + 100000)
              // eslint-disable-next-line node/handle-callback-err
              bcrypt.hash(codeSended.toString(), 10, function (err, hash) {
                const token = jwt.sign({ email: req.body.email, code: hash }, process.env.JWT_NOTAUTHPARTNER_KEY, {
                  expiresIn: 600000
                })
                sendClientActivationEmail(req.body.email, codeSended)
                return res.status(200).json({
                  data: {
                    token: token
                  },
                  success: true,
                  message: 'Partner created successfuly Please check your email to activate your account'
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
    const decodedToken = jwt.verify(token, process.env.JWT_AUTHPARTNER_KEY)
    User.findOne({
      where: {
        AccountEmail: decodedToken.email
      },
      attributes: ['firstName', 'profilePicture', 'lastName', 'city', 'phoneNumber', 'sexe', 'birthDate', 'AccountEmail']
    }).then(function (user) {
      Partner.findOne({
        UserIdUser: user.idUser
      }).then((partner) => {
        return res.status(200).send({
          message: 'success',
          data: {
            account: user,
            partner: partner
          },
          success: true
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
    UserPartnerInvalid.findOne({
      where: {
        email: req.body.email
      },
      attributes: ['email', 'password']
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
          const token = jwt.sign({ email: req.body.email, code: hash }, process.env.JWT_NOTAUTHPARTNER_KEY, {
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

module.exports = { login, resetPassword, signup, verifyCode, profile, resendVerficationCode }
