const router = require("express").Router();
const { Users } = require("../../db/auth/User");

router.get("/users", (req, res) => {
  res.json(Users);
});

module.exports = router;
