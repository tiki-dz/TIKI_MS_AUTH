const { Account, User, Client, Partner } = require('../models')
const { validationResult } = require('express-validator/check')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
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
module.exports = { login }
