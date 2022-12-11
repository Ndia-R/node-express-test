const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const passport = require("passport");

require("dotenv").config();

const app = express();

const auth = require("./routes/auth/auth");
const users = require("./routes/auth/users");

const appUsers = require("./routes/emerald/users");
const AptitudeTests = require("./routes/emerald/aptitude-tests");

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

app.use(passport.initialize());
require("./routes/auth/strategy/jwt.strategy");

app.use(cookieParser());
app.use(express.json());

app.use("/auth", auth);
app.use(
  "/users",
  // passport.authenticate("jwt", { session: false }),
  users
);

app.use(
  "/app-users",
  passport.authenticate("jwt", { session: false }),
  appUsers
);
app.use(
  "/aptitude-tests",
  // passport.authenticate("jwt", { session: false }),
  AptitudeTests
);

const PORT = 5000;
app.listen(PORT, () => {
  console.log("server running");
});
