const router = require("express").Router();
const { TestResults } = require("../db/TestResult");

router.get("/test-results", (req, res) => {
  res.json(TestResults);
});

router.get("/test-result/:id", (req, res) => {
  const id = req.params.id;
  const testResult = TestResults.find((item) => item.id === Number(id));
  res.json(testResult);
});

module.exports = router;
