"use client"; // Enable client-side rendering
import React, { useState, useEffect } from 'react';
import { database, storage } from '../config/firebase'; // Pastikan Anda sudah mengkonfigurasi Firebase Storage
import { ref, onValue, push, update } from 'firebase/database';
import { uploadBytes, getDownloadURL } from 'firebase/storage';
import 'tailwindcss/tailwind.css';

const Chat = ({ user }) => {
    const otherUser = user.id === 'user1' ? { id: 'user2', name: 'User 2' } : { id: 'user1', name: 'User 1' };

    const [messages, setMessages] = useState([]);
    const [messageText, setMessageText] = useState('');
    const [selectedFiles, setSelectedFiles] = useState([]);
    const [uploadingFiles, setUploadingFiles] = useState([]); // State untuk menyimpan status upload file
    const [lastSeen, setLastSeen] = useState(null); // State untuk menyimpan waktu terakhir dilihat

    // Fetch messages from Firebase on component mount
    useEffect(() => {
        const messagesRef = ref(database, `messages/${user.id}/${otherUser.id}`);
        onValue(messagesRef, (snapshot) => {
            const data = snapshot.val();
            const loadedMessages = data ? Object.values(data) : [];
            setMessages(loadedMessages);

            // Mark all messages as read when the user views the chat
            loadedMessages.forEach((msg) => {
                if (!msg.read && msg.sender !== user.id) {
                    update(ref(database, `messages/${user.id}/${otherUser.id}/${msg.id}`), { read: true });
                    update(ref(database, `messages/${otherUser.id}/${user.id}/${msg.id}`), { read: true });
                }
            });
        });

        // Set last seen status
        const lastSeenRef = ref(database, `lastSeen/${user.id}`);
        onValue(lastSeenRef, (snapshot) => {
            setLastSeen(snapshot.val());
        });

        // Update last seen when user is active
        update(lastSeenRef, { timestamp: Date.now() });
    }, [user.id, otherUser.id]);

    // Handle file selection
    const handleFileChange = (event) => {
        const files = Array.from(event.target.files);
        setSelectedFiles((prevFiles) => [...prevFiles, ...files]);
    };

    // Remove a selected file
    const removeFile = (index) => {
        setSelectedFiles((prevFiles) => prevFiles.filter((_, i) => i !== index));
        setUploadingFiles((prevUploads) => prevUploads.filter((_, i) => i !== index)); // Hapus status upload yang sesuai
    };

    // Function to send a new message
    const sendMessage = async () => {
        if (messageText.trim() === "" && selectedFiles.length === 0) return; // Prevent sending empty messages

        const messagesRef = ref(database, `messages/${user.id}/${otherUser.id}`);
        const newMessage = {
            text: messageText,
            sender: user.id,
            timestamp: Date.now(),
            read: false,
            files: [],
        };

        // Update the state to show loading for each file
        const loadingStatus = Array(selectedFiles.length).fill(true);
        setUploadingFiles(loadingStatus);

        // Upload selected files to Firebase Storage
        const uploadedFiles = await Promise.all(selectedFiles.map(async (file, index) => {
            const storageRef = ref(storage, `chatFiles/${file.name}`);
            await uploadBytes(storageRef, file);
            const url = await getDownloadURL(storageRef);
            // Update the loading status for the uploaded file
            loadingStatus[index] = false;
            setUploadingFiles([...loadingStatus]); // Update loading state
            return url;
        }));

        // Update newMessage with uploaded file URLs
        newMessage.files = uploadedFiles;

        // Push message to Firebase Database
        await push(messagesRef, newMessage);
        setMessageText(''); // Clear input after sending
        setSelectedFiles([]); // Clear selected files
        setUploadingFiles([]); // Clear uploading status

        // Update the recipient's message status
        const recipientRef = ref(database, `messages/${otherUser.id}/${user.id}`);
        await push(recipientRef, newMessage);
    };

    const renderMedia = (files) => {
        if (!files || files.length === 0) return null;

        const visibleFiles = files.slice(0, 3);
        const extraFiles = files.length - visibleFiles.length;

        return (
            <div className="flex flex-wrap mt-1">
                {visibleFiles.map((file, index) => (
                    <img
                        key={index}
                        src={file}
                        alt="Media"
                        className="w-20 h-20 object-cover rounded-lg m-1"
                    />
                ))}
                {extraFiles > 0 && (
                    <div className="w-20 h-20 bg-gray-200 flex items-center justify-center rounded-lg m-1">
                        +{extraFiles}
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="flex flex-col h-screen bg-gray-100">
            <div className="flex-none p-4 bg-white border-b border-gray-300">
                <h2 className="text-xl text-center">{otherUser.name}</h2>
                {lastSeen && (
                    <p className="text-sm text-gray-500 text-center">
                        Last seen: {new Date(lastSeen.timestamp).toLocaleString()}
                    </p>
                )}
            </div>
            <div className="flex-1 overflow-y-auto p-4">
                {/* Display messages */}
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
                            {msg.sender !== user.id && (
                                <span className="ml-2">
                                    {msg.read ? (
                                        <span className="text-blue-500">✔✔</span>
                                    ) : (
                                        <span>✔✔</span>
                                    )}
                                </span>
                            )}
                        </div>
                    </div>
                ))}
                {/* Tampilkan gambar yang sedang diupload */}
                {selectedFiles.map((file, index) => (
                    <div key={index} className="flex items-center mb-2">
                        <img
                            src={URL.createObjectURL(file)}
                            alt="Uploading"
                            className="w-20 h-20 object-cover rounded-lg"
                        />
                        {uploadingFiles[index] && (
                            <span className="ml-2 text-sm text-gray-500">Uploading...</span>
                        )}
                    </div>
                ))}
            </div>
            <div className="flex items-center p-4 border-t border-gray-300">
                <input
                    type="file"
                    multiple
                    accept="image/*,video/*"
                    className="hidden"
                    id="fileInput"
                    onChange={handleFileChange}
                />
                <label htmlFor="fileInput" className="cursor-pointer flex items-center">
                    <span className="material-icons">attach_file</span> {/* Ganti dengan ikon klip */}
                </label>
                <input
                    type="text"
                    className="border rounded-lg p-2 flex-1 mx-2"
                    placeholder="Type a message..."
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                />
                <button
                    className="ml-2 p-2 bg-blue-500 text-white rounded-lg"
                    onClick={sendMessage}
                >
                    Send
                </button>
            </div>
        </div>
    );
};

