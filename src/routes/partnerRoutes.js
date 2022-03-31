const express = require('express')
const router = express.Router()
const partnerController = require('../controllers/partnerController')
const validationPartner = require('../validation/partnerValidation')
const validationClient = require('../validation/clientValidation')
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
router.put('/resetPassword', verifyTokenAuth, validationClient.validate('resetPassword'), partnerController.resetPassword)

module.exports = router
