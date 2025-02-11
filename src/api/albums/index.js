const AlbumsHandler = require('./handler');
const routes = require('./routes');

module.exports = {
  name: 'albums',
  version: '1.0.3',
  register: async (
    server,
    {
      AlbumsService,
      SongsService,
      AlbumUsersService,
      AlbumsValidator,
      StorageService,
    }
  ) => {
    const albumsHandler = new AlbumsHandler(
      AlbumsService,
      SongsService,
      AlbumUsersService,
      AlbumsValidator,
      StorageService
    );
    server.route(routes(albumsHandler));
  },
};