export default Chat;

// "use client"; // Enable client-side rendering
// import React, { useState, useEffect } from 'react';
// import { database, storage } from '../config/firebase'; // Pastikan Anda sudah mengkonfigurasi Firebase Storage
// import { ref, onValue, push, update, remove } from 'firebase/database';
// import { uploadBytes, getDownloadURL } from 'firebase/storage';
// import 'tailwindcss/tailwind.css';

// const Chat = ({ user }) => {
//     const otherUser = user.id === 'user1' ? { id: 'user2', name: 'User 2' } : { id: 'user1', name: 'User 1' };

//     const [messages, setMessages] = useState([]);
//     const [messageText, setMessageText] = useState('');
//     const [selectedFiles, setSelectedFiles] = useState([]);
//     const [uploadingFiles, setUploadingFiles] = useState([]); // State untuk menyimpan status upload file
//     const [lastSeen, setLastSeen] = useState(null); // State untuk menyimpan waktu terakhir dilihat
//     const [editingMessageId, setEditingMessageId] = useState(null); // State untuk menyimpan ID pesan yang sedang diedit

//     // Fetch messages from Firebase on component mount
//     useEffect(() => {
//         const messagesRef = ref(database, `messages/${user.id}/${otherUser.id}`);
//         onValue(messagesRef, (snapshot) => {
//             const data = snapshot.val();
//             const loadedMessages = data ? Object.values(data) : [];
//             setMessages(loadedMessages);

//             // Mark all messages as read when the user views the chat
//             loadedMessages.forEach((msg) => {
//                 if (!msg.read && msg.sender !== user.id) {
//                     update(ref(database, `messages/${user.id}/${otherUser.id}/${msg.id}`), { read: true });
//                     update(ref(database, `messages/${otherUser.id}/${user.id}/${msg.id}`), { read: true });
//                 }
//             });
//         });

//         // Set last seen status
//         const lastSeenRef = ref(database, `lastSeen/${user.id}`);
//         onValue(lastSeenRef, (snapshot) => {
//             setLastSeen(snapshot.val());
//         });

//         // Update last seen when user is active
//         update(lastSeenRef, { timestamp: Date.now() });
//     }, [user.id, otherUser.id]);

//     // Handle file selection
//     const handleFileChange = (event) => {
//         const files = Array.from(event.target.files);
//         setSelectedFiles((prevFiles) => [...prevFiles, ...files]);
//     };

//     // Remove a selected file
//     const removeFile = (index) => {
//         setSelectedFiles((prevFiles) => prevFiles.filter((_, i) => i !== index));
//         setUploadingFiles((prevUploads) => prevUploads.filter((_, i) => i !== index)); // Hapus status upload yang sesuai
//     };

//     // Function to send a new message
//     const sendMessage = async () => {
//         if (messageText.trim() === "" && selectedFiles.length === 0) return; // Prevent sending empty messages

