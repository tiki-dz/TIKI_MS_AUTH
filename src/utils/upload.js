const serviceAccount = require('./plasti-d9fd7-firebase-adminsdk-5rbqe-6535d94ad2.json')
const admin = require('firebase-admin')
admin.initializeApp({
  projectId: serviceAccount.project_id,
  credential: admin.credential.cert(serviceAccount),
  // update this
  storageBucket: 'gs://plasti-d9fd7.appspot.com/' // update this
}, 'ms-auth')
function uploadImage (imageBytes64Str) {
  const timestamp = new Date().getUTCMilliseconds()

  const bucket = admin.storage().bucket('plasti-d9fd7.appspot.com')
  const imageBuffer = Buffer.from(imageBytes64Str, 'base64')
  const imageByteArray = new Uint8Array(imageBuffer)
  const file = bucket.file('images/events/' + timestamp + '.png')
  const options = { resumable: false, metadata: { contentType: 'image/jpg' } }
  // options may not be necessary
  return file
    .save(imageByteArray, options)
    .then(function (stuff) {
      return file.getSignedUrl({
        action: 'read',
        expires: '03-09-2500'
      })
    })
    .then(function (urls) {
      const url = urls[0]
      console.log('Image url = '.concat(url))
      return url
    })
    .catch(function (err) {
      console.log('Unable to upload image'.concat(err))
    })
}
module.exports = uploadImage
