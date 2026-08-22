const QRCode = require("qrcode");

const CERTIFICATE_BASE_URL = process.env.CERTIFICATE_BASE_URL || "http://localhost:5173/certificate";

async function generateBatchQR(batchId) {
  const certificateUrl = `${CERTIFICATE_BASE_URL}/${batchId}`;
  const qrDataUrl = await QRCode.toDataURL(certificateUrl);
  return { qrDataUrl, certificateUrl };
}

module.exports = { generateBatchQR };