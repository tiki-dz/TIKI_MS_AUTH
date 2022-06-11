/* eslint-disable node/handle-callback-err */
const Eureka = require('eureka-js-client').Eureka
const eurekaHost =
  process.env.EUREKA_CLIENT_SERVICEURL_DEFAULTZONE || '127.0.0.1'
const eurekaPort = 8761
const hostName = process.env.HOSTNAME || 'localhost'
const ipAddr = '172.0.0.1'
console.log(hostName)

exports.registerWithEureka = function (appName, PORT) {
  const client = new Eureka({
    instance: {
      instanceId: PORT,
      app: appName,
      hostName: hostName,
      ipAddr: ipAddr,
      statusPageUrl: 'http://localhost:8761',
      status: 'UP',
      port: {
        $: PORT
      },
      vipAddress: appName,
      dataCenterInfo: {
        '@class': 'com.netflix.appinfo.InstanceInfo$DefaultDataCenterInfo',
        name: 'MyOwn'
      }
    },
    eureka: {
      host: eurekaHost,
      port: eurekaPort,
      servicePath: '/eureka/apps/',
      maxRetries: 1,
      requestRetryDelay: 1
    }
  })
  client.logger.level('debug')
  client.start((error) => {
    console.log(error || 'user service registered')
  })
  function exitHandler (options, exitCode) {
    if (options.cleanup) console.log('clean')
    if (exitCode || exitCode === 0) console.log(exitCode)
    if (options.exit) {
      client.stop(function (error) {
        process.exit()
      })
    }
  }
  client.on('deregistered', () => {
    process.exit()
  })
  client.on('started', () => {
    console.log('eureka host  ' + eurekaHost)
  })
  process.on('exit', exitHandler.bind(null, { cleanup: true }))

  // catches ctrl+c event
  process.on('SIGINT', exitHandler.bind(null, { exit: true }))

  // catches "kill pid" (for example: nodemon restart)
  process.on('SIGUSR1', exitHandler.bind(null, { exit: true }))
  process.on('SIGUSR2', exitHandler.bind(null, { exit: true }))
  process.on('uncaughtException', exitHandler.bind(null, { exit: true }))
}
