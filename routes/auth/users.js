const router = require("express").Router();
const { Users } = require("../../db/auth/Users");

router.get("/", (req, res) => {
  res.json(Users);
});

module.exports = router;
