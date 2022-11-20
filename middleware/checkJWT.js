const JWT = require("jsonwebtoken");

const checkJWT = async (req, res, next) => {
  const token = req.cookies.access_token;
  //   const token = req.header("Authorization").split(" ")[1];
  console.log(token);

  if (!token) {
    res.status(400).json({
      message: "権限がありません",
    });
  } else {
    try {
      const user = await JWT.verify(token, "SECRET_KEY_ACCESS");
      console.log(user);
      next();
    } catch (err) {
      if (err.name === "TokenExpiredError") {
        console.log(err);
        return res
          .status(400)
          .json({ message: "トークンの有効期限が切れています" });
      } else if (err.name === "JsonWebTokenError") {
        console.log(err);
        return res.status(400).json({ message: "トークンが一致しません" });
      }
    }
  }
};

module.exports = { checkJWT };
