const express = require("express");
const cookieParser = require("cookie-parser");

const passport = require("passport");

const app = express();
const auth = require("./routes/auth");
const user = require("./routes/user");

app.use(passport.initialize());
require("./authentication/jwt");

const PORT = 5000;

app.use(cookieParser());
app.use(express.json());
app.use("/auth", auth);
app.use("/user", user);

app.listen(PORT, () => {
  console.log("server running");
});
