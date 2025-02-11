class AlbumsHandler {
  constructor(AlbumsService, SongsService, AlbumUserService, AlbumsValidator, StorageService) {
    this._albumsService = AlbumsService;
    this._songsService = SongsService;
    this._albumUserService = AlbumUserService;
    this._albumsValidator = AlbumsValidator;
    this._storageService = StorageService;
  }

  async postAlbumHandler(request, h) {
    this._albumsValidator.validateAlbumsPayload(request.payload);
    // object descruction
    const { name, year } = request.payload;

    const albumId = await this._albumsService.addAlbum(name, year);
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
    // setup album songs
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
    const { cover } = request.payload;
    const { id } = request.params;
    await this._albumsService.isAlbumExist(id);

    this._albumsValidator.validateImageHeaders(cover.hapi.headers);
    const filename = await this._storageService.writeFile(cover, cover.hapi);
    const coverUrl = `http://${process.env.HOST}:${process.env.PORT}/upload/images/${filename}`;

    await this._albumsService.updateCoverAlbumUrl(id, coverUrl);

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

  async postLikesAlbumByIdHandler(request, h) {
    // object descruction
    const { id: credentialId } = request.auth.credentials;
    const { id } = request.params;
    const message = await this._albumUserService.likeAlbum(id, credentialId);

    const response = h.response({
      status: 'success',
      message,
    });
    response.code(201);
    return response;
  }

  async deleteLikesByIdHandler(request, h) {
    // object descruction
    const { id: credentialId } = request.auth.credentials;
    const { id } = request.params;

    const message = await this._albumUserService.unlikeAlbum(id, credentialId);

    const response = h.response({
      status: 'success',
      message,
    });

    return response;
  }

  async getLikesByIdHandler(request, h) {
    const { id } = request.params;
    const { likes, source } = await this._albumUserService.getLikesAlbumById(id);

    const response = h.response({
      status: 'success',
      data: {
        likes,
      },
    });

    response.header('X-Data-Source', source);
    return response;
  }
}

module.exports = AlbumsHandler;
