const express = require('express')
const router = express.Router()
const validationAdministrator = require('../validation/administrator')
const adminController = require('../controllers/admin')
const validationClient = require('../validation/client')
const verifyToken = require('../utils/verifyTokenAuthAdmin')
const verifyTokenAuthSuperAdmin = require('../utils/verifyTokenAuthSuperAdmin')

router.post('/signup', validationClient.validate('signup'), verifyTokenAuthSuperAdmin, adminController.signup)
router.post('/login', validationClient.validate('login'), adminController.login)
router.get('/profile', verifyToken, adminController.profile)

// *************************************************************************

// get all clients
router.get('/client', adminController.findAllClients)
// get one client by id
router.get('/client/:id', adminController.findClientById)
// add new client
router.post('/client', validationAdministrator.validate('addClient'), adminController.addClient)

// *************************************************************************

// activate client
router.put('/client/:id/activate', validationAdministrator.validate('activate'), adminController.activateClient)
// deactivate client
router.put('/client/:id/deactivate', validationAdministrator.validate('deactivate'), adminController.deactivateClient)

module.exports = router
