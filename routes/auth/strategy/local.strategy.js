const passport = require("passport");
const LocalStrategy = require("passport-local");
const AuthService = require("../auth.service");

passport.use(
  new LocalStrategy(async (username, password, done) => {
    const authService = new AuthService();
    const user = await authService.validateUser({ username, password });
    if (!user) {
      return done(null, false);
    }
    return done(null, user);
  })
);
