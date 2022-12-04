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

router.post("/test-result", (req, res) => {
  const { score, testName } = req.body;

  const id = Math.max(...TestResults.map((t) => t.id)) + 1;
  const newItem = {
    id: id,
    userId: id,
    score: score,
    testName: testName,
  };
  TestResults.push(newItem);

  res.json(newItem);
});

module.exports = router;
