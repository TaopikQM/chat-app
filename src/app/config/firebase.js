"use client"; // app/firebase.js
 import { initializeApp, getApps, getApp } from "firebase/app";
 import { getFirestore } from "firebase/firestore";
 import { getStorage } from "firebase/storage";
 
 import { getDatabase } from 'firebase/database'; 
 import { getAuth, signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider, createUserWithEmailAndPassword } from "firebase/auth";
 
 const firebaseConfig = {
     apiKey: process.env.API_KEY,
     authDomain: process.env.AUTH_DOMAIN,
     databaseURL: process.env.NEXT_PUBLIC_DATABASE_URL,
     projectId: process.env.PROJECT_ID,
     storageBucket: process.env.NEXT_PUBLIC_STORAGE_BUCKET,
     messagingSenderId: process.env.NEXT_PUBLIC_MESSAGING_SENDER_ID,
     appId: process.env.APP_ID,
     measurementId: process.env.NEXT_PUBLIC_MEANSUREMENT_ID,
     // Inisialisasi Firebase app hanya sekali
 
     
   
 };
//backup
const firebaseConfigbu = {
  apiKey: process.env.NEXT_PUBLIC_firebase_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_firebase_AUTH_DOMAIN,
  databaseURL: process.env.NEXT_PUBLIC_firebase_DATABASE_URL,
  projectId: process.env.NEXT_PUBLIC_firebase_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_firebase_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_firebase_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_firebase_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_firebase_MEANSUREMENT_ID
};
let app;
if (!getApps().length) {
  try {
    app = initializeApp(firebaseConfig);
    console.log("✅ Firebase initialized with PRIMARY config");
  } catch (error) {
    console.warn("⚠️ Failed to init with primary config, trying fallback...", error);
    try {
      app = initializeApp(firebaseConfigbu);
      console.log("✅ Firebase initialized with FALLBACK config");
    } catch (fallbackError) {
      console.error("❌ Both Firebase configs failed", fallbackError);
      throw fallbackError;
    }
  }
} else {
  app = getApp();
}
//  const db = getFirestore(app);
//  const storage = getStorage(app);
//  const auth = getAuth(app);
 
 // Initialize Realtime Database
 const database = getDatabase(app); // Add this line to initialize Realtime Database
 
const storage = getStorage(app);

 export { database, storage};//,db, storage,   auth, signInWithEmailAndPassword, signInWithPopup,  createUserWithEmailAndPassword, GoogleAuthProvider
 /*
 const app = initializeApp(firebaseConfig);
 const db = getFirestore(app);
 const storage = getStorage(app);
 */

