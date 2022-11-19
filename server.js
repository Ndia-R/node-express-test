const express = require("express");
const app = express();

const PORT = 5000;

const users = [
  { id: 1, username: "Julia", password: "password", email: "julia@gmail.com" },
  { id: 2, username: "Paul", password: "password", email: "paul@gmail.com" },
  { id: 3, username: "Steve", password: "password", email: "steve@gmail.com" },
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

app.post("/sign-up", (req, res) => {
  const username = req.body.username;
  const password = req.body.password;
  const exists = users.find((user) => user.username === username);
  if (exists) {
    res.status(409).json({
      message: "すでにユーザーが存在しています",
    });
    return;
  }
  const user = {
    id: Math.max(...users.map((user) => user.id)) + 1,
    username,
    password,
    email: `${username}@gmail.com`,
  };
  users.push(user);
  res.json(user);
});

app.listen(PORT, () => {
  console.log("server running");
});