//         const messagesRef = ref(database, `messages/${user.id}/${otherUser.id}`);
//         const newMessage = {
//             text: messageText,
//             sender: user.id,
//             timestamp: Date.now(),
//             read: false,
//             files: [],
//         };

//         // Update the state to show loading for each file
//         const loadingStatus = Array(selectedFiles.length).fill(true);
//         setUploadingFiles(loadingStatus);

//         // Upload selected files to Firebase Storage
//         const uploadedFiles = await Promise.all(selectedFiles.map(async (file, index) => {
//             const storageRef = ref(storage, `chatFiles/${file.name}`);
//             await uploadBytes(storageRef, file);
//             const url = await getDownloadURL(storageRef);
//             // Update the loading status for the uploaded file
//             loadingStatus[index] = false;
//             setUploadingFiles([...loadingStatus]); // Update loading state
//             return url;
//         }));

//         // Update newMessage with uploaded file URLs
//         newMessage.files = uploadedFiles;

//         // Push message to Firebase Database
//         await push(messagesRef, newMessage);
//         setMessageText(''); // Clear input after sending
//         setSelectedFiles([]); // Clear selected files
//         setUploadingFiles([]); // Clear uploading status

//         // Update the recipient's message status
//         const recipientRef = ref(database, `messages/${otherUser.id}/${user.id}`);
//         await push(recipientRef, newMessage);
//     };

//     // Handle message edit
//     const handleEditMessage = async (id) => {
//         const messageToEdit = messages.find((msg) => msg.id === id);
//         setMessageText(messageToEdit.text);
//         setEditingMessageId(id);
//     };

//     // Function to update the edited message
//     const updateMessage = async () => {
//         if (editingMessageId) {
//             const messageRef = ref(database, `messages/${user.id}/${otherUser.id}/${editingMessageId}`);
//             await update(messageRef, { text: messageText });
//             setMessageText(''); // Clear input after updating
//             setEditingMessageId(null); // Reset editing state
//         }
//     };

//     // Function to delete a message
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
//                     <img
//                         key={index}
//                         src={file}
//                         alt="Media"
//                         className="w-20 h-20 object-cover rounded-lg m-1"
//                     />
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
//                         Last seen: {new Date(lastSeen.timestamp).toLocaleString()}
//                     </p>
//                 )}
//             </div>
//             <div className="flex-1 overflow-y-auto p-4">
//                 {/* Display messages */}
//                 {messages.map((msg, index) => (
//                     <div key={index} className={`mb-2 ${msg.sender === user.id ? 'text-right' : 'text-left'}`}>
//                         <div 
//                             className={`inline-block p-2 rounded-lg ${msg.sender === user.id ? 'bg-blue-500 text-white' : 'bg-gray-300'}`}
//                             onContextMenu={(e) => {
//                                 e.preventDefault();
//                                 if (msg.sender === user.id) {
//                                     handleEditMessage(msg.id); // Enable editing for the message
//                                 } else {
//                                     deleteMessage(msg.id); // Delete message for others
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
//                 {/* Tampilkan gambar yang sedang diupload */}
//                 {selectedFiles.map((file, index) => (
//                     <div key={index} className="flex items-center mb-2">
//                         <img
//                             src={URL.createObjectURL(file)}
//                             alt="Uploading"
//                             className="w-20 h-20 object-cover rounded-lg"
//                         />
//                         {uploadingFiles[index] && (
//                             <span className="ml-2 text-sm text-gray-500">Uploading...</span>
//                         )}
//                     </div>
//                 ))}
//             </div>
//             <div className="flex items-center p-4 border-t border-gray-300">
//                 <input
//                     type="file"
//                     multiple
//                     accept="image/*,video/*"
//                     onChange={handleFileChange}
//                     className="hidden"
//                     id="file-input"
//                 />
//                 // <label htmlFor="file-input" className="cursor-pointer">
//                 //     <span className="material-icons">attach_file</span>
//                 // </label>
//                     <label htmlFor="file-input" className="mr-2 cursor-pointer">
//                         <span className="text-gray-600 hover:text-blue-500">📎</span>
//                     </label>
//                 <input
//                     type="text"
//                     value={messageText}
//                     onChange={(e) => setMessageText(e.target.value)}
//                     placeholder="Type a message..."
//                     className="flex-1 p-2 border border-gray-300 rounded-lg mx-2"
//                 />
//                 <button
//                     onClick={editingMessageId ? updateMessage : sendMessage}
//                     className="bg-blue-500 text-white rounded-lg px-4 py-2"
//                 >
//                     {editingMessageId ? 'Update' : 'Send'}
//                 </button>
//             </div>
//         </div>
//     );
// };

// export default Chat;
