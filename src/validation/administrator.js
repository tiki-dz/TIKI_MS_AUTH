const { body } = require('express-validator/check')

exports.validate = (method) => {
  switch (method) {
    // eslint-disable-next-line no-lone-blocks
    case 'addClient': {
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
        body('city')
          .matches(/^[A-Za-z\s]+$/)
          .withMessage('city must be alphabetic.')
          .isLength({ min: 3 }),
        body('phoneNumber').isNumeric().isLength({ min: 9 }),
        body('sexe').isIn(['Homme', 'Femme']),
        body('birthDate').isDate()
      ]
    };
  }
}
