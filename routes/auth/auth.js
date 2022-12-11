const router = require("express").Router();
const jwt = require("jsonwebtoken");
const { body, validationResult } = require("express-validator");
const AuthService = require("./auth.service");

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

    const { dto } = req.body;
    const authService = new AuthService();
    return await authService.createUser(dto, req, res);
  }
);

router.post("/login", async (req, res) => {
  const { dto } = req.body;
  const authService = new AuthService();
  return await authService.login(dto, req, res);
});

router.get("/logout", (req, res) => {
  const authService = new AuthService();
  return authService.logout(req, res);
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
