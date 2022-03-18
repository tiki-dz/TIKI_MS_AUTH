var { Account } = require("../models");

function checkUser(req, res, next) {
  console.log(req.body.email);
  Account.count({ where: { email: "email" } }).then((count) => {
    if (count == 0) {
      next();
    }
    return res.status(312).send("re");
  });
}
module.exports = { checkUser };
