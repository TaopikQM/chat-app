"use client";
import ChatList from "../components/ChatList";
import ChatInput from "../components/ChatInput";
import UserStatus from "../components/UserStatus";
import {useEffect, useState } from "react";

import { browserName, deviceType, osName, browserVersion, osVersion, engineName, engineVersion, deviceVendor, mobileModel} from 'react-device-detect';

// import { rtdb, ref, update, serverTimestamp } from "../../config/firebase";

import { database, storage } from "../config/firebase";
import { ref as databaseRef, push, update,get,set ,onValue,serverTimestamp } from "firebase/database";

const ChatPage = () => {
  const [currentUser] = useState("user3"); // Gantilah dengan ID pengguna yang sesuai
  const [chatWith] = useState("user4"); // ID pengguna tujuan

  const [replyMessage, setReplyMessage] = useState(null); // ✅ Reply Message
  // const [gpsEnabled, setGpsEnabled] = useState(false);

  // const [location, setLocation] = useState(null);
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
//    useEffect(() => {
//     // getIPInfo();
//     getLocation();
//   }, []);
//   const getLocation = () => {
//     if (!navigator.geolocation) {
//       alert("Geolocation tidak didukung di browser ini.");
//       return;
//     }

//     navigator.geolocation.getCurrentPosition(
//       (position) => {
//         setLocation({
//           latitude: position.coords.latitude,
//           longitude: position.coords.longitude,
//         });
//         setGpsEnabled(true);
//       },
//       (error) => {
//         console.error("Error mengambil lokasi:", error);
//         alert("Mohon aktifkan GPS untuk mengirim pesan.");
//         setGpsEnabled(false);
//       }
//     );
//   };
//  useEffect(() => {
   
//   if (!location || !gpsEnabled) return;
//     const userRef = databaseRef(database, `pengguna/${chatWith}`);

//     const logsRef = databaseRef(database, `logs_pengguna/${chatWith}`);
    
// // if (!gpsEnabled) {
// //       alert("Anda harus mengaktifkan GPS untuk mengirim pesan!");
// //       return;
// // }
//     // Set pengguna online saat masuk
//     update(userRef, {
//       user: chatWith,
//       isOnline: true,
//       location:   location ,
  
//       lastSeen: serverTimestamp(),
//     });

//     // Simpan log saat user online
//     push(logsRef, {
//       user: chatWith,
//       status: "online",
//       location: location,
  

//       timestamp: serverTimestamp(),
//     });

//     // Set pengguna offline saat keluar
//     const handleDisconnect = () => {
//       update(userRef, {
//         user: chatWith,
//         isOnline: false,
//         lastSeen: serverTimestamp(),location: location,
//       });

//        // Simpan log saat user offline
//        push(logsRef, {
//         user: chatWith,
//         status: "offline",
//         timestamp: serverTimestamp(),location: location,
//       });
//     };

//     // Update setiap 20 detik
//     const interval = setInterval(() => {
//       update(userRef, { lastSeen: serverTimestamp() });

//        // Simpan log waktu terakhir dilihat
//        push(logsRef, {
//         user: chatWith,
//         status: "update_lastSeen",
//         timestamp: serverTimestamp(),location: location,
//       });
//     }, 50000);

//     window.addEventListener("beforeunload", handleDisconnect);
//     return () => {
//       clearInterval(interval);
//       window.removeEventListener("beforeunload", handleDisconnect);
//       handleDisconnect(); // Jika komponen di-unmount
//     };
//   }, [chatWith]);
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
      console
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
      deviceVendor: deviceVendor ?? null,
      mobileModel: mobileModel ?? null
    };

  useEffect(() => {
  if (!currentUser) return;

  const userRef = databaseRef(database, `pengguna/${chatWith}`);
  const logsRef = databaseRef(database, `logs_pengguna1/${chatWith}`);

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
      user: chatWith,
      isOnline: true,
      lastSeen: serverTimestamp(),
      deviceInfo,
      // ip1:ipInfo,
      // ip2:ipInfo1,
      
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
      user: chatWith,
      isOnline: false,
      lastSeen: serverTimestamp(),
      
      deviceInfo,
      // ip1:ipInfo,
      // ip2:ipInfo1,
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
}, [chatWith]);
 
  return (
     <div className="max-w-full mx-auto h-screen flex flex-col bg-gray-100">
      <div className="flex-none p-4 bg-white border-b border-gray-300 shadow-md fixed top-0 left-0 w-full z-50">
        <h2 className="text-xl font-semibold text-center">Chat dengan {currentUser}</h2>
        <UserStatus userId={currentUser} />
        
      </div>
  <br/><br/>

      {/* Bagian ChatList bisa di-scroll */}
      <div className="flex-1 overflow-y-auto mt-16">
        <ChatList user1={chatWith} user2={currentUser} setReplyMessage={setReplyMessage} />
      </div>
  <br/><br/>  <br/><br/>
      

      {/* Input tetap di bawah */}
      <div className="flex-none bg-white border-t border-gray-300">
        <ChatInput pengirim={chatWith} penerima={currentUser} replyMessage={replyMessage} setReplyMessage={setReplyMessage} />
      </div>
    </div>
  );
};

export default ChatPage;

// // import { useState } from "react";
// // import ChatList from "../../components/ChatList";
// // import ChatInput from "../../components/ChatInput";
// // import VideoCall from "../../components/VideoCall";

// // const ChatPage = () => {
// //   const [currentUser] = useState("user2");
// //   const [chatWith] = useState("user1");

// //   return (
// //     <div className="max-w-lg mx-auto p-4 space-y-4">
// //       <h1 className="text-xl font-bold text-white text-center">Chat {chatWith}</h1>
// //       <ChatList user1={currentUser} user2={chatWith} />
// //       <ChatInput pengirim={currentUser} penerima={chatWith} />
// //       <VideoCall pengirim={currentUser} penerima={chatWith} />
// //     </div>
// //   );
// // };

// // export default ChatPage;
// import { useState } from "react";
// import VideoCallList from "../../components/VideoCallList";
// import VideoCall from "../../components/VideoCall";

// export default function VideoCallPage() {
//   const [selectedCall, setSelectedCall] = useState(null);

//   return (
//     <div className="flex flex-col items-center p-6">
//       <h1 className="text-2xl font-bold mb-4">Panggilan Video</h1>
//       <VideoCallList userId="user1" onSelectCall={(call) => setSelectedCall(call)} />
//       <VideoCall pengirim="user1" penerima={selectedCall} onEndCall={() => setSelectedCall(null)} />
     

//       {!selectedCall ? (
//         // Menampilkan daftar panggilan jika belum memilih kontak
//         <VideoCallList userId="user1" onSelectCall={(call) => setSelectedCall(call)} />
//       ) : (
//         // Menampilkan panggilan video jika ada yang dipilih
//         <VideoCall pengirim="user1" penerima={selectedCall} onEndCall={() => setSelectedCall(null)} />
//       )}
//     </div>
//   );
// }
