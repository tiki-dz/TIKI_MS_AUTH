const jwt = require('jsonwebtoken')
const config = process.env
const { Account } = require('../models')
const verifyToken = (req, res, next) => {
  const token = req.headers['x-access-token']
  if (!token) {
    return res.status(403).send({
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
        console.log('here')
        return res.status(401).send({
          success: false,
          message: 'Unauthorized'
        }
        )
      }
      return next()
    })
  } catch (err) {
    console.log(err)
    return res.status(401).send({
      message: 'jwt expired',
      success: false,
      errors: [err]
    })
  }
}
module.exports = verifyToken
