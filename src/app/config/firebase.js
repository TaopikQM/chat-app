 // app/firebase.js
 import { initializeApp, getApps, getApp } from "firebase/app";
 import { getFirestore } from "firebase/firestore";
 import { getStorage } from "firebase/storage";
 
 import { getDatabase } from 'firebase/database'; 
 import { getAuth, signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider, createUserWithEmailAndPassword } from "firebase/auth";
 
 const firebaseConfig = {
     apiKey: process.env.API_KEY,
     authDomain: process.env.AUTH_DOMAIN,
     databaseURL: process.env.DATABASE_URL,
     projectId: process.env.PROJECT_ID,
     storageBucket: process.env.STORAGE_BUCKET,
     messagingSenderId: process.env.MESSAGING_SENDER_ID,
     appId: process.env.APP_ID,
     measurementId: process.env.MEANSUREMENT_ID,
     // Inisialisasi Firebase app hanya sekali
 
     
   
 };
 // Initialize Firebase
 let app;
 if (!getApps().length) {
   app = initializeApp(firebaseConfig);
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
