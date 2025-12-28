"use client";


// import { useEffect, useState, useRef } from "react";
import { setupPresence } from "../lib/presence";
import { useNow } from "../hooks/useNow";
import { formatLastSeen } from "../lib/lastSeen";


import ChatList from "../components/ChatList";
import ChatInput from "../components/ChatInput";
import UserStatus from "../components/UserStatus";
import {useEffect, useState, useRef  } from "react";

// import { rtdb, ref, update, serverTimestamp } from "../../config/firebase";

import { database, storage } from "../config/firebase";
import { ref as databaseRef, push, update,set ,onValue,serverTimestamp } from "firebase/database";

const ChatPage = () => {
  const [currentUser] = useState("user5"); // Gantilah dengan ID pengguna yang sesuai
  const [chatWith] = useState("user6"); // ID pengguna tujuan

  const chatId = [currentUser, chatWith].sort().join("_");

  const [targetStatus, setTargetStatus] = useState(null);
  const bottomRef = useRef(null);
  const now = useNow();


  /* ===== PRESENCE ===== */
// useEffect(() => {
//   return setupPresence(chatWith, `/chat/${chatWith}`);
// }, [chatWith]);

// /* ===== TARGET STATUS ===== */
// useEffect(() => {
//   const statusRef = databaseRef(database, `statusOnline/${currentUser}`);

//   return onValue(statusRef, snap => {
//     setTargetStatus(snap.val());
//   });
// }, [currentUser]);
   useEffect(() => {
    return setupPresence(currentUser, `/chat/${chatId}`);
  }, [currentUser, chatId]);

  /* ===== DENGARKAN STATUS LAWAN ===== */
  useEffect(() => {
    const statusRef = databaseRef(database, `statusOnline/${chatWith}`);
    return onValue(statusRef, snap => {
      setTargetStatus(snap.val());
    });
  }, [chatWith]);


  
  
const [gpsEnabled, setGpsEnabled] = useState(false);
  const [location, setLocation] = useState(null);
  const [replyMessage, setReplyMessage] = useState(null); // ✅ Reply Message
  const [isTyping, setIsTyping] = useState(false); 
  useEffect(() => {
    const typingRef = databaseRef(database, `typingStatus/${chatWith}`);

    // Pantau perubahan status mengetik dari lawan chat
    onValue(typingRef, (snapshot) => {
      const data = snapshot.val();
      setIsTyping(data?.typing || false);
    });

  }, [chatWith]);
  // useEffect(() => {
  //   const userRef = databaseRef(database, `pengguna/${chatWith}`);

  //   // Set pengguna online saat masuk
  //   update(userRef, {
  //     isOnline: true,
  //     lastSeen: serverTimestamp(),
  //   });

  //   // Set pengguna offline saat keluar
  //   const handleDisconnect = () => {
  //     update(userRef, {
  //       isOnline: false,
  //       lastSeen: serverTimestamp(),
  //     });
  //   };

  //   // Update setiap 20 detik
  //   const interval = setInterval(() => {
  //     update(userRef, { lastSeen: serverTimestamp() });
  //   }, 20000);

  //   window.addEventListener("beforeunload", handleDisconnect);
  //   return () => {
  //     clearInterval(interval);
  //     window.removeEventListener("beforeunload", handleDisconnect);
  //     handleDisconnect(); // Jika komponen di-unmount
  //   };
  // }, [chatWith]);  
  useEffect(() => {
    // getIPInfo();
    getLocation();
  }, []);
  const getLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation tidak didukung di browser ini.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
        setGpsEnabled(true);
      },
      (error) => {
        console.error("Error mengambil lokasi:", error);
        alert("Mohon aktifkan GPS untuk mengirim pesan.");
        setGpsEnabled(false);
      }
    );
  };
 
 useEffect(() => {
   

    const userRef = databaseRef(database, `pengguna/${chatWith}`);

    const logsRef = databaseRef(database, `logs_pengguna/${chatWith}`);

    // Set pengguna online saat masuk
    update(userRef, {
      user: chatWith,
      isOnline: true,
      lastSeen: serverTimestamp(),
       location: location || { latitude: 0, longitude: 0 },
    
    });

    // Simpan log saat user online
    push(logsRef, {
      user: chatWith,
      status: "online",
      timestamp: serverTimestamp(),
       location: location || { latitude: 0, longitude: 0 },
    
    });

   

    // Set pengguna offline saat keluar
    const handleDisconnect = () => {
      update(userRef, {
        user: chatWith,
        isOnline: false,
        lastSeen: serverTimestamp(),
      });

       // Simpan log saat user offline
       push(logsRef, {
        user: chatWith,
        status: "offline",
        timestamp: serverTimestamp(),
         location: location || { latitude: 0, longitude: 0 },
      });
    };

    // Update setiap 20 detik
    const interval = setInterval(() => {
      update(userRef, { lastSeen: serverTimestamp() });

       // Simpan log waktu terakhir dilihat
       push(logsRef, {
        user: chatWith,
        status: "update_lastSeen",
        timestamp: serverTimestamp(),
         location: location || { latitude: 0, longitude: 0 },
      });
    }, 50000);

    window.addEventListener("beforeunload", handleDisconnect);
    return () => {
      clearInterval(interval);
      window.removeEventListener("beforeunload", handleDisconnect);
      handleDisconnect(); // Jika komponen di-unmount
        
    };
  }, [chatWith]);
  return (
     <div className="max-w-full mx-auto h-screen flex flex-col bg-gray-100">
      <div className="flex-none bg-white border-b border-gray-300 shadow-md  fixed top-0 left-0 w-full z-50">
        <h2 className="text-xl font-semibold text-center">Chat dengan {currentUser}</h2>
   <h2 className="text-xl font-semibold text-center">{currentUser}</h2>
              <p className="text-xs text-gray-500">
           {targetStatus?.isOnline
            ? "ONLINE"
            : targetStatus?.lastSeen
            ? `Terakhir online ${formatLastSeen(targetStatus.lastSeen, now)}`
            : "OFFLINE"}
        </p>
                  
        <UserStatus userId={currentUser} />
         <div className="text-center text-gray-500 text-sm my-2">
          {isTyping && <span>{currentUser} sedang mengetik...</span>}
        </div>
  <hr/>
        
      </div>
  <br/><br/>

      {/* Bagian ChatList bisa di-scroll */}
      <div className="flex-1 overflow-y-auto mt-6">
        <ChatList user1={chatWith} user2={currentUser} setReplyMessage={setReplyMessage} />
        
        
      </div>
  <br/><br/>  <br/><br/>

      

      {/* Input tetap di bawah */}
      <div className="flex-none bg-white border-t border-gray-300 fixed bottom-0 left-0 w-full">
        <ChatInput pengirim={chatWith} penerima={currentUser} replyMessage={replyMessage} setReplyMessage={setReplyMessage} />
      </div>
    </div>
  );
};

