const express = require("express");
const app = express();

const PORT = 5000;

app.get("/", (req, res) => {
  res.json({ id: 1, name: "Julia", age: 24 });
});

app.listen(PORT, () => {
  console.log("server running");
});
