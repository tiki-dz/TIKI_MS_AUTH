require('dotenv').config()
const { validationResult } = require('express-validator/check')
const { User, Administrator } = require('../models')
const jwt = require('jsonwebtoken')

// adding one client
async function TokenCheck (req, res) {
// check id data is validated
  const errors = validationResult(req) // Finds the validation errors in this request and wraps them in an object with handy functions
  if (!errors.isEmpty()) {
    res.status(422).json({ errors: errors.array(), success: false, message: 'invalid data' })
    return
  }
  try {
    const role = req.headers.role
    const token = req.headers['x-access-token']
    const decodedToken = jwt.verify(token, process.env.JWT_AUTHADMIN_KEY)
    const user = await User.findOne({
      where: {
        AccountEmail: decodedToken.email
      }
    })
    if (user) {
      if (role === user.type) {
        if (role === 'admin') {
          const admin = await Administrator.findOne({
            where: {
              UserIdUser: user.idUser
            }
          })
          res.status(200).send({ data: { message: 'the token is valide', adminId: admin.idAdministrator }, success: true, message: 'success' })
        } else {
          res.status(200).send({ data: { message: 'the token is valide' }, success: true, message: 'success' })
        }
      } else {
        res.status(400).send({ error: 'role err', success: false, message: 'processing err' })
      }
    } else {
      res.status(400).send({ error: 'user unknown', success: false, message: 'processing err' })
    }
  } catch (e) {
    res.status(500).send({ error: e, success: false, message: 'processing err' })
  }

// if data is validated add in database;
}

module.exports = { TokenCheck }
