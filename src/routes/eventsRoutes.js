const express = require('express')
const router = express.Router()
const tokenValidatorController = require('../controllers/tokenValidatorController')
/* GET users listing. */
router.get('/TokenCheck', tokenValidatorController.TokenCheck)

module.exports = router
