const express = require('express')
const router = express.Router()
const validationAdministrator = require('../validation/administratorValidation')
const adminController = require('../controllers/adminController')
const validationClient = require('../validation/clientValidation')
const verifyToken = require('../utils/verifyTokenAuthAdmin')
const verifyTokenAuthSuperAdmin = require('../utils/verifyTokenAuthSuperAdmin')

router.post('/signup', validationClient.validate('signup'), verifyTokenAuthSuperAdmin, adminController.signup)
router.post('/login', validationClient.validate('login'), adminController.login)
router.get('/profile', verifyToken, adminController.profile)

// *************************************************************************

// get all clients
router.get('/client', verifyToken, adminController.findAllClients)
// get one client by id
router.get('/client/:id', verifyToken, adminController.findClientById)
// add new client
router.post('/client', validationAdministrator.validate('addClient'), verifyToken, adminController.addClient)

// *************************************************************************

// activate client
router.put('/client/:id/activate', validationAdministrator.validate('activate'), verifyToken, adminController.activateClient)
// deactivate client
router.put('/client/:id/deactivate', validationAdministrator.validate('deactivate'), verifyToken, adminController.deactivateClient)

// add new admin
router.post('/admin', validationAdministrator.validate('addClient'), verifyToken, adminController.addAdmin)
router.post('/notification', validationAdministrator.validate('notification'), verifyToken, adminController.sendNotification)
router.post('/notificationAll', validationAdministrator.validate('notificationAll'), verifyToken, adminController.sendNotificationAll)
router.post('/notification/scheduled', validationAdministrator.validate('notificationSh'), verifyToken, adminController.scheduledNotification)
router.post('/faqCategorie', validationAdministrator.validate('faqCategorie'), verifyToken, adminController.addFaqCategorie)
router.delete('/faqCategorie/:id', validationAdministrator.validate('deletefaqCategorie'), verifyToken, adminController.deleteFaqCategorie)
router.get('/faqCategorie', adminController.getFaqCategorie)
router.post('/faq', verifyToken, validationAdministrator.validate('addFaq'), adminController.addFaq)
router.delete('/faq/:id', verifyToken, validationAdministrator.validate('deletefaqCategorie'), adminController.deleteFaq)
router.patch('/faq/:id', verifyToken, validationAdministrator.validate('patchFaq'), adminController.patchFaq)
router.patch('/faqCategorie/:id', verifyToken, validationAdministrator.validate('patchFaq'), adminController.patchFaqCategorie)
module.exports = router
