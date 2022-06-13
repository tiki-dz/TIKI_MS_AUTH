const express = require('express')
const router = express.Router()
const clientController = require('../controllers/clientController')
const validationClient = require('../validation/clientValidation')

// const checkifuserexist = require("../utils/checkifuserexist");
const verifyToken = require('../utils/verifyToken')
const verifyTokenAuth = require('../utils/verifyTokenAuth')
// sign up client
router.post('/signup', validationClient.validate('signup'), clientController.signup)
// verifyCode client
router.post('/verifyCode', verifyToken, validationClient.validate('verifyCode'), clientController.verifyCode)
// resendVerfication client
router.post('/resendVerfication', validationClient.validate('login'), clientController.resendVerficationCode)
// resetPassword client
router.put('/resetPassword', verifyTokenAuth, validationClient.validate('resetPassword'), clientController.resetPassword)
// router.post('/login', validationClient.validate('login'), clientController.login)
router.get('/profile', verifyTokenAuth, clientController.profile)
// router.get('/test', (req, rest) => { rest.send('test') })
// ************************************************************************************************
// updating an client with id
router.put('/', verifyTokenAuth, validationClient.validate('updateUser'), clientController.updateClientByToken)
// deleting an client with id
router.delete('/', verifyTokenAuth, clientController.deleteClientByToken)
// updating profil image client with id
// seting the storage rules
// setting filter
// the max size of an image is 20Mo
router.put('/updateimage', verifyTokenAuth, clientController.updateimage)
router.get('/notification', verifyTokenAuth, clientController.getNotification)
router.get('/notificationAll', verifyTokenAuth, clientController.getNotificationAll)
router.get('/faqs', verifyTokenAuth, clientController.getFaqFilterd)
router.get('/faqsCategory', verifyTokenAuth, clientController.getFaqCategory)

module.exports = router
