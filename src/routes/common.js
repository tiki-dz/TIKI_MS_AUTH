const express = require('express')
const router = express.Router()
const commonController = require('../controllers/common')
const validationCommon = require('../validation/common')
const validateAccountToken = require('../utils/verifyTokenValidateAccountForgetPassword')
const changePasswordToken = require('../utils/verifyTokenValidateAccountChangePassword')
router.post('/login',
  validationCommon.validate('login'),
  commonController.login)
router.post(
  '/forgetPasswordSendVerificationAccount',
  validationCommon.validate('forgetPasswordSendVerificationAccount'),
  commonController.forgetPasswordVerifyAccount
)
router.post(
  '/forgetPasswordValidateAccount',
  validateAccountToken,
  validationCommon.validate('forgetPasswordValidateAccount'),
  commonController.forgetPasswordValidateAccount
)
router.put(
  '/forgetPasswordChangePasswordAccount',
  changePasswordToken,
  validationCommon.validate('forgetPasswordChangePasswordAccount'),
  commonController.forgetPasswordChangePassword
)
module.exports = router
