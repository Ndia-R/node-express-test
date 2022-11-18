const express = require("express");
const app = express();

const PORT = 5000;

const users = [
  { id: 1, name: "Julia", age: 24 },
  { id: 2, name: "Paul", age: 48 },
  { id: 3, name: "Steve", age: 28 },
];

app.use(express.json());

app.get("/", (req, res) => {
  res.send("test");
});

app.get("/users", (req, res) => {
  res.json(users);
});

app.get("/user/:id", (req, res) => {
  const id = req.params.id;
  const user = users.find((user) => user.id === Number(id));
  res.json(user);
});

app.listen(PORT, () => {
  console.log("server running");
});
