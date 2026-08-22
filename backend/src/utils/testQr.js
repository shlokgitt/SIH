const { generateBatchQR } = require("./qrGenerator");

async function runTest() {
  // We're just using a fake/sample ID here since this test doesn't
  // touch the database at all — it only checks that the QR function
  // itself works and returns the right shape of data.
  const sampleBatchId = "64f1a2b3c4d5e6f7a8b9c0d1";

  const result = await generateBatchQR(sampleBatchId);

  console.log("Certificate URL:", result.certificateUrl);
  console.log("QR Data URL starts with:", result.qrDataUrl.substring(0, 40));
  console.log("Full length of QR data:", result.qrDataUrl.length, "characters");
}

runTest();