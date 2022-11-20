const router = require("express").Router();
const { Users } = require("../db/User");
const { checkJWT } = require("../middleware/checkJWT");

router.get("/users", checkJWT, (req, res) => {
  res.json(Users);
});

module.exports = router;
