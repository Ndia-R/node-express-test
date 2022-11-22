const router = require("express").Router();
const { Users } = require("../db/User");
const passport = require("passport");

router.get(
  "/users",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    res.json(Users);
  }
);

module.exports = router;
