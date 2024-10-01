// src/app/components/Chat.js
import React, { useState, useEffect } from 'react';
import Message from './Message';
import ContactList from './ContactList';
import { database } from '../firebase'; // Pastikan sudah mengkonfigurasi Firebase
import { ref, onValue, push } from 'firebase/database';

const Chat = ({ userId }) => {
    const [contacts, setContacts] = useState([]);
    const [selectedContact, setSelectedContact] = useState(null);
    const [messages, setMessages] = useState([]);
    const [messageText, setMessageText] = useState('');

    // Mengambil daftar kontak dari database (ganti dengan logika sesuai kebutuhan)
    useEffect(() => {
        const fetchContacts = async () => {
            // Ganti ini dengan pengambilan kontak dari database
            const fetchedContacts = [
                { id: 'user1', name: 'Alice' },
                { id: 'user2', name: 'Bob' },
            ];
            setContacts(fetchedContacts);
        };

        fetchContacts();
    }, []);

    // Mengambil pesan ketika kontak dipilih
    useEffect(() => {
        if (selectedContact) {
            const messagesRef = ref(database, `messages/${userId}/${selectedContact.id}`);
            onValue(messagesRef, (snapshot) => {
                const data = snapshot.val();
                if (data) {
                    setMessages(Object.values(data)); // Mengubah objek menjadi array
                } else {
                    setMessages([]); // Jika tidak ada pesan
                }
            });
        }
    }, [selectedContact, userId]);

    // Fungsi untuk mengirim pesan
    const sendMessage = async () => {
        if (!selectedContact || messageText.trim() === '') return;

        const messagesRef = ref(database, `messages/${userId}/${selectedContact.id}`);
        const newMessage = {
            text: messageText,
            sender: userId,
            timestamp: Date.now(),
            read: false, // Atur status baca sesuai logika
        };

        await push(messagesRef, newMessage);
        setMessageText('');
    };

    return (
        <div className="flex h-screen">
            {/* Daftar Kontak */}
            <div className="w-1/4 border-r border-gray-300 p-4">
                <h2 className="text-lg font-bold">Contacts</h2>
                <ContactList contacts={contacts} setSelectedContact={setSelectedContact} />
            </div>
            {/* Komponen Chat */}
            <div className="flex-1 p-4">
                {selectedContact ? (
                    <>
                        <h1 className="text-2xl font-bold mb-4">{selectedContact.name}</h1>
                        <div className="flex-1 overflow-y-auto p-4 border border-gray-300 rounded-lg mb-4">
                            {messages.map((msg, index) => (
                                <Message key={index} message={msg} userId={userId} />
                            ))}
                        </div>
                        <div className="flex">
                            <input
                                type="text"
                                value={messageText}
                                onChange={(e) => setMessageText(e.target.value)}
                                className="border rounded px-4 py-2 flex-1"
                                placeholder="Type a message..."
                            />
                            <button
                                onClick={sendMessage}
                                className="bg-blue-500 text-white px-4 py-2 rounded ml-2"
                            >
                                Send
                            </button>
                        </div>
                    </>
                ) : (
                    <div className="text-center">
                        <p className="text-gray-500">Select a contact to start chatting.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Chat;

// "use client"; // Enable client-side rendering
// import React, { useState, useEffect } from 'react';
// import { database, storage } from '../config/firebase';
// import { ref, onValue, push, update, remove } from 'firebase/database';
// import { uploadBytes, getDownloadURL } from 'firebase/storage';
// import 'tailwindcss/tailwind.css';

// const Chat = ({ user }) => {
//     const otherUser = user.id === 'user1' ? { id: 'user2', name: 'User 2' } : { id: 'user1', name: 'User 1' };

//     const [messages, setMessages] = useState([]);
//     const [messageText, setMessageText] = useState('');
//     const [selectedFiles, setSelectedFiles] = useState([]);
//     const [uploadingFiles, setUploadingFiles] = useState([]); // State for file upload status
//     const [lastSeen, setLastSeen] = useState(null);
//     const [editingMessageId, setEditingMessageId] = useState(null);
//     const [isTyping, setIsTyping] = useState(false);
//     const [isUploading, setIsUploading] = useState(false);
//     const [isSending, setIsSending] = useState(false); // New state for button loading

//     useEffect(() => {
//         const messagesRef = ref(database, `messages/${user.id}/${otherUser.id}`);
//         onValue(messagesRef, (snapshot) => {
//             const data = snapshot.val();
//             const loadedMessages = data ? Object.values(data) : [];
//             setMessages(loadedMessages);

//             loadedMessages.forEach((msg) => {
//                 if (!msg.read && msg.sender !== user.id) {
//                     update(ref(database, `messages/${user.id}/${otherUser.id}/${msg.id}`), { read: true });
//                     update(ref(database, `messages/${otherUser.id}/${user.id}/${msg.id}`), { read: true });
//                 }
//             });
//         });

//         const lastSeenRef = ref(database, `lastSeen/${user.id}`);
//         onValue(lastSeenRef, (snapshot) => {
//             setLastSeen(snapshot.val());
//         });

//         const updateLastSeen = () => {
//             if (isTyping) {
//                 update(lastSeenRef, { status: "Online", timestamp: Date.now() });
//             } else {
//                 update(lastSeenRef, { status: "Last Seen", timestamp: Date.now() });
//             }
//         };

//         const typingInterval = setInterval(updateLastSeen, 5000);

//         return () => clearInterval(typingInterval);
//     }, [user.id, otherUser.id, isTyping]);

//     const handleFileChange = (event) => {
//         const files = Array.from(event.target.files);
//         setSelectedFiles((prevFiles) => [...prevFiles, ...files]);
//     };

//     const removeFile = (index) => {
//         setSelectedFiles((prevFiles) => prevFiles.filter((_, i) => i !== index));
//         setUploadingFiles((prevUploads) => prevUploads.filter((_, i) => i !== index));
//     };

//     const sendMessage = async () => {
//         if (messageText.trim() === "" && selectedFiles.length === 0) return;

//         setIsSending(true); // Set button to loading state

//         const messagesRef = ref(database, `messages/${user.id}/${otherUser.id}`);
//         const newMessage = {
//             text: messageText,
//             sender: user.id,
//             timestamp: Date.now(),
//             read: false,
//             files: [],
//         };

//         if (selectedFiles.length > 0) {
//             setIsUploading(true);
//             const uploadedFiles = await Promise.all(selectedFiles.map(async (file) => {
//                 const storageRef = ref(storage, `chatFiles/${file.name}`);
//                 await uploadBytes(storageRef, file);
//                 const url = await getDownloadURL(storageRef);
//                 return url;
//             }));
//             newMessage.files = uploadedFiles;
//             setIsUploading(false);
//             setSelectedFiles([]);
//         }

//         await push(messagesRef, newMessage);
//         setMessageText('');

//         const recipientRef = ref(database, `messages/${otherUser.id}/${user.id}`);
//         await push(recipientRef, newMessage);

//         setIsSending(false); // Reset button loading state
//     };

//     const handleEditMessage = (id) => {
//         const messageToEdit = messages.find((msg) => msg.id === id);
//         setMessageText(messageToEdit.text);
//         setEditingMessageId(id);
//     };

//     const updateMessage = async () => {
//         if (editingMessageId) {
//             const messageRef = ref(database, `messages/${user.id}/${otherUser.id}/${editingMessageId}`);
//             await update(messageRef, { text: messageText });
//             setMessageText('');
//             setEditingMessageId(null);
//         }
//     };

//     const deleteMessage = async (id) => {
//         const messageRef = ref(database, `messages/${user.id}/${otherUser.id}/${id}`);
//         await remove(messageRef);
//     };

//     const renderMedia = (files) => {
//         if (!files || files.length === 0) return null;

//         const visibleFiles = files.slice(0, 3);
//         const extraFiles = files.length - visibleFiles.length;

//         return (
//             <div className="flex flex-wrap mt-1">
//                 {visibleFiles.map((file, index) => (
//                     <div key={index} className="relative">
//                         <img src={file} alt="Media" className="w-20 h-20 object-cover rounded-lg m-1" />
//                         <button
//                             onClick={() => removeFile(index)}
//                             className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1"
//                         >
//                             X
//                         </button>
//                     </div>
//                 ))}
//                 {extraFiles > 0 && (
//                     <div className="w-20 h-20 bg-gray-200 flex items-center justify-center rounded-lg m-1">
//                         +{extraFiles}
//                     </div>
//                 )}
//             </div>
//         );
//     };

//     return (
//         <div className="flex flex-col h-screen bg-gray-100">
//             <div className="flex-none p-4 bg-white border-b border-gray-300">
//                 <h2 className="text-xl text-center">{otherUser.name}</h2>
//                 {lastSeen && (
//                     <p className="text-sm text-gray-500 text-center">
//                         {lastSeen.status} (Last seen: {new Date(lastSeen.timestamp).toLocaleString()})
//                     </p>
//                 )}
//             </div>
//             <div className="flex-1 overflow-y-auto p-4">
//                 {messages.map((msg, index) => (
//                     <div key={index} className={`mb-2 ${msg.sender === user.id ? 'text-right' : 'text-left'}`}>
//                         <div 
//                             className={`inline-block p-2 rounded-lg ${msg.sender === user.id ? 'bg-blue-500 text-white' : 'bg-gray-300'}`}
//                             onContextMenu={(e) => {
//                                 e.preventDefault();
//                                 if (msg.sender === user.id) {
//                                     handleEditMessage(msg.id);
//                                 } else {
//                                     deleteMessage(msg.id);
//                                 }
//                             }}
//                         >
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
//                             {msg.sender !== user.id && (
//                                 <span className="ml-2">
//                                     {msg.read ? (
//                                         <span className="text-blue-500">✔✔</span>
//                                     ) : (
//                                         <span>✔✔</span>
//                                     )}
//                                 </span>
//                             )}
//                         </div>
//                     </div>
//                 ))}
//             </div>
//             <div className="flex-none p-4 border-t border-gray-300 flex items-center">
//                 <input
//                     type="file"
//                     accept="image/*,video/*"
//                     onChange={handleFileChange}
//                     className="hidden"
//                     id="file-input"
//                     multiple
//                 />
//                 <label htmlFor="file-input" className="bg-gray-200 rounded-lg px-4 py-2 cursor-pointer">
//                     📎
//                 </label>
//                 {renderMedia(selectedFiles)}
//                 <input
//                     type="text"
//                     value={messageText}
//                     onChange={(e) => {
//                         setMessageText(e.target.value);
//                         setIsTyping(true);
//                     }}
//                     placeholder="Type a message..."
//                     className="flex-1 p-2 border border-gray-300 rounded-lg mx-2"
//                 />
//                 <button
//                     onClick={editingMessageId ? updateMessage : sendMessage}
//                     className="bg-blue-500 text-white rounded-lg px-4 py-2"
//                     disabled={isSending || isUploading} // Disable button during upload
//                 >
//                     {isSending ? 'Sending...' : editingMessageId ? 'Update' : 'Send'}
//                 </button>
//             </div>
//         </div>
//     );
// };

// export default Chat;

// // "use client"; // Enable client-side rendering
// // import React, { useState, useEffect } from 'react';
// // import { database, storage } from '../config/firebase'; // Pastikan Anda sudah mengkonfigurasi Firebase Storage
// // import { ref, onValue, push, update, remove } from 'firebase/database';
// // import { uploadBytes, getDownloadURL } from 'firebase/storage';
// // import 'tailwindcss/tailwind.css';

// // const Chat = ({ user }) => {
// //     const otherUser = user.id === 'user1' ? { id: 'user2', name: 'User 2' } : { id: 'user1', name: 'User 1' };

// //     const [messages, setMessages] = useState([]);
// //     const [messageText, setMessageText] = useState('');
// //     const [selectedFiles, setSelectedFiles] = useState([]);
// //     const [uploadingFiles, setUploadingFiles] = useState([]); // State untuk menyimpan status upload file
// //     const [lastSeen, setLastSeen] = useState(null); // State untuk menyimpan waktu terakhir dilihat
// //     const [editingMessageId, setEditingMessageId] = useState(null); // State untuk menyimpan ID pesan yang sedang diedit
// //     const [isTyping, setIsTyping] = useState(false); // State untuk menyimpan status mengetik
// //     const [isUploading, setIsUploading] = useState(false); // State untuk menyimpan status upload

// //     // Fetch messages from Firebase on component mount
// //     useEffect(() => {
// //         const messagesRef = ref(database, `messages/${user.id}/${otherUser.id}`);
// //         onValue(messagesRef, (snapshot) => {
// //             const data = snapshot.val();
// //             const loadedMessages = data ? Object.values(data) : [];
// //             setMessages(loadedMessages);

// //             // Mark all messages as read when the user views the chat
// //             loadedMessages.forEach((msg) => {
// //                 if (!msg.read && msg.sender !== user.id) {
// //                     update(ref(database, `messages/${user.id}/${otherUser.id}/${msg.id}`), { read: true });
// //                     update(ref(database, `messages/${otherUser.id}/${user.id}/${msg.id}`), { read: true });
// //                 }
// //             });
// //         });

// //         // Set last seen status
// //         const lastSeenRef = ref(database, `lastSeen/${user.id}`);
// //         onValue(lastSeenRef, (snapshot) => {
// //             setLastSeen(snapshot.val());
// //         });

// //         // Update last seen when user is active
// //         const updateLastSeen = () => {
// //             if (isTyping) {
// //                 update(lastSeenRef, { status: "Online", timestamp: Date.now() });
// //             } else {
// //                 update(lastSeenRef, { status: "Last Seen", timestamp: Date.now() });
// //             }
// //         };

// //         // Check typing status
// //         const typingInterval = setInterval(updateLastSeen, 5000); // Update every 5 seconds

// //         return () => clearInterval(typingInterval); // Clean up interval on unmount
// //     }, [user.id, otherUser.id, isTyping]);

// //     // Handle file selection
// //     const handleFileChange = (event) => {
// //         const files = Array.from(event.target.files);
// //         setSelectedFiles((prevFiles) => [...prevFiles, ...files]);
// //     };

// //     // Remove a selected file
// //     const removeFile = (index) => {
// //         setSelectedFiles((prevFiles) => prevFiles.filter((_, i) => i !== index));
// //         setUploadingFiles((prevUploads) => prevUploads.filter((_, i) => i !== index)); // Hapus status upload yang sesuai
// //     };

// //     // Function to send a new message
// //     const sendMessage = async () => {
// //         if (messageText.trim() === "" && selectedFiles.length === 0) return; // Prevent sending empty messages

// //         const messagesRef = ref(database, `messages/${user.id}/${otherUser.id}`);
// //         const newMessage = {
// //             text: messageText,
// //             sender: user.id,
// //             timestamp: Date.now(),
// //             read: false,
// //             files: [],
// //         };

// //         // Update newMessage with uploaded file URLs
// //         if (selectedFiles.length > 0) {
// //             setIsUploading(true); // Set uploading status to true
// //             const uploadedFiles = await Promise.all(selectedFiles.map(async (file) => {
// //                 const storageRef = ref(storage, `chatFiles/${file.name}`);
// //                 await uploadBytes(storageRef, file);
// //                 const url = await getDownloadURL(storageRef);
// //                 return url;
// //             }));
// //             newMessage.files = uploadedFiles;
// //             setIsUploading(false); // Reset uploading status
// //             setSelectedFiles([]); // Clear selected files after upload
// //         }

// //         // Push message to Firebase Database
// //         await push(messagesRef, newMessage);
// //         setMessageText(''); // Clear input after sending

// //         // Update the recipient's message status
// //         const recipientRef = ref(database, `messages/${otherUser.id}/${user.id}`);
// //         await push(recipientRef, newMessage);
// //     };

// //     // Handle message edit
// //     const handleEditMessage = async (id) => {
// //         const messageToEdit = messages.find((msg) => msg.id === id);
// //         setMessageText(messageToEdit.text);
// //         setEditingMessageId(id);
// //     };

// //     // Function to update the edited message
// //     const updateMessage = async () => {
// //         if (editingMessageId) {
// //             const messageRef = ref(database, `messages/${user.id}/${otherUser.id}/${editingMessageId}`);
// //             await update(messageRef, { text: messageText });
// //             setMessageText(''); // Clear input after updating
// //             setEditingMessageId(null); // Reset editing state
// //         }
// //     };

// //     // Function to delete a message
// //     const deleteMessage = async (id) => {
// //         const messageRef = ref(database, `messages/${user.id}/${otherUser.id}/${id}`);
// //         await remove(messageRef);
// //     };

// //     const renderMedia = (files) => {
// //         if (!files || files.length === 0) return null;

// //         const visibleFiles = files.slice(0, 3);
// //         const extraFiles = files.length - visibleFiles.length;

// //         return (
// //             <div className="flex flex-wrap mt-1">
// //                 {visibleFiles.map((file, index) => (
// //                     <div key={index} className="relative">
// //                         <img
// //                             src={file}
// //                             alt="Media"
// //                             className="w-20 h-20 object-cover rounded-lg m-1"
// //                         />
// //                         <button
// //                             onClick={() => removeFile(index)}
// //                             className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1"
// //                         >
// //                             X
// //                         </button>
// //                     </div>
// //                 ))}
// //                 {extraFiles > 0 && (
// //                     <div className="w-20 h-20 bg-gray-200 flex items-center justify-center rounded-lg m-1">
// //                         +{extraFiles}
// //                     </div>
// //                 )}
// //             </div>
// //         );
// //     };

// //     return (
// //         <div className="flex flex-col h-screen bg-gray-100">
// //             <div className="flex-none p-4 bg-white border-b border-gray-300">
// //                 <h2 className="text-xl text-center">{otherUser.name}</h2>
// //                 {lastSeen && (
// //                     <p className="text-sm text-gray-500 text-center">
// //                         {lastSeen.status} (Last seen: {new Date(lastSeen.timestamp).toLocaleString()})
// //                     </p>
// //                 )}
// //             </div>
// //             <div className="flex-1 overflow-y-auto p-4">
// //                 {/* Display messages */}
// //                 {messages.map((msg, index) => (
// //                     <div key={index} className={`mb-2 ${msg.sender === user.id ? 'text-right' : 'text-left'}`}>
// //                         <div 
// //                             className={`inline-block p-2 rounded-lg ${msg.sender === user.id ? 'bg-blue-500 text-white' : 'bg-gray-300'}`}
// //                             onContextMenu={(e) => {
// //                                 e.preventDefault();
// //                                 if (msg.sender === user.id) {
// //                                     handleEditMessage(msg.id); // Enable editing for the message
// //                                 } else {
// //                                     deleteMessage(msg.id); // Delete message for others
// //                                 }
// //                             }}
// //                         >
// //                             {msg.text}
// //                             {renderMedia(msg.files)}
// //                         </div>
// //                         <div className="text-xs text-gray-500 flex justify-end items-center">
// //                             {new Date(msg.timestamp).toLocaleTimeString()}
// //                             {msg.sender === user.id && (
// //                                 <span className="ml-2">
// //                                     {msg.read ? (
// //                                         <span className="text-blue-500">✔✔</span>
// //                                     ) : (
// //                                         <span>✔</span>
// //                                     )}
// //                                 </span>
// //                             )}
// //                             {msg.sender !== user.id && (
// //                                 <span className="ml-2">
// //                                     {msg.read ? (
// //                                         <span className="text-blue-500">✔✔</span>
// //                                     ) : (
// //                                         <span>✔✔</span>
// //                                     )}
// //                                 </span>
// //                             )}
// //                         </div>
// //                     </div>
// //                 ))}
// //             </div>
// //             <div className="flex-none p-4 border-t border-gray-300 flex items-center">
// //                 <input
// //                     type="file"
// //                     accept="image/*,video/*"
// //                     onChange={handleFileChange}
// //                     className="hidden"
// //                     id="file-input"
// //                     multiple
// //                 />
// //                 <label htmlFor="file-input" className="bg-gray-200 rounded-lg px-4 py-2 cursor-pointer">
// //                     📎
// //                 </label>
// //                 {renderMedia(selectedFiles)} {/* Render selected files */}
// //                 <input
// //                     type="text"
// //                     value={messageText}
// //                     onChange={(e) => {
// //                         setMessageText(e.target.value);
// //                         setIsTyping(true); // Set typing status to true
// //                     }}
// //                     placeholder="Type a message..."
// //                     className="flex-1 p-2 border border-gray-300 rounded-lg mx-2"
// //                 />
// //                 <button
// //                     onClick={editingMessageId ? updateMessage : sendMessage}
// //                     className="bg-blue-500 text-white rounded-lg px-4 py-2"
// //                 >
// //                     {editingMessageId ? 'Update' : 'Send'}
// //                 </button>
// //             </div>
// //         </div>
// //     );
// // };

// // export default Chat;
