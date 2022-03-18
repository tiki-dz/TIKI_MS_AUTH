const express = require('express')
const router = express.Router()
const clientController = require('../controllers/client')
const validationClient = require('../validation/client')
// const checkifuserexist = require("../utils/checkifuserexist");
router.post('/signup',
  validationClient.validate('signup'),
  clientController.signup
)

module.exports = router
