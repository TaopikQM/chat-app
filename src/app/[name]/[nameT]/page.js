"use client";
import { useEffect, useState } from 'react';
import { UserProvider } from '../../context/UserContext'; // Sesuaikan path jika berbeda
import { useEffect, useState } from 'react';
import { getDatabase, ref, get } from 'firebase/database'; // Firebase database functions


const UserPage = () => {
  const [currentUserName, setCurrentUserName] = useState('');
  const [otherUser, setOtherUser] = useState('');
  const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [userActive, setUserActive] = useState(false);
    const [userName, setUserName] = useState('');
    const [otherUsers, setOtherUsers] = useState([]); // State untuk menyimpan data pengguna lain

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                // Extract the 'id' from the URL
                const pathParts = window.location.pathname.split('/');
                const idFromUrl = pathParts[pathParts.length - 1];
                setUserName(idFromUrl);
                console.log("ID from URL:", idFromUrl);

                // Initialize Firebase Database reference
                const db = getDatabase();
                const userRef = ref(db, `chat/users/${idFromUrl}`); // Reference to specific user in Firebase

                // Fetch current user data
                const snapshot = await get(userRef);
                
                if (snapshot.exists()) {
                    const user = snapshot.val();
                    console.log("User data:", user);

                    if (user.status === 'Active') {
                        setUserData(user);
                        setUserActive(true);

                        // Fetch all users to populate the sidebar
                        const allUsersRef = ref(db, 'chat/users');
                        const allUsersSnapshot = await get(allUsersRef);

                        if (allUsersSnapshot.exists()) {
                            const allUsersData = allUsersSnapshot.val();
                            const otherUsersArray = Object.keys(allUsersData)
                                .filter(userId => allUsersData[userId].name !== user.name) // Filter out current user
                                .map(userId => ({
                                    id: userId,
                                    name: allUsersData[userId].name,
                                    status: allUsersData[userId].status
                                }));
                            setOtherUsers(otherUsersArray);
                        }
                    } else {
                        setUserActive(false);
                    }
                } else {
                    setUserActive(false); // User not found
                }
            } catch (error) {
                console.error("Error fetching user data:", error);
                setUserActive(false);
            } finally {
                setLoading(false);
            }
        };

        fetchUserData();
    }, []);

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
    // <div>
    //   <h1>Halaman User Utama: {currentUserName}</h1>
    //   <h2>User Terpilih: {otherUser}</h2>
    // </div>
   
    <UserProvider>
        <div className="flex">
            <nav className="fixed top-0 z-50 w-full bg-white border-b border-gray-200 dark:bg-gray-800 dark:border-gray-700">
                <div className="px-3 py-3 lg:px-5 lg:pl-3">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center justify-start rtl:justify-end">
                            <button
                                data-drawer-target="logo-sidebar"
                                data-drawer-toggle="logo-sidebar"
                                aria-controls="logo-sidebar"
                                type="button"
                                className="inline-flex items-center p-2 text-sm text-gray-500 rounded-lg sm:hidden hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200 dark:text-gray-400 dark:hover:bg-gray-700 dark:focus:ring-gray-600"
                            >
                                <span className="sr-only">Open sidebar</span>
                                <svg className="w-6 h-6" aria-hidden="true" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                                    <path clipRule="evenodd" fillRule="evenodd" d="M2 4.75A.75.75 0 012.75 4h14.5a.75.75 0 010 1.5H2.75A.75.75 0 012 4.75zm0 10.5a.75.75 0 01.75-.75h7.5a.75.75 0 010 1.5h-7.5a.75.75 0 01-.75-.75zM2 10a.75.75 0 01.75-.75h14.5a.75.75 0 010 1.5H2.75A.75.75 0 012 10z"></path>
                                </svg>
                            </button>
                            <a href="https://flowbite.com" className="flex ms-2 md:me-24">
                                <span className="self-center text-xl font-semibold sm:text-2xl whitespace-nowrap dark:text-white">
                                    Welcome, {userData.name}
                                </span>
                            </a>
                        </div>
                        <div className="flex items-center">
                            <div className="flex items-center ms-3">
                                <div className="z-50 hidden my-4 text-base list-none bg-white divide-y divide-gray-100 rounded shadow dark:bg-gray-700 dark:divide-gray-600" id="dropdown-user">
                                    <div className="px-4 py-3" role="none">
                                        <p className="text-sm text-gray-900 dark:text-white" role="none">
                                            {userData.name}
                                        </p>
                                    </div>
                                    <ul className="py-1" role="none">
                                        <li>
                                            <a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-600 dark:hover:text-white" role="menuitem">
                                                {userData.status}
                                            </a>
                                        </li>
                                        <li>
                                            <a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-600 dark:hover:text-white" role="menuitem">
                                                {userData.createdAt}
                                            </a>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </nav>

            <aside id="logo-sidebar" className="fixed top-0 left-0 z-40 w-64 h-screen pt-20 transition-transform -translate-x-full bg-white border-r border-gray-200 sm:translate-x-0 dark:bg-gray-800 dark:border-gray-700" aria-label="Sidebar">
                <div className="h-full px-3 pb-4 overflow-y-auto bg-white dark:bg-gray-800">
                    <ul className="space-y-2 font-medium">
                        {otherUsers.map(user => (
                          <li key={user.id}>
                              {/* Logika untuk memberikan kelas aktif jika user.name sama dengan otherUser */}
                              <a 
                                  href={`/${encodeURIComponent(userData.name)}/${encodeURIComponent(user.name)}`} 
                                  className={`flex items-center p-2 rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 group ${
                                      user.name === otherUser ? 'bg-blue-500 text-white' : 'text-gray-900'
                                  }`}
                              >
                                  <svg className="w-5 h-5 text-gray-500 transition duration-75 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white" 
                                       aria-hidden="true" 
                                       xmlns="http://www.w3.org/2000/svg" 
                                       fill="currentColor" 
                                       viewBox="0 0 22 21">
                                      <path d="M16.975 11H10V4.025a1 1 0 0 0-1.066-.998 8.5 8.5 0 1 0 9.039 9.039.999.999 0 0 0-1-1.066h.002Z" />
                                      <path d="M12.5 0c-.157 0-.311.01-.565.027A1 1 0 0 0 11 1.02V10h8.975a1 1 0 0 0 1-.935c.013-.188.028-.374.028-.565A8.51 8.51 0 0 0 12.5 0Z" />
                                  </svg>
                                  <span className="ms-3">{user.name}</span>
                              </a>
                              <p className="ms-10 text-sm text-gray-500 dark:text-gray-400">{user.status}</p>
                          </li>
                      ))}

                    </ul>
                </div>
            </aside>

            <div className="p-4 sm:ml-64">
                <div className="p-4 border-2 border-gray-200 border-dashed rounded-lg dark:border-gray-700 mt-14">
                    {/* Menampilkan otherUser */}
                    <h2>User Terpilih: {otherUser}</h2>
                </div>
            </div>
        </div>
    </UserProvider>
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
