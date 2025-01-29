"use client";

import { useEffect, useState } from "react";
import { database, storage } from "../config/firebase";
import { ref as databaseRef, onValue, push, update } from "firebase/database";
import { ref as storageRef, uploadBytes, getDownloadURL } from "firebase/storage";
import { format } from "date-fns";

const ChatBox = ({ pengirim, penerima }) => {
  const [messages, setMessages] = useState([]);
   const [dropdownOpen, setDropdownOpen] = useState(null);
  const [replyMessage, setReplyMessage] = useState(null);
  const [newMessage, setNewMessage] = useState("");
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);

  const toggleDropdown = (messageId) => {
    setDropdownOpen(prevState => (prevState === messageId ? null : messageId));
  };

  const handleReply = (msg) => {
    setReplyMessage(msg);  // Set pesan yang akan di-reply
    setDropdownOpen(null);  // Menutup dropdown setelah memilih reply
  };

  const handleSendMessage = () => {
    sendMessage({
      pesan: newMessage,
      replyTo: replyMessage?.id,  // Menyimpan ID pesan yang di-reply
      originalMessage: replyMessage?.pesan,  // Menyimpan pesan asli yang di-reply
    });
    setNewMessage('');
    setReplyMessage(null);  // Reset setelah mengirim pesan
  };

  useEffect(() => {
    const messagesRef = databaseRef(database, "chatsBox");
    onValue(messagesRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const formattedData = Object.entries(data).map(([id, value]) => ({
          id,
          ...value,
          timestamp: value.timestamp ? new Date(value.timestamp) : null,
          timestampRead: value.timestampRead ? new Date(value.timestampRead) : null,
        }));

        setMessages(
          formattedData.filter(
            (msg) =>
              (msg.pengirim === pengirim && msg.penerima === penerima) ||
              (msg.pengirim === penerima && msg.penerima === pengirim)
          )
        );
      }
    });
  }, [pengirim, penerima]);

  const handleFileChange = (e) => {
    setFiles([...files, ...Array.from(e.target.files)]);
  };

  const removeFile = (index) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  const sendMessage = async () => {
    if (!newMessage.trim() && files.length === 0) return;

    setUploading(true);
    const newMessageRef = push(databaseRef(database, "chatsBox"));
    let uploadedFiles = [];

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

    const messageData = {
      // id: newMessageRef.key,
      pengirim,
      penerima,
      pesan: newMessage,
      files: uploadedFiles,
      timestamp: Date.now(),
      read: false,
      timestampRead: null,
    };

    await update(newMessageRef, messageData);
    setNewMessage("");
    setFiles([]);
    setUploading(false);
  };

  useEffect(() => {
    messages.forEach((msg) => {
      if (msg.penerima === pengirim && !msg.read) {
        update(databaseRef(database, `chatsBox/${msg.id}`), {
          read: true,
          timestampRead: Date.now(),
        });
      }
    });
  }, [messages, pengirim]);

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      {/* Header */}
      <div className="flex-none p-4 bg-white border-b border-gray-300">
        <h2 className="text-xl font-semibold text-center">Chat dengan {penerima}</h2>
      </div>

      {/* Tampilkan pesan */}
      <div className="flex-1 overflow-y-auto p-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`mb-3 p-3 rounded-lg max-w-xs ${
              msg.pengirim === pengirim ? "bg-blue-500 text-white ml-auto" : "bg-gray-200"
            }`}
          >
            {msg.files?.length > 0 &&
              msg.files.map((file, index) => (
                <div key={index} className="mb-2">
                  {file.type === "image" ? (
                    <img src={file.url} alt="Uploaded" className="w-full rounded-lg" />
                  ) : file.type === "video" ? (
                    <video controls className="w-full rounded-lg">
                      <source src={file.url} type="video/mp4" />
                    </video>
                  ) : (
                    <a href={file.url} target="_blank" rel="noopener noreferrer" className="text-blue-500 underline">
                      📄 {file.name}
                    </a>
                  )}
                </div>
              ))}
            <p>{msg.pesan}</p>
            <small className="block text-xs mt-1">
              {format(msg.timestamp, "HH:mm:ss")} • {msg.read ? (
                  <span className="text-blue-500">✔✔</span>
              ) : (
                  <span>✔</span>
              )}
            </small>
                    {/* Dropdown button */}
            <button
              onClick={() => toggleDropdown(msg.id)}
              className="inline-flex self-center items-center p-2 text-sm font-medium text-center text-gray-900 bg-white rounded-lg hover:bg-gray-100 focus:ring-4 focus:outline-none dark:text-white focus:ring-gray-50 dark:bg-gray-900 dark:hover:bg-gray-800 dark:focus:ring-gray-600"
              type="button"
            >
              <svg
                className="w-4 h-4 text-gray-500 dark:text-gray-400"
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                fill="currentColor"
                viewBox="0 0 4 15"
              >
                <path d="M3.5 1.5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0Zm0 6.041a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0Zm0 5.959a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0Z"/>
              </svg>
            </button>
      
            {/* Dropdown menu */}
            {dropdownOpen === msg.id && (
              <div
                id="dropdownDots"
                className="z-10 absolute bg-white divide-y divide-gray-100 rounded-lg shadow-sm w-40 dark:bg-gray-700 dark:divide-gray-600"
              >
                <ul className="py-2 text-sm text-gray-700 dark:text-gray-200">
                  <li>
                    <a href="#" onClick={() => handleReply(msg)} className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white">
                      Reply
                    </a>
                  </li>
                  <li>
                    <a href="#" className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white">Forward</a>
                  </li>
                  <li>
                    <a href="#" className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white">Copy</a>
                  </li>
                  <li>
                    <a href="#" className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white">Report</a>
                  </li>
                  <li>
                    <a href="#" className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white">Delete</a>
                  </li>
                </ul>
              </div>
            )}
          </div>
        ))}
        {/* Message reply input */}
        {replyMessage && (
          <div className="mt-4 p-2 border border-gray-300 rounded-lg">
            <div className="bg-gray-100 p-2 rounded-lg">
              <strong>Replying to:</strong>
              <p>{replyMessage.pesan}</p>
            </div>
            <textarea
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type your reply..."
              className="w-full p-2 mt-2 border border-gray-300 rounded-lg"
            />
            <button onClick={handleSendMessage} className="bg-blue-500 text-white px-4 py-2 rounded-lg mt-2">
              Send Reply
            </button>
          </div>
        )}
      </div>

      {/* Input Pesan & File */}
      <div className="bg-white p-4 shadow-md sticky bottom-0 w-full">
        {/* Pratinjau File */}
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
                ) : (
                  <div className="w-20 h-20 flex items-center justify-center bg-gray-200 rounded-lg">
                    📄 {file.name}
                  </div>
                )}
                <button
                  className="absolute top-0 right-0 bg-red-500 text-white p-1 rounded-full text-xs"
                  onClick={() => removeFile(index)}
                >
                  ❌
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Input Pesan */}
      {/* Input Pesan & File */}
      <div className="flex items-center p-4 border-t border-gray-300">
        {/* Input File */}
        <input type="file" multiple onChange={handleFileChange} disabled={uploading} className="hidden" id="fileInput" />
         <label htmlFor="fileInput" className="cursor-pointer">
            <span className="material-icons">📎</span>
        </label>
        
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          className="flex-1 p-2 border rounded-lg"
          placeholder="Ketik pesan..."
          disabled={uploading}
        />

        

        {/* Tombol Kirim */}
        <button
          onClick={sendMessage}
          className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800 inline-flex items-center"
          disabled={uploading}
          type="button"
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
                <path
                  d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                  fill="#E5E7EB"
                />
                <path
                  d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                  fill="currentColor"
                />
              </svg>
              Loading...
            </>
          ) : (
            "Kirim"
          )}
        </button>

      </div>
    </div>
    </div>
  );
};

export default ChatBox;

// "✅" : "❌"}
// "use client";

// import { useEffect, useState } from "react";
// import { database, storage } from "../config/firebase";
// import { ref as databaseRef, onValue, push, update } from "firebase/database";
// import { ref as storageRef, uploadBytes, getDownloadURL } from "firebase/storage";
// import { format } from "date-fns";

// const ChatBox = ({ pengirim, penerima }) => {
//   const [messages, setMessages] = useState([]);
//   const [newMessage, setNewMessage] = useState("");
//   const [file, setFile] = useState(null);

//   useEffect(() => {
//     const messagesRef = databaseRef(database, "chatsBox");
//     onValue(messagesRef, (snapshot) => {
//       const data = snapshot.val();
//       if (data) {
//         const formattedData = Object.entries(data).map(([id, value]) => ({
//           id,
//           ...value,
//           timestamp: value.timestamp ? new Date(value.timestamp) : null,
//           timestampRead: value.timestampRead ? new Date(value.timestampRead) : null,
//         }));

//         setMessages(
//           formattedData.filter(
//             (msg) =>
//               (msg.pengirim === pengirim && msg.penerima === penerima) ||
//               (msg.pengirim === penerima && msg.penerima === pengirim)
//           )
//         );
//       }
//     });
//   }, [pengirim, penerima]);

//   const sendMessage = async () => {
//     if (!newMessage.trim() && !file) return;

//     const newMessageRef = push(databaseRef(database, "chatsBox"));
//     let fileUrl = null;
//     let fileType = null;

//     if (file) {
//       const ext = file.name.split(".").pop();
//       const fileRef = storageRef(storage, `chatFiles/${newMessageRef.key}.${ext}`);
//       await uploadBytes(fileRef, file);
//       fileUrl = await getDownloadURL(fileRef);
//       fileType = file.type.split("/")[0]; // "image", "video", "application"
//     }

//     const messageData = {
//       id: newMessageRef.key,
//       pengirim,
//       penerima,
//       pesan: newMessage,
//       fileUrl,
//       fileType,
//       fileName: file ? file.name : null,
//       timestamp: Date.now(),
//       read: false,
//       timestampRead: null,
//     };

//     await update(newMessageRef, messageData);
//     setNewMessage("");
//     setFile(null);
//   };

//   useEffect(() => {
//     messages.forEach((msg) => {
//       if (msg.penerima === pengirim && !msg.read) {
//         update(databaseRef(database, `chatsBox/${msg.id}`), {
//           read: true,
//           timestampRead: Date.now(),
//         });
//       }
//     });
//   }, [messages, pengirim]);

//   return (
//     <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md">
//       <h2 className="text-xl font-semibold mb-4">Chat dengan {penerima}</h2>
//       <div className="h-96 overflow-y-auto border p-4 mb-4 rounded-lg">
//         {messages.map((msg) => (
//           <div
//             key={msg.id}
//             className={`mb-3 p-3 rounded-lg max-w-xs ${
//               msg.pengirim === pengirim ? "bg-blue-500 text-white ml-auto" : "bg-gray-200"
//             }`}
//           >
//             {msg.fileUrl && (
//               <div className="mb-2">
//                 {msg.fileType === "image" ? (
//                   <img src={msg.fileUrl} alt="Uploaded" className="w-full rounded-lg" />
//                 ) : msg.fileType === "video" ? (
//                   <video controls className="w-full rounded-lg">
//                     <source src={msg.fileUrl} type="video/mp4" />
//                   </video>
//                 ) : (
//                   <a
//                     href={msg.fileUrl}
//                     target="_blank"
//                     rel="noopener noreferrer"
//                     className="text-blue-500 underline"
//                   >
//                     📄 {msg.fileName}
//                   </a>
//                 )}
//               </div>
//             )}
//             <p>{msg.pesan}</p>
//             <small className="block text-xs mt-1">
//               {format(msg.timestamp, "HH:mm")} • {msg.read ? "✅" : "❌"}
//             </small>
//           </div>
//         ))}
//       </div>
//       <div className="flex items-center gap-2">
//         <input
//           type="text"
//           value={newMessage}
//           onChange={(e) => setNewMessage(e.target.value)}
//           className="flex-1 p-2 border rounded-lg"
//           placeholder="Ketik pesan..."
//         />
//         <input type="file" onChange={(e) => setFile(e.target.files[0])} />
//         <button onClick={sendMessage} className="bg-blue-500 text-white px-4 py-2 rounded-lg">
//           Kirim
//         </button>
//       </div>
//     </div>
//   );
// };

// export default ChatBox;
