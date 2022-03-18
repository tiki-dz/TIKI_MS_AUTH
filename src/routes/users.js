var express = require("express");
var router = express.Router();

/* GET users listing. */
router.get("/", function (req, res, next) {
  res.send("respond with a resource");
});

var cb1 = function (req, res, next) {
  console.log("CB1");
  next();
};

module.exports = router;
