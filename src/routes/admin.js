const express = require('express')
const router = express.Router()
const administratorController = require('../controllers/administrator')
const validationAdministrator = require('../validation/administrator')

// get all clients
router.get('/client', administratorController.findAllClients)
// get client with id
router.get('/client/:id', administratorController.findClientById)
// adding new client
router.post('/client', validationAdministrator.validate('addClient'), administratorController.addClient)

module.exports = router
