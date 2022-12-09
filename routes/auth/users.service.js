const { Users } = require("../../db/auth/Users");

class UsersService {
  findAll() {
    return Users;
  }

  findOne(username) {
    const user = Users.find((x) => x.username === username);
    return user;
  }

  findOneById(id) {
    const user = Users.find((x) => x.id === id);
    return user;
  }

  create(user) {
    Users.push(user);
  }

  update(user) {
    Users.forEach((x) => {
      if (x.user_id === user.user_id) {
        x.user_id = user.usre_id || x.user_id;
        x.username = user.username || x.username;
        x.password = user.password || x.password;
        x.refresh_token = user.refresh_token || x.refresh_token;
      }
    });
  }
}
module.exports = UsersService;
