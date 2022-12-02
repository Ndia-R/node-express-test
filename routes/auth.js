const router = require("express").Router();
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");

const { body, validationResult } = require("express-validator");
const { Users } = require("../db/User");

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
      refresh_token_iat: 0,
    };
    Users.push(newUser);

    res.json({ message: "ユーザー登録完了" });
  }
);

router.post("/login", async (req, res) => {
  // ログインチェック
  const { username, password } = req.body;

  const user = Users.find((user) => user.username === username);
  if (!user) {
    return res.status(401).json({
      error: {
        name: "AuthenticationError",
        message: "ユーザー名またはパスワードが違います",
      },
    });
  }
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return res.status(401).json({
      error: {
        name: "AuthenticationError",
        message: "ユーザー名またはパスワードが違います",
      },
    });
  }

  // アクセストークン作成
  const payload = { username: user.username };
  const access_token = jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: Number(process.env.JWT_EXPIRES_IN),
    audience: process.env.JWT_AUDIENCE,
    issuer: process.env.JWT_ISSUER,
    subject: user.id.toString(),
  });

  // リフレッシュトークン作成
  const refresh_token = crypto.randomBytes(48).toString("hex");

  // リフレッシュトークンをクッキーにセット
  res.cookie("refresh_token", refresh_token, {
    httpOnly: true,
    secure: false,
    path: "/auth/refresh",
  });

  // リフレッシュトークンをＤＢへ保存
  Users.forEach((targetUser) => {
    if (targetUser.id === user.id) {
      const currentTime = Math.floor(Date.now() / 1000);
      targetUser.refresh_token = refresh_token;
      targetUser.refresh_token_iat = currentTime;
    }
  });

  res.json({ access_token: access_token });
});

router.post("/refresh", (req, res) => {
  // アクセストークンが存在するか
  const { access_token } = req.body;
  if (!access_token) {
    return res.status(400).json({
      error: {
        name: "TokenNotFoundError",
        message: "access_token not found",
      },
    });
  }

  // アクセストークンが有効か
  // ※エラーの中でも「トークンの有効期限が切れている場合」はリターンしない
  try {
    jwt.verify(access_token, process.env.JWT_SECRET);
  } catch (err) {
    if (err.name !== "TokenExpiredError") {
      return res.status(401).json({ error: err });
    }
  }

  // リフレッシュトークンが存在するか
  const { refresh_token } = req.cookies;
  if (!refresh_token) {
    return res.status(400).json({
      error: {
        name: "TokenNotFoundError",
        message: "refresh_token not found",
      },
    });
  }

  // リフレッシュトークンが有効か（ユーザー一覧に保存されているか）
  const decoded = jwt.decode(access_token);
  const user = Users.find(
    (user) =>
      user.refresh_token === refresh_token && user.id === Number(decoded.sub)
  );
  if (!user) {
    return res.status(401).json({
      error: {
        name: "InvalidTokenError",
        message: "invalid refresh_token",
      },
    });
  }

  // リフレッシュトークンが有効期限内か
  const currentTime = Math.floor(Date.now() / 1000);
  if (currentTime - user.refresh_token_iat >= 5 * 60) {
    return res.status(401).json({
      error: {
        name: "TokenExpiredError",
        message: "refresh_token expired",
      },
    });
  }

  // 新しいアクセストークンを作成
  const payload = { username: user.username };
  const newToken = jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: Number(process.env.JWT_EXPIRES_IN),
    audience: process.env.JWT_AUDIENCE,
    issuer: process.env.JWT_ISSUER,
    subject: user.id.toString(),
  });

  res.json({ access_token: newToken });
});

module.exports = router;
