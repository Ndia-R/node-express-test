const passport = require("passport");
const passportJwt = require("passport-jwt");
const { Users } = require("../db/User");

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
    const user = Users.find((user) => user.id === parseInt(payload.sub));
    if (user) {
      return done(null, user, payload);
    }
    return done(null, false);
  })
);
