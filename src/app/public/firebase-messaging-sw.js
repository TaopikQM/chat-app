// // /*
// //  * ATTENTION: The "eval" devtool has been used (maybe by default in mode: "development").
// //  * This devtool is neither made for production nor for readable output files.
// //  * It uses "eval()" calls to create a separate source file in the browser devtools.
// //  * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
// //  * or disable the default devtool with "devtool: false".
// //  * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
// //  */
// // /******/ var __webpack_modules__ = ({

// // /***/ "./config/firebase-messaging-sw.js":
// // /*!*********************************************!*\
// //   !*** ./src/config/firebase-messaging-sw.js ***!
// //   \*********************************************/
// // /***/ (() => {

// // eval("function asyncGeneratorStep(gen,resolve,reject,_next,_throw,key,arg){try{var info=gen[key](arg);var value=info.value}catch(error){reject(error);return}if(info.done){resolve(value)}else{Promise.resolve(value).then(_next,_throw)}}function _asyncToGenerator(fn){return function(){var self=this,args=arguments;return new Promise(function(resolve,reject){var gen=fn.apply(self,args);function _next(value){asyncGeneratorStep(gen,resolve,reject,_next,_throw,\"next\",value)}function _throw(err){asyncGeneratorStep(gen,resolve,reject,_next,_throw,\"throw\",err)}_next(undefined)})}}importScripts(\"https://www.gstatic.com/firebasejs/8.10.0/firebase-app.js\");importScripts(\"https://www.gstatic.com/firebasejs/8.10.0/firebase-messaging.js\");firebase.initializeApp({apiKey:process.env.NEXT_PUBLIC_API_KEY,projectId:process.env.NEXT_PUBLIC_PROJECT_ID,messagingSenderId:process.env.NEXT_PUBLIC_MESSAGING_ID,appId:process.env.NEXT_PUBLIC_APP_ID});const messaging=firebase.messaging();messaging.onBackgroundMessage(function(payload){if(Notification.permission===\"granted\"){if(navigator.serviceWorker)navigator.serviceWorker.getRegistration().then(_asyncToGenerator(function*(reg){if(reg)yield reg.showNotification(payload.notification.title,{body:payload.notification.body})}))}})\n\n//# sourceURL=webpack://nextjs-firebase-messaging/./src/config/firebase-messaging-sw.js?");

// // /***/ })

// // /******/ });
// // /************************************************************************/
// // /******/ 
// // /******/ // startup
// // /******/ // Load entry module and return exports
// // /******/ // This entry module can't be inlined because the eval devtool is used.
// // /******/ var __webpack_exports__ = {};
// // /******/ __webpack_modules__["./config/firebase-messaging-sw.js"]();
// // /******/ 

// importScripts('https://www.gstatic.com/firebasejs/8.10.0/firebase-app.js');
// importScripts('https://www.gstatic.com/firebasejs/8.10.0/firebase-messaging.js');

// firebase.initializeApp({ 
//     apiKey: "AIzaSyCV1zYTlwkDooDDh88AnzIov7XpmXz73eQ",
//     projectId: "dolanrek-f88ad",
//     messagingSenderId: "888649724443",
//     appId: "1:888649724443:web:985e08bbfa25c98f9bbebe",
// //     NEXT_PUBLIC_API_KEY= AIzaSyCV1zYTlwkDooDDh88AnzIov7XpmXz73eQ
// // NEXT_PUBLIC_AUTH_DOMAIN= dolanrek-f88ad.firebaseapp.com
// // NEXT_PUBLIC_DATABASE_URL= https://dolanrek-f88ad-default-rtdb.europe-west1.firebasedatabase.app
// // NEXT_PUBLIC_PROJECT_ID= dolanrek-f88ad
// // NEXT_PUBLIC_STORAGE_BUCKET= dolanrek-f88ad.appspot.com
// // NEXT_PUBLIC_MESSAGING_SENDER_ID= 888649724443
// // NEXT_PUBLIC_APP_ID= 1:888649724443:web:985e08bbfa25c98f9bbebe
// // NEXT_PUBLIC_MEANSUREMENT_ID= G-9XBD69HYXS
// //     apiKey: process.env.NEXT_PUBLIC_API_KEY,
// //   authDomain: process.env.NEXT_PUBLIC_AUTH_DOMAIN,
// //   databaseURL: process.env.NEXT_PUBLIC_DATABASE_URL,
// //   projectId: process.env.NEXT_PUBLIC_PROJECT_ID,
// //   storageBucket: process.env.NEXT_PUBLIC_STORAGE_BUCKET,
// //   messagingSenderId: process.env.NEXT_PUBLIC_MESSAGING_SENDER_ID,
// //   appId: process.env.NEXT_PUBLIC_APP_ID,
// //   measurementId: process.env.NEXT_PUBLIC_MEASUREMENT_ID,
// })

// const messaging = firebase.messaging()

// messaging.onBackgroundMessage(function (payload) {
//     if (Notification.permission === 'granted') {
//         if (navigator.serviceWorker)
//             navigator.serviceWorker.getRegistration().then(async function (reg) {
//                 if (reg)
//                     await reg.showNotification(payload.notification.title, {
//                         body: payload.notification.body,
//                     });
//             });
//     }
// })
/* eslint-disable no-undef */

// IMPORT Firebase script SW
importScripts("https://www.gstatic.com/firebasejs/9.22.1/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/9.22.1/firebase-messaging-compat.js");

// Konfigurasi Firebase
// firebase.initializeApp({
//   apiKey: process.env.NEXT_PUBLIC_API_KEY,
//   authDomain: process.env.NEXT_PUBLIC_AUTH_DOMAIN,
//   projectId: process.env.NEXT_PUBLIC_PROJECT_ID,
//   messagingSenderId: process.env.NEXT_PUBLIC_MESSAGING_SENDER_ID,
//   appId: process.env.NEXT_PUBLIC_APP_ID,
// });
// apiKey: process.env.NEXT_PUBLIC_apotek1_ddd99_API_KEY,
  // authDomain: process.env.NEXT_PUBLIC_apotek1_ddd99_AUTH_DOMAIN,
  // databaseURL: process.env.NEXT_PUBLIC_apotek1_ddd99_DATABASE_URL,
  // projectId: process.env.NEXT_PUBLIC_apotek1_ddd99_PROJECT_ID,
  // storageBucket: process.env.NEXT_PUBLIC_apotek1_ddd99_STORAGE_BUCKET,
  // messagingSenderId: process.env.NEXT_PUBLIC_apotek1_ddd99_MESSAGING_SENDER_ID,
  // appId: process.env.NEXT_PUBLIC_apotek1_ddd99_APP_ID,
  // measurementId: process.env.NEXT_PUBLIC_apotek1_ddd99_MEASUREMENT_ID,


firebase.initializeApp({
  
   apiKey: process.env.NEXT_PUBLIC_DOLANREKID_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_DOLANREKID_AUTH_DOMAIN,
    databaseURL: process.env.NEXT_PUBLIC_DOLANREKID_DATABASE_URL,
    projectId: process.env.NEXT_PUBLIC_DOLANREKID_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_DOLANREKID_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_DOLANREKID_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_DOLANREKID_APP_ID,
    measurementId: process.env.NEXT_PUBLIC_DOLANREKID_MEASUREMENT_ID,
});

// aktifkan messaging
const messaging = firebase.messaging();

// Handle pesan pas web ditutup (background)
messaging.onBackgroundMessage((payload) => {
  self.registration.showNotification(payload.notification.title, {
    body: payload.notification.body,
    icon: "/favicon/dolan.png",
  });
});
