const passport = require("passport");
const passportJwt = require("passport-jwt");
const { Users } = require("../db/User");

const jwtOptions = {
  jwtFromRequest: passportJwt.ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: "SECRET_KEY_ACCESS",
  issuer: "emerald",
  audience: "emerald",
};

passport.use(
  new passportJwt.Strategy(jwtOptions, (payload, done) => {
    console.log(payload);
    const user = Users.find((user) => user.id === parseInt(payload.sub));
    if (user) {
      return done(null, user, payload);
    }
    return done();
  })
);
