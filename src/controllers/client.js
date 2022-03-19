const { validationResult } = require('express-validator/check')
const { User } = require('../models')
const { Account } = require('../models')
const { Client } = require('../models')
function login (req, res, next) {}

function signup (req, res, next) {
  // check id data is validated
  const errors = validationResult(req) // Finds the validation errors in this request and wraps them in an object with handy functions
  if (!errors.isEmpty()) {
    res.status(422).json({ errors: errors.array() })
    return
  }
  try {
    return res.send('test')
  } catch (e) {

  }

  // if data is validated add in database;
}

// ****************************************************************************************************

async function deleteById (req, res) {
  try {
    const id = parseInt(req.params.id)
    console.log('deleting Client with id = ', id)
    const client = await Client.findOne({
      where: {
        idClient: id
      }
    })
    const user = await User.findOne({
      where: {
        idUser: client.dataValues.idUser
      }
    })
    await Account.destroy({
      where: {
        email: user.dataValues.email
      }
    })
    await User.destroy({
      where: {
        idUser: client.dataValues.idUser
      }
    })
    await Client.destroy({
      where: {
        idClient: id
      }
    })
    return res.status(200).send('deleting the user')
  } catch (error) {
    res.status(400).send(error)
  }
}

async function updateById (req, res) {
  // check id data is validated
  const errors = validationResult(req) // Finds the validation errors in this request and wraps them in an object with handy functions
  if (!errors.isEmpty()) {
    res.status(422).json({ errors: errors.array() })
    return
  }
  try {
    const id = parseInt(req.params.id)
    const data = req.body
    const userId = await Client.findOne({
      where: {
        idClient: id
      },
      attributes: ['idUser']
    })
    console.log(userId)

    const userToUpdate = await User.findOne({
      where: {
        idUser: userId.dataValues.idUser
      }
    })
    userToUpdate.firstName = data.firstName
    userToUpdate.lastName = data.lastName
    userToUpdate.city = data.city
    userToUpdate.type = 'client'
    userToUpdate.phoneNumber = data.phoneNumber
    userToUpdate.sexe = data.sexe
    userToUpdate.birthDate = data.birthDate
    await userToUpdate.save()
    console.log(userToUpdate)
    return res.status(200).send({ userUpdated: userToUpdate.toJSON() })
  } catch (error) {
    res.status(400).send(error)
  }
}

module.exports = { login, signup, deleteById, updateById }
