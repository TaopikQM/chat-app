"use client";
import React, { useState, useEffect } from 'react';
import { database, storage } from '../config/firebase'; // Pastikan Firebase Storage sudah dikonfigurasi
import { ref as databaseRef, onValue, push, update } from 'firebase/database';
import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
import 'tailwindcss/tailwind.css';

const Chat0 = ({ user }) => {
    const [otherUser, setOtherUser] = useState(null);
    const [messages, setMessages] = useState([]);
    const [messageText, setMessageText] = useState('');
    const [selectedFiles, setSelectedFiles] = useState([]);
    const [uploading, setUploading] = useState(false);
    const [otherUserStatus, setOtherUserStatus] = useState(''); // Online status or last seen
    const [lastSeen, setLastSeen] = useState(''); // Last seen timestamp
    const [userInfo, setUserInfo] = useState({ name: '', email: '', photo: '' }); // User info state

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const pathParts = window.location.pathname.split('/');
                const idFromUrl = pathParts[pathParts.length - 1];
                console.log("ID from URL:", idFromUrl);

                const db = getDatabase();
                const userRef = ref(db, `chat/users/${idFromUrl}`);
                const snapshot = await get(userRef);

                if (snapshot.exists()) {
                    const user = snapshot.val();
                    setUserInfo({
                        name: user.name,
                        // Provide default if photoUrl is missing
                    });

                } else {
                    console.log("User not found in Firebase");
                }
            } catch (error) {
                console.error("Error fetching user data:", error);
            }
        };

        fetchUserData();
    }, []); // Empty dependency array means this effect runs once when the component mounts

    // Handle messages and other logic (no change needed)
     // Fetch messages and user status from Firebase on component mount
    useEffect(() => {
        const messagesRef = databaseRef(database, `messagesU/${user.id}/${otherUser.id}`);
        onValue(messagesRef, (snapshot) => {
            const data = snapshot.val();
            const loadedMessages = data ? Object.values(data) : [];
            setMessages(loadedMessages);

            // Mark all messages as read when the user views the chat
            loadedMessages.forEach((msg) => {
                if (!msg.read && msg.sender !== user.id) {
                    update(databaseRef(database, `messagesU/${user.id}/${otherUser.id}/${msg.id}`), { read: true });
                    update(databaseRef(database, `messagesU/${otherUser.id}/${user.id}/${msg.id}`), { read: true });
                }
            });
        });

        // Fetch other user's last seen status
        // const userStatusRef = databaseRef(database, `lastSeen/${otherUser.id}`);
        // onValue(userStatusRef, (snapshot) => {
        //     const status = snapshot.val();
        //     setLastSeen(status ? new Date(status.timestamp).toLocaleTimeString() : 'Offline');
        // });
        // Fetch other user's last seen status
        const userStatusRef = databaseRef(database, `lastSeen/${otherUser.id}`);
        onValue(userStatusRef, (snapshot) => {
            const status = snapshot.val();
            if (status && status.timestamp) {
                const date = new Date(status.timestamp);
                setLastSeen(!isNaN(date.getTime()) ? date.toLocaleTimeString() : 'Offline');
            } else {
                setLastSeen('Offline');
            }
        });

        // Update last seen when user is active
        const lastSeenRef = databaseRef(database, `lastSeen/${user.id}`);
        update(lastSeenRef, { timestamp: Date.now() });

        return () => {
            // Cleanup: Remove last seen status when component unmounts
            update(lastSeenRef, { timestamp: null });
        };
    }, [user.id, otherUser.id]);

    // Handle file selection
    const handleFileChange = (event) => {
        const files = Array.from(event.target.files);
        setSelectedFiles((prevFiles) => [...prevFiles, ...files]);
    };

    // Remove a selected file
    const removeFile = (index) => {
        setSelectedFiles((prevFiles) => prevFiles.filter((_, i) => i !== index));
    };

    // Function to send a new message with media support
    const sendMessage = async () => {
        if (messageText.trim() === "" && selectedFiles.length === 0) return; // Prevent sending empty messages

        const messagesRef = databaseRef(database, `messagesU/${user.id}/${otherUser.id}`);
        const newMessage = {
            text: messageText,
            sender: user.id,
            timestamp: Date.now(),
            read: false,
            files: [],
        };

        setUploading(true);

        // Upload selected files (images and videos) to Firebase Storage
        const uploadedFiles = await Promise.all(selectedFiles.map(async (file) => {
            const fileRef = storageRef(storage, `chatFiles/${file.name}`);
            await uploadBytes(fileRef, file);
            return getDownloadURL(fileRef);
        }));

        // Update newMessage with uploaded file URLs
        newMessage.files = uploadedFiles;

        // Push message to Firebase Database
        const newMsgRef = await push(messagesRef, newMessage);
        setMessageText(''); // Clear input after sending
        setSelectedFiles([]); // Clear selected files

        // Update the recipient's message status
        const recipientRef = databaseRef(database, `messagesU/${otherUser.id}/${user.id}`);
        await push(recipientRef, { ...newMessage, id: newMsgRef.key });

        setUploading(false);

        // Update last seen when a message is sent
        const lastSeenRef = databaseRef(database, `lastSeen/${user.id}`);
        update(lastSeenRef, { timestamp: Date.now() });
    };

    const renderMedia = (files) => {
        if (!files || files.length === 0) return null;

        return (
            <div className="flex flex-wrap mt-1">
                {files.map((file, index) => (
                    <a
                        key={index}
                        href={file}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-20 h-20 flex items-center justify-center border border-gray-300 rounded-lg m-1"
                    >
                        {file.endsWith('.jpg') || file.endsWith('.png') || file.endsWith('.gif') ? (
                            <img src={file} alt="Media" className="object-cover h-full w-full rounded-lg" />
                        ) : (
                            <span className="text-sm">File</span>
                        )}
                    </a>
                ))}
            </div>
        );
    };

    return (
        <div className="flex">
            {/* Sidebar */}
            <div className="w-64 bg-gray-800 text-white h-screen p-4">
                <div className="flex items-center mb-4">
                    <img  alt="User Photo" className="w-10 h-10 rounded-full" />
                    <span className="ml-2 text-xl">{userInfo.name}</span>
                </div>
                <ul className="space-y-2 font-medium">
                    <li>
                        <a href="#" className="flex items-center p-2 text-gray-900 rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 group">
                            <svg className="w-5 h-5 text-gray-500 transition duration-75 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 22 21">
                                <path d="M16.975 11H10V4.025a1 1 0 0 0-1.066-.998 8.5 8.5 0 1 0 9.039 9.039.999.999 0 0 0-1-1.066h.002Z"/>
                            </svg>
                            <span className="ml-3">Dashboard</span>
                        </a>
                    </li>
                    {/* Add more items as needed */}
                </ul>
                <button type="button" className="flex text-sm bg-gray-800 rounded-full focus:ring-4 focus:ring-gray-300 dark:focus:ring-gray-600" aria-expanded="false" data-dropdown-toggle="dropdown-user">
                    <span className="sr-only">Open user menu</span>
                    <img className="w-8 h-8 rounded-full"  alt="user photo" />
                </button>
                <div className="z-50 hidden my-4 text-base list-none bg-white divide-y divide-gray-100 rounded shadow dark:bg-gray-700 dark:divide-gray-600" id="dropdown-user">
                    <div className="px-4 py-3">
                        <p className="text-sm text-gray-900 dark:text-white">{userInfo.name}</p>
                        <p className="text-sm font-medium text-gray-900 truncate dark:text-gray-300">{userInfo.status}</p>
                    </div>
                    <ul className="py-1">
                        <li>
                            <a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-600 dark:hover:text-white">Dashboard</a>
                        </li>
                        {/* Add more dropdown items as needed */}
                    </ul>
                </div>
            </div>

            {/* Main Chat Content */}
            <div className="flex-1 bg-gray-100 h-screen">
                <div className="flex-none p-4 bg-white border-b border-gray-300">
                    {otherUser ? (
                        <>
                            <h2 className="text-xl text-center">{otherUser.name}</h2>
                            <p className="text-sm text-center">{lastSeen ? 'Last seen: ' + lastSeen : 'Offline'}</p>
                        </>
                    ) : (
                        <p>Loading...</p>
                    )}
                </div>
                <div className="flex-1 overflow-y-auto p-4">
                    {messages.map((msg, index) => (
                        <div key={index} className={`mb-2 ${msg.sender === user.id ? 'text-right' : 'text-left'}`}>
                            <div className={`inline-block p-2 rounded-lg ${msg.sender === user.id ? 'bg-blue-500 text-white' : 'bg-gray-300'}`}>
                                {msg.text}
                                {renderMedia(msg.files)}
                            </div>
                            <div className="text-xs text-gray-500 flex justify-end items-center">
                                {new Date(msg.timestamp).toLocaleTimeString()}
                                {msg.sender === user.id && (
                                    <span className="ml-2">
                                        {msg.read ? (
                                            <span className="text-blue-500">✔✔</span>
                                        ) : (
                                            <span>✔</span>
                                        )}
                                    </span>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
                <div className="flex items-center p-4 border-t border-gray-300">
                    <input
                        type="file"
                        multiple
                        accept="image/*, video/*"
                        onChange={handleFileChange}
                        className="border border-gray-300 rounded p-2"
                    />
                    <input
                        type="text"
                        value={messageText}
                        onChange={(e) => setMessageText(e.target.value)}
                        className="flex-1 border border-gray-300 rounded p-2 ml-2"
                        placeholder="Type a message..."
                    />
                    <button
                        onClick={sendMessage}
                        disabled={uploading}
                        className={`ml-2 bg-blue-500 text-white px-4 py-2 rounded ${uploading ? 'opacity-50' : ''}`}
                    >
                        {uploading ? 'Sending...' : 'Send'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Chat0;

// "use client";
// import React, { useState, useEffect } from 'react';
// import { database, storage } from '../config/firebase'; // Pastikan Firebase Storage sudah dikonfigurasi
// import { ref as databaseRef, onValue, push, update } from 'firebase/database';
// import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
// import 'tailwindcss/tailwind.css';

// const Chat0 = ({ user }) => {
//     const [otherUser, setOtherUser] = useState(null);
//     const [messages, setMessages] = useState([]);
//     const [messageText, setMessageText] = useState('');
//     const [selectedFiles, setSelectedFiles] = useState([]);
//     const [uploading, setUploading] = useState(false);
//     const [otherUserStatus, setOtherUserStatus] = useState(''); // Online status or last seen
//     const [lastSeen, setLastSeen] = useState(''); // Last seen timestamp

//     useEffect(() => {
//         const fetchUserData = async () => {
//             try {
//                 // Extract the 'id' from the URL
//                 const pathParts = window.location.pathname.split('/');
//                 const idFromUrl = pathParts[pathParts.length - 1];
//                 setUserName(idFromUrl);
//                 console.log("ID from URL:", idFromUrl);

//                 // Initialize Firebase Database reference
//                 const db = getDatabase();
//                 const userRef = ref(db, `chat/users/${idFromUrl}`); // Reference to specific user in Firebase

//                 // Fetch user data from Firebase
//                 const snapshot = await get(userRef);

//                 if (snapshot.exists()) {
//                     const user = snapshot.val();
//                     console.log("User data:", user);

//                     // Check if the user is active
//                     if (user.status === 'Active') {
//                         setUserData(user);
//                         setUserActive(true);
//                     } else {
//                         setUserActive(false);
//                     }

//                     // Set the other user based on user.id and fetched data
//                     const otherUserId = user.id === 'user1' ? 'user2' : 'user1';
//                     const otherUserName = user.id === 'user1' ? 'User 2' : 'User 1';
//                     setOtherUser({ id: otherUserId, name: otherUserName });

//                 } else {
//                     // User not found in Firebase
//                     setUserActive(false);
//                 }
//             } catch (error) {
//                 console.error("Error fetching user data:", error);
//                 setUserActive(false); // Set to false if error occurs
//             } finally {
//                 setLoading(false); // Set loading to false after fetching data
//             }
//         };

//         fetchUserData();
//     }, []); // Empty dependency array means this effect runs once when the component mounts

//     // Fetch messages and user status from Firebase on component mount
//     useEffect(() => {
//         if (!otherUser) return; // Ensure otherUser is set before proceeding

//         const messagesRef = databaseRef(database, `messagesU/${user.id}/${otherUser.id}`);
//         onValue(messagesRef, (snapshot) => {
//             const data = snapshot.val();
//             const loadedMessages = data ? Object.values(data) : [];
//             setMessages(loadedMessages);

//             // Mark all messages as read when the user views the chat
//             loadedMessages.forEach((msg) => {
//                 if (!msg.read && msg.sender !== user.id) {
//                     update(databaseRef(database, `messagesU/${user.id}/${otherUser.id}/${msg.id}`), { read: true });
//                     update(databaseRef(database, `messagesU/${otherUser.id}/${user.id}/${msg.id}`), { read: true });
//                 }
//             });
//         });

//         // Fetch other user's last seen status
//         const userStatusRef = databaseRef(database, `lastSeen/${otherUser.id}`);
//         onValue(userStatusRef, (snapshot) => {
//             const status = snapshot.val();
//             if (status && status.timestamp) {
//                 const date = new Date(status.timestamp);
//                 setLastSeen(!isNaN(date.getTime()) ? date.toLocaleTimeString() : 'Offline');
//             } else {
//                 setLastSeen('Offline');
//             }
//         });

//         // Update last seen when user is active
//         const lastSeenRef = databaseRef(database, `lastSeen/${user.id}`);
//         update(lastSeenRef, { timestamp: Date.now() });

//         return () => {
//             // Cleanup: Remove last seen status when component unmounts
//             update(lastSeenRef, { timestamp: null });
//         };
//     }, [user.id, otherUser]);

//     // Handle file selection
//     const handleFileChange = (event) => {
//         const files = Array.from(event.target.files);
//         setSelectedFiles((prevFiles) => [...prevFiles, ...files]);
//     };

//     // Remove a selected file
//     const removeFile = (index) => {
//         setSelectedFiles((prevFiles) => prevFiles.filter((_, i) => i !== index));
//     };

//     // Function to send a new message with media support
//     const sendMessage = async () => {
//         if (messageText.trim() === "" && selectedFiles.length === 0) return; // Prevent sending empty messages

//         const messagesRef = databaseRef(database, `messagesU/${user.id}/${otherUser.id}`);
//         const newMessage = {
//             text: messageText,
//             sender: user.id,
//             timestamp: Date.now(),
//             read: false,
//             files: [],
//         };

//         setUploading(true);

//         // Upload selected files (images and videos) to Firebase Storage
//         const uploadedFiles = await Promise.all(selectedFiles.map(async (file) => {
//             const fileRef = storageRef(storage, `chatFiles/${file.name}`);
//             await uploadBytes(fileRef, file);
//             return getDownloadURL(fileRef);
//         }));

//         // Update newMessage with uploaded file URLs
//         newMessage.files = uploadedFiles;

//         // Push message to Firebase Database
//         const newMsgRef = await push(messagesRef, newMessage);
//         setMessageText(''); // Clear input after sending
//         setSelectedFiles([]); // Clear selected files

//         // Update the recipient's message status
//         const recipientRef = databaseRef(database, `messagesU/${otherUser.id}/${user.id}`);
//         await push(recipientRef, { ...newMessage, id: newMsgRef.key });

//         setUploading(false);

//         // Update last seen when a message is sent
//         const lastSeenRef = databaseRef(database, `lastSeen/${user.id}`);
//         update(lastSeenRef, { timestamp: Date.now() });
//     };

//     const renderMedia = (files) => {
//         if (!files || files.length === 0) return null;

//         return (
//             <div className="flex flex-wrap mt-1">
//                 {files.map((file, index) => (
//                     <a
//                         key={index}
//                         href={file}
//                         target="_blank"
//                         rel="noopener noreferrer"
//                         className="w-20 h-20 flex items-center justify-center border border-gray-300 rounded-lg m-1"
//                     >
//                         {file.endsWith('.jpg') || file.endsWith('.png') || file.endsWith('.gif') ? (
//                             <img src={file} alt="Media" className="object-cover h-full w-full rounded-lg" />
//                         ) : (
//                             <span className="text-sm">File</span>
//                         )}
//                     </a>
//                 ))}
//             </div>
//         );
//     };

//     return (
//         <div className="flex flex-col h-screen bg-gray-100">
//             <div className="flex-none p-4 bg-white border-b border-gray-300">
//                 {otherUser ? (
//                     <>
//                         <h2 className="text-xl text-center">{otherUser.name}</h2>
//                         <p className="text-sm text-center">{lastSeen ? 'Last seen: ' + lastSeen : 'Offline'}</p>
//                     </>
//                 ) : (
//                     <p>Loading...</p>
//                 )}
//             </div>
//             <div className="flex-1 overflow-y-auto p-4">
//                 {/* Display messages */}
//                 {messages.map((msg, index) => (
//                     <div key={index} className={`mb-2 ${msg.sender === user.id ? 'text-right' : 'text-left'}`}>
//                         <div className={`inline-block p-2 rounded-lg ${msg.sender === user.id ? 'bg-blue-500 text-white' : 'bg-gray-300'}`}>
//                             {msg.text}
//                             {renderMedia(msg.files)}
//                         </div>
//                         <div className="text-xs text-gray-500 flex justify-end items-center">
//                             {new Date(msg.timestamp).toLocaleTimeString()}
//                             {msg.sender === user.id && (
//                                 <span className="ml-2">
//                                     {msg.read ? (
//                                         <span className="text-blue-500">✔✔</span>
//                                     ) : (
//                                         <span>✔</span>
//                                     )}
//                                 </span>
//                             )}
//                         </div>
//                     </div>
//                 ))}
//             </div>
//             <div className="flex items-center p-4 border-t border-gray-300">
//                 <input
//                     type="file"
//                     multiple
//                     accept="image/*, video/*"
//                     onChange={handleFileChange}
//                     className="border border-gray-300 rounded p-2"
//                 />
//                 <input
//                     type="text"
//                     value={messageText}
//                     onChange={(e) => setMessageText(e.target.value)}
//                     className="flex-1 border border-gray-300 rounded p-2 ml-2"
//                     placeholder="Type a message..."
//                 />
//                 <button
//                     onClick={sendMessage}
//                     disabled={uploading}
//                     className={`ml-2 bg-blue-500 text-white px-4 py-2 rounded ${uploading ? 'opacity-50' : ''}`}
//                 >
//                     {uploading ? 'Sending...' : 'Send'}
//                 </button>
//             </div>
//         </div>
//     );
// };

// export default Chat0;
