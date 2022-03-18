var express = require("express");
var router = express.Router();

var clientRoutes = require("./client");
var partnerRoutes = require("./partner");
var adminRoutes = require("./admin");

router.use("/client", clientRoutes);

router.use("/partner", partnerRoutes);
router.use("/administrator", adminRoutes);

module.exports = router;
