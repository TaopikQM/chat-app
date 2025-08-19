"use client";
import ChatList from "../components/ChatList";
import ChatInput from "../components/ChatInput";
import UserStatus from "../components/UserStatus";
import {useEffect, useState, useRef  } from "react";
import { Moon, Sun } from "lucide-react"; // ikon lucide-react


import { browserName, deviceType, osName, browserVersion, osVersion, engineName, engineVersion, deviceVendor, mobileModel} from 'react-device-detect';


// import { rtdb, ref, update, serverTimestamp } from "../../config/firebase";

import { database, storage } from "../config/firebase";
import { ref as databaseRef, push, update,get,set ,onValue,serverTimestamp } from "firebase/database";

const ChatPage = () => {
  
  const [currentUser] = useState("Topik"); // Gantilah dengan ID pengguna yang sesuai
  const [chatWith] = useState("Winda"); // ID pengguna tujuan

  const [isDark, setIsDark] = useState(false);

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
      deviceVendor: deviceVendor ?? null,
      mobileModel: mobileModel ?? null
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
          console.log("Log disimpan ke:", snap.val());
        });
      // console.log("Data yang dikirim ke log:", logData);
    }


  };

  const updateOnlineStatus = async (latitude = null, longitude = null,  ip1 = null, ip2 = null) => {
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
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-gray-100 to-gray-200 dark:from-gray-900 dark:to-gray-800 ">
     <div className="max-w-7xl mx-auto w-full flex flex-col h-screen border border-gray-900 dark:border-gray-100">
   
     {/*<div className="max-w-full mx-auto h-screen flex flex-col bg-gradient-to-b from-gray-100 to-gray-200 dark:from-gray-900 dark:to-gray-800">
       Header fixed top-0 left-0 w-full */}
      <div className="flex-none bg-white dark:bg-gray-900 border border-gray-900 dark:border-gray-100 shadow-md sticky top-0 z-50">
        <div className="relative flex items-center justify-center p-2">
          {/* Judul */}
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
{/* 🔥 Filter & Pagination Bar (nongkrong di bawah header) */}
    <div className="flex-none bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-2 sticky top-[72px] z-40">
      <div className="flex justify-between items-center">
        {/* Left: Select & Info */}
        <div className="flex items-center gap-4">
          <select
            id="itemsPerPage"
            value={itemsPerPage}
            onChange={handleItemsPerPageChange}
            className="border rounded px-2 py-1 dark:bg-gray-700 dark:text-gray-200"
          >
            <option value={500}>500</option>
            <option value={1300}>1300</option>
            <option value={2300}>2300</option>
          </select>
          <span className="text-sm text-gray-600 dark:text-gray-300">
            T.Pesan: {filteredUsers.length}
          </span>
        </div>

        {/* Right: Search */}
        <form className="relative max-w-xs w-full">
          <input 
            onChange={handleSearch} 
            value={searchTerm} 
            type="search" 
            className="block w-full p-2 pl-8 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 
              focus:ring-blue-500 focus:border-blue-500 
              dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
            placeholder="Search..." 
          />
          <svg className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 10a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </form>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <nav className="mt-2 flex items-center justify-between" aria-label="Table navigation">
          <span className="text-sm text-gray-500 dark:text-gray-400">
            Page {currentPage} of {totalPages}
          </span>
          <ul className="inline-flex items-center -space-x-px">
            <li>
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                className="py-1 px-3 border border-gray-300 rounded-l-lg dark:border-gray-600"
                disabled={currentPage === 1}
              >
                ◀
              </button>
            </li>
            {getPagination().map((page, index) => (
              <li key={index}>
                {page === '...' ? (
                  <span className="py-1 px-3">...</span>
                ) : (
                  <button
                    onClick={() => setCurrentPage(page)}
                    className={`py-1 px-3 border border-gray-300 dark:border-gray-600 ${
                      currentPage === page ? 'bg-gray-300 dark:bg-gray-600' : ''
                    }`}
                  >
                    {page}
                  </button>
                )}
              </li>
            ))}
            <li>
              <button
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                className="py-1 px-3 border border-gray-300 rounded-r-lg dark:border-gray-600"
                disabled={currentPage === totalPages}
              >
                ▶
              </button>
            </li>
          </ul>
        </nav>
      )}

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

export default ChatPage;

 {/* Toggle Dark/Light */}
          // <button
          //   onClick={toggleTheme}
          //   className=" absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition"
          // >
          //   {isDark ? <Sun className="w-5 h-5 text-yellow-400" /> : <Moon className="w-5 h-5 text-gray-700" />}
          // </button>


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
  //   </div>

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
