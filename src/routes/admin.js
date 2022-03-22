const express = require('express')
const router = express.Router()
const administratorController = require('../controllers/administrator')
const validationAdministrator = require('../validation/administrator')

// get all clients
router.get('/client', administratorController.findAllClients)
router.get('/client/:id', administratorController.findClientById)
router.put('/client/:id/activate', validationAdministrator.validate('activate'), administratorController.activateClient)
router.put('/client/:id/deactivate', validationAdministrator.validate('deactivate'), administratorController.deactivateClient)

router.post('/client', validationAdministrator.validate('addClient'), administratorController.addClient)

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
