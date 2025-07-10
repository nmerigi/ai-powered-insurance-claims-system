import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyB6ezeVGVH6SR-eDVqjOKUh_AdEi9EU0g4",
  authDomain: "smartclaims-dcc6e.firebaseapp.com",
  projectId: "smartclaims-dcc6e",
  storageBucket: "smartclaims-dcc6e.firebasestorage.app",
  messagingSenderId: "106308550605",
  appId: "1:106308550605:web:51c30dcecb6bbb487b4e84"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Export Firebase Auth instance
export const auth = getAuth(app);
export const db = getFirestore(app);