/* eslint-disable no-useless-catch */
/* ----------------------- Message broker ----------------------- */
// const { amqplib } = require('amqplib')
const { MESSAGE_BROKER_URL, EXCHANGE_NAME } = require('../config/config.js')
const amqp = require('amqplib/callback_api')

// create a channel
module.exports.CreatChannel1 = () => {
  amqp.connect(MESSAGE_BROKER_URL, function (error0, connection) {
    if (error0) {
      throw error0
    }
    connection.createChannel(function (error1, channel) {
      const msg = 'Hello world'

      channel.assertQueue(EXCHANGE_NAME, {
        durable: false
      })
      channel.sendToQueue(EXCHANGE_NAME, Buffer.from(msg))
      console.log(' [x] Sent %s', msg)
    })
  })
}
// create a channel
// module.exports.CreatChannel = async () => {
//   try {
//     const connection = amqplib.connect(MESSAGE_BROKER_URL)
//     const channel = await connection.createChannel()
//     await channel.assertExchange(EXCHANGE_NAME, 'direct', false)
//     return channel
//   } catch (error) {
//     throw error
//   }
// }

// publish messages
// eslint-disable-next-line camelcase
module.exports.PublishMessage = async (channel, binding_key, message) => {
  try {
    await channel.publish(EXCHANGE_NAME, binding_key, Buffer.from(message))
  } catch (error) {
    throw error
  }
}

// subscribe messages
// eslint-disable-next-line camelcase
module.exports.SubscribeMessage = async (channel, service, binding_key) => {
  const appQueue = channel.assertQueue('QUEUE_NAME')
  channel.bindQueue(appQueue.queue, EXCHANGE_NAME, binding_key)
  channel.consume(appQueue.queue, data => {
    console.log('received data')
    console.log(data.content.toString())
    channel.ack(data)
  })
}
