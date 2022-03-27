const express = require('express')
const router = express.Router()
const commonController = require('../controllers/common')
const validationCommon = require('../validation/common')
router.post('/login',
  validationCommon.validate('login'),
  commonController.login)
module.exports = router
