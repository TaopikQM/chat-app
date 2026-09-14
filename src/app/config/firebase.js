// app/firebase.js
 import { initializeApp, getApps, getApp } from "firebase/app";
 import { getFirestore } from "firebase/firestore";
 import { getStorage } from "firebase/storage";

import { getDatabase, ref, push, set, onValue, remove, update,get } from "firebase/database";
import { getMessaging, getToken, onMessage, isSupported} from "firebase/messaging"; 
 // import { getDatabase } from 'firebase/database'; 
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
const app = initializeApp(firebaseConfigBackup1);
// const app = initializeApp(firebaseConfigBackup1);
 const appBackup = initializeApp(firebaseConfigbu, "backup");
 const appBackup1 = initializeApp(firebaseConfigBackup1, "backup1");



// const appBackupnih =
//   getApps().find((a) => a.name === "backupnih")
//     ? getApp("backupnih")
//     : initializeApp(firebaseConfigBackupnih, "backupnih");

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



 const autha = getAuth(app);
 
 // // Initialize Realtime Database env-v2
 // const database = getDatabase(appBackup ); // Add this line to initialize Realtime Database
 // const rtdb = getDatabase(appBackup ); // Add this line to initialize Realtime Database
 // const db = getDatabase(appBackup ); // Add this line to initialize Realtime Database

//data utama dolanrek-f88ad
 // const database = getDatabase(app); // Add this line to initialize Realtime Database
 // const rtdb = getDatabase(app); // Add this line to initialize Realtime Database
 // const db = getDatabase(app); // Add this line to initialize Realtime Database

const auth = getAuth(appBackup1);
// data utama dolanrekid
 const database = getDatabase(appBackup1); // Add this line to initialize Realtime Database
 const rtdb = getDatabase(appBackup1); // Add this line to initialize Realtime Database
 const db = getDatabase(app); // Add this line to initialize Realtime Database

// let messaging = null;
// if (typeof window !== "undefined") {
//   messaging = getMessaging(appBackup1);
// }
export const messaging = typeof window !== 'undefined' ? getMessaging(app) : null;


const firebaseConfigapotek1 = {
  apiKey: process.env.NEXT_PUBLIC_apotek1_ddd99_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_apotek1_ddd99_AUTH_DOMAIN,
  databaseURL: process.env.NEXT_PUBLIC_apotek1_ddd99_DATABASE_URL,
  projectId: process.env.NEXT_PUBLIC_apotek1_ddd99_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_apotek1_ddd99_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_apotek1_ddd99_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_apotek1_ddd99_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_apotek1_ddd99_MEASUREMENT_ID,
};

const appapotek1 =
  getApps().find((a) => a.name === "apotek1")
    ? getApp("apotek1")
    : initializeApp(firebaseConfigapotek1, "apotek1");

export const storageapotek1 = getStorage(appapotek1);

export const rtdbapotek1 = getDatabase(appapotek1);

export const databaseapotek1 = getDatabase(appapotek1);

export const dbapotek1 = getDatabase(appapotek1);


const firebaseConfiuas13256 = {
  apiKey: process.env.NEXT_PUBLIC_uas13256_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_uas13256_AUTH_DOMAIN,
  databaseURL: process.env.NEXT_PUBLIC_uas13256_DATABASE_URL,
  projectId: process.env.NEXT_PUBLIC_uas13256_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_uas13256_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_uas13256_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_uas13256_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_uas13256_MEASUREMENT_ID,
};

const appuas13256 =
  getApps().find((a) => a.name === "uas13256")
    ? getApp("uas13256")
    : initializeApp(firebaseConfiuas13256, "uas13256");

export const storageuas13256 = getStorage(appuas13256);

export const rtdbuas13256 = getDatabase(appuas13256);

export const databaseuas13256 = getDatabase(appuas13256);

export const dbuas13256 = getDatabase(appuas13256);


const firebaseConfiguas_firebase_a0256 = {
  apiKey: process.env.NEXT_PUBLIC_uas_firebase_a0256_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_uas_firebase_a0256_AUTH_DOMAIN,
  databaseURL: process.env.NEXT_PUBLIC_uas_firebase_a0256_DATABASE_URL,
  projectId: process.env.NEXT_PUBLIC_uas_firebase_a0256_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_uas_firebase_a0256_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_uas_firebase_a0256_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_uas_firebase_a0256_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_uas_firebase_a0256_MEASUREMENT_ID,
};

const appuas_firebase_a0256 =
  getApps().find((a) => a.name === "uas_firebase_a0256")
    ? getApp("uas_firebase_a0256")
    : initializeApp(firebaseConfiguas_firebase_a0256, "uas_firebase_a0256");

export const storageuas_firebase_a0256 = getStorage(appuas_firebase_a0256);

export const rtdbuas_firebase_a0256 = getDatabase(appuas_firebase_a0256);

export const databaseuas_firebase_a0256 = getDatabase(appuas_firebase_a0256);

export const dbuas_firebase_a0256 = getDatabase(appuas_firebase_a0256);


const firebaseConfigproa112113270 = {
  apiKey: process.env.NEXT_PUBLIC_proa112113270_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_proa112113270_AUTH_DOMAIN,
  databaseURL: process.env.NEXT_PUBLIC_proa112113270_DATABASE_URL,
  projectId: process.env.NEXT_PUBLIC_proa112113270_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_proa112113270_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_proa112113270_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_proa112113270_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_proa112113270_MEASUREMENT_ID,
};

const appproa112113270 =
  getApps().find((a) => a.name === "proa112113270")
    ? getApp("proa112113270")
    : initializeApp(firebaseConfigproa112113270, "proa112113270");

export const storageproa112113270 = getStorage(appproa112113270);

export const rtdbproa112113270 = getDatabase(appproa112113270);

export const databaseproa112113270 = getDatabase(appproa112113270);

export const dbproa112113270 = getDatabase(appproa112113270);





// let messaging = null;
// if (typeof window !== "undefined") {
//   messaging = getMessaging(app);
// }

// export { messaging, getToken, onMessage };
export { getToken, onMessage };
 
 export { rtdb,db,database, storage, storageBackup,storageBackup1};//,db, storage,   auth, signInWithEmailAndPassword, signInWithPopup,  createUserWithEmailAndPassword, GoogleAuthProvider
//  /*
 // const app = initializeApp(firebaseConfig);
 // const db = getFirestore(app);
 // const storage = getStorage(app);
 // */



export const requestPermissionAndGetToken = async () => {
  if (!messaging) return null;

  // Cek apakah browser support messaging
  const supported = await isSupported();
  if (!supported) {
    console.error('Firebase Messaging tidak didukung di browser ini');
    return null;
  }

  const permission = await Notification.requestPermission();
  if (permission !== 'granted') return null;

  try {
    const token = await getToken(messaging, {
      // vapidKey: "BBiuf9a4Q4j75ggkXu-oSJ2ywJZhQL-D01V0V3RdOK4sQ449WDmXo11Km1MTTF5eioVgPg4B_SGhzhDWEhAW580"// WAJIB GANTI
      vapidKey: process.env.VAPID_PRIVATE_KEY// WAJIB GANTI
      // vapidKey: "BBiuf9a4Q4j75ggkXu-oSJ2ywJZhQL-D01V0V3RdOK4sQ449WDmXo11Km1MTTF5eioVgPg4B_SGhzhDWEhAW580"// WAJIB GANTI
   });
    console.log('✅ getToken() berhasil! Token:', token);
    return token;
  } catch (error) {
    console.error('Token error:', error);
    return null;
  }
};

export const listenForMessages = (callback) => {
  if (!messaging) return;
  return onMessage(messaging, callback);
};














