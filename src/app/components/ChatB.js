"use client";
import React, { useState, useEffect } from 'react';
import { database } from '../config/firebase'; 
import { ref as databaseRef, onValue, push } from 'firebase/database';

const Chat = ({ user }) => {
    const otherUser = user.id === 'user1' ? { id: 'user2', name: 'User 2' } : { id: 'user1', name: 'User 1' };
    const [messages, setMessages] = useState([]);
    const [messageText, setMessageText] = useState('');
    const [chatBubbleColor, setChatBubbleColor] = useState('#e0e0e0'); // Default bubble color
    const [chatTextColor, setChatTextColor] = useState('#000000'); // Default text color

    // Load color settings from localStorage on mount
    useEffect(() => {
        const savedBubbleColor = localStorage.getItem('chatBubbleColor');
        const savedTextColor = localStorage.getItem('chatTextColor');
        if (savedBubbleColor) setChatBubbleColor(savedBubbleColor);
        if (savedTextColor) setChatTextColor(savedTextColor);
    }, []);

    // Listen for new messages
    useEffect(() => {
        const messagesRef = databaseRef(database, `messages/${user.id}/${otherUser.id}`);
        onValue(messagesRef, (snapshot) => {
            const messagesData = snapshot.val() || {};
            setMessages(Object.values(messagesData));
        });
    }, [user.id, otherUser.id]);

    // Send message function
    const sendMessage = async () => {
        if (messageText.trim() === '') return;

        const newMessage = {
            text: messageText,
            sender: user.id,
            timestamp: Date.now(),
        };

        const messagesRef = databaseRef(database, `messages/${user.id}/${otherUser.id}`);
        await push(messagesRef, newMessage);
        setMessageText(''); 
    };

    // Save color settings to localStorage
    const updateColorSettings = (colorType, colorValue) => {
        if (colorType === 'bubble') {
            setChatBubbleColor(colorValue);
            localStorage.setItem('chatBubbleColor', colorValue);
        } else if (colorType === 'text') {
            setChatTextColor(colorValue);
            localStorage.setItem('chatTextColor', colorValue);
        }
    };

    return (
        <div className="chat-container">
            <header className="chat-header">
                <h2>{otherUser.name}</h2>
                <div className="color-settings">
                    <label>
                        Bubble Color:
                        <input
                            type="color"
                            value={chatBubbleColor}
                            onChange={(e) => updateColorSettings('bubble', e.target.value)}
                        />
                    </label>
                    <label>
                        Text Color:
                        <input
                            type="color"
                            value={chatTextColor}
                            onChange={(e) => updateColorSettings('text', e.target.value)}
                        />
                    </label>
                </div>
            </header>

            <div className="chat-messages">
                {messages.map((msg, index) => (
                    <div
                        key={index}
                        className={`message ${msg.sender === user.id ? 'sent' : 'received'}`}
                        style={{
                            backgroundColor: msg.sender === user.id ? chatBubbleColor : '#ffffff',
                            color: msg.sender === user.id ? chatTextColor : '#000000',
                        }}
                    >
                        {msg.text}
                    </div>
                ))}
            </div>

            <div className="chat-input">
                <input
                    type="text"
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    placeholder="Type your message..."
                />
                <button onClick={sendMessage}>Send</button>
            </div>
        </div>
    );
};

export default Chat;


// "use client"; // Enable client-side rendering
// import React, { useState, useEffect } from 'react';
// import { database, storage } from '../config/firebase'; // Ensure Firebase Storage is configured
// import { ref as databaseRef, onValue, push, update } from 'firebase/database';
// import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
// import 'tailwindcss/tailwind.css';

// const Chat = ({ user }) => {
//     // Identifying the other user
//     const otherUser = user.id === 'user1' ? { id: 'user2', name: 'User 2' } : { id: 'user1', name: 'User 1' };

//     // State declarations
//     const [messages, setMessages] = useState([]);
//     const [messageText, setMessageText] = useState('');
//     const [selectedFiles, setSelectedFiles] = useState([]);
//     const [uploading, setUploading] = useState(false);
//     const [otherUserStatus, setOtherUserStatus] = useState('');
//     const [lastSeen, setLastSeen] = useState('');
//     const [popupFile, setPopupFile] = useState(null);
    
//     const [isMenuOpen, setIsMenuOpen] = useState(false);
//     const [chatBubbleColor, setChatBubbleColor] = useState('bg-gray-300');
//     const [chatTextColor, setChatTextColor] = useState('text-black');

