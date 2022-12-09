const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { v4: uuidv4 } = require("uuid");
const UsersService = require("./users.service");

class AuthService {
  async validateUser({ username, password }) {
    const usersService = new UsersService();
    const user = usersService.findOne(username);

    if (user && (await bcrypt.compare(password, user.password))) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  login(user) {
    const payload = { username: user.username };

    const access_token = jwt.sign(
      payload,
      process.env.JWT_ACCESS_TOKEN_SECRET,
      {
        expiresIn: process.env.JWT_ACCESS_TOKEN_EXPIRES_IN,
        audience: process.env.JWT_AUDIENCE,
        issuer: process.env.JWT_ISSUER,
        subject: user.user_id,
      }
    );

    const refresh_token = jwt.sign(
      payload,
      process.env.JWT_REFRESH_TOKEN_SECRET,
      {
        expiresIn: process.env.JWT_REFRESH_TOKEN_EXPIRES_IN,
        audience: process.env.JWT_AUDIENCE,
        issuer: process.env.JWT_ISSUER,
        subject: user.user_id,
      }
    );

    user.refresh_token = refresh_token;

    const usersService = new UsersService();
    usersService.update(user);

    return { access_token, refresh_token };
  }

  async createUser(username, password) {
    // ユーザーの存在チェック
    const usersService = new UsersService();
    const user = usersService.findOne(username);
    if (user) return undefined;

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

    // パスワード以外の情報を返す
    const { password: pass, ...result } = newUser;
    return result;
  }
}
module.exports = AuthService;
