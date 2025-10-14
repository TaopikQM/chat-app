import { useState, useRef,useEffect } from "react";
import { database, storage } from "../config/firebase";
import { ref as databaseRef, push, update,set ,onValue} from "firebase/database";
import { ref as storageRef, uploadBytes, getDownloadURL } from "firebase/storage";
const ChatInput = ({ pengirim, penerima , replyMessage, setReplyMessage, isDark}) => {
  const [newMessage, setNewMessage] = useState("");
  const [files, setFiles] = useState([]);
  const [audioFile, setAudioFile] = useState(null);
  const [recording, setRecording] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [recordTime, setRecordTime] = useState(0);
  const [audioURL, setAudioURL] = useState(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const timerRef = useRef(null);
  const [audioPending, setAudioPending] = useState(false);

  const [location, setLocation] = useState(null);
  const [ipInfo, setIpInfo] = useState(null);
  const [gpsEnabled, setGpsEnabled] = useState(false);

  const inputRef = useRef(null);
   const [isTyping, setIsTyping] = useState(false);
   useEffect(() => {
    const typingRef = databaseRef(database, `typingStatus/${penerima}`);
    
    if (isTyping) {
      update(typingRef, { typing: true });
    } else {
      update(typingRef, { typing: false });
    }

    return () => update(typingRef, { typing: false }); // Hapus status mengetik saat unmount
  }, [isTyping, pengirim]);

  const handleTyping = (e) => {
    setNewMessage(e.target.value);
    setIsTyping(true);

    // Timer untuk menghapus status mengetik jika tidak ada input selama 3 detik
    setTimeout(() => setIsTyping(false), 3000);
  };

  const isSendDisabled = uploading || recording || audioPending || (!newMessage.trim() &&  files.length === 0);
// const isTextMessageEmpty = !newMessage.trim() && files.length === 0; 
// const isAudioMessageEmpty = !audioURL; // Harusnya false jika ada audio

// const isSendDisabled = uploading || recording || audioPending || (isTextMessageEmpty && isAudioMessageEmpty);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus(); // 🔹 Otomatis fokus ke textarea saat pertama kali render
    }
  }, []);

  //  const typingRef = databaseRef(database, `pengguna/${penerima}/isTyping`);

  // // Fungsi untuk handle mengetik
  // const handleTyping = (e) => {
  //   setNewMessage(e.target.value);

  //   if (e.target.value.length > 0) {
  //     setIsTyping(true);
  //     update(typingRef, { isTyping: true }); // Update Firebase
  //   } else {
  //     setIsTyping(false);
  //     update(typingRef, { isTyping: false });
  //   }
  // };

  // const handleSend = () => {
  //   if (newMessage.trim() === "") return;
  //   setNewMessage("");
  //   setIsTyping(false);
  //   update(typingRef, { isTyping: false }); // Reset mengetik setelah kirim pesan
  // };
  

  
  useEffect(() => {
    // getIPInfo();
    getLocation();
  }, []);

  // const getIPInfo = async () => {
  //   try {
  //     const response = await fetch("/api/ip");
  //     if (!response.ok) throw new Error("Gagal mengambil data IP");
  //     const data = await response.json();
  //     setIpInfo(data);
  //   } catch (error) {
  //     console.error("Error mengambil IP:", error);
  //   }
  // };
  //  useEffect(() => {
  //   const getIPInfo = async () => {
  //     try {
  //       const response = await fetch("https://web-api.nordvpn.com/v1/ips/info");
  //       if (!response.ok) throw new Error("Gagal mengambil data IP");
  //       const data = await response.json();
  //       setIpInfo(data);
  //     } catch (error) {
  //       console.error("Error mengambil IP:", error);
  //     }
  //   };

  //   getIPInfo();
  // }, []);

  // Ambil lokasi GPS pengguna
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
 
  // Mulai rekam suara (lanjut dari sebelumnya)
  const startRecording = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const mediaRecorder = new MediaRecorder(stream);

    mediaRecorder.ondataavailable = (event) => {
      audioChunksRef.current.push(event.data);
    };

    mediaRecorder.onstop = () => {
      const audioBlob = new Blob(audioChunksRef.current, { type: "audio/wav" });
      setAudioFile(audioBlob);
      setAudioURL(URL.createObjectURL(audioBlob)); // Buat preview

    setAudioPending(true);
    };

    mediaRecorderRef.current = mediaRecorder;
    mediaRecorder.start();
    setRecording(true);

    setAudioPending(true);

    // Lanjutkan waktu rekaman
    timerRef.current = setInterval(() => {
      setRecordTime((prev) => prev + 1);
    }, 1000);
  };

  // Berhenti rekam suara (tetap bisa preview & lanjut)
  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      clearInterval(timerRef.current);
    }
    setRecording(false);
  };

  const handleFileChange = (e) => {
    setFiles([...files, ...Array.from(e.target.files)]);
  };

  const removeFile = (index) => {
    setFiles(files.filter((_, i) => i !== index));
  };
  const uploadFileWithResume = (file, filePath, onProgress, onComplete, onError) => {
    const fileRef = storageRef(storage, filePath);
    const uploadTask = uploadBytesResumable(fileRef, file);
  
    uploadTask.on(
      "state_changed",
      (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        console.log(`Upload ${file.name} is ${progress}% done`);
        onProgress(progress);
      },
      (error) => {
        console.error(`Upload ${file.name} failed`, error);
        onError(error);
      },
      async () => {
        const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
        console.log(`File available at ${downloadURL}`);
        onComplete(downloadURL);
      }
    );
  
    return uploadTask;
  };

  

  // Kirim pesan ke Firebase
  const sendMessage = async () => {
    if (!newMessage.trim() && files.length === 0 && !audioFile) return;
    if (!gpsEnabled) {
      alert("Anda harus mengaktifkan GPS untuk mengirim pesan!");
      return;
    }
    setUploading(true);
    const newMessageRef = push(databaseRef(database, "chatsBox1"));
    let uploadedFiles = [];
   // 🔹 Tambahkan deklarasi uploadPromises sebelum digunakan
  //  let uploadPromises = [];
  //   // Upload semua file dengan resumable upload
  // // Upload file
  // for (let file of files) {
  //   const fileRef = storageRef(storage, `chatFiles/${newMessageRef.key}_${file.name}`);
  //   await uploadBytes(fileRef, file);
  //   const fileUrl = await getDownloadURL(fileRef);
  //   uploadedFiles.push({ url: fileUrl, type: file.type.split("/")[0], name: file.name });
  // }
    // Upload files (images, videos, etc.)

    // helper convert file to base64
    // helper convert file to base64
// const toBase64 = (file) => {
//   return new Promise((resolve, reject) => {
//     const reader = new FileReader();
//     reader.readAsDataURL(file);
//     reader.onload = () => resolve(reader.result);
//     reader.onerror = (error) => reject(error);
//   });
// };

// 🔹 Konversi semua file jadi base64 dulu
// const filesBase64 = await Promise.all(
//   files.map(async (file) => ({
//     name: file.name,
//     type: file.type,
//     data: await toBase64(file),
//   }))
// );

// // 🔹 Konversi audio (kalau ada)
// let audioBase64 = null;
// if (audioFile) {
//   audioBase64 = {
//     name: audioFile.name || "record.wav",
//     data: await toBase64(audioFile),
//   };
// }


    
//     const res = await fetch("/api/chat/upload", {
//   method: "POST",
//   headers: { "Content-Type": "application/json" },
//   body: JSON.stringify({
//     files: filesBase64,     // [{ name, type, data }]
//     audioFile: audioBase64, // { name, data }
//     messageKey: newMessageRef.key,
//   }),
// });

// const uploadResult = await res.json();
// if (uploadResult.status === "success") {
//   const { uploadedFiles, audio } = uploadResult.data;
//   console.log("📦 Uploaded files:", uploadedFiles);
// }

    
    
    
    for (let file of files) {
      const ext = file.name.split(".").pop();
      const fileRef = storageRef(storage, `chatFiles/${newMessageRef.key}_${file.name}`);
      await uploadBytes(fileRef, file);
      const fileUrl = await getDownloadURL(fileRef);
      uploadedFiles.push({
        url: fileUrl,
        type: file.type.split("/")[0], // "image", "video", "application"
        name: file.name,
      });
    }
    
    let uploadedAudio = null;

    if (audioFile) {
      const fileRef = storageRef(storage, `chatFiles/${newMessageRef.key}.wav`);
      await uploadBytes(fileRef, audioFile);
      const fileUrl = await getDownloadURL(fileRef);
      uploadedAudio = fileUrl;

      // Tambahkan audio ke dalam array files
      uploadedFiles.push({
        url: fileUrl,
        type: "audio",
        name: `${newMessageRef.key}.wav`,
      });
    }
    // Upload audio (jika ada)
  // let uploadedAudio = null;
  // if (audioFile) {
  //   const fileRef = storageRef(storage, `chatFiles/${newMessageRef.key}.wav`);
  //   await uploadBytes(fileRef, audioFile);
  //   uploadedAudio = await getDownloadURL(fileRef);
  // }

  // // Tunggu semua upload selesai
  // try {
  //   uploadedFiles = await Promise.all(uploadPromises);
  // } catch (error) {
  //   console.error("Upload gagal", error);
  //   setUploading(false);
  //   return;
  // }

    const messageData = {
      pengirim,
      penerima,
      pesan: newMessage,
      files: uploadedFiles,
      audio: uploadedAudio,
    //   files1: uploadedFiles,
    // audio1: audio,
      timestamp: Date.now(),
      read: false,
      status: "ACTIVE",
      onUSer: "ON",
      timestampRead: null,
      replyTo: replyMessage || null,
      ip: ipInfo?.ip || "Tidak diketahui",
      location: location || { latitude: 0, longitude: 0 },
    };

    await update(newMessageRef, messageData);
    setNewMessage("");
    setFiles([]);
    setAudioFile(null);
    setAudioURL(null);
    setRecordTime(0);
    setUploading(false);
    setReplyMessage(null);
    setAudioPending(false);
  };
//   console.log("uploading:", uploading);
// console.log("recording:", recording);
// console.log("audioURL:", audioURL);
// console.log("newMessage:", newMessage);
// console.log("files:", files);
// console.log("isSendDisabled:", isSendDisabled);


  return (
    <div className="bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white shadow-md sticky bottom-0 w-full">
      {files.length > 0 && (
        <div className="flex gap-2 flex-wrap mb-2">
          {files.map((file, index) => (
            <div key={index} className="relative border p-2 rounded-lg">
              {file.type.startsWith("image") ? (
                <img src={URL.createObjectURL(file)} alt="Preview" className="w-20 h-20 object-cover rounded-lg" />
              ) : file.type.startsWith("video") ? (
                <video className="w-20 h-20 object-cover rounded-lg" controls>
                  <source src={URL.createObjectURL(file)} type="video/mp4" />
                </video>
              ) : file.type.startsWith("audio") ? (
                <audio controls className="w-20">
                  <source src={URL.createObjectURL(file)} type={file.type} />
                </audio>
              ) : (
                <div className="w-20 h-20 flex items-center justify-center bg-gray-200 rounded-lg">
                  📄 {file.name}
                </div>
              )}
              <button
                className="absolute top-0 right-0 bg-red-500 text-white p-1 rounded-full text-xs"
                onClick={() => {
                  
                  if (!uploading) {
                    removeFile(index)
                  }}
                }
              >
                ❌
              </button>
            </div>
          ))}
        </div>
      )}
{ audioURL && (
         <div className="relative flex items-center gap-2">
          <audio controls src={audioURL} className="flex-1"></audio>
          <button
            className="absolute -top-2 -right-2 bg-red-500 text-white p-1 rounded-full text-xs"
            onClick={() => {
              if (!uploading) { // Hanya bisa diklik jika tidak sedang upload
                setAudioURL(null);
                setAudioFile(null);
              }
            }}
          >
            ❌
          </button>
        </div>
      ) }
       {replyMessage && (
        <div className="bg-gray-200 p-2 rounded mb-2">
          <p className="text-sm text-gray-700">Membalas: <strong>{replyMessage.pengirim} - {replyMessage.text}</strong></p>
          <p className="text-gray-600">{replyMessage.text}</p>
          <button 
            className="absolute top-1 right-2 text-gray-500 hover:text-gray-700"
            onClick={() => setReplyMessage(null)}
          >
           ❌
          </button>
        </div>
      )}
      
      <div className="flex-none gap-3 flex items-center p-4  sticky bottom-0 bg-white dark:bg-gray-800 text-gray-900 dark:text-white">
      
          {/* Jika sedang merekam, tampilkan timer border-t border-gray-300*/}
          <input type="file" multiple onChange={handleFileChange} disabled={uploading|| recording || audioPending} className="hidden" id="fileInput" />
             <label htmlFor="fileInput"  className={`cursor-pointer ${uploading || recording || audioPending ? "opacity-50 cursor-not-allowed" : ""}`}>
                <span className="material-icons">📎</span>
            </label>
            <button
              onClick={recording ? stopRecording : startRecording}
              className={`p-2 rounded-full ${recording ? "bg-red-500" : "bg-blue-500"}`}
              disabled={uploading}
            >
              {recording ? "⏸️" : "🎙️"}
            </button>
          {recording ? (
            <div className="flex items-center gap-2">
              <span className="text-red-400">{recordTime}s</span>
              {/* <button onClick={stopRecording} className="bg-red-500 p-2 rounded-lg">🛑 Stop</button> */}
            </div>
          ) : (
            /* Jika tidak sedang merekam, tampilkan input teks */
            // <input
            //   type="text"
            //   className="flex-1 p-2 rounded-lg border "
            //   placeholder="Ketik pesan..."
            //   value={newMessage}
            //   onChange={(e) => setNewMessage(e.target.value)}
            // />
            <textarea id="chat" rows="1" className="block p-2.5 w-full text-sm text-gray-900 bg-white rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-200 dark:border-gray-600 dark:placeholder-gray-900 dark:text-black dark:focus:ring-blue-500 dark:focus:border-blue-500" 
            placeholder="Ketik Pesan..."
            value={newMessage}
              // onChange={(e) => setNewMessage(e.target.value)}
                  ref={inputRef}
                    onChange={handleTyping}
              ></textarea>
            
          )}
          {!recording&& (
              <div className={`${isSendDisabled ? "opacity-50 cursor-not-allowed" : ""}`}>
              <button
                onClick={sendMessage}
                className={`text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-full text-sm p-2 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800 inline-flex items-center 
           `}
                // disabled={uploading || recording}
                disabled={isSendDisabled}
              >
                {uploading ? (
                  <>
                    <svg
                      aria-hidden="true"
                      role="status"
                      className="inline w-4 h-4 me-3 text-white animate-spin"
                      viewBox="0 0 100 101"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="#E5E7EB" />
                      <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentColor" />
                    </svg>
                  </>
                ) : (
                  <svg class="w-6 h-6 text-inherit" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
                    <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v13m0-13 4 4m-4-4-4 4"/>
                  </svg>
    
                )}
              </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatInput;
// import { useState, useRef } from "react"; 
              // "Kirim"
// import { rtdb, storage } from "../config/firebase";
// import { ref as databaseRef, push, update } from "firebase/database";
// import { ref as storageRef, uploadBytes, getDownloadURL } from "firebase/storage";

// const ChatInput = ({ pengirim, penerima }) => {
//   const [newMessage, setNewMessage] = useState("");
//   const [audioFile, setAudioFile] = useState(null);
//   const [audioURL, setAudioURL] = useState(null);
//   const [recording, setRecording] = useState(false);
//   const [uploading, setUploading] = useState(false);
//   const [recordTime, setRecordTime] = useState(0);

//   const mediaRecorderRef = useRef(null);
//   const audioChunksRef = useRef([]);
//   const timerRef = useRef(null);

//   // Mulai rekaman suara
//   const startRecording = async () => {
//     const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
//     const mediaRecorder = new MediaRecorder(stream);

//     mediaRecorder.ondataavailable = (event) => {
//       audioChunksRef.current.push(event.data);
//     };

//     mediaRecorder.onstop = async () => {
//       const audioBlob = new Blob(audioChunksRef.current, { type: "audio/wav" });
//       setAudioFile(audioBlob);
//       setAudioURL(URL.createObjectURL(audioBlob)); // Buat URL untuk preview
//       audioChunksRef.current = [];
//     };

//     mediaRecorderRef.current = mediaRecorder;
//     mediaRecorder.start();
//     setRecording(true);
//     setRecordTime(0);

//     // Jalankan timer untuk hitung waktu rekaman
//     timerRef.current = setInterval(() => {
//       setRecordTime((prev) => prev + 1);
//     }, 1000);
//   };

//   // Berhenti rekaman suara
//   const stopRecording = () => {
//     if (mediaRecorderRef.current) {
//       mediaRecorderRef.current.stop();
//       clearInterval(timerRef.current);
//     }
//     setRecording(false);
//   };

//   // Hapus rekaman sebelum dikirim
//   const deleteRecording = () => {
//     setAudioFile(null);
//     setAudioURL(null);
//   };

//   // Kirim pesan ke Firebase
//   const sendMessage = async () => {
//     if (!newMessage.trim() && !audioFile) return;

//     setUploading(true);
//     const newMessageRef = push(databaseRef(rtdb, "Chatv1"));
//     let uploadedAudio = null;

//     if (audioFile) {
//       const fileRef = storageRef(storage, `chatFiles/${newMessageRef.key}.wav`);
//       await uploadBytes(fileRef, audioFile);
//       uploadedAudio = await getDownloadURL(fileRef);
//     }

//     const messageData = {
//       pengirim,
//       penerima,
//       pesan: newMessage,
//       audio: uploadedAudio,
//       timestamp: Date.now(),
//       read: false,
//       timestampRead: null,
//     };

//     await update(newMessageRef, messageData);
//     setNewMessage("");
//     setAudioFile(null);
//     setAudioURL(null);
//     setUploading(false);
//   };

//   return (
//     <div className="p-4 bg-gray-800 text-white rounded-lg flex gap-2 items-center">
//       <input
//         type="text"
//         className="flex-1 p-2 rounded-lg bg-gray-700 border border-gray-600"
//         placeholder="Ketik pesan..."
//         value={newMessage}
//         onChange={(e) => setNewMessage(e.target.value)}
//       />
      
//       {recording ? (
//         <div className="flex items-center gap-2">
//           <span className="text-red-400">{recordTime}s</span>
//           <button onClick={stopRecording} className="bg-red-500 p-2 rounded-lg">🛑 Stop</button>
//         </div>
//       ) : (
//         <button onClick={startRecording} className="bg-blue-500 p-2 rounded-lg">🎙️ Rekam</button>
//       )}

//       {audioFile && (
//         <div className="flex items-center gap-2">
//           <audio controls src={audioURL} className="w-32"></audio>
//           <button onClick={deleteRecording} className="bg-gray-600 p-2 rounded-lg">🗑️ Hapus</button>
//         </div>
//       )}

//       <button
//         onClick={sendMessage}
//         className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800 inline-flex items-center"
//         disabled={uploading}
//       >
//         {uploading ? (
//           <>
//             <svg
//               aria-hidden="true"
//               role="status"
//               className="inline w-4 h-4 me-3 text-white animate-spin"
//               viewBox="0 0 100 101"
//               fill="none"
//               xmlns="http://www.w3.org/2000/svg"
//             >
//               <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="#E5E7EB" />
//               <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentColor" />
//             </svg>
//             Loading...
//           </>
//         ) : (
//           "Kirim"
//         )}
//       </button>
//     </div>
//   );
// };

// export default ChatInput;
// // import { useState, useRef, useEffect } from "react";
// // import { rtdb, storage } from "../config/firebase";
// // import { ref as databaseRef, push, update } from "firebase/database";
// // import { ref as storageRef, uploadBytes, getDownloadURL } from "firebase/storage";

// // const ChatInput = ({ pengirim, penerima }) => {
// //   const [newMessage, setNewMessage] = useState("");
// //   const [audioFile, setAudioFile] = useState(null);
// //   const [recording, setRecording] = useState(false);
// //   const [uploading, setUploading] = useState(false);
// //   const [recordTime, setRecordTime] = useState(0);

// //   const mediaRecorderRef = useRef(null);
// //   const audioChunksRef = useRef([]);
// //   const timerRef = useRef(null);

// //   // Mulai rekam suara
// //   const startRecording = async () => {
// //     const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
// //     const mediaRecorder = new MediaRecorder(stream);

// //     mediaRecorder.ondataavailable = (event) => {
// //       audioChunksRef.current.push(event.data);
// //     };

// //     mediaRecorder.onstop = async () => {
// //       const audioBlob = new Blob(audioChunksRef.current, { type: "audio/wav" });
// //       setAudioFile(audioBlob);
// //       audioChunksRef.current = [];
// //     };

// //     mediaRecorderRef.current = mediaRecorder;
// //     mediaRecorder.start();
// //     setRecording(true);
// //     setRecordTime(0);

// //     // Jalankan timer untuk hitung waktu rekaman
// //     timerRef.current = setInterval(() => {
// //       setRecordTime((prev) => prev + 1);
// //     }, 1000);
// //   };

// //   // Berhenti rekam suara
// //   const stopRecording = () => {
// //     if (mediaRecorderRef.current) {
// //       mediaRecorderRef.current.stop();
// //       clearInterval(timerRef.current);
// //     }
// //     setRecording(false);
// //   };

// //   // Kirim pesan ke Firebase
// //   const sendMessage = async () => {
// //     if (!newMessage.trim() && !audioFile) return;

// //     setUploading(true);
// //     const newMessageRef = push(databaseRef(rtdb, "Chatv1"));
// //     let uploadedAudio = null;

// //     if (audioFile) {
// //       const fileRef = storageRef(storage, `chatFiles/${newMessageRef.key}.wav`);
// //       await uploadBytes(fileRef, audioFile);
// //       uploadedAudio = await getDownloadURL(fileRef);
// //     }

// //     const messageData = {
// //       pengirim,
// //       penerima,
// //       pesan: newMessage,
// //       audio: uploadedAudio,
// //       timestamp: Date.now(),
// //       read: false,
// //       timestampRead: null,
// //     };

// //     await update(newMessageRef, messageData);
// //     setNewMessage("");
// //     setAudioFile(null);
// //     setUploading(false);
// //   };

// //   return (
// //     <div className="p-4 bg-gray-800 text-white rounded-lg flex gap-2 items-center">
// //       <input
// //         type="text"
// //         className="flex-1 p-2 rounded-lg bg-gray-700 border border-gray-600"
// //         placeholder="Ketik pesan..."
// //         value={newMessage}
// //         onChange={(e) => setNewMessage(e.target.value)}
// //       />
// //       {recording ? (
// //         <div className="flex items-center gap-2">
// //           <span className="text-red-400">{recordTime}s</span>
// //           <button onClick={stopRecording} className="bg-red-500 p-2 rounded-lg">🛑 Stop</button>
// //         </div>
// //       ) : (
// //         <button onClick={startRecording} className="bg-blue-500 p-2 rounded-lg">🎙️ Rekam</button>
// //       )}
// //       <button
// //         onClick={sendMessage}
// //         className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800 inline-flex items-center"
// //         disabled={uploading}
// //       >
// //         {uploading ? (
// //           <>
// //             <svg
// //               aria-hidden="true"
// //               role="status"
// //               className="inline w-4 h-4 me-3 text-white animate-spin"
// //               viewBox="0 0 100 101"
// //               fill="none"
// //               xmlns="http://www.w3.org/2000/svg"
// //             >
// //               <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="#E5E7EB" />
// //               <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentColor" />
// //             </svg>
// //             Loading...
// //           </>
// //         ) : (
// //           "Kirim"
// //         )}
// //       </button>
// //     </div>
// //   );
// // };

// // export default ChatInput;
// // // import { useState, useRef } from "react";
// // // import { rtdb, storage } from "../config/firebase";
// // // import { ref as databaseRef, push, update } from "firebase/database";
// // // import { ref as storageRef, uploadBytes, getDownloadURL } from "firebase/storage";

// // // const ChatInput = ({ pengirim, penerima }) => {
// // //   const [newMessage, setNewMessage] = useState("");
// // //   const [audioFile, setAudioFile] = useState(null);
// // //   const [recording, setRecording] = useState(false);
// // //   const mediaRecorderRef = useRef(null); // Gunakan useRef untuk menyimpan mediaRecorder
// // //   const audioChunksRef = useRef([]); // Gunakan useRef untuk menyimpan potongan audio

// // //   // Mulai rekam suara
// // //   const startRecording = async () => {
// // //     const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
// // //     const mediaRecorder = new MediaRecorder(stream);

// // //     mediaRecorder.ondataavailable = (event) => {
// // //       audioChunksRef.current.push(event.data);
// // //     };

// // //     mediaRecorder.onstop = async () => {
// // //       const audioBlob = new Blob(audioChunksRef.current, { type: "audio/wav" });
// // //       setAudioFile(audioBlob);
// // //       audioChunksRef.current = []; // Reset setelah selesai
// // //     };

// // //     mediaRecorderRef.current = mediaRecorder; // Simpan mediaRecorder di useRef
// // //     mediaRecorder.start();
// // //     setRecording(true);
// // //   };

// // //   // Berhenti rekam suara
// // //   const stopRecording = () => {
// // //     if (mediaRecorderRef.current) {
// // //       mediaRecorderRef.current.stop();
// // //       setRecording(false);
// // //     }
// // //   };

// // //   // Kirim pesan ke Firebase
// // //   const sendMessage = async () => {
// // //     if (!newMessage.trim() && !audioFile) return;

// // //     const newMessageRef = push(databaseRef(rtdb, "Chatv1"));
// // //     let uploadedAudio = null;

// // //     if (audioFile) {
// // //       const fileRef = storageRef(storage, `chatFiles/${newMessageRef.key}.wav`);
// // //       await uploadBytes(fileRef, audioFile);
// // //       uploadedAudio = await getDownloadURL(fileRef);
// // //     }

// // //     const messageData = {
// // //       pengirim,
// // //       penerima,
// // //       pesan: newMessage,
// // //       audio: uploadedAudio,
// // //       timestamp: Date.now(),
// // //       read: false,
// // //       timestampRead: null,
// // //     };

// // //     await update(newMessageRef, messageData);
// // //     setNewMessage("");
// // //     setAudioFile(null);
// // //   };

// // //   return (
// // //     <div className="p-4 bg-gray-800 text-white rounded-lg flex gap-2">
// // //       <input
// // //         type="text"
// // //         className="flex-1 p-2 rounded-lg bg-gray-700 border border-gray-600"
// // //         placeholder="Ketik pesan..."
// // //         value={newMessage}
// // //         onChange={(e) => setNewMessage(e.target.value)}
// // //       />
// // //       {recording ? (
// // //         <button onClick={stopRecording} className="bg-red-500 p-2 rounded-lg">🔴 Stop</button>
// // //       ) : (
// // //         <button onClick={startRecording} className="bg-blue-500 p-2 rounded-lg">🎙️ Rekam</button>
// // //       )}
// // //       <button onClick={sendMessage} className="bg-green-500 p-2 rounded-lg">📩 Kirim</button>
// // //     </div>
// // //   );
// // // };

// // // export default ChatInput;