//     const userId = user.id;

//     // Load settings from localStorage
//     useEffect(() => {
//         const savedSettings = JSON.parse(localStorage.getItem(`chatSettings-${userId}`));
//         if (savedSettings) {
//             setChatBubbleColor(savedSettings.bubbleColor);
//             setChatTextColor(savedSettings.textColor);
//         }
//     }, [userId]);

//     // Save settings to localStorage
//     const saveSettings = (newSettings) => {
//         const settings = {
//             bubbleColor: newSettings.bubbleColor || chatBubbleColor,
//             textColor: newSettings.textColor || chatTextColor,
//         };
//         setChatBubbleColor(settings.bubbleColor);
//         setChatTextColor(settings.textColor);
//         localStorage.setItem(`chatSettings-${userId}`, JSON.stringify(settings));
//     };
    
//     useEffect(() => {
//         const messagesRef = databaseRef(database, `messagesA/${user.id}/${otherUser.id}`);
//         onValue(messagesRef, (snapshot) => {
//             const data = snapshot.val();
//             const loadedMessages = data ? Object.values(data) : [];
//             setMessages(loadedMessages);
    
//             // Mark messages as read when the chat is opened
//             loadedMessages.forEach((msg) => {
//                 if (!msg.read && msg.sender !== user.id) {
//                     update(databaseRef(database, `messagesA/${user.id}/${otherUser.id}/${msg.id}`), { read: true });
//                     update(databaseRef(database, `messagesA/${otherUser.id}/${user.id}/${msg.id}`), { read: true });
//                 }
//             });
//         });
        
//         // Last seen status
//         const userStatusRef = databaseRef(database, `lastSeenA/${otherUser.id}`);
//         onValue(userStatusRef, (snapshot) => {
//             const status = snapshot.val();
//             const timestamp = status && status.timestamp ? Number(status.timestamp) : null;

//             if (timestamp && timestamp.toString().length === 13) {
//                 const date = new Date(timestamp);
//                 setLastSeen(
//                     !isNaN(date.getTime())
//                         ? `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`
//                         : 'Offline'
//                 );
//             } else {
//                 console.error("Invalid or missing timestamp:", timestamp);
//                 setLastSeen('Offline');
//             }
//         });
    
//         // Update last seen when user is active
//         const lastSeenRef = databaseRef(database, `lastSeenA/${user.id}`);
//         update(lastSeenRef, { timestamp: Date.now() });
    
//         return () => {
//             // Cleanup: Remove last seen status when component unmounts
//             update(lastSeenRef, { timestamp: null });
//         };
//     }, [user.id, otherUser.id]);

//     const [dropdownOpen, setDropdownOpen] = useState(null);

//     const toggleDropdown = (index) => {
//         setDropdownOpen(dropdownOpen === index ? null : index);
//     };
    
//     const isDropdownOpen = (index) => dropdownOpen === index;

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

//         const messagesRef = databaseRef(database, `messagesA/${user.id}/${otherUser.id}`);
//         const newMessage = {
//             text: messageText,
//             sender: user.id,
//             timestamp: Date.now(),
//             read: false,
//             files: [],
//         };

//         setUploading(true);

//         // Upload selected files to Firebase Storage
//         const uploadedFiles = await Promise.all(selectedFiles.map(async (file) => {
//             const fileRef = storageRef(storage, `chatFilesA/${file.name}`);
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
//         const recipientRef = databaseRef(database, `messagesA/${otherUser.id}/${user.id}`);
//         await push(recipientRef, { ...newMessage, id: newMsgRef.key });

//         setUploading(false);

//         // Update last seen when a message is sent
//         const lastSeenRef = databaseRef(database, `lastSeenA/${user.id}`);
//         update(lastSeenRef, { timestamp: Date.now() });
//     };

//     const renderMedia = (files) => {
//         if (!files || files.length === 0) return null;

//         return (
//             <div className="grid grid-cols-4 gap-2 mt-2">
//                 {files.map((file, index) => (
//                     <a
//                         key={index}
//                         href={file}
//                         target="_blank"
//                         rel="noopener noreferrer"
//                         className="relative w-20 h-20 border border-gray-300 rounded-lg overflow-hidden cursor-pointer flex items-center justify-center bg-white"
//                     >
//                         {file.endsWith('.jpg') || file.endsWith('.png') || file.endsWith('.jpeg') ? (
//                             <img src={file} alt={`media-${index}`} className="object-cover w-full h-full" />
//                         ) : (
//                             <span>{file.split('/').pop()}</span>
//                         )}
//                         <button onClick={() => removeFile(index)} className="absolute top-0 right-0 p-1 bg-red-500 text-white rounded-full">
//                             &times;
//                         </button>
//                     </a>
//                 ))}
//             </div>
//         );
//     };

