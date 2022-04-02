const jwt = require('jsonwebtoken')
const { UserClientInvalid, Account } = require('../models')
const config = process.env
const verifyToken = (req, res, next) => {
  const token = req.headers['x-access-token']
  if (!token) {
    return res.status(403).send({
      success: false,
      message: 'A token is required for authentication',
      errors: ['please enter a valid code']
    }
    )
  }
  try {
    const decodedToken = jwt.verify(token, config.JWT_NOTAUTH_KEY)
    Account.findOne({
      where: {
        email: decodedToken.email
      }
    }).then((_account) => {
      if (!_account) {
        UserClientInvalid.findOne({
          where: {
            email: decodedToken.email
          }
        }).then((account) => {
          if (!account) {
            return res.status(404).send({
              success: false,
              message: 'account d"ont exist',
              errors: ['Account d"ont exist']
            }
            )
          }
          return next()
        })
      } else {
        return res.status(200).send({
          success: false,
          message: 'account alredy activated',
          errors: ['Account already activated']
        }
        )
      }
    })
  } catch (err) {
    console.log(err)
    return res.status(401).send({
      success: false,
      message: 'A valid token is required for authentication',
      errors: [err]
    })
  }
}
module.exports = verifyToken
