const { onDocumentCreated, onDocumentUpdated } = require("firebase-functions/firestore");
const { initializeApp } = require("firebase-admin/app");
const { getFirestore } = require("firebase-admin/firestore");
const axios = require("axios");

initializeApp();
const db = getFirestore();

/**
 * Function 1: Trigger OCR when a new claim is created
 */

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

/**
 * Function 2: Auto-review claim after OCR data is added
 */

exports.reviewClaimOnOcr = onDocumentUpdated("claims/{claimId}", async (event) => {
  const before = event.data.before.data();
  const after = event.data.after.data();
  const claimId = event.params.claimId;

  if (!before.ocrData && after.ocrData) {
    const claimData = after.ocrData;

    try {
      console.log(`Sending claim ${claimId} to Review API...`);

      const response = await axios.post("https://insurance-review-api.onrender.com/predict", claimData);
      const result = response.data;

      await db.collection("claims").doc(claimId).update({
        reviewResult: result,
        status: result.label || "Reviewed"
      });

      console.log(`Review result saved for claim ${claimId}`);
    } catch (error) {
      console.error("Review API call failed:", error.message);
    }
  } else {
    console.log(`No new ocrData in claim ${claimId}, skipping review.`);
  }
});