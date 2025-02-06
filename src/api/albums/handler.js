class AlbumsHandler {
  constructor(AlbumsService, SongsService, AlbumsValidator) {
    this._albumsService = AlbumsService;
    this._songsService = SongsService;
    this._albumsValidator = AlbumsValidator;
  }

  async postAlbumHandler(request, h) {
    this._albumsValidator.validateAlbumsPayload(request.payload);
    // object descruction
    const { name, year } = request.payload;

    const albumId = await this._albumsService.addAlbum({ name, year });
    const response = h.response({
      status: 'success',
      message: 'Album berhasil ditambahkan.',
      data: {
        albumId,
      },
    });

    response.code(201);
    return response;
  }

  async getAlbumsHandler() {
    const albums = await this._albumsService.getAlbums();

    return {
      status: 'success',
      data: {
        albums,
      },
    };
  }

  async getAlbumByIdHandler(request, h) {
    const { id } = request.params;
    const album = await this._albumsService.getAlbumById(id);
    album.songs = await this._songsService.getSongByAlbumId(id);

    return h.response({
      status: 'success',
      data: {
        album,
      },
    });
  }

  async putAlbumByIdHandler(request, h) {
    this._albumsValidator.validateAlbumsPayload(request.payload);

    const { id } = request.params;
    await this._albumsService.editAlbumById(id, request.payload);

    return h.response({
      status: 'success',
      message: 'Album berhasil diperbaharui.',
    });
  }

  async deleteAlbumByIdHandler(request, h) {
    const { id } = request.params;

    await this._albumsService.deleteAlbumById(id);

    return h.response({
      status: 'success',
      message: 'Album berhasil dihapus.',
    });
  }

  async postAlbumCoverHandler(request, h) {
    const { data } = request.payload;
    const { id } = request.params;

    this._validator.validateImageHeaders(data.hapi.headers);

    const filename = await this._albumsService.writeFile(data, data.hapi);
    const coverUrl = `http://${process.env.HOST}:${process.env.PORT}/upload/images/${filename}`;

    await this._albumsService.postAlbumCoverHandler(id, coverUrl);

    const response = h.response({
      status: 'success',
      message: 'Sampul berhasil diunggah.',
      data: {
        id,
        coverUrl
      },
    });

    response.code(201);
    return response;
  }

  async postLikesByIdHandler(request, h) {
    // object descruction
    const { name, year } = request.payload;

    const albumId = await this._albumsService.addAlbum({ name, year });
    const response = h.response({
      status: 'success',
      message: 'Album berhasil ditambahkan.',
      data: {
        albumId,
      },
    });

    response.code(201);
    return response;
  }

  async deleteLikesByIdHandler(request, h) {
    const { id } = request.params;

    await this._albumsService.deleteAlbumById(id);

    return h.response({
      status: 'success',
      message: 'Album berhasil dihapus.',
    });
  }

  async getLikesByIdHandler(request, h) {
    const { id } = request.params;
    const album = await this._albumsService.getAlbumById(id);
    album.songs = await this._songsService.getSongByAlbumId(id);

    return h.response({
      status: 'success',
      data: {
        album,
      },
    });
  }
}

module.exports = AlbumsHandler;
