/* ----------------------- Message broker ----------------------- */

const { MESSAGE_BROKER_URL, AUTH_BINDING_KEY } = require('../config/config.js')
const amqp = require('amqplib/callback_api')

// create a channel

module.exports.CreatChannel = () => {
  amqp.connect(MESSAGE_BROKER_URL, function (error0, connection) {
    if (error0) {
      console.log(error0)
      throw error0
    }
    console.log('succesfull connection with rabbitMq server')
    connection.createChannel(function (error1, channel) {
      module.exports.channel = channel
      // consume messages part
      channel.assertQueue(AUTH_BINDING_KEY, {
        durable: false
      })
      channel.consume(AUTH_BINDING_KEY, function (msg) { console.log(' [x] Received %s', msg.content.toString()) }, {
        // automatic acknowledgment mode,
        noAck: true
      })
    })
  })
  // TODO add the connection close method
}

// publish messages
module.exports.PublishMessage = (channel, BINDING_KEY, message) => {
  channel.assertQueue(BINDING_KEY, {
    durable: false
  })
  channel.sendToQueue(BINDING_KEY, Buffer.from(message), { persistent: true })
  console.log(' [x] send %s', message)
}
