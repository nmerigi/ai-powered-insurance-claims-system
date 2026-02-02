## AI-Powered Insurance Claims Processing System

Automates insurance claims processing from submission to approval using **OCR**, **machine learning**, and **cloud-based automation**. Streamlines what traditionally takes days into minutes.

The system enables claimants to submit claims online while assisting insurers with AI-driven claim review and decision support.
---

## Project Overview

**Role:** Solo Developer | Full-stack implementation  
**Timeline:** May - July 2025 
**Domain:** Health Insurance (adaptable architecture)

---
## Features

### Claimant Features

* Submit insurance claims online
* Upload a single supporting document (PDF or image)
* View real-time claim status updates

### Insurer / Admin Features

* View and manage all submitted claims
* See AI-generated claim classifications
* Manually review flagged or complex claims
* Access dashboard statistics and reports

### AI Capabilities

* OCR-based data extraction from claim documents
* Automatic claim classification (Approved / Rejected / Flagged)
* End-to-end automation using Cloud Functions

---

## System Architecture

1. Claimant submits a claim via the React web app
2. Document is uploaded to Firebase Storage
3. Claim metadata is saved to Firestore
4. OCR Cloud Function extracts structured data
5. Review AI Cloud Function classifies the claim
6. Results are saved back to Firestore
7. Dashboards update in real time

---

## Tech Stack

### Frontend

* React
* React Router
* Material UI (MUI)

### Backend / Cloud

* Firebase Authentication
* Firebase Firestore
* Firebase Storage
* Firebase Cloud Functions

### AI / ML

* OCR model (custom-trained, deployed on Render)
* XGBoost claim classification model
* Python, Scikit-learn, XGBoost

---

## Firestore Data Structure

**Collection:** `claims`

Each document contains:

```json
{
  "userId": "string",
  "fullName": "string",
  "email": "string",
  "phone": "string",
  "address": "string",
  "fileUrl": "string",
  "createdAt": "timestamp",
  "status": "In Review | Approved | Rejected | Flagged",
  "ocrData": { },
  "classification": { }
}
```

---

## Cloud Functions

### OCR Trigger

* Runs when a new claim is created
* Downloads file from Firebase Storage
* Sends file to OCR API
* Saves extracted data as `ocrData`

### Review Trigger

* Runs when `ocrData` is added
* Sends extracted data to classification API
* Saves prediction and explanation

---

## Project Status

✔ Full end-to-end pipeline implemented
✔ OCR + review AI models deployed
✔ Firebase integration completed
✔ Dashboards connected to live data

---

## Limitations

* Only one document upload per claim
* Receipt processing not implemented
* Prototype trained on a limited dataset

---

## Future Improvements

* Support multiple file uploads
* Extract data from attached receipts
* Improve AI accuracy with larger datasets
* Add explainability UI for AI decisions
* Advanced analytics and downloadable reports

---

## Project Context

This project was developed as a **final-year Computer Science project**, using **health insurance** as the example domain. The system architecture is flexible and can be adapted to other insurance types.

---

## Author

**Nicole**  
Computer Science Graduate | Software Engineer (AI & Full-Stack)

---

## License

This project is for educational and demonstration purposes.
