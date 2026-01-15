import { useState, useEffect, useRef } from "react";
import { format } from "date-fns";
import { database } from "../config/firebase";
import { ref as databaseRef, onValue,update,remove,set,get,push } from "firebase/database";
 
import Modal from "react-modal";

function linkify(text) {
  if (!text) return "";
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  return text.replace(
    urlRegex,
    (url) => `<a href="${url}" target="_blank" rel="noopener noreferrer" class="text-blue-600 dark:text-blue-400 underline hover:text-blue-800 dark:hover:text-blue-300">${url}</a>`
  );
}

const ChatMessage = ({ message, user1,  ipInfo,
  ipInfo1,
  location, openDropdownId, setOpenDropdownId, setReplyMessage, setSearchTerm, setCurrentPage  }) => {
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const isSender = message.pengirim === user1;

    const isDropdownOpen = openDropdownId === message.id;
 

    
    
    const toggleDropdown = (e) => {
      e.stopPropagation(); // Hindari event bubbling
      setOpenDropdownId(isDropdownOpen ? null : message.id);
    };

    const handleDownload = (fileUrl, fileName) => {
      const link = document.createElement("a");
      link.href = fileUrl;
      link.download = fileName; // Nama file yang akan didownload
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    };
    
    const getFileIcon = (fileType) => {
      switch (fileType) {
        case "application/pdf":
          return (
            <svg className="w-6 h-6" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect width="48" height="48" rx="8" fill="#FF4B4B" />
              <text x="10" y="32" fontSize="18" fill="white" fontWeight="bold">PDF</text>
            </svg>
          );
        case "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet":
          return (
            <svg className="w-6 h-6" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect width="48" height="48" rx="8" fill="#2ECC71" />
              <text x="7" y="32" fontSize="18" fill="white" fontWeight="bold">XLSX</text>
            </svg>
          );
        case "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
          return (
            <svg className="w-6 h-6" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect width="48" height="48" rx="8" fill="#3498DB" />
              <text x="5" y="32" fontSize="18" fill="white" fontWeight="bold">DOCX</text>
            </svg>
          );
        default:
          return (
            <svg className="w-6 h-6" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect width="48" height="48" rx="8" fill="#95A5A6" />
              <text x="10" y="32" fontSize="18" fill="white" fontWeight="bold">FILE</text>
            </svg>
          );
      }
    };
    
    
    const [isOpen, setIsOpen] = useState(false);
    const [currentIndex, setCurrentIndex] = useState(0);

    const [touchStartX, setTouchStartX] = useState(0);
    const [touchEndX, setTouchEndX] = useState(0);

    const files = message.files || [];
    const openModal = (index) => {
      setCurrentIndex(index);
      setIsOpen(true);
    };
    const closeModal = () => setIsOpen(false);
    const nextFile = () => setCurrentIndex((prev) => (prev + 1) % files.length);
    const prevFile = () => setCurrentIndex((prev) => (prev - 1 + files.length) % files.length);
    const downloadFile = () => {
      const a = document.createElement("a");
      a.href = files[currentIndex].url;
      a.download = files[currentIndex].name || "downloaded_file";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    };

    const handleTouchStart = (e) => {
      setTouchStartX(e.touches[0].clientX);
    };
    
    const handleTouchMove = (e) => {
      setTouchEndX(e.touches[0].clientX);
    };
    
    const handleTouchEnd = () => {
      if (touchStartX - touchEndX > 50) {
        // Geser ke kiri (next file)
        nextFile();
      } else if (touchEndX - touchStartX > 50) {
        // Geser ke kanan (prev file)
        prevFile();
      }
    };

 
const autoDeleteMessage = async (message) => {
  if (!message?.id) return;

  const messageRef = databaseRef(database, `chatsBox1/${message.id}`);
  const logMessageRef = databaseRef(database, `log_chatsBox/${message.id}`);

  try {
    // cek masih ada atau sudah terhapus
    const snap = await get(messageRef);
    if (!snap.exists()) return;

   const data = snap.val();

    // 🔒 SAFETY CHECK
    if (data.read !== true) {
      console.log("⏸️ Pesan belum dibaca, batal auto delete");
      return;
    }

    // simpan ke log
    await update(logMessageRef, {
      // ...message,
      ...data,
      deleteTime: Date.now(),
      deleteBy: "system-auto-5min",
      meta: {
         ip1: ipInfo,
         ip2: ipInfo1,
         location: {
           latitude: location?.latitude ?? null,
           longitude: location?.longitude ?? null,
           accuracy: location?.accuracy ?? null,
         },

         // location,
       },
    });

    // hapus pesan utama
    await remove(messageRef);
   console.log(
      "🗑️ Pesan BERHASIL dihapus otomatis",
      {
        id: message.id,
        deletedAt: new Date().toLocaleString(),
      }
    );
   
  } catch (err) {
    console.error("Auto delete gagal:", err);
  }
};

  useEffect(() => {
   if (!message?.files?.length) return;
 
  // BELUM dibaca → jangan set timer
  if (message.read !== true) return;
   
   const FIVE_MINUTES = 2 * 60 * 1000;//2 menit
   const now = Date.now();
  const timePassed = now - message.timestamp;

   // const isExpired = Date.now() - message.timestamp >= FIVE_MINUTES;
 
   // sisa waktu menuju 5 menit
   const remainingTime = FIVE_MINUTES - timePassed;
 
   if (remainingTime <= 0) {
     // sudah lewat 5 menit → langsung hapus
     autoDeleteMessage(message);
     return;
   }
 
   // belum 5 menit → set timer
   const timer = setTimeout(() => {
     autoDeleteMessage(message);
   }, remainingTime);
 
   return () => clearTimeout(timer);
 }, [message.id, message.read]);

 const FIVE_MINUTES = 2 * 60 * 1000;

const isExpired =
  message?.timestamp
    ? Date.now() - message.timestamp >= FIVE_MINUTES
    : false;


 const [openEdit, setOpenEdit] = useState(false);
const [editData, setEditData] = useState(null);

 const handleEditaa = (msg) => {
  setEditData(msg);
  setOpenEdit(true);
};
 const handleSaveEdit = async () => {
  if (!editData?.id) return;

  if (!editData.newPesan || editData.newPesan.trim() === "") {
    alert("Pesan tidak boleh kosong");
    return;
  }

  const msgRef = databaseRef(database, `chatsBox1/${editData.id}`);
  const snapshot = await get(msgRef);
  if (!snapshot.exists()) return;

  const oldData = snapshot.val();
  const now = Date.now();

  const updateBy = oldData.pengirim; // atau editor saat ini jika mau

  // simpan ke logsUpdate
  await push(
    databaseRef(database, `chatsBox1/${editData.id}/logsUpdate`),
    {
      oldPesan: oldData.pesan,
      newPesan: editData.newPesan,
      updateBy,
      timeEdit: now,
    }
  );

  // update pesan utama
  await update(msgRef, {
    pesan: editData.newPesan,
    timeEdit: now,
    updateBy,
    isEdited: true,
  });

  setOpenEdit(false);
};

 
 const handleEdit = (msg) => {
  setEditData({ ...msg, newPesan: msg.pesan, oldPesan: msg.pesan });
  setOpenEdit(true);
};


 const handleSaveEditbbb = async () => {
  if (!editData?.id) return;

  if (!editData.pesan || editData.pesan.trim() === "") {
    alert("Pesan tidak boleh kosong");
    return;
  }

  const msgRef = databaseRef(database, `chatsBox1/${editData.id}`);
  const snapshot = await get(msgRef);
  if (!snapshot.exists()) return;

  const oldData = snapshot.val(); // data lama pesan
  const now = Date.now();

  // 🔹 updateBy mengikuti pengirim pesan lama
  const updateBy = oldData.pengirim;

  // 1️⃣ simpan ke logsUpdate
  await push(
    databaseRef(database, `chatsBox1/${editData.id}/logsUpdate`),
    {
      oldPesan: oldData.pesan,
      newPesan: editData.pesan,
      updateBy, // <-- pengirim lama
      timeEdit: now,
    }
  );

  // 2️⃣ update pesan di data utama
  await update(msgRef, {
    pesan: editData.pesan,
    timeEdit: now,
    updateBy: updateBy, // opsional: bisa juga pakai editor saat ini
    isEdited: true,
  });

  setOpenEdit(false);
};


 const handleSaveEditaa = async () => {
  if (!editData?.id) return;

  if (!editData.pesan || editData.pesan.trim() === "") {
    alert("Pesan tidak boleh kosong");
    return;
  }

  const msgRef = databaseRef(database, `chatsBox1/${editData.id}`);
  const snapshot = await get(msgRef);
  if (!snapshot.exists()) return;

  const oldData = snapshot.val();
  const now = Date.now();

  // 1️⃣ simpan histori edit
  await push(
    databaseRef(database, `chatsBox1/${editData.id}/logsUpdate`),
    {
      oldPesan: oldData.pesan,
      newPesan: editData.pesan,
      updateBy: "admin",
      timeEdit: now,
    }
  );

  // 2️⃣ update HANYA pesan
  await update(msgRef, {
    pesan: editData.pesan,
    timeEdit: now,
    updateBy: "admin",
    isEdited: true,
  });

  setOpenEdit(false);
};



    return (
      <>
     
      <div className={`flex ${isSender ? "justify-end" : "justify-start"}`}>
        <div className="items-start space-x-2">
 

          
          {message.replyTo && (
            <div
              className="bg-gray-300 text-gray-800 p-2 rounded-lg max-w-sm mb-1 cursor-pointer border-l-4 border-blue-500"
              // onClick={() => {
              //   setSearchTerm(message.replyTo.id);
              //   console.log(message.replyTo.id); // Set pencarian ke pesan asli
              //   setCurrentPage(1); // Reset ke halaman pertama agar ditemukan
              //   setTimeout(() => {
              //     const targetElement = document.getElementById(`msg-${message.replyTo.id}`);
              //     if (targetElement) {
              //       targetElement.scrollIntoView({ behavior: "smooth", block: "center" });
              //     } else {
              //       alert("🚫 Pesan asli tidak ditemukan!");
              //     }
              //   }, 300); // Tunggu pagination selesai
              // }}
            >
              <small className="text-xs font-semibold">Reply:{message.replyTo.pengirim }</small>
              <p className="text-sm">{message.replyTo.pesan}</p>
              <p className="text-sm">{format(message.timestamp, "HH:mm:ss, hh-mm-y")}</p>
            </div>
          )}
          <div className="flex ">
            {isSender && (
              <div className="relative">
                <button
                  onClick={toggleDropdown}
                  className="self-center p-2 text-sm text-gray-500 bg-white rounded-lg hover:bg-gray-100 focus:ring-4 focus:outline-none dark:text-white dark:bg-gray-500 dark:hover:bg-gray-400 dark:focus:ring-gray-600"
                >
                  <svg className="w-4 h-4 text-gray-200 dark:text-gray-400" aria-hidden="true" viewBox="0 0 4 15" fill="currentColor">
                    <path d="M3.5 1.5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0Zm0 6.041a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0Zm0 5.959a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0Z" />
                  </svg>
                </button>
                {isDropdownOpen && (
                  <div className="absolute bottom-full mb-2 bg-white divide-y divide-gray-100 rounded-lg shadow-sm w-40 dark:bg-gray-500 dark:divide-gray-600 z-[100]">
                    <ul className="py-2 text-sm text-gray-700 dark:text-gray-200">
                      <li className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer">
                        Pesan Dibaca: {message.timestampRead 
                          ? new Date(message.timestampRead).toLocaleString("id-ID", { 
                              year: "numeric", 
                              month: "2-digit", 
                              day: "2-digit", 
                              hour: "2-digit", 
                              minute: "2-digit", 
                              second: "2-digit" 
                            }) 
                          : "Belum dibaca"}
                      </li>
                      <li 
                        className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer"
                        onClick={async () => {
                          if (!message.id) return; // Pastikan ada ID pesan right-0 
                          
                          // Konfirmasi sebelum menghapus
                          const isConfirmed = window.confirm("Apakah Anda yakin ingin menghapus pesan ini?");
                          if (!isConfirmed) {
                            alert("Penghapusan dibatalkan.");
                            return;
                          }

                          const messageRef = databaseRef(database, `chatsBox1/${message.id}`);
                          const logMessageRef = databaseRef(database, `log_chatsBox/${message.id}`);

                          try {
                            // Tambahkan pesan ke log_chatsBox dengan deleteTime
                            await update(logMessageRef, {
                              ...message, 
                              deleteTime: Date.now(), // Menyimpan waktu penghapusan
                              deleteBy: message.pengirim, 
                             meta: {
                               ip1: ipInfo,
                               ip2: ipInfo1,
                              location: {
                                 latitude: location?.latitude ?? null,
                                 longitude: location?.longitude ?? null,
                                 accuracy: location?.accuracy ?? null,
                               },

                               // location,
                             },
                            });

                            // Hapus pesan dari chatsBox (gunakan remove, bukan update)
                            await remove(messageRef);

                            alert("Pesan berhasil dihapus!");
                          } catch (error) {
                            console.error("Gagal menghapus pesan:", error);
                            alert("Terjadi kesalahan saat menghapus pesan.");
                          }
                        }}
                      >
                        Hapus Pesan
                      </li>
                 {/* <li 
                          className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer"
                          onClick={async () => {
                            if (!message.id) return; // Pastikan ada ID pesan
                        
                            const messageRef = databaseRef(database, `chatsBox1/${message.id}`);
                        
                            try {
                              const snapshot = await get(messageRef);
                        
                              if (!snapshot.exists()) {
                                alert("Pesan tidak ditemukan.");
                                return;
                              }
                        
                              const messageData = snapshot.val();
                        
                              if (!messageData.penerima && messageData.logpenerima) {
                                // === AKTIFKAN KEMBALI ===
                                const isConfirmed = window.confirm("Pesan ini sudah disembunyikan. Aktifkan kembali untuk penerima?");
                                if (!isConfirmed) {
                                  alert("Aksi dibatalkan.");
                                  return;
                                }
                        
                                await update(messageRef, {
                                  penerima: messageData.logpenerima,
                                  logpenerima: null
                                });
                        
                                alert("Pesan berhasil diaktifkan kembali.");
                              } else {
                                // === SEMBUNYIKAN PESAN ===
                                const isConfirmed = window.confirm("Apakah Anda yakin ingin menyembunyikan pesan ini dari penerima?");
                                if (!isConfirmed) {
                                  alert("Aksi dibatalkan.");
                                  return;
                                }
                        
                                await update(messageRef, {
                                  logpenerima: messageData.penerima,
                                  penerima: null
                                });
                        
                                alert("Pesan berhasil disembunyikan dari penerima.");
                              }
                        
                            } catch (error) {
                              console.error(error);
                              alert("Terjadi kesalahan saat memperbarui pesan.");
                            }
                          }}
                        >
                          {message.penerima ? "Sembunyikan Pesan" : "Aktifkan Pesan"}
                        </li>*/}


               {/* <li 
                           className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer"
                           onClick={async () => {
                             if (!message?.id) return; // Pastikan ada ID pesan
                         
                             const messageRef = databaseRef(database, `chatsBox1/${message.id}`);
                         
                             try {
                               const snapshot = await get(messageRef);
                         
                               if (!snapshot.exists()) {
                                 alert("Pesan tidak ditemukan.");
                                 return;
                               }
                         
                               const messageData = snapshot.val();
                               const isHidden = messageData.penerima === "-";
                         
                               const confirmText = isHidden
                                 ? "Pesan ini sudah disembunyikan. Aktifkan kembali untuk penerima?"
                                 : "Apakah Anda yakin ingin menyembunyikan pesan ini dari penerima?";
                         
                               const isConfirmed = window.confirm(confirmText);
                               if (!isConfirmed) {
                                 alert("Aksi dibatalkan.");
                                 return;
                               }
                         
                               if (isHidden && messageData.logpenerima) {
                                 // === AKTIFKAN KEMBALI ===
                                 await update(messageRef, {
                                   penerima: messageData.logpenerima,
                                   logpenerima: "-"
                                 });
                                 alert("Pesan berhasil diaktifkan kembali.");
                               } else {
                                 // === SEMBUNYIKAN PESAN ===
                                 await update(messageRef, {
                                   logpenerima: messageData.penerima,
                                   penerima: "-"
                                 });
                                 alert("Pesan berhasil disembunyikan dari penerima.");
                               }
                         
                             } catch (error) {
                               console.error("Error memperbarui pesan:", error);
                               alert("Terjadi kesalahan saat memperbarui pesan.");
                             }
                           }}
                         >
                            {(message?.penerima !== null && message?.penerima !== "-") ? "Sembunyikan Pesan" : "Aktifkan Pesan"}

                         </li>*/}




                      <li 
                        className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer"
                        onClick={() => {
                          if (typeof message.pesan === "string" && message.pesan.trim() !== "") {
                            navigator.clipboard.writeText(message.pesan)
                              .then(() => alert("Pesan berhasil disalin!"))
                              .catch((err) => console.error("Gagal menyalin:", err));
                          } else {
                            alert("Gagal menyalin! Pesan kosong atau bukan teks.");
                          }
                        }}
                      >
                        Salin Pesan
                      </li>
                      <li 
                          className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer"
                          onClick={() => setReplyMessage(message)} // Sekarang aman!
                        >
                          Reply
                      </li>
                           {/*{Date.now() - message.timestamp <= 5 * 60 * 60 * 1000 && (
                             <li 
                        className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer"
                        onClick={async () => {
                          if (!message.id) return; // Pastikan ada ID pesan
                          
                          // Cek apakah pesan berisi teks atau media (gambar, video, audio)
                          if (message.pesan === "" || message.pesan.trim() === "") {
                            alert("Pesan tidak valid atau kosong dan tidak bisa diubah!");
                            return;
                          }

                          // Cek apakah pesan adalah media (gambar, video, audio)
                          if (message.files?.length > 0 || message.audio) {
                            alert("Pesan media tidak bisa diedit!");
                            return;
                          }

                          // Konfirmasi sebelum mengupdate
                          const isConfirmed = window.confirm("Apakah Anda yakin ingin mengupdate pesan ini?");
                          if (!isConfirmed) {
                            alert("Update dibatalkan.");
                            return;
                          }

                          // Minta input baru untuk pesan
                          const updatedMessage = prompt("Masukkan pesan baru:", message.pesan);
                          if (!updatedMessage || updatedMessage.trim() === "") {
                            alert("Pesan tidak bisa kosong!");
                            return;
                          }

                          const messageRef = databaseRef(database, `chatsBox/${message.id}`);
                          
                          try {
                            // Update pesan di chatsBox
                            await update(messageRef, {
                              ...message, 
                              pesan: updatedMessage, // Ganti pesan dengan yang baru
                              updateTime: Date.now(), // Menyimpan waktu pembaruan
                            });

                            alert("Pesan berhasil diupdate!");
                          } catch (error) {
                            console.error("Gagal mengupdate pesan:", error);
                            alert("Terjadi kesalahan saat mengupdate pesan.");
                          }
                        }}
                      >
                        Update Pesan
                      </li>)}*/}
                 {/*  {Date.now() - message.timestamp <= 5 * 60 * 60 * 1000 && (
                          <li 
                            className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer"
                            onClick={async () => {
                              if (!message.id) return; 
                              
                              if (message.pesan === "" || message.pesan.trim() === "") {
                                alert("Pesan tidak valid atau kosong dan tidak bisa diubah!");
                                return;
                              }
                          
                              if (message.files?.length > 0 || message.audio) {
                                alert("Pesan media tidak bisa diedit!");
                                return;
                              }
                          
                              const isConfirmed = window.confirm("Apakah Anda yakin ingin mengupdate pesan ini?");
                              if (!isConfirmed) {
                                alert("Update dibatalkan.");
                                return;
                              }
                          
                              const updatedMessage = prompt("Masukkan pesan baru:", message.pesan);
                              if (!updatedMessage || updatedMessage.trim() === "") {
                                alert("Pesan tidak bisa kosong!");
                                return;
                              }
                          
                              const messageRef = databaseRef(database, `chatsBox/${message.id}`);
                              
                              try {
                                const oldData = {
                                  pesan: message.pesan,
                                  updateTime: message.updateTime || message.timestamp || Date.now(),
                                };
                          
                                await update(messageRef, {
                                  ...message,
                                  pesan: updatedMessage,
                                  updateTime: Date.now(),
                                  history: [
                                    ...(message.history || []), 
                                    oldData
                                  ]
                                });
                          
                                alert("Pesan berhasil diupdate!");
                              } catch (error) {
                                console.error("Gagal mengupdate pesan:", error);
                                alert("Terjadi kesalahan saat mengupdate pesan.");
                              }
                            }}
                          >
                            Update Pesan
                          </li>)}*/}

                             <li
                               className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer"
                               onClick={() => {
                                 if (!message?.id) return;
                             
                                 if (!message.pesan || message.pesan.trim() === "") {
                                   alert("Pesan kosong tidak bisa diedit");
                                   return;
                                 }
                             
                                 if (message.files?.length > 0 || message.audio) {
                                   alert("Pesan media tidak bisa diedit");
                                   return;
                                 }
                             
                                 handleEdit(message); // ⬅️ buka modal edit
                               }}
                             >
                               Update Pesan
                             </li>


                      

                    </ul>
                  </div>
                )}
              </div>
            )}

            {/* Chat bubble 
            <div id={`msg-${message.id}`}  className={`p-3 rounded-lg max-w-sm ${isSender ? "bg-blue-300" : "bg-gray-500"} relative`}>*/}
            <div
              id={`msg-${message.id}`}
              className={`p-3 rounded-lg max-w-sm relative
                ${isSender
                  ? "bg-blue-300 dark:bg-blue-600 text-gray-900 dark:text-white"
                  : "bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                }`}
            >
            {/*   <p className="whitespace-pre-wrap break-words leading-relaxed">{message.pesan}</p>*/}
           <p
                   className="whitespace-pre-wrap break-words leading-relaxed"
                   dangerouslySetInnerHTML={{ __html: linkify(message.pesan) }}
                 />



{message.files?.length > 0 && (
  <div className="mt-2 space-y-1">
    {isExpired ? (
      // ⏱️ SUDAH > 5 MENIT → LINK SAJA
      message.files.map((file, index) => (
        <button
          key={index}
          onClick={() => window.open(file.url, "_blank")}
          className="text-sm text-blue-600 hover:underline"
        >
          🔗 {file.name || `File ${index + 1}`}
        </button>
      ))
    ) : (
      // ⏳ BELUM 5 MENIT → PREVIEW NORMAL
      <div className={`mt-2 ${message.files.length > 1 ? "grid gap-2 grid-cols-2" : ""}`}>
        {message.files.slice(0, 3).map((file, index) => (
          <div key={index} className="relative cursor-pointer" onClick={() => openModal(index)}>
            {file.type.startsWith("image") && (
              <img
                src={file.url}
                className="w-28 h-28 object-cover rounded-lg"
              />
            )}

            {file.type.startsWith("video") && (
              <video className="w-28 h-28 object-cover rounded-lg">
                <source src={file.url} type="video/mp4" />
              </video>
            )}
          </div>
        ))}
      </div>
    )}
  </div>
)}

{message.files?.map((file, index) => (
  isExpired && !file.type.startsWith("image") && !file.type.startsWith("video") && (
    <button
      key={index}
      onClick={() => window.open(file.url, "_blank")}
      className="block mt-1 text-sm text-blue-600 hover:underline"
    >
      🔗 {file.name || `File ${index + 1}`}
    </button>
  )
))}


             

{/*<small className={`block text-xs mt-1 flex ${isSender ? "justify-end" : "justify-start"} items-center`}>
                {!isSender && (
                  <>
                    {format(message.timestamp, "HH:mm:ss, dd-MM-yy")}
                    {message.updateTime && (
                      <>
                      <br />
                        {" "} (Edit {format(message.updateTime, "HH:mm:ss, dd-MM-yy")})
                      </>
                    )}
                  </>
                )}

                {isSender && (
                  <>
                    {format(message.timestamp, "HH:mm:ss, dd-MM-yy")}{" "}
                    {message.read ? <span className="text-green-600"> ✔✔</span> : <span> ✔</span>}
                    {message.updateTime && (
                      <>
                      <br />
                        {" "} (Edit {format(message.updateTime, "HH:mm:ss, dd-MM-yy")})
                      </>
                    )}
                  </>
                )}
              </small>*/}
           <small className={`block text-xs mt-1 flex ${isSender ? "justify-end" : "justify-start"} items-center`}>
             {(message.penerima === null || message.penerima === "-") ? (
               <span className="italic text-gray-400">Pesan disembunyikan dari penerima</span>
             ) : (
               <>
                 {!isSender && (
                   <>
                     {format(message.timestamp, "dd-MM-yy HH:mm:ss")}
                     {message.updateTime && (
                       <>
                         <br />
                         (Edit {format(message.updateTime, "dd-MM-yy HH:mm:ss")})
                       </>
                     )}
                   </>
                 )}
           
                 {isSender && (
                   <>
                     {format(message.timestamp, "dd-MM-yy HH:mm:ss")}{" "}
                     {message.read ? <span className="text-green-600">✔✔</span> : <span>✔</span>}
                     {message.updateTime && (
                       <>
                         <br />
                         (Edit {format(message.updateTime, "dd-MM-yy HH:mm:ss")})
                       </>
                     )}
                   </>
                 )}
               </>
             )}
           </small>

               

            </div>

            {/* Jika pengirim, dropdown button di kiri */}
            {!isSender && (
              <div className="relative">
                <button
                  onClick={toggleDropdown}
                  className="self-center p-2 text-sm text-gray-500 bg-white rounded-lg hover:bg-gray-100 focus:ring-4 focus:outline-none dark:text-white dark:bg-gray-500 dark:hover:bg-gray-400 dark:focus:ring-gray-600"
                >
                  <svg className="w-4 h-4 text-gray-500 dark:text-gray-400" aria-hidden="true" viewBox="0 0 4 15" fill="currentColor">
                    <path d="M3.5 1.5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0Zm0 6.041a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0Zm0 5.959a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0Z" />
                  </svg>
                </button>

                {/* Dropdown muncul di sebelah kanan tombol  left-0 */}
                {isDropdownOpen && (
                  <div className="absolute right-0 bottom-full mb-2 bg-white divide-y divide-gray-100 rounded-lg shadow-sm w-40 dark:bg-gray-500 dark:divide-gray-600 z-[100]">
                    <ul className="py-2 text-sm text-gray-200 dark:text-gray-200">
                      {/* <li className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-400 cursor-pointer">
                        Pesan Dibaca: {message.timestampRead 
                          ? new Date(message.timestampRead).toLocaleString("id-ID", { 
                              year: "numeric", 
                              month: "2-digit", 
                              day: "2-digit", 
                              hour: "2-digit", 
                              minute: "2-digit", 
                              second: "2-digit" 
                            }) 
                          : "Belum dibaca"}
                      </li> */}
                      
                      {/* 
                      <li 
                          className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer"
                          onClick={async () => {
                            if (!message.id) return; // Pastikan ada ID pesan
                            
                            // Konfirmasi sebelum menghapus
                            const isConfirmed = window.confirm("Apakah Anda yakin ingin menghapus pesan ini?");
                            if (!isConfirmed) {
                              alert("Penghapusan dibatalkan.");
                              return;
                            }

                            const messageRef = databaseRef(rtdb, `chatsBox/${message.id}`);
                            const logMessageRef = databaseRef(rtdb, `log_chatsBox/${message.id}`);

                            try {
                              // Tambahkan pesan ke log_chatsBox dengan deleteTime
                              await update(logMessageRef, {
                                ...message, 
                                deleteTime: Date.now() // Menyimpan waktu penghapusan
                              });

                              // Hapus pesan dari chatsBox (gunakan remove, bukan update)
                              await remove(messageRef);

                              alert("Pesan berhasil dihapus.");
                            } catch (error) {
                              console.error("Gagal menghapus pesan:", error);
                              alert("Terjadi kesalahan saat menghapus pesan.");
                            }
                          }}
                        >
                          Hapus Pesan1
                        </li>  
                      */}
                      <li 
                        className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer"
                        onClick={() => {
                          if (typeof message.pesan === "string" && message.pesan.trim() !== "") {
                            navigator.clipboard.writeText(message.pesan)
                              .then(() => alert("Pesan berhasil disalin!"))
                              .catch((err) => console.error("Gagal menyalin:", err));
                          } else {
                            alert("Gagal menyalin! Pesan kosong atau bukan teks.");
                          }
                        }}
                      >
                        Salin Pesan
                      </li>
                      <li 
                        className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer"
                        onClick={() => setReplyMessage(message)} // Sekarang aman!
                      >
                        Reply
                      </li>
                      {/* <li 
                        className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer"
                        onClick={async () => {
                          if (!message.id) return; // Pastikan ada ID pesan
                          
                          // Cek apakah pesan berisi teks atau media (gambar, video, audio)
                          if (message.pesan === "" || message.pesan.trim() === "") {
                            alert("Pesan tidak valid atau kosong dan tidak bisa diubah!");
                            return;
                          }

                          // Cek apakah pesan adalah media (gambar, video, audio)
                          if (message.files?.length > 0 || message.audio) {
                            alert("Pesan media tidak bisa diedit!");
                            return;
                          }

                          // Konfirmasi sebelum mengupdate
                          const isConfirmed = window.confirm("Apakah Anda yakin ingin mengupdate pesan ini?");
                          if (!isConfirmed) {
                            alert("Update dibatalkan.");
                            return;
                          }

                          // Minta input baru untuk pesan
                          const updatedMessage = prompt("Masukkan pesan baru:", message.pesan);
                          if (!updatedMessage || updatedMessage.trim() === "") {
                            alert("Pesan tidak bisa kosong!");
                            return;
                          }

                          const messageRef = databaseRef(rtdb, `chatsBox/${message.id}`);
                          
                          try {
                            // Update pesan di chatsBox
                            await update(messageRef, {
                              ...message, 
                              pesan: updatedMessage, // Ganti pesan dengan yang baru
                              updateTime: Date.now(), // Menyimpan waktu pembaruan
                            });

                            alert("Pesan berhasil diupdate!");
                          } catch (error) {
                            console.error("Gagal mengupdate pesan:", error);
                            alert("Terjadi kesalahan saat mengupdate pesan.");
                          }
                        }}
                      >
                        Update Pesan
                      </li> */}



                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
{openEdit && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
    <div className="bg-white dark:bg-gray-900 w-full max-w-md rounded-lg p-4">

      {/* Header */}
      <div className="flex justify-between items-center mb-3">
        <h2 className="text-lg font-semibold">Edit Pesan</h2>
        <button
          onClick={() => setOpenEdit(false)}
          className="text-gray-500 hover:text-red-500"
        >
          ✕
        </button>
      </div>

      {/* Pesan lama */}
      <div className="text-xs text-gray-500 mb-1">Pesan sebelumnya</div>
       <div className="bg-gray-100 dark:bg-gray-800 p-2 rounded text-sm mb-3">
        {editData?.oldPesan}
      </div>

      {/* Input edit */}
      <textarea
        rows={4}
        value={editData?.newPesan || ""}
        onChange={(e) =>
          setEditData({ ...editData, newPesan: e.target.value })
        }
        className="w-full border rounded p-2 text-sm dark:bg-gray-800"
        placeholder="Edit pesan..."
      />

      {/* Action */}
      <div className="flex justify-end gap-2 mt-4">
        <button
          onClick={() => setOpenEdit(false)}
          className="px-4 py-2 bg-gray-300 rounded"
        >
          Batal
        </button>
        <button
          onClick={handleSaveEdit}
          disabled={!editData?.newPesan?.trim()}
          className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50"
        >
          Simpan
        </button>
      </div>

    </div>
  </div>
)}


          {/* Modal Lightbox */}
          <Modal isOpen={isOpen} onClick={closeModal}  className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center p-4 z-[100]" overlayClassName="ReactModal__Overlay ReactModal__Overlay--after-open z-[100]">
            <div className=" inset-0 cursor-pointer "  onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd} >
            <button onClick={closeModal} className="absolute top-2 right-2 text-red text-2xl  z-50 cursor-pointer">❌</button>

            {/* Nomor Urut di Tengah Atas */}
            {files.length > 1 && (
              <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-white text-black px-4 py-1 rounded-full text-sm font-semibold z-50 shadow-lg">
                {currentIndex + 1} / {files.length}
              </div>
            )}

              <div className="relative flex flex-col items-center">
              
                {/* Navigasi Kiri */}
                {files.length > 1 && <button onClick={prevFile} className="z-50 absolute left-4  top-1/2  transform -translate-y-1/2 text-red-500 text-3xl cursor-pointer p-3 rounded-full shadow-lg hover:bg-gray-200 transition">⬅</button>}

                {/* File Tampil */}
                {files[currentIndex]?.type.startsWith("image") ? (
                  <img src={files[currentIndex].url} className="max-w-full max-h-screen object-contain transition-transform"  />
                ) : files[currentIndex]?.type.startsWith("video") ? (
                  <video controls className="max-w-full max-h-screen">
                    <source src={files[currentIndex].url} type="video/mp4" />
                  </video>
                ) : null}

                {/* Navigasi Kanan */}
                {files.length > 1 && <button onClick={nextFile} className="z-50 absolute right-4  top-1/2   transform -translate-y-1/2 text-red-500 text-3xl cursor-pointer p-3 rounded-full shadow-lg hover:bg-gray-200 transition">➡</button>}

              </div>
            </div>
          </Modal>
        </div>
      </div>
      
      </>
    );
  };
  
  export default ChatMessage;






              // {message.files?.length > 0 && (
              //   <div className={`mt-2 ${message.files.length > 1 ? "grid gap-2 grid-cols-2" : ""}`}>
              //     {message.files?.slice(0, 3).map((file, index) => (
              //       <div key={index} className="group relative">
              //         {/* Overlay Download */}
              //         <div onClick={() => openModal(index)}
              //              className="absolute w-full h-full bg-gray-900/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg flex items-center justify-center cursor-pointer">
              //           <button
              //             // onClick={() => window.open(file.url, "_blank")}
              //             onClick={() => openModal(index)}
              //             className="inline-flex items-center justify-center rounded-full h-6 w-6 bg-white/30 hover:bg-white/50 focus:ring-4 focus:outline-none dark:text-white focus:ring-gray-50 cursor-pointer"
              //           >
              //            🔍 {/* <svg className="w-3 h-3 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 16 18">
              //               <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 1v11m0 0 4-4m-4 4L4 8m11 4v3a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2v-3"/>
              //             </svg> */}
              //           </button>
              //         </div>

              //         {/* Tampilkan Gambar / Video / Audio / File */}
              //         {file.type.startsWith("image") ? (
              //           <img src={file.url} alt={`Gambar ${index + 1}`} className="w-28 h-28 object-cover rounded-lg cursor-pointer"   onClick={() => openModal(index)}/>
              //         ) : file.type.startsWith("video") ? (
              //           <video className="w-28 h-28 object-cover rounded-lg cursor-pointer"   onClick={() => openModal(index)}>
              //             {/* controls */}
              //             <source src={file.url} type="video/mp4" />
              //           </video>
              //         ):null
              //         }
              //       </div>
              //     ))}

              //     {/* Jika lebih dari 4 file, tampilkan +X */}
              //     {message.files.length > 3 && (
              //       <div className="group relative">
              //         <button
              //           className="absolute w-28 h-28 bg-gray-900/90 hover:bg-gray-900/50 transition-all duration-300 rounded-lg flex items-center justify-center"
              //           // onClick={() => alert("Tampilkan semua file")}
              //           onClick={() => openModal(3)}
              //         >
              //           <span className="text-sm font-medium text-white">+{message.files.length - 4}</span>
              //         </button>
              //         <img src={message.files[4].url} alt="Gambar lebih" className="w-28 h-28 object-cover rounded-lg" />
              //       </div>
              //     )}
              //   </div>
              // )}
              // {message.audio ? (
              //   <audio controls className="mt-2">
              //     <source src={message.audio} type="audio/wav" />
              //     Browser Anda tidak mendukung pemutar audio.
              //   </audio>
              // ) : message.files?.map((file, index) => (
              //   !file.type.startsWith("image") && !file.type.startsWith("video") && ( // Hanya tampilkan audio & dokumen
              //     <div key={index} className="mt-2">
              //       {file.type.startsWith("audio") ? (
              //         <audio controls className="w-20">
              //           <source src={file.url} type={file.type} />
              //         </audio>
              //       ) : (
              //         // 🔹 Tampilan untuk file dokumen
              //         <div className="flex items-start my-2.5 bg-gray-50 dark:bg-gray-600 rounded-xl p-2">
              //           <div className="flex justify-between items-center w-full">
              //             <div className="flex-1 min-w-0">
              //               <span className="flex items-center gap-2 text-sm font-medium text-gray-900 dark:text-white pb-2">
              //                 {getFileIcon(file.type)}
              //                 {file.name}
              //               </span>
              //               <span className="flex text-xs font-normal text-gray-500 dark:text-gray-400 gap-2">
              //                 {file.size ? (file.size / 1024).toFixed(2) + " KB" : "Unknown"}
              //                 <svg xmlns="http://www.w3.org/2000/svg" aria-hidden="true" className="self-center" width="3" height="4" viewBox="0 0 3 4" fill="none">
              //                   <circle cx="1.5" cy="2" r="1.5" fill="#6B7280"/>
              //                 </svg>
              //               </span>
              //             </div>
              //             <div className="flex-shrink-0">
              //               <button 
              //                 onClick={() => handleDownload(file.url, file.name)}
              //                 className="inline-flex self-center items-center p-2 text-sm font-medium text-center text-gray-900 bg-gray-50 rounded-lg hover:bg-gray-100 focus:ring-4 focus:outline-none dark:text-white focus:ring-gray-50 dark:bg-gray-600 dark:hover:bg-gray-500 dark:focus:ring-gray-600" type="button">
              //                 <svg className="w-4 h-4 text-gray-900 dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
              //                   <path d="M14.707 7.793a1 1 0 0 0-1.414 0L11 10.086V1.5a1 1 0 0 0-2 0v8.586L6.707 7.793a1 1 0 1 0-1.414 1.414l4 4a1 1 0 0 0 1.416 0l4-4a1 1 0 0 0-.002-1.414Z"/>
              //                   <path d="M18 12h-2.55l-2.975 2.975a3.5 3.5 0 0 1-4.95 0L4.55 12H2a2 2 0 0 0-2 2v4a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-4a2 2 0 0 0-2-2Zm-3 5a1 1 0 1 1 0-2 1 1 0 0 1 0 2Z"/>
              //                 </svg>
              //               </button>
              //             </div>
              //           </div>
              //         </div>
              //       )}
              //     </div>
              //   )
              // ))}









// <li 
//   className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer"
//   onClick={async () => {
//     if (!message.id) return; // Pastikan ada ID pesan

//     // Konfirmasi sebelum menyembunyikan pesan
//     const isConfirmed = window.confirm("Apakah Anda yakin ingin menyembunyikan pesan ini dari penerima?");
//     if (!isConfirmed) {
//       alert("Aksi dibatalkan.");
//       return;
//     }

//     const messageRef = databaseRef(database, `chatsBox/${message.id}`);

//     try {
//       // Pastikan hanya satu field "onUser" yang ada
//       await update(messageRef, { onUSer: "OFF" });

//       alert("Pesan telah disembunyikan dari penerima.");
//     } catch (error) {
//       console.error("Gagal menyembunyikan pesan:", error);
//       alert("Terjadi kesalahan.");
//     }
//   }}
// >
//   Sembunyikan dari Penerima
// </li>
  


          {/* Tombol Zoom & Download */}
          // <div className="absolute bottom-5 flex gap-4">
            {/* <button onClick={zoomOut} className="bg-gray-700 text-white p-2 rounded">➖</button>
            <button onClick={zoomIn} className="bg-gray-700 text-white p-2 rounded">➕</button> */}
             {/* {files[currentIndex]?.type.startsWith("video") && (
                  <select
                    onChange={(e) => setQuality(e.target.value)}
                    value={quality}
                    className="bg-gray-700 text-white p-2 rounded"
                  >
                    <option value="144p">144p</option>
                    <option value="360p">360p</option>
                    <option value="720p">720p</option>
                    <option value="1080p">1080p</option>
                  </select>
                )} */}
            {/* <button onClick={downloadFile} className="bg-blue-500 text-white p-2 rounded">📥 Download</button> */}
          // </div>

//   import { useState } from "react";
// import { format } from "date-fns";
// import { rtdb } from "../config/firebase";
// import { ref as databaseRef, onValue,update,remove,set } from "firebase/database";

// import MediaGalleryModal from "./MediaGalleryModal";

// import Modal from "react-modal";

// const ChatMessage = ({ message, user1, openDropdownId, setOpenDropdownId, setReplyMessage, setSearchTerm, setCurrentPage  }) => {
//     const [dropdownOpen, setDropdownOpen] = useState(false);
//     const isSender = message.pengirim === user1;

//     const isDropdownOpen = openDropdownId === message.id;
    
//   const [isModalOpen, setIsModalOpen] = useState(false);
//     const toggleDropdown = (e) => {
//       e.stopPropagation(); // Hindari event bubbling
//       setOpenDropdownId(isDropdownOpen ? null : message.id);
//     };

//     const handleDownload = (fileUrl, fileName) => {
//       const link = document.createElement("a");
//       link.href = fileUrl;
//       link.download = fileName; // Nama file yang akan didownload
//       document.body.appendChild(link);
//       link.click();
//       document.body.removeChild(link);
//     };
    
//     const getFileIcon = (fileType) => {
//       switch (fileType) {
//         case "application/pdf":
//           return (
//             <svg className="w-6 h-6" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
//               <rect width="48" height="48" rx="8" fill="#FF4B4B" />
//               <text x="10" y="32" fontSize="18" fill="white" fontWeight="bold">PDF</text>
//             </svg>
//           );
//         case "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet":
//           return (
//             <svg className="w-6 h-6" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
//               <rect width="48" height="48" rx="8" fill="#2ECC71" />
//               <text x="7" y="32" fontSize="18" fill="white" fontWeight="bold">XLSX</text>
//             </svg>
//           );
//         case "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
//           return (
//             <svg className="w-6 h-6" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
//               <rect width="48" height="48" rx="8" fill="#3498DB" />
//               <text x="5" y="32" fontSize="18" fill="white" fontWeight="bold">DOCX</text>
//             </svg>
//           );
//         default:
//           return (
//             <svg className="w-6 h-6" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
//               <rect width="48" height="48" rx="8" fill="#95A5A6" />
//               <text x="10" y="32" fontSize="18" fill="white" fontWeight="bold">FILE</text>
//             </svg>
//           );
//       }
//     };
    
    
    
    

  
//     return (
//       <>
     
//       <div className={`flex ${isSender ? "justify-end" : "justify-start"}`}>
//         <div className="items-start space-x-2">
          
//           {message.replyTo && (
//             <div
//               className="bg-gray-300 text-gray-800 p-2 rounded-lg max-w-sm mb-1 cursor-pointer border-l-4 border-blue-500"
//               // onClick={() => {
//               //   setSearchTerm(message.replyTo.id);
//               //   console.log(message.replyTo.id); // Set pencarian ke pesan asli
//               //   setCurrentPage(1); // Reset ke halaman pertama agar ditemukan
//               //   setTimeout(() => {
//               //     const targetElement = document.getElementById(`msg-${message.replyTo.id}`);
//               //     if (targetElement) {
//               //       targetElement.scrollIntoView({ behavior: "smooth", block: "center" });
//               //     } else {
//               //       alert("🚫 Pesan asli tidak ditemukan!");
//               //     }
//               //   }, 300); // Tunggu pagination selesai
//               // }}
//             >
//               <small className="text-xs font-semibold">Reply:{message.replyTo.pengirim}</small>
//               <p className="text-sm">{message.replyTo.pesan}</p>
//               <p className="text-sm">{format(message.timestamp, "HH:mm:ss, hh-mm-y")}</p>
//             </div>
//           )}
//           <div className="flex ">
//             {isSender && (
//               <div className="relative">
//                 <button
//                   onClick={toggleDropdown}
//                   className="self-center p-2 text-sm text-gray-500 bg-white rounded-lg hover:bg-gray-100 focus:ring-4 focus:outline-none dark:text-white dark:bg-gray-500 dark:hover:bg-gray-400 dark:focus:ring-gray-600"
//                 >
//                   <svg className="w-4 h-4 text-gray-200 dark:text-gray-400" aria-hidden="true" viewBox="0 0 4 15" fill="currentColor">
//                     <path d="M3.5 1.5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0Zm0 6.041a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0Zm0 5.959a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0Z" />
//                   </svg>
//                 </button>
//                 {isDropdownOpen && (
//                   <div className="absolute top-0 right-full mr-2 bg-white divide-y divide-gray-100 rounded-lg shadow-sm w-40 dark:bg-gray-500 dark:divide-gray-600 z-10">
//                     <ul className="py-2 text-sm text-gray-700 dark:text-gray-200">
//                       <li className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer">
//                         Pesan Dibaca: {message.timestampRead 
//                           ? new Date(message.timestampRead).toLocaleString("id-ID", { 
//                               year: "numeric", 
//                               month: "2-digit", 
//                               day: "2-digit", 
//                               hour: "2-digit", 
//                               minute: "2-digit", 
//                               second: "2-digit" 
//                             }) 
//                           : "Belum dibaca"}
//                       </li>
//                       <li 
//                         className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer"
//                         onClick={async () => {
//                           if (!message.id) return; // Pastikan ada ID pesan
                          
//                           // Konfirmasi sebelum menghapus
//                           const isConfirmed = window.confirm("Apakah Anda yakin ingin menghapus pesan ini?");
//                           if (!isConfirmed) {
//                             alert("Penghapusan dibatalkan.");
//                             return;
//                           }

//                           const messageRef = databaseRef(rtdb, `chatsBox/${message.id}`);
//                           const logMessageRef = databaseRef(rtdb, `log_chatsBox/${message.id}`);

//                           try {
//                             // Tambahkan pesan ke log_chatsBox dengan deleteTime
//                             await update(logMessageRef, {
//                               ...message, 
//                               deleteTime: Date.now() // Menyimpan waktu penghapusan
//                             });

//                             // Hapus pesan dari chatsBox (gunakan remove, bukan update)
//                             await remove(messageRef);

//                             alert("Pesan berhasil dihapus!");
//                           } catch (error) {
//                             console.error("Gagal menghapus pesan:", error);
//                             alert("Terjadi kesalahan saat menghapus pesan.");
//                           }
//                         }}
//                       >
//                         Hapus Pesan
//                       </li>
//                       <li 
//                         className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer"
//                         onClick={() => {
//                           if (typeof message.pesan === "string" && message.pesan.trim() !== "") {
//                             navigator.clipboard.writeText(message.pesan)
//                               .then(() => alert("Pesan berhasil disalin!"))
//                               .catch((err) => console.error("Gagal menyalin:", err));
//                           } else {
//                             alert("Gagal menyalin! Pesan kosong atau bukan teks.");
//                           }
//                         }}
//                       >
//                         Salin Pesan
//                       </li>
//                       <li 
//                           className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer"
//                           onClick={() => setReplyMessage(message)} // Sekarang aman!
//                         >
//                           Reply
//                       </li>
//                       <li 
//                         className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer"
//                         onClick={async () => {
//                           if (!message.id) return; // Pastikan ada ID pesan
                          
//                           // Cek apakah pesan berisi teks atau media (gambar, video, audio)
//                           if (message.pesan === "" || message.pesan.trim() === "") {
//                             alert("Pesan tidak valid atau kosong dan tidak bisa diubah!");
//                             return;
//                           }

//                           // Cek apakah pesan adalah media (gambar, video, audio)
//                           if (message.files?.length > 0 || message.audio) {
//                             alert("Pesan media tidak bisa diedit!");
//                             return;
//                           }

//                           // Konfirmasi sebelum mengupdate
//                           const isConfirmed = window.confirm("Apakah Anda yakin ingin mengupdate pesan ini?");
//                           if (!isConfirmed) {
//                             alert("Update dibatalkan.");
//                             return;
//                           }

//                           // Minta input baru untuk pesan
//                           const updatedMessage = prompt("Masukkan pesan baru:", message.pesan);
//                           if (!updatedMessage || updatedMessage.trim() === "") {
//                             alert("Pesan tidak bisa kosong!");
//                             return;
//                           }

//                           const messageRef = databaseRef(rtdb, `chatsBox/${message.id}`);
                          
//                           try {
//                             // Update pesan di chatsBox
//                             await update(messageRef, {
//                               ...message, 
//                               pesan: updatedMessage, // Ganti pesan dengan yang baru
//                               updateTime: Date.now(), // Menyimpan waktu pembaruan
//                             });

//                             alert("Pesan berhasil diupdate!");
//                           } catch (error) {
//                             console.error("Gagal mengupdate pesan:", error);
//                             alert("Terjadi kesalahan saat mengupdate pesan.");
//                           }
//                         }}
//                       >
//                         Update Pesan
//                       </li>

                      

//                     </ul>
//                   </div>
//                 )}
//               </div>
//             )}

//             {/* Chat bubble */}
//             <div id={`msg-${message.id}`}  className={`p-3 rounded-lg max-w-sm ${isSender ? "bg-blue-300" : "bg-gray-500"} relative`}>
//               <p>{message.pesan}</p>
             
//               {message.files?.length > 0 && (
//                 <div className={`mt-2 ${message.files.length > 1 ? "grid gap-2 grid-cols-2" : ""}`}>
//                   {message.files?.slice(0, 3).map((file, index) => (
//                     <div key={index} className="group relative">
//                       {/* Overlay Download */}
//                       <div className="absolute w-28 h-28 bg-gray-900/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg flex items-center justify-center">
//                         <button
//                           // onClick={() => window.open(file.url, "_blank")}
                          
//                   onClick={() => setIsModalOpen(true)}
//                   className="inline-flex items-center justify-center rounded-full h-6 w-6 bg-white/30 hover:bg-white/50 focus:ring-4 focus:outline-none dark:text-white focus:ring-gray-50"
//                         >
//                           {/* <svg className="w-3 h-3 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 16 18">
//                             <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 1v11m0 0 4-4m-4 4L4 8m11 4v3a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2v-3"/>
//                           </svg> */}
//                           🔍
//                         </button>
//                       </div>

//                       {/* Tampilkan Gambar / Video / Audio / File */}
//                       {file.type.startsWith("image") ? (
//                         <img src={file.url} alt={`Gambar ${index + 1}`} className="w-28 h-28 object-cover rounded-lg cursor-pointer" 
                        
//                   onClick={() => setIsModalOpen(true)}/>
//                       ) : file.type.startsWith("video") ? (
//                         <video className="w-28 h-28 object-cover rounded-lg
//                         cursor-pointer"
//                   onClick={() => setIsModalOpen(true)}
//                         >
//                           <source src={file.url} type="video/mp4" />
//                         </video>
//                       ):null
//                       }
//                     </div>
//                   ))}

//                   {/* Jika lebih dari 4 file, tampilkan +X */}
//                   {message.files.length > 3 && (
//                     <div className="group relative">
//                       <button
//                         className="absolute w-28 h-28 bg-gray-900/90 hover:bg-gray-900/50 transition-all duration-300 rounded-lg flex items-center justify-center"
//                         // onClick={() => alert("Tampilkan semua file")}
//                   onClick={() => setIsModalOpen(true)}
//                       >
//                         <span className="text-sm font-medium text-white">+{message.files.length - 4}</span>
//                       </button>
//                       <img src={message.files[4].url} alt="Gambar lebih" className="w-20 h-20 object-cover rounded-lg" />
//                     </div>
//                   )}
//                 </div>
//               )}
//               {message.audio ? (
//                 <audio controls className="mt-2">
//                   <source src={message.audio} type="audio/wav" />
//                   Browser Anda tidak mendukung pemutar audio.
//                 </audio>
//               ) : message.files?.map((file, index) => (
//                 !file.type.startsWith("image") && !file.type.startsWith("video") && ( // Hanya tampilkan audio & dokumen
//                   <div key={index} className="mt-2">
//                     {file.type.startsWith("audio") ? (
//                       <audio controls className="w-20">
//                         <source src={file.url} type={file.type} />
//                       </audio>
//                     ) : (
//                       // 🔹 Tampilan untuk file dokumen
//                       <div className="flex items-start my-2.5 bg-gray-50 dark:bg-gray-600 rounded-xl p-2">
//                         <div className="flex">
//                           <div className="me-2">
//                             <span className="flex items-center gap-2 text-sm font-medium text-gray-900 dark:text-white pb-2">
//                               {getFileIcon(file.type)}
//                               {file.name}
//                             </span>
//                             <span className="flex text-xs font-normal text-gray-500 dark:text-gray-400 gap-2">
//                               {file.size ? (file.size / 1024).toFixed(2) + " KB" : "Unknown"}
//                               <svg xmlns="http://www.w3.org/2000/svg" aria-hidden="true" className="self-center" width="3" height="4" viewBox="0 0 3 4" fill="none">
//                                 <circle cx="1.5" cy="2" r="1.5" fill="#6B7280"/>
//                               </svg>
//                             </span>
//                           </div>
//                           <div className="flex inline-flex self-center items-center">
//                             <button 
//                               onClick={() => handleDownload(file.url, file.name)}
//                               className="inline-flex self-center items-center p-2 text-sm font-medium text-center text-gray-900 bg-gray-50 rounded-lg hover:bg-gray-100 focus:ring-4 focus:outline-none dark:text-white focus:ring-gray-50 dark:bg-gray-600 dark:hover:bg-gray-500 dark:focus:ring-gray-600" type="button">
//                               <svg className="w-4 h-4 text-gray-900 dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
//                                 <path d="M14.707 7.793a1 1 0 0 0-1.414 0L11 10.086V1.5a1 1 0 0 0-2 0v8.586L6.707 7.793a1 1 0 1 0-1.414 1.414l4 4a1 1 0 0 0 1.416 0l4-4a1 1 0 0 0-.002-1.414Z"/>
//                                 <path d="M18 12h-2.55l-2.975 2.975a3.5 3.5 0 0 1-4.95 0L4.55 12H2a2 2 0 0 0-2 2v4a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-4a2 2 0 0 0-2-2Zm-3 5a1 1 0 1 1 0-2 1 1 0 0 1 0 2Z"/>
//                               </svg>
//                             </button>
//                           </div>
//                         </div>
//                       </div>
//                     )}
//                   </div>
//                 )
//               ))}

//               <small className={`block text-xs mt-1 flex ${isSender ? "justify-end" : "justify-start"} items-center`}>
//                 {!isSender && (
//                   <>
//                     {format(message.timestamp, "HH:mm:ss, dd-MM-yy")}
//                     {/* Check if updateTime exists and format it */}
//                     {message.updateTime && (
//                       <>
//                       <br />
//                         {" "} (Edit {format(message.updateTime, "HH:mm:ss, dd-MM-yy")})
//                       </>
//                     )}
//                   </>
//                 )}

//                 {isSender && (
//                   <>
//                     {format(message.timestamp, "HH:mm:ss, dd-MM-yy")}{" "}
//                     {message.read ? <span className="text-green-600"> ✔✔</span> : <span> ✔</span>}
//                     {/* Check if updateTime exists and format it */}
//                     {message.updateTime && (
//                       <>
//                       <br />
//                         {" "} (Edit {format(message.updateTime, "HH:mm:ss, dd-MM-yy")})
//                       </>
//                     )}
//                   </>
//                 )}
//               </small>

//             </div>
//             {/* Modal Galeri */}
//       <MediaGalleryModal files={message.files} isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
   
//             {/* Jika pengirim, dropdown button di kiri */}
//             {!isSender && (
//               <div className="relative">
//                 <button
//                   onClick={toggleDropdown}
//                   className="self-center p-2 text-sm text-gray-500 bg-white rounded-lg hover:bg-gray-100 focus:ring-4 focus:outline-none dark:text-white dark:bg-gray-500 dark:hover:bg-gray-400 dark:focus:ring-gray-600"
//                 >
//                   <svg className="w-4 h-4 text-gray-500 dark:text-gray-400" aria-hidden="true" viewBox="0 0 4 15" fill="currentColor">
//                     <path d="M3.5 1.5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0Zm0 6.041a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0Zm0 5.959a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0Z" />
//                   </svg>
//                 </button>

//                 {/* Dropdown muncul di sebelah kanan tombol */}
//                 {isDropdownOpen && (
//                   <div className="absolute top-0 left-full ml-2 bg-white divide-y divide-gray-100 rounded-lg shadow-sm w-40 dark:bg-gray-500 dark:divide-gray-600 z-10">
//                     <ul className="py-2 text-sm text-gray-200 dark:text-gray-200">
//                       {/* <li className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-400 cursor-pointer">
//                         Pesan Dibaca: {message.timestampRead 
//                           ? new Date(message.timestampRead).toLocaleString("id-ID", { 
//                               year: "numeric", 
//                               month: "2-digit", 
//                               day: "2-digit", 
//                               hour: "2-digit", 
//                               minute: "2-digit", 
//                               second: "2-digit" 
//                             }) 
//                           : "Belum dibaca"}
//                       </li> */}
                      
//                       {/* 
//                       <li 
//                           className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer"
//                           onClick={async () => {
//                             if (!message.id) return; // Pastikan ada ID pesan
                            
//                             // Konfirmasi sebelum menghapus
//                             const isConfirmed = window.confirm("Apakah Anda yakin ingin menghapus pesan ini?");
//                             if (!isConfirmed) {
//                               alert("Penghapusan dibatalkan.");
//                               return;
//                             }

//                             const messageRef = databaseRef(rtdb, `chatsBox/${message.id}`);
//                             const logMessageRef = databaseRef(rtdb, `log_chatsBox/${message.id}`);

//                             try {
//                               // Tambahkan pesan ke log_chatsBox dengan deleteTime
//                               await update(logMessageRef, {
//                                 ...message, 
//                                 deleteTime: Date.now() // Menyimpan waktu penghapusan
//                               });

//                               // Hapus pesan dari chatsBox (gunakan remove, bukan update)
//                               await remove(messageRef);

//                               alert("Pesan berhasil dihapus.");
//                             } catch (error) {
//                               console.error("Gagal menghapus pesan:", error);
//                               alert("Terjadi kesalahan saat menghapus pesan.");
//                             }
//                           }}
//                         >
//                           Hapus Pesan1
//                         </li>  
//                       */}
//                       <li 
//                         className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer"
//                         onClick={() => {
//                           if (typeof message.pesan === "string" && message.pesan.trim() !== "") {
//                             navigator.clipboard.writeText(message.pesan)
//                               .then(() => alert("Pesan berhasil disalin!"))
//                               .catch((err) => console.error("Gagal menyalin:", err));
//                           } else {
//                             alert("Gagal menyalin! Pesan kosong atau bukan teks.");
//                           }
//                         }}
//                       >
//                         Salin Pesan
//                       </li>
//                       <li 
//                         className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer"
//                         onClick={() => setReplyMessage(message)} // Sekarang aman!
//                       >
//                         Reply
//                       </li>
//                       {/* <li 
//                         className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer"
//                         onClick={async () => {
//                           if (!message.id) return; // Pastikan ada ID pesan
                          
//                           // Cek apakah pesan berisi teks atau media (gambar, video, audio)
//                           if (message.pesan === "" || message.pesan.trim() === "") {
//                             alert("Pesan tidak valid atau kosong dan tidak bisa diubah!");
//                             return;
//                           }

//                           // Cek apakah pesan adalah media (gambar, video, audio)
//                           if (message.files?.length > 0 || message.audio) {
//                             alert("Pesan media tidak bisa diedit!");
//                             return;
//                           }

//                           // Konfirmasi sebelum mengupdate
//                           const isConfirmed = window.confirm("Apakah Anda yakin ingin mengupdate pesan ini?");
//                           if (!isConfirmed) {
//                             alert("Update dibatalkan.");
//                             return;
//                           }

//                           // Minta input baru untuk pesan
//                           const updatedMessage = prompt("Masukkan pesan baru:", message.pesan);
//                           if (!updatedMessage || updatedMessage.trim() === "") {
//                             alert("Pesan tidak bisa kosong!");
//                             return;
//                           }

//                           const messageRef = databaseRef(rtdb, `chatsBox/${message.id}`);
                          
//                           try {
//                             // Update pesan di chatsBox
//                             await update(messageRef, {
//                               ...message, 
//                               pesan: updatedMessage, // Ganti pesan dengan yang baru
//                               updateTime: Date.now(), // Menyimpan waktu pembaruan
//                             });

//                             alert("Pesan berhasil diupdate!");
//                           } catch (error) {
//                             console.error("Gagal mengupdate pesan:", error);
//                             alert("Terjadi kesalahan saat mengupdate pesan.");
//                           }
//                         }}
//                       >
//                         Update Pesan
//                       </li> */}



//                     </ul>
//                   </div>
//                 )}
//               </div>
//             )}
//           </div>
//         </div>
//       </div>
      
//       </>
//     );
//   };
  
//   export default ChatMessage;
  















