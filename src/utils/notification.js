const serviceAccount = require('./plasti-d9fd7-firebase-adminsdk-5rbqe-6535d94ad2.json')
const admin = require('firebase-admin')
admin.initializeApp({
  projectId: serviceAccount.project_id,
  credential: admin.credential.cert(serviceAccount)
})
const notificationOptions = {
  priority: 'high',
  timeToLive: 60 * 60 * 24
}
function sendNotifToOneUser (req, res, tokenDevice) {
  admin.messaging().sendToDevice(tokenDevice, {
    notification: {
      title: req.body.title,
      body: req.body.body
    }
  }, notificationOptions)
    .then(response => {
      console.log(response)
      return res.status(200).send({ message: 'notification sended successfully', data: req.body, success: true })
    })
    // eslint-disable-next-line node/handle-callback-err
    .catch(error => {
      return res.status(500).send({ message: 'notification failed', data: req.body, success: false })
    })
}
function sendNotifToTopic (req, res, topic) {
  admin.messaging().sendToTopic(topic, {
    notification: {
      title: req.body.title,
      body: req.body.body
    }
  }, notificationOptions)
    .then(response => {
      res.status(200).send({ message: 'notification sended successfully', data: req.body, success: true })
    })
    // eslint-disable-next-line node/handle-callback-err
    .catch(error => {
      console.log(error)
      res.status(500).send({ message: 'notification failed', data: req.body, success: false })
    })
}

module.exports = { sendNotifToOneUser, sendNotifToTopic }
