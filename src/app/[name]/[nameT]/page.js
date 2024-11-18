"use client";
import { useEffect, useState } from 'react';

const UserPage = () => {
  const [currentUserName, setCurrentUserName] = useState('');
  const [otherUser, setOtherUser] = useState('');

  useEffect(() => {
    // Menggunakan window.location.pathname untuk mendapatkan path URL
    const pathParts = window.location.pathname.split('/').filter(Boolean);

    // Asumsi URL dalam format /[userName]/[otherUser]
    if (pathParts.length >= 2) {
      setCurrentUserName(pathParts[0]); // Nama user utama dalam URL
      setOtherUser(pathParts[1]);       // Nama user lain yang dipilih
    }
  }, []);

  return (
    <div>
      <h1>Halaman User Utama: {currentUserName}</h1>
      <h2>User Terpilih: {otherUser}</h2>
    </div>
  );
};

export default UserPage;

// "use client"; // Enable client-side rendering
// import React, { useState, useEffect } from 'react';
// import { useRouter } from 'next/router'; // Untuk mengambil parameter URL
// import { database, storage } from '../config/firebase';
// import { ref as databaseRef, onValue, push, update } from 'firebase/database';
// import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';

// const Chat = () => {
//     const router = useRouter();
//     const [userName, setUserName] = useState('');
//     const [otherUserName, setOtherUserName] = useState('');
//     const [messages, setMessages] = useState([]);
//     const [messageText, setMessageText] = useState('');
//     const [selectedFiles, setSelectedFiles] = useState([]);
//     const [uploading, setUploading] = useState(false);
//     const [lastSeen, setLastSeen] = useState('');

//     useEffect(() => {
//         // Ambil parameter dari URL
//         const pathParts = router.asPath.split('/').filter(Boolean);
//         const currentUserName = pathParts[0]; // Nama user pertama dalam URL
//         const otherUser = pathParts[1]; // Nama user lain dalam URL, jika ada

//         setUserName(currentUserName);
//         if (otherUser) {
//             setOtherUserName(otherUser);
//         }

//         // Logika pengambilan pesan dari Firebase
//         if (currentUserName && otherUser) {
//             const messagesRef = databaseRef(database, `messagesU/${currentUserName}/${otherUser}`);
//             onValue(messagesRef, (snapshot) => {
//                 const data = snapshot.val();
//                 const loadedMessages = data ? Object.values(data) : [];
//                 setMessages(loadedMessages);
//             });

//             // Ambil status "last seen" dari pengguna lain
//             const userStatusRef = databaseRef(database, `lastSeen/${otherUser}`);
//             onValue(userStatusRef, (snapshot) => {
//                 const status = snapshot.val();
//                 if (status && status.timestamp) {
//                     const date = new Date(status.timestamp);
//                     setLastSeen(!isNaN(date.getTime()) ? date.toLocaleTimeString() : 'Offline');
//                 } else {
//                     setLastSeen('Offline');
//                 }
//             });

//             // Update "last seen" ketika user aktif
//             const lastSeenRef = databaseRef(database, `lastSeen/${currentUserName}`);
//             update(lastSeenRef, { timestamp: Date.now() });
//         }
//     }, [router]);

//     const sendMessage = async () => {
//         if (messageText.trim() === "" && selectedFiles.length === 0) return; // Prevent sending empty messages

//         const messagesRef = databaseRef(database, `messagesU/${userName}/${otherUserName}`);
//         const newMessage = {
//             text: messageText,
//             sender: userName,
//             timestamp: Date.now(),
//             read: false,
//             files: [],
//         };

//         setUploading(true);

//         // Upload selected files
//         const uploadedFiles = await Promise.all(selectedFiles.map(async (file) => {
//             const fileRef = storageRef(storage, `chatFiles/${file.name}`);
//             await uploadBytes(fileRef, file);
//             return getDownloadURL(fileRef);
//         }));

//         newMessage.files = uploadedFiles;

//         // Push message to Firebase
//         const newMsgRef = await push(messagesRef, newMessage);
//         setMessageText('');
//         setSelectedFiles([]);

//         // Push ke database lawan bicara
//         const recipientRef = databaseRef(database, `messagesU/${otherUserName}/${userName}`);
//         await push(recipientRef, { ...newMessage, id: newMsgRef.key });

//         setUploading(false);

//         // Update "last seen" saat mengirim pesan
//         const lastSeenRef = databaseRef(database, `lastSeen/${userName}`);
//         update(lastSeenRef, { timestamp: Date.now() });
//     };

//     return (
//         <div className="flex flex-col h-screen bg-gray-100">
//             <div className="flex-none p-4 bg-white border-b border-gray-300">
//                 <h2 className="text-xl text-center">Chat with {otherUserName}</h2>
//                 <p className="text-sm text-center">{lastSeen ? 'Last seen: ' + lastSeen : 'Offline'}</p>
//             </div>
//             <div className="flex-1 overflow-y-auto p-4">
//                 {messages.map((msg, index) => (
//                     <div key={index} className={`mb-2 ${msg.sender === userName ? 'text-right' : 'text-left'}`}>
//                         <div className={`inline-block p-2 rounded-lg ${msg.sender === userName ? 'bg-blue-500 text-white' : 'bg-gray-300'}`}>
//                             {msg.text}
//                         </div>
//                         <div className="text-xs text-gray-500">
//                             {new Date(msg.timestamp).toLocaleTimeString()}
//                         </div>
//                     </div>
//                 ))}
//             </div>
//             <div className="flex items-center p-4 border-t border-gray-300">
//                 <input
//                     type="text"
//                     className="border rounded-lg p-2 flex-1 mx-2"
//                     placeholder="Type a message..."
//                     value={messageText}
//                     onChange={(e) => setMessageText(e.target.value)}
//                 />
//                 <button
//                     className="ml-2 p-2 bg-blue-500 text-white rounded-lg"
//                     onClick={sendMessage}
//                     disabled={uploading}
//                 >
//                     {uploading ? "Sending..." : "Send"}
//                 </button>
//             </div>
//         </div>
//     );
// };

// export default Chat;
