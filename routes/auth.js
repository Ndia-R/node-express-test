const router = require("express").Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");

const { body, validationResult } = require("express-validator");
const { Users } = require("../db/User");

const createRandomString = (N) => {
  const S = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  return Array.from(crypto.randomFillSync(new Uint8Array(N)))
    .map((n) => S[n % S.length])
    .join("");
};

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
      refresh_token: createRandomString(32),
    };
    Users.push(newUser);
    console.log(newUser);

    const payload = { username: newUser.username };

    const access_token = await jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: "1m",
      audience: process.env.JWT_AUDIENCE,
      issuer: process.env.JWT_ISSUER,
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
    const isMatch = await bcrypt.compare(password, user.password);
    if (!user || !isMatch) {
      return res
        .status(401)
        .json({ message: "ユーザー名またはパスワードが違います" });
    }

    const payload = { username: user.username };
    const access_token = await jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: "1m",
      audience: process.env.JWT_AUDIENCE,
      issuer: process.env.JWT_ISSUER,
      subject: user.id.toString(),
    });

    res.json({
      access_token: access_token,
    });
  }
);

module.exports = router;
