"use client";

import ChatList from "../components/ChatList";
import ChatInput from "../components/ChatInput";
import UserStatus from "../components/UserStatus";
import {useEffect, useState, useRef  } from "react";

// import { rtdb, ref, update, serverTimestamp } from "../../config/firebase";

import { database, storage } from "../config/firebase";
import { ref as databaseRef, push, update,set ,onValue,serverTimestamp } from "firebase/database";
const ChatPage = () => {
  const [currentUser] = useState("user1"); // Gantilah dengan ID pengguna yang sesuai
  const [chatWith] = useState("user2"); // ID pengguna tujuan
  
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

  useEffect(() => {
    
    const userRef = databaseRef(database, `pengguna/${currentUser}`);

    const logsRef = databaseRef(database, `logs_pengguna/${currentUser}`);
    
 
    // Set pengguna online saat masuk
    update(userRef, {
      user: currentUser,
      isOnline: true,
      lastSeen: serverTimestamp(),
    });

    // Simpan log saat user online
    push(logsRef, {
      user: currentUser,
      status: "online",
      timestamp: serverTimestamp(),
    });


    // Set pengguna offline saat keluar
    const handleDisconnect = () => {
      update(userRef, {
        user: currentUser,
        isOnline: false,
        lastSeen: serverTimestamp(),
      });

       // Simpan log saat user offline
       push(logsRef, {
        user: currentUser,
        status: "offline",
        timestamp: serverTimestamp(),
      });
    };

    // Update setiap 20 detik
    const interval = setInterval(() => {
      update(userRef, { lastSeen: serverTimestamp() });

       // Simpan log waktu terakhir dilihat
       push(logsRef, {
        user: currentUser,
        status: "update_lastSeen",
        timestamp: serverTimestamp(),
      });
    }, 50000);

    window.addEventListener("beforeunload", handleDisconnect);
    return () => {
      clearInterval(interval);
      window.removeEventListener("beforeunload", handleDisconnect);
      handleDisconnect(); // Jika komponen di-unmount
     
    };
  }, [currentUser]);

  return (
     <div className="max-w-full mx-auto h-screen flex flex-col bg-gray-100">
      <div className="flex-none bg-white border-b border-gray-300 shadow-md  fixed top-0 left-0 w-full sticky">
        <h2 className="text-xl font-semibold text-center">Chat dengan {chatWith}</h2>
        <UserStatus userId={chatWith} />
        <div className="text-center text-gray-500 text-sm my-2">
          {isTyping && <span>{chatWith} sedang mengetik...</span>}
        </div>
  <hr/>
        
      </div>

      {/* Bagian ChatList bisa di-scroll */}
      <div className="flex-1 overflow-y-auto p-4 mb-16 mt-16">
        <ChatList user1={currentUser} user2={chatWith} setReplyMessage={setReplyMessage} />
        
      </div>

      {/* Input tetap di bawah */}

      <div className="flex-none bg-white border-t border-gray-300 fixed bottom-0 left-0 w-full">
        <ChatInput pengirim={currentUser} penerima={chatWith} replyMessage={replyMessage} setReplyMessage={setReplyMessage} />
      </div>
    </div>
  );
};

export default ChatPage;// import { useState } from "react";
// import { rtdb } from "../../config/firebase";
// import { ref as databaseRef, set, remove, onValue } from "firebase/database";
// import ChatList from "../../components/ChatList";
// import ChatInput from "../../components/ChatInput";

// const ChatPage = () => {
//   const [currentUser] = useState("user2"); // Gantilah dengan ID pengguna yang sesuai
//   const [chatWith] = useState("user1"); // ID pengguna tujuan
//   const [activeCall, setActiveCall] = useState(null); // Cek apakah ada panggilan

//   // Periksa apakah ada panggilan video yang aktif
//   useState(() => {
//     const callRef = databaseRef(rtdb, "VideoCalls");
//     onValue(callRef, (snapshot) => {
//       const callData = snapshot.val();
//       if (callData && (callData.caller === currentUser || callData.callee === currentUser)) {
//         setActiveCall(callData);
//       } else {
//         setActiveCall(null);
//       }
//     });
//   }, [currentUser]);

//   // Fungsi untuk memulai panggilan video
//   const startVideoCall = async () => {
//     const callRef = databaseRef(rtdb, "VideoCalls");
//     await set(callRef, {
//       caller: currentUser,
//       callee: chatWith,
//       status: "calling",
//       timestamp: Date.now(),
//     });
//   };

//   // Fungsi untuk mengakhiri panggilan video
//   const endVideoCall = async () => {
//     const callRef = databaseRef(rtdb, "VideoCalls");
//     await remove(callRef); // Hapus data panggilan dari Firebase
//   };

//   return (
//     <div className="max-w-lg mx-auto p-4 space-y-4">
//       <h1 className="text-xl font-bold text-white text-center">Chat dengan {chatWith}</h1>

//       {/* Tombol untuk memulai panggilan video */}
//       {!activeCall ? (
//         <button
//           onClick={startVideoCall}
//           className="bg-green-500 text-white px-4 py-2 rounded-lg w-full"
//         >
//           📹 Mulai Video Call
//         </button>
//       ) : (
//         <button
//           onClick={endVideoCall}
//           className="bg-red-500 text-white px-4 py-2 rounded-lg w-full"
//         >
//           ❌ Akhiri Panggilan
//         </button>
//       )}

//       {/* Daftar Chat */}
//       <ChatList user1={currentUser} user2={chatWith} />

//       {/* Input Chat */}
//       <ChatInput pengirim={currentUser} penerima={chatWith} />
//     </div>
//   );
// };

// export default ChatPage;
// // // import ChatList from "../../components/ChatList";
// // // import ChatInput from "../../components/ChatInput";
// // // import { useState } from "react";

// // // const ChatPage = () => {
// // //   const [currentUser] = useState("user2"); // Gantilah dengan ID pengguna yang sesuai
// // //   const [chatWith] = useState("user1"); // ID pengguna tujuan

// // //   return (
// // //     <div className="max-w-lg mx-auto p-4 space-y-4">
// // //       <h1 className="text-xl font-bold text-white text-center">Chat {chatWith}</h1>
// // //       <ChatList user1={currentUser} user2={chatWith} />
// // //       <ChatInput pengirim={currentUser} penerima={chatWith} />
// // //     </div>
// // //   );
// // // };

// // // // export default ChatPage;
// // // import { useState } from "react";
// // // import ChatList from "../../components/ChatList";
// // // import ChatInput from "../../components/ChatInput";
// // // import VideoCall from "../../components/VideoCall";

// // // const ChatPage = () => {
// // //   const [currentUser] = useState("user1");
// // //   const [chatWith] = useState("user2");

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
// //       <VideoCall pengirim="user2" penerima={selectedCall} onEndCall={() => setSelectedCall(null)} />
     

// //       {!selectedCall ? (
// //         // Menampilkan daftar panggilan jika belum memilih kontak
// //         <VideoCallList userId="user2" onSelectCall={(call) => setSelectedCall(call)} />
// //       ) : (
// //         // Menampilkan panggilan video jika ada yang dipilih
// //         <VideoCall pengirim="user2" penerima={selectedCall} onEndCall={() => setSelectedCall(null)} />
// //       )}
// //     </div>
// //   );
// // }
