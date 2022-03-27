const express = require('express')
const router = express.Router()

const clientRoutes = require('./client')
const partnerRoutes = require('./partner')
const adminRoutes = require('./admin')
const commonRoutes = require('./common')
router.use('/client', clientRoutes)
router.use('/partner', partnerRoutes)
router.use('/admin', adminRoutes)
router.use('/common', commonRoutes)
module.exports = router
