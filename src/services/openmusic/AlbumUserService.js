const { Pool } = require('pg');
const InvariantError = require('../../exceptions/InvariantError');
const NotFoundError = require('../../exceptions/NotFoundError');
const { nanoid } = require('nanoid');

class AlbumUserService {
  constructor(cacheService) {
    this._pool = new Pool();
    this._cacheService = cacheService;
  }

  async isExistAlbums(albumId) {
    const query = {
      text: 'SELECT EXISTS (SELECT 1 FROM albums WHERE id = $1)',
      values: [albumId],
    };

    const result = await this._pool.query(query);

    return result.rows[0].exists;
  }

  async isExist(albumId, userId) {
    const query = {
      text: 'SELECT EXISTS (SELECT 1 FROM user_album_likes WHERE album_id= $1 and user_id = $2)',
      values: [albumId, userId],
    };

    const result = await this._pool.query(query);

    return result.rows[0].exists;
  }

  async likeAlbum(albumId, userId) {
    const isExistAlbums = await this.isExistAlbums(albumId);
    console.log(isExistAlbums);
    if (!isExistAlbums) {
      throw new NotFoundError('Gagal menumukan album');
    }

    const isAlreadyLikeAlbum = await this.isExist(albumId, userId);
    if (isAlreadyLikeAlbum) {
      throw new InvariantError('User sudah menyukai album');
    }

    const id = `user-album-${nanoid(16)}`;

    const query = {
      text: 'INSERT INTO user_album_likes (id, album_id, user_id) VALUES($1, $2, $3) RETURNING id',
      values: [id, albumId, userId],
    };

    const result = await this._pool.query(query);
    
    if (!result.rows.length) {
      throw new InvariantError('Gagal menyukai album');
    }

    await this._cacheService.delete(`user_album_likes:${albumId}`);
    return 'Success';
  }

  async unlikeAlbum(albumId, userId) {
    const query = {
      text: 'DELETE FROM user_album_likes WHERE album_id = $1 AND user_id = $2 RETURNING id',
      values: [albumId, userId],
    };

    const resultLike = await this._pool.query(query);

    if (!resultLike.rows.length) {
      throw new InvariantError('Gagal membatalkan menyukai album');
    }

    await this._cacheService.delete(`user_album_likes:${albumId}`);
    return 'Sukses Unlike Albums';
  }

  async getLikesAlbumById(albumId) {
    try {
      const source = 'cache';
      const likes = await this._cacheService.get(`user_album_likes:${albumId}`);
      return { likes: +likes, source };
    } catch (error) {
      const query = {
        text: 'SELECT * FROM user_album_likes WHERE album_id = $1',
        values: [albumId],
      };
      const result = await this._pool.query(query);
      const likes = result.rows.length;
      await this._cacheService.set(`user_album_likes:${albumId}`, likes);
      const source = 'server';
      return { likes, source };
    }
  }
}

module.exports = AlbumUserService;
