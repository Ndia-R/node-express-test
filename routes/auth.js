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
    // bodyのバリデーションチェック
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // ユーザーの存在チェック
    const { username, password } = req.body;
    const user = Users.find((user) => user.username === username);
    if (user) {
      return res
        .status(409)
        .json({ message: "すでにユーザーが存在しています" });
    }

    // パスワードのハッシュ化
    const hashedPassword = await bcrypt.hash(password, 10);

    // 新規ユーザー作成
    const newUser = {
      id: Math.max(...Users.map((user) => user.id)) + 1,
      username,
      password: hashedPassword,
      email: `${username}@gmail.com`,
      refresh_token: "",
    };
    Users.push(newUser);
    console.log(newUser);

    // アクセストークン作成
    const payload = { username: newUser.username };

    const access_token = await jwt.sign(
      payload,
      process.env.JWT_SECRET_ACCESS,
      {
        expiresIn: "1m",
        audience: process.env.JWT_AUDIENCE,
        issuer: process.env.JWT_ISSUER,
        subject: newUser.id.toString(),
      }
    );

    // リフレッシュトークン作成
    const refresh_token = await jwt.sign(
      payload,
      process.env.JWT_SECRET_REFRESH,
      {
        expiresIn: "5m",
        audience: process.env.JWT_AUDIENCE,
        issuer: process.env.JWT_ISSUER,
        subject: newUser.id.toString(),
      }
    );

    // リフレッシュトークンをクッキーへ保存
    res.cookie("refresh_token", refresh_token, {
      httpOnly: true,
      secure: false,
    });

    // リフレッシュトークンをＤＢへ保存
    Users.forEach((user) => {
      if (user.id === newUser.id) {
        user.refresh_token = refresh_token;
      }
    });

    console.log(Users);

    // レスポンス返却
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

    const access_token = await jwt.sign(
      payload,
      process.env.JWT_SECRET_ACCESS,
      {
        expiresIn: "1m",
        audience: process.env.JWT_AUDIENCE,
        issuer: process.env.JWT_ISSUER,
        subject: user.id.toString(),
      }
    );

    res.json({
      access_token: access_token,
    });
  }
);

module.exports = router;
