const express = require('express')
const router = express.Router()

const clientRoutes = require('./clientRoutes')
const partnerRoutes = require('./partnerRoutes')
const adminRoutes = require('./adminRoutes')
const commonRoutes = require('./common')
const eventsRoutes = require('./eventsRoutes')
router.use('/client', clientRoutes)
router.use('/partner', partnerRoutes)
router.use('/admin', adminRoutes)
router.use('/common', commonRoutes)
router.use('/', eventsRoutes)
module.exports = router
