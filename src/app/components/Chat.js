export default Chat;"use client"; // Enable client-side rendering
import React, { useState, useEffect } from 'react';
import { database, storage } from '../config/firebase';
import { ref, onValue, push, update, onDisconnect } from 'firebase/database';
import { uploadBytes, getDownloadURL, ref as storageRef } from 'firebase/storage';
import 'tailwindcss/tailwind.css';

const Chat = ({ user }) => {
    const otherUser = user.id === 'user1' ? { id: 'user2', name: 'User 2' } : { id: 'user1', name: 'User 1' };

    const [messages, setMessages] = useState([]);
    const [messageText, setMessageText] = useState('');
    const [files, setFiles] = useState([]);
    const [previews, setPreviews] = useState([]);
    const [isUploading, setIsUploading] = useState(false);
    const [otherUserStatus, setOtherUserStatus] = useState(null);
    const [isOtherUserTyping, setIsOtherUserTyping] = useState(false);

    useEffect(() => {
        const messagesRef = ref(database, `messages/${user.id}/${otherUser.id}`);
        onValue(messagesRef, (snapshot) => {
            const data = snapshot.val();
            const loadedMessages = data ? Object.values(data) : [];
            setMessages(loadedMessages);
            loadedMessages.forEach((msg) => {
                if (!msg.read && msg.sender !== user.id) {
                    const readTimestamp = Date.now();
                    update(ref(database, `messages/${user.id}/${otherUser.id}/${msg.id}`), { read: true, readAt: readTimestamp });
                    update(ref(database, `messages/${otherUser.id}/${user.id}/${msg.id}`), { read: true, readAt: readTimestamp });
                }
            });
        });
    }, [user.id, otherUser.id]);

    useEffect(() => {
        const userStatusRef = ref(database, `status/${user.id}`);
        const typingRef = ref(database, `typing/${user.id}`);
        update(userStatusRef, { online: true, lastSeen: Date.now() });
        onDisconnect(userStatusRef).update({ online: false, lastSeen: Date.now() });

        if (messageText.trim() || files.length > 0) {
            update(typingRef, { typing: true });
        } else {
            update(typingRef, { typing: false });
        }

        const otherUserStatusRef = ref(database, `status/${otherUser.id}`);
        onValue(otherUserStatusRef, (snapshot) => {
            const status = snapshot.val();
            setOtherUserStatus(status);
        });

        const otherUserTypingRef = ref(database, `typing/${otherUser.id}`);
        onValue(otherUserTypingRef, (snapshot) => {
            const data = snapshot.val();
            setIsOtherUserTyping(data?.typing || false);
        });

        return () => {
            update(typingRef, { typing: false });
            onDisconnect(userStatusRef).cancel();
        };
    }, [messageText, files, user.id, otherUser.id]);

    const handleFileChange = (e) => {
        const selectedFiles = Array.from(e.target.files);
        setFiles([...files, ...selectedFiles]);
        const newPreviews = selectedFiles.map((file) => ({
            id: URL.createObjectURL(file),
            file,
        }));
        setPreviews([...previews, ...newPreviews]);
    };

    const removeFile = (previewId) => {
        setPreviews(previews.filter((preview) => preview.id !== previewId));
        setFiles(files.filter((file) => URL.createObjectURL(file) !== previewId));
    };

    const uploadFiles = async () => {
        const uploadPromises = files.map((file) => {
            const storageReference = storageRef(storage, `files/${user.id}/${Date.now()}_${file.name}`);
            return uploadBytes(storageReference, file).then(() => getDownloadURL(storageReference));
        });
        return await Promise.all(uploadPromises);
    };

    const sendMessage = async () => {
        if (messageText.trim() === "" && files.length === 0) return;

        const messagesRef = ref(database, `messages/${user.id}/${otherUser.id}`);
        const newMessageKey = push(messagesRef).key;

        let fileURLs = [];
        if (files.length > 0) {
            setIsUploading(true);
            fileURLs = await uploadFiles();
            setIsUploading(false);
            setFiles([]);
            setPreviews([]);
        }

        const newMessage = {
            text: messageText,
            sender: user.id,
            timestamp: Date.now(),
            read: false,
            id: newMessageKey,
            files: fileURLs,
        };

        const updates = {};
        updates[`messages/${user.id}/${otherUser.id}/${newMessageKey}`] = newMessage;
        updates[`messages/${otherUser.id}/${user.id}/${newMessageKey}`] = newMessage;

        update(ref(database), updates).then(() => {
            setMessageText('');
        });
    };

    // Render media in chat (with +X for extra media)
    const renderMedia = (files) => {
        if (files.length === 0) return null;

        const visibleFiles = files.slice(0, 3);
        const extraFiles = files.length > 3 ? files.length - 3 : 0;

        return (
            <div className="flex space-x-2">
                {visibleFiles.map((file, index) => {
                    const fileType = file.split('.').pop();
                    if (['jpg', 'jpeg', 'png', 'gif'].includes(fileType)) {
                        return (
                            <img
                                key={index}
                                src={file}
                                alt={`Media ${index + 1}`}
                                className="w-24 h-24 object-cover rounded-lg"
                            />
                        );
                    } else if (['mp4', 'webm', 'ogg'].includes(fileType)) {
                        return (
                            <video key={index} controls className="w-24 h-24 rounded-lg">
                                <source src={file} type={`video/${fileType}`} />
                                Your browser does not support the video tag.
                            </video>
                        );
                    } else {
                        return (
                            <div key={index} className="w-24 h-24 bg-gray-200 rounded-lg flex items-center justify-center">
                                <span className="text-center text-sm">File: {file.split('/').pop()}</span>
                            </div>
                        );
                    }
                })}
                {extraFiles > 0 && (
                    <div className="relative w-24 h-24 bg-gray-200 rounded-lg flex items-center justify-center">
                        <span className="text-xl font-bold">+{extraFiles}</span>
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="flex flex-col h-screen bg-gray-100">
            <div className="bg-white p-4 shadow-md sticky top-0 z-10">
                <h2 className="text-xl text-center">{otherUser.name}</h2>
                <div className="text-sm text-gray-500 text-center">
                    {otherUserStatus?.online ? (
                        <span>{otherUser.name} is online</span>
                    ) : (
                        <span>Last seen at {new Date(otherUserStatus?.lastSeen).toLocaleTimeString()}</span>
                    )}
                    {isOtherUserTyping && <span>...typing</span>}
                </div>
            </div>

            <div className="flex-1 p-4 overflow-y-scroll">
                {messages.map((message, index) => (
                    <div
                        key={index}
                        className={`mb-4 ${message.sender === user.id ? 'text-right' : 'text-left'}`}
                    >
                        <div className={`inline-block p-2 rounded-lg ${message.sender === user.id ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}>
                            <p>{message.text}</p>
                            {renderMedia(message.files)}
                        </div>
                    </div>
                ))}
            </div>

            {previews.length > 0 && (
                <div className="p-2 border-t border-gray-300">
                    <div className="flex overflow-x-auto">
                        {renderPreviews()}
                    </div>
                </div>
            )}

            <div className="p-4 bg-white border-t border-gray-300">
                <div className="flex items-center">
                    <input
                        type="file"
                        multiple
                        onChange={handleFileChange}
                        className="hidden"
                        id="fileInput"
                    />
                    
                    <label htmlFor="fileInput" className="mr-2 cursor-pointer">
                        <span className="text-gray-600 hover:text-blue-500">📎</span>
                    </label>

                    {/* Text input */}
                    <input
                        type="text"
                        value={messageText}
                        onChange={(e) => setMessageText(e.target.value)}
                        placeholder="Type your message..."
                        className="flex-1 p-2 border border-gray-300 rounded-lg focus:outline-none"
                    />

                    {/* Send button */}
                    <button
                        className="bg-blue-500 text-white p-2 rounded-lg ml-2"
                        onClick={sendMessage}
                        disabled={isUploading}
                    >
                        {isUploading ? 'Uploading...' : 'Send'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Chat;


// "use client"; // Enable client-side rendering
// import React, { useState, useEffect } from 'react';
// import { database, storage } from '../config/firebase'; // Adjust this import based on your firebase setup
// import { ref, onValue, push, update, onDisconnect } from 'firebase/database';
// import { uploadBytes, getDownloadURL, ref as storageRef } from 'firebase/storage';
// import 'tailwindcss/tailwind.css';

// const Chat = ({ user }) => {
//     const otherUser = user.id === 'user1' ? { id: 'user2', name: 'User 2' } : { id: 'user1', name: 'User 1' };

//     const [messages, setMessages] = useState([]); // State for messages
//     const [messageText, setMessageText] = useState(''); // State for input message
//     const [files, setFiles] = useState([]); // State for selected files
//     const [previews, setPreviews] = useState([]); // State for file previews
//     const [isUploading, setIsUploading] = useState(false); // State to track if file is uploading
//     const [otherUserStatus, setOtherUserStatus] = useState(null); // State for tracking other user's online status
//     const [isOtherUserTyping, setIsOtherUserTyping] = useState(false); // State to track typing status

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
//                     const readTimestamp = Date.now(); // Timestamp for when the message is read
//                     update(ref(database, `messages/${user.id}/${otherUser.id}/${msg.id}`), { read: true, readAt: readTimestamp });
//                     update(ref(database, `messages/${otherUser.id}/${user.id}/${msg.id}`), { read: true, readAt: readTimestamp });
//                 }
//             });
//         });
//     }, [user.id, otherUser.id]);

//     // Monitor user online status and typing status
//     useEffect(() => {
//         const userStatusRef = ref(database, `status/${user.id}`);
//         const typingRef = ref(database, `typing/${user.id}`);

//         // Set user to online when they connect
//         update(userStatusRef, { online: true, lastSeen: Date.now() });

//         // Set user to offline and record last seen when they disconnect
//         onDisconnect(userStatusRef).update({ online: false, lastSeen: Date.now() });

//         // Update typing status when the user types
//         if (messageText.trim() || files.length > 0) {
//             update(typingRef, { typing: true });
//         } else {
//             update(typingRef, { typing: false });
//         }

//         // Listen for the other user's online status
//         const otherUserStatusRef = ref(database, `status/${otherUser.id}`);
//         onValue(otherUserStatusRef, (snapshot) => {
//             const status = snapshot.val();
//             setOtherUserStatus(status);
//         });

//         // Listen for the other user's typing status
//         const otherUserTypingRef = ref(database, `typing/${otherUser.id}`);
//         onValue(otherUserTypingRef, (snapshot) => {
//             const data = snapshot.val();
//             setIsOtherUserTyping(data?.typing || false);
//         });

//         // Cleanup on component unmount
//         return () => {
//             update(typingRef, { typing: false });
//             onDisconnect(userStatusRef).cancel();
//         };
//     }, [messageText, files, user.id, otherUser.id]);

//     // Function to handle file input and preview
//     const handleFileChange = (e) => {
//         const selectedFiles = Array.from(e.target.files);
//         setFiles([...files, ...selectedFiles]);

//         // Generate previews for selected files
//         const newPreviews = selectedFiles.map((file) => ({
//             id: URL.createObjectURL(file),
//             file,
//         }));
//         setPreviews([...previews, ...newPreviews]);
//     };

//     // Function to remove a file from preview
//     const removeFile = (previewId) => {
//         setPreviews(previews.filter((preview) => preview.id !== previewId));
//         setFiles(files.filter((file) => URL.createObjectURL(file) !== previewId));
//     };

//     // Function to upload files to Firebase Storage
//     const uploadFiles = async () => {
//         const uploadPromises = files.map((file) => {
//             const storageReference = storageRef(storage, `files/${user.id}/${Date.now()}_${file.name}`);
//             return uploadBytes(storageReference, file).then(() => getDownloadURL(storageReference));
//         });
//         return await Promise.all(uploadPromises); // Return all download URLs
//     };

//     // Function to send a new message
//     const sendMessage = async () => {
//         if (messageText.trim() === "" && files.length === 0) return; // Prevent sending empty messages

//         const messagesRef = ref(database, `messages/${user.id}/${otherUser.id}`);
//         const newMessageKey = push(messagesRef).key;

//         let fileURLs = [];
//         if (files.length > 0) {
//             setIsUploading(true);
//             fileURLs = await uploadFiles(); // Upload all files and get URLs
//             setIsUploading(false);
//             setFiles([]); // Clear files after uploading
//             setPreviews([]); // Clear previews after sending
//         }

//         const newMessage = {
//             text: messageText,
//             sender: user.id,
//             timestamp: Date.now(),
//             read: false, // Initially mark as unread
//             id: newMessageKey,
//             files: fileURLs // Store uploaded file URLs
//         };

//         // Save message for both users
//         const updates = {};
//         updates[`messages/${user.id}/${otherUser.id}/${newMessageKey}`] = newMessage;
//         updates[`messages/${otherUser.id}/${user.id}/${newMessageKey}`] = newMessage;

//         update(ref(database), updates).then(() => {
//             setMessageText(''); // Clear input after sending
//         });
//     };

//     // Function to render media based on file type
//     const renderMedia = (files) => {
//         if (files.length === 0) return null;

//         return (
//             <div className="flex space-x-2">
//                 {files.map((file, index) => {
//                     const fileExtension = file.split('.').pop().toLowerCase();
//                     if (['png', 'jpg', 'jpeg', 'gif'].includes(fileExtension)) {
//                         return (
//                             <img
//                                 key={index}
//                                 src={file}
//                                 alt={`Image ${index + 1}`}
//                                 className="w-24 h-24 object-cover rounded-lg"
//                             />
//                         );
//                     } else if (['mp4', 'mkv', 'webm'].includes(fileExtension)) {
//                         return (
//                             <video
//                                 key={index}
//                                 controls
//                                 className="w-24 h-24 rounded-lg"
//                             >
//                                 <source src={file} type={`video/${fileExtension}`} />
//                                 Your browser does not support the video tag.
//                             </video>
//                         );
//                     } else if (['pdf', 'doc', 'docx', 'xls', 'xlsx'].includes(fileExtension)) {
//                         return (
//                             <div key={index} className="flex items-center">
//                                 <a
//                                     href={file}
//                                     target="_blank"
//                                     rel="noopener noreferrer"
//                                     className="flex items-center bg-gray-200 rounded-lg p-2"
//                                 >
//                                     <span className="mr-2">📄</span>
//                                     <span>{file.split('/').pop()}</span>
//                                 </a>
//                             </div>
//                         );
//                     }
//                     return null; // If file type is not handled, return null
//                 })}
//             </div>
//         );
//     };

//     return (
//         <div className="flex flex-col h-screen bg-gray-100">
//             {/* Sticky header */}
//             <div className="bg-white p-4 shadow-md sticky top-0 z-10">
//                 <h2 className="text-xl text-center">{otherUser.name}</h2>
//                 {/* Display online status or last seen */}
//                 <div className="text-sm text-gray-500 text-center">
//                     {otherUserStatus?.online ? (
//                         <span>{otherUser.name} is online</span>
//                     ) : (
//                         <span>Last seen at {new Date(otherUserStatus?.lastSeen).toLocaleTimeString()}</span>
//                     )}
//                     {isOtherUserTyping && <span>...typing</span>}
//                 </div>
//             </div>

//             {/* Chat messages */}
//             <div className="flex-1 p-4 overflow-y-scroll">
//                 {messages.map((message, index) => (
//                     <div
//                         key={index}
//                         className={`mb-4 ${message.sender === user.id ? 'text-right' : 'text-left'}`}
//                     >
//                         <div className={`inline-block p-2 rounded-lg ${message.sender === user.id ? 'bg-blue-500 text-white' : 'bg-gray-300 text-black'}`}>
//                             {message.text}
//                         </div>
//                         {renderMedia(message.files)} {/* Render media for each message */}
//                     </div>
//                 ))}
//             </div>

//             {/* Message input area */}
//             <div className="p-4 bg-white border-t border-gray-300">
//                 <input
//                     type="text"
//                     value={messageText}
//                     onChange={(e) => setMessageText(e.target.value)}
//                     placeholder="Type a message..."
//                     className="border rounded-lg w-full p-2"
//                 />
//                 <input
//                     type="file"
//                     multiple
//                     onChange={handleFileChange}
//                     className="mt-2"
//                 />
//                 <button
//                     onClick={sendMessage}
//                     disabled={isUploading}
//                     className="bg-blue-500 text-white rounded-lg px-4 py-2 mt-2"
//                 >
//                     {isUploading ? 'Sending...' : 'Send'}
//                 </button>
//                 {/* Preview selected files */}
//                 <div className="mt-2 flex space-x-2">
//                     {previews.map((preview) => (
//                         <div key={preview.id} className="relative">
//                             <button
//                                 onClick={() => removeFile(preview.id)}
//                                 className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1 text-sm"
//                             >
//                                 &times;
//                             </button>
//                             {renderMedia([preview.id])} {/* Render preview media */}
//                         </div>
//                     ))}
//                 </div>
//             </div>
//         </div>
//     );
// };

// export default Chat;


// // "use client"; // Enable client-side rendering
// // import React, { useState, useEffect } from 'react';
// // import { database, storage } from '../config/firebase'; // Adjust this import based on your firebase setup
// // import { ref, onValue, push, update, onDisconnect } from 'firebase/database';
// // import { uploadBytes, getDownloadURL, ref as storageRef } from 'firebase/storage';
// // import 'tailwindcss/tailwind.css';

// // const Chat = ({ user }) => {
// //     const otherUser = user.id === 'user1' ? { id: 'user2', name: 'User 2' } : { id: 'user1', name: 'User 1' };

// //     const [messages, setMessages] = useState([]); // State for messages
// //     const [messageText, setMessageText] = useState(''); // State for input message
// //     const [files, setFiles] = useState([]); // State for selected files
// //     const [previews, setPreviews] = useState([]); // State for file previews
// //     const [isUploading, setIsUploading] = useState(false); // State to track if file is uploading
// //     const [otherUserStatus, setOtherUserStatus] = useState(null); // State for tracking other user's online status
// //     const [isOtherUserTyping, setIsOtherUserTyping] = useState(false); // State to track typing status

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
// //                     const readTimestamp = Date.now(); // Timestamp for when the message is read
// //                     update(ref(database, `messages/${user.id}/${otherUser.id}/${msg.id}`), { read: true, readAt: readTimestamp });
// //                     update(ref(database, `messages/${otherUser.id}/${user.id}/${msg.id}`), { read: true, readAt: readTimestamp });
// //                 }
// //             });
// //         });
// //     }, [user.id, otherUser.id]);

// //     // Monitor user online status and typing status
// //     useEffect(() => {
// //         const userStatusRef = ref(database, `status/${user.id}`);
// //         const typingRef = ref(database, `typing/${user.id}`);

// //         // Set user to online when they connect
// //         update(userStatusRef, { online: true, lastSeen: Date.now() });

// //         // Set user to offline and record last seen when they disconnect
// //         onDisconnect(userStatusRef).update({ online: false, lastSeen: Date.now() });

// //         // Update typing status when the user types
// //         if (messageText.trim() || files.length > 0) {
// //             update(typingRef, { typing: true });
// //         } else {
// //             update(typingRef, { typing: false });
// //         }

// //         // Listen for the other user's online status
// //         const otherUserStatusRef = ref(database, `status/${otherUser.id}`);
// //         onValue(otherUserStatusRef, (snapshot) => {
// //             const status = snapshot.val();
// //             setOtherUserStatus(status);
// //         });

// //         // Listen for the other user's typing status
// //         const otherUserTypingRef = ref(database, `typing/${otherUser.id}`);
// //         onValue(otherUserTypingRef, (snapshot) => {
// //             const data = snapshot.val();
// //             setIsOtherUserTyping(data?.typing || false);
// //         });

// //         // Cleanup on component unmount
// //         return () => {
// //             update(typingRef, { typing: false });
// //             onDisconnect(userStatusRef).cancel();
// //         };
// //     }, [messageText, files, user.id, otherUser.id]);

// //     // Function to handle file input and preview
// //     const handleFileChange = (e) => {
// //         const selectedFiles = Array.from(e.target.files);
// //         setFiles([...files, ...selectedFiles]);

// //         // Generate previews for selected files
// //         const newPreviews = selectedFiles.map((file) => ({
// //             id: URL.createObjectURL(file),
// //             file,
// //         }));
// //         setPreviews([...previews, ...newPreviews]);
// //     };

// //     // Function to remove a file from preview
// //     const removeFile = (previewId) => {
// //         setPreviews(previews.filter((preview) => preview.id !== previewId));
// //         setFiles(files.filter((file) => URL.createObjectURL(file) !== previewId));
// //     };

// //     // Function to upload files to Firebase Storage
// //     const uploadFiles = async () => {
// //         const uploadPromises = files.map((file) => {
// //             const storageReference = storageRef(storage, `files/${user.id}/${Date.now()}_${file.name}`);
// //             return uploadBytes(storageReference, file).then(() => getDownloadURL(storageReference));
// //         });
// //         return await Promise.all(uploadPromises); // Return all download URLs
// //     };

// //     // Function to send a new message
// //     const sendMessage = async () => {
// //         if (messageText.trim() === "" && files.length === 0) return; // Prevent sending empty messages

// //         const messagesRef = ref(database, `messages/${user.id}/${otherUser.id}`);
// //         const newMessageKey = push(messagesRef).key;

// //         let fileURLs = [];
// //         if (files.length > 0) {
// //             setIsUploading(true);
// //             fileURLs = await uploadFiles(); // Upload all files and get URLs
// //             setIsUploading(false);
// //             setFiles([]); // Clear files after uploading
// //             setPreviews([]); // Clear previews after sending
// //         }

// //         const newMessage = {
// //             text: messageText,
// //             sender: user.id,
// //             timestamp: Date.now(),
// //             read: false, // Initially mark as unread
// //             id: newMessageKey,
// //             files: fileURLs // Store uploaded file URLs
// //         };

// //         // Save message for both users
// //         const updates = {};
// //         updates[`messages/${user.id}/${otherUser.id}/${newMessageKey}`] = newMessage;
// //         updates[`messages/${otherUser.id}/${user.id}/${newMessageKey}`] = newMessage;

// //         update(ref(database), updates).then(() => {
// //             setMessageText(''); // Clear input after sending
// //         });
// //     };

// //     // Render previews of selected files
// //     const renderPreviews = () => {
// //         return previews.map((preview, index) => (
// //             <div key={index} className="relative inline-block m-1">
// //                 <img
// //                     src={preview.id}
// //                     alt="Preview"
// //                     className="w-20 h-20 object-cover rounded-lg"
// //                 />
// //                 <button
// //                     className="absolute top-0 right-0 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center"
// //                     onClick={() => removeFile(preview.id)}
// //                 >
// //                     X
// //                 </button>
// //             </div>
// //         ));
// //     };

// //     // Render media in chat (with +X for extra media)
// //     const renderMedia = (files) => {
// //         if (files.length === 0) return null;

// //         const visibleFiles = files.slice(0, 3);
// //         const extraFiles = files.length > 3 ? files.length - 3 : 0;

// //         return (
// //             <div className="flex space-x-2">
// //                 {visibleFiles.map((file, index) => (
// //                     <img
// //                         key={index}
// //                         src={file}
// //                         alt={`Media ${index + 1}`}
// //                         className="w-24 h-24 object-cover rounded-lg"
// //                     />
// //                 ))}
// //                 {extraFiles > 0 && (
// //                     <div className="relative w-24 h-24 bg-gray-200 rounded-lg flex items-center justify-center">
// //                         <span className="text-xl font-bold">+{extraFiles}</span>
// //                     </div>
// //                 )}
// //             </div>
// //         );
// //     };

// //     return (
// //         <div className="flex flex-col h-screen bg-gray-100">
// //             {/* Sticky header */}
// //             <div className="bg-white p-4 shadow-md sticky top-0 z-10">
// //                 <h2 className="text-xl text-center">{otherUser.name}</h2>
// //                 {/* Display online status or last seen */}
// //                 <div className="text-sm text-gray-500 text-center">
// //                     {otherUserStatus?.online ? (
// //                         <span>{otherUser.name} is online</span>
// //                     ) : (
// //                         <span>Last seen at {new Date(otherUserStatus?.lastSeen).toLocaleTimeString()}</span>
// //                     )}
// //                     {isOtherUserTyping && <span>...typing</span>}
// //                 </div>
// //             </div>

// //             {/* Chat messages */}
// //             <div className="flex-1 p-4 overflow-y-scroll">
// //                 {messages.map((message, index) => (
// //                     <div
// //                         key={index}
// //                         className={`mb-4 ${message.sender === user.id ? 'text-right' : 'text-left'}`}
// //                     >
// //                         <div className={`inline-block p-2 rounded-lg ${message.sender === user.id ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}>
// //                             <p>{message.text}</p>
// //                             {renderMedia(message.files)}
// //                         </div>
// //                     </div>
// //                 ))}
// //             </div>

// //             {/* File previews */}
// //             {previews.length > 0 && (
// //                 <div className="p-2 border-t border-gray-300">
// //                     <div className="flex overflow-x-auto">
// //                         {renderPreviews()}
// //                     </div>
// //                 </div>
// //             )}

// //             {/* Input area */}
// //             <div className="p-4 bg-white border-t border-gray-300">
// //                 <div className="flex items-center">
// //                     {/* File input */}
// //                     <input
// //                         type="file"
// //                         multiple
// //                         onChange={handleFileChange}
// //                         className="hidden"
// //                         id="fileInput"
// //                     />
// //                     <label htmlFor="fileInput" className="mr-2 cursor-pointer">
// //                         <span className="text-gray-600 hover:text-blue-500">📎</span>
// //                     </label>

// //                     {/* Text input */}
// //                     <input
// //                         type="text"
// //                         value={messageText}
// //                         onChange={(e) => setMessageText(e.target.value)}
// //                         placeholder="Type your message..."
// //                         className="flex-1 p-2 border border-gray-300 rounded-lg focus:outline-none"
// //                     />

// //                     {/* Send button */}
// //                     <button
// //                         className="bg-blue-500 text-white p-2 rounded-lg ml-2"
// //                         onClick={sendMessage}
// //                         disabled={isUploading}
// //                     >
// //                         {isUploading ? 'Uploading...' : 'Send'}
// //                     </button>
// //                 </div>
// //             </div>
// //         </div>
// //     );
// // };

// // export default Chat;
