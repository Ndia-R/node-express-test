const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const passport = require("passport");

require("dotenv").config();

const app = express();

const auth = require("./routes/auth/auth");
const user = require("./routes/auth/user");

const appUser = require("./routes/emerald/app-user");
const AptitudeTest = require("./routes/emerald/aptitude-test");

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

app.use(passport.initialize());
require("./authentication/jwt");

app.use(cookieParser());
app.use(express.json());

app.use("/auth", auth);
app.use("/user", passport.authenticate("jwt", { session: false }), user);

app.use("/app-user", passport.authenticate("jwt", { session: false }), appUser);
app.use(
  "/aptitude-test",
  // passport.authenticate("jwt", { session: false }),
  AptitudeTest
);

const PORT = 5000;
app.listen(PORT, () => {
  console.log("server running");
});