//     const toggleColorMenu = () => setIsMenuOpen((prev) => !prev);

//     return (
//         <div className="flex flex-col h-full p-4">
//             <header className="flex items-center justify-between">
//                 <h2 className="text-xl font-bold">{otherUser.name}</h2>
//                 <span>{otherUserStatus || lastSeen}</span>
//                 <button onClick={toggleColorMenu} className="p-2 border border-gray-300 rounded">
//                     Color Settings
//                 </button>
//             </header>

//             <div className={`flex-grow overflow-y-auto p-2 border border-gray-200 rounded mt-4`}>
//                 {messages.map((msg, index) => (
//                     <div
//                         key={index}
//                         className={`my-2 p-2 rounded-lg ${msg.sender === user.id ? chatBubbleColor : 'bg-blue-200'}`}
//                     >
//                         <p className={`mb-1 ${msg.sender === user.id ? chatTextColor : 'text-black'}`}>{msg.text}</p>
//                         {renderMedia(msg.files)}
//                     </div>
//                 ))}
//             </div>

//             <div className="flex items-center mt-4">
//                 <input
//                     type="file"
//                     multiple
//                     onChange={handleFileChange}
//                     className="p-2 border border-gray-300 rounded"
//                 />
//                 <input
//                     type="text"
//                     value={messageText}
//                     onChange={(e) => setMessageText(e.target.value)}
//                     placeholder="Type your message..."
//                     className="flex-grow p-2 border border-gray-300 rounded mx-2"
//                 />
//                 <button
//                     onClick={sendMessage}
//                     className="p-2 bg-blue-500 text-white rounded hover:bg-blue-600"
//                     disabled={uploading}
//                 >
//                     {uploading ? 'Sending...' : 'Send'}
//                 </button>
//             </div>

//             {/* Color Settings Dropdown */}
//             {isMenuOpen && (
//                 <div className="absolute mt-2 bg-white shadow-lg rounded">
//                     <div className="flex flex-col">
//                         <h4 className="p-2">Chat Bubble Color</h4>
//                         <input
//                             type="color"
//                             value={chatBubbleColor}
//                             onChange={(e) => saveSettings({ bubbleColor: e.target.value })}
//                             className="p-2"
//                         />
//                         <h4 className="p-2">Text Color</h4>
//                         <input
//                             type="color"
//                             value={chatTextColor}
//                             onChange={(e) => saveSettings({ textColor: e.target.value })}
//                             className="p-2"
//                         />
//                     </div>
//                 </div>
//             )}
//         </div>
//     );
// };

// export default Chat;


// // "use client"; // Enable client-side rendering
// // import React, { useState, useEffect } from 'react';
// // import { database, storage } from '../config/firebase'; // Pastikan Firebase Storage sudah dikonfigurasi
// // import { ref as databaseRef, onValue, push, update } from 'firebase/database';
// // import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
// // import 'tailwindcss/tailwind.css';

// // const Chat = ({ user }) => {
// //     const otherUser = user.id === 'user1' ? { id: 'user2', name: 'User 2' } : { id: 'user1', name: 'User 1' };

// //     const [messages, setMessages] = useState([]);
// //     const [messageText, setMessageText] = useState('');
// //     const [selectedFiles, setSelectedFiles] = useState([]);
// //     const [uploading, setUploading] = useState(false);
// //     const [otherUserStatus, setOtherUserStatus] = useState(''); // Online status or last seen
// //     const [lastSeen, setLastSeen] = useState(''); // Last seen timestamp
// //     const [popupFile, setPopupFile] = useState(null);
    
// //     const [isMenuOpen, setIsMenuOpen] = useState(false);
// //     const [chatBubbleColor, setChatBubbleColor] = useState('bg-gray-300');
// //     const [chatTextColor, setChatTextColor] = useState('text-black');

// //     const userId = user.id; // Ambil ID user saat ini

// //     // Load settings from localStorage (or fetch from server if available)
// //     useEffect(() => {
// //         const savedSettings = JSON.parse(localStorage.getItem(`chatSettings-${userId}`));
// //         if (savedSettings) {
// //             setChatBubbleColor(savedSettings.bubbleColor);
// //             setChatTextColor(savedSettings.textColor);
// //         }
// //     }, [userId]);

