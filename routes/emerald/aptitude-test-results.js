const router = require("express").Router();
const { Users } = require("../../db/emerald/Users");
const { AptitudeTestMst } = require("../../db/emerald/AptitudeTestMst");
const { AptitudeTestResults } = require("../../db/emerald/AptitudeTestResults");

router.get("/", (req, res) => {
  const testResults = AptitudeTestResults.map((item) => {
    return {
      id: item.id,
      user: {
        id: item.userId,
        name: Users.find((x) => x.id === item.userId).name,
        kana: Users.find((x) => x.id === item.userId).kana,
      },
      test: {
        id: item.testId,
        name: AptitudeTestMst.find((x) => x.id === item.testId).name,
        score: item.score,
      },
    };
  });

  res.json(testResults);
});

router.get("/:id", (req, res) => {
  const { id } = req.params;
  const testResult = AptitudeTestResults.find((x) => x.id === Number(id));

  res.json(testResult);
});

router.post("/", (req, res) => {
  const { userId, testId, score } = req.body;
  const id = Math.max(...AptitudeTestResults.map((x) => x.id)) + 1;
  const newTestResult = {
    id: id,
    userId: userId,
    testId: testId,
    score: score,
  };
  AptitudeTestResults.push(newTestResult);

  res.json(newTestResult);
});

module.exports = router;
