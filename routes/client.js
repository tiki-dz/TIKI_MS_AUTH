var express = require("express");
var router = express.Router();
var clientController = require("../controllers/client");
var validationClient = require("../validation/client");
var checkifuserexist = require("../utils/checkifuserexist");
router.post(
  "/signup",
  validationClient.validate("signup"),
  clientController.signup
);

module.exports = router;
