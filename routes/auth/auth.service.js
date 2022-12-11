const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { v4: uuidv4 } = require("uuid");
const UsersService = require("./users.service");

class AuthService {
  //-----------------------------------------------------------------
  // 新規ユーザー作成
  //-----------------------------------------------------------------
  async createUser(dto) {
    const { username, password } = dto;

    // ユーザーの存在チェック
    const usersService = new UsersService();
    const foundUser = usersService.findOne(username);
    if (foundUser) {
      return res.status(400).json({
        error: {
          name: "BadRequestException",
          message: "すでにユーザーが存在します",
        },
      });
    }

    // パスワードのハッシュ化
    const hashedPassword = await bcrypt.hash(password, 10);

    // 新規ユーザー作成
    const newUser = {
      user_id: uuidv4(),
      username: username,
      password: hashedPassword,
      refresh_token: "",
    };
    usersService.create(newUser);

    return res.status(201).json({ message: "新規ユーザー作成に成功しました" });
  }

  //-----------------------------------------------------------------
  // ログイン
  //-----------------------------------------------------------------
  async login(dto, req, res) {
    const { username, password } = dto;

    const usersService = new UsersService();
    const foundUser = usersService.findOne(username);

    if (!foundUser || !(await bcrypt.compare(password, foundUser.password))) {
      return res.status(400).json({
        error: {
          name: "BadRequestException",
          message: "ユーザー名またはパスワードが違います",
        },
      });
    }

    const payload = { username: foundUser.username };

    const access_token = jwt.sign(
      payload,
      process.env.JWT_ACCESS_TOKEN_SECRET,
      {
        expiresIn: process.env.JWT_ACCESS_TOKEN_EXPIRES_IN,
        audience: process.env.JWT_AUDIENCE,
        issuer: process.env.JWT_ISSUER,
        subject: foundUser.user_id,
      }
    );

    const refresh_token = jwt.sign(
      payload,
      process.env.JWT_REFRESH_TOKEN_SECRET,
      {
        expiresIn: process.env.JWT_REFRESH_TOKEN_EXPIRES_IN,
        audience: process.env.JWT_AUDIENCE,
        issuer: process.env.JWT_ISSUER,
        subject: foundUser.user_id,
      }
    );

    foundUser.refresh_token = refresh_token;
    usersService.update(foundUser);

    // リフレッシュトークンをクッキーにセット
    res.cookie("refresh_token", refresh_token, {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
    });

    return res.json({
      user_id: foundUser.user_id,
      username: foundUser.username,
      access_token: access_token,
    });
  }

  //-----------------------------------------------------------------
  // ログアウト
  //-----------------------------------------------------------------
  logout(req, res) {
    res.clearCookie("refresh_token");
    return res.json({ message: "ログアウトしました" });
  }
}
module.exports = AuthService;
