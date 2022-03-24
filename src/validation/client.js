/* eslint-disable no-lone-blocks */
const { body } = require('express-validator/check')

exports.validate = (method) => {
  switch (method) {
    case 'signup': {
      return [
        body('email', 'Invalid email format').isEmail(),
        body('password', 'Invalid value min length 8').isLength({ min: 8 }),
        body('firstName')
          .matches(/^[A-Za-z\s]+$/)
          .withMessage('Name must be alphabetic.')
          .isLength({ min: 3 }),
        body('lastName')
          .matches(/^[A-Za-z\s]+$/)
          .withMessage('lastname must be alphabetic.')
          .isLength({ min: 3 }),
        body('birthDate').isDate()
      ]
    };
    case 'verifyCode': {
      return [
        body('email', 'Invalid email format').isEmail(),
        body('code').isNumeric().isLength({ min: 6, max: 6 })
      ]
    };
    case 'login': {
      return [
        body('email', 'Invalid email format').isEmail(),
        body('password', 'Invalid value min length 8').isLength({ min: 8 })
      ]
    }
  }
}
