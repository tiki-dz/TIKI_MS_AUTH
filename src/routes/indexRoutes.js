const express = require('express')
const router = express.Router()

const clientRoutes = require('./clientRoutes')
const partnerRoutes = require('./partnerRoutes')
const adminRoutes = require('./adminRoutes')

router.use('/client', clientRoutes)
router.use('/partner', partnerRoutes)
router.use('/admin', adminRoutes)

module.exports = router
