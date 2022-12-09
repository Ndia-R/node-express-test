const router = require("express").Router();
const { Users } = require("../../db/emerald/Users");

router.get("/users", (req, res) => {
  res.json(Users);
});

module.exports = router;
