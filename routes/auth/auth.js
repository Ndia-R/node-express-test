const router = require("express").Router();
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const { v4: uuidv4 } = require("uuid");

const { body, validationResult } = require("express-validator");
const { Users } = require("../../db/auth/User");

//-----------------------------------------------------------------
// 新規ユーザー登録
//-----------------------------------------------------------------
router.post(
  "/register",
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
    const user = Users.find((u) => u.username === username);
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
      user_id: uuidv4(),
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

  const user = Users.find((u) => u.username === username);
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
    subject: user.user_id,
  });

  const refresh_token = jwt.sign(
    payload,
    process.env.JWT_REFRESH_TOKEN_SECRET,
    {
      expiresIn: process.env.JWT_REFRESH_TOKEN_EXPIRES_IN,
      audience: process.env.JWT_AUDIENCE,
      issuer: process.env.JWT_ISSUER,
      subject: user.user_id,
    }
  );

  // リフレッシュトークンをクッキーにセット
  res.cookie("refresh_token", refresh_token, {
    httpOnly: true,
    secure: true,
    sameSite: "strict",
  });

  // リフレッシュトークンをＤＢへ保存
  Users.forEach((u) => {
    if (u.user_id === user.user_id) {
      u.refresh_token = refresh_token;
    }
  });

  res.json({
    user_id: user.user_id,
    username: user.username,
    access_token: access_token,
  });
});

//-----------------------------------------------------------------
// ログアウト
//-----------------------------------------------------------------
router.get("/logout", (req, res) => {
  res.clearCookie("refresh_token");
  res.json({ message: "clear refresh_token" });
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
      (u) => u.user_id === decoded.sub && u.refresh_token === refresh_token
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
      subject: user.user_id,
    });

    return res.json({
      user_id: user.user_id,
      username: user.username,
      access_token: newToken,
    });
  } catch (err) {
    throw res.status(401).json(err);
  }
});

module.exports = router;
