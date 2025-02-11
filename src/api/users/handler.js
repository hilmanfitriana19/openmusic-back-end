class UsersHandler {
  constructor(UsersService, UsersValidator) {
    this._usersService = UsersService;
    this._usersValidator = UsersValidator;
  }

  async postUserHandler(request, h) {
    this._usersValidator.validateUserPayload(request.payload);
    const { username, password, fullname } = request.payload;
    const userId = await this._usersService.addUser({ username, password, fullname });

    const response = h.response({
      status: 'success',
      message: 'User berhasil ditambahkan.',
      data: {
        userId,
      },
    });
    response.code(201);
    return response;
  }

  async getUserByIdHandler(request) {
    const { id } = request.params;

    const user = await this._usersService.getUserById(id);

    return {
      status: 'success',
      data: {
        user,
      },
    };
  }

  async getUsersByUsernameHandler(request, h) {
    const { username = '' } = request.query;
    const users = await this._usersService.getUserByUsername(username);

    return h.response({
      status: 'success',
      data: {
        users,
      },
    });
  }
}

module.exports = UsersHandler;
