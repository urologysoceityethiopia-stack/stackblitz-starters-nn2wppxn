import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// We removed the getStorage import here
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyBfx5JG1daUOfXpus2IHTZTZlDc8OZxoCE",
  authDomain: "nutri-med-f25b6.firebaseapp.com",
  projectId: "nutri-med-f25b6",
  storageBucket: "nutri-med-f25b6.appspot.com", // Leaving this here is fine, it won't hurt anything
  messagingSenderId: "329547334135",
  appId: "1:329547334135:web:d9c91951fcefbb8ed56ef2",
  measurementId: "G-049CTFPKTE"
};

// Initialize Firebase safely
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// Initialize Services
export const auth = getAuth(app);
export const db = getFirestore(app);
// We removed the export const storage = getStorage(app); line

// Initialize Analytics (Browser-only)
export const analytics = typeof window !== "undefined" ? getAnalytics(app) : null;