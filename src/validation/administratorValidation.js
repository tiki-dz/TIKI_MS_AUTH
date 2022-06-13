const { body } = require('express-validator/check')
const { param } = require('express-validator/check')

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
        body('phoneNumber', 'PhoneNumber Invalid value min and max length 9').isNumeric().isLength({ min: 10, max: 10 }),
        body('sexe').isIn(['Homme', 'Femme']),
        body('birthDate').isDate()
      ]
    };
    case 'activate': {
      return [
        body('state', 'Invalid state').isIn([1]),
        body('email', 'Invalid email').isEmail()
      ]
    }
    case 'deactivate': {
      return [
        body('state', 'Invalid state').isIn([2]),
        body('email', 'Invalid email').isEmail()
      ]
    }
    case 'notification': {
      return [
        body('title', 'Invalid title').isLength({ min: 1 }),
        body('body', 'Invalid body').isLength({ min: 1 }),
        body('email', 'Id must be a number').isEmail()
      ]
    }
    case 'notificationSh': {
      return [
        body('title', 'Invalid title').isLength({ min: 1 }),
        body('body', 'Invalid body').isLength({ min: 1 }),
        body('email', 'Id must be a number').isEmail(),
        body('date').isLength({ min: 1 }),
        body('hour').isLength({ min: 1 })
      ]
    }
    case 'notificationAll': {
      return [
        body('title', 'Invalid title').isLength({ min: 1 }),
        body('body', 'Invalid body').isLength({ min: 1 }),
        body('topic', 'Invalid topic').isLength({ min: 1 })
      ]
    }
    case 'faqCategorie': {
      return [
        body('name', 'Invalid title').isLength({ min: 1 })
      ]
    }
    case 'deletefaqCategorie': {
      return [
        param('id', 'Invalid is').isNumeric()
      ]
    }
    case 'addFaq': {
      return [
        body('id', 'Invalid is').isNumeric(),
        body('question', 'Invalid question').isLength({ min: 1 }),
        body('reponse', 'Invalid reponse').isLength({ min: 1 })
      ]
    }
    case 'patchFaq': {
      return [
        param('id', 'Invalid is').isNumeric()
      ]
    }
  }
}
