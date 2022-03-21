const express = require('express')
const router = express.Router()
const clientController = require('../controllers/client')
const validationClient = require('../validation/client')

const multer = require('multer')
// const checkifuserexist = require("../utils/checkifuserexist");

const verifyToken = require('../utils/verifyToken')
const verifyTokenAuth = require('../utils/verifyTokenAuth')
router.post('/signup',
  validationClient.validate('signup'),
  clientController.signup
)

router.get('/test', (req, rest) => {
  rest.send('test')
})
// ************************************************************************************************

router.delete('/:id', clientController.deleteById)
// updating an client with id
router.put('/:id', validationClient.validate('updateUser'), clientController.updateById)
// updating profil image client with id
const upload = multer({ storage: multer.memoryStorage() })
router.post('/:id/updateimage', upload.single('updateimage'), clientController.updateimage)

router.post('/verifyCode',
  verifyToken,
  validationClient.validate('verifyCode'),
  clientController.verifyCode
)
router.post('/login',
  validationClient.validate('login'),
  clientController.login
)
router.get('/profile', verifyTokenAuth, clientController.profile)
router.post('/resendVerfication', validationClient.validate('login'), clientController.resendVerficationCode)

module.exports = router
