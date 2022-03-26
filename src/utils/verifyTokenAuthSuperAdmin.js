const jwt = require('jsonwebtoken')
const config = process.env
const { Account, User, Administrator } = require('../models')
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
    const decodedToken = jwt.verify(token, config.JWT_AUTHADMIN_KEY)
    console.log(decodedToken.email)
    console.log('email')
    Account.findOne({
      where: {
        email: decodedToken.email
      }
    }).then((account) => {
      if (!account) {
        return res.status(404).send({
          success: false,
          message: 'account d"ont exist'
        }
        )
      }
      if (account.state === 2) {
        return res.status(401).send({
          errors: ['Unauthorized'],
          success: false,
          message: 'Unauthorized'
        }
        )
      }
      User.findOne({
        where: {
          AccountEmail: decodedToken.email
        },
        include: [
          { model: Administrator }
        ]
      }).then((admin) => {
        console.log(admin)
        if (admin.Administrator.role === 'superadmin') {
          return next()
        } else {
          return res.status(403).send({
            message: 'Unauthorized',
            success: false,
            errors: ['Unauthorized']
          })
        }
      })
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
