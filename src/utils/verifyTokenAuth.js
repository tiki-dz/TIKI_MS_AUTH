const jwt = require('jsonwebtoken')

const config = process.env

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
    jwt.verify(token, config.JWT_AUTH_KEY)
    
  } catch (err) {
    return res.status(401).send('Invalid Token')
  }
  return next()
}

module.exports = verifyToken
