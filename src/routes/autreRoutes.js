const express = require('express')
const router = express.Router()
const autreRoutes = require('../controllers/autreController')

router.get('/cities', autreRoutes.getCities)

module.exports = router