export default ChatPage;// "use client";
// import ChatList from "../components/ChatList";
// import ChatInput from "../components/ChatInput";
// import UserStatus from "../components/UserStatus";
// import {useEffect, useState } from "react";

// // import { rtdb, ref, update, serverTimestamp } from "../../config/firebase";

// import { database, storage } from "../config/firebase";
// import { ref as databaseRef, push, update,set ,onValue,serverTimestamp } from "firebase/database";

// const ChatPage = () => {
//   const [currentUser] = useState("user5"); // Gantilah dengan ID pengguna yang sesuai
//   const [chatWith] = useState("user6"); // ID pengguna tujuan

//   const [replyMessage, setReplyMessage] = useState(null); // ✅ Reply Message

//   // useEffect(() => {
//   //   const userRef = databaseRef(database, `pengguna/${chatWith}`);

//   //   // Set pengguna online saat masuk
//   //   update(userRef, {
//   //     isOnline: true,
//   //     lastSeen: serverTimestamp(),
//   //   });

//   //   // Set pengguna offline saat keluar
//   //   const handleDisconnect = () => {
//   //     update(userRef, {
//   //       isOnline: false,
//   //       lastSeen: serverTimestamp(),
//   //     });
//   //   };

//   //   // Update setiap 20 detik
//   //   const interval = setInterval(() => {
//   //     update(userRef, { lastSeen: serverTimestamp() });
//   //   }, 20000);

//   //   window.addEventListener("beforeunload", handleDisconnect);
//   //   return () => {
//   //     clearInterval(interval);
//   //     window.removeEventListener("beforeunload", handleDisconnect);
//   //     handleDisconnect(); // Jika komponen di-unmount
//   //   };
//   // }, [chatWith]);  
//  useEffect(() => {
//     const userRef = databaseRef(database, `pengguna/${chatWith}`);

