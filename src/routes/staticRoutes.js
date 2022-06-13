const express = require('express')
const router = express.Router()
const statisticController = require('../controllers/statisticController')

router.get('/update', statisticController.update)

module.exports = router
