const fs = require('fs/promises');
const path = require('path');

function buildReceiptName(originalName) {
  const extension = path.extname(originalName) || '.txt';
  const basename = path.basename(originalName, extension).replace(/[^a-z0-9_-]/gi, '-');
  return `${Date.now()}-${basename}${extension}`;
}

async function saveReceipt(uploadDir, filename, contents) {
  await fs.mkdir(uploadDir, { recursive: true });
  const destination = path.join(uploadDir, filename);
  await fs.writeFile(destination, contents, 'utf8');
  return destination;
}

function readReceiptUnsafe(uploadDir, filename) {
  return fs.readFile(path.join(uploadDir, filename), 'utf8');
}

module.exports = {
  buildReceiptName,
  readReceiptUnsafe,
  saveReceipt
};