//     const logsRef = databaseRef(database, `logs_pengguna/${chatWith}`);
    

//     // Set pengguna online saat masuk
//     update(userRef, {
//       user: chatWith,
//       isOnline: true,
//       lastSeen: serverTimestamp(),
//     });

//     // Simpan log saat user online
//     push(logsRef, {
//       user: chatWith,
//       status: "online",
//       timestamp: serverTimestamp(),
//     });

//     // Set pengguna offline saat keluar
//     const handleDisconnect = () => {
//       update(userRef, {
//         user: chatWith,
//         isOnline: false,
//         lastSeen: serverTimestamp(),
//       });

//        // Simpan log saat user offline
//        push(logsRef, {
//         user: chatWith,
//         status: "offline",
//         timestamp: serverTimestamp(),
//       });
//     };

//     // Update setiap 20 detik
//     const interval = setInterval(() => {
//       update(userRef, { lastSeen: serverTimestamp() });

//        // Simpan log waktu terakhir dilihat
//        push(logsRef, {
//         user: chatWith,
//         status: "update_lastSeen",
//         timestamp: serverTimestamp(),
//       });
//     }, 50000);

//     window.addEventListener("beforeunload", handleDisconnect);
//     return () => {
//       clearInterval(interval);
//       window.removeEventListener("beforeunload", handleDisconnect);
//       handleDisconnect(); // Jika komponen di-unmount
//     };
//   }, [chatWith]);
//   return (
//      <div className="max-w-full mx-auto h-screen flex flex-col bg-gray-100">
//       <div className="flex-none p-4 bg-white border-b border-gray-300 shadow-md">
//         <h2 className="text-xl font-semibold text-center">Chat dengan {currentUser}</h2>
//         <UserStatus userId={currentUser} />
        
//       </div>

//       {/* Bagian ChatList bisa di-scroll */}
//       <div className="flex-1 overflow-y-auto p-4">
//         <ChatList user1={chatWith} user2={currentUser} setReplyMessage={setReplyMessage} />
//       </div>

      

//       {/* Input tetap di bawah */}
//       <div className="flex-none bg-white border-t border-gray-300">
//         <ChatInput pengirim={chatWith} penerima={currentUser} replyMessage={replyMessage} setReplyMessage={setReplyMessage} />
//       </div>
//     </div>
//   );
// };

// export default ChatPage;

// // // import { useState } from "react";
// // // import ChatList from "../../components/ChatList";
// // // import ChatInput from "../../components/ChatInput";
// // // import VideoCall from "../../components/VideoCall";

// // // const ChatPage = () => {
// // //   const [currentUser] = useState("user2");
// // //   const [chatWith] = useState("user1");

// // //   return (
// // //     <div className="max-w-lg mx-auto p-4 space-y-4">
// // //       <h1 className="text-xl font-bold text-white text-center">Chat {chatWith}</h1>
// // //       <ChatList user1={currentUser} user2={chatWith} />
// // //       <ChatInput pengirim={currentUser} penerima={chatWith} />
// // //       <VideoCall pengirim={currentUser} penerima={chatWith} />
// // //     </div>
// // //   );
// // // };

// // // export default ChatPage;
// // import { useState } from "react";
// // import VideoCallList from "../../components/VideoCallList";
// // import VideoCall from "../../components/VideoCall";

// // export default function VideoCallPage() {
// //   const [selectedCall, setSelectedCall] = useState(null);

// //   return (
// //     <div className="flex flex-col items-center p-6">
// //       <h1 className="text-2xl font-bold mb-4">Panggilan Video</h1>
// //       <VideoCallList userId="user1" onSelectCall={(call) => setSelectedCall(call)} />
// //       <VideoCall pengirim="user1" penerima={selectedCall} onEndCall={() => setSelectedCall(null)} />
     

// //       {!selectedCall ? (
// //         // Menampilkan daftar panggilan jika belum memilih kontak
// //         <VideoCallList userId="user1" onSelectCall={(call) => setSelectedCall(call)} />
// //       ) : (
// //         // Menampilkan panggilan video jika ada yang dipilih
// //         <VideoCall pengirim="user1" penerima={selectedCall} onEndCall={() => setSelectedCall(null)} />
// //       )}
// //     </div>
// //   );
// // }
