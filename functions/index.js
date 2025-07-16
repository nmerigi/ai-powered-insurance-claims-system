const { onDocumentCreated } = require("firebase-functions/firestore");
const { initializeApp } = require("firebase-admin/app");
const { getFirestore } = require("firebase-admin/firestore");
const axios = require("axios");

initializeApp();
const db = getFirestore();

exports.processClaimOCR = onDocumentCreated("claims/{claimId}", async (event) => {
  const snap = event.data;
  const claimId = event.params.claimId;
  const claimData = snap.data();

  console.log(`New claim created: ${claimId}`);

  const fileUrl = claimData.fileUrl;

  if (!fileUrl) {
    console.error("No fileUrl found in claim.");
    return;
  }

  try {
    console.log("Sending file to OCR API...");

    const response = await axios.post("https://insurance-ocr-api.onrender.com/extract-text", {
      fileUrl: fileUrl,
    });

    const ocrData = response.data;
    console.log("OCR response received:", ocrData);

    await db.collection("claims").doc(claimId).update({
      ocrData: ocrData,
    });

    console.log("OCR data saved to Firestore under 'ocrData'");

  } catch (error) {
    console.error("OCR API call failed:", error.message);
  }
});
