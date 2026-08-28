const slugify = require("slugify");

const generateSlug = (text) =>
  slugify(text, { lower: true, strict: true, trim: true });

module.exports = generateSlug;
