const { Pool } = require('pg');
const { nanoid } = require('nanoid');
const InvariantError = require('../../exceptions/InvariantError');
const NotFoundError = require('../../exceptions/NotFoundError');

class AlbumsService {
  constructor(cacheService) {
    this._pool = new Pool();
    this._cacheService = cacheService;
  }

  async addAlbum(name, year) {
    const id = `album-${nanoid(16)}`;
    const createdAt = new Date().toISOString();

    // set updated_at with created_at
    const query = {
      text: 'INSERT INTO albums VALUES($1, $2, $3, $4, $5, $6) RETURNING id;',
      values: [id, name, year, null, createdAt, createdAt],
    };

    const result = await this._pool.query(query);
    if (!result.rows[0].id) {
      throw new InvariantError('Album tidak ditambahkan.');
    }

    return result.rows[0].id;
  }

  async getAlbums() {
    const query = 'SELECT id, name, year, created_at, updated_at FROM albums;';
    const result = await this._pool.query(query);
    return result;
  }

  async getAlbumById(id) {
    const query = {
      text: 'SELECT id, name, year, cover_url as "coverUrl" FROM albums WHERE id = $1;',
      values: [id],
    };
    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('Album tidak ditemukan.');
    }

    return result.rows[0];
  }

  async editAlbumById(id, { name, year }) {
    const updatedAt = new Date().toISOString();

    const query = {
      text: 'UPDATE albums SET name = $1, year = $2, updated_at = $3 WHERE id = $4 RETURNING id;',
      values: [name, year, updatedAt, id],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('Gagal memperbarui album, data tidak ditemukan.');
    }
  }

  async deleteAlbumById(id) {
    const query = {
      text: 'DELETE FROM albums WHERE id = $1 RETURNING id;',
      values: [id],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('Gagal menghapus album, data tidak ditemukan.');
    }
  }

  async isAlbumExist(id) {
    const query = {
      text: 'SELECT EXISTS (SELECT 1 FROM albums WHERE id = $1)',
      values: [id],
    };

    const result = await this._pool.query(query);
    if (!result.rows[0].exists) {
      throw new NotFoundError('Album tidak ditemukan.');
    }
  }

  async updateCoverAlbumUrl(id, fileLocation) {
    const query = {
      text: 'UPDATE albums SET cover_url = $1 WHERE id = $2',
      values: [fileLocation, id],
    };

    await this._pool.query(query);
  }
}

module.exports = AlbumsService;
