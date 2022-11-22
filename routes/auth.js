const router = require("express").Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const { body, validationResult } = require("express-validator");
const { Users } = require("../db/User");

router.post(
  "/sign-up",
  body("username").notEmpty(),
  body("password").notEmpty(),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { username, password } = req.body;

    const user = Users.find((user) => user.username === username);
    if (user) {
      return res
        .status(409)
        .json({ message: "すでにユーザーが存在しています" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = {
      id: Math.max(...Users.map((user) => user.id)) + 1,
      username,
      password: hashedPassword,
      email: `${username}@gmail.com`,
    };
    Users.push(newUser);

    const payload = { username };

    const access_token = await jwt.sign(payload, "SECRET_KEY_ACCESS", {
      expiresIn: "1m",
      audience: "emerald",
      issuer: "emerald",
      subject: newUser.id.toString(),
    });

    res.json({
      access_token: access_token,
    });
  }
);

router.post(
  "/sign-in",
  body("username").notEmpty(),
  body("password").notEmpty(),
  async (req, res) => {
    const { username, password } = req.body;

    const user = Users.find((user) => user.username === username);
    if (!user) {
      return res.status(400).json({ message: "そのユーザーは存在しません" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "パスワードが違います" });
    }

    const payload = { username };
    const access_token = await jwt.sign(payload, "SECRET_KEY_ACCESS", {
      expiresIn: "1m",
    });

    res.json({
      access_token: access_token,
    });
  }
);

module.exports = router;
