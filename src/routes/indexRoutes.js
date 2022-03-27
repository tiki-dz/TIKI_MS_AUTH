const express = require('express')
const router = express.Router()

const clientRoutes = require('./client')
const partnerRoutes = require('./partner')
const adminRoutes = require('./admin')

router.use('/client', clientRoutes)
router.use('/partner', partnerRoutes)
router.use('/admin', adminRoutes)

module.exports = router
