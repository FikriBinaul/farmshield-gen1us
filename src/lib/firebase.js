// Import the functions you need from the SDKs you need
import { initializeApp, getApps } from "firebase/app";
import { getDatabase } from "firebase/database";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCiUEQOruZ8cbHXkchFtmFfBOoZqtKVyfA",
  authDomain: "farmshield-9cc44.firebaseapp.com",
  projectId: "farmshield-9cc44",
  storageBucket: "farmshield-9cc44.firebasestorage.app",
  messagingSenderId: "382522658872",
  appId: "1:382522658872:web:7487d95bd44218f14716cd",
  measurementId: "G-7K8L2HPSJY",
  // Database URL with correct region (asia-southeast1)
  databaseURL: "https://farmshield-9cc44-default-rtdb.asia-southeast1.firebasedatabase.app"
};

// Initialize Firebase (prevent multiple initializations in serverless)
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

// Initialize services (safe for serverless)
// Use the database URL from config to ensure correct region
export const realtimedb = getDatabase(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// Analytics should only be initialized in browser environment
// Moved to _app.js or component level if needed