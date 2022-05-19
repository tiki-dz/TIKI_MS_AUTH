/* eslint-disable no-lone-blocks */
const { body } = require('express-validator/check')

exports.validate = (method) => {
  switch (method) {
    case 'resetPassword': {
      return [
        body('password', 'Invalid value min length 8').isLength({ min: 8 }),
        body('newPassword', 'Invalid value min length 8').isLength({ min: 8 })
      ]
    }
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
    // eslint-disable-next-line no-lone-blocks
    case 'updateUser': {
      return [
        body('firstName')
          .matches(/^[A-Za-z\s]+$/)
          .withMessage('Name must be alphabetic.')
          .isLength({ min: 3 })
          .optional({ nullable: true }),
        body('lastName')
          .matches(/^[A-Za-z\s]+$/)
          .withMessage('lastname must be alphabetic.')
          .isLength({ min: 3 })
          .optional({ nullable: true }),
        body('city')
          .matches(/^[A-Za-z\s]+$/)
          .withMessage('city must be alphabetic.')
          .isLength({ min: 3 })
          .optional({ nullable: true }),
        body('phoneNumber', 'PhoneNumber Invalid value min and max length 10').isNumeric().isLength({ min: 10, max: 10 }).optional({ nullable: true }),
        body('sexe').isIn(['Homme', 'Femme']).optional({ nullable: true })
      ]
    };
    case 'verifyCode': {
      return [
        body('email', 'Invalid email format').isEmail(),
        body('code').isNumeric().isLength({ min: 6, max: 6 }),
        body('fcm_token').isLength({ min: 1 })
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
