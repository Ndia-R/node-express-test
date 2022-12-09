const passport = require("passport");
const passportJwt = require("passport-jwt");
const UsersService = require("../users.service");

const jwtOptions = {
  jwtFromRequest: passportJwt.ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.JWT_ACCESS_TOKEN_SECRET,
  issuer: process.env.JWT_ISSUER,
  audience: process.env.JWT_AUDIENCE,
  ignoreExpiration: false,
};

passport.use(
  new passportJwt.Strategy(jwtOptions, (payload, done) => {
    // ユーザーがＤＢに存在すれば、最終的な認証ＯＫ
    const user = UsersService.findOneById(payload.sub);
    if (!user) {
      return done(null, false, { message: "認証失敗(JWT)" });
    }
    return done(null, user, payload);
  })
);
