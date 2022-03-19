const express = require('express')
const router = express.Router()
const clientController = require('../controllers/client')
const validationClient = require('../validation/client')
const verifyToken = require('../utils/verifyToken')

router.post('/signup',
  validationClient.validate('signup'),
  clientController.signup
)
router.post('/verifyCode',
  verifyToken,
  validationClient.validate('verifyCode'),
  clientController.verifyCode
)
router.post('/login',
  validationClient.validate('login'),
  clientController.login

)
router.get('/test', (req, rest) => {})

module.exports = router
