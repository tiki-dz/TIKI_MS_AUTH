const express = require('express')
const router = express.Router()
const partnerController = require('../controllers/partner')
const validationPartner = require('../validation/partner')
const verifyToken = require('../utils/verifyTokenPartner')
const verifyTokenAuth = require('../utils/verifyTokenAuthPartner')
router.post('/signup',
  validationPartner.validate('signup'),
  partnerController.signup
)
router.post('/verifyCode',
  verifyToken,
  validationPartner.validate('verifyCode'),
  partnerController.verifyCode
)
// router.post('/login', validationPartner.validate('login'), partnerController.login)
router.get('/profile', verifyTokenAuth, partnerController.profile)
router.post('/resendVerfication', validationPartner.validate('login'), partnerController.resendVerficationCode)
module.exports = router
