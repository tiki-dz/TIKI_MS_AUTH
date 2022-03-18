const express = require('express')
const router = express.Router()
const clientController = require('../controllers/client')
const validationClient = require('../validation/client')
// const checkifuserexist = require("../utils/checkifuserexist");
router.post('/signup',
  validationClient.validate('signup'),
  clientController.signup
)
router.get('/test', (req, rest) => {
  rest.send('test')
})
// ************************************************************************************************
// get all clients
router.get('/', (req, rest) => {
  // todo get all the client
})
// get client with id
router.get('/:id', (req, rest) => {
  // todo get client with id
})
// adding new client
router.post('/', validationClient.validate('add'), clientController.add)
// deleting an client with id
router.delete('/:id', (req, rest) => {
  // deleting an client with id
})

module.exports = router
