// app/firebase.js
 import { initializeApp, getApps, getApp } from "firebase/app";
 import { getFirestore } from "firebase/firestore";
 import { getStorage } from "firebase/storage";
 
 import { getDatabase } from 'firebase/database'; 
 import { getAuth, signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider, createUserWithEmailAndPassword } from "firebase/auth";

//utama dolanrek-f88
 const firebaseConfig = {
     apiKey: process.env.NEXT_PUBLIC_API_KEY,
     authDomain: process.env.NEXT_PUBLIC_AUTH_DOMAIN,
     databaseURL: process.env.NEXT_PUBLIC_DATABASE_URL,
     projectId: process.env.NEXT_PUBLIC_PROJECT_ID,
     storageBucket: process.env.NEXT_PUBLIC_STORAGE_BUCKET,
     messagingSenderId: process.env.NEXT_PUBLIC_MESSAGING_SENDER_ID,
     appId: process.env.NEXT_PUBLIC_APP_ID,
     measurementId: process.env.NEXT_PUBLIC_MEANSUREMENT_ID,
     // Inisialisasi Firebase app hanya sekali
 
     
   
 };
//backup env-v2
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

//backup dolanrekid

const firebaseConfigBackup1 = {
  apiKey: process.env.NEXT_PUBLIC_DOLANREKID_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_DOLANREKID_AUTH_DOMAIN,
  databaseURL: process.env.NEXT_PUBLIC_DOLANREKID_DATABASE_URL,
  projectId: process.env.NEXT_PUBLIC_DOLANREKID_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_DOLANREKID_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_DOLANREKID_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_DOLANREKID_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_DOLANREKID_MEASUREMENT_ID,
};



// // ✅ Inisialisasi dua Firebase App: "main" dan "backup"
// let appMain, appBackup;
const app = initializeApp(firebaseConfig);
 const appBackup = initializeApp(firebaseConfigbu, "backup");
 const appBackup1 = initializeApp(firebaseConfigBackup1, "backup1");

//  let app;
//  if (!getApps().length) {
//    app = initializeApp(firebaseConfig);
//  } else {
//    app = getApp();
//  }

// const existingApps = getApps();

// if (!existingApps.find(app => app.name === "main")) {
//   appMain = initializeApp(firebaseConfig, "main");
// } else {
//   appMain = getApp("main");
// }

// if (!existingApps.find(app => app.name === "backup")) {
//   appBackup = initializeApp(firebaseConfigbu, "backup");
// } else {
//   appBackup = getApp("backup");
// }

// // ✅ Inisialisasi layanan dari masing-masing app
// const storageMain = getStorage(appMain);
// const storageBackup = getStorage(appBackup);

// const databaseMain = getDatabase(appMain);
// const databaseBackup = getDatabase(appBackup); // opsional kalau pakai RTDB backup juga

// // const authMain = getAuth(appMain);
// // const firestoreMain = getFirestore(appMain);
//  const database = getDatabase(app); // Add this line to initialize Realtime Database
 
// const storage = getStorage(app);

// export {
//   // Main app
//   storageMain,
//   databaseMain,

//   // Backup app
//  database, storage,
//   storageBackup,
//   databaseBackup,
// };
// let appMain = null;
// let appBackup = null;

// if (!getApps().length) {
//   appMain = initializeApp(firebaseConfig, "main");
//   appBackup = initializeApp(firebaseConfigBackup, "backup");
// } else {
//   appMain = getApp("main");
//   appBackup = getApp("backup");}
// //  const db = getFirestore(app);

 const storage = getStorage(app);
 const storageBackup = getStorage(appBackup);
 const storageBackup1 = getStorage(appBackup1);



 const auth = getAuth(app);
 
 // Initialize Realtime Database env-v2
 const database = getDatabase(appBackup ); // Add this line to initialize Realtime Database
 const rtdb = getDatabase(appBackup ); // Add this line to initialize Realtime Database
 const db = getDatabase(appBackup ); // Add this line to initialize Realtime Database

//data utama dolanrek-f88ad
 // const database = getDatabase(app); // Add this line to initialize Realtime Database
 // const rtdb = getDatabase(app); // Add this line to initialize Realtime Database
 // const db = getDatabase(app); // Add this line to initialize Realtime Database


//data utama dolanrekid
 // const database = getDatabase(appbackup1); // Add this line to initialize Realtime Database
 // const rtdb = getDatabase(appbackup1); // Add this line to initialize Realtime Database
 // const db = getDatabase(appbackup1); // Add this line to initialize Realtime Database
 
 export { rtdb,db,database, storage, storageBackup,storageBackup1};//,db, storage,   auth, signInWithEmailAndPassword, signInWithPopup,  createUserWithEmailAndPassword, GoogleAuthProvider
//  /*
 // const app = initializeApp(firebaseConfig);
 // const db = getFirestore(app);
 // const storage = getStorage(app);
 // */














