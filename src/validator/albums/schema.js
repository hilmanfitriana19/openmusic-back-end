const Joi = require("joi");

// batasi hingga tahun ini
const currentYear = new Date().getFullYear();

const AlbumsPayloadSchema = Joi.object({
  name: Joi.string().required(),
  year: Joi.number().integer().min(1990).max(currentYear).required(),
});

module.exports = { AlbumsPayloadSchema };
