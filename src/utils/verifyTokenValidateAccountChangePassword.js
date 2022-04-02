const jwt = require('jsonwebtoken')
const config = process.env
const { Account } = require('../models')
const verifyToken = (req, res, next) => {
  const token = req.headers['x-access-token']
  if (!token) {
    return res.status(403).send({
      errors: ['A token is required for authentication'],
      success: false,
      message: 'A token is required for authentication'
    }
    )
  }
  try {
    const decodedToken = jwt.verify(token, config.JWT_FORGET_CONFIRMPASSWORD)
    console.log(decodedToken.email)
    console.log('email')
    Account.findOne({
      where: {
        email: decodedToken.email
      }
    }).then((account) => {
      if (!account) {
        return res.status(404).send({
          errors: ['account dont exist'],
          success: false,
          message: 'account d"ont exist'
        }
        )
      }
      if (account.state === 2 || account.state === 0) {
        return res.status(401).send({
          errors: ['Unauthorized'],
          success: false,
          message: 'Unauthorized'
        }
        )
      } else {
        return next()
      }
    })
  } catch (err) {
    return res.status(401).send({
      message: 'Invalid token',
      success: false,
      errors: [err]
    })
  }
}
module.exports = verifyToken
