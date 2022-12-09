const router = require("express").Router();
const service = require("./aptitude-tests.service");

router.get("/", (req, res) => {
  const aptitudeTests = service.findAll();
  res.json(aptitudeTests);
});

router.get("/:id", (req, res) => {
  const { id } = req.params;
  const aptitudeTest = service.findOne(id);
  res.json(aptitudeTest);
});

router.post("/", (req, res) => {
  const { name, passScore } = req.body;
  const aptitudeTest = service.create({ name, passScore });
  res.json(aptitudeTest);
});

module.exports = router;
