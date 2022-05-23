const jwt = require('jsonwebtoken')
const { User, Client } = require('../models')
async function addScoreToClient (payload) {
  try {
    const email = jwt.verify(payload.token, process.env.JWT_AUTH_KEY)
    const idUser = await User.findOne({
      where: {
        AccountEmail: email.email
      },
      attributes: ['idUser']
    })
    const client = await Client.findOne({
      where: {
        UserIdUser: idUser.idUser
      }
    })
    client.score += payload.score

    client.save()
    console.log('score updated')
  } catch (error) {
    console.log(error)
  }
}

module.exports = { addScoreToClient }
