// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCiUEQOruZ8cbHXkchFtmFfBOoZqtKVyfA",
  authDomain: "farmshield-9cc44.firebaseapp.com",
  projectId: "farmshield-9cc44",
  storageBucket: "farmshield-9cc44.firebasestorage.app",
  messagingSenderId: "382522658872",
  appId: "1:382522658872:web:7487d95bd44218f14716cd",
  measurementId: "G-7K8L2HPSJY"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const realtimedb = getDatabase(app);
export const db = getFirestore(app);
export const storage = getStorage(app);