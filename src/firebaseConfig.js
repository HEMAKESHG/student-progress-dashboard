// src/firebaseConfig.js

// Import the functions you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAuth } from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAsri3s9DHfvjIT1o6puS_p2mhiLK79qSE",
  authDomain: "student-dashboard-59476.firebaseapp.com",
  projectId: "student-dashboard-59476",
  storageBucket: "student-dashboard-59476.appspot.com",
  messagingSenderId: "412609274490",
  appId: "1:412609274490:web:b20728833864c0fecfd1c3",
  measurementId: "G-C2W4P4F9K5"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const auth = getAuth(app);