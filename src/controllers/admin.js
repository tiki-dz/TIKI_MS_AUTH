require('dotenv').config()
const { validationResult } = require('express-validator/check')
const { Account, User } = require('../models')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
function login (req, res, next) {
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
        { model: User, attributes: ['type', 'phoneNumber', 'sexe', 'profilePicture', 'lastName', 'firstName', 'AccountEmail', 'city'] }
      ]
    }).then(function (account) {
    // check the password
      if (account === null) {
        return res.status(404).json({ errors: ['account dont exist'] })
      }
      // eslint-disable-next-line node/handle-callback-err
      bcrypt.compare(req.body.password, account.password, (err, data) => {
        if (!data) {
          return res.status(401).json({ errors: ['Invalid credentials'] })
        }
        if (account.User.type !== 'administrator') {
          return res.status(401).json({ errors: ['Unauthorized'] })
        }
        if (account.state === 0) {
          return res.status(403).json({ errors: ['your account is desactivated'] })
        }
        if (account.state === 2) {
          res.status(403).json({ errors: ['your account is desactivated by admin'] })
        }
        const token = jwt.sign({ email: req.body.email }, process.env.JWT_AUTHADMIN_KEY, {
          expiresIn: '30d'
        })
        // delete sensitive data
        account.password = undefined
        account.createdAt = undefined
        account.updatedAt = undefined
        return res.status(200).json({ token: token, data: account, success: true })
      })
    })
  } catch (err) {
    return res.status(500).json({
      success: false,
      errors: [err]
    })
  }
}
function signup (req, res, next) {
  const errors = validationResult(req) // Finds the validation errors in this request and wraps them in an object with handy functions
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() })
  } try {
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
              AccountEmail: req.body.email,
              firstName: req.body.firstName,
              lastName: req.body.lastName,
              birthDate: req.body.birthDate,
              type: 'administrateur',
              city: req.body.city,
              sexe: req.body.sexe === 'Homme' ? 1 : 0,
              phoneNumber: req.body.phoneNumber
            }).then((user) => {
              return res.status(200).json({
                token: 'token',
                success: true,
                message: 'User created successfuly Please check your email to activate your account'
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
function profile (req, res, next) {
  const errors = validationResult(req) // Finds the validation errors in this request and wraps them in an object with handy functions
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() })
  }
}

module.exports = { login, signup, profile }
