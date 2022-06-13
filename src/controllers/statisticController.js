const { User, Client, Account, Partner } = require('../models')
const { STATISTIC_BINDING_KEY } = require('../config/config.js')
const rabbitMq = require('../utils')

async function update (req, res) {
  try {
    const totalClient = await Client.count()
    const manClient = await User.count({
      where: { type: 'client', sexe: 1 }
    })
    const womenClient = await User.count({
      where: { type: 'client', sexe: 0 }
    })
    const deactivatedClient = await User.count({
      where: { type: 'client' },
      include: [
        {
          model: Account,
          attributes: [],
          where: {
            state: 2
          }
        }
      ]
    })
    const activatedClient = await User.count({
      where: { type: 'client' },
      include: [
        {
          model: Account,
          attributes: [],
          where: {
            state: 1
          }
        }
      ]
    })

    const totalPartner = await Partner.count()

    const deactivatedPartner = await User.count({
      where: { type: 'partner' },
      include: [
        {
          model: Account,
          attributes: [],
          where: {
            state: 2
          }
        }
      ]
    })
    const activatedPartner = await User.count({
      where: { type: 'partner' },
      include: [
        {
          model: Account,
          attributes: [],
          where: {
            state: 1
          }
        }
      ]
    })

    const channel = rabbitMq.channel
    const payload = { totalClient: totalClient, manClient: manClient, womenClient: womenClient, activatedClient: activatedClient, deactivatedClient: deactivatedClient, totalPartner: totalPartner, deactivatedPartner: deactivatedPartner, activatedPartner: activatedPartner }
    const message = [{ event: 'UPDATE-USER-STAT', payload: payload }]
    rabbitMq.PublishMessage(channel, STATISTIC_BINDING_KEY, message)
    console.log('published new event')

    return res.status(200).send({ success: true, message: 'success' })
  } catch (error) {
    return res.status(500).send({ error: error, success: false, message: 'processing err' })
  }
}

module.exports = { update }
