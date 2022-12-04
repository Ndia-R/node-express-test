const router = require("express").Router();
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");

const { body, validationResult } = require("express-validator");
const { Users } = require("../db/User");

//-----------------------------------------------------------------
// 新規ユーザー登録
//-----------------------------------------------------------------
router.post(
  "/user-register",
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
      return res.status(409).json({
        error: {
          name: "AlreadyExistsError",
          message: "すでにユーザーが存在しています",
        },
      });
    }

    // パスワードのハッシュ化
    const hashedPassword = await bcrypt.hash(password, 10);

    // 新規ユーザー作成
    const newUser = {
      id: Math.max(...Users.map((user) => user.id)) + 1,
      username: username,
      password: hashedPassword,
      refresh_token: "",
    };
    Users.push(newUser);

    res.json({ message: "ユーザー登録完了" });
  }
);

//-----------------------------------------------------------------
// ログイン
//-----------------------------------------------------------------
router.post("/login", async (req, res) => {
  // ログインチェック
  const { username, password } = req.body;

  const user = Users.find((user) => user.username === username);
  if (!user) {
    return res.status(404).json({
      error: {
        name: "AuthenticationError",
        message: "ユーザー名またはパスワードが違います",
      },
    });
  }
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return res.status(404).json({
      error: {
        name: "AuthenticationError",
        message: "ユーザー名またはパスワードが違います",
      },
    });
  }

  // アクセストークンとリフレッシュトークンの作成（JWT）
  const payload = { username: user.username };

  const access_token = jwt.sign(payload, process.env.JWT_ACCESS_TOKEN_SECRET, {
    expiresIn: process.env.JWT_ACCESS_TOKEN_EXPIRES_IN,
    audience: process.env.JWT_AUDIENCE,
    issuer: process.env.JWT_ISSUER,
    subject: user.id.toString(),
  });

  const refresh_token = jwt.sign(
    payload,
    process.env.JWT_REFRESH_TOKEN_SECRET,
    {
      expiresIn: Number(process.env.JWT_REFRESH_TOKEN_EXPIRES_IN),
      audience: process.env.JWT_AUDIENCE,
      issuer: process.env.JWT_ISSUER,
      subject: user.id.toString(),
    }
  );

  // リフレッシュトークンをクッキーにセット
  res.cookie("refresh_token", refresh_token, {
    httpOnly: true,
    maxAge: Number(process.env.JWT_REFRESH_TOKEN_EXPIRES_IN) * 1000,
    secure: true,
    sameSite: "strict",
  });

  // リフレッシュトークンをＤＢへ保存
  Users.forEach((u) => {
    if (u.id === user.id) {
      u.refresh_token = refresh_token;
    }
  });

  res.json({ access_token: access_token });
});

//-----------------------------------------------------------------
// リフレッシュトークン
//-----------------------------------------------------------------
router.get("/refresh", (req, res) => {
  const { refresh_token } = req.cookies;
  try {
    // リフレッシュトークンが有効か
    const decoded = jwt.verify(
      refresh_token,
      process.env.JWT_REFRESH_TOKEN_SECRET
    );

    // ＤＢに保存しているリフレッシュトークンと一致するか
    const user = Users.find(
      (user) =>
        user.id === Number(decoded.sub) && user.refresh_token === refresh_token
    );
    if (!user) {
      throw new Error({
        error: {
          name: "UserNotFoundError",
          message: "user not found",
        },
      });
    }

    // 新しいアクセストークンを作成
    const payload = { username: user.username };
    const newToken = jwt.sign(payload, process.env.JWT_ACCESS_TOKEN_SECRET, {
      expiresIn: process.env.JWT_ACCESS_TOKEN_EXPIRES_IN,
      audience: process.env.JWT_AUDIENCE,
      issuer: process.env.JWT_ISSUER,
      subject: user.id.toString(),
    });

    return res.json({ access_token: newToken });
  } catch (e) {
    return res.json({ access_token: undefined });
  }
});

module.exports = router;