// //     // Save settings to localStorage when updated
// //     const saveSettings = (newSettings) => {
// //         const settings = {
// //             bubbleColor: newSettings.bubbleColor || chatBubbleColor,
// //             textColor: newSettings.textColor || chatTextColor,
// //         };
// //         setChatBubbleColor(settings.bubbleColor);
// //         setChatTextColor(settings.textColor);
// //         localStorage.setItem(`chatSettings-${userId}`, JSON.stringify(settings));
// //     };
    
// //     useEffect(() => {
// //         const messagesRef = databaseRef(database, `messagesA/${user.id}/${otherUser.id}`);
// //         onValue(messagesRef, (snapshot) => {
// //             const data = snapshot.val();
// //             const loadedMessages = data ? Object.values(data) : [];
// //             setMessages(loadedMessages);
    
// //             // Mark all messages as read when the user views the chat
// //             loadedMessages.forEach((msg) => {
// //                 if (!msg.read && msg.sender !== user.id) {
// //                     update(databaseRef(database, `messagesA/${user.id}/${otherUser.id}/${msg.id}`), { read: true });
// //                     update(databaseRef(database, `messagesA/${otherUser.id}/${user.id}/${msg.id}`), { read: true });
// //                 }
// //             });
// //         });
// //         const userStatusRef = databaseRef(database, `lastSeenA/${otherUser.id}`);
        
// //         onValue(userStatusRef, (snapshot) => {
// //             const status = snapshot.val();
// //             const timestamp = status && status.timestamp ? Number(status.timestamp) : null;
    
// //             if (timestamp && timestamp.toString().length === 13) {  // Check if in milliseconds
// //                 const date = new Date(timestamp);
// //                 setLastSeen(
// //                     !isNaN(date.getTime())
// //                         ? `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`
// //                         : 'Offline'
// //                 );
// //             } else {
// //                 console.error("Timestamp is invalid or missing:", timestamp);
// //                 setLastSeen('Offline');
// //             }
// //         });
    
// //         // Update last seen when user is active
// //         const lastSeenRef = databaseRef(database, `lastSeenA/${user.id}`);
// //         update(lastSeenRef, { timestamp: Date.now() });
    
// //         return () => {
// //             // Cleanup: Remove last seen status when component unmounts
// //             update(lastSeenRef, { timestamp: null });
// //         };
// //     }, [user.id, otherUser.id]);

// //     const [dropdownOpen, setDropdownOpen] = useState(null);

// //     const toggleDropdown = (index) => {
// //         setDropdownOpen(dropdownOpen === index ? null : index);
// //     };
    
// //     const isDropdownOpen = (index) => dropdownOpen === index;

// //     // Handle file selection
// //     const handleFileChange = (event) => {
// //         const files = Array.from(event.target.files);
// //         setSelectedFiles((prevFiles) => [...prevFiles, ...files]);
// //     };

// //     // Remove a selected file
// //     const removeFile = (index) => {
// //         setSelectedFiles((prevFiles) => prevFiles.filter((_, i) => i !== index));
// //     };

// //     // Function to send a new message with media support
// //     const sendMessage = async () => {
// //         if (messageText.trim() === "" && selectedFiles.length === 0) return; // Prevent sending empty messages

// //         const messagesRef = databaseRef(database, `messagesA/${user.id}/${otherUser.id}`);
// //         const newMessage = {
// //             text: messageText,
// //             sender: user.id,
// //             timestamp: Date.now(),
// //             read: false,
// //             files: [],
// //         };

// //         setUploading(true);

// //         // Upload selected files (images and videos) to Firebase Storage
// //         const uploadedFiles = await Promise.all(selectedFiles.map(async (file) => {
// //             const fileRef = storageRef(storage, `chatFilesA/${file.name}`);
// //             await uploadBytes(fileRef, file);
// //             return getDownloadURL(fileRef);
// //         }));

// //         // Update newMessage with uploaded file URLs
// //         newMessage.files = uploadedFiles;

// //         // Push message to Firebase Database
// //         const newMsgRef = await push(messagesRef, newMessage);
// //         setMessageText(''); // Clear input after sending
// //         setSelectedFiles([]); // Clear selected files

// //         // Update the recipient's message status
// //         const recipientRef = databaseRef(database, `messagesA/${otherUser.id}/${user.id}`);
// //         await push(recipientRef, { ...newMessage, id: newMsgRef.key });

