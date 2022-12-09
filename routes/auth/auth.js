const router = require("express").Router();
const jwt = require("jsonwebtoken");
const passport = require("passport");
const { body, validationResult } = require("express-validator");
const AuthService = require("./auth.service");

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

    const { username, password } = req.body;
    const authService = new AuthService();
    const user = await authService.createUser(username, password);
    if (!user) {
      return res.status(409).json({
        error: {
          name: "AlreadyExistsError",
          message: "すでにユーザーが存在しています",
        },
      });
    }

    res.json(user);
  }
);

//-----------------------------------------------------------------
// ログイン
//-----------------------------------------------------------------
router.post(
  "/login",
  passport.authenticate("local", { session: false }),
  async (req, res) => {
    const { user } = req;
    const authService = new AuthService();
    const { access_token, refresh_token } = authService.login(user);

    // リフレッシュトークンをクッキーにセット
    res.cookie("refresh_token", refresh_token, {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
    });

    res.json({
      user_id: user.user_id,
      username: user.username,
      access_token: access_token,
    });
  }
);

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
    const userService = new userService();
    const user = userService.findOneById(decoded.sub);
    if (!user || user.refresh_token !== refresh_token) {
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
