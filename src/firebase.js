// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database"; // Correct import for Realtime Database

const firebaseConfig = {
  apiKey: "AIzaSyBqfxrg1iBG1cXQYQ7MtgfEWN6e4oyF48Q",
  authDomain: "ahsantyres-2ab63.firebaseapp.com",
  databaseURL: "https://ahsantyres-2ab63-default-rtdb.firebaseio.com",
  projectId: "ahsantyres-2ab63",
  storageBucket: "ahsantyres-2ab63.appspot.com",
  messagingSenderId: "48660427927",
  appId: "1:48660427927:web:06466cd368c0e0dfac65d2",
  measurementId: "G-MNZ9YWVF43"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app); // Correct initialization for Realtime Database

export { db }; // Export db for use in other files
