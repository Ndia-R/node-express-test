const router = require("express").Router();
const { AppUsers } = require("../../db/emerald/AppUser");
const { AptitudeTestMst } = require("../../db/emerald/AptitudeTestMst");
const { AptitudeTestResults } = require("../../db/emerald/AptitudeTestResult");

router.get("/test-mst", (req, res) => {
  res.json(AptitudeTestMst);
});

router.get("/results", (req, res) => {
  const results = AptitudeTestResults.map((item) => {
    return {
      id: item.id,
      user: {
        id: item.appUserId,
        name: AppUsers.find((user) => {
          return user.id === item.appUserId;
        }).name,
        kana: AppUsers.find((user) => {
          return user.id === item.appUserId;
        }).kana,
      },
      test: {
        id: item.testId,
        name: AptitudeTestMst.find((mst) => {
          return mst.id === item.testId;
        }).name,
        score: item.score,
      },
    };
  });
  res.json(results);
});

router.get("/result/:id", (req, res) => {
  const id = req.params.id;
  const testResult = AptitudeTestResults.find((item) => item.id === Number(id));
  res.json(testResult);
});

router.post("/register", (req, res) => {
  const { userId, testId, score } = req.body;

  const id = Math.max(...AptitudeTestResults.map((item) => item.id)) + 1;
  const newTestResult = {
    id: id,
    appUserId: userId,
    testId: testId,
    score: score,
  };
  AptitudeTestResults.push(newTestResult);

  res.json(newTestResult);
});

module.exports = router;
