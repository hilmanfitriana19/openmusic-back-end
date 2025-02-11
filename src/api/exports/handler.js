class ExportsHandler {
  constructor(ProducerService, PlaylistsService, ExportsValidator) {
    this._producerService = ProducerService;
    this._playlistsService = PlaylistsService;
    this._exportValidator = ExportsValidator;
  }

  async postExportPlaylistHandler(request, h) {
    this._exportValidator.validateExportPlaylistsPayload(request.payload);

    const { id: credentialId } = request.auth.credentials;
    const { playlistId } = request.params;
    const { targetEmail } = request.payload;
    await this._playlistsService.verifyPlaylistsOwner(playlistId, credentialId);
    const message = {
      playlistId,
      targetEmail: targetEmail,
    };

    console.log(JSON.stringify(message));
    await this._producerService.sendMessage('export:playlist', JSON.stringify(message));

    const response = h.response({
      status: 'success',
      message: 'Permintaan Anda dalam antrean.',
    });
    response.code(201);
    return response;
  }
}

module.exports = ExportsHandler;
