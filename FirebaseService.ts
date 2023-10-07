import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyBonmx2_bqKC9MY47XeVCgEvbFor2AuSAw",
    authDomain: "food-waste-tracker-3d8c7.firebaseapp.com",
    projectId: "food-waste-tracker-3d8c7",
    storageBucket: "food-waste-tracker-3d8c7.appspot.com",
    messagingSenderId: "252974891814",
    appId: "1:252974891814:web:242d66bc74951984c4f7e7",
    measurementId: "G-135S4KDMTF"
  };
  

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Get Firestore instance
const db = getFirestore(app);

export { app, db };