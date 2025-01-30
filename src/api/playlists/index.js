const PlaylistsHandler = require('./handler');
const routes = require('./routes');

module.exports = {
  name: 'playlists',
  version: '0.0.1',
  register: async (
    server,
    {
      PlaylistsService,
      PlaylistsSongsService,
      PlaylistsSongsActivitiesService,
      PlaylistsValidator,
    }
  ) => {
    const playlistHandler = new PlaylistsHandler(
      PlaylistsService,
      PlaylistsSongsService,
      PlaylistsSongsActivitiesService,
      PlaylistsValidator
    );
    server.route(routes(playlistHandler));
  },
};
