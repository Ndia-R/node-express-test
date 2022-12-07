const router = require("express").Router();
const { AppUsers } = require("../../db/emerald/AppUser");

router.get("/app-users", (req, res) => {
  res.json(AppUsers);
});

module.exports = router;
