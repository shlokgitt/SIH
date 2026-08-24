const QRCode = require("qrcode");

const CERTIFICATE_BASE_URL =
  process.env.CERTIFICATE_BASE_URL ||
  "http://localhost:5173/certificate";

async function generateBatchQR(batchCode) {
  const certificateUrl = `${CERTIFICATE_BASE_URL}/${batchCode}`;

  const qrDataUrl = await QRCode.toDataURL(certificateUrl);

  return {
    qrDataUrl,
    certificateUrl,
  };
}

module.exports = {
  generateBatchQR,
};