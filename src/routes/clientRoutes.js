const express = require('express')
const router = express.Router()
const clientController = require('../controllers/clientController')
const validationClient = require('../validation/clientValidation')

const multer = require('multer')
// const checkifuserexist = require("../utils/checkifuserexist");

const verifyToken = require('../utils/verifyToken')
const verifyTokenAuth = require('../utils/verifyTokenAuth')
router.post('/signup', validationClient.validate('signup'), clientController.signup)
router.post('/verifyCode', verifyToken, validationClient.validate('verifyCode'), clientController.verifyCode)
router.post('/resendVerfication', validationClient.validate('login'), clientController.resendVerficationCode)
router.post('/login', validationClient.validate('login'), clientController.login)
router.get('/profile', verifyTokenAuth, clientController.profile)
router.get('/test', (req, rest) => { rest.send('test') })

// ************************************************************************************************

// updating an client with id
router.put('/', verifyTokenAuth, validationClient.validate('updateUser'), clientController.updateClientByToken)
// deleting an client with id
router.delete('/', verifyTokenAuth, clientController.deleteClientByToken)
// updating profil image client with id
const upload = multer({ storage: multer.memoryStorage() })
router.post('/updateimage', verifyTokenAuth, upload.single('updateimage'), clientController.updateimage)

module.exports = router
