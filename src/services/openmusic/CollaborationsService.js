const { Pool } = require('pg');
const { nanoid } = require('nanoid');
const InvariantError = require('../../exceptions/InvariantError');
const NotFoundError = require('../../exceptions/NotFoundError');

class CollaborationsService {
  constructor() {
    this._pool = new Pool();
  }

  async verifyCollaborator(playlistId, userId) {
    const query = {
      text: 'SELECT * FROM collaborations WHERE playlist_id = $1 AND user_id = $2;',
      values: [playlistId, userId],
    };
    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new InvariantError('Kolaborator gagal diverifikasi.');
    }
  }

  async addCollaborator(playlistId, userId) {
    const userQuery = {
      text: 'SELECT * FROM users WHERE id = $1',
      values: [userId],
    };

    const userResult = await this._pool.query(userQuery);

    if (!userResult.rows.length) {
      throw new NotFoundError('User tidak ditemukan.');
    }

    const id = `collaborations-${nanoid(16)}`;

    const collaborationsQuery = {
      text: 'INSERT INTO collaborations VALUES($1, $2, $3) RETURNING id;',
      values: [id, playlistId, userId],
    };
    const collaborationsResult = await this._pool.query(collaborationsQuery);
    if (!collaborationsResult.rows.length) {
      throw new InvariantError('Kolaborator gagal ditambahkan.');
    }
    return collaborationsResult.rows[0].id;
  }

  async deleteCollaborator(playlistId, userId) {
    const query = {
      text: 'DELETE FROM collaborations WHERE playlist_id = $1 AND user_id = $2 RETURNING id;',
      values: [playlistId, userId],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new InvariantError('Kolaborator gagal dihapus, data tidak ditemukan.');
    }
  }
}

module.exports = CollaborationsService;
