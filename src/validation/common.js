/* eslint-disable no-lone-blocks */
const { body } = require('express-validator/check')

exports.validate = (method) => {
  switch (method) {
    case 'login': {
      return [
        body('email', 'Invalid email format').isEmail(),
        body('password', 'Invalid value min length 8').isLength({ min: 8 }),
        body('fcm_token').isLength({ min: 1 })
      ]
    }
    case 'forgetPasswordSendVerificationAccount' : {
      return [
        body('email', 'Invalid email format').isEmail()
      ]
    }
    case 'forgetPasswordValidateAccount' : {
      return [
        body('email', 'Invalid email format').isEmail(),
        body('code').isNumeric().isLength({ min: 6, max: 6 })
      ]
    }
    case 'forgetPasswordChangePasswordAccount' : {
      return [
        body('email', 'Invalid email format').isEmail(),
        body('password', 'Invalid value min length 8').isLength({ min: 8 })
      ]
    }
  }
}
