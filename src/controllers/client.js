const { validationResult } = require('express-validator/check')

function login (req, res, next) {}

function signup (req, res, next) {
  // check id data is validated
  const errors = validationResult(req) // Finds the validation errors in this request and wraps them in an object with handy functions
  if (!errors.isEmpty()) {
    res.status(422).json({ errors: errors.array() })
    return
  }
  try {
    return res.send('test')
  } catch (e) {

  }

  // if data is validated add in database;
}

module.exports = { login, signup }
