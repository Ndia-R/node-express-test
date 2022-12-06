const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const passport = require("passport");

require("dotenv").config();

const app = express();
const auth = require("./routes/auth");
const user = require("./routes/user");
const appUser = require("./routes/app-user");
const TestResult = require("./routes/test-result");
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
  "/test-result",
  passport.authenticate("jwt", { session: false }),
  TestResult
);

const PORT = 5000;
app.listen(PORT, () => {
  console.log("server running");
});