// //         setUploading(false);

// //         // Update last seen when a message is sent
// //         const lastSeenRef = databaseRef(database, `lastSeenA/${user.id}`);
// //         update(lastSeenRef, { timestamp: Date.now() });
// //     };

// //     const renderMedia = (files) => {
// //         if (!files || files.length === 0) return null;

// //         return (
// //             <div className="grid grid-cols-4 gap-2 mt-2">
// //                 {files.map((file, index) => (
// //                     <a
// //                         key={index}
// //                         href={file}
// //                         target="_blank"
// //                         rel="noopener noreferrer"
// //                         className="relative w-20 h-20 border border-gray-300 rounded-lg overflow-hidden cursor-pointer flex items-center justify-center bg-white"
// //                     >
// //                         {file.endsWith('.jpg') || file.endsWith('.png') || file.endsWith('.gif') ? (
// //                             <img src={file} alt="Media" className="object-cover h-full w-full rounded-lg" />
// //                         ) : (
// //                             <span className="text-sm flex items-center justify-center h-full text-gray-600">File</span>
// //                         )}
// //                     </a>
// //                 ))}
// //             </div>
// //         );
// //     };
   
// //     return (
// //         <div className="flex flex-col h-screen bg-gray-100">
// //             <div className="flex-none p-4 bg-white border-b border-gray-300">
// //                 <div>
// //                     <h2 className="text-xl text-center">{otherUser.name}</h2>
// //                     <p className="text-sm text-center">{lastSeen ? 'Last seen: ' + lastSeen : 'Offline'}</p>
// //                 </div>
    
// //                 {/* Three Dots Menu */}
// //                 <div className="relative">
// //                     <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="text-gray-500 hover:text-gray-700">
// //                         •••
// //                     </button>
// //                     {isMenuOpen && (
// //                         <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-300 rounded shadow-lg z-10">
// //                             <button
// //                                 onClick={() => alert('Select Pesan')} // Replace with actual action
// //                                 className="block px-4 py-2 text-sm hover:bg-gray-100 w-full text-left"
// //                             >
// //                                 Select Pesan
// //                             </button>
// //                             <button
// //                                 onClick={() => saveSettings({ bubbleColor: 'bg-blue-100', textColor: 'text-blue-900' })}
// //                                 className="block px-4 py-2 text-sm hover:bg-gray-100 w-full text-left"
// //                             >
// //                                 Ubah Warna (Blue)
// //                             </button>
// //                             <button
// //                                 onClick={() => saveSettings({ bubbleColor: 'bg-green-100', textColor: 'text-green-900' })}
// //                                 className="block px-4 py-2 text-sm hover:bg-gray-100 w-full text-left"
// //                             >
// //                                 Ubah Gelembung Chat (Green)
// //                             </button>
// //                             {/* Add more color options as needed */}
// //                         </div>
// //                     )}
// //                 </div>
// //             </div>
    
// //             <div className="flex-1 p-4 overflow-y-auto">
// //                 <div className="flex flex-col space-y-4">
// //                     {messages.map((msg, index) => (
// //                         <div key={index} className={`flex ${msg.sender === user.id ? 'justify-end' : 'justify-start'} mb-2`}>
// //                             <div className={`p-2 rounded-lg ${msg.sender === user.id ? `${chatBubbleColor} ${chatTextColor}` : 'bg-gray-200 text-black'}`}>
// //                                 {msg.text && <p className={`${msg.sender === user.id ? chatTextColor : 'text-black'}`}>{msg.text}</p>}
// //                                 {renderMedia(msg.files)}
// //                             </div>
// //                         </div>
// //                     ))}
// //                 </div>
// //             </div>
    
// //             <div className="flex-none p-4 bg-white border-t border-gray-300">
// //                 <textarea
// //                     value={messageText}
// //                     onChange={(e) => setMessageText(e.target.value)}
// //                     placeholder="Type your message..."
// //                     className="w-full border border-gray-300 p-2 rounded-lg"
// //                 />
// //                 <input type="file" multiple onChange={handleFileChange} className="mt-2" />
// //                 <button onClick={sendMessage} className="mt-2 bg-blue-500 text-white p-2 rounded-lg" disabled={uploading}>
// //                     {uploading ? 'Sending...' : 'Send'}
// //                 </button>
// //             </div>
// //         </div>
// //     );
// // };

// // export default Chat;
