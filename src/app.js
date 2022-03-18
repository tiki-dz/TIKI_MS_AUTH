const { sequelize } = require('./models')
var createError = require("http-errors")
var express = require("express")
var path = require("path")
var cookieParser = require("cookie-parser")
var logger = require("morgan")

var indexRouter = require("./routes/index");
var usersRouter = require("./routes/users");
const Account = require("./models/Account");
const User = require("./models/User");

var app = express();

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.use("/api", indexRouter);
// catch 404 and forward to error handler
sequelize.query("SET FOREIGN_KEY_CHECKS = 0").then(function() {
  return sequelize.sync({ force: true });
});

app.listen(5001);

module.exports = app;
