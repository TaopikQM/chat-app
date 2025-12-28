"use client";


// import { useEffect, useState, useRef } from "react";
import { setupPresence } from "../lib/presence";
import { useNow } from "../hooks/useNow";
import { formatLastSeen } from "../lib/lastSeen";

import ChatList from "../components/ChatList";
import ChatInput from "../components/ChatInput";
import UserStatus from "../components/UserStatus";
import {useEffect, useState, useRef  } from "react";

//import { browserName, deviceType, osName, browserVersion, osVersion, engineName, engineVersion, deviceVendor, mobileModel} from 'react-device-detect';

import { 
  browserName, 
  deviceType, 
  osName, 
  browserVersion, 
  osVersion, 
  engineName, 
  engineVersion 
} from 'react-device-detect';

// import { rtdb, ref, update, serverTimestamp } from "../../config/firebase";

import { database, storage } from "../config/firebase";
import { ref as databaseRef, push, update,get,set ,onValue,serverTimestamp } from "firebase/database";
const ChatPage = () => {
  const [currentUser] = useState("user5"); // Gantilah dengan ID pengguna yang sesuai
  const [chatWith] = useState("user6"); // ID pengguna tujuan

  // const currentUserId = "user5";
  // const targetUserId = "user6";
  //  const [currentUser] = useState("user5"); // Gantilah dengan ID pengguna yang sesuai
  // const [chatWith] = useState("user6"); // ID pengguna tujuan

  // const currentUserId = "user6";
  // const targetUserId = "user5";
  
   const chatId = [currentUser, chatWith].sort().join("_");

  const [targetStatus, setTargetStatus] = useState(null);
  const bottomRef = useRef(null);
  const now = useNow();

  
  
  /* ===== PRESENCE ===== */
useEffect(() => {
  return setupPresence(currentUser, `/chat/${currentUser}`);
}, [currentUser]);

/* ===== TARGET STATUS ===== */
useEffect(() => {
  const statusRef = databaseRef(database, `statusOnline/${chatWith}`);

  return onValue(statusRef, snap => {
    setTargetStatus(snap.val());
  });
}, [chatWith]);
  
  
  const [replyMessage, setReplyMessage] = useState(null); // ✅ Reply Message
  const [isTyping, setIsTyping] = useState(false); 
  useEffect(() => {
    const typingRef = databaseRef(database, `typingStatus/${currentUser}`);

    // Pantau perubahan status mengetik dari lawan chat
    onValue(typingRef, (snapshot) => {
      const data = snapshot.val();
      setIsTyping(data?.typing || false);
    });

  }, [currentUser]);

  // useEffect(() => {
    
  //   const userRef = databaseRef(database, `pengguna/${currentUser}`);

  //   const logsRef = databaseRef(database, `logs_pengguna1/${currentUser}`);
    
 
  //   // Set pengguna online saat masuk
  //   update(userRef, {
  //     user: currentUser,
  //     isOnline: true,
  //     lastSeen: serverTimestamp(),
  //   });

  //   // Simpan log saat user online
  //   push(logsRef, {
  //     user: currentUser,
  //     status: "online",
  //     timestamp: serverTimestamp(),
  //   });


  //   // Set pengguna offline saat keluar
  //   const handleDisconnect = () => {
  //     update(userRef, {
  //       user: currentUser,
  //       isOnline: false,
  //       lastSeen: serverTimestamp(),
  //     });

  //      // Simpan log saat user offline
  //      push(logsRef, {
  //       user: currentUser,
  //       status: "offline",
  //       timestamp: serverTimestamp(),
  //     });
  //   };

  //   // Update setiap 20 detik
  //   const interval = setInterval(() => {
  //     update(userRef, { lastSeen: serverTimestamp() });

  //      // Simpan log waktu terakhir dilihat
  //      push(logsRef, {
  //       user: currentUser,
  //       status: "update_lastSeen",
  //       timestamp: serverTimestamp(),
  //     });
  //   }, 50000);

  //   window.addEventListener("beforeunload", handleDisconnect);
  //   return () => {
  //     clearInterval(interval);
  //     window.removeEventListener("beforeunload", handleDisconnect);
  //     handleDisconnect(); // Jika komponen di-unmount
     
  //   };
  // }, [currentUser]);
   useEffect(() => {
    getIPInfo();
    getIPInfo1();
  }, []);

  const [ipInfo, setIpInfo] = useState(null);
  const [ipInfo1, setIpInfo1] = useState(null);

  const getIPInfo = async () => {
    try {
      const response = await fetch("/api/ip");
      if (!response.ok) throw new Error("Gagal mengambil data IP");
      const data = await response.json();
      setIpInfo(data); // misal: { ip: '123.45.67.89' }
    } catch (error) {
      console.error("Error mengambil IP:", error);
    }
  };
  const getIPInfo1 = async () => {
    try {
      const response = await fetch(`https://ipapi.co/json/`);
      if (!response.ok) throw new Error("Gagal mengambil data IP");
      const data = await response.json();
      setIpInfo1(data); // misal: { ip: '123.45.67.89' }
    } catch (error) {
      console.error("Error mengambil IP:", error);
    }
  };
  const deviceInfo = {
      browser: browserName ?? null,
      browserVersion: browserVersion ?? null,
      os: osName ?? null,
      osVersion: osVersion ?? null,
      engine: engineName ?? null,
      engineVersion: engineVersion ?? null,
      deviceType: deviceType ?? null,
     // deviceVendor: deviceVendor ?? null,
    //  mobileModel: mobileModel ?? null
    };

  useEffect(() => {
  if (!currentUser) return;

  const userRef = databaseRef(database, `pengguna/${currentUser}`);
  const logsRef = databaseRef(database, `logs_pengguna1/${currentUser}`);

  const saveOldDataToLogs = async (status) => {
    const snapshot = await get(userRef);
    const oldData = snapshot.val();

    // if (oldData) {
    //   const logRef = push(logsRef); // ambil ref-nya dulu
    //   await set(logRef, {
    //     ...oldData,
    //     deleteTime: serverTimestamp(),
    //   });

    //   console.log("Data log disimpan ke:", logRef); // bisa log id-nya
    // }
    if (oldData) {
      // const logData = {
      //   ...oldData,
      //   deleteTime: serverTimestamp(),
      // };

      // const logRef= await set(push(logsRef), logData);
      //  // Tambahkan ini untuk melihat deleteTime yang sudah jadi timestamp
      // onValue(logRef, (snap) => {
      //   console.log("Log disimpan ke:", snap.val());
      // });
      const newLogRef = push(logsRef);

        await set(newLogRef, {
          ...oldData,
          status,
          deleteTime: serverTimestamp(),
        });

        // Tambahkan ini untuk melihat deleteTime yang sudah jadi timestamp
        onValue(newLogRef, (snap) => {
          console.log("Log disimpan ke:", snap.val());
        });
      // console.log("Data yang dikirim ke log:", logData);
    }


  };

  const updateOnlineStatus = async (latitude = null, longitude = null) => {
    await saveOldDataToLogs("online"); // simpan data lama dulu

    const data = {
      user: currentUser,
      isOnline: true,
      lastSeen: serverTimestamp(),
      deviceInfo,
      ip1:ipInfo,
      ip2:ipInfo1,
      
    };

    if (ipInfo) data.ip1 = ipInfo;
    if (ipInfo1) data.ip2 = ipInfo1;
    if (latitude && longitude) {
      data.latitude = latitude;
      data.longitude = longitude;
    }

    update(userRef, data);
  };

  const updateOfflineStatus = async () => {
    await saveOldDataToLogs("offline"); // simpan sebelum offline

    const data = {
      user: currentUser,
      isOnline: false,
      lastSeen: serverTimestamp(),
      
      deviceInfo,
      ip1:ipInfo,
      ip2:ipInfo1,
    };
    if (ipInfo) data.ip1 = ipInfo;
    if (ipInfo1) data.ip2 = ipInfo1;
    if (latitude && longitude) {
      data.latitude = latitude;
      data.longitude = longitude;
    }
     update(userRef, data);
  };

  const updateLastSeen = async () => {
    await saveOldDataToLogs("update_lastSeen"); // simpan sebelum update

    update(userRef, {
      lastSeen: serverTimestamp(),
    });
  };

  const getLocationAndUpdate = () => {
    if (!navigator.geolocation) {
      alert("Geolocation tidak didukung di browser ini.");
      updateOnlineStatus(); // Tetap update walau tanpa lokasi
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const latitude = position.coords.latitude;
        const longitude = position.coords.longitude;
        updateOnlineStatus(latitude, longitude);
      },
      (error) => {
        console.error("Gagal mengambil lokasi:", error);
        alert("Aktifkan GPS untuk update lokasi.");
        updateOnlineStatus(); // Tetap update walau gagal lokasi
      }
    );
  };

  // Saat user aktif
  getLocationAndUpdate();

  // Update lastSeen setiap 50 detik
  const interval = setInterval(() => {
    updateLastSeen();
  }, 50000);

  // Tangani disconnect
  window.addEventListener("beforeunload", updateOfflineStatus);

  return () => {
    clearInterval(interval);
    window.removeEventListener("beforeunload", updateOfflineStatus);
    updateOfflineStatus(); // Saat komponen unmount
  };
}, [currentUser]);

  return (
     <div className="max-w-full mx-auto h-screen flex flex-col bg-gray-100">
      <div className="flex-none bg-white border-b border-gray-300 shadow-md  fixed top-0 left-0 w-full z-50">
        <h2 className="text-xl font-semibold text-center">Chat dengan {chatWith}</h2>
        <h2 className="text-xl font-semibold text-center">{chatWith}</h2>
              
<p className="text-xs text-gray-500">
           {targetStatus?.isOnline
            ? "ONLINE"
            : targetStatus?.lastSeen
            ? `Terakhir online ${formatLastSeen(targetStatus.lastSeen, now)}`
            : "OFFLINE"}
        </p>
                {/*// {isOpen && typingMap[userId] && (
                //   <p className="text-xs text-gray-500 mt-1">
                //     sedang mengetik...
                //   </p>
                // )}*/}

        <UserStatus userId={chatWith} />
        <div className="text-center text-gray-500 text-sm my-2">
          {isTyping && <span>{chatWith} sedang mengetik...</span>}
        </div>
  <hr/>
        
      </div>
  <br/><br/>

      {/* Bagian ChatList bisa di-scroll */}
      <div className="flex-1 overflow-y-auto mt-6">
        <ChatList user1={currentUser} user2={chatWith} setReplyMessage={setReplyMessage} />
        
      </div>
  <br/><br/>  <br/><br/>

      {/* Input tetap di bawah */}

      <div className="flex-none bg-white border-t border-gray-300 fixed bottom-0 left-0 w-full">
        <ChatInput pengirim={currentUser} penerima={chatWith} replyMessage={replyMessage} setReplyMessage={setReplyMessage} />
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
//    const [isTyping, setIsTyping] = useState(false); 
//   useEffect(() => {
//     const typingRef = databaseRef(database, `typingStatus/${currentUser}`);

//     // Pantau perubahan status mengetik dari lawan chat
//     onValue(typingRef, (snapshot) => {
//       const data = snapshot.val();
//       setIsTyping(data?.typing || false);
//     });

//   }, [currentUser]);

//   useEffect(() => {
//     const userRef = databaseRef(database, `pengguna/${currentUser}`);

//     const logsRef = databaseRef(database, `logs_pengguna/${currentUser}`);
    

//     // Set pengguna online saat masuk
//     update(userRef, {
//       user: currentUser,
//       isOnline: true,
//       lastSeen: serverTimestamp(),
//     });

//     // Simpan log saat user online
//     push(logsRef, {
//       user: currentUser,
//       status: "online",
//       timestamp: serverTimestamp(),
//     });

//     // Set pengguna offline saat keluar
//     const handleDisconnect = () => {
//       update(userRef, {
//         user: currentUser,
//         isOnline: false,
//         lastSeen: serverTimestamp(),
//       });

//        // Simpan log saat user offline
//        push(logsRef, {
//         user: currentUser,
//         status: "offline",
//         timestamp: serverTimestamp(),
//       });
//     };

//     // Update setiap 20 detik
//     const interval = setInterval(() => {
//       update(userRef, { lastSeen: serverTimestamp() });

//        // Simpan log waktu terakhir dilihat
//        push(logsRef, {
//         user: currentUser,
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
//   }, [currentUser]);

//   return (
//      <div className="max-w-full mx-auto h-screen flex flex-col bg-gray-100">
//       <div className="flex-none p-4 bg-white border-b border-gray-300 shadow-md fixed top-0 left-0 w-full  sticky ">
//         <h2 className="text-xl font-semibold text-center">Chat dengan {chatWith}</h2>
//         <UserStatus userId={chatWith} />
//         <div className="text-center text-gray-500 text-sm my-2"> 
//           {isTyping && <span>{chatWith} sedang mengetik...</span>}
//         </div>
//       </div>

//       {/* Bagian ChatList bisa di-scroll */}
//       <div className="flex-1 overflow-y-auto p-4 mb-18 mt-18">
//         <ChatList user1={currentUser} user2={chatWith} setReplyMessage={setReplyMessage} />
//       </div>

//       {/* Input tetap di bawah */}
//       <div className="flex-none bg-white border-t border-gray-300 fixed bottom-0 left-0 w-full">
//         <ChatInput pengirim={currentUser} penerima={chatWith} replyMessage={replyMessage} setReplyMessage={setReplyMessage} />
//       </div>
//     </div>
         
      
//   );
// };

// export default ChatPage;// import { useState } from "react";
// // import { rtdb } from "../../config/firebase";
// // import { ref as databaseRef, set, remove, onValue } from "firebase/database";
// // import ChatList from "../../components/ChatList";
// // import ChatInput from "../../components/ChatInput";

// // const ChatPage = () => {
// //   const [currentUser] = useState("user2"); // Gantilah dengan ID pengguna yang sesuai
// //   const [chatWith] = useState("user1"); // ID pengguna tujuan
// //   const [activeCall, setActiveCall] = useState(null); // Cek apakah ada panggilan

// //   // Periksa apakah ada panggilan video yang aktif
// //   useState(() => {
// //     const callRef = databaseRef(rtdb, "VideoCalls");
// //     onValue(callRef, (snapshot) => {
// //       const callData = snapshot.val();
// //       if (callData && (callData.caller === currentUser || callData.callee === currentUser)) {
// //         setActiveCall(callData);
// //       } else {
// //         setActiveCall(null);
// //       }
// //     });
// //   }, [currentUser]);

// //   // Fungsi untuk memulai panggilan video
// //   const startVideoCall = async () => {
// //     const callRef = databaseRef(rtdb, "VideoCalls");
// //     await set(callRef, {
// //       caller: currentUser,
// //       callee: chatWith,
// //       status: "calling",
// //       timestamp: Date.now(),
// //     });
// //   };

// //   // Fungsi untuk mengakhiri panggilan video
// //   const endVideoCall = async () => {
// //     const callRef = databaseRef(rtdb, "VideoCalls");
// //     await remove(callRef); // Hapus data panggilan dari Firebase
// //   };

// //   return (
// //     <div className="max-w-lg mx-auto p-4 space-y-4">
// //       <h1 className="text-xl font-bold text-white text-center">Chat dengan {chatWith}</h1>

// //       {/* Tombol untuk memulai panggilan video */}
// //       {!activeCall ? (
// //         <button
// //           onClick={startVideoCall}
// //           className="bg-green-500 text-white px-4 py-2 rounded-lg w-full"
// //         >
// //           📹 Mulai Video Call
// //         </button>
// //       ) : (
// //         <button
// //           onClick={endVideoCall}
// //           className="bg-red-500 text-white px-4 py-2 rounded-lg w-full"
// //         >
// //           ❌ Akhiri Panggilan
// //         </button>
// //       )}

// //       {/* Daftar Chat */}
// //       <ChatList user1={currentUser} user2={chatWith} />

// //       {/* Input Chat */}
// //       <ChatInput pengirim={currentUser} penerima={chatWith} />
// //     </div>
// //   );
// // };

// // export default ChatPage;
// // // // import ChatList from "../../components/ChatList";
// // // // import ChatInput from "../../components/ChatInput";
// // // // import { useState } from "react";

// // // // const ChatPage = () => {
// // // //   const [currentUser] = useState("user2"); // Gantilah dengan ID pengguna yang sesuai
// // // //   const [chatWith] = useState("user1"); // ID pengguna tujuan

// // // //   return (
// // // //     <div className="max-w-lg mx-auto p-4 space-y-4">
// // // //       <h1 className="text-xl font-bold text-white text-center">Chat {chatWith}</h1>
// // // //       <ChatList user1={currentUser} user2={chatWith} />
// // // //       <ChatInput pengirim={currentUser} penerima={chatWith} />
// // // //     </div>
// // // //   );
// // // // };

// // // // // export default ChatPage;
// // // // import { useState } from "react";
// // // // import ChatList from "../../components/ChatList";
// // // // import ChatInput from "../../components/ChatInput";
// // // // import VideoCall from "../../components/VideoCall";

// // // // const ChatPage = () => {
// // // //   const [currentUser] = useState("user1");
// // // //   const [chatWith] = useState("user2");

// // // //   return (
// // // //     <div className="max-w-lg mx-auto p-4 space-y-4">
// // // //       <h1 className="text-xl font-bold text-white text-center">Chat {chatWith}</h1>
// // // //       <ChatList user1={currentUser} user2={chatWith} />
// // // //       <ChatInput pengirim={currentUser} penerima={chatWith} />
// // // //       <VideoCall pengirim={currentUser} penerima={chatWith} />
// // // //     </div>
// // // //   );
// // // // };

// // // // export default ChatPage;
// // // import { useState } from "react";
// // // import VideoCallList from "../../components/VideoCallList";
// // // import VideoCall from "../../components/VideoCall";

// // // export default function VideoCallPage() {
// // //   const [selectedCall, setSelectedCall] = useState(null);

// // //   return (
// // //     <div className="flex flex-col items-center p-6">
// // //       <h1 className="text-2xl font-bold mb-4">Panggilan Video</h1>
// // //       <VideoCall pengirim="user2" penerima={selectedCall} onEndCall={() => setSelectedCall(null)} />
     

// // //       {!selectedCall ? (
// // //         // Menampilkan daftar panggilan jika belum memilih kontak
// // //         <VideoCallList userId="user2" onSelectCall={(call) => setSelectedCall(call)} />
// // //       ) : (
// // //         // Menampilkan panggilan video jika ada yang dipilih
// // //         <VideoCall pengirim="user2" penerima={selectedCall} onEndCall={() => setSelectedCall(null)} />
// // //       )}
// // //     </div>
// // //   );
// // // }
