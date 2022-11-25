const router = require("express").Router();
const { Users } = require("../db/User");

router.get("/users", (req, res) => {
  res.json(Users);
});

module.exports = router;
