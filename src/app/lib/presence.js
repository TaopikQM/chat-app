// // import {
// //   ref,
// //   onValue,
// //   set,
// //   update,
// //   onDisconnect,
// //   serverTimestamp,
// // } from "firebase/database";
// // // import { database } from "./firebase";

// // import { database, storage } from "../config/firebase";

// // export const setupPresence = (userId, page) => {
// //   const userRef = ref(database, `statusOnlineweb/${userId}`);
// //   const connectedRef = ref(database, ".info/connected");

// //   onValue(connectedRef, (snap) => {
// //     if (snap.val() === true) {
// //       onDisconnect(userRef).set({
// //         isOnline: false,
// //         lastSeen: serverTimestamp(),
// //         page,
// //       });

// //       set(userRef, {
// //         isOnline: true,
// //         lastSeen: serverTimestamp(),
// //         page,
// //       });
// //     }
// //   });

// //   const handleVisibility = () => {
// //     if (document.visibilityState === "hidden") {
// //       update(userRef, {
// //         isOnline: false,
// //         lastSeen: serverTimestamp(),
// //       });
// //     } else {
// //       update(userRef, {
// //         isOnline: true,
// //         lastSeen: serverTimestamp(),
// //       });
// //     }
// //   };

// //   document.addEventListener("visibilitychange", handleVisibility);

// //   return () => {
// //     document.removeEventListener("visibilitychange", handleVisibility);
// //   };
// // };





// import { ref, onValue, set, onDisconnect, serverTimestamp } from "firebase/database";
// import { rtdb } from "../config/firebase";

// export const setupPresence = (userId, page) => {
//   const userStatusRef = ref(rtdb, `statusOnline/${userId}`);
//   const connectedRef = ref(rtdb, ".info/connected");

//   onValue(connectedRef, (snap) => {
//     if (snap.val() === true) {
//       // saat disconnect (tab close, crash, dll)
//       onDisconnect(userStatusRef).set({
//         isOnline: false,
//         lastSeen: serverTimestamp(),
//         page
//       });

//       // set online
//       set(userStatusRef, {
//         isOnline: true,
//         lastSeen: serverTimestamp(),
//         page
//       });
//     }
//   });
// };
import {
  ref,
  onValue,
  set,
  onDisconnect,
  serverTimestamp,
} from "firebase/database";
import { database } from "../config/firebase";

export function setupPresence(userId, page = "/") {
  if (!userId) return;

  const userRef = ref(database, `statusOnline/${userId}`);
  const connectedRef = ref(database, ".info/connected");

  const unsub = onValue(connectedRef, snap => {
    if (snap.val() === true) {
      onDisconnect(userRef).set({
        isOnline: false,
        lastSeen: serverTimestamp(),
        page,
      });

      set(userRef, {
        isOnline: true,
        lastSeen: serverTimestamp(),
        page,
      });
    }
  });

  return () => unsub();
}

