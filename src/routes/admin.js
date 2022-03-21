const express = require('express')
const router = express.Router()
const adminController = require('../controllers/admin')
const validationClient = require('../validation/client')
const verifyToken = require('../utils/verifyTokenAuthAdmin')
router.post('/signup',
  validationClient.validate('signup'),
  adminController.signup
)
router.post('/login',
  validationClient.validate('login'),
  adminController.login
)
router.get('/profile', verifyToken, adminController.profile)
module.exports = router
