const jwt = require('jsonwebtoken')
const { UserPartnerInvalid } = require('../models')
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
    const decodedToken = jwt.verify(token, config.JWT_NOTAUTHPARTNER_KEY)
    UserPartnerInvalid.findOne({
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
  } catch (err) {
    return res.status(401).send({
      success: false,
      message: 'A valid token is required for authentication',
      errors: ['please enter a valid token']
    })
  }
}
module.exports = verifyToken
