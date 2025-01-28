"use client";

import { useEffect, useState } from "react";
import { database, storage } from "../config/firebase";
import { ref as databaseRef, onValue, push, update } from "firebase/database";
import { ref as storageRef, uploadBytes, getDownloadURL } from "firebase/storage";
import { format } from "date-fns";

const ChatBox = ({ pengirim, penerima }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);

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
      id: newMessageRef.key,
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
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4">Chat dengan {penerima}</h2>
      
      {/* Tampilkan pesan */}
      <div className="h-96 overflow-y-auto border p-4 mb-4 rounded-lg">
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
              {format(msg.timestamp, "HH:mm")} • {msg.read ? "✅" : "❌"}
            </small>
          </div>
        ))}
      </div>

      {/* Input Pesan & File */}
      <div className="flex flex-col gap-2">
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
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          className="flex-1 p-2 border rounded-lg"
          placeholder="Ketik pesan..."
          disabled={uploading}
        />

        {/* Input File */}
        <input type="file" multiple onChange={handleFileChange} disabled={uploading} />

        {/* Tombol Kirim */}
        <button
          onClick={sendMessage}
          className="bg-blue-500 text-white px-4 py-2 rounded-lg"
          disabled={uploading}
        >
          {uploading ? "Mengupload..." : "Kirim"}
        </button>
      </div>
    </div>
  );
};

export default ChatBox;

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
