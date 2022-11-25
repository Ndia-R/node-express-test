const passport = require("passport");
const passportJwt = require("passport-jwt");
const { Users } = require("../db/User");

const jwtOptions = {
  jwtFromRequest: passportJwt.ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.JWT_SECRET,
  issuer: process.env.JWT_ISSUER,
  audience: process.env.JWT_AUDIENCE,
  ignoreExpiration: false,
};

passport.use(
  new passportJwt.Strategy(jwtOptions, (payload, done) => {
    // ユーザーがＤＢに存在すれば、最終的な認証ＯＫ
    const user = Users.find((user) => user.id === parseInt(payload.sub));
    if (user) {
      return done(null, user, payload);
    }
    return done(null, false);
  })
);

// JWTトークンの確認（この関数をミドルウェアとして設定する）
//
// passport.authenticate("jwt", { session: false }) だけでは
// トークンがないのか、無効なトークンなのか、トークンの有効期限が切れているのか
// わからないため、コールバック関数を使ってエラー内容を振り分ける
//
// ヘッダーにトークンが設定されていない
// "errors": {
//   "message": {}
// }
//
// 不正な形式のトークン
// "errors": {jwt malformed
//   "message": {
//     "name": "JsonWebTokenError",
//     "message": "jwt malformed"
//   }
// }
//
// 無効なトークン
// "errors": {
//   "message": {
//     "name": "JsonWebTokenError",
//     "message": "invalid token"
//   }
// }
//
// トークンの有効期限が切れている
// "errors": {
//   "message": {
//     "name": "TokenExpiredError",
//     "message": "jwt expired",
//     "expiredAt": "2022-11-25T05:54:45.000Z"
//   }
// }
const jwtVerify = (req, res, next) => {
  passport.authenticate("jwt", { session: false }, (err, user, info) => {
    if (err) return next(err);
    if (!user) {
      return res
        .status(401)
        .json({ errors: { message: info || "user unknown" } })
        .end();
    }
    req.user = user;
    next();
  })(req, res, next);
};

module.exports = jwtVerify;
