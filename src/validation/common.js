/* eslint-disable no-lone-blocks */
const { body } = require('express-validator/check')

exports.validate = (method) => {
  switch (method) {
    case 'login': {
      return [
        body('email', 'Invalid email format').isEmail(),
        body('password', 'Invalid value min length 8').isLength({ min: 8 })
      ]
    }
  }
}
