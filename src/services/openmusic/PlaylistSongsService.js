const { Pool } = require('pg');
const { nanoid } = require('nanoid');
const InvariantError = require('../../exceptions/InvariantError');
const NotFoundError = require('../../exceptions/NotFoundError');

class PlaylistsSongsService {
  constructor() {
    this._pool = new Pool();
  }

  async addSongToPlaylist(playlistId, songId) {
    const songQuery = {
      text: 'SELECT * FROM songs WHERE id = $1;',
      values: [songId],
    };

    const songResult = await this._pool.query(songQuery);

    if (!songResult.rows.length) {
      throw new NotFoundError('Lagu gagal ditambahkan.');
    }

    const id = `song-playlist-${nanoid(16)}`;

    const playlistQuery = {
      text: 'INSERT INTO playlist_songs (id, playlist_id, song_id) VALUES ($1, $2, $3);',
      values: [id, playlistId, songId],
    };

    await this._pool.query(playlistQuery);
  }

  async getSongsFromPlaylist(playlistId) {
    const playlistQuery = {
      text: `SELECT playlists.id, playlists.name, users.username 
             FROM playlist_songs 
             INNER JOIN playlists ON playlist_songs.playlist_id = playlists.id 
             INNER JOIN users ON playlists.owner = users.id 
             WHERE playlist_id = $1;`,
      values: [playlistId],
    };

    const userQuery = {
      text: `SELECT username FROM playlists 
             INNER JOIN users ON playlists.owner = users.id 
             WHERE playlists.id = $1 LIMIT 1;`,
      values: [playlistId],
    };

    const songQuery = {
      text: `SELECT songs.id, songs.title, songs.performer FROM playlist_songs 
             INNER JOIN songs ON playlist_songs.song_id = songs.id 
             WHERE playlist_id = $1;`,
      values: [playlistId],
    };

    const playlistResult = await this._pool.query(playlistQuery);
    const userResult = await this._pool.query(userQuery);
    const songResult = await this._pool.query(songQuery);

    if (!playlistResult.rows.length) {
      throw new NotFoundError('Playlist tidak ditemukan.');
    }

    if (!userResult.rows.length) {
      throw new NotFoundError('User tidak ditemukan.');
    }

    if (!songResult.rows.length) {
      throw new NotFoundError('Lagu tidak ditemukan.');
    }

    return {
      id: playlistResult.rows[0].id,
      name: playlistResult.rows[0].name,
      username: userResult.rows[0].username,
      songs: songResult.rows,
    };
  }

  async deleteSongFromPlaylist(playlistId, songId) {
    const query = {
      text: 'DELETE FROM playlist_songs WHERE playlist_id = $1 AND song_id = $2 RETURNING id;',
      values: [playlistId, songId],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new InvariantError(
        'Gagal menghapus Lagu, playlist tidak ditemukan.'
      );
    }
  }
}

module.exports = PlaylistsSongsService;
