const { sequelize } = require('./models')
// const createError = require("http-errors")
const express = require('express')
const path = require('path')
const cookieParser = require('cookie-parser')
const logger = require('morgan')
const indexRouter = require('./routes/indexRoutes')
const rabbitMq = require('./utils')
const eurekaHelper = require('./eurekaHelper/eurekaHelper.js')
const fileUpload = require('express-fileupload')
// const { MESSAGE_BROKER_URL } = require('./config/config.js')
// const usersRouter = require("./routes/users");
// const Account = require("./models/Account");
// const User = require("./models/User");
const app = express()
// view engine setup
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'ejs')
app.use(logger('dev'))
app.use(express.static('Upload'))
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(cookieParser())
app.use(express.static(path.join(__dirname, 'public')))
app.use(
  fileUpload({
    createParentPath: true,
    safeFileNames: true
  })
)
app.use('/api', indexRouter)

// catch 404 and forward to error handler
sequelize.query('SET FOREIGN_KEY_CHECKS = 0').then(function () {
  sequelize.sync({ alter: true })
})
// sequelize.query('SET FOREIGN_KEY_CHECKS = 0').then(function () {
//   sequelize.sync({ force: false, alter: true })
// })

console.log('PORT', process.env.PORT)

app.listen(process.env.PORT)
module.exports = app
eurekaHelper.registerWithEureka('service-auth', process.env.PORT)

rabbitMq.CreatChannel()

console.log('server start on port 5001')
