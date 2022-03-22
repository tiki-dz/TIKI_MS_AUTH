const express = require('express')
const router = express.Router()
const administratorController = require('../controllers/administrator')
const validationAdministrator = require('../validation/administrator')
const adminController = require('../controllers/admin')
const validationClient = require('../validation/client')

const verifyToken = require('../utils/verifyTokenAuthAdmin')
const verifyTokenAuthSuperAdmin = require('../utils/verifyTokenAuthSuperAdmin')
router.post('/signup',
  validationClient.validate('signup'),
  verifyTokenAuthSuperAdmin,
  adminController.signup
)
router.post('/login',
  validationClient.validate('login'),
  adminController.login
)
router.get('/profile', verifyToken, adminController.profile)

// *************************************************************************

// get all clients
router.get('/client', administratorController.findAllClients)
// get one client by id
router.get('/client/:id', administratorController.findClientById)
// add new client
router.post('/client', validationAdministrator.validate('addClient'), administratorController.addClient)

// *************************************************************************

// activate client
router.get('/client/:id/activate', administratorController.activateClient)
// deactivate client
router.get('/client/:id/deactivate', administratorController.deactivateClient)

module.exports = router
