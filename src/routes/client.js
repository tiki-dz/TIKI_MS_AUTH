const express = require('express')
const router = express.Router()
const clientController = require('../controllers/client')
const validationClient = require('../validation/client')

const multer = require('multer')
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
router.put('/', verifyTokenAuth, validationClient.validate('updateUser'), clientController.updateById)
// deleting an client with id
router.delete('/', verifyTokenAuth, clientController.deleteById)
// updating profil image client with id
const upload = multer({ storage: multer.memoryStorage() })
router.post('/updateimage', verifyTokenAuth, upload.single('updateimage'), clientController.updateimage)

module.exports = router
