"use client";

import { useEffect, useState } from "react";
import { ref, listAll, getDownloadURL, getMetadata } from "firebase/storage";
import { storage } from "../config/firebase";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/swiper-bundle.min.css";
import { format } from "date-fns";

const Gallery = () => {
    const [files, setFiles] = useState([]);
    const [activeFilter, setActiveFilter] = useState("all");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalFileIndex, setModalFileIndex] = useState(0);
    const [filteredFiles, setFilteredFiles] = useState([]);
    const [groupedFiles, setGroupedFiles] = useState({});
    const [currentGroup, setCurrentGroup] = useState([]);
    const [isLoading, setIsLoading] = useState(true); // To manage loading state

    useEffect(() => {
        const fetchFiles = async () => {
            const listRef = ref(storage, "chatFiles/");
            try {
                const res = await listAll(listRef);
                const fileDetails = await Promise.all(
                    res.items.map(async (item) => {
                        const fileUrl = await getDownloadURL(item);
                        const metadata = await getMetadata(item);

                        // Save to localStorage if it's not already cached
                        const cachedFile = localStorage.getItem(item.name);
                        if (!cachedFile) {
                            localStorage.setItem(item.name, fileUrl);
                        }

                        return {
                            url: cachedFile || fileUrl, // Use cached URL if available
                            contentType: metadata.contentType,
                            timeCreated: metadata.timeCreated,
                        };
                    })
                );
                setFiles(fileDetails);
                setFilteredFiles(fileDetails);

                const grouped = fileDetails.reduce((acc, file) => {
                    const date = new Date(file.timeCreated);
                    const yearMonth = format(date, "yyyy-MM");

                    if (!acc[yearMonth]) acc[yearMonth] = [];
                    acc[yearMonth].push(file);
                    return acc;
                }, {});

                // Sort keys in descending order (newest first)
                const sortedGrouped = Object.keys(grouped)
                    .sort((a, b) => new Date(b) - new Date(a))
                    .reduce((acc, key) => {
                        acc[key] = grouped[key];
                        return acc;
                    }, {});

                setGroupedFiles(sortedGrouped);
                setIsLoading(false); // Files are loaded, hide the loading state
            } catch (error) {
                console.error("Error fetching files: ", error);
                setIsLoading(false);
            }
        };

        fetchFiles();
    }, []);

    const handleFilterChange = (filter) => {
        setActiveFilter(filter);
        if (filter === "all") {
            setFilteredFiles(files);
        } else {
            setFilteredFiles(
                files.filter((file) =>
                    filter === "images" ? file.contentType.startsWith("image/") : file.contentType.startsWith("video/")
                )
            );
        }
    };

    const openModal = (groupKey, index) => {
        setCurrentGroup(groupedFiles[groupKey] || []);
        setModalFileIndex(index);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
    };

    const handleOverlayClick = (e) => {
        if (e.target.id === "modal-overlay") {
            closeModal();
        }
    };

    return (
        <div>
            {/* Loading Spinner */}
            {isLoading && (
                <div role="status" className="flex items-center justify-center h-56 max-w-sm bg-gray-300 rounded-lg animate-pulse dark:bg-gray-700">
                    <svg className="w-10 h-10 text-gray-200 dark:text-gray-600" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 16 20">
                        <path d="M5 5V.13a2.96 2.96 0 0 0-1.293.749L.879 3.707A2.98 2.98 0 0 0 .13 5H5Z"/>
                        <path d="M14.066 0H7v5a2 2 0 0 1-2 2H0v11a1.97 1.97 0 0 0 1.934 2h12.132A1.97 1.97 0 0 0 16 18V2a1.97 1.97 0 0 0-1.934-2ZM9 13a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-2a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2Zm4 .382a1 1 0 0 1-1.447.894L10 13v-2l1.553-1.276a1 1 0 0 1 1.447.894v2.764Z"/>
                    </svg>
                    <span className="sr-only">Loading...</span>
                </div>
            )}

            <div className="flex items-center justify-center py-4 md:py-8 flex-wrap">
                {["all", "images", "videos"].map((filter) => (
                    <button
                        key={filter}
                        type="button"
                        onClick={() => handleFilterChange(filter)}
                        className={`${
                            activeFilter === filter
                                ? "text-blue-700 hover:text-white border border-blue-600 bg-white hover:bg-blue-700"
                                : "text-gray-900 border border-white hover:border-gray-200"
                        } px-5 py-2.5 rounded-full mb-3`}
                    >
                        {filter.charAt(0).toUpperCase() + filter.slice(1)}
                    </button>
                ))}
            </div>

            <div className="space-y-6">
                {Object.keys(groupedFiles).map((yearMonth) => (
                    <div key={yearMonth} className="space-y-2">
                        <h2 className="text-xl font-semibold">{yearMonth}</h2>
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                            {groupedFiles[yearMonth]
                                .filter((file) =>
                                    activeFilter === "all"
                                        ? true
                                        : activeFilter === "images"
                                        ? file.contentType.startsWith("image/")
                                        : file.contentType.startsWith("video/")
                                )
                                .map((file, index) => (
                                    <div
                                        key={index}
                                        onClick={() => openModal(yearMonth, index)}
                                        className="cursor-pointer"
                                    >
                                        {file.contentType.startsWith("video/") ? (
                                            <video className="h-auto rounded-lg" controls>
                                                <source src={file.url} type={file.contentType} />
                                                Your browser does not support the video tag.
                                            </video>
                                        ) : (
                                            <img
                                                className="h-auto rounded-lg"
                                                src={file.url}
                                                alt={`File ${index}`}
                                            />
                                        )}
                                    </div>
                                ))}
                        </div>
                        <hr className="my-4" />
                    </div>
                ))}
            </div>

            {isModalOpen && (
                <div
                    id="modal-overlay"
                    className="fixed inset-0 bg-gray-800 bg-opacity-75 flex justify-center items-center z-50"
                    onClick={handleOverlayClick}
                >
                    <div className="relative rounded-lg w-full max-w-xl p-4">
                        <Swiper
                            initialSlide={modalFileIndex}
                            spaceBetween={10}
                            slidesPerView={1}
                            navigation
                            loop 
                        >
                            {currentGroup.map((file, index) => (
                                <SwiperSlide key={index}>
                                    {file.contentType.startsWith("video/") ? (
                                        <video className="h-auto max-h-[80vh] rounded-lg" controls>
                                            <source src={file.url} type={file.contentType} />
                                        </video>
                                    ) : (
                                        <img className="h-auto rounded-lg" src={file.url} alt={`File ${index}`} />
                                    )}
                                </SwiperSlide>
                            ))}
                        </Swiper>
                        <button
                            onClick={closeModal}
                            className="absolute -top-6 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white rounded-full px-3 py-1 text-lg"
                        >
                            &#10005;
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Gallery;

// "use client";
// import React, { useState, useEffect, useRef } from 'react';
// import { database, storage } from '../config/firebase';
// import { ref as databaseRef, onValue, push, update } from 'firebase/database';
// import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
// import 'tailwindcss/tailwind.css';

// const Chat = ({ user }) => {
//     const otherUser = user.id === 'user1' ? { id: 'user2', name: 'User 2' } : { id: 'user1', name: 'User 1' };

//     const [messages, setMessages] = useState([]);
//     const [messageText, setMessageText] = useState('');
//     const [selectedFiles, setSelectedFiles] = useState([]);
//     const [uploading, setUploading] = useState(false);
//     const [lastSeen, setLastSeen] = useState('');
//     const messageEndRef = useRef(null);

//     useEffect(() => {
//         const messagesRef = databaseRef(database, `messagesdes/${user.id}/${otherUser.id}`);
//         onValue(messagesRef, (snapshot) => {
//             const data = snapshot.val();
//             const loadedMessages = data ? Object.values(data) : [];
//             setMessages(loadedMessages);

//             // Mark messages as read
//             loadedMessages.forEach((msg) => {
//                 if (!msg.read && msg.sender !== user.id) {
//                     update(databaseRef(database, `messagesdes/${user.id}/${otherUser.id}/${msg.id}`), { read: true });
//                     update(databaseRef(database, `messagesdes/${otherUser.id}/${user.id}/${msg.id}`), { read: true });
//                 }
//             });
//         });

//         const userStatusRef = databaseRef(database, `lastSeen/${otherUser.id}`);
//         onValue(userStatusRef, (snapshot) => {
//             const status = snapshot.val();
//             if (status && status.timestamp) {
//                 const formattedDate = new Date(status.timestamp).toLocaleString('id-ID', {
//                     year: 'numeric',
//                     month: '2-digit',
//                     day: '2-digit',
//                     hour: '2-digit',
//                     minute: '2-digit',
//                     second: '2-digit',
//                     hour12: false,
//                 });
//                 setLastSeen(formattedDate);
//             } else {
//                 setLastSeen('Offline');
//             }
//         });

//         const lastSeenRef = databaseRef(database, `lastSeen/${user.id}`);
//         update(lastSeenRef, { timestamp: Date.now() });

//         return () => {
//             update(lastSeenRef, { timestamp: null });
//         };
//     }, [user.id, otherUser.id]);

//     useEffect(() => {
//         scrollToLatestMessage();
//     }, [messages]);

//     const handleFileChange = (event) => {
//         const files = Array.from(event.target.files);
//         setSelectedFiles((prevFiles) => [...prevFiles, ...files]);
//     };

//     const removeFile = (index) => {
//         setSelectedFiles((prevFiles) => prevFiles.filter((_, i) => i !== index));
//     };

//     const sendMessage = async () => {
//         if (messageText.trim() === '' && selectedFiles.length === 0) return;

//         const messagesRef = databaseRef(database, `messagesdes/${user.id}/${otherUser.id}`);
//         const newMessage = {
//             text: messageText,
//             sender: user.id,
//             timestamp: Date.now(),
//             read: false,
//             files: [],
//         };

//         setUploading(true);

//         const uploadedFiles = await Promise.all(
//             selectedFiles.map(async (file) => {
//                 const fileRef = storageRef(storage, `chatFiles/${file.name}`);
//                 await uploadBytes(fileRef, file);
//                 return getDownloadURL(fileRef);
//             })
//         );

//         newMessage.files = uploadedFiles;

//         const newMsgRef = await push(messagesRef, newMessage);
//         setMessageText('');
//         setSelectedFiles([]);

//         const recipientRef = databaseRef(database, `messagesdes/${otherUser.id}/${user.id}`);
//         await push(recipientRef, { ...newMessage, id: newMsgRef.key });

//         setUploading(false);

//         const lastSeenRef = databaseRef(database, `lastSeen/${user.id}`);
//         update(lastSeenRef, { timestamp: Date.now() });
//     };

//     const scrollToLatestMessage = () => {
//         if (messageEndRef.current) {
//             messageEndRef.current.scrollIntoView({ behavior: 'smooth' });
//         }
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
//                 <h2 className="text-xl text-center">{otherUser.name}</h2>
//                 <p className="text-sm text-center">{lastSeen ? 'Last seen: ' + lastSeen : 'Offline'}</p>
//             </div>

//             <div className="flex-1 overflow-y-auto p-4">
//                 {messages.map((msg, index) => (
//                     <div key={index} className={`mb-2 ${msg.sender === user.id ? 'text-right' : 'text-left'}`}>
//                         <div className={`inline-block p-2 rounded-lg ${msg.sender === user.id ? 'bg-blue-500 text-white' : 'bg-gray-300'}`}>
//                             {msg.text}
//                             {renderMedia(msg.files)}
//                         </div>
//                         <div className="text-xs text-gray-500 flex justify-end items-center">
//                             {new Date(msg.timestamp).toLocaleString('id-ID', {
//                                 year: 'numeric',
//                                 month: '2-digit',
//                                 day: '2-digit',
//                                 hour: '2-digit',
//                                 minute: '2-digit',
//                                 second: '2-digit',
//                                 hour12: false,
//                             })}
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
//                 <div ref={messageEndRef}></div>
//             </div>

//             <div className="flex-none flex items-center p-4 border-t border-gray-300 sticky bottom-0 bg-white">
//                 <input
//                     type="file"
//                     multiple
//                     accept="image/*,video/*"
//                     className="hidden"
//                     id="fileInput"
//                     onChange={handleFileChange}
//                 />
//                 <label htmlFor="fileInput" className="cursor-pointer">
//                     <span className="material-icons">file</span>
//                 </label>

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
//  // <button
//             //     onClick={scrollToLatestMessage}
//             //     className="fixed bottom-16 right-4 bg-blue-500 text-white p-3 rounded-full shadow-lg"
//             // >
//             //     ↓
//             // </button>
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


    
// //     // Fetch messages and user status from Firebase on component mount
// //     useEffect(() => {
// //         const messagesRef = databaseRef(database, `messagesdes/${user.id}/${otherUser.id}`);
// //         onValue(messagesRef, (snapshot) => {
// //             const data = snapshot.val();
// //             const loadedMessages = data ? Object.values(data) : [];
// //             setMessages(loadedMessages);

// //             // Mark all messages as read when the user views the chat
// //             loadedMessages.forEach((msg) => {
// //                 if (!msg.read && msg.sender !== user.id) {
// //                     update(databaseRef(database, `messagesdes/${user.id}/${otherUser.id}/${msg.id}`), { read: true });
// //                     update(databaseRef(database, `messagesdes/${otherUser.id}/${user.id}/${msg.id}`), { read: true });
// //                 }
// //             });
// //         });

// //         // Fetch other user's last seen status
// //         // const userStatusRef = databaseRef(database, `lastSeen/${otherUser.id}`);
// //         // onValue(userStatusRef, (snapshot) => {
// //         //     const status = snapshot.val();
// //         //     setLastSeen(status ? new Date(status.timestamp).toLocaleTimeString() : 'Offline');
// //         // });
// //         // Fetch other user's last seen status
// //         const userStatusRef = databaseRef(database, `lastSeen/${otherUser.id}`);
// //         onValue(userStatusRef, (snapshot) => {
// //             const status = snapshot.val();
// //             if (status && status.timestamp) {
// //                 const date = new Date(status.timestamp);
// //                 // setLastSeen(!isNaN(date.getTime()) ? date.toLocaleTimeString() : 'Offline');
// //                 const formattedDate = date.toLocaleString('id-ID', {
// //                     year: 'numeric',
// //                     month: '2-digit',
// //                     day: '2-digit',
// //                     hour: '2-digit',
// //                     minute: '2-digit',
// //                     second: '2-digit',
// //                     hour12: false, // Format 24 jam
// //                 });
        
// //                 setLastSeen(!isNaN(date.getTime()) ? formattedDate : 'Offline');
// //             } else {
// //                 setLastSeen('Offline');
// //             }
// //         });

// //         // Update last seen when user is active
// //         const lastSeenRef = databaseRef(database, `lastSeen/${user.id}`);
// //         update(lastSeenRef, { timestamp: Date.now() });

// //         return () => {
// //             // Cleanup: Remove last seen status when component unmounts
// //             update(lastSeenRef, { timestamp: null });
// //         };
// //     }, [user.id, otherUser.id]);

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

// //         const messagesRef = databaseRef(database, `messagesdes/${user.id}/${otherUser.id}`);
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
// //             const fileRef = storageRef(storage, `chatFiles/${file.name}`);
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
// //         const recipientRef = databaseRef(database, `messagesdes/${otherUser.id}/${user.id}`);
// //         await push(recipientRef, { ...newMessage, id: newMsgRef.key });

// //         setUploading(false);

// //         // Update last seen when a message is sent
// //         const lastSeenRef = databaseRef(database, `lastSeen/${user.id}`);
// //         update(lastSeenRef, { timestamp: Date.now() });
// //     };

// //     const renderMedia = (files) => {
// //         if (!files || files.length === 0) return null;

// //         return (
// //             <div className="flex flex-wrap mt-1">
// //                 {files.map((file, index) => (
// //                     <a
// //                         key={index}
// //                         href={file}
// //                         target="_blank"
// //                         rel="noopener noreferrer"
// //                         className="w-20 h-20 flex items-center justify-center border border-gray-300 rounded-lg m-1"
// //                     >
// //                         {file.endsWith('.jpg') || file.endsWith('.png') || file.endsWith('.gif') ? (
// //                             <img src={file} alt="Media" className="object-cover h-full w-full rounded-lg" />
// //                         ) : (
// //                             <span className="text-sm">File</span>
// //                         )}
// //                     </a>
// //                 ))}
// //             </div>
// //         );
// //     };

// //                             // {new Date(msg.timestamp).toLocaleTimeString()}


// //     return (
// //         <div className="flex flex-col h-screen bg-gray-100">
// //             <div className="flex-none p-4 bg-white border-b border-gray-300">
// //                 <h2 className="text-xl text-center">{otherUser.name}</h2>
// //                 <p className="text-sm text-center">{lastSeen ? 'Last seen: ' + lastSeen : 'Offline'}</p>
// //             </div>
           
            
// //             <div className="flex-1 overflow-y-auto p-4">
// //                 {/* Display messages */}
// //                 {messages.map((msg, index) => (
// //                     <div key={index} className={`mb-2 ${msg.sender === user.id ? 'text-right' : 'text-left'}`}>
// //                         <div className={`inline-block p-2 rounded-lg ${msg.sender === user.id ? 'bg-blue-500 text-white' : 'bg-gray-300'}`}>
// //                             {msg.text}
// //                             {renderMedia(msg.files)}
// //                         </div>
// //                         <div className="text-xs text-gray-500 flex justify-end items-center">
// //                             {new Date(msg.timestamp).toLocaleString('id-ID', {
// //                                 year: 'numeric',
// //                                 month: '2-digit',
// //                                 day: '2-digit',
// //                                 hour: '2-digit',
// //                                 minute: '2-digit',
// //                                 second: '2-digit',
// //                                 hour12: false, // Gunakan format 24 jam
// //                               })}
// //                             {msg.sender === user.id && (
// //                                 <span className="ml-2">
// //                                     {msg.read ? (
// //                                         <span className="text-blue-500">✔✔</span>
// //                                     ) : (
// //                                         <span>✔</span>
// //                                     )}
// //                                 </span>
// //                             )}
// //                         </div>
// //                     </div>
// //                 ))}
// //             </div>
                  
// //              <div className="flex-none flex items-center p-4 border-t border-gray-300 sticky bottom-0 bg-white">
// //         <input
// //                     type="file"
// //                     multiple
// //                     accept="image/*,video/*"
// //                     className="hidden"
// //                     id="fileInput"
// //                     onChange={handleFileChange}
// //                 />
// //                 <label htmlFor="fileInput" className="cursor-pointer">
// //                     <span className="material-icons">file</span>
// //                 </label>
// //                 <div className="flex flex-wrap">
// //                     {selectedFiles.map((file, index) => (
// //                         <div key={index} className="relative mr-2 flex items-center">
// //                             <span
// //                                 className="absolute top-0 right-0 cursor-pointer text-red-500"
// //                                 onClick={() => removeFile(index)}
// //                             >
// //                                 &times;
// //                             </span>
// //                             {/* Display a thumbnail or video preview based on file type */}
// //                             {file.type.startsWith("video") ? (
// //                                 <video
// //                                     src={URL.createObjectURL(file)}
// //                                     className="w-20 h-20 object-cover rounded-lg m-1"
// //                                     controls
// //                                 />
// //                             ) : (
// //                                 <img
// //                                     src={URL.createObjectURL(file)}
// //                                     alt="Selected file"
// //                                     className="w-20 h-20 object-cover rounded-lg m-1"
// //                                 />
// //                             )}
// //                         </div>
// //                     ))}
// //                 </div>

// //                 <input
// //                     type="text"
// //                     className="border rounded-lg p-2 flex-1 mx-2"
// //                     placeholder="Type a message..."
// //                     value={messageText}
// //                     onChange={(e) => setMessageText(e.target.value)}
// //                 />
// //                 <button
// //                     className="ml-2 p-2 bg-blue-500 text-white rounded-lg"
// //                     onClick={sendMessage}
// //                     disabled={uploading}
// //                 >
// //                     {uploading ? "Sending..." : "Send"}
// //                 </button>
// //             </div>
// //                     {/* Tombol melayang */}



// //         </div>
// //     );
// // };

// // export default Chat;



// // // "use client"; // Enable client-side rendering
// // // import React, { useState, useEffect } from 'react';
// // // import { database, storage } from '../config/firebase'; // Ensure Firebase Storage is configured
// // // import { ref as databaseRef, onValue, push, update } from 'firebase/database';
// // // import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
// // // import 'tailwindcss/tailwind.css';

// // // const Chat = ({ user }) => {
// // //     const otherUser = user.id === 'user1' ? { id: 'user2', name: 'User 2' } : { id: 'user1', name: 'User 1' };

// // //     const [messages, setMessages] = useState([]);
// // //     const [messageText, setMessageText] = useState('');
// // //     const [selectedFiles, setSelectedFiles] = useState([]);
// // //     const [uploading, setUploading] = useState(false);
// // //     const [otherUserStatus, setOtherUserStatus] = useState(''); // Online status or last seen

// // //     // Fetch messages from Firebase on component mount
// // //     useEffect(() => {
// // //         const messagesRef = databaseRef(database, `messages/${user.id}/${otherUser.id}`);
// // //         onValue(messagesRef, (snapshot) => {
// // //             const data = snapshot.val();
// // //             const loadedMessages = data ? Object.values(data) : [];
// // //             setMessages(loadedMessages);

// // //             // Mark all messages as read when the user views the chat
// // //             loadedMessages.forEach((msg) => {
// // //                 if (!msg.read && msg.sender !== user.id) {
// // //                     update(databaseRef(database, `messages/${user.id}/${otherUser.id}/${msg.id}`), { read: true });
// // //                     update(databaseRef(database, `messages/${otherUser.id}/${user.id}/${msg.id}`), { read: true });
// // //                 }
// // //             });
// // //         });

// // //         // Fetch user's status
// // //         const userStatusRef = databaseRef(database, `users/${otherUser.id}/status`);
// // //         onValue(userStatusRef, (snapshot) => {
// // //             const status = snapshot.val();
// // //             setOtherUserStatus(status ? status : 'Last seen: ' + new Date(status.lastSeen).toLocaleTimeString());
// // //         });

// // //         // Set last seen status
// // //         const lastSeenRef = databaseRef(database, `lastSeen/${user.id}`);
// // //         onValue(lastSeenRef, (snapshot) => {
// // //             // Assuming lastSeen is a timestamp
// // //             setOtherUserStatus(snapshot.val());
// // //         });

// // //         // Update last seen when user is active
// // //         update(lastSeenRef, { timestamp: Date.now() });
// // //     }, [user.id, otherUser.id]);

// // //     // Handle file selection
// // //     const handleFileChange = (event) => {
// // //         const files = Array.from(event.target.files);
// // //         setSelectedFiles((prevFiles) => [...prevFiles, ...files]);
// // //     };

// // //     // Remove a selected file
// // //     const removeFile = (index) => {
// // //         setSelectedFiles((prevFiles) => prevFiles.filter((_, i) => i !== index));
// // //     };

// // //     // Function to send a new message with media support
// // //     const sendMessage = async () => {
// // //         if (messageText.trim() === "" && selectedFiles.length === 0) return; // Prevent sending empty messages

// // //         const messagesRef = databaseRef(database, `messages/${user.id}/${otherUser.id}`);
// // //         const newMessage = {
// // //             text: messageText,
// // //             sender: user.id,
// // //             timestamp: Date.now(),
// // //             read: false,
// // //             files: [],
// // //         };

// // //         setUploading(true);

// // //         // Upload selected files (images and videos) to Firebase Storage
// // //         const uploadedFiles = await Promise.all(selectedFiles.map(async (file) => {
// // //             const fileRef = storageRef(storage, `chatFiles/${file.name}`);
// // //             await uploadBytes(fileRef, file);
// // //             return getDownloadURL(fileRef);
// // //         }));

// // //         // Update newMessage with uploaded file URLs
// // //         newMessage.files = uploadedFiles;

// // //         // Push message to Firebase Database
// // //         const newMsgRef = await push(messagesRef, newMessage);
// // //         setMessageText(''); // Clear input after sending
// // //         setSelectedFiles([]); // Clear selected files

// // //         // Update the recipient's message status
// // //         const recipientRef = databaseRef(database, `messages/${otherUser.id}/${user.id}`);
// // //         await push(recipientRef, { ...newMessage, id: newMsgRef.key });

// // //         setUploading(false);
// // //     };

// // //     const renderMedia = (files) => {
// // //         if (!files || files.length === 0) return null;

// // //         return (
// // //             <div className="flex flex-wrap mt-1">
// // //                 {files.map((file, index) => (
// // //                     <a
// // //                         key={index}
// // //                         href={file}
// // //                         target="_blank"
// // //                         rel="noopener noreferrer"
// // //                         className="w-20 h-20 flex items-center justify-center border border-gray-300 rounded-lg m-1"
// // //                     >
// // //                         {file.endsWith('.jpg') || file.endsWith('.png') || file.endsWith('.gif') ? (
// // //                             <img src={file} alt="Media" className="object-cover h-full w-full rounded-lg" />
// // //                         ) : (
// // //                             <span className="text-sm">File</span>
// // //                         )}
// // //                     </a>
// // //                 ))}
// // //             </div>
// // //         );
// // //     };

// // //     return (
// // //         <div className="flex flex-col h-screen bg-gray-100">
// // //             <div className="flex-none p-4 bg-white border-b border-gray-300">
// // //                 <h2 className="text-xl text-center">{otherUser.name}</h2>
// // //                 <p className="text-sm text-center">{otherUserStatus}</p>
// // //             </div>
// // //             <div className="flex-1 overflow-y-auto p-4">
// // //                 {/* Display messages */}
// // //                 {messages.map((msg, index) => (
// // //                     <div key={index} className={`mb-2 ${msg.sender === user.id ? 'text-right' : 'text-left'}`}>
// // //                         <div className={`inline-block p-2 rounded-lg ${msg.sender === user.id ? 'bg-blue-500 text-white' : 'bg-gray-300'}`}>
// // //                             {msg.text}
// // //                             {renderMedia(msg.files)}
// // //                         </div>
// // //                         <div className="text-xs text-gray-500 flex justify-end items-center">
// // //                             {new Date(msg.timestamp).toLocaleTimeString()}
// // //                             {msg.sender === user.id && (
// // //                                 <span className="ml-2">
// // //                                     {msg.read ? (
// // //                                         <span className="text-blue-500">✔✔</span>
// // //                                     ) : (
// // //                                         <span>✔</span>
// // //                                     )}
// // //                                 </span>
// // //                             )}
// // //                         </div>
// // //                     </div>
// // //                 ))}
// // //             </div>
// // //             <div className="flex items-center p-4 border-t border-gray-300">
// // //                 <input
// // //                     type="file"
// // //                     multiple
// // //                     accept="image/*,video/*"
// // //                     className="hidden"
// // //                     id="fileInput"
// // //                     onChange={handleFileChange}
// // //                 />
// // //                 <label htmlFor="fileInput" className="cursor-pointer">
// // //                     <span className="material-icons">attach_file</span>
// // //                 </label>
// // //                 <div className="flex flex-wrap w-64">
// // //                     {selectedFiles.map((file, index) => (
// // //                         <div key={index} className="relative mr-2">
// // //                             <span
// // //                                 className="absolute top-0 right-0 cursor-pointer text-red-500"
// // //                                 onClick={() => removeFile(index)}
// // //                             >
// // //                                 &times;
// // //                             </span>
// // //                             <span>{file.name}</span>
// // //                         </div>
// // //                     ))}
// // //                 </div>
// // //                 <input
// // //                     type="text"
// // //                     className="border rounded-lg p-2 flex-1 mx-2"
// // //                     placeholder="Type a message..."
// // //                     value={messageText}
// // //                     onChange={(e) => setMessageText(e.target.value)}
// // //                 />
// // //                 <button
// // //                     className="ml-2 p-2 bg-blue-500 text-white rounded-lg"
// // //                     onClick={sendMessage}
// // //                     disabled={uploading}
// // //                 >
// // //                     {uploading ? "Sending..." : "Send"}
// // //                 </button>
// // //             </div>
// // //         </div>
// // //     );
// // // };

// // // export default Chat;

// // // // "use client"; // Enable client-side rendering
// // // // import React, { useState, useEffect } from 'react';
// // // // import { database, storage } from '../config/firebase'; // Ensure Firebase Storage is configured
// // // // import { ref as databaseRef, onValue, push, update } from 'firebase/database';
// // // // import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
// // // // import 'tailwindcss/tailwind.css';

// // // // const Chat = ({ user }) => {
// // // //     const otherUser = user.id === 'user1' ? { id: 'user2', name: 'User 2' } : { id: 'user1', name: 'User 1' };

// // // //     const [messages, setMessages] = useState([]);
// // // //     const [messageText, setMessageText] = useState('');
// // // //     const [selectedFiles, setSelectedFiles] = useState([]);
// // // //     const [uploading, setUploading] = useState(false);
// // // //     const [otherUserStatus, setOtherUserStatus] = useState(''); // Online status or last seen
// // // //     const [isOtherUserTyping, setIsOtherUserTyping] = useState(false); // Typing status

// // // //     // Fetch messages and user status on component mount
// // // //     useEffect(() => {
// // // //         const messagesRef = databaseRef(database, `messages/${user.id}/${otherUser.id}`);
// // // //         const userStatusRef = databaseRef(database, `users/${otherUser.id}/status`);
// // // //         const typingRef = databaseRef(database, `typing/${otherUser.id}`);

// // // //         // Get messages
// // // //         onValue(messagesRef, (snapshot) => {
// // // //             const data = snapshot.val();
// // // //             const loadedMessages = data ? Object.values(data) : [];
// // // //             setMessages(loadedMessages);

// // // //             // Mark all messages as read when the user views the chat
// // // //             loadedMessages.forEach((msg) => {
// // // //                 if (!msg.read && msg.sender !== user.id) {
// // // //                     update(databaseRef(database, `messages/${user.id}/${otherUser.id}/${msg.id}`), { read: true });
// // // //                     update(databaseRef(database, `messages/${otherUser.id}/${user.id}/${msg.id}`), { read: true });
// // // //                 }
// // // //             });
// // // //         });

// // // //         // Fetch user's status
// // // //         onValue(userStatusRef, (snapshot) => {
// // // //             const status = snapshot.val();
// // // //             if (status) {
// // // //                 if (status.online) {
// // // //                     setOtherUserStatus('Online');
// // // //                 } else if (status.lastSeen) {
// // // //                     const lastSeenTime = new Date(status.lastSeen);
// // // //                     setOtherUserStatus('Last seen: ' + lastSeenTime.toLocaleString([], {
// // // //                         year: 'numeric',
// // // //                         month: '2-digit',
// // // //                         day: '2-digit',
// // // //                         hour: '2-digit',
// // // //                         minute: '2-digit',
// // // //                         hour12: true // Use 12-hour format
// // // //                     }));
// // // //                 } else {
// // // //                     setOtherUserStatus('Last seen: Unknown'); // Adjust if necessary
// // // //                 }
// // // //             } else {
// // // //                 setOtherUserStatus('Last seen: Unknown'); // If status data is not available
// // // //             }
// // // //         });

// // // //         // Handle typing status
// // // //         onValue(typingRef, (snapshot) => {
// // // //             const typingData = snapshot.val();
// // // //             setIsOtherUserTyping(typingData?.typing || false);
// // // //         });

// // // //         // Update user status to online when the component mounts
// // // //         update(databaseRef(database, `users/${user.id}/status`), { online: true, lastSeen: null });

// // // //         // Set user to offline when the component unmounts
// // // //         return () => {
// // // //             update(databaseRef(database, `users/${user.id}/status`), { online: false, lastSeen: Date.now() });
// // // //         };
// // // //     }, [user.id, otherUser.id]);

// // // //     // Handle file selection
// // // //     const handleFileChange = (event) => {
// // // //         const files = Array.from(event.target.files);
// // // //         setSelectedFiles((prevFiles) => [...prevFiles, ...files]);
// // // //     };

// // // //     // Remove a selected file
// // // //     const removeFile = (index) => {
// // // //         setSelectedFiles((prevFiles) => prevFiles.filter((_, i) => i !== index));
// // // //     };

// // // //     // Function to send a new message with media support
// // // //     const sendMessage = async () => {
// // // //         if (messageText.trim() === "" && selectedFiles.length === 0) return; // Prevent sending empty messages

// // // //         const messagesRef = databaseRef(database, `messages/${user.id}/${otherUser.id}`);
// // // //         const newMessage = {
// // // //             text: messageText,
// // // //             sender: user.id,
// // // //             timestamp: Date.now(),
// // // //             read: false,
// // // //             files: [],
// // // //         };

// // // //         setUploading(true);

// // // //         // Upload selected files (images and videos) to Firebase Storage
// // // //         const uploadedFiles = await Promise.all(selectedFiles.map(async (file) => {
// // // //             const fileRef = storageRef(storage, `chatFiles/${file.name}`);
// // // //             await uploadBytes(fileRef, file);
// // // //             return getDownloadURL(fileRef);
// // // //         }));

// // // //         // Update newMessage with uploaded file URLs
// // // //         newMessage.files = uploadedFiles;

// // // //         // Push message to Firebase Database
// // // //         const newMsgRef = await push(messagesRef, newMessage);
// // // //         setMessageText(''); // Clear input after sending
// // // //         setSelectedFiles([]); // Clear selected files

// // // //         // Update the recipient's message status
// // // //         const recipientRef = databaseRef(database, `messages/${otherUser.id}/${user.id}`);
// // // //         await push(recipientRef, { ...newMessage, id: newMsgRef.key });

// // // //         setUploading(false);
// // // //     };

// // // //     // Function to handle typing status
// // // //     useEffect(() => {
// // // //         const typingRef = databaseRef(database, `typing/${user.id}`);

// // // //         if (messageText.trim() || selectedFiles.length > 0) {
// // // //             update(typingRef, { typing: true });
// // // //         } else {
// // // //             update(typingRef, { typing: false });
// // // //         }

// // // //         // Cleanup function to stop typing when unmounting
// // // //         return () => {
// // // //             update(typingRef, { typing: false });
// // // //         };
// // // //     }, [messageText, selectedFiles, user.id]);

// // // //     const renderMedia = (files) => {
// // // //         if (!files || files.length === 0) return null;

// // // //         return (
// // // //             <div className="flex flex-wrap mt-1">
// // // //                 {files.map((file, index) => (
// // // //                     <a
// // // //                         key={index}
// // // //                         href={file}
// // // //                         target="_blank"
// // // //                         rel="noopener noreferrer"
// // // //                         className="w-20 h-20 flex items-center justify-center border border-gray-300 rounded-lg m-1"
// // // //                     >
// // // //                         {file.endsWith('.jpg') || file.endsWith('.png') || file.endsWith('.gif') ? (
// // // //                             <img src={file} alt="Media" className="object-cover h-full w-full rounded-lg" />
// // // //                         ) : (
// // // //                             <span className="text-sm">File</span>
// // // //                         )}
// // // //                     </a>
// // // //                 ))}
// // // //             </div>
// // // //         );
// // // //     };

// // // //     return (
// // // //         <div className="flex flex-col h-screen bg-gray-100">
// // // //             <div className="flex-none p-4 bg-white border-b border-gray-300">
// // // //                 <h2 className="text-xl text-center">{otherUser.name}</h2>
// // // //                 <p className="text-sm text-center">{otherUserStatus}</p>
// // // //                 {isOtherUserTyping && <p className="text-sm text-center italic">User is typing...</p>}
// // // //             </div>
// // // //             <div className="flex-1 overflow-y-auto p-4">
// // // //                 {/* Display messages */}
// // // //                 {messages.map((msg, index) => (
// // // //                     <div key={index} className={`mb-2 ${msg.sender === user.id ? 'text-right' : 'text-left'}`}>
// // // //                         <div className={`inline-block p-2 rounded-lg ${msg.sender === user.id ? 'bg-blue-500 text-white' : 'bg-gray-300'}`}>
// // // //                             {msg.text}
// // // //                             {renderMedia(msg.files)}
// // // //                         </div>
// // // //                         <div className="text-xs text-gray-500 flex justify-end items-center">
// // // //                             {new Date(msg.timestamp).toLocaleString([], {
// // // //                                 year: 'numeric',
// // // //                                 month: '2-digit',
// // // //                                 day: '2-digit',
// // // //                                 hour: '2-digit',
// // // //                                 minute: '2-digit',
// // // //                                 hour12: true
// // // //                             })}
// // // //                             {msg.sender === user.id && (
// // // //                                 <span className="ml-2">
// // // //                                     {msg.read ? (
// // // //                                         <span className="text-blue-500">✔✔</span>
// // // //                                     ) : (
// // // //                                         <span>✔</span>
// // // //                                     )}
// // // //                                 </span>
// // // //                             )}
// // // //                         </div>
// // // //                     </div>
// // // //                 ))}
// // // //             </div>
// // // //             <div className="flex items-center p-4 border-t border-gray-300">
// // // //                 <input
// // // //                     type="file"
// // // //                     multiple
// // // //                     accept="image/*,video/*"
// // // //                     className="hidden"
// // // //                     id="fileInput"
// // // //                     onChange={handleFileChange}
// // // //                 />
// // // //                 <label htmlFor="fileInput" className="cursor-pointer">
// // // //                     <span className="material-icons">📎</span>
// // // //                 </label>
// // // //                 <div className="flex flex-wrap">
// // // //                     {selectedFiles.map((file, index) => (
// // // //                         <div key={index} className="relative mr-2">
// // // //                             <span
// // // //                                 className="absolute top-0 right-0 cursor-pointer text-red-500"
// // // //                                 onClick={() => removeFile(index)}
// // // //                             >
// // // //                                 &times;
// // // //                             </span>
// // // //                             <span>{file.name}</span>
// // // //                         </div>
// // // //                     ))}
// // // //                 </div>
// // // //                 <input
// // // //                     type="text"
// // // //                     value={messageText}
// // // //                     onChange={(e) => setMessageText(e.target.value)}
// // // //                     placeholder="Type a message..."
// // // //                     className="flex-1 p-2 border border-gray-300 rounded-lg mx-2"
// // // //                 />
// // // //                 <button onClick={sendMessage} className="bg-blue-500 text-white p-2 rounded-lg">
// // // //                     Send
// // // //                 </button>
// // // //             </div>
// // // //         </div>
// // // //     );
// // // // };

// // // // export default Chat;

// // // // // "use client"; // Enable client-side rendering
// // // // // import React, { useState, useEffect } from 'react';
// // // // // import { database, storage } from '../config/firebase'; // Ensure Firebase Storage is configured
// // // // // import { ref as databaseRef, onValue, push, update } from 'firebase/database';
// // // // // import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
// // // // // import 'tailwindcss/tailwind.css';

// // // // // const Chat = ({ user }) => {
// // // // //     const otherUser = user.id === 'user1' ? { id: 'user2', name: 'User 2' } : { id: 'user1', name: 'User 1' };

// // // // //     const [messages, setMessages] = useState([]);
// // // // //     const [messageText, setMessageText] = useState('');
// // // // //     const [selectedFiles, setSelectedFiles] = useState([]);
// // // // //     const [uploading, setUploading] = useState(false);
// // // // //     const [otherUserStatus, setOtherUserStatus] = useState(''); // Online status or last seen
// // // // //     const [isOtherUserTyping, setIsOtherUserTyping] = useState(false); // Typing status

// // // // //     // Fetch messages and user status on component mount
// // // // //     useEffect(() => {
// // // // //         const messagesRef = databaseRef(database, `messages/${user.id}/${otherUser.id}`);
// // // // //         const userStatusRef = databaseRef(database, `users/${otherUser.id}/status`);
// // // // //         const typingRef = databaseRef(database, `typing/${otherUser.id}`);

// // // // //         // Get messages
// // // // //         onValue(messagesRef, (snapshot) => {
// // // // //             const data = snapshot.val();
// // // // //             const loadedMessages = data ? Object.values(data) : [];
// // // // //             setMessages(loadedMessages);

// // // // //             // Mark all messages as read when the user views the chat
// // // // //             loadedMessages.forEach((msg) => {
// // // // //                 if (!msg.read && msg.sender !== user.id) {
// // // // //                     update(databaseRef(database, `messages/${user.id}/${otherUser.id}/${msg.id}`), { read: true });
// // // // //                     update(databaseRef(database, `messages/${otherUser.id}/${user.id}/${msg.id}`), { read: true });
// // // // //                 }
// // // // //             });
// // // // //         });

// // // // //         // Fetch user's status
// // // // //         onValue(userStatusRef, (snapshot) => {
// // // // //             const status = snapshot.val();
// // // // //             if (status) {
// // // // //                 if (status.online) {
// // // // //                     setOtherUserStatus('Online');
// // // // //                 } else if (status.lastSeen) {
// // // // //                     const lastSeenTime = new Date(status.lastSeen);
// // // // //                     setOtherUserStatus('Last seen: ' + lastSeenTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
// // // // //                 } else {
// // // // //                     setOtherUserStatus('Last seen: Unknown'); // Adjust if necessary
// // // // //                 }
// // // // //             } else {
// // // // //                 setOtherUserStatus('Last seen: Unknown'); // If status data is not available
// // // // //             }
// // // // //         });

// // // // //         // Handle typing status
// // // // //         onValue(typingRef, (snapshot) => {
// // // // //             const typingData = snapshot.val();
// // // // //             setIsOtherUserTyping(typingData?.typing || false);
// // // // //         });

// // // // //         // Update user status to online when the component mounts
// // // // //         update(databaseRef(database, `users/${user.id}/status`), { online: true, lastSeen: null });

// // // // //         // Set user to offline when the component unmounts
// // // // //         return () => {
// // // // //             update(databaseRef(database, `users/${user.id}/status`), { online: false, lastSeen: Date.now() });
// // // // //         };
// // // // //     }, [user.id, otherUser.id]);

// // // // //     // Handle file selection
// // // // //     const handleFileChange = (event) => {
// // // // //         const files = Array.from(event.target.files);
// // // // //         setSelectedFiles((prevFiles) => [...prevFiles, ...files]);
// // // // //     };

// // // // //     // Remove a selected file
// // // // //     const removeFile = (index) => {
// // // // //         setSelectedFiles((prevFiles) => prevFiles.filter((_, i) => i !== index));
// // // // //     };

// // // // //     // Function to send a new message with media support
// // // // //     const sendMessage = async () => {
// // // // //         if (messageText.trim() === "" && selectedFiles.length === 0) return; // Prevent sending empty messages

// // // // //         const messagesRef = databaseRef(database, `messages/${user.id}/${otherUser.id}`);
// // // // //         const newMessage = {
// // // // //             text: messageText,
// // // // //             sender: user.id,
// // // // //             timestamp: Date.now(),
// // // // //             read: false,
// // // // //             files: [],
// // // // //         };

// // // // //         setUploading(true);

// // // // //         // Upload selected files (images and videos) to Firebase Storage
// // // // //         const uploadedFiles = await Promise.all(selectedFiles.map(async (file) => {
// // // // //             const fileRef = storageRef(storage, `chatFiles/${file.name}`);
// // // // //             await uploadBytes(fileRef, file);
// // // // //             return getDownloadURL(fileRef);
// // // // //         }));

// // // // //         // Update newMessage with uploaded file URLs
// // // // //         newMessage.files = uploadedFiles;

// // // // //         // Push message to Firebase Database
// // // // //         const newMsgRef = await push(messagesRef, newMessage);
// // // // //         setMessageText(''); // Clear input after sending
// // // // //         setSelectedFiles([]); // Clear selected files

// // // // //         // Update the recipient's message status
// // // // //         const recipientRef = databaseRef(database, `messages/${otherUser.id}/${user.id}`);
// // // // //         await push(recipientRef, { ...newMessage, id: newMsgRef.key });

// // // // //         setUploading(false);
// // // // //     };

// // // // //     // Function to handle typing status
// // // // //     useEffect(() => {
// // // // //         const typingRef = databaseRef(database, `typing/${user.id}`);

// // // // //         if (messageText.trim() || selectedFiles.length > 0) {
// // // // //             update(typingRef, { typing: true });
// // // // //         } else {
// // // // //             update(typingRef, { typing: false });
// // // // //         }

// // // // //         // Cleanup function to stop typing when unmounting
// // // // //         return () => {
// // // // //             update(typingRef, { typing: false });
// // // // //         };
// // // // //     }, [messageText, selectedFiles, user.id]);

// // // // //     const renderMedia = (files) => {
// // // // //         if (!files || files.length === 0) return null;

// // // // //         return (
// // // // //             <div className="flex flex-wrap mt-1">
// // // // //                 {files.map((file, index) => (
// // // // //                     <a
// // // // //                         key={index}
// // // // //                         href={file}
// // // // //                         target="_blank"
// // // // //                         rel="noopener noreferrer"
// // // // //                         className="w-20 h-20 flex items-center justify-center border border-gray-300 rounded-lg m-1"
// // // // //                     >
// // // // //                         {file.endsWith('.jpg') || file.endsWith('.png') || file.endsWith('.gif') ? (
// // // // //                             <img src={file} alt="Media" className="object-cover h-full w-full rounded-lg" />
// // // // //                         ) : (
// // // // //                             <span className="text-sm">File</span>
// // // // //                         )}
// // // // //                     </a>
// // // // //                 ))}
// // // // //             </div>
// // // // //         );
// // // // //     };

// // // // //     return (
// // // // //         <div className="flex flex-col h-screen bg-gray-100">
// // // // //             <div className="flex-none p-4 bg-white border-b border-gray-300">
// // // // //                 <h2 className="text-xl text-center">{otherUser.name}</h2>
// // // // //                 <p className="text-sm text-center">{otherUserStatus}</p>
// // // // //                 {isOtherUserTyping && <p className="text-sm text-center italic">User is typing...</p>}
// // // // //             </div>
// // // // //             <div className="flex-1 overflow-y-auto p-4">
// // // // //                 {/* Display messages */}
// // // // //                 {messages.map((msg, index) => (
// // // // //                     <div key={index} className={`mb-2 ${msg.sender === user.id ? 'text-right' : 'text-left'}`}>
// // // // //                         <div className={`inline-block p-2 rounded-lg ${msg.sender === user.id ? 'bg-blue-500 text-white' : 'bg-gray-300'}`}>
// // // // //                             {msg.text}
// // // // //                             {renderMedia(msg.files)}
// // // // //                         </div>
// // // // //                         <div className="text-xs text-gray-500 flex justify-end items-center">
// // // // //                             {new Date(msg.timestamp).toLocaleTimeString()}
// // // // //                             {msg.sender === user.id && (
// // // // //                                 <span className="ml-2">
// // // // //                                     {msg.read ? (
// // // // //                                         <span className="text-blue-500">✔✔</span>
// // // // //                                     ) : (
// // // // //                                         <span>✔</span>
// // // // //                                     )}
// // // // //                                 </span>
// // // // //                             )}
// // // // //                         </div>
// // // // //                     </div>
// // // // //                 ))}
// // // // //             </div>
// // // // //             <div className="flex items-center p-4 border-t border-gray-300">
// // // // //                 <input
// // // // //                     type="file"
// // // // //                     multiple
// // // // //                     accept="image/*,video/*"
// // // // //                     className="hidden"
// // // // //                     id="fileInput"
// // // // //                     onChange={handleFileChange}
// // // // //                 />
// // // // //                 <label htmlFor="fileInput" className="cursor-pointer">
// // // // //                     <span className="material-icons">📎</span>
// // // // //                 </label>
// // // // //                 <div className="flex flex-wrap">
// // // // //                     {selectedFiles.map((file, index) => (
// // // // //                         <div key={index} className="relative mr-2">
// // // // //                             <span
// // // // //                                 className="absolute top-0 right-0 cursor-pointer text-red-500"
// // // // //                                 onClick={() => removeFile(index)}
// // // // //                             >
// // // // //                                 &times;
// // // // //                             </span>
// // // // //                             <span>{file.name}</span>
// // // // //                         </div>
// // // // //                     ))}
// // // // //                 </div>
// // // // //                 <input
// // // // //                     type="text"
// // // // //                     className="border rounded-lg p-2 flex-1 mx-2"
// // // // //                     value={messageText}
// // // // //                     onChange={(e) => setMessageText(e.target.value)}
// // // // //                     placeholder="Type a message..."
// // // // //                 />
// // // // //                 <button
// // // // //                     className="bg-blue-500 text-white rounded-lg p-2"
// // // // //                     onClick={sendMessage}
// // // // //                     disabled={uploading}
// // // // //                 >
// // // // //                     {uploading ? 'Sending...' : 'Send'}
// // // // //                 </button>
// // // // //             </div>
// // // // //         </div>
// // // // //     );
// // // // // };

// // // // // export default Chat;


// // // // // // "use client"; // Enable client-side rendering
// // // // // // import React, { useState, useEffect } from 'react';
// // // // // // import { database, storage } from '../config/firebase'; // Ensure Firebase Storage is configured
// // // // // // import { ref as databaseRef, onValue, push, update } from 'firebase/database';
// // // // // // import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
// // // // // // import 'tailwindcss/tailwind.css';

// // // // // // const Chat = ({ user }) => {
// // // // // //     const otherUser = user.id === 'user1' ? { id: 'user2', name: 'User 2' } : { id: 'user1', name: 'User 1' };

// // // // // //     const [messages, setMessages] = useState([]);
// // // // // //     const [messageText, setMessageText] = useState('');
// // // // // //     const [selectedFiles, setSelectedFiles] = useState([]);
// // // // // //     const [uploading, setUploading] = useState(false);
// // // // // //     const [otherUserStatus, setOtherUserStatus] = useState(''); // Online status or last seen
// // // // // //     const [isOtherUserTyping, setIsOtherUserTyping] = useState(false); // Typing status

// // // // // //     // Fetch messages and user status on component mount
// // // // // //     useEffect(() => {
// // // // // //         const messagesRef = databaseRef(database, `messages/${user.id}/${otherUser.id}`);
// // // // // //         const userStatusRef = databaseRef(database, `users/${otherUser.id}/status`);
// // // // // //         const typingRef = databaseRef(database, `typing/${otherUser.id}`);

// // // // // //         // Get messages
// // // // // //         onValue(messagesRef, (snapshot) => {
// // // // // //             const data = snapshot.val();
// // // // // //             const loadedMessages = data ? Object.values(data) : [];
// // // // // //             setMessages(loadedMessages);

// // // // // //             // Mark all messages as read when the user views the chat
// // // // // //             loadedMessages.forEach((msg) => {
// // // // // //                 if (!msg.read && msg.sender !== user.id) {
// // // // // //                     update(databaseRef(database, `messages/${user.id}/${otherUser.id}/${msg.id}`), { read: true });
// // // // // //                     update(databaseRef(database, `messages/${otherUser.id}/${user.id}/${msg.id}`), { read: true });
// // // // // //                 }
// // // // // //             });
// // // // // //         });

// // // // // //         // Fetch user's status
// // // // // //         onValue(userStatusRef, (snapshot) => {
// // // // // //             const status = snapshot.val();
// // // // // //             if (status) {
// // // // // //                 if (status.online) {
// // // // // //                     setOtherUserStatus('Online');
// // // // // //                 } else if (status.lastSeen) {
// // // // // //                     const lastSeenTime = new Date(status.lastSeen);
// // // // // //                     setOtherUserStatus('Last seen: ' + lastSeenTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
// // // // // //                 } else {
// // // // // //                     setOtherUserStatus('Last seen: Unknown'); // Adjust if necessary
// // // // // //                 }
// // // // // //             } else {
// // // // // //                 setOtherUserStatus('Last seen: Unknown'); // If status data is not available
// // // // // //             }
// // // // // //         });

// // // // // //         // Handle typing status
// // // // // //         onValue(typingRef, (snapshot) => {
// // // // // //             const typingData = snapshot.val();
// // // // // //             setIsOtherUserTyping(typingData?.typing || false);
// // // // // //         });

// // // // // //         // Update user status to online when the component mounts
// // // // // //         update(databaseRef(database, `users/${user.id}/status`), { online: true, lastSeen: null });

// // // // // //         // Set user to offline when the component unmounts
// // // // // //         return () => {
// // // // // //             update(databaseRef(database, `users/${user.id}/status`), { online: false, lastSeen: Date.now() });
// // // // // //         };
// // // // // //     }, [user.id, otherUser.id]);

// // // // // //     // Handle file selection
// // // // // //     const handleFileChange = (event) => {
// // // // // //         const files = Array.from(event.target.files);
// // // // // //         setSelectedFiles((prevFiles) => [...prevFiles, ...files]);
// // // // // //     };

// // // // // //     // Remove a selected file
// // // // // //     const removeFile = (index) => {
// // // // // //         setSelectedFiles((prevFiles) => prevFiles.filter((_, i) => i !== index));
// // // // // //     };

// // // // // //     // Function to send a new message with media support
// // // // // //     const sendMessage = async () => {
// // // // // //         if (messageText.trim() === "" && selectedFiles.length === 0) return; // Prevent sending empty messages

// // // // // //         const messagesRef = databaseRef(database, `messages/${user.id}/${otherUser.id}`);
// // // // // //         const newMessage = {
// // // // // //             text: messageText,
// // // // // //             sender: user.id,
// // // // // //             timestamp: Date.now(),
// // // // // //             read: false,
// // // // // //             files: [],
// // // // // //         };

// // // // // //         setUploading(true);

// // // // // //         // Upload selected files (images and videos) to Firebase Storage
// // // // // //         const uploadedFiles = await Promise.all(selectedFiles.map(async (file) => {
// // // // // //             const fileRef = storageRef(storage, `chatFiles/${file.name}`);
// // // // // //             await uploadBytes(fileRef, file);
// // // // // //             return getDownloadURL(fileRef);
// // // // // //         }));

// // // // // //         // Update newMessage with uploaded file URLs
// // // // // //         newMessage.files = uploadedFiles;

// // // // // //         // Push message to Firebase Database
// // // // // //         const newMsgRef = await push(messagesRef, newMessage);
// // // // // //         setMessageText(''); // Clear input after sending
// // // // // //         setSelectedFiles([]); // Clear selected files

// // // // // //         // Update the recipient's message status
// // // // // //         const recipientRef = databaseRef(database, `messages/${otherUser.id}/${user.id}`);
// // // // // //         await push(recipientRef, { ...newMessage, id: newMsgRef.key });

// // // // // //         setUploading(false);
// // // // // //     };

// // // // // //     // Function to handle typing status
// // // // // //     useEffect(() => {
// // // // // //         const typingRef = databaseRef(database, `typing/${user.id}`);

// // // // // //         if (messageText.trim() || selectedFiles.length > 0) {
// // // // // //             update(typingRef, { typing: true });
// // // // // //         } else {
// // // // // //             update(typingRef, { typing: false });
// // // // // //         }

// // // // // //         // Cleanup function to stop typing when unmounting
// // // // // //         return () => {
// // // // // //             update(typingRef, { typing: false });
// // // // // //         };
// // // // // //     }, [messageText, selectedFiles, user.id]);

// // // // // //     const renderMedia = (files) => {
// // // // // //         if (!files || files.length === 0) return null;

// // // // // //         return (
// // // // // //             <div className="flex flex-wrap mt-1">
// // // // // //                 {files.map((file, index) => (
// // // // // //                     <a
// // // // // //                         key={index}
// // // // // //                         href={file}
// // // // // //                         target="_blank"
// // // // // //                         rel="noopener noreferrer"
// // // // // //                         className="w-20 h-20 flex items-center justify-center border border-gray-300 rounded-lg m-1"
// // // // // //                     >
// // // // // //                         {file.endsWith('.jpg') || file.endsWith('.png') || file.endsWith('.gif') ? (
// // // // // //                             <img src={file} alt="Media" className="object-cover h-full w-full rounded-lg" />
// // // // // //                         ) : (
// // // // // //                             <span className="text-sm">File</span>
// // // // // //                         )}
// // // // // //                     </a>
// // // // // //                 ))}
// // // // // //             </div>
// // // // // //         );
// // // // // //     };

// // // // // //     return (
// // // // // //         <div className="flex flex-col h-screen bg-gray-100">
// // // // // //             <div className="flex-none p-4 bg-white border-b border-gray-300">
// // // // // //                 <h2 className="text-xl text-center">{otherUser.name}</h2>
// // // // // //                 <p className="text-sm text-center">{otherUserStatus}</p>
// // // // // //                 {isOtherUserTyping && <p className="text-sm text-center italic">User is typing...</p>}
// // // // // //             </div>
// // // // // //             <div className="flex-1 overflow-y-auto p-4">
// // // // // //                 {/* Display messages */}
// // // // // //                 {messages.map((msg, index) => (
// // // // // //                     <div key={index} className={`mb-2 ${msg.sender === user.id ? 'text-right' : 'text-left'}`}>
// // // // // //                         <div className={`inline-block p-2 rounded-lg ${msg.sender === user.id ? 'bg-blue-500 text-white' : 'bg-gray-300'}`}>
// // // // // //                             {msg.text}
// // // // // //                             {renderMedia(msg.files)}
// // // // // //                         </div>
// // // // // //                         <div className="text-xs text-gray-500 flex justify-end items-center">
// // // // // //                             {new Date(msg.timestamp).toLocaleTimeString()}
// // // // // //                             {msg.sender === user.id && (
// // // // // //                                 <span className="ml-2">
// // // // // //                                     {msg.read ? (
// // // // // //                                         <span className="text-blue-500">✔✔</span>
// // // // // //                                     ) : (
// // // // // //                                         <span>✔</span>
// // // // // //                                     )}
// // // // // //                                 </span>
// // // // // //                             )}
// // // // // //                         </div>
// // // // // //                     </div>
// // // // // //                 ))}
// // // // // //             </div>
// // // // // //             <div className="flex items-center p-4 border-t border-gray-300">
// // // // // //                 <input
// // // // // //                     type="file"
// // // // // //                     multiple
// // // // // //                     accept="image/*,video/*"
// // // // // //                     className="hidden"
// // // // // //                     id="fileInput"
// // // // // //                     onChange={handleFileChange}
// // // // // //                 />
// // // // // //                 <label htmlFor="fileInput" className="cursor-pointer">
// // // // // //                     <span className="material-icons">📎</span>
// // // // // //                 </label>
// // // // // //                 <div className="flex flex-wrap">
// // // // // //                     {selectedFiles.map((file, index) => (
// // // // // //                         <div key={index} className="relative mr-2">
// // // // // //                             <span
// // // // // //                                 className="absolute top-0 right-0 cursor-pointer text-red-500"
// // // // // //                                 onClick={() => removeFile(index)}
// // // // // //                             >
// // // // // //                                 &times;
// // // // // //                             </span>
// // // // // //                             <span>{file.name}</span>
// // // // // //                         </div>
// // // // // //                     ))}
// // // // // //                 </div>
// // // // // //                 <input
// // // // // //                     type="text"
// // // // // //                     className="border rounded-lg p-2 flex-1 mx-2"
// // // // // //                     placeholder="Type a message..."
// // // // // //                     value={messageText}
// // // // // //                     onChange={(e) => setMessageText(e.target.value)}
// // // // // //                 />
// // // // // //                 <button
// // // // // //                     className="bg-blue-500 text-white rounded-lg p-2"
// // // // // //                     onClick={sendMessage}
// // // // // //                     disabled={uploading}
// // // // // //                 >
// // // // // //                     {uploading ? 'Sending...' : 'Send'}
// // // // // //                 </button>
// // // // // //             </div>
// // // // // //         </div>
// // // // // //     );
// // // // // // };

// // // // // // export default Chat;

// // // // // // // "use client"; // Enable client-side rendering
// // // // // // // import React, { useState, useEffect } from 'react';
// // // // // // // import { database, storage } from '../config/firebase'; // Make sure Firebase Storage is configured
// // // // // // // import { ref as databaseRef, onValue, push, update } from 'firebase/database';
// // // // // // // import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
// // // // // // // import 'tailwindcss/tailwind.css';

// // // // // // // const Chat = ({ user }) => {
// // // // // // //     const otherUser = user.id === 'user1' ? { id: 'user2', name: 'User 2' } : { id: 'user1', name: 'User 1' };

// // // // // // //     const [messages, setMessages] = useState([]);
// // // // // // //     const [messageText, setMessageText] = useState('');
// // // // // // //     const [selectedFiles, setSelectedFiles] = useState([]);
// // // // // // //     const [uploading, setUploading] = useState(false);
// // // // // // //     const [otherUserStatus, setOtherUserStatus] = useState(''); // Online status or last seen
// // // // // // //     const [isOtherUserTyping, setIsOtherUserTyping] = useState(false); // Typing status

// // // // // // //     // Fetch messages from Firebase on component mount
// // // // // // //     useEffect(() => {
// // // // // // //         const messagesRef = databaseRef(database, `messages/${user.id}/${otherUser.id}`);
// // // // // // //         const userStatusRef = databaseRef(database, `status/${otherUser.id}`);
// // // // // // //         const typingRef = databaseRef(database, `typing/${otherUser.id}`);

// // // // // // //         // Get messages
// // // // // // //         onValue(messagesRef, (snapshot) => {
// // // // // // //             const data = snapshot.val();
// // // // // // //             const loadedMessages = data ? Object.values(data) : [];
// // // // // // //             setMessages(loadedMessages);

// // // // // // //             // Mark all messages as read when the user views the chat
// // // // // // //             loadedMessages.forEach((msg) => {
// // // // // // //                 if (!msg.read && msg.sender !== user.id) {
// // // // // // //                     update(databaseRef(database, `messages/${user.id}/${otherUser.id}/${msg.id}`), { read: true });
// // // // // // //                     update(databaseRef(database, `messages/${otherUser.id}/${user.id}/${msg.id}`), { read: true });
// // // // // // //                 }
// // // // // // //             });
// // // // // // //         });

// // // // // // //         // User status and typing
// // // // // // //         onValue(userStatusRef, (snapshot) => {
// // // // // // //             const status = snapshot.val();
// // // // // // //             if (status) {
// // // // // // //                 if (status.online) {
// // // // // // //                     setOtherUserStatus('Online');
// // // // // // //                 } else {
// // // // // // //                     const lastSeenTime = new Date(status.lastSeen);
// // // // // // //                     setOtherUserStatus(`Last seen: ${lastSeenTime.toLocaleTimeString()}`);
// // // // // // //                 }
// // // // // // //             } else {
// // // // // // //                 setOtherUserStatus('Status not available');
// // // // // // //             }
// // // // // // //         });

// // // // // // //         onValue(typingRef, (snapshot) => {
// // // // // // //             const typingData = snapshot.val();
// // // // // // //             setIsOtherUserTyping(typingData?.typing || false);
// // // // // // //         });

// // // // // // //         // Update user status to online when the component mounts
// // // // // // //         update(databaseRef(database, `status/${user.id}`), { online: true, lastSeen: null });

// // // // // // //         // Set user to offline when the component unmounts
// // // // // // //         return () => {
// // // // // // //             const lastSeenTime = Date.now();
// // // // // // //             update(databaseRef(database, `status/${user.id}`), { online: false, lastSeen: lastSeenTime });
// // // // // // //         };
// // // // // // //     }, [user.id, otherUser.id]);

// // // // // // //     // Handle file selection
// // // // // // //     const handleFileChange = (event) => {
// // // // // // //         const files = Array.from(event.target.files);
// // // // // // //         setSelectedFiles((prevFiles) => [...prevFiles, ...files]);
// // // // // // //     };

// // // // // // //     // Remove a selected file
// // // // // // //     const removeFile = (index) => {
// // // // // // //         setSelectedFiles((prevFiles) => prevFiles.filter((_, i) => i !== index));
// // // // // // //     };

// // // // // // //     // Function to send a new message with media support
// // // // // // //     const sendMessage = async () => {
// // // // // // //         if (messageText.trim() === "" && selectedFiles.length === 0) return; // Prevent sending empty messages

// // // // // // //         const messagesRef = databaseRef(database, `messages/${user.id}/${otherUser.id}`);
// // // // // // //         const newMessage = {
// // // // // // //             text: messageText,
// // // // // // //             sender: user.id,
// // // // // // //             timestamp: Date.now(),
// // // // // // //             read: false,
// // // // // // //             files: [],
// // // // // // //         };

// // // // // // //         setUploading(true);

// // // // // // //         // Upload selected files (images and videos) to Firebase Storage
// // // // // // //         const uploadedFiles = await Promise.all(selectedFiles.map(async (file) => {
// // // // // // //             const fileRef = storageRef(storage, `chatFiles/${file.name}`);
// // // // // // //             await uploadBytes(fileRef, file);
// // // // // // //             return getDownloadURL(fileRef);
// // // // // // //         }));

// // // // // // //         // Update newMessage with uploaded file URLs
// // // // // // //         newMessage.files = uploadedFiles;

// // // // // // //         // Push message to Firebase Database
// // // // // // //         const newMsgRef = await push(messagesRef, newMessage);
// // // // // // //         setMessageText(''); // Clear input after sending
// // // // // // //         setSelectedFiles([]); // Clear selected files

// // // // // // //         // Update the recipient's message status
// // // // // // //         const recipientRef = databaseRef(database, `messages/${otherUser.id}/${user.id}`);
// // // // // // //         await push(recipientRef, { ...newMessage, id: newMsgRef.key });

// // // // // // //         setUploading(false);
// // // // // // //     };

// // // // // // //     // Function to handle typing status
// // // // // // //     useEffect(() => {
// // // // // // //         const typingRef = databaseRef(database, `typing/${user.id}`);

// // // // // // //         if (messageText.trim() || selectedFiles.length > 0) {
// // // // // // //             update(typingRef, { typing: true });
// // // // // // //         } else {
// // // // // // //             update(typingRef, { typing: false });
// // // // // // //         }

// // // // // // //         // Cleanup function to stop typing when unmounting
// // // // // // //         return () => {
// // // // // // //             update(typingRef, { typing: false });
// // // // // // //         };
// // // // // // //     }, [messageText, selectedFiles, user.id]);

// // // // // // //     const renderMedia = (files) => {
// // // // // // //         if (!files || files.length === 0) return null;

// // // // // // //         return (
// // // // // // //             <div className="flex flex-wrap mt-1">
// // // // // // //                 {files.map((file, index) => (
// // // // // // //                     <a
// // // // // // //                         key={index}
// // // // // // //                         href={file}
// // // // // // //                         target="_blank"
// // // // // // //                         rel="noopener noreferrer"
// // // // // // //                         className="w-20 h-20 flex items-center justify-center border border-gray-300 rounded-lg m-1"
// // // // // // //                     >
// // // // // // //                         {file.endsWith('.jpg') || file.endsWith('.png') || file.endsWith('.gif') ? (
// // // // // // //                             <img src={file} alt="Media" className="object-cover h-full w-full rounded-lg" />
// // // // // // //                         ) : (
// // // // // // //                             <span className="text-sm">File</span>
// // // // // // //                         )}
// // // // // // //                     </a>
// // // // // // //                 ))}
// // // // // // //             </div>
// // // // // // //         );
// // // // // // //     };

// // // // // // //     return (
// // // // // // //         <div className="flex flex-col h-screen bg-gray-100">
// // // // // // //             <div className="flex-none p-4 bg-white border-b border-gray-300">
// // // // // // //                 <h2 className="text-xl text-center">{otherUser.name}</h2>
// // // // // // //                 <p className="text-sm text-center">{otherUserStatus}</p>
// // // // // // //                 {isOtherUserTyping && <p className="text-sm text-center italic">User is typing...</p>}
// // // // // // //             </div>
// // // // // // //             <div className="flex-1 overflow-y-auto p-4">
// // // // // // //                 {/* Display messages */}
// // // // // // //                 {messages.map((msg, index) => (
// // // // // // //                     <div key={index} className={`mb-2 ${msg.sender === user.id ? 'text-right' : 'text-left'}`}>
// // // // // // //                         <div className={`inline-block p-2 rounded-lg ${msg.sender === user.id ? 'bg-blue-500 text-white' : 'bg-gray-300'}`}>
// // // // // // //                             {msg.text}
// // // // // // //                             {renderMedia(msg.files)}
// // // // // // //                         </div>
// // // // // // //                         <div className="text-xs text-gray-500 flex justify-end items-center">
// // // // // // //                             {new Date(msg.timestamp).toLocaleTimeString()}
// // // // // // //                             {msg.sender === user.id && (
// // // // // // //                                 <span className="ml-2">
// // // // // // //                                     {msg.read ? (
// // // // // // //                                         <span className="text-blue-500">✔✔</span>
// // // // // // //                                     ) : (
// // // // // // //                                         <span>✔</span>
// // // // // // //                                     )}
// // // // // // //                                 </span>
// // // // // // //                             )}
// // // // // // //                         </div>
// // // // // // //                     </div>
// // // // // // //                 ))}
// // // // // // //             </div>
// // // // // // //             <div className="flex items-center p-4 border-t border-gray-300">
// // // // // // //                 <input
// // // // // // //                     type="file"
// // // // // // //                     multiple
// // // // // // //                     accept="image/*,video/*"
// // // // // // //                     className="hidden"
// // // // // // //                     id="fileInput"
// // // // // // //                     onChange={handleFileChange}
// // // // // // //                 />
// // // // // // //                 <label htmlFor="fileInput" className="cursor-pointer">
// // // // // // //                     <span className="material-icons">📎</span>
// // // // // // //                 </label>
// // // // // // //                 <div className="flex flex-wrap">
// // // // // // //                     {selectedFiles.map((file, index) => (
// // // // // // //                         <div key={index} className="relative mr-2">
// // // // // // //                             <span
// // // // // // //                                 className="absolute top-0 right-0 cursor-pointer text-red-500"
// // // // // // //                                 onClick={() => removeFile(index)}
// // // // // // //                             >
// // // // // // //                                 &times;
// // // // // // //                             </span>
// // // // // // //                             <span>{file.name}</span>
// // // // // // //                         </div>
// // // // // // //                     ))}
// // // // // // //                 </div>
// // // // // // //                 <input
// // // // // // //                     type="text"
// // // // // // //                     className="border rounded-lg p-2 flex-1 mx-2"
// // // // // // //                     placeholder="Type a message..."
// // // // // // //                     value={messageText}
// // // // // // //                     onChange={(e) => setMessageText(e.target.value)}
// // // // // // //                 />
// // // // // // //                 <button
// // // // // // //                     className="bg-blue-500 text-white rounded-lg p-2"
// // // // // // //                     onClick={sendMessage}
// // // // // // //                     disabled={uploading}
// // // // // // //                 >
// // // // // // //                     {uploading ? 'Sending...' : 'Send'}
// // // // // // //                 </button>
// // // // // // //             </div>
// // // // // // //         </div>
// // // // // // //     );
// // // // // // // };

// // // // // // // export default Chat;

// // // // // // // // "use client"; // Enable client-side rendering
// // // // // // // // import React, { useState, useEffect } from 'react';
// // // // // // // // import { database, storage } from '../config/firebase'; // Pastikan Firebase Storage sudah dikonfigurasi
// // // // // // // // import { ref as databaseRef, onValue, push, update } from 'firebase/database';
// // // // // // // // import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
// // // // // // // // import 'tailwindcss/tailwind.css';

// // // // // // // // const Chat = ({ user }) => {
// // // // // // // //     const otherUser = user.id === 'user1' ? { id: 'user2', name: 'User 2' } : { id: 'user1', name: 'User 1' };

// // // // // // // //     const [messages, setMessages] = useState([]);
// // // // // // // //     const [messageText, setMessageText] = useState('');
// // // // // // // //     const [selectedFiles, setSelectedFiles] = useState([]);
// // // // // // // //     const [uploading, setUploading] = useState(false);
// // // // // // // //     const [otherUserStatus, setOtherUserStatus] = useState(''); // Online status or last seen
// // // // // // // //     const [isOtherUserTyping, setIsOtherUserTyping] = useState(false); // Typing status

// // // // // // // //     // Fetch messages from Firebase on component mount
// // // // // // // //     useEffect(() => {
// // // // // // // //         const messagesRef = databaseRef(database, `messages/${user.id}/${otherUser.id}`);
// // // // // // // //         const userStatusRef = databaseRef(database, `status/${otherUser.id}`);
// // // // // // // //         const typingRef = databaseRef(database, `typing/${otherUser.id}`);

// // // // // // // //         // Get messages
// // // // // // // //         onValue(messagesRef, (snapshot) => {
// // // // // // // //             const data = snapshot.val();
// // // // // // // //             const loadedMessages = data ? Object.values(data) : [];
// // // // // // // //             setMessages(loadedMessages);

// // // // // // // //             // Mark all messages as read when the user views the chat
// // // // // // // //             loadedMessages.forEach((msg) => {
// // // // // // // //                 if (!msg.read && msg.sender !== user.id) {
// // // // // // // //                     update(databaseRef(database, `messages/${user.id}/${otherUser.id}/${msg.id}`), { read: true });
// // // // // // // //                     update(databaseRef(database, `messages/${otherUser.id}/${user.id}/${msg.id}`), { read: true });
// // // // // // // //                 }
// // // // // // // //             });
// // // // // // // //         });

// // // // // // // //         // User status and typing
// // // // // // // //         onValue(userStatusRef, (snapshot) => {
// // // // // // // //             const status = snapshot.val();
// // // // // // // //             if (status) {
// // // // // // // //                 if (status.online) {
// // // // // // // //                     setOtherUserStatus('Online');
// // // // // // // //                 } else {
// // // // // // // //                     const lastSeenTime = new Date(status.lastSeen);
// // // // // // // //                     setOtherUserStatus(`Last seen: ${lastSeenTime.toLocaleTimeString()}`);
// // // // // // // //                 }
// // // // // // // //             } else {
// // // // // // // //                 setOtherUserStatus('Status not available');
// // // // // // // //             }
// // // // // // // //         });

// // // // // // // //         onValue(typingRef, (snapshot) => {
// // // // // // // //             const typingData = snapshot.val();
// // // // // // // //             setIsOtherUserTyping(typingData?.typing || false);
// // // // // // // //         });

// // // // // // // //         // Update user status to online when the component mounts
// // // // // // // //         update(databaseRef(database, `status/${user.id}`), { online: true, lastSeen: null });

// // // // // // // //         // Set user to offline when the component unmounts
// // // // // // // //         return () => {
// // // // // // // //             update(databaseRef(database, `status/${user.id}`), { online: false, lastSeen: Date.now() });
// // // // // // // //         };
// // // // // // // //     }, [user.id, otherUser.id]);

// // // // // // // //     // Handle file selection
// // // // // // // //     const handleFileChange = (event) => {
// // // // // // // //         const files = Array.from(event.target.files);
// // // // // // // //         setSelectedFiles((prevFiles) => [...prevFiles, ...files]);
// // // // // // // //     };

// // // // // // // //     // Remove a selected file
// // // // // // // //     const removeFile = (index) => {
// // // // // // // //         setSelectedFiles((prevFiles) => prevFiles.filter((_, i) => i !== index));
// // // // // // // //     };

// // // // // // // //     // Function to send a new message with media support
// // // // // // // //     const sendMessage = async () => {
// // // // // // // //         if (messageText.trim() === "" && selectedFiles.length === 0) return; // Prevent sending empty messages

// // // // // // // //         const messagesRef = databaseRef(database, `messages/${user.id}/${otherUser.id}`);
// // // // // // // //         const newMessage = {
// // // // // // // //             text: messageText,
// // // // // // // //             sender: user.id,
// // // // // // // //             timestamp: Date.now(),
// // // // // // // //             read: false,
// // // // // // // //             files: [],
// // // // // // // //         };

// // // // // // // //         setUploading(true);

// // // // // // // //         // Upload selected files (images and videos) to Firebase Storage
// // // // // // // //         const uploadedFiles = await Promise.all(selectedFiles.map(async (file) => {
// // // // // // // //             const fileRef = storageRef(storage, `chatFiles/${file.name}`);
// // // // // // // //             await uploadBytes(fileRef, file);
// // // // // // // //             return getDownloadURL(fileRef);
// // // // // // // //         }));

// // // // // // // //         // Update newMessage with uploaded file URLs
// // // // // // // //         newMessage.files = uploadedFiles;

// // // // // // // //         // Push message to Firebase Database
// // // // // // // //         const newMsgRef = await push(messagesRef, newMessage);
// // // // // // // //         setMessageText(''); // Clear input after sending
// // // // // // // //         setSelectedFiles([]); // Clear selected files

// // // // // // // //         // Update the recipient's message status
// // // // // // // //         const recipientRef = databaseRef(database, `messages/${otherUser.id}/${user.id}`);
// // // // // // // //         await push(recipientRef, { ...newMessage, id: newMsgRef.key });

// // // // // // // //         setUploading(false);
// // // // // // // //     };

// // // // // // // //     // Function to handle typing status
// // // // // // // //     useEffect(() => {
// // // // // // // //         const typingRef = databaseRef(database, `typing/${user.id}`);

// // // // // // // //         if (messageText.trim() || selectedFiles.length > 0) {
// // // // // // // //             update(typingRef, { typing: true });
// // // // // // // //         } else {
// // // // // // // //             update(typingRef, { typing: false });
// // // // // // // //         }

// // // // // // // //         // Cleanup function to stop typing when unmounting
// // // // // // // //         return () => {
// // // // // // // //             update(typingRef, { typing: false });
// // // // // // // //         };
// // // // // // // //     }, [messageText, selectedFiles, user.id]);

// // // // // // // //     const renderMedia = (files) => {
// // // // // // // //         if (!files || files.length === 0) return null;

// // // // // // // //         return (
// // // // // // // //             <div className="flex flex-wrap mt-1">
// // // // // // // //                 {files.map((file, index) => (
// // // // // // // //                     <a
// // // // // // // //                         key={index}
// // // // // // // //                         href={file}
// // // // // // // //                         target="_blank"
// // // // // // // //                         rel="noopener noreferrer"
// // // // // // // //                         className="w-20 h-20 flex items-center justify-center border border-gray-300 rounded-lg m-1"
// // // // // // // //                     >
// // // // // // // //                         {file.endsWith('.jpg') || file.endsWith('.png') || file.endsWith('.gif') ? (
// // // // // // // //                             <img src={file} alt="Media" className="object-cover h-full w-full rounded-lg" />
// // // // // // // //                         ) : (
// // // // // // // //                             <span className="text-sm">File</span>
// // // // // // // //                         )}
// // // // // // // //                     </a>
// // // // // // // //                 ))}
// // // // // // // //             </div>
// // // // // // // //         );
// // // // // // // //     };

// // // // // // // //     return (
// // // // // // // //         <div className="flex flex-col h-screen bg-gray-100">
// // // // // // // //             <div className="flex-none p-4 bg-white border-b border-gray-300">
// // // // // // // //                 <h2 className="text-xl text-center">{otherUser.name}</h2>
// // // // // // // //                 <p className="text-sm text-center">{otherUserStatus}</p>
// // // // // // // //                 {isOtherUserTyping && <p className="text-sm text-center italic">User is typing...</p>}
// // // // // // // //             </div>
// // // // // // // //             <div className="flex-1 overflow-y-auto p-4">
// // // // // // // //                 {/* Display messages */}
// // // // // // // //                 {messages.map((msg, index) => (
// // // // // // // //                     <div key={index} className={`mb-2 ${msg.sender === user.id ? 'text-right' : 'text-left'}`}>
// // // // // // // //                         <div className={`inline-block p-2 rounded-lg ${msg.sender === user.id ? 'bg-blue-500 text-white' : 'bg-gray-300'}`}>
// // // // // // // //                             {msg.text}
// // // // // // // //                             {renderMedia(msg.files)}
// // // // // // // //                         </div>
// // // // // // // //                         <div className="text-xs text-gray-500 flex justify-end items-center">
// // // // // // // //                             {new Date(msg.timestamp).toLocaleTimeString()}
// // // // // // // //                             {msg.sender === user.id && (
// // // // // // // //                                 <span className="ml-2">
// // // // // // // //                                     {msg.read ? (
// // // // // // // //                                         <span className="text-blue-500">✔✔</span>
// // // // // // // //                                     ) : (
// // // // // // // //                                         <span>✔</span>
// // // // // // // //                                     )}
// // // // // // // //                                 </span>
// // // // // // // //                             )}
// // // // // // // //                         </div>
// // // // // // // //                     </div>
// // // // // // // //                 ))}
// // // // // // // //             </div>
// // // // // // // //             <div className="flex items-center p-4 border-t border-gray-300">
// // // // // // // //                 <input
// // // // // // // //                     type="file"
// // // // // // // //                     multiple
// // // // // // // //                     accept="image/*,video/*"
// // // // // // // //                     className="hidden"
// // // // // // // //                     id="fileInput"
// // // // // // // //                     onChange={handleFileChange}
// // // // // // // //                 />
// // // // // // // //                 <label htmlFor="fileInput" className="cursor-pointer">
// // // // // // // //                     <span className="material-icons">📎</span>
// // // // // // // //                 </label>
// // // // // // // //                 <div className="flex flex-wrap">
// // // // // // // //                     {selectedFiles.map((file, index) => (
// // // // // // // //                         <div key={index} className="relative mr-2">
// // // // // // // //                             <span
// // // // // // // //                                 className="absolute top-0 right-0 cursor-pointer text-red-500"
// // // // // // // //                                 onClick={() => removeFile(index)}
// // // // // // // //                             >
// // // // // // // //                                 &times;
// // // // // // // //                             </span>
// // // // // // // //                             <span>{file.name}</span>
// // // // // // // //                         </div>
// // // // // // // //                     ))}
// // // // // // // //                 </div>
// // // // // // // //                 <input
// // // // // // // //                     type="text"
// // // // // // // //                     className="border rounded-lg p-2 flex-1 mx-2"
// // // // // // // //                     placeholder="Type a message..."
// // // // // // // //                     value={messageText}
// // // // // // // //                     onChange={(e) => setMessageText(e.target.value)}
// // // // // // // //                 />
// // // // // // // //                 <button
// // // // // // // //                     className="ml-2 p-2 bg-blue-500 text-white rounded-lg"
// // // // // // // //                     onClick={sendMessage}
// // // // // // // //                     disabled={uploading}
// // // // // // // //                 >
// // // // // // // //                     {uploading ? 'Sending...' : 'Send'}
// // // // // // // //                 </button>
// // // // // // // //             </div>
// // // // // // // //         </div>
// // // // // // // //     );
// // // // // // // // };

// // // // // // // // export default Chat;

// // // // // // // // // "use client"; // Enable client-side rendering
// // // // // // // // // import React, { useState, useEffect } from 'react';
// // // // // // // // // import { database, storage } from '../config/firebase'; // Pastikan Firebase Storage sudah dikonfigurasi
// // // // // // // // // import { ref as databaseRef, onValue, push, update } from 'firebase/database';
// // // // // // // // // import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
// // // // // // // // // import 'tailwindcss/tailwind.css';

// // // // // // // // // const Chat = ({ user }) => {
// // // // // // // // //     const otherUser = user.id === 'user1' ? { id: 'user2', name: 'User 2' } : { id: 'user1', name: 'User 1' };

// // // // // // // // //     const [messages, setMessages] = useState([]);
// // // // // // // // //     const [messageText, setMessageText] = useState('');
// // // // // // // // //     const [selectedFiles, setSelectedFiles] = useState([]);
// // // // // // // // //     const [uploading, setUploading] = useState(false);
// // // // // // // // //     const [otherUserStatus, setOtherUserStatus] = useState(''); // Online status or last seen
// // // // // // // // //     const [isOtherUserTyping, setIsOtherUserTyping] = useState(false); // Typing status

// // // // // // // // //     // Fetch messages from Firebase on component mount
// // // // // // // // //     useEffect(() => {
// // // // // // // // //         const messagesRef = databaseRef(database, `messages/${user.id}/${otherUser.id}`);
// // // // // // // // //         onValue(messagesRef, (snapshot) => {
// // // // // // // // //             const data = snapshot.val();
// // // // // // // // //             const loadedMessages = data ? Object.values(data) : [];
// // // // // // // // //             setMessages(loadedMessages);

// // // // // // // // //             // Mark all messages as read when the user views the chat
// // // // // // // // //             loadedMessages.forEach((msg) => {
// // // // // // // // //                 if (!msg.read && msg.sender !== user.id) {
// // // // // // // // //                     update(databaseRef(database, `messages/${user.id}/${otherUser.id}/${msg.id}`), { read: true });
// // // // // // // // //                     update(databaseRef(database, `messages/${otherUser.id}/${user.id}/${msg.id}`), { read: true });
// // // // // // // // //                 }
// // // // // // // // //             });
// // // // // // // // //         });

// // // // // // // // //         // User status and typing
// // // // // // // // //         const userStatusRef = databaseRef(database, `status/${otherUser.id}`);
// // // // // // // // //         onValue(userStatusRef, (snapshot) => {
// // // // // // // // //             const status = snapshot.val();
// // // // // // // // //             if (status) {
// // // // // // // // //                 if (status.online) {
// // // // // // // // //                     setOtherUserStatus('Online');
// // // // // // // // //                 } else {
// // // // // // // // //                     setOtherUserStatus('Last seen: ' + new Date(status.lastSeen).toLocaleTimeString());
// // // // // // // // //                 }
// // // // // // // // //             } else {
// // // // // // // // //                 setOtherUserStatus('Status not available');
// // // // // // // // //             }
// // // // // // // // //         });

// // // // // // // // //         const typingRef = databaseRef(database, `typing/${otherUser.id}`);
// // // // // // // // //         onValue(typingRef, (snapshot) => {
// // // // // // // // //             const typingData = snapshot.val();
// // // // // // // // //             setIsOtherUserTyping(typingData?.typing || false);
// // // // // // // // //         });

// // // // // // // // //         // Update user status to online when the component mounts
// // // // // // // // //         update(databaseRef(database, `status/${user.id}`), { online: true, lastSeen: null });

// // // // // // // // //         // Set user to offline when the component unmounts
// // // // // // // // //         return () => {
// // // // // // // // //             update(databaseRef(database, `status/${user.id}`), { online: false, lastSeen: Date.now() });
// // // // // // // // //         };
// // // // // // // // //     }, [user.id, otherUser.id]);

// // // // // // // // //     // Handle file selection
// // // // // // // // //     const handleFileChange = (event) => {
// // // // // // // // //         const files = Array.from(event.target.files);
// // // // // // // // //         setSelectedFiles((prevFiles) => [...prevFiles, ...files]);
// // // // // // // // //     };

// // // // // // // // //     // Remove a selected file
// // // // // // // // //     const removeFile = (index) => {
// // // // // // // // //         setSelectedFiles((prevFiles) => prevFiles.filter((_, i) => i !== index));
// // // // // // // // //     };

// // // // // // // // //     // Function to send a new message with media support
// // // // // // // // //     const sendMessage = async () => {
// // // // // // // // //         if (messageText.trim() === "" && selectedFiles.length === 0) return; // Prevent sending empty messages

// // // // // // // // //         const messagesRef = databaseRef(database, `messages/${user.id}/${otherUser.id}`);
// // // // // // // // //         const newMessage = {
// // // // // // // // //             text: messageText,
// // // // // // // // //             sender: user.id,
// // // // // // // // //             timestamp: Date.now(),
// // // // // // // // //             read: false,
// // // // // // // // //             files: [],
// // // // // // // // //         };

// // // // // // // // //         setUploading(true);

// // // // // // // // //         // Upload selected files (images and videos) to Firebase Storage
// // // // // // // // //         const uploadedFiles = await Promise.all(selectedFiles.map(async (file) => {
// // // // // // // // //             const fileRef = storageRef(storage, `chatFiles/${file.name}`);
// // // // // // // // //             await uploadBytes(fileRef, file);
// // // // // // // // //             return getDownloadURL(fileRef);
// // // // // // // // //         }));

// // // // // // // // //         // Update newMessage with uploaded file URLs
// // // // // // // // //         newMessage.files = uploadedFiles;

// // // // // // // // //         // Push message to Firebase Database
// // // // // // // // //         const newMsgRef = await push(messagesRef, newMessage);
// // // // // // // // //         setMessageText(''); // Clear input after sending
// // // // // // // // //         setSelectedFiles([]); // Clear selected files

// // // // // // // // //         // Update the recipient's message status
// // // // // // // // //         const recipientRef = databaseRef(database, `messages/${otherUser.id}/${user.id}`);
// // // // // // // // //         await push(recipientRef, { ...newMessage, id: newMsgRef.key });

// // // // // // // // //         setUploading(false);
// // // // // // // // //     };

// // // // // // // // //     // Function to handle typing status
// // // // // // // // //     useEffect(() => {
// // // // // // // // //         const typingRef = databaseRef(database, `typing/${user.id}`);
        
// // // // // // // // //         if (messageText.trim() || selectedFiles.length > 0) {
// // // // // // // // //             update(typingRef, { typing: true });
// // // // // // // // //         } else {
// // // // // // // // //             update(typingRef, { typing: false });
// // // // // // // // //         }

// // // // // // // // //         // Cleanup function to stop typing when unmounting
// // // // // // // // //         return () => {
// // // // // // // // //             update(typingRef, { typing: false });
// // // // // // // // //         };
// // // // // // // // //     }, [messageText, selectedFiles, user.id]);

// // // // // // // // //     const renderMedia = (files) => {
// // // // // // // // //         if (!files || files.length === 0) return null;

// // // // // // // // //         return (
// // // // // // // // //             <div className="flex flex-wrap mt-1">
// // // // // // // // //                 {files.map((file, index) => (
// // // // // // // // //                     <a
// // // // // // // // //                         key={index}
// // // // // // // // //                         href={file}
// // // // // // // // //                         target="_blank"
// // // // // // // // //                         rel="noopener noreferrer"
// // // // // // // // //                         className="w-20 h-20 flex items-center justify-center border border-gray-300 rounded-lg m-1"
// // // // // // // // //                     >
// // // // // // // // //                         {file.endsWith('.jpg') || file.endsWith('.png') || file.endsWith('.gif') ? (
// // // // // // // // //                             <img src={file} alt="Media" className="object-cover h-full w-full rounded-lg" />
// // // // // // // // //                         ) : (
// // // // // // // // //                             <span className="text-sm">File</span>
// // // // // // // // //                         )}
// // // // // // // // //                     </a>
// // // // // // // // //                 ))}
// // // // // // // // //             </div>
// // // // // // // // //         );
// // // // // // // // //     };

// // // // // // // // //     return (
// // // // // // // // //         <div className="flex flex-col h-screen bg-gray-100">
// // // // // // // // //             <div className="flex-none p-4 bg-white border-b border-gray-300">
// // // // // // // // //                 <h2 className="text-xl text-center">{otherUser.name}</h2>
// // // // // // // // //                 <p className="text-sm text-center">{otherUserStatus}</p>
// // // // // // // // //                 {isOtherUserTyping && <p className="text-sm text-center italic">User is typing...</p>}
// // // // // // // // //             </div>
// // // // // // // // //             <div className="flex-1 overflow-y-auto p-4">
// // // // // // // // //                 {/* Display messages */}
// // // // // // // // //                 {messages.map((msg, index) => (
// // // // // // // // //                     <div key={index} className={`mb-2 ${msg.sender === user.id ? 'text-right' : 'text-left'}`}>
// // // // // // // // //                         <div className={`inline-block p-2 rounded-lg ${msg.sender === user.id ? 'bg-blue-500 text-white' : 'bg-gray-300'}`}>
// // // // // // // // //                             {msg.text}
// // // // // // // // //                             {renderMedia(msg.files)}
// // // // // // // // //                         </div>
// // // // // // // // //                         <div className="text-xs text-gray-500 flex justify-end items-center">
// // // // // // // // //                             {new Date(msg.timestamp).toLocaleTimeString()}
// // // // // // // // //                             {msg.sender === user.id && (
// // // // // // // // //                                 <span className="ml-2">
// // // // // // // // //                                     {msg.read ? (
// // // // // // // // //                                         <span className="text-blue-500">✔✔</span>
// // // // // // // // //                                     ) : (
// // // // // // // // //                                         <span>✔</span>
// // // // // // // // //                                     )}
// // // // // // // // //                                 </span>
// // // // // // // // //                             )}
// // // // // // // // //                         </div>
// // // // // // // // //                     </div>
// // // // // // // // //                 ))}
// // // // // // // // //             </div>
// // // // // // // // //             <div className="flex items-center p-4 border-t border-gray-300">
// // // // // // // // //                 <input
// // // // // // // // //                     type="file"
// // // // // // // // //                     multiple
// // // // // // // // //                     accept="image/*,video/*"
// // // // // // // // //                     className="hidden"
// // // // // // // // //                     id="fileInput"
// // // // // // // // //                     onChange={handleFileChange}
// // // // // // // // //                 />
// // // // // // // // //                 <label htmlFor="fileInput" className="cursor-pointer">
// // // // // // // // //                     <span className="material-icons">📎</span>
// // // // // // // // //                 </label>
// // // // // // // // //                 <div className="flex flex-wrap">
// // // // // // // // //                     {selectedFiles.map((file, index) => (
// // // // // // // // //                         <div key={index} className="relative mr-2">
// // // // // // // // //                             <span
// // // // // // // // //                                 className="absolute top-0 right-0 cursor-pointer text-red-500"
// // // // // // // // //                                 onClick={() => removeFile(index)}
// // // // // // // // //                             >
// // // // // // // // //                                 &times;
// // // // // // // // //                             </span>
// // // // // // // // //                             <span>{file.name}</span>
// // // // // // // // //                         </div>
// // // // // // // // //                     ))}
// // // // // // // // //                 </div>
// // // // // // // // //                 <input
// // // // // // // // //                     type="text"
// // // // // // // // //                     className="border rounded-lg p-2 flex-1 mx-2"
// // // // // // // // //                     placeholder="Type a message..."
// // // // // // // // //                     value={messageText}
// // // // // // // // //                     onChange={(e) => setMessageText(e.target.value)}
// // // // // // // // //                 />
// // // // // // // // //                 <button
// // // // // // // // //                     className="ml-2 p-2 bg-blue-500 text-white rounded-lg"
// // // // // // // // //                     onClick={sendMessage}
// // // // // // // // //                     disabled={uploading}
// // // // // // // // //                 >
// // // // // // // // //                     {uploading ? "Sending..." : "Send"}
// // // // // // // // //                 </button>
// // // // // // // // //             </div>
// // // // // // // // //         </div>
// // // // // // // // //     );
// // // // // // // // // };

// // // // // // // // // export default Chat;


// // // // // // // // // // "use client"; // Enable client-side rendering
// // // // // // // // // // import React, { useState, useEffect } from 'react';
// // // // // // // // // // import { database, storage } from '../config/firebase'; // Pastikan Firebase Storage sudah dikonfigurasi
// // // // // // // // // // import { ref as databaseRef, onValue, push, update } from 'firebase/database';
// // // // // // // // // // import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
// // // // // // // // // // import 'tailwindcss/tailwind.css';

// // // // // // // // // // const Chat = ({ user }) => {
// // // // // // // // // //     const otherUser = user.id === 'user1' ? { id: 'user2', name: 'User 2' } : { id: 'user1', name: 'User 1' };

// // // // // // // // // //     const [messages, setMessages] = useState([]);
// // // // // // // // // //     const [messageText, setMessageText] = useState('');
// // // // // // // // // //     const [selectedFiles, setSelectedFiles] = useState([]);
// // // // // // // // // //     const [uploading, setUploading] = useState(false);
// // // // // // // // // //     const [otherUserStatus, setOtherUserStatus] = useState(''); // Online status or last seen

// // // // // // // // // //     // Fetch messages from Firebase on component mount
// // // // // // // // // //     useEffect(() => {
// // // // // // // // // //         const messagesRef = databaseRef(database, `messages/${user.id}/${otherUser.id}`);
// // // // // // // // // //         onValue(messagesRef, (snapshot) => {
// // // // // // // // // //             const data = snapshot.val();
// // // // // // // // // //             const loadedMessages = data ? Object.values(data) : [];
// // // // // // // // // //             setMessages(loadedMessages);

// // // // // // // // // //             // Mark all messages as read when the user views the chat
// // // // // // // // // //             loadedMessages.forEach((msg) => {
// // // // // // // // // //                 if (!msg.read && msg.sender !== user.id) {
// // // // // // // // // //                     update(databaseRef(database, `messages/${user.id}/${otherUser.id}/${msg.id}`), { read: true });
// // // // // // // // // //                     update(databaseRef(database, `messages/${otherUser.id}/${user.id}/${msg.id}`), { read: true });
// // // // // // // // // //                 }
// // // // // // // // // //             });
// // // // // // // // // //         });

// // // // // // // // // //         // Fetch user's status
// // // // // // // // // //         const userStatusRef = databaseRef(database, `users/${otherUser.id}/status`);
// // // // // // // // // //         onValue(userStatusRef, (snapshot) => {
// // // // // // // // // //             const status = snapshot.val();
// // // // // // // // // //             if (status) {
// // // // // // // // // //                 if (status.online) {
// // // // // // // // // //                     setOtherUserStatus('Online');
// // // // // // // // // //                 } else if (status.lastSeen) {
// // // // // // // // // //                     const lastSeenTime = new Date(status.lastSeen);
// // // // // // // // // //                     setOtherUserStatus('Last seen: ' + lastSeenTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
// // // // // // // // // //                 } else {
// // // // // // // // // //                     setOtherUserStatus('Last seen: Unknown'); // Bisa diubah jika ingin
// // // // // // // // // //                 }
// // // // // // // // // //             } else {
// // // // // // // // // //                 setOtherUserStatus('Last seen: Unknown'); // Jika data status tidak tersedia
// // // // // // // // // //             }
// // // // // // // // // //         });

// // // // // // // // // //         // Update user status to online when the component mounts
// // // // // // // // // //         update(databaseRef(database, `users/${user.id}/status`), { online: true, lastSeen: null });

// // // // // // // // // //         // Set user to offline when the component unmounts
// // // // // // // // // //         return () => {
// // // // // // // // // //             update(databaseRef(database, `users/${user.id}/status`), { online: false, lastSeen: Date.now() });
// // // // // // // // // //         };
// // // // // // // // // //     }, [user.id, otherUser.id]);

// // // // // // // // // //     // Handle file selection
// // // // // // // // // //     const handleFileChange = (event) => {
// // // // // // // // // //         const files = Array.from(event.target.files);
// // // // // // // // // //         setSelectedFiles((prevFiles) => [...prevFiles, ...files]);
// // // // // // // // // //     };

// // // // // // // // // //     // Remove a selected file
// // // // // // // // // //     const removeFile = (index) => {
// // // // // // // // // //         setSelectedFiles((prevFiles) => prevFiles.filter((_, i) => i !== index));
// // // // // // // // // //     };

// // // // // // // // // //     // Function to send a new message with media support
// // // // // // // // // //     const sendMessage = async () => {
// // // // // // // // // //         if (messageText.trim() === "" && selectedFiles.length === 0) return; // Prevent sending empty messages

// // // // // // // // // //         const messagesRef = databaseRef(database, `messages/${user.id}/${otherUser.id}`);
// // // // // // // // // //         const newMessage = {
// // // // // // // // // //             text: messageText,
// // // // // // // // // //             sender: user.id,
// // // // // // // // // //             timestamp: Date.now(),
// // // // // // // // // //             read: false,
// // // // // // // // // //             files: [],
// // // // // // // // // //         };

// // // // // // // // // //         setUploading(true);

// // // // // // // // // //         // Upload selected files (images and videos) to Firebase Storage
// // // // // // // // // //         const uploadedFiles = await Promise.all(selectedFiles.map(async (file) => {
// // // // // // // // // //             const fileRef = storageRef(storage, `chatFiles/${file.name}`);
// // // // // // // // // //             await uploadBytes(fileRef, file);
// // // // // // // // // //             return getDownloadURL(fileRef);
// // // // // // // // // //         }));

// // // // // // // // // //         // Update newMessage with uploaded file URLs
// // // // // // // // // //         newMessage.files = uploadedFiles;

// // // // // // // // // //         // Push message to Firebase Database
// // // // // // // // // //         const newMsgRef = await push(messagesRef, newMessage);
// // // // // // // // // //         setMessageText(''); // Clear input after sending
// // // // // // // // // //         setSelectedFiles([]); // Clear selected files

// // // // // // // // // //         // Update the recipient's message status
// // // // // // // // // //         const recipientRef = databaseRef(database, `messages/${otherUser.id}/${user.id}`);
// // // // // // // // // //         await push(recipientRef, { ...newMessage, id: newMsgRef.key });

// // // // // // // // // //         setUploading(false);
// // // // // // // // // //     };

// // // // // // // // // //     const renderMedia = (files) => {
// // // // // // // // // //         if (!files || files.length === 0) return null;

// // // // // // // // // //         return (
// // // // // // // // // //             <div className="flex flex-wrap mt-1">
// // // // // // // // // //                 {files.map((file, index) => (
// // // // // // // // // //                     <a
// // // // // // // // // //                         key={index}
// // // // // // // // // //                         href={file}
// // // // // // // // // //                         target="_blank"
// // // // // // // // // //                         rel="noopener noreferrer"
// // // // // // // // // //                         className="w-20 h-20 flex items-center justify-center border border-gray-300 rounded-lg m-1"
// // // // // // // // // //                     >
// // // // // // // // // //                         {file.endsWith('.jpg') || file.endsWith('.png') || file.endsWith('.gif') ? (
// // // // // // // // // //                             <img src={file} alt="Media" className="object-cover h-full w-full rounded-lg" />
// // // // // // // // // //                         ) : (
// // // // // // // // // //                             <span className="text-sm">File</span>
// // // // // // // // // //                         )}
// // // // // // // // // //                     </a>
// // // // // // // // // //                 ))}
// // // // // // // // // //             </div>
// // // // // // // // // //         );
// // // // // // // // // //     };

// // // // // // // // // //     return (
// // // // // // // // // //         <div className="flex flex-col h-screen bg-gray-100">
// // // // // // // // // //             <div className="flex-none p-4 bg-white border-b border-gray-300">
// // // // // // // // // //                 <h2 className="text-xl text-center">{otherUser.name}</h2>
// // // // // // // // // //                 <p className="text-sm text-center">{otherUserStatus}</p>
// // // // // // // // // //             </div>
// // // // // // // // // //             <div className="flex-1 overflow-y-auto p-4">
// // // // // // // // // //                 {/* Display messages */}
// // // // // // // // // //                 {messages.map((msg, index) => (
// // // // // // // // // //                     <div key={index} className={`mb-2 ${msg.sender === user.id ? 'text-right' : 'text-left'}`}>
// // // // // // // // // //                         <div className={`inline-block p-2 rounded-lg ${msg.sender === user.id ? 'bg-blue-500 text-white' : 'bg-gray-300'}`}>
// // // // // // // // // //                             {msg.text}
// // // // // // // // // //                             {renderMedia(msg.files)}
// // // // // // // // // //                         </div>
// // // // // // // // // //                         <div className="text-xs text-gray-500 flex justify-end items-center">
// // // // // // // // // //                             {new Date(msg.timestamp).toLocaleTimeString()}
// // // // // // // // // //                             {msg.sender === user.id && (
// // // // // // // // // //                                 <span className="ml-2">
// // // // // // // // // //                                     {msg.read ? (
// // // // // // // // // //                                         <span className="text-blue-500">✔✔</span>
// // // // // // // // // //                                     ) : (
// // // // // // // // // //                                         <span>✔</span>
// // // // // // // // // //                                     )}
// // // // // // // // // //                                 </span>
// // // // // // // // // //                             )}
// // // // // // // // // //                         </div>
// // // // // // // // // //                     </div>
// // // // // // // // // //                 ))}
// // // // // // // // // //             </div>
// // // // // // // // // //             <div className="flex items-center p-4 border-t border-gray-300">
// // // // // // // // // //                 <input
// // // // // // // // // //                     type="file"
// // // // // // // // // //                     multiple
// // // // // // // // // //                     accept="image/*,video/*"
// // // // // // // // // //                     className="hidden"
// // // // // // // // // //                     id="fileInput"
// // // // // // // // // //                     onChange={handleFileChange}
// // // // // // // // // //                 />
// // // // // // // // // //                 <label htmlFor="fileInput" className="cursor-pointer">
// // // // // // // // // //                     <span className="material-icons">attach_file</span>
// // // // // // // // // //                 </label>
// // // // // // // // // //                 <div className="flex flex-wrap w-64">
// // // // // // // // // //                     {selectedFiles.map((file, index) => (
// // // // // // // // // //                         <div key={index} className="relative mr-2">
// // // // // // // // // //                             <span
// // // // // // // // // //                                 className="absolute top-0 right-0 cursor-pointer text-red-500"
// // // // // // // // // //                                 onClick={() => removeFile(index)}
// // // // // // // // // //                             >
// // // // // // // // // //                                 &times;
// // // // // // // // // //                             </span>
// // // // // // // // // //                             <span>{file.name}</span>
// // // // // // // // // //                         </div>
// // // // // // // // // //                     ))}
// // // // // // // // // //                 </div>
// // // // // // // // // //                 <input
// // // // // // // // // //                     type="text"
// // // // // // // // // //                     className="border rounded-lg p-2 flex-1 mx-2"
// // // // // // // // // //                     placeholder="Type a message..."
// // // // // // // // // //                     value={messageText}
// // // // // // // // // //                     onChange={(e) => setMessageText(e.target.value)}
// // // // // // // // // //                 />
// // // // // // // // // //                 <button
// // // // // // // // // //                     className="ml-2 p-2 bg-blue-500 text-white rounded-lg"
// // // // // // // // // //                     onClick={sendMessage}
// // // // // // // // // //                     disabled={uploading}
// // // // // // // // // //                 >
// // // // // // // // // //                     {uploading ? "Sending..." : "Send"}
// // // // // // // // // //                 </button>
// // // // // // // // // //             </div>
// // // // // // // // // //         </div>
// // // // // // // // // //     );
// // // // // // // // // // };

// // // // // // // // // // export default Chat;

// // // // // // // // // // "use client"; // Enable client-side rendering
// // // // // // // // // // import React, { useState, useEffect } from 'react';
// // // // // // // // // // import { database, storage } from '../config/firebase'; // Pastikan Firebase Storage sudah dikonfigurasi
// // // // // // // // // // import { ref as databaseRef, onValue, push, update } from 'firebase/database';
// // // // // // // // // // import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
// // // // // // // // // // import 'tailwindcss/tailwind.css';

// // // // // // // // // // const Chat = ({ user }) => {
// // // // // // // // // //     const otherUser = user.id === 'user1' ? { id: 'user2', name: 'User 2' } : { id: 'user1', name: 'User 1' };

// // // // // // // // // //     const [messages, setMessages] = useState([]);
// // // // // // // // // //     const [messageText, setMessageText] = useState('');
// // // // // // // // // //     const [selectedFiles, setSelectedFiles] = useState([]);
// // // // // // // // // //     const [uploading, setUploading] = useState(false);
// // // // // // // // // //     const [otherUserStatus, setOtherUserStatus] = useState(''); // Online status or last seen

// // // // // // // // // //     // Fetch messages from Firebase on component mount
// // // // // // // // // //     useEffect(() => {
// // // // // // // // // //         const messagesRef = databaseRef(database, `messages/${user.id}/${otherUser.id}`);
// // // // // // // // // //         onValue(messagesRef, (snapshot) => {
// // // // // // // // // //             const data = snapshot.val();
// // // // // // // // // //             const loadedMessages = data ? Object.values(data) : [];
// // // // // // // // // //             setMessages(loadedMessages);

// // // // // // // // // //             // Mark all messages as read when the user views the chat
// // // // // // // // // //             loadedMessages.forEach((msg) => {
// // // // // // // // // //                 if (!msg.read && msg.sender !== user.id) {
// // // // // // // // // //                     update(databaseRef(database, `messages/${user.id}/${otherUser.id}/${msg.id}`), { read: true });
// // // // // // // // // //                     update(databaseRef(database, `messages/${otherUser.id}/${user.id}/${msg.id}`), { read: true });
// // // // // // // // // //                 }
// // // // // // // // // //             });
// // // // // // // // // //         });

// // // // // // // // // //         // Fetch user's status
// // // // // // // // // //         const userStatusRef = databaseRef(database, `users/${otherUser.id}/status`);
// // // // // // // // // //         onValue(userStatusRef, (snapshot) => {
// // // // // // // // // //             const status = snapshot.val();
// // // // // // // // // //             if (status) {
// // // // // // // // // //                 if (status.online) {
// // // // // // // // // //                     setOtherUserStatus('Online');
// // // // // // // // // //                 } else {
// // // // // // // // // //                     setOtherUserStatus('Last seen: ' + new Date(status.lastSeen).toLocaleTimeString());
// // // // // // // // // //                 }
// // // // // // // // // //             } else {
// // // // // // // // // //                 setOtherUserStatus('Status not available');
// // // // // // // // // //             }
// // // // // // // // // //         });

// // // // // // // // // //         // Update user status to online when the component mounts
// // // // // // // // // //         update(databaseRef(database, `users/${user.id}/status`), { online: true, lastSeen: null });

// // // // // // // // // //         // Set user to offline when the component unmounts
// // // // // // // // // //         return () => {
// // // // // // // // // //             update(databaseRef(database, `users/${user.id}/status`), { online: false, lastSeen: Date.now() });
// // // // // // // // // //         };
// // // // // // // // // //     }, [user.id, otherUser.id]);

// // // // // // // // // //     // Handle file selection
// // // // // // // // // //     const handleFileChange = (event) => {
// // // // // // // // // //         const files = Array.from(event.target.files);
// // // // // // // // // //         setSelectedFiles((prevFiles) => [...prevFiles, ...files]);
// // // // // // // // // //     };

// // // // // // // // // //     // Remove a selected file
// // // // // // // // // //     const removeFile = (index) => {
// // // // // // // // // //         setSelectedFiles((prevFiles) => prevFiles.filter((_, i) => i !== index));
// // // // // // // // // //     };

// // // // // // // // // //     // Function to send a new message with media support
// // // // // // // // // //     const sendMessage = async () => {
// // // // // // // // // //         if (messageText.trim() === "" && selectedFiles.length === 0) return; // Prevent sending empty messages

// // // // // // // // // //         const messagesRef = databaseRef(database, `messages/${user.id}/${otherUser.id}`);
// // // // // // // // // //         const newMessage = {
// // // // // // // // // //             text: messageText,
// // // // // // // // // //             sender: user.id,
// // // // // // // // // //             timestamp: Date.now(),
// // // // // // // // // //             read: false,
// // // // // // // // // //             files: [],
// // // // // // // // // //         };

// // // // // // // // // //         setUploading(true);

// // // // // // // // // //         // Upload selected files (images and videos) to Firebase Storage
// // // // // // // // // //         const uploadedFiles = await Promise.all(selectedFiles.map(async (file) => {
// // // // // // // // // //             const fileRef = storageRef(storage, `chatFiles/${file.name}`);
// // // // // // // // // //             await uploadBytes(fileRef, file);
// // // // // // // // // //             return getDownloadURL(fileRef);
// // // // // // // // // //         }));

// // // // // // // // // //         // Update newMessage with uploaded file URLs
// // // // // // // // // //         newMessage.files = uploadedFiles;

// // // // // // // // // //         // Push message to Firebase Database
// // // // // // // // // //         const newMsgRef = await push(messagesRef, newMessage);
// // // // // // // // // //         setMessageText(''); // Clear input after sending
// // // // // // // // // //         setSelectedFiles([]); // Clear selected files

// // // // // // // // // //         // Update the recipient's message status
// // // // // // // // // //         const recipientRef = databaseRef(database, `messages/${otherUser.id}/${user.id}`);
// // // // // // // // // //         await push(recipientRef, { ...newMessage, id: newMsgRef.key });

// // // // // // // // // //         setUploading(false);
// // // // // // // // // //     };

// // // // // // // // // //     const renderMedia = (files) => {
// // // // // // // // // //         if (!files || files.length === 0) return null;

// // // // // // // // // //         return (
// // // // // // // // // //             <div className="flex flex-wrap mt-1">
// // // // // // // // // //                 {files.map((file, index) => (
// // // // // // // // // //                     <a
// // // // // // // // // //                         key={index}
// // // // // // // // // //                         href={file}
// // // // // // // // // //                         target="_blank"
// // // // // // // // // //                         rel="noopener noreferrer"
// // // // // // // // // //                         className="w-20 h-20 flex items-center justify-center border border-gray-300 rounded-lg m-1"
// // // // // // // // // //                     >
// // // // // // // // // //                         {file.endsWith('.jpg') || file.endsWith('.png') || file.endsWith('.gif') ? (
// // // // // // // // // //                             <img src={file} alt="Media" className="object-cover h-full w-full rounded-lg" />
// // // // // // // // // //                         ) : (
// // // // // // // // // //                             <span className="text-sm">File</span>
// // // // // // // // // //                         )}
// // // // // // // // // //                     </a>
// // // // // // // // // //                 ))}
// // // // // // // // // //             </div>
// // // // // // // // // //         );
// // // // // // // // // //     };

// // // // // // // // // //     return (
// // // // // // // // // //         <div className="flex flex-col h-screen bg-gray-100">
// // // // // // // // // //             <div className="flex-none p-4 bg-white border-b border-gray-300">
// // // // // // // // // //                 <h2 className="text-xl text-center">{otherUser.name}</h2>
// // // // // // // // // //                 <p className="text-sm text-center">{otherUserStatus}</p>
// // // // // // // // // //             </div>
// // // // // // // // // //             <div className="flex-1 overflow-y-auto p-4">
// // // // // // // // // //                 {/* Display messages */}
// // // // // // // // // //                 {messages.map((msg, index) => (
// // // // // // // // // //                     <div key={index} className={`mb-2 ${msg.sender === user.id ? 'text-right' : 'text-left'}`}>
// // // // // // // // // //                         <div className={`inline-block p-2 rounded-lg ${msg.sender === user.id ? 'bg-blue-500 text-white' : 'bg-gray-300'}`}>
// // // // // // // // // //                             {msg.text}
// // // // // // // // // //                             {renderMedia(msg.files)}
// // // // // // // // // //                         </div>
// // // // // // // // // //                         <div className="text-xs text-gray-500 flex justify-end items-center">
// // // // // // // // // //                             {new Date(msg.timestamp).toLocaleTimeString()}
// // // // // // // // // //                             {msg.sender === user.id && (
// // // // // // // // // //                                 <span className="ml-2">
// // // // // // // // // //                                     {msg.read ? (
// // // // // // // // // //                                         <span className="text-blue-500">✔✔</span>
// // // // // // // // // //                                     ) : (
// // // // // // // // // //                                         <span>✔</span>
// // // // // // // // // //                                     )}
// // // // // // // // // //                                 </span>
// // // // // // // // // //                             )}
// // // // // // // // // //                         </div>
// // // // // // // // // //                     </div>
// // // // // // // // // //                 ))}
// // // // // // // // // //             </div>
// // // // // // // // // //             <div className="flex items-center p-4 border-t border-gray-300">
// // // // // // // // // //                 <input
// // // // // // // // // //                     type="file"
// // // // // // // // // //                     multiple
// // // // // // // // // //                     accept="image/*,video/*"
// // // // // // // // // //                     className="hidden"
// // // // // // // // // //                     id="fileInput"
// // // // // // // // // //                     onChange={handleFileChange}
// // // // // // // // // //                 />
// // // // // // // // // //                 <label htmlFor="fileInput" className="cursor-pointer">
// // // // // // // // // //                     <span className="material-icons">attach_file</span>
// // // // // // // // // //                 </label>
// // // // // // // // // //                 <div className="flex flex-wrap w-64">
// // // // // // // // // //                     {selectedFiles.map((file, index) => (
// // // // // // // // // //                         <div key={index} className="relative mr-2">
// // // // // // // // // //                             <span
// // // // // // // // // //                                 className="absolute top-0 right-0 cursor-pointer text-red-500"
// // // // // // // // // //                                 onClick={() => removeFile(index)}
// // // // // // // // // //                             >
// // // // // // // // // //                                 &times;
// // // // // // // // // //                             </span>
// // // // // // // // // //                             <span>{file.name}</span>
// // // // // // // // // //                         </div>
// // // // // // // // // //                     ))}
// // // // // // // // // //                 </div>
// // // // // // // // // //                 <input
// // // // // // // // // //                     type="text"
// // // // // // // // // //                     className="border rounded-lg p-2 flex-1 mx-2"
// // // // // // // // // //                     placeholder="Type a message..."
// // // // // // // // // //                     value={messageText}
// // // // // // // // // //                     onChange={(e) => setMessageText(e.target.value)}
// // // // // // // // // //                 />
// // // // // // // // // //                 <button
// // // // // // // // // //                     className="ml-2 p-2 bg-blue-500 text-white rounded-lg"
// // // // // // // // // //                     onClick={sendMessage}
// // // // // // // // // //                     disabled={uploading}
// // // // // // // // // //                 >
// // // // // // // // // //                     {uploading ? "Sending..." : "Send"}
// // // // // // // // // //                 </button>
// // // // // // // // // //             </div>
// // // // // // // // // //         </div>
// // // // // // // // // //     );
// // // // // // // // // // };

// // // // // // // // // // export default Chat;



























// // // // // // // // // // "use client"; // Enable client-side rendering
// // // // // // // // // // import React, { useState, useEffect } from 'react';
// // // // // // // // // // import { database, storage } from '../config/firebase'; // Pastikan Firebase Storage sudah dikonfigurasi
// // // // // // // // // // import { ref as databaseRef, onValue, push, update } from 'firebase/database';
// // // // // // // // // // import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
// // // // // // // // // // import 'tailwindcss/tailwind.css';

// // // // // // // // // // const Chat = ({ user }) => {
// // // // // // // // // //     const otherUser = user.id === 'user1' ? { id: 'user2', name: 'User 2' } : { id: 'user1', name: 'User 1' };

// // // // // // // // // //     const [messages, setMessages] = useState([]);
// // // // // // // // // //     const [messageText, setMessageText] = useState('');
// // // // // // // // // //     const [selectedFiles, setSelectedFiles] = useState([]);
// // // // // // // // // //     const [uploading, setUploading] = useState(false);
// // // // // // // // // //     const [otherUserStatus, setOtherUserStatus] = useState(''); // Online status or last seen

// // // // // // // // // //     // Fetch messages from Firebase on component mount
// // // // // // // // // //     useEffect(() => {
// // // // // // // // // //         const messagesRef = databaseRef(database, `messages/${user.id}/${otherUser.id}`);
// // // // // // // // // //         onValue(messagesRef, (snapshot) => {
// // // // // // // // // //             const data = snapshot.val();
// // // // // // // // // //             const loadedMessages = data ? Object.values(data) : [];
// // // // // // // // // //             setMessages(loadedMessages);

// // // // // // // // // //             // Mark all messages as read when the user views the chat
// // // // // // // // // //             loadedMessages.forEach((msg) => {
// // // // // // // // // //                 if (!msg.read && msg.sender !== user.id) {
// // // // // // // // // //                     update(databaseRef(database, `messages/${user.id}/${otherUser.id}/${msg.id}`), { read: true });
// // // // // // // // // //                     update(databaseRef(database, `messages/${otherUser.id}/${user.id}/${msg.id}`), { read: true });
// // // // // // // // // //                 }
// // // // // // // // // //             });
// // // // // // // // // //         });

// // // // // // // // // //         // Fetch user's status
// // // // // // // // // //         const userStatusRef = databaseRef(database, `users/${otherUser.id}/status`);
// // // // // // // // // //         onValue(userStatusRef, (snapshot) => {
// // // // // // // // // //             const status = snapshot.val();
// // // // // // // // // //             setOtherUserStatus(status ? status : 'Last seen: ' + new Date(status.lastSeen).toLocaleTimeString());
// // // // // // // // // //         });
// // // // // // // // // //     }, [user.id, otherUser.id]);

// // // // // // // // // //     // Handle file selection
// // // // // // // // // //     const handleFileChange = (event) => {
// // // // // // // // // //         const files = Array.from(event.target.files);
// // // // // // // // // //         setSelectedFiles((prevFiles) => [...prevFiles, ...files]);
// // // // // // // // // //     };

// // // // // // // // // //     // Remove a selected file
// // // // // // // // // //     const removeFile = (index) => {
// // // // // // // // // //         setSelectedFiles((prevFiles) => prevFiles.filter((_, i) => i !== index));
// // // // // // // // // //     };

// // // // // // // // // //     // Function to send a new message with media support
// // // // // // // // // //     const sendMessage = async () => {
// // // // // // // // // //         if (messageText.trim() === "" && selectedFiles.length === 0) return; // Prevent sending empty messages

// // // // // // // // // //         const messagesRef = databaseRef(database, `messages/${user.id}/${otherUser.id}`);
// // // // // // // // // //         const newMessage = {
// // // // // // // // // //             text: messageText,
// // // // // // // // // //             sender: user.id,
// // // // // // // // // //             timestamp: Date.now(),
// // // // // // // // // //             read: false,
// // // // // // // // // //             files: [],
// // // // // // // // // //         };

// // // // // // // // // //         setUploading(true);

// // // // // // // // // //         // Upload selected files (images and videos) to Firebase Storage
// // // // // // // // // //         const uploadedFiles = await Promise.all(selectedFiles.map(async (file) => {
// // // // // // // // // //             const fileRef = storageRef(storage, `chatFiles/${file.name}`);
// // // // // // // // // //             await uploadBytes(fileRef, file);
// // // // // // // // // //             return getDownloadURL(fileRef);
// // // // // // // // // //         }));

// // // // // // // // // //         // Update newMessage with uploaded file URLs
// // // // // // // // // //         newMessage.files = uploadedFiles;

// // // // // // // // // //         // Push message to Firebase Database
// // // // // // // // // //         const newMsgRef = await push(messagesRef, newMessage);
// // // // // // // // // //         setMessageText(''); // Clear input after sending
// // // // // // // // // //         setSelectedFiles([]); // Clear selected files

// // // // // // // // // //         // Update the recipient's message status
// // // // // // // // // //         const recipientRef = databaseRef(database, `messages/${otherUser.id}/${user.id}`);
// // // // // // // // // //         await push(recipientRef, { ...newMessage, id: newMsgRef.key });

// // // // // // // // // //         setUploading(false);
// // // // // // // // // //     };

// // // // // // // // // //     const renderMedia = (files) => {
// // // // // // // // // //         if (!files || files.length === 0) return null;

// // // // // // // // // //         return (
// // // // // // // // // //             <div className="flex flex-wrap mt-1">
// // // // // // // // // //                 {files.map((file, index) => (
// // // // // // // // // //                     <a
// // // // // // // // // //                         key={index}
// // // // // // // // // //                         href={file}
// // // // // // // // // //                         target="_blank"
// // // // // // // // // //                         rel="noopener noreferrer"
// // // // // // // // // //                         className="w-20 h-20 flex items-center justify-center border border-gray-300 rounded-lg m-1"
// // // // // // // // // //                     >
// // // // // // // // // //                         {file.endsWith('.jpg') || file.endsWith('.png') || file.endsWith('.gif') ? (
// // // // // // // // // //                             <img src={file} alt="Media" className="object-cover h-full w-full rounded-lg" />
// // // // // // // // // //                         ) : (
// // // // // // // // // //                             <span className="text-sm">File</span>
// // // // // // // // // //                         )}
// // // // // // // // // //                     </a>
// // // // // // // // // //                 ))}
// // // // // // // // // //             </div>
// // // // // // // // // //         );
// // // // // // // // // //     };

// // // // // // // // // //     return (
// // // // // // // // // //         <div className="flex flex-col h-screen bg-gray-100">
// // // // // // // // // //             <div className="flex-none p-4 bg-white border-b border-gray-300">
// // // // // // // // // //                 <h2 className="text-xl text-center">{otherUser.name}</h2>
// // // // // // // // // //                 <p className="text-sm text-center">{otherUserStatus}</p>
// // // // // // // // // //             </div>
// // // // // // // // // //             <div className="flex-1 overflow-y-auto p-4">
// // // // // // // // // //                 {/* Display messages */}
// // // // // // // // // //                 {messages.map((msg, index) => (
// // // // // // // // // //                     <div key={index} className={`mb-2 ${msg.sender === user.id ? 'text-right' : 'text-left'}`}>
// // // // // // // // // //                         <div className={`inline-block p-2 rounded-lg ${msg.sender === user.id ? 'bg-blue-500 text-white' : 'bg-gray-300'}`}>
// // // // // // // // // //                             {msg.text}
// // // // // // // // // //                             {renderMedia(msg.files)}
// // // // // // // // // //                         </div>
// // // // // // // // // //                         <div className="text-xs text-gray-500 flex justify-end items-center">
// // // // // // // // // //                             {new Date(msg.timestamp).toLocaleTimeString()}
// // // // // // // // // //                             {msg.sender === user.id && (
// // // // // // // // // //                                 <span className="ml-2">
// // // // // // // // // //                                     {msg.read ? (
// // // // // // // // // //                                         <span className="text-blue-500">✔✔</span>
// // // // // // // // // //                                     ) : (
// // // // // // // // // //                                         <span>✔</span>
// // // // // // // // // //                                     )}
// // // // // // // // // //                                 </span>
// // // // // // // // // //                             )}
// // // // // // // // // //                         </div>
// // // // // // // // // //                     </div>
// // // // // // // // // //                 ))}
// // // // // // // // // //             </div>
// // // // // // // // // //             <div className="flex items-center p-4 border-t border-gray-300">
// // // // // // // // // //                 <input
// // // // // // // // // //                     type="file"
// // // // // // // // // //                     multiple
// // // // // // // // // //                     accept="image/*,video/*"
// // // // // // // // // //                     className="hidden"
// // // // // // // // // //                     id="fileInput"
// // // // // // // // // //                     onChange={handleFileChange}
// // // // // // // // // //                 />
// // // // // // // // // //                 <label htmlFor="fileInput" className="cursor-pointer">
// // // // // // // // // //                     <span className="material-icons">attach_file</span>
// // // // // // // // // //                 </label>
// // // // // // // // // //                 <div className="flex flex-wrap w-64">
// // // // // // // // // //                     {selectedFiles.map((file, index) => (
// // // // // // // // // //                         <div key={index} className="relative mr-2">
// // // // // // // // // //                             <span
// // // // // // // // // //                                 className="absolute top-0 right-0 cursor-pointer text-red-500"
// // // // // // // // // //                                 onClick={() => removeFile(index)}
// // // // // // // // // //                             >
// // // // // // // // // //                                 &times;
// // // // // // // // // //                             </span>
// // // // // // // // // //                             <span>{file.name}</span>
// // // // // // // // // //                         </div>
// // // // // // // // // //                     ))}
// // // // // // // // // //                 </div>
// // // // // // // // // //                 <input
// // // // // // // // // //                     type="text"
// // // // // // // // // //                     className="border rounded-lg p-2 flex-1 mx-2"
// // // // // // // // // //                     placeholder="Type a message..."
// // // // // // // // // //                     value={messageText}
// // // // // // // // // //                     onChange={(e) => setMessageText(e.target.value)}
// // // // // // // // // //                 />
// // // // // // // // // //                 <button
// // // // // // // // // //                     className="ml-2 p-2 bg-blue-500 text-white rounded-lg"
// // // // // // // // // //                     onClick={sendMessage}
// // // // // // // // // //                     disabled={uploading}
// // // // // // // // // //                 >
// // // // // // // // // //                     {uploading ? "Sending..." : "Send"}
// // // // // // // // // //                 </button>
// // // // // // // // // //             </div>
// // // // // // // // // //         </div>
// // // // // // // // // //     );
// // // // // // // // // // };

// // // // // // // // // // export default Chat;


// // // // // // // // // // // "use client"; // Enable client-side rendering 
// // // // // // // // // // // import React, { useState, useEffect } from 'react';
// // // // // // // // // // // import { database, storage } from '../config/firebase'; // Pastikan Firebase Storage sudah dikonfigurasi
// // // // // // // // // // // import { ref as databaseRef, onValue, push, update } from 'firebase/database';
// // // // // // // // // // // import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
// // // // // // // // // // // import 'tailwindcss/tailwind.css';

// // // // // // // // // // // const Chat = ({ user }) => {
// // // // // // // // // // //     const otherUser = user.id === 'user1' ? { id: 'user2', name: 'User 2' } : { id: 'user1', name: 'User 1' };

// // // // // // // // // // //     const [messages, setMessages] = useState([]);
// // // // // // // // // // //     const [messageText, setMessageText] = useState('');
// // // // // // // // // // //     const [selectedFiles, setSelectedFiles] = useState([]);
// // // // // // // // // // //     const [uploading, setUploading] = useState(false);

// // // // // // // // // // //     // Fetch messages from Firebase on component mount
// // // // // // // // // // //     useEffect(() => {
// // // // // // // // // // //         const messagesRef = databaseRef(database, `messages/${user.id}/${otherUser.id}`);
// // // // // // // // // // //         onValue(messagesRef, (snapshot) => {
// // // // // // // // // // //             const data = snapshot.val();
// // // // // // // // // // //             const loadedMessages = data ? Object.values(data) : [];
// // // // // // // // // // //             setMessages(loadedMessages);

// // // // // // // // // // //             // Mark all messages as read when the user views the chat
// // // // // // // // // // //             loadedMessages.forEach((msg) => {
// // // // // // // // // // //                 if (!msg.read && msg.sender !== user.id) {
// // // // // // // // // // //                     update(databaseRef(database, `messages/${user.id}/${otherUser.id}/${msg.id}`), { read: true });
// // // // // // // // // // //                     update(databaseRef(database, `messages/${otherUser.id}/${user.id}/${msg.id}`), { read: true });
// // // // // // // // // // //                 }
// // // // // // // // // // //             });
// // // // // // // // // // //         });
// // // // // // // // // // //     }, [user.id, otherUser.id]);

// // // // // // // // // // //     // Handle file selection
// // // // // // // // // // //     const handleFileChange = (event) => {
// // // // // // // // // // //         const files = Array.from(event.target.files);
// // // // // // // // // // //         setSelectedFiles((prevFiles) => [...prevFiles, ...files]);
// // // // // // // // // // //     };

// // // // // // // // // // //     // Remove a selected file
// // // // // // // // // // //     const removeFile = (index) => {
// // // // // // // // // // //         setSelectedFiles((prevFiles) => prevFiles.filter((_, i) => i !== index));
// // // // // // // // // // //     };

// // // // // // // // // // //     // Function to send a new message with media support
// // // // // // // // // // //     const sendMessage = async () => {
// // // // // // // // // // //         if (messageText.trim() === "" && selectedFiles.length === 0) return; // Prevent sending empty messages

// // // // // // // // // // //         const messagesRef = databaseRef(database, `messages/${user.id}/${otherUser.id}`);
// // // // // // // // // // //         const newMessage = {
// // // // // // // // // // //             text: messageText,
// // // // // // // // // // //             sender: user.id,
// // // // // // // // // // //             timestamp: Date.now(),
// // // // // // // // // // //             read: false,
// // // // // // // // // // //             files: [],
// // // // // // // // // // //         };

// // // // // // // // // // //         setUploading(true);

// // // // // // // // // // //         // Upload selected files (images and videos) to Firebase Storage
// // // // // // // // // // //         const uploadedFiles = await Promise.all(selectedFiles.map(async (file) => {
// // // // // // // // // // //             const fileRef = storageRef(storage, `chatFiles/${file.name}`);
// // // // // // // // // // //             await uploadBytes(fileRef, file);
// // // // // // // // // // //             return getDownloadURL(fileRef);
// // // // // // // // // // //         }));

// // // // // // // // // // //         // Update newMessage with uploaded file URLs
// // // // // // // // // // //         newMessage.files = uploadedFiles;

// // // // // // // // // // //         // Push message to Firebase Database
// // // // // // // // // // //         const newMsgRef = await push(messagesRef, newMessage);
// // // // // // // // // // //         setMessageText(''); // Clear input after sending
// // // // // // // // // // //         setSelectedFiles([]); // Clear selected files

// // // // // // // // // // //         // Update the recipient's message status
// // // // // // // // // // //         const recipientRef = databaseRef(database, `messages/${otherUser.id}/${user.id}`);
// // // // // // // // // // //         await push(recipientRef, { ...newMessage, id: newMsgRef.key });

// // // // // // // // // // //         setUploading(false);
// // // // // // // // // // //     };

// // // // // // // // // // //     const renderMedia = (files) => {
// // // // // // // // // // //         if (!files || files.length === 0) return null;

// // // // // // // // // // //         const visibleFiles = files.slice(0, 3); // Limit to 3 files preview
// // // // // // // // // // //         const extraFiles = files.length - visibleFiles.length;

// // // // // // // // // // //         return (
// // // // // // // // // // //             <div className="flex flex-wrap mt-1">
// // // // // // // // // // //                 {visibleFiles.map((file, index) => (
// // // // // // // // // // //                     <img
// // // // // // // // // // //                         key={index}
// // // // // // // // // // //                         src={file}
// // // // // // // // // // //                         alt="Media"
// // // // // // // // // // //                         className="w-20 h-20 object-cover rounded-lg m-1"
// // // // // // // // // // //                     />
// // // // // // // // // // //                 ))}
// // // // // // // // // // //                 {extraFiles > 0 && (
// // // // // // // // // // //                     <div className="w-20 h-20 bg-gray-200 flex items-center justify-center rounded-lg m-1">
// // // // // // // // // // //                         +{extraFiles}
// // // // // // // // // // //                     </div>
// // // // // // // // // // //                 )}
// // // // // // // // // // //             </div>
// // // // // // // // // // //         );
// // // // // // // // // // //     };

// // // // // // // // // // //     return (
// // // // // // // // // // //         <div className="flex flex-col h-screen bg-gray-100">
// // // // // // // // // // //             <div className="flex-none p-4 bg-white border-b border-gray-300">
// // // // // // // // // // //                 <h2 className="text-xl text-center">{otherUser.name}</h2>
// // // // // // // // // // //             </div>
// // // // // // // // // // //             <div className="flex-1 overflow-y-auto p-4">
// // // // // // // // // // //                 {/* Display messages */}
// // // // // // // // // // //                 {messages.map((msg, index) => (
// // // // // // // // // // //                     <div key={index} className={`mb-2 ${msg.sender === user.id ? 'text-right' : 'text-left'}`}>
// // // // // // // // // // //                         <div className={`inline-block p-2 rounded-lg ${msg.sender === user.id ? 'bg-blue-500 text-white' : 'bg-gray-300'}`}>
// // // // // // // // // // //                             {msg.text}
// // // // // // // // // // //                             {renderMedia(msg.files)}
// // // // // // // // // // //                         </div>
// // // // // // // // // // //                         <div className="text-xs text-gray-500 flex justify-end items-center">
// // // // // // // // // // //                             {new Date(msg.timestamp).toLocaleTimeString()}
// // // // // // // // // // //                             {msg.sender === user.id && (
// // // // // // // // // // //                                 <span className="ml-2">
// // // // // // // // // // //                                     {msg.read ? (
// // // // // // // // // // //                                         <span className="text-blue-500">✔✔</span>
// // // // // // // // // // //                                     ) : (
// // // // // // // // // // //                                         <span>✔</span>
// // // // // // // // // // //                                     )}
// // // // // // // // // // //                                 </span>
// // // // // // // // // // //                             )}
// // // // // // // // // // //                         </div>
// // // // // // // // // // //                     </div>
// // // // // // // // // // //                 ))}
// // // // // // // // // // //             </div>
// // // // // // // // // // //             <div className="flex items-center p-4 border-t border-gray-300">
// // // // // // // // // // //                 <input
// // // // // // // // // // //                     type="file"
// // // // // // // // // // //                     multiple
// // // // // // // // // // //                     accept="image/*,video/*"
// // // // // // // // // // //                     className="hidden"
// // // // // // // // // // //                     id="fileInput"
// // // // // // // // // // //                     onChange={handleFileChange}
// // // // // // // // // // //                 />
// // // // // // // // // // //                 <label htmlFor="fileInput" className="cursor-pointer">
// // // // // // // // // // //                     <span className="material-icons">attach_file</span>
// // // // // // // // // // //                 </label>
// // // // // // // // // // //                 <div className="flex flex-wrap w-64">
// // // // // // // // // // //                     {selectedFiles.map((file, index) => (
// // // // // // // // // // //                         <div key={index} className="relative mr-2">
// // // // // // // // // // //                             <span
// // // // // // // // // // //                                 className="absolute top-0 right-0 cursor-pointer text-red-500"
// // // // // // // // // // //                                 onClick={() => removeFile(index)}
// // // // // // // // // // //                             >
// // // // // // // // // // //                                 &times;
// // // // // // // // // // //                             </span>
// // // // // // // // // // //                             <span>{file.name}</span>
// // // // // // // // // // //                         </div>
// // // // // // // // // // //                     ))}
// // // // // // // // // // //                 </div>
// // // // // // // // // // //                 <input
// // // // // // // // // // //                     type="text"
// // // // // // // // // // //                     className="border rounded-lg p-2 flex-1 mx-2"
// // // // // // // // // // //                     placeholder="Type a message..."
// // // // // // // // // // //                     value={messageText}
// // // // // // // // // // //                     onChange={(e) => setMessageText(e.target.value)}
// // // // // // // // // // //                 />
// // // // // // // // // // //                 <button
// // // // // // // // // // //                     className="ml-2 p-2 bg-blue-500 text-white rounded-lg"
// // // // // // // // // // //                     onClick={sendMessage}
// // // // // // // // // // //                     disabled={uploading}
// // // // // // // // // // //                 >
// // // // // // // // // // //                     {uploading ? "Sending..." : "Send"}
// // // // // // // // // // //                 </button>
// // // // // // // // // // //             </div>
// // // // // // // // // // //         </div>
// // // // // // // // // // //     );
// // // // // // // // // // // };

// // // // // // // // // // // export default Chat;

// // // // // // // // // // // // import React, { useState } from 'react';
// // // // // // // // // // // // import { storage, database } from './firebase'; // Pastikan Anda sudah mengatur Firebase config
// // // // // // // // // // // // import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
// // // // // // // // // // // // import { ref as dbRef, push, set } from 'firebase/database';

// // // // // // // // // // // // const ChatUploadComponent = ({ chatRoomId }) => {
// // // // // // // // // // // //   const [messageText, setMessageText] = useState('');
// // // // // // // // // // // //   const [images, setImages] = useState([]);
// // // // // // // // // // // //   const [videos, setVideos] = useState([]);
// // // // // // // // // // // //   const [isUploading, setIsUploading] = useState(false);

// // // // // // // // // // // //   const handleImageChange = (e) => {
// // // // // // // // // // // //     setImages([...e.target.files]);
// // // // // // // // // // // //   };

// // // // // // // // // // // //   const handleVideoChange = (e) => {
// // // // // // // // // // // //     setVideos([...e.target.files]);
// // // // // // // // // // // //   };

// // // // // // // // // // // //   const uploadMedia = async () => {
// // // // // // // // // // // //     let imageUrls = [];
// // // // // // // // // // // //     let videoUrls = [];

// // // // // // // // // // // //     // Upload gambar jika ada
// // // // // // // // // // // //     if (images.length > 0) {
// // // // // // // // // // // //       imageUrls = await Promise.all(
// // // // // // // // // // // //         images.map(async (image) => {
// // // // // // // // // // // //           const imageRef = storageRef(storage, `chat_rooms/${chatRoomId}/images/${image.name}`);
// // // // // // // // // // // //           await uploadBytes(imageRef, image);
// // // // // // // // // // // //           const imageUrl = await getDownloadURL(imageRef);
// // // // // // // // // // // //           return imageUrl;
// // // // // // // // // // // //         })
// // // // // // // // // // // //       );
// // // // // // // // // // // //     }

// // // // // // // // // // // //     // Upload video jika ada
// // // // // // // // // // // //     if (videos.length > 0) {
// // // // // // // // // // // //       videoUrls = await Promise.all(
// // // // // // // // // // // //         videos.map(async (video) => {
// // // // // // // // // // // //           const videoRef = storageRef(storage, `chat_rooms/${chatRoomId}/videos/${video.name}`);
// // // // // // // // // // // //           await uploadBytes(videoRef, video);
// // // // // // // // // // // //           const videoUrl = await getDownloadURL(videoRef);
// // // // // // // // // // // //           return videoUrl;
// // // // // // // // // // // //         })
// // // // // // // // // // // //       );
// // // // // // // // // // // //     }

// // // // // // // // // // // //     return { imageUrls, videoUrls };
// // // // // // // // // // // //   };

// // // // // // // // // // // //   const sendMessage = async () => {
// // // // // // // // // // // //     setIsUploading(true);

// // // // // // // // // // // //     const mediaUrls = await uploadMedia();
// // // // // // // // // // // //     const newMessageRef = push(dbRef(database, `chat_rooms/${chatRoomId}/messages`));
    
// // // // // // // // // // // //     const messageData = {
// // // // // // // // // // // //       text: messageText,
// // // // // // // // // // // //       images: mediaUrls.imageUrls || [],
// // // // // // // // // // // //       videos: mediaUrls.videoUrls || [],
// // // // // // // // // // // //       timestamp: Date.now(),
// // // // // // // // // // // //       user: 'currentUserId' // Sesuaikan dengan user ID Anda
// // // // // // // // // // // //     };

// // // // // // // // // // // //     await set(newMessageRef, messageData);

// // // // // // // // // // // //     // Reset form setelah mengirim pesan
// // // // // // // // // // // //     setMessageText('');
// // // // // // // // // // // //     setImages([]);
// // // // // // // // // // // //     setVideos([]);
// // // // // // // // // // // //     setIsUploading(false);
// // // // // // // // // // // //   };

// // // // // // // // // // // //   return (
// // // // // // // // // // // //     <div>
// // // // // // // // // // // //       <div>
// // // // // // // // // // // //         <input
// // // // // // // // // // // //           type="text"
// // // // // // // // // // // //           value={messageText}
// // // // // // // // // // // //           onChange={(e) => setMessageText(e.target.value)}
// // // // // // // // // // // //           placeholder="Type your message..."
// // // // // // // // // // // //         />
// // // // // // // // // // // //       </div>
// // // // // // // // // // // //       <div>
// // // // // // // // // // // //         <input type="file" multiple accept="image/*" onChange={handleImageChange} />
// // // // // // // // // // // //         <input type="file" multiple accept="video/*" onChange={handleVideoChange} />
// // // // // // // // // // // //       </div>
// // // // // // // // // // // //       <button onClick={sendMessage} disabled={isUploading}>
// // // // // // // // // // // //         {isUploading ? 'Uploading...' : 'Send'}
// // // // // // // // // // // //       </button>
// // // // // // // // // // // //     </div>
// // // // // // // // // // // //   );
// // // // // // // // // // // // };

// // // // // // // // // // // // export default ChatUploadComponent;

// // // // // // // // // // // // // "use client"; // Enable client-side rendering
// // // // // // // // // // // // // import React, { useState, useEffect } from 'react';
// // // // // // // // // // // // // import { database, storage } from '../config/firebase';
// // // // // // // // // // // // // import { ref, onValue, push, update, onDisconnect } from 'firebase/database';
// // // // // // // // // // // // // import { uploadBytes, getDownloadURL, ref as storageRef } from 'firebase/storage';
// // // // // // // // // // // // // import 'tailwindcss/tailwind.css';

// // // // // // // // // // // // // const Chat = ({ user }) => {
// // // // // // // // // // // // //     const otherUser = user.id === 'user1' ? { id: 'user2', name: 'User 2' } : { id: 'user1', name: 'User 1' };

// // // // // // // // // // // // //     const [messages, setMessages] = useState([]);
// // // // // // // // // // // // //     const [messageText, setMessageText] = useState('');
// // // // // // // // // // // // //     const [files, setFiles] = useState([]);
// // // // // // // // // // // // //     const [previews, setPreviews] = useState([]);
// // // // // // // // // // // // //     const [isUploading, setIsUploading] = useState(false);
// // // // // // // // // // // // //     const [otherUserStatus, setOtherUserStatus] = useState(null);
// // // // // // // // // // // // //     const [isOtherUserTyping, setIsOtherUserTyping] = useState(false);

// // // // // // // // // // // // //     useEffect(() => {
// // // // // // // // // // // // //         const messagesRef = ref(database, `messages/${user.id}/${otherUser.id}`);
// // // // // // // // // // // // //         onValue(messagesRef, (snapshot) => {
// // // // // // // // // // // // //             const data = snapshot.val();
// // // // // // // // // // // // //             const loadedMessages = data ? Object.values(data) : [];
// // // // // // // // // // // // //             setMessages(loadedMessages);
// // // // // // // // // // // // //             loadedMessages.forEach((msg) => {
// // // // // // // // // // // // //                 if (!msg.read && msg.sender !== user.id) {
// // // // // // // // // // // // //                     const readTimestamp = Date.now();
// // // // // // // // // // // // //                     update(ref(database, `messages/${user.id}/${otherUser.id}/${msg.id}`), { read: true, readAt: readTimestamp });
// // // // // // // // // // // // //                     update(ref(database, `messages/${otherUser.id}/${user.id}/${msg.id}`), { read: true, readAt: readTimestamp });
// // // // // // // // // // // // //                 }
// // // // // // // // // // // // //             });
// // // // // // // // // // // // //         });
// // // // // // // // // // // // //     }, [user.id, otherUser.id]);

// // // // // // // // // // // // //     useEffect(() => {
// // // // // // // // // // // // //         const userStatusRef = ref(database, `status/${user.id}`);
// // // // // // // // // // // // //         const typingRef = ref(database, `typing/${user.id}`);
// // // // // // // // // // // // //         update(userStatusRef, { online: true, lastSeen: Date.now() });
// // // // // // // // // // // // //         onDisconnect(userStatusRef).update({ online: false, lastSeen: Date.now() });

// // // // // // // // // // // // //         if (messageText.trim() || files.length > 0) {
// // // // // // // // // // // // //             update(typingRef, { typing: true });
// // // // // // // // // // // // //         } else {
// // // // // // // // // // // // //             update(typingRef, { typing: false });
// // // // // // // // // // // // //         }

// // // // // // // // // // // // //         const otherUserStatusRef = ref(database, `status/${otherUser.id}`);
// // // // // // // // // // // // //         onValue(otherUserStatusRef, (snapshot) => {
// // // // // // // // // // // // //             const status = snapshot.val();
// // // // // // // // // // // // //             setOtherUserStatus(status);
// // // // // // // // // // // // //         });

// // // // // // // // // // // // //         const otherUserTypingRef = ref(database, `typing/${otherUser.id}`);
// // // // // // // // // // // // //         onValue(otherUserTypingRef, (snapshot) => {
// // // // // // // // // // // // //             const data = snapshot.val();
// // // // // // // // // // // // //             setIsOtherUserTyping(data?.typing || false);
// // // // // // // // // // // // //         });

// // // // // // // // // // // // //         return () => {
// // // // // // // // // // // // //             update(typingRef, { typing: false });
// // // // // // // // // // // // //             onDisconnect(userStatusRef).cancel();
// // // // // // // // // // // // //         };
// // // // // // // // // // // // //     }, [messageText, files, user.id, otherUser.id]);

// // // // // // // // // // // // //     const handleFileChange = (e) => {
// // // // // // // // // // // // //         const selectedFiles = Array.from(e.target.files);
// // // // // // // // // // // // //         setFiles([...files, ...selectedFiles]);
// // // // // // // // // // // // //         const newPreviews = selectedFiles.map((file) => ({
// // // // // // // // // // // // //             id: URL.createObjectURL(file),
// // // // // // // // // // // // //             file,
// // // // // // // // // // // // //         }));
// // // // // // // // // // // // //         setPreviews([...previews, ...newPreviews]);
// // // // // // // // // // // // //     };

// // // // // // // // // // // // //     const removeFile = (previewId) => {
// // // // // // // // // // // // //         setPreviews(previews.filter((preview) => preview.id !== previewId));
// // // // // // // // // // // // //         setFiles(files.filter((file) => URL.createObjectURL(file) !== previewId));
// // // // // // // // // // // // //     };

// // // // // // // // // // // // //     // Fungsi untuk upload semua jenis media (foto & video)
// // // // // // // // // // // // //     const uploadMedia = async () => {
// // // // // // // // // // // // //         const uploadPromises = files.map((file) => {
// // // // // // // // // // // // //             const fileExtension = file.name.split('.').pop().toLowerCase();
// // // // // // // // // // // // //             const mediaRef = storageRef(storage, `media/${user.id}/${Date.now()}_${file.name}`);
// // // // // // // // // // // // //             return uploadBytes(mediaRef, file).then(() => getDownloadURL(mediaRef));
// // // // // // // // // // // // //         });

// // // // // // // // // // // // //         return await Promise.all(uploadPromises);
// // // // // // // // // // // // //     };

// // // // // // // // // // // // //     const sendMessage = async () => {
// // // // // // // // // // // // //         if (messageText.trim() === "" && files.length === 0) return;

// // // // // // // // // // // // //         const messagesRef = ref(database, `messages/${user.id}/${otherUser.id}`);
// // // // // // // // // // // // //         const newMessageKey = push(messagesRef).key;

// // // // // // // // // // // // //         let mediaURLs = [];
// // // // // // // // // // // // //         if (files.length > 0) {
// // // // // // // // // // // // //             setIsUploading(true);
// // // // // // // // // // // // //             mediaURLs = await uploadMedia();
// // // // // // // // // // // // //             setIsUploading(false);
// // // // // // // // // // // // //             setFiles([]);
// // // // // // // // // // // // //             setPreviews([]);
// // // // // // // // // // // // //         }

// // // // // // // // // // // // //         const newMessage = {
// // // // // // // // // // // // //             text: messageText,
// // // // // // // // // // // // //             sender: user.id,
// // // // // // // // // // // // //             timestamp: Date.now(),
// // // // // // // // // // // // //             read: false,
// // // // // // // // // // // // //             id: newMessageKey,
// // // // // // // // // // // // //             files: mediaURLs,
// // // // // // // // // // // // //         };

// // // // // // // // // // // // //         const updates = {};
// // // // // // // // // // // // //         updates[`messages/${user.id}/${otherUser.id}/${newMessageKey}`] = newMessage;
// // // // // // // // // // // // //         updates[`messages/${otherUser.id}/${user.id}/${newMessageKey}`] = newMessage;

// // // // // // // // // // // // //         update(ref(database), updates).then(() => {
// // // // // // // // // // // // //             setMessageText('');
// // // // // // // // // // // // //         });
// // // // // // // // // // // // //     };

// // // // // // // // // // // // //     const renderMedia = (files) => {
// // // // // // // // // // // // //         if (files.length === 0) return null;

// // // // // // // // // // // // //         const visibleFiles = files.slice(0, 3);
// // // // // // // // // // // // //         const extraFiles = files.length > 3 ? files.length - 3 : 0;

// // // // // // // // // // // // //         return (
// // // // // // // // // // // // //             <div className="flex space-x-2">
// // // // // // // // // // // // //                 {visibleFiles.map((file, index) => {
// // // // // // // // // // // // //                     const fileType = file.split('.').pop().toLowerCase();

// // // // // // // // // // // // //                     if (['jpg', 'jpeg', 'png', 'gif'].includes(fileType)) {
// // // // // // // // // // // // //                         return (
// // // // // // // // // // // // //                             <img
// // // // // // // // // // // // //                                 key={index}
// // // // // // // // // // // // //                                 src={file}
// // // // // // // // // // // // //                                 alt={`Image ${index + 1}`}
// // // // // // // // // // // // //                                 className="w-24 h-24 object-cover rounded-lg"
// // // // // // // // // // // // //                             />
// // // // // // // // // // // // //                         );
// // // // // // // // // // // // //                     } else if (['mp4', 'mkv', 'webm', 'ogg'].includes(fileType)) {
// // // // // // // // // // // // //                         return (
// // // // // // // // // // // // //                             <video key={index} controls className="w-24 h-24 rounded-lg">
// // // // // // // // // // // // //                                 <source src={file} type={`video/${fileType}`} />
// // // // // // // // // // // // //                                 Your browser does not support the video tag.
// // // // // // // // // // // // //                             </video>
// // // // // // // // // // // // //                         );
// // // // // // // // // // // // //                     } else {
// // // // // // // // // // // // //                         return (
// // // // // // // // // // // // //                             <div key={index} className="w-24 h-24 bg-gray-200 rounded-lg flex items-center justify-center">
// // // // // // // // // // // // //                                 <span className="text-center text-sm">Document: {file.split('/').pop()}</span>
// // // // // // // // // // // // //                             </div>
// // // // // // // // // // // // //                         );
// // // // // // // // // // // // //                     }
// // // // // // // // // // // // //                 })}
// // // // // // // // // // // // //                 {extraFiles > 0 && (
// // // // // // // // // // // // //                     <div className="relative w-24 h-24 bg-gray-200 rounded-lg flex items-center justify-center">
// // // // // // // // // // // // //                         <span className="text-xl font-bold">+{extraFiles}</span>
// // // // // // // // // // // // //                     </div>
// // // // // // // // // // // // //                 )}
// // // // // // // // // // // // //             </div>
// // // // // // // // // // // // //         );
// // // // // // // // // // // // //     };

// // // // // // // // // // // // //     return (
// // // // // // // // // // // // //         <div className="flex flex-col h-screen bg-gray-100">
// // // // // // // // // // // // //             <div className="bg-white p-4 shadow-md sticky top-0 z-10">
// // // // // // // // // // // // //                 <h2 className="text-xl text-center">{otherUser.name}</h2>
// // // // // // // // // // // // //                 <div className="text-sm text-gray-500 text-center">
// // // // // // // // // // // // //                     {otherUserStatus?.online ? (
// // // // // // // // // // // // //                         <span>{otherUser.name} is online</span>
// // // // // // // // // // // // //                     ) : (
// // // // // // // // // // // // //                         <span>Last seen at {new Date(otherUserStatus?.lastSeen).toLocaleTimeString()}</span>
// // // // // // // // // // // // //                     )}
// // // // // // // // // // // // //                     {isOtherUserTyping && <span>...typing</span>}
// // // // // // // // // // // // //                 </div>
// // // // // // // // // // // // //             </div>

// // // // // // // // // // // // //             <div className="flex-1 p-4 overflow-y-scroll">
// // // // // // // // // // // // //                 {messages.map((message, index) => (
// // // // // // // // // // // // //                     <div
// // // // // // // // // // // // //                         key={index}
// // // // // // // // // // // // //                         className={`mb-4 ${message.sender === user.id ? 'text-right' : 'text-left'}`}
// // // // // // // // // // // // //                     >
// // // // // // // // // // // // //                         <div className={`inline-block p-2 rounded-lg ${message.sender === user.id ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}>
// // // // // // // // // // // // //                             <p>{message.text}</p>
// // // // // // // // // // // // //                             {renderMedia(message.files)}
// // // // // // // // // // // // //                         </div>
// // // // // // // // // // // // //                     </div>
// // // // // // // // // // // // //                 ))}
// // // // // // // // // // // // //             </div>

// // // // // // // // // // // // //             {previews.length > 0 && (
// // // // // // // // // // // // //                 <div className="p-2 border-t border-gray-300">
// // // // // // // // // // // // //                     <div className="flex overflow-x-auto">
// // // // // // // // // // // // //                         {previews.map((preview) => (
// // // // // // // // // // // // //                             <div key={preview.id} className="relative w-24 h-24">
// // // // // // // // // // // // //                                 <img src={preview.id} alt="Preview" className="w-full h-full object-cover rounded-lg" />
// // // // // // // // // // // // //                                 <button
// // // // // // // // // // // // //                                     onClick={() => removeFile(preview.id)}
// // // // // // // // // // // // //                                     className="absolute top-0 right-0 bg-red-500 text-white p-1 rounded-full"
// // // // // // // // // // // // //                                 >
// // // // // // // // // // // // //                                     &times;
// // // // // // // // // // // // //                                 </button>
// // // // // // // // // // // // //                             </div>
// // // // // // // // // // // // //                         ))}
// // // // // // // // // // // // //                     </div>
// // // // // // // // // // // // //                 </div>
// // // // // // // // // // // // //             )}

// // // // // // // // // // // // //             <div className="p-4 bg-white border-t border-gray-300">
// // // // // // // // // // // // //                 <div className="flex items-center">
// // // // // // // // // // // // //                     <input
// // // // // // // // // // // // //                         type="file"
// // // // // // // // // // // // //                         multiple
// // // // // // // // // // // // //                         onChange={handleFileChange}
// // // // // // // // // // // // //                         className="hidden"
// // // // // // // // // // // // //                         id="fileInput"
// // // // // // // // // // // // //                     />

// // // // // // // // // // // // //                     <label htmlFor="fileInput" className="mr-2 cursor-pointer">
// // // // // // // // // // // // //                         <span className="text-gray-600 hover:text-blue-500">📎 Attach</span>
// // // // // // // // // // // // //                     </label>

// // // // // // // // // // // // //                     <input
// // // // // // // // // // // // //                         type="text"
// // // // // // // // // // // // //                         value={messageText}
// // // // // // // // // // // // //                         onChange={(e) => setMessageText(e.target.value)}
// // // // // // // // // // // // //                         placeholder="Type your message"
// // // // // // // // // // // // //                         className="flex-1 p-2 border rounded-md focus:outline-none"
// // // // // // // // // // // // //                     />

// // // // // // // // // // // // //                     <button
// // // // // // // // // // // // //                         onClick={sendMessage}
// // // // // // // // // // // // //                         disabled={isUploading}
// // // // // // // // // // // // //                         className="ml-2 bg-blue-500 text-white px-4 py-2 rounded-md"
// // // // // // // // // // // // //                     >
// // // // // // // // // // // // //                         {isUploading ? 'Uploading...' : 'Send'}
// // // // // // // // // // // // //                     </button>
// // // // // // // // // // // // //                 </div>
// // // // // // // // // // // // //             </div>
// // // // // // // // // // // // //         </div>
// // // // // // // // // // // // //     );
// // // // // // // // // // // // // };

// // // // // // // // // // // // // export default Chat;

// // // // // // // // // // // // // // "use client"; // Enable client-side rendering
// // // // // // // // // // // // // // import React, { useState, useEffect } from 'react';
// // // // // // // // // // // // // // import { database, storage } from '../config/firebase';
// // // // // // // // // // // // // // import { ref, onValue, push, update, onDisconnect } from 'firebase/database';
// // // // // // // // // // // // // // import { uploadBytes, getDownloadURL, ref as storageRef } from 'firebase/storage';
// // // // // // // // // // // // // // import 'tailwindcss/tailwind.css';

// // // // // // // // // // // // // // const Chat = ({ user }) => {
// // // // // // // // // // // // // //     const otherUser = user.id === 'user1' ? { id: 'user2', name: 'User 2' } : { id: 'user1', name: 'User 1' };

// // // // // // // // // // // // // //     const [messages, setMessages] = useState([]);
// // // // // // // // // // // // // //     const [messageText, setMessageText] = useState('');
// // // // // // // // // // // // // //     const [files, setFiles] = useState([]);
// // // // // // // // // // // // // //     const [previews, setPreviews] = useState([]);
// // // // // // // // // // // // // //     const [isUploading, setIsUploading] = useState(false);
// // // // // // // // // // // // // //     const [otherUserStatus, setOtherUserStatus] = useState(null);
// // // // // // // // // // // // // //     const [isOtherUserTyping, setIsOtherUserTyping] = useState(false);

// // // // // // // // // // // // // //     useEffect(() => {
// // // // // // // // // // // // // //         const messagesRef = ref(database, `messages/${user.id}/${otherUser.id}`);
// // // // // // // // // // // // // //         onValue(messagesRef, (snapshot) => {
// // // // // // // // // // // // // //             const data = snapshot.val();
// // // // // // // // // // // // // //             const loadedMessages = data ? Object.values(data) : [];
// // // // // // // // // // // // // //             setMessages(loadedMessages);
// // // // // // // // // // // // // //             loadedMessages.forEach((msg) => {
// // // // // // // // // // // // // //                 if (!msg.read && msg.sender !== user.id) {
// // // // // // // // // // // // // //                     const readTimestamp = Date.now();
// // // // // // // // // // // // // //                     update(ref(database, `messages/${user.id}/${otherUser.id}/${msg.id}`), { read: true, readAt: readTimestamp });
// // // // // // // // // // // // // //                     update(ref(database, `messages/${otherUser.id}/${user.id}/${msg.id}`), { read: true, readAt: readTimestamp });
// // // // // // // // // // // // // //                 }
// // // // // // // // // // // // // //             });
// // // // // // // // // // // // // //         });
// // // // // // // // // // // // // //     }, [user.id, otherUser.id]);

// // // // // // // // // // // // // //     useEffect(() => {
// // // // // // // // // // // // // //         const userStatusRef = ref(database, `status/${user.id}`);
// // // // // // // // // // // // // //         const typingRef = ref(database, `typing/${user.id}`);
// // // // // // // // // // // // // //         update(userStatusRef, { online: true, lastSeen: Date.now() });
// // // // // // // // // // // // // //         onDisconnect(userStatusRef).update({ online: false, lastSeen: Date.now() });

// // // // // // // // // // // // // //         if (messageText.trim() || files.length > 0) {
// // // // // // // // // // // // // //             update(typingRef, { typing: true });
// // // // // // // // // // // // // //         } else {
// // // // // // // // // // // // // //             update(typingRef, { typing: false });
// // // // // // // // // // // // // //         }

// // // // // // // // // // // // // //         const otherUserStatusRef = ref(database, `status/${otherUser.id}`);
// // // // // // // // // // // // // //         onValue(otherUserStatusRef, (snapshot) => {
// // // // // // // // // // // // // //             const status = snapshot.val();
// // // // // // // // // // // // // //             setOtherUserStatus(status);
// // // // // // // // // // // // // //         });

// // // // // // // // // // // // // //         const otherUserTypingRef = ref(database, `typing/${otherUser.id}`);
// // // // // // // // // // // // // //         onValue(otherUserTypingRef, (snapshot) => {
// // // // // // // // // // // // // //             const data = snapshot.val();
// // // // // // // // // // // // // //             setIsOtherUserTyping(data?.typing || false);
// // // // // // // // // // // // // //         });

// // // // // // // // // // // // // //         return () => {
// // // // // // // // // // // // // //             update(typingRef, { typing: false });
// // // // // // // // // // // // // //             onDisconnect(userStatusRef).cancel();
// // // // // // // // // // // // // //         };
// // // // // // // // // // // // // //     }, [messageText, files, user.id, otherUser.id]);

// // // // // // // // // // // // // //     const handleFileChange = (e) => {
// // // // // // // // // // // // // //         const selectedFiles = Array.from(e.target.files);
// // // // // // // // // // // // // //         setFiles([...files, ...selectedFiles]);
// // // // // // // // // // // // // //         const newPreviews = selectedFiles.map((file) => ({
// // // // // // // // // // // // // //             id: URL.createObjectURL(file),
// // // // // // // // // // // // // //             file,
// // // // // // // // // // // // // //         }));
// // // // // // // // // // // // // //         setPreviews([...previews, ...newPreviews]);
// // // // // // // // // // // // // //     };

// // // // // // // // // // // // // //     const removeFile = (previewId) => {
// // // // // // // // // // // // // //         setPreviews(previews.filter((preview) => preview.id !== previewId));
// // // // // // // // // // // // // //         setFiles(files.filter((file) => URL.createObjectURL(file) !== previewId));
// // // // // // // // // // // // // //     };

// // // // // // // // // // // // // //     const uploadFiles = async () => {
// // // // // // // // // // // // // //         const uploadPromises = files.map((file) => {
// // // // // // // // // // // // // //             const storageReference = storageRef(storage, `files/${user.id}/${Date.now()}_${file.name}`);
// // // // // // // // // // // // // //             return uploadBytes(storageReference, file).then(() => getDownloadURL(storageReference));
// // // // // // // // // // // // // //         });
// // // // // // // // // // // // // //         return await Promise.all(uploadPromises);
// // // // // // // // // // // // // //     };

// // // // // // // // // // // // // //     const sendMessage = async () => {
// // // // // // // // // // // // // //         if (messageText.trim() === "" && files.length === 0) return;

// // // // // // // // // // // // // //         const messagesRef = ref(database, `messages/${user.id}/${otherUser.id}`);
// // // // // // // // // // // // // //         const newMessageKey = push(messagesRef).key;

// // // // // // // // // // // // // //         let fileURLs = [];
// // // // // // // // // // // // // //         if (files.length > 0) {
// // // // // // // // // // // // // //             setIsUploading(true);
// // // // // // // // // // // // // //             fileURLs = await uploadFiles();
// // // // // // // // // // // // // //             setIsUploading(false);
// // // // // // // // // // // // // //             setFiles([]);
// // // // // // // // // // // // // //             setPreviews([]);
// // // // // // // // // // // // // //         }

// // // // // // // // // // // // // //         const newMessage = {
// // // // // // // // // // // // // //             text: messageText,
// // // // // // // // // // // // // //             sender: user.id,
// // // // // // // // // // // // // //             timestamp: Date.now(),
// // // // // // // // // // // // // //             read: false,
// // // // // // // // // // // // // //             id: newMessageKey,
// // // // // // // // // // // // // //             files: fileURLs,
// // // // // // // // // // // // // //         };

// // // // // // // // // // // // // //         const updates = {};
// // // // // // // // // // // // // //         updates[`messages/${user.id}/${otherUser.id}/${newMessageKey}`] = newMessage;
// // // // // // // // // // // // // //         updates[`messages/${otherUser.id}/${user.id}/${newMessageKey}`] = newMessage;

// // // // // // // // // // // // // //         update(ref(database), updates).then(() => {
// // // // // // // // // // // // // //             setMessageText('');
// // // // // // // // // // // // // //         });
// // // // // // // // // // // // // //     };

// // // // // // // // // // // // // //     // // Render media in chat (with +X for extra media)
// // // // // // // // // // // // // //     // const renderMedia = (files) => {
// // // // // // // // // // // // // //     //     if (files.length === 0) return null;

// // // // // // // // // // // // // //     //     const visibleFiles = files.slice(0, 3);
// // // // // // // // // // // // // //     //     const extraFiles = files.length > 3 ? files.length - 3 : 0;

// // // // // // // // // // // // // //     //     return (
// // // // // // // // // // // // // //     //         <div className="flex space-x-2">
// // // // // // // // // // // // // //     //             {visibleFiles.map((file, index) => {
// // // // // // // // // // // // // //     //                 const fileType = file.split('.').pop();
// // // // // // // // // // // // // //     //                 if (['jpg', 'jpeg', 'png', 'gif'].includes(fileType)) {
// // // // // // // // // // // // // //     //                     return (
// // // // // // // // // // // // // //     //                         <img
// // // // // // // // // // // // // //     //                             key={index}
// // // // // // // // // // // // // //     //                             src={file}
// // // // // // // // // // // // // //     //                             alt={`Media ${index + 1}`}
// // // // // // // // // // // // // //     //                             className="w-24 h-24 object-cover rounded-lg"
// // // // // // // // // // // // // //     //                         />
// // // // // // // // // // // // // //     //                     );
// // // // // // // // // // // // // //     //                 } else if (['mp4', 'webm', 'ogg'].includes(fileType)) {
// // // // // // // // // // // // // //     //                     return (
// // // // // // // // // // // // // //     //                         <video key={index} controls className="w-24 h-24 rounded-lg">
// // // // // // // // // // // // // //     //                             <source src={file} type={`video/${fileType}`} />
// // // // // // // // // // // // // //     //                             Your browser does not support the video tag.
// // // // // // // // // // // // // //     //                         </video>
// // // // // // // // // // // // // //     //                     );
// // // // // // // // // // // // // //     //                 } else {
// // // // // // // // // // // // // //     //                     return (
// // // // // // // // // // // // // //     //                         <div key={index} className="w-24 h-24 bg-gray-200 rounded-lg flex items-center justify-center">
// // // // // // // // // // // // // //     //                             <span className="text-center text-sm">File: {file.split('/').pop()}</span>
// // // // // // // // // // // // // //     //                         </div>
// // // // // // // // // // // // // //     //                     );
// // // // // // // // // // // // // //     //                 }
// // // // // // // // // // // // // //     //             })}
// // // // // // // // // // // // // //     //             {extraFiles > 0 && (
// // // // // // // // // // // // // //     //                 <div className="relative w-24 h-24 bg-gray-200 rounded-lg flex items-center justify-center">
// // // // // // // // // // // // // //     //                     <span className="text-xl font-bold">+{extraFiles}</span>
// // // // // // // // // // // // // //     //                 </div>
// // // // // // // // // // // // // //     //             )}
// // // // // // // // // // // // // //     //         </div>
// // // // // // // // // // // // // //     //     );
// // // // // // // // // // // // // //     // };
// // // // // // // // // // // // // // //     const renderMedia = (files) => {
// // // // // // // // // // // // // // //     if (files.length === 0) return null;

// // // // // // // // // // // // // // //     const visibleFiles = files.slice(0, 3);
// // // // // // // // // // // // // // //     const extraFiles = files.length > 3 ? files.length - 3 : 0;

// // // // // // // // // // // // // // //     return (
// // // // // // // // // // // // // // //         <div className="flex space-x-2">
// // // // // // // // // // // // // // //             {visibleFiles.map((file, index) => {
// // // // // // // // // // // // // // //                 const fileType = file.split('.').pop().toLowerCase();
// // // // // // // // // // // // // // //                 if (['jpg', 'jpeg', 'png', 'gif'].includes(fileType)) {
// // // // // // // // // // // // // // //                     return (
// // // // // // // // // // // // // // //                         <img
// // // // // // // // // // // // // // //                             key={index}
// // // // // // // // // // // // // // //                             src={file}
// // // // // // // // // // // // // // //                             alt={`Media ${index + 1}`}
// // // // // // // // // // // // // // //                             className="w-24 h-24 object-cover rounded-lg"
// // // // // // // // // // // // // // //                         />
// // // // // // // // // // // // // // //                     );
// // // // // // // // // // // // // // //                 } else if (['mp4', 'mkv', 'webm', 'ogg'].includes(fileType)) {
// // // // // // // // // // // // // // //                     return (
// // // // // // // // // // // // // // //                         <video key={index} controls className="w-24 h-24 rounded-lg">
// // // // // // // // // // // // // // //                             <source src={file} type={`video/${fileType}`} />
// // // // // // // // // // // // // // //                             Your browser does not support the video tag.
// // // // // // // // // // // // // // //                         </video>
// // // // // // // // // // // // // // //                     );
// // // // // // // // // // // // // // //                 } else {
// // // // // // // // // // // // // // //                     return (
// // // // // // // // // // // // // // //                         <div key={index} className="w-24 h-24 bg-gray-200 rounded-lg flex items-center justify-center">
// // // // // // // // // // // // // // //                             <span className="text-center text-sm">Document: {file.split('/').pop()}</span>
// // // // // // // // // // // // // // //                         </div>
// // // // // // // // // // // // // // //                     );
// // // // // // // // // // // // // // //                 }
// // // // // // // // // // // // // // //             })}
// // // // // // // // // // // // // // //             {extraFiles > 0 && (
// // // // // // // // // // // // // // //                 <div className="relative w-24 h-24 bg-gray-200 rounded-lg flex items-center justify-center">
// // // // // // // // // // // // // // //                     <span className="text-xl font-bold">+{extraFiles}</span>
// // // // // // // // // // // // // // //                 </div>
// // // // // // // // // // // // // // //             )}
// // // // // // // // // // // // // // //         </div>
// // // // // // // // // // // // // // //     );
// // // // // // // // // // // // // // // };
// // // // // // // // // // // // // // //     const renderMedia = (files) => {
// // // // // // // // // // // // // // //     if (files.length === 0) return null;

// // // // // // // // // // // // // // //     const visibleFiles = files.slice(0, 3);
// // // // // // // // // // // // // // //     const extraFiles = files.length > 3 ? files.length - 3 : 0;

// // // // // // // // // // // // // // //     return (
// // // // // // // // // // // // // // //         <div className="flex space-x-2">
// // // // // // // // // // // // // // //             {visibleFiles.map((file, index) => {
// // // // // // // // // // // // // // //                 const fileType = file.split('.').pop().toLowerCase();

// // // // // // // // // // // // // // //                 if (['jpg', 'jpeg', 'png', 'gif'].includes(fileType)) {
// // // // // // // // // // // // // // //                     return (
// // // // // // // // // // // // // // //                         <img
// // // // // // // // // // // // // // //                             key={index}
// // // // // // // // // // // // // // //                             src={file}
// // // // // // // // // // // // // // //                             alt={`Image ${index + 1}`}
// // // // // // // // // // // // // // //                             className="w-24 h-24 object-cover rounded-lg"
// // // // // // // // // // // // // // //                         />
// // // // // // // // // // // // // // //                     );
// // // // // // // // // // // // // // //                 } else if (['mp4', 'mkv', 'webm', 'ogg'].includes(fileType)) {
// // // // // // // // // // // // // // //                     return (
// // // // // // // // // // // // // // //                         <video key={index} controls className="w-24 h-24 rounded-lg">
// // // // // // // // // // // // // // //                             <source src={file} type={`video/${fileType}`} />
// // // // // // // // // // // // // // //                             Your browser does not support the video tag.
// // // // // // // // // // // // // // //                         </video>
// // // // // // // // // // // // // // //                     );
// // // // // // // // // // // // // // //                 } else {
// // // // // // // // // // // // // // //                     return (
// // // // // // // // // // // // // // //                         <div key={index} className="w-24 h-24 bg-gray-200 rounded-lg flex items-center justify-center">
// // // // // // // // // // // // // // //                             <span className="text-center text-sm">Document: {file.split('/').pop()}</span>
// // // // // // // // // // // // // // //                         </div>
// // // // // // // // // // // // // // //                     );
// // // // // // // // // // // // // // //                 }
// // // // // // // // // // // // // // //             })}
// // // // // // // // // // // // // // //             {extraFiles > 0 && (
// // // // // // // // // // // // // // //                 <div className="relative w-24 h-24 bg-gray-200 rounded-lg flex items-center justify-center">
// // // // // // // // // // // // // // //                     <span className="text-xl font-bold">+{extraFiles}</span>
// // // // // // // // // // // // // // //                 </div>
// // // // // // // // // // // // // // //             )}
// // // // // // // // // // // // // // //         </div>
// // // // // // // // // // // // // // //     );
// // // // // // // // // // // // // // // };
// // // // // // // // // // // // // //     const renderMedia = (files) => {
// // // // // // // // // // // // // //        if (files.length === 0) return null;
   
// // // // // // // // // // // // // //        const visibleFiles = files.slice(0, 3);
// // // // // // // // // // // // // //        const extraFiles = files.length > 3 ? files.length - 3 : 0;
   
// // // // // // // // // // // // // //        return (
// // // // // // // // // // // // // //            <div className="flex space-x-2">
// // // // // // // // // // // // // //                {visibleFiles.map((file, index) => {
// // // // // // // // // // // // // //                    const fileType = file.split('.').pop().toLowerCase();
   
// // // // // // // // // // // // // //                    if (['jpg', 'jpeg', 'png', 'gif'].includes(fileType)) {
// // // // // // // // // // // // // //                        return (
// // // // // // // // // // // // // //                            <img
// // // // // // // // // // // // // //                                key={index}
// // // // // // // // // // // // // //                                src={file}
// // // // // // // // // // // // // //                                alt={`Image ${index + 1}`}
// // // // // // // // // // // // // //                                className="w-24 h-24 object-cover rounded-lg"
// // // // // // // // // // // // // //                            />
// // // // // // // // // // // // // //                        );
// // // // // // // // // // // // // //                    } else if (['mp4', 'mkv', 'webm', 'ogg'].includes(fileType)) {
// // // // // // // // // // // // // //                        return (
// // // // // // // // // // // // // //                            <video key={index} controls className="w-24 h-24 rounded-lg">
// // // // // // // // // // // // // //                                <source src={file} type={`video/${fileType}`} />
// // // // // // // // // // // // // //                                Your browser does not support the video tag.
// // // // // // // // // // // // // //                            </video>
// // // // // // // // // // // // // //                        );
// // // // // // // // // // // // // //                    } else {
// // // // // // // // // // // // // //                        return (
// // // // // // // // // // // // // //                            <div key={index} className="w-24 h-24 bg-gray-200 rounded-lg flex items-center justify-center">
// // // // // // // // // // // // // //                                <span className="text-center text-sm">Document: {file.split('/').pop()}</span>
// // // // // // // // // // // // // //                            </div>
// // // // // // // // // // // // // //                        );
// // // // // // // // // // // // // //                    }
// // // // // // // // // // // // // //                })}
// // // // // // // // // // // // // //                {extraFiles > 0 && (
// // // // // // // // // // // // // //                    <div className="relative w-24 h-24 bg-gray-200 rounded-lg flex items-center justify-center">
// // // // // // // // // // // // // //                        <span className="text-xl font-bold">+{extraFiles}</span>
// // // // // // // // // // // // // //                    </div>
// // // // // // // // // // // // // //                )}
// // // // // // // // // // // // // //            </div>
// // // // // // // // // // // // // //        );
// // // // // // // // // // // // // //    };




// // // // // // // // // // // // // //     return (
// // // // // // // // // // // // // //         <div className="flex flex-col h-screen bg-gray-100">
// // // // // // // // // // // // // //             <div className="bg-white p-4 shadow-md sticky top-0 z-10">
// // // // // // // // // // // // // //                 <h2 className="text-xl text-center">{otherUser.name}</h2>
// // // // // // // // // // // // // //                 <div className="text-sm text-gray-500 text-center">
// // // // // // // // // // // // // //                     {otherUserStatus?.online ? (
// // // // // // // // // // // // // //                         <span>{otherUser.name} is online</span>
// // // // // // // // // // // // // //                     ) : (
// // // // // // // // // // // // // //                         <span>Last seen at {new Date(otherUserStatus?.lastSeen).toLocaleTimeString()}</span>
// // // // // // // // // // // // // //                     )}
// // // // // // // // // // // // // //                     {isOtherUserTyping && <span>...typing</span>}
// // // // // // // // // // // // // //                 </div>
// // // // // // // // // // // // // //             </div>

// // // // // // // // // // // // // //             <div className="flex-1 p-4 overflow-y-scroll">
// // // // // // // // // // // // // //                 {messages.map((message, index) => (
// // // // // // // // // // // // // //                     <div
// // // // // // // // // // // // // //                         key={index}
// // // // // // // // // // // // // //                         className={`mb-4 ${message.sender === user.id ? 'text-right' : 'text-left'}`}
// // // // // // // // // // // // // //                     >
// // // // // // // // // // // // // //                         <div className={`inline-block p-2 rounded-lg ${message.sender === user.id ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}>
// // // // // // // // // // // // // //                             <p>{message.text}</p>
// // // // // // // // // // // // // //                             {renderMedia(message.files)}
// // // // // // // // // // // // // //                         </div>
// // // // // // // // // // // // // //                     </div>
// // // // // // // // // // // // // //                 ))}
// // // // // // // // // // // // // //             </div>

// // // // // // // // // // // // // //             {previews.length > 0 && (
// // // // // // // // // // // // // //                 <div className="p-2 border-t border-gray-300">
// // // // // // // // // // // // // //                     <div className="flex overflow-x-auto">
// // // // // // // // // // // // // //                         {renderPreviews()}
// // // // // // // // // // // // // //                     </div>
// // // // // // // // // // // // // //                 </div>
// // // // // // // // // // // // // //             )}

// // // // // // // // // // // // // //             <div className="p-4 bg-white border-t border-gray-300">
// // // // // // // // // // // // // //                 <div className="flex items-center">
// // // // // // // // // // // // // //                     <input
// // // // // // // // // // // // // //                         type="file"
// // // // // // // // // // // // // //                         multiple
// // // // // // // // // // // // // //                         onChange={handleFileChange}
// // // // // // // // // // // // // //                         className="hidden"
// // // // // // // // // // // // // //                         id="fileInput"
// // // // // // // // // // // // // //                     />
                    
// // // // // // // // // // // // // //                     <label htmlFor="fileInput" className="mr-2 cursor-pointer">
// // // // // // // // // // // // // //                         <span className="text-gray-600 hover:text-blue-500">📎</span>
// // // // // // // // // // // // // //                     </label>

// // // // // // // // // // // // // //                     {/* Text input */}
// // // // // // // // // // // // // //                     <input
// // // // // // // // // // // // // //                         type="text"
// // // // // // // // // // // // // //                         value={messageText}
// // // // // // // // // // // // // //                         onChange={(e) => setMessageText(e.target.value)}
// // // // // // // // // // // // // //                         placeholder="Type your message..."
// // // // // // // // // // // // // //                         className="flex-1 p-2 border border-gray-300 rounded-lg focus:outline-none"
// // // // // // // // // // // // // //                     />

// // // // // // // // // // // // // //                     {/* Send button */}
// // // // // // // // // // // // // //                     <button
// // // // // // // // // // // // // //                         className="bg-blue-500 text-white p-2 rounded-lg ml-2"
// // // // // // // // // // // // // //                         onClick={sendMessage}
// // // // // // // // // // // // // //                         disabled={isUploading}
// // // // // // // // // // // // // //                     >
// // // // // // // // // // // // // //                         {isUploading ? 'Uploading...' : 'Send'}
// // // // // // // // // // // // // //                     </button>
// // // // // // // // // // // // // //                 </div>
// // // // // // // // // // // // // //             </div>
// // // // // // // // // // // // // //         </div>
// // // // // // // // // // // // // //     );
// // // // // // // // // // // // // // };

// // // // // // // // // // // // // // export default Chat;
// // // // // // // // // // // // // // // "use client"; // Enable client-side rendering
// // // // // // // // // // // // // // // import React, { useState, useEffect } from 'react';
// // // // // // // // // // // // // // // import { database, storage } from '../config/firebase'; // Pastikan Anda sudah mengkonfigurasi Firebase Storage
// // // // // // // // // // // // // // // import { ref, onValue, push, update } from 'firebase/database';
// // // // // // // // // // // // // // // import { uploadBytes, getDownloadURL } from 'firebase/storage';
// // // // // // // // // // // // // // // import 'tailwindcss/tailwind.css';

// // // // // // // // // // // // // // // const Chat = ({ user }) => {
// // // // // // // // // // // // // // //     const otherUser = user.id === 'user1' ? { id: 'user2', name: 'User 2' } : { id: 'user1', name: 'User 1' };

// // // // // // // // // // // // // // //     const [messages, setMessages] = useState([]);
// // // // // // // // // // // // // // //     const [messageText, setMessageText] = useState('');
// // // // // // // // // // // // // // //     const [selectedFiles, setSelectedFiles] = useState([]);
// // // // // // // // // // // // // // //     const [uploading, setUploading] = useState(false);

// // // // // // // // // // // // // // //     // Fetch messages from Firebase on component mount
// // // // // // // // // // // // // // //     useEffect(() => {
// // // // // // // // // // // // // // //         const messagesRef = ref(database, `messages/${user.id}/${otherUser.id}`);
// // // // // // // // // // // // // // //         onValue(messagesRef, (snapshot) => {
// // // // // // // // // // // // // // //             const data = snapshot.val();
// // // // // // // // // // // // // // //             const loadedMessages = data ? Object.values(data) : [];
// // // // // // // // // // // // // // //             setMessages(loadedMessages);

// // // // // // // // // // // // // // //             // Mark all messages as read when the user views the chat
// // // // // // // // // // // // // // //             loadedMessages.forEach((msg) => {
// // // // // // // // // // // // // // //                 if (!msg.read && msg.sender !== user.id) {
// // // // // // // // // // // // // // //                     update(ref(database, `messages/${user.id}/${otherUser.id}/${msg.id}`), { read: true });
// // // // // // // // // // // // // // //                     update(ref(database, `messages/${otherUser.id}/${user.id}/${msg.id}`), { read: true });
// // // // // // // // // // // // // // //                 }
// // // // // // // // // // // // // // //             });
// // // // // // // // // // // // // // //         });
// // // // // // // // // // // // // // //     }, [user.id, otherUser.id]);

// // // // // // // // // // // // // // //     // Handle file selection
// // // // // // // // // // // // // // //     const handleFileChange = (event) => {
// // // // // // // // // // // // // // //         const files = Array.from(event.target.files);
// // // // // // // // // // // // // // //         setSelectedFiles((prevFiles) => [...prevFiles, ...files]);
// // // // // // // // // // // // // // //     };

// // // // // // // // // // // // // // //     // Remove a selected file
// // // // // // // // // // // // // // //     const removeFile = (index) => {
// // // // // // // // // // // // // // //         setSelectedFiles((prevFiles) => prevFiles.filter((_, i) => i !== index));
// // // // // // // // // // // // // // //     };

// // // // // // // // // // // // // // //     // Function to send a new message
// // // // // // // // // // // // // // //     const sendMessage = async () => {
// // // // // // // // // // // // // // //         if (messageText.trim() === "" && selectedFiles.length === 0) return; // Prevent sending empty messages

// // // // // // // // // // // // // // //         const messagesRef = ref(database, `messages/${user.id}/${otherUser.id}`);
// // // // // // // // // // // // // // //         const newMessage = {
// // // // // // // // // // // // // // //             text: messageText,
// // // // // // // // // // // // // // //             sender: user.id,
// // // // // // // // // // // // // // //             timestamp: Date.now(),
// // // // // // // // // // // // // // //             read: false,
// // // // // // // // // // // // // // //             files: [],
// // // // // // // // // // // // // // //         };

// // // // // // // // // // // // // // //         setUploading(true);

// // // // // // // // // // // // // // //         // Upload selected files to Firebase Storage
// // // // // // // // // // // // // // //         const uploadedFiles = await Promise.all(selectedFiles.map(async (file) => {
// // // // // // // // // // // // // // //             const storageRef = ref(storage, `chatFiles/${file.name}`);
// // // // // // // // // // // // // // //             await uploadBytes(storageRef, file);
// // // // // // // // // // // // // // //             return getDownloadURL(storageRef);
// // // // // // // // // // // // // // //         }));

// // // // // // // // // // // // // // //         // Update newMessage with uploaded file URLs
// // // // // // // // // // // // // // //         newMessage.files = uploadedFiles;

// // // // // // // // // // // // // // //         // Push message to Firebase Database
// // // // // // // // // // // // // // //         await push(messagesRef, newMessage);
// // // // // // // // // // // // // // //         setMessageText(''); // Clear input after sending
// // // // // // // // // // // // // // //         setSelectedFiles([]); // Clear selected files

// // // // // // // // // // // // // // //         // Update the recipient's message status
// // // // // // // // // // // // // // //         const recipientRef = ref(database, `messages/${otherUser.id}/${user.id}`);
// // // // // // // // // // // // // // //         await push(recipientRef, newMessage);

// // // // // // // // // // // // // // //         setUploading(false);
// // // // // // // // // // // // // // //     };

// // // // // // // // // // // // // // //     const renderMedia = (files) => {
// // // // // // // // // // // // // // //         if (!files || files.length === 0) return null;

// // // // // // // // // // // // // // //         const visibleFiles = files.slice(0, 3);
// // // // // // // // // // // // // // //         const extraFiles = files.length - visibleFiles.length;

// // // // // // // // // // // // // // //         return (
// // // // // // // // // // // // // // //             <div className="flex flex-wrap mt-1">
// // // // // // // // // // // // // // //                 {visibleFiles.map((file, index) => (
// // // // // // // // // // // // // // //                     <img
// // // // // // // // // // // // // // //                         key={index}
// // // // // // // // // // // // // // //                         src={file}
// // // // // // // // // // // // // // //                         alt="Media"
// // // // // // // // // // // // // // //                         className="w-20 h-20 object-cover rounded-lg m-1"
// // // // // // // // // // // // // // //                     />
// // // // // // // // // // // // // // //                 ))}
// // // // // // // // // // // // // // //                 {extraFiles > 0 && (
// // // // // // // // // // // // // // //                     <div className="w-20 h-20 bg-gray-200 flex items-center justify-center rounded-lg m-1">
// // // // // // // // // // // // // // //                         +{extraFiles}
// // // // // // // // // // // // // // //                     </div>
// // // // // // // // // // // // // // //                 )}
// // // // // // // // // // // // // // //             </div>
// // // // // // // // // // // // // // //         );
// // // // // // // // // // // // // // //     };

// // // // // // // // // // // // // // //     return (
// // // // // // // // // // // // // // //         <div className="flex flex-col h-screen bg-gray-100">
// // // // // // // // // // // // // // //             <div className="flex-none p-4 bg-white border-b border-gray-300">
// // // // // // // // // // // // // // //                 <h2 className="text-xl text-center">{otherUser.name}</h2>
// // // // // // // // // // // // // // //             </div>
// // // // // // // // // // // // // // //             <div className="flex-1 overflow-y-auto p-4">
// // // // // // // // // // // // // // //                 {/* Display messages */}
// // // // // // // // // // // // // // //                 {messages.map((msg, index) => (
// // // // // // // // // // // // // // //                     <div key={index} className={`mb-2 ${msg.sender === user.id ? 'text-right' : 'text-left'}`}>
// // // // // // // // // // // // // // //                         <div className={`inline-block p-2 rounded-lg ${msg.sender === user.id ? 'bg-blue-500 text-white' : 'bg-gray-300'}`}>
// // // // // // // // // // // // // // //                             {msg.text}
// // // // // // // // // // // // // // //                             {renderMedia(msg.files)}
// // // // // // // // // // // // // // //                         </div>
// // // // // // // // // // // // // // //                         <div className="text-xs text-gray-500 flex justify-end items-center">
// // // // // // // // // // // // // // //                             {new Date(msg.timestamp).toLocaleTimeString()}
// // // // // // // // // // // // // // //                             {msg.sender === user.id && (
// // // // // // // // // // // // // // //                                 <span className="ml-2">
// // // // // // // // // // // // // // //                                     {msg.read ? (
// // // // // // // // // // // // // // //                                         <span className="text-blue-500">✔✔</span>
// // // // // // // // // // // // // // //                                     ) : (
// // // // // // // // // // // // // // //                                         <span>✔</span>
// // // // // // // // // // // // // // //                                     )}
// // // // // // // // // // // // // // //                                 </span>
// // // // // // // // // // // // // // //                             )}
// // // // // // // // // // // // // // //                             {msg.sender !== user.id && (
// // // // // // // // // // // // // // //                                 <span className="ml-2">
// // // // // // // // // // // // // // //                                     {msg.read ? (
// // // // // // // // // // // // // // //                                         <span className="text-blue-500">✔✔</span>
// // // // // // // // // // // // // // //                                     ) : (
// // // // // // // // // // // // // // //                                         <span>✔✔</span>
// // // // // // // // // // // // // // //                                     )}
// // // // // // // // // // // // // // //                                 </span>
// // // // // // // // // // // // // // //                             )}
// // // // // // // // // // // // // // //                         </div>
// // // // // // // // // // // // // // //                     </div>
// // // // // // // // // // // // // // //                 ))}
// // // // // // // // // // // // // // //             </div>
// // // // // // // // // // // // // // //             <div className="flex items-center p-4 border-t border-gray-300">
// // // // // // // // // // // // // // //                 <input
// // // // // // // // // // // // // // //                     type="file"
// // // // // // // // // // // // // // //                     multiple
// // // // // // // // // // // // // // //                     accept="image/*,video/*"
// // // // // // // // // // // // // // //                     className="hidden"
// // // // // // // // // // // // // // //                     id="fileInput"
// // // // // // // // // // // // // // //                     onChange={handleFileChange}
// // // // // // // // // // // // // // //                 />
// // // // // // // // // // // // // // //                 <label htmlFor="fileInput" className="cursor-pointer">
// // // // // // // // // // // // // // //                     <span className="material-icons">attach_file</span> {/* Ganti ikon disini */}
// // // // // // // // // // // // // // //                 </label>
// // // // // // // // // // // // // // //                 <div className="flex flex-wrap w-64">
// // // // // // // // // // // // // // //                     {selectedFiles.map((file, index) => (
// // // // // // // // // // // // // // //                         <div key={index} className="relative mr-2">
// // // // // // // // // // // // // // //                             <span
// // // // // // // // // // // // // // //                                 className="absolute top-0 right-0 cursor-pointer text-red-500"
// // // // // // // // // // // // // // //                                 onClick={() => removeFile(index)}
// // // // // // // // // // // // // // //                             >
// // // // // // // // // // // // // // //                                 &times;
// // // // // // // // // // // // // // //                             </span>
// // // // // // // // // // // // // // //                             <img
// // // // // // // // // // // // // // //                                 src={URL.createObjectURL(file)} // Menampilkan gambar sebagai preview
// // // // // // // // // // // // // // //                                 alt="Preview"
// // // // // // // // // // // // // // //                                 className="w-20 h-20 object-cover rounded-lg"
// // // // // // // // // // // // // // //                             />
// // // // // // // // // // // // // // //                         </div>
// // // // // // // // // // // // // // //                     ))}
// // // // // // // // // // // // // // //                 </div>
// // // // // // // // // // // // // // //                 <input
// // // // // // // // // // // // // // //                     type="text"
// // // // // // // // // // // // // // //                     className="border rounded-lg p-2 flex-1 mx-2"
// // // // // // // // // // // // // // //                     placeholder="Type a message..."
// // // // // // // // // // // // // // //                     value={messageText}
// // // // // // // // // // // // // // //                     onChange={(e) => setMessageText(e.target.value)}
// // // // // // // // // // // // // // //                 />
// // // // // // // // // // // // // // //                 <button
// // // // // // // // // // // // // // //                     className="ml-2 p-2 bg-blue-500 text-white rounded-lg"
// // // // // // // // // // // // // // //                     onClick={sendMessage}
// // // // // // // // // // // // // // //                     disabled={uploading}
// // // // // // // // // // // // // // //                 >
// // // // // // // // // // // // // // //                     {uploading ? "Sending..." : "Send"}
// // // // // // // // // // // // // // //                 </button>
// // // // // // // // // // // // // // //             </div>
// // // // // // // // // // // // // // //         </div>
// // // // // // // // // // // // // // //     );
// // // // // // // // // // // // // // // };

// // // // // // // // // // // // // // // export default Chat;
// // // // // // // // // // // // // // // // "use client"; // Enable client-side rendering
// // // // // // // // // // // // // // // // import React, { useState, useEffect } from 'react';
// // // // // // // // // // // // // // // // import { database, storage } from '../config/firebase'; // Pastikan Anda sudah mengkonfigurasi Firebase Storage
// // // // // // // // // // // // // // // // import { ref, onValue, push, update } from 'firebase/database';
// // // // // // // // // // // // // // // // import { uploadBytes, getDownloadURL } from 'firebase/storage';
// // // // // // // // // // // // // // // // import 'tailwindcss/tailwind.css';

// // // // // // // // // // // // // // // // const Chat = ({ user }) => {
// // // // // // // // // // // // // // // //     const otherUser = user.id === 'user1' ? { id: 'user2', name: 'User 2' } : { id: 'user1', name: 'User 1' };

// // // // // // // // // // // // // // // //     const [messages, setMessages] = useState([]);
// // // // // // // // // // // // // // // //     const [messageText, setMessageText] = useState('');
// // // // // // // // // // // // // // // //     const [selectedFiles, setSelectedFiles] = useState([]);
// // // // // // // // // // // // // // // //     const [uploading, setUploading] = useState(false);

// // // // // // // // // // // // // // // //     // Fetch messages from Firebase on component mount
// // // // // // // // // // // // // // // //     useEffect(() => {
// // // // // // // // // // // // // // // //         const messagesRef = ref(database, `messages/${user.id}/${otherUser.id}`);
// // // // // // // // // // // // // // // //         onValue(messagesRef, (snapshot) => {
// // // // // // // // // // // // // // // //             const data = snapshot.val();
// // // // // // // // // // // // // // // //             const loadedMessages = data ? Object.values(data) : [];
// // // // // // // // // // // // // // // //             setMessages(loadedMessages);

// // // // // // // // // // // // // // // //             // Mark all messages as read when the user views the chat
// // // // // // // // // // // // // // // //             loadedMessages.forEach((msg) => {
// // // // // // // // // // // // // // // //                 if (!msg.read && msg.sender !== user.id) {
// // // // // // // // // // // // // // // //                     update(ref(database, `messages/${user.id}/${otherUser.id}/${msg.id}`), { read: true });
// // // // // // // // // // // // // // // //                     update(ref(database, `messages/${otherUser.id}/${user.id}/${msg.id}`), { read: true });
// // // // // // // // // // // // // // // //                 }
// // // // // // // // // // // // // // // //             });
// // // // // // // // // // // // // // // //         });
// // // // // // // // // // // // // // // //     }, [user.id, otherUser.id]);

// // // // // // // // // // // // // // // //     // Handle file selection
// // // // // // // // // // // // // // // //     const handleFileChange = (event) => {
// // // // // // // // // // // // // // // //         const files = Array.from(event.target.files);
// // // // // // // // // // // // // // // //         setSelectedFiles((prevFiles) => [...prevFiles, ...files]);
// // // // // // // // // // // // // // // //     };

// // // // // // // // // // // // // // // //     // Remove a selected file
// // // // // // // // // // // // // // // //     const removeFile = (index) => {
// // // // // // // // // // // // // // // //         setSelectedFiles((prevFiles) => prevFiles.filter((_, i) => i !== index));
// // // // // // // // // // // // // // // //     };

// // // // // // // // // // // // // // // //     // Function to send a new message
// // // // // // // // // // // // // // // //     const sendMessage = async () => {
// // // // // // // // // // // // // // // //         if (messageText.trim() === "" && selectedFiles.length === 0) return; // Prevent sending empty messages

// // // // // // // // // // // // // // // //         const messagesRef = ref(database, `messages/${user.id}/${otherUser.id}`);
// // // // // // // // // // // // // // // //         const newMessage = {
// // // // // // // // // // // // // // // //             text: messageText,
// // // // // // // // // // // // // // // //             sender: user.id,
// // // // // // // // // // // // // // // //             timestamp: Date.now(),
// // // // // // // // // // // // // // // //             read: false,
// // // // // // // // // // // // // // // //             files: [],
// // // // // // // // // // // // // // // //         };

// // // // // // // // // // // // // // // //         setUploading(true);

// // // // // // // // // // // // // // // //         // Upload selected files to Firebase Storage
// // // // // // // // // // // // // // // //         const uploadedFiles = await Promise.all(selectedFiles.map(async (file) => {
// // // // // // // // // // // // // // // //             const storageRef = ref(storage, `chatFiles/${file.name}`);
// // // // // // // // // // // // // // // //             await uploadBytes(storageRef, file);
// // // // // // // // // // // // // // // //             return getDownloadURL(storageRef);
// // // // // // // // // // // // // // // //         }));

// // // // // // // // // // // // // // // //         // Update newMessage with uploaded file URLs
// // // // // // // // // // // // // // // //         newMessage.files = uploadedFiles;

// // // // // // // // // // // // // // // //         // Push message to Firebase Database
// // // // // // // // // // // // // // // //         await push(messagesRef, newMessage);
// // // // // // // // // // // // // // // //         setMessageText(''); // Clear input after sending
// // // // // // // // // // // // // // // //         setSelectedFiles([]); // Clear selected files

// // // // // // // // // // // // // // // //         // Update the recipient's message status
// // // // // // // // // // // // // // // //         const recipientRef = ref(database, `messages/${otherUser.id}/${user.id}`);
// // // // // // // // // // // // // // // //         await push(recipientRef, newMessage);

// // // // // // // // // // // // // // // //         setUploading(false);
// // // // // // // // // // // // // // // //     };

// // // // // // // // // // // // // // // //     const renderMedia = (files) => {
// // // // // // // // // // // // // // // //         if (!files || files.length === 0) return null;

// // // // // // // // // // // // // // // //         const visibleFiles = files.slice(0, 3);
// // // // // // // // // // // // // // // //         const extraFiles = files.length - visibleFiles.length;

// // // // // // // // // // // // // // // //         return (
// // // // // // // // // // // // // // // //             <div className="flex flex-wrap mt-1">
// // // // // // // // // // // // // // // //                 {visibleFiles.map((file, index) => (
// // // // // // // // // // // // // // // //                     <img
// // // // // // // // // // // // // // // //                         key={index}
// // // // // // // // // // // // // // // //                         src={file}
// // // // // // // // // // // // // // // //                         alt="Media"
// // // // // // // // // // // // // // // //                         className="w-20 h-20 object-cover rounded-lg m-1"
// // // // // // // // // // // // // // // //                     />
// // // // // // // // // // // // // // // //                 ))}
// // // // // // // // // // // // // // // //                 {extraFiles > 0 && (
// // // // // // // // // // // // // // // //                     <div className="w-20 h-20 bg-gray-200 flex items-center justify-center rounded-lg m-1">
// // // // // // // // // // // // // // // //                         +{extraFiles}
// // // // // // // // // // // // // // // //                     </div>
// // // // // // // // // // // // // // // //                 )}
// // // // // // // // // // // // // // // //             </div>
// // // // // // // // // // // // // // // //         );
// // // // // // // // // // // // // // // //     };

// // // // // // // // // // // // // // // //     return (
// // // // // // // // // // // // // // // //         <div className="flex flex-col h-screen bg-gray-100">
// // // // // // // // // // // // // // // //             <div className="flex-none p-4 bg-white border-b border-gray-300">
// // // // // // // // // // // // // // // //                 <h2 className="text-xl text-center">{otherUser.name}</h2>
// // // // // // // // // // // // // // // //             </div>
// // // // // // // // // // // // // // // //             <div className="flex-1 overflow-y-auto p-4">
// // // // // // // // // // // // // // // //                 {/* Display messages */}
// // // // // // // // // // // // // // // //                 {messages.map((msg, index) => (
// // // // // // // // // // // // // // // //                     <div key={index} className={`mb-2 ${msg.sender === user.id ? 'text-right' : 'text-left'}`}>
// // // // // // // // // // // // // // // //                         <div className={`inline-block p-2 rounded-lg ${msg.sender === user.id ? 'bg-blue-500 text-white' : 'bg-gray-300'}`}>
// // // // // // // // // // // // // // // //                             {msg.text}
// // // // // // // // // // // // // // // //                             {renderMedia(msg.files)}
// // // // // // // // // // // // // // // //                         </div>
// // // // // // // // // // // // // // // //                         <div className="text-xs text-gray-500 flex justify-end items-center">
// // // // // // // // // // // // // // // //                             {new Date(msg.timestamp).toLocaleTimeString()}
// // // // // // // // // // // // // // // //                             {msg.sender === user.id && (
// // // // // // // // // // // // // // // //                                 <span className="ml-2">
// // // // // // // // // // // // // // // //                                     {msg.read ? (
// // // // // // // // // // // // // // // //                                         <span className="text-blue-500">✔✔</span>
// // // // // // // // // // // // // // // //                                     ) : (
// // // // // // // // // // // // // // // //                                         <span>✔</span>
// // // // // // // // // // // // // // // //                                     )}
// // // // // // // // // // // // // // // //                                 </span>
// // // // // // // // // // // // // // // //                             )}
// // // // // // // // // // // // // // // //                             {msg.sender !== user.id && (
// // // // // // // // // // // // // // // //                                 <span className="ml-2">
// // // // // // // // // // // // // // // //                                     {msg.read ? (
// // // // // // // // // // // // // // // //                                         <span className="text-blue-500">✔✔</span>
// // // // // // // // // // // // // // // //                                     ) : (
// // // // // // // // // // // // // // // //                                         <span>✔✔</span>
// // // // // // // // // // // // // // // //                                     )}
// // // // // // // // // // // // // // // //                                 </span>
// // // // // // // // // // // // // // // //                             )}
// // // // // // // // // // // // // // // //                         </div>
// // // // // // // // // // // // // // // //                     </div>
// // // // // // // // // // // // // // // //                 ))}
// // // // // // // // // // // // // // // //             </div>
// // // // // // // // // // // // // // // //             <div className="flex items-center p-4 border-t border-gray-300">
// // // // // // // // // // // // // // // //                 <input
// // // // // // // // // // // // // // // //                     type="file"
// // // // // // // // // // // // // // // //                     multiple
// // // // // // // // // // // // // // // //                     accept="image/*,video/*"
// // // // // // // // // // // // // // // //                     className="hidden"
// // // // // // // // // // // // // // // //                     id="fileInput"
// // // // // // // // // // // // // // // //                     onChange={handleFileChange}
// // // // // // // // // // // // // // // //                 />
// // // // // // // // // // // // // // // //                 <label htmlFor="fileInput" className="cursor-pointer">
// // // // // // // // // // // // // // // //                     <span className="material-icons">attach_file</span> {/* Ganti ikon disini */}
// // // // // // // // // // // // // // // //                 </label>
// // // // // // // // // // // // // // // //                 <div className="flex flex-wrap w-64">
// // // // // // // // // // // // // // // //                     {selectedFiles.map((file, index) => (
// // // // // // // // // // // // // // // //                         <div key={index} className="relative mr-2">
// // // // // // // // // // // // // // // //                             <span
// // // // // // // // // // // // // // // //                                 className="absolute top-0 right-0 cursor-pointer text-red-500"
// // // // // // // // // // // // // // // //                                 onClick={() => removeFile(index)}
// // // // // // // // // // // // // // // //                             >
// // // // // // // // // // // // // // // //                                 &times;
// // // // // // // // // // // // // // // //                             </span>
// // // // // // // // // // // // // // // //                             <img
// // // // // // // // // // // // // // // //                                 src={URL.createObjectURL(file)} // Menampilkan gambar sebagai preview
// // // // // // // // // // // // // // // //                                 alt="Preview"
// // // // // // // // // // // // // // // //                                 className="w-20 h-20 object-cover rounded-lg"
// // // // // // // // // // // // // // // //                             />
// // // // // // // // // // // // // // // //                         </div>
// // // // // // // // // // // // // // // //                     ))}
// // // // // // // // // // // // // // // //                 </div>
// // // // // // // // // // // // // // // //                 <input
// // // // // // // // // // // // // // // //                     type="text"
// // // // // // // // // // // // // // // //                     className="border rounded-lg p-2 flex-1 mx-2"
// // // // // // // // // // // // // // // //                     placeholder="Type a message..."
// // // // // // // // // // // // // // // //                     value={messageText}
// // // // // // // // // // // // // // // //                     onChange={(e) => setMessageText(e.target.value)}
// // // // // // // // // // // // // // // //                 />
// // // // // // // // // // // // // // // //                 <button
// // // // // // // // // // // // // // // //                     className="ml-2 p-2 bg-blue-500 text-white rounded-lg"
// // // // // // // // // // // // // // // //                     onClick={sendMessage}
// // // // // // // // // // // // // // // //                     disabled={uploading}
// // // // // // // // // // // // // // // //                 >
// // // // // // // // // // // // // // // //                     {uploading ? "Sending..." : "Send"}
// // // // // // // // // // // // // // // //                 </button>
// // // // // // // // // // // // // // // //             </div>
// // // // // // // // // // // // // // // //         </div>
// // // // // // // // // // // // // // // //     );
// // // // // // // // // // // // // // // // };

// // // // // // // // // // // // // // // // export default Chat;


// // // // // // // // // // // // // // // // // "use client"; // Enable client-side rendering
// // // // // // // // // // // // // // // // // import React, { useState, useEffect } from 'react';
// // // // // // // // // // // // // // // // // import { database, storage } from '../config/firebase'; // Pastikan Anda sudah mengkonfigurasi Firebase Storage
// // // // // // // // // // // // // // // // // import { ref, onValue, push, update } from 'firebase/database';
// // // // // // // // // // // // // // // // // import { uploadBytes, getDownloadURL } from 'firebase/storage';
// // // // // // // // // // // // // // // // // import 'tailwindcss/tailwind.css';

// // // // // // // // // // // // // // // // // const Chat = ({ user }) => {
// // // // // // // // // // // // // // // // //     const otherUser = user.id === 'user1' ? { id: 'user2', name: 'User 2' } : { id: 'user1', name: 'User 1' };

// // // // // // // // // // // // // // // // //     const [messages, setMessages] = useState([]);
// // // // // // // // // // // // // // // // //     const [messageText, setMessageText] = useState('');
// // // // // // // // // // // // // // // // //     const [selectedFiles, setSelectedFiles] = useState([]);
// // // // // // // // // // // // // // // // //     const [uploading, setUploading] = useState(false);
// // // // // // // // // // // // // // // // //     const [lastSeen, setLastSeen] = useState(null); // State untuk menyimpan waktu terakhir dilihat

// // // // // // // // // // // // // // // // //     // Fetch messages from Firebase on component mount
// // // // // // // // // // // // // // // // //     useEffect(() => {
// // // // // // // // // // // // // // // // //         const messagesRef = ref(database, `messages/${user.id}/${otherUser.id}`);
// // // // // // // // // // // // // // // // //         onValue(messagesRef, (snapshot) => {
// // // // // // // // // // // // // // // // //             const data = snapshot.val();
// // // // // // // // // // // // // // // // //             const loadedMessages = data ? Object.values(data) : [];
// // // // // // // // // // // // // // // // //             setMessages(loadedMessages);

// // // // // // // // // // // // // // // // //             // Mark all messages as read when the user views the chat
// // // // // // // // // // // // // // // // //             loadedMessages.forEach((msg) => {
// // // // // // // // // // // // // // // // //                 if (!msg.read && msg.sender !== user.id) {
// // // // // // // // // // // // // // // // //                     update(ref(database, `messages/${user.id}/${otherUser.id}/${msg.id}`), { read: true });
// // // // // // // // // // // // // // // // //                     update(ref(database, `messages/${otherUser.id}/${user.id}/${msg.id}`), { read: true });
// // // // // // // // // // // // // // // // //                 }
// // // // // // // // // // // // // // // // //             });
// // // // // // // // // // // // // // // // //         });

// // // // // // // // // // // // // // // // //         // Set last seen status
// // // // // // // // // // // // // // // // //         const lastSeenRef = ref(database, `lastSeen/${user.id}`);
// // // // // // // // // // // // // // // // //         onValue(lastSeenRef, (snapshot) => {
// // // // // // // // // // // // // // // // //             setLastSeen(snapshot.val());
// // // // // // // // // // // // // // // // //         });

// // // // // // // // // // // // // // // // //         // Update last seen when user is active
// // // // // // // // // // // // // // // // //         update(lastSeenRef, { timestamp: Date.now() });
// // // // // // // // // // // // // // // // //     }, [user.id, otherUser.id]);

// // // // // // // // // // // // // // // // //     // Handle file selection
// // // // // // // // // // // // // // // // //     const handleFileChange = (event) => {
// // // // // // // // // // // // // // // // //         const files = Array.from(event.target.files);
// // // // // // // // // // // // // // // // //         setSelectedFiles((prevFiles) => [...prevFiles, ...files]);
// // // // // // // // // // // // // // // // //     };

// // // // // // // // // // // // // // // // //     // Remove a selected file
// // // // // // // // // // // // // // // // //     const removeFile = (index) => {
// // // // // // // // // // // // // // // // //         setSelectedFiles((prevFiles) => prevFiles.filter((_, i) => i !== index));
// // // // // // // // // // // // // // // // //     };

// // // // // // // // // // // // // // // // //     // Function to send a new message
// // // // // // // // // // // // // // // // //     const sendMessage = async () => {
// // // // // // // // // // // // // // // // //         if (messageText.trim() === "" && selectedFiles.length === 0) return; // Prevent sending empty messages

// // // // // // // // // // // // // // // // //         const messagesRef = ref(database, `messages/${user.id}/${otherUser.id}`);
// // // // // // // // // // // // // // // // //         const newMessage = {
// // // // // // // // // // // // // // // // //             text: messageText,
// // // // // // // // // // // // // // // // //             sender: user.id,
// // // // // // // // // // // // // // // // //             timestamp: Date.now(),
// // // // // // // // // // // // // // // // //             read: false,
// // // // // // // // // // // // // // // // //             files: [],
// // // // // // // // // // // // // // // // //         };

// // // // // // // // // // // // // // // // //         setUploading(true);

// // // // // // // // // // // // // // // // //         // Upload selected files to Firebase Storage
// // // // // // // // // // // // // // // // //         const uploadedFiles = await Promise.all(selectedFiles.map(async (file) => {
// // // // // // // // // // // // // // // // //             const storageRef = ref(storage, `chatFiles/${file.name}`);
// // // // // // // // // // // // // // // // //             await uploadBytes(storageRef, file);
// // // // // // // // // // // // // // // // //             return getDownloadURL(storageRef);
// // // // // // // // // // // // // // // // //         }));

// // // // // // // // // // // // // // // // //         // Update newMessage with uploaded file URLs
// // // // // // // // // // // // // // // // //         newMessage.files = uploadedFiles;

// // // // // // // // // // // // // // // // //         // Push message to Firebase Database
// // // // // // // // // // // // // // // // //         await push(messagesRef, newMessage);
// // // // // // // // // // // // // // // // //         setMessageText(''); // Clear input after sending
// // // // // // // // // // // // // // // // //         setSelectedFiles([]); // Clear selected files

// // // // // // // // // // // // // // // // //         // Update the recipient's message status
// // // // // // // // // // // // // // // // //         const recipientRef = ref(database, `messages/${otherUser.id}/${user.id}`);
// // // // // // // // // // // // // // // // //         await push(recipientRef, newMessage);

// // // // // // // // // // // // // // // // //         setUploading(false);
// // // // // // // // // // // // // // // // //     };

// // // // // // // // // // // // // // // // //     const renderMedia = (files) => {
// // // // // // // // // // // // // // // // //         if (!files || files.length === 0) return null;

// // // // // // // // // // // // // // // // //         const visibleFiles = files.slice(0, 3);
// // // // // // // // // // // // // // // // //         const extraFiles = files.length - visibleFiles.length;

// // // // // // // // // // // // // // // // //         return (
// // // // // // // // // // // // // // // // //             <div className="flex flex-wrap mt-1">
// // // // // // // // // // // // // // // // //                 {visibleFiles.map((file, index) => (
// // // // // // // // // // // // // // // // //                     <img
// // // // // // // // // // // // // // // // //                         key={index}
// // // // // // // // // // // // // // // // //                         src={file}
// // // // // // // // // // // // // // // // //                         alt="Media"
// // // // // // // // // // // // // // // // //                         className="w-20 h-20 object-cover rounded-lg m-1"
// // // // // // // // // // // // // // // // //                     />
// // // // // // // // // // // // // // // // //                 ))}
// // // // // // // // // // // // // // // // //                 {extraFiles > 0 && (
// // // // // // // // // // // // // // // // //                     <div className="w-20 h-20 bg-gray-200 flex items-center justify-center rounded-lg m-1">
// // // // // // // // // // // // // // // // //                         +{extraFiles}
// // // // // // // // // // // // // // // // //                     </div>
// // // // // // // // // // // // // // // // //                 )}
// // // // // // // // // // // // // // // // //             </div>
// // // // // // // // // // // // // // // // //         );
// // // // // // // // // // // // // // // // //     };

// // // // // // // // // // // // // // // // //     return (
// // // // // // // // // // // // // // // // //         <div className="flex flex-col h-screen bg-gray-100">
// // // // // // // // // // // // // // // // //             <div className="flex-none p-4 bg-white border-b border-gray-300">
// // // // // // // // // // // // // // // // //                 <h2 className="text-xl text-center">{otherUser.name}</h2>
// // // // // // // // // // // // // // // // //                 {lastSeen && (
// // // // // // // // // // // // // // // // //                     <p className="text-sm text-gray-500 text-center">
// // // // // // // // // // // // // // // // //                         Last seen: {new Date(lastSeen.timestamp).toLocaleString()}
// // // // // // // // // // // // // // // // //                     </p>
// // // // // // // // // // // // // // // // //                 )}
// // // // // // // // // // // // // // // // //             </div>
// // // // // // // // // // // // // // // // //             <div className="flex-1 overflow-y-auto p-4">
// // // // // // // // // // // // // // // // //                 {/* Display messages */}
// // // // // // // // // // // // // // // // //                 {messages.map((msg, index) => (
// // // // // // // // // // // // // // // // //                     <div key={index} className={`mb-2 ${msg.sender === user.id ? 'text-right' : 'text-left'}`}>
// // // // // // // // // // // // // // // // //                         <div className={`inline-block p-2 rounded-lg ${msg.sender === user.id ? 'bg-blue-500 text-white' : 'bg-gray-300'}`}>
// // // // // // // // // // // // // // // // //                             {msg.text}
// // // // // // // // // // // // // // // // //                             {renderMedia(msg.files)}
// // // // // // // // // // // // // // // // //                         </div>
// // // // // // // // // // // // // // // // //                         <div className="text-xs text-gray-500 flex justify-end items-center">
// // // // // // // // // // // // // // // // //                             {new Date(msg.timestamp).toLocaleTimeString()}
// // // // // // // // // // // // // // // // //                             {msg.sender === user.id && (
// // // // // // // // // // // // // // // // //                                 <span className="ml-2">
// // // // // // // // // // // // // // // // //                                     {msg.read ? (
// // // // // // // // // // // // // // // // //                                         <span className="text-blue-500">✔✔</span>
// // // // // // // // // // // // // // // // //                                     ) : (
// // // // // // // // // // // // // // // // //                                         <span>✔</span>
// // // // // // // // // // // // // // // // //                                     )}
// // // // // // // // // // // // // // // // //                                 </span>
// // // // // // // // // // // // // // // // //                             )}
// // // // // // // // // // // // // // // // //                             {msg.sender !== user.id && (
// // // // // // // // // // // // // // // // //                                 <span className="ml-2">
// // // // // // // // // // // // // // // // //                                     {msg.read ? (
// // // // // // // // // // // // // // // // //                                         <span className="text-blue-500">✔✔</span>
// // // // // // // // // // // // // // // // //                                     ) : (
// // // // // // // // // // // // // // // // //                                         <span>✔✔</span>
// // // // // // // // // // // // // // // // //                                     )}
// // // // // // // // // // // // // // // // //                                 </span>
// // // // // // // // // // // // // // // // //                             )}
// // // // // // // // // // // // // // // // //                         </div>
// // // // // // // // // // // // // // // // //                     </div>
// // // // // // // // // // // // // // // // //                 ))}
// // // // // // // // // // // // // // // // //             </div>
// // // // // // // // // // // // // // // // //             <div className="flex items-center p-4 border-t border-gray-300">
// // // // // // // // // // // // // // // // //                 <input
// // // // // // // // // // // // // // // // //                     type="file"
// // // // // // // // // // // // // // // // //                     multiple
// // // // // // // // // // // // // // // // //                     accept="image/*,video/*"
// // // // // // // // // // // // // // // // //                     className="hidden"
// // // // // // // // // // // // // // // // //                     id="fileInput"
// // // // // // // // // // // // // // // // //                     onChange={handleFileChange}
// // // // // // // // // // // // // // // // //                 />
// // // // // // // // // // // // // // // // //                 <label htmlFor="fileInput" className="cursor-pointer flex items-center">
// // // // // // // // // // // // // // // // //                     <span className="material-icons">attach_file</span> {/* Ganti dengan ikon klip */}
// // // // // // // // // // // // // // // // //                 </label>
// // // // // // // // // // // // // // // // //                 <div className="flex flex-wrap w-full">
// // // // // // // // // // // // // // // // //                     {selectedFiles.map((file, index) => (
// // // // // // // // // // // // // // // // //                         <div key={index} className="relative mr-2 mb-2">
// // // // // // // // // // // // // // // // //                             <span
// // // // // // // // // // // // // // // // //                                 className="absolute top-0 right-0 cursor-pointer text-red-500"
// // // // // // // // // // // // // // // // //                                 onClick={() => removeFile(index)}
// // // // // // // // // // // // // // // // //                             >
// // // // // // // // // // // // // // // // //                                 &times;
// // // // // // // // // // // // // // // // //                             </span>
// // // // // // // // // // // // // // // // //                             <img
// // // // // // // // // // // // // // // // //                                 src={URL.createObjectURL(file)} // Menampilkan gambar sebagai preview
// // // // // // // // // // // // // // // // //                                 alt="Preview"
// // // // // // // // // // // // // // // // //                                 className="w-20 h-20 object-cover rounded-lg"
// // // // // // // // // // // // // // // // //                             />
// // // // // // // // // // // // // // // // //                         </div>
// // // // // // // // // // // // // // // // //                     ))}
// // // // // // // // // // // // // // // // //                 </div>
// // // // // // // // // // // // // // // // //                 <input
// // // // // // // // // // // // // // // // //                     type="text"
// // // // // // // // // // // // // // // // //                     className="border rounded-lg p-2 flex-1 mx-2"
// // // // // // // // // // // // // // // // //                     placeholder="Type a message..."
// // // // // // // // // // // // // // // // //                     value={messageText}
// // // // // // // // // // // // // // // // //                     onChange={(e) => setMessageText(e.target.value)}
// // // // // // // // // // // // // // // // //                 />
// // // // // // // // // // // // // // // // //                 <button
// // // // // // // // // // // // // // // // //                     className="ml-2 p-2 bg-blue-500 text-white rounded-lg"
// // // // // // // // // // // // // // // // //                     onClick={sendMessage}
// // // // // // // // // // // // // // // // //                     disabled={uploading}
// // // // // // // // // // // // // // // // //                 >
// // // // // // // // // // // // // // // // //                     {uploading ? "Sending..." : "Send"}
// // // // // // // // // // // // // // // // //                 </button>
// // // // // // // // // // // // // // // // //             </div>
// // // // // // // // // // // // // // // // //         </div>
// // // // // // // // // // // // // // // // //     );
// // // // // // // // // // // // // // // // // };

// // // // // // // // // // // // // // // // // export default Chat;


// // // // // // // // // // // // // // // // // // "use client"; // Enable client-side rendering
// // // // // // // // // // // // // // // // // // import React, { useState, useEffect } from 'react';
// // // // // // // // // // // // // // // // // // import { database, storage } from '../config/firebase'; // Pastikan Anda sudah mengkonfigurasi Firebase Storage
// // // // // // // // // // // // // // // // // // import { ref, onValue, push, update } from 'firebase/database';
// // // // // // // // // // // // // // // // // // import { uploadBytes, getDownloadURL } from 'firebase/storage';
// // // // // // // // // // // // // // // // // // import 'tailwindcss/tailwind.css';

// // // // // // // // // // // // // // // // // // const Chat = ({ user }) => {
// // // // // // // // // // // // // // // // // //     const otherUser = user.id === 'user1' ? { id: 'user2', name: 'User 2' } : { id: 'user1', name: 'User 1' };

// // // // // // // // // // // // // // // // // //     const [messages, setMessages] = useState([]);
// // // // // // // // // // // // // // // // // //     const [messageText, setMessageText] = useState('');
// // // // // // // // // // // // // // // // // //     const [selectedFiles, setSelectedFiles] = useState([]);
// // // // // // // // // // // // // // // // // //     const [uploadingFiles, setUploadingFiles] = useState([]); // State untuk menyimpan status upload file
// // // // // // // // // // // // // // // // // //     const [lastSeen, setLastSeen] = useState(null); // State untuk menyimpan waktu terakhir dilihat

// // // // // // // // // // // // // // // // // //     // Fetch messages from Firebase on component mount
// // // // // // // // // // // // // // // // // //     useEffect(() => {
// // // // // // // // // // // // // // // // // //         const messagesRef = ref(database, `messages/${user.id}/${otherUser.id}`);
// // // // // // // // // // // // // // // // // //         onValue(messagesRef, (snapshot) => {
// // // // // // // // // // // // // // // // // //             const data = snapshot.val();
// // // // // // // // // // // // // // // // // //             const loadedMessages = data ? Object.values(data) : [];
// // // // // // // // // // // // // // // // // //             setMessages(loadedMessages);

// // // // // // // // // // // // // // // // // //             // Mark all messages as read when the user views the chat
// // // // // // // // // // // // // // // // // //             loadedMessages.forEach((msg) => {
// // // // // // // // // // // // // // // // // //                 if (!msg.read && msg.sender !== user.id) {
// // // // // // // // // // // // // // // // // //                     update(ref(database, `messages/${user.id}/${otherUser.id}/${msg.id}`), { read: true });
// // // // // // // // // // // // // // // // // //                     update(ref(database, `messages/${otherUser.id}/${user.id}/${msg.id}`), { read: true });
// // // // // // // // // // // // // // // // // //                 }
// // // // // // // // // // // // // // // // // //             });
// // // // // // // // // // // // // // // // // //         });

// // // // // // // // // // // // // // // // // //         // Set last seen status
// // // // // // // // // // // // // // // // // //         const lastSeenRef = ref(database, `lastSeen/${user.id}`);
// // // // // // // // // // // // // // // // // //         onValue(lastSeenRef, (snapshot) => {
// // // // // // // // // // // // // // // // // //             setLastSeen(snapshot.val());
// // // // // // // // // // // // // // // // // //         });

// // // // // // // // // // // // // // // // // //         // Update last seen when user is active
// // // // // // // // // // // // // // // // // //         update(lastSeenRef, { timestamp: Date.now() });
// // // // // // // // // // // // // // // // // //     }, [user.id, otherUser.id]);

// // // // // // // // // // // // // // // // // //     // Handle file selection
// // // // // // // // // // // // // // // // // //     const handleFileChange = (event) => {
// // // // // // // // // // // // // // // // // //         const files = Array.from(event.target.files);
// // // // // // // // // // // // // // // // // //         setSelectedFiles((prevFiles) => [...prevFiles, ...files]);
// // // // // // // // // // // // // // // // // //     };

// // // // // // // // // // // // // // // // // //     // Remove a selected file
// // // // // // // // // // // // // // // // // //     const removeFile = (index) => {
// // // // // // // // // // // // // // // // // //         setSelectedFiles((prevFiles) => prevFiles.filter((_, i) => i !== index));
// // // // // // // // // // // // // // // // // //         setUploadingFiles((prevUploads) => prevUploads.filter((_, i) => i !== index)); // Hapus status upload yang sesuai
// // // // // // // // // // // // // // // // // //     };

// // // // // // // // // // // // // // // // // //     // Function to send a new message
// // // // // // // // // // // // // // // // // //     const sendMessage = async () => {
// // // // // // // // // // // // // // // // // //         if (messageText.trim() === "" && selectedFiles.length === 0) return; // Prevent sending empty messages

// // // // // // // // // // // // // // // // // //         const messagesRef = ref(database, `messages/${user.id}/${otherUser.id}`);
// // // // // // // // // // // // // // // // // //         const newMessage = {
// // // // // // // // // // // // // // // // // //             text: messageText,
// // // // // // // // // // // // // // // // // //             sender: user.id,
// // // // // // // // // // // // // // // // // //             timestamp: Date.now(),
// // // // // // // // // // // // // // // // // //             read: false,
// // // // // // // // // // // // // // // // // //             files: [],
// // // // // // // // // // // // // // // // // //         };

// // // // // // // // // // // // // // // // // //         // Update the state to show loading for each file
// // // // // // // // // // // // // // // // // //         const loadingStatus = Array(selectedFiles.length).fill(true);
// // // // // // // // // // // // // // // // // //         setUploadingFiles(loadingStatus);

// // // // // // // // // // // // // // // // // //         // Upload selected files to Firebase Storage
// // // // // // // // // // // // // // // // // //         const uploadedFiles = await Promise.all(selectedFiles.map(async (file, index) => {
// // // // // // // // // // // // // // // // // //             const storageRef = ref(storage, `chatFiles/${file.name}`);
// // // // // // // // // // // // // // // // // //             await uploadBytes(storageRef, file);
// // // // // // // // // // // // // // // // // //             const url = await getDownloadURL(storageRef);
// // // // // // // // // // // // // // // // // //             // Update the loading status for the uploaded file
// // // // // // // // // // // // // // // // // //             loadingStatus[index] = false;
// // // // // // // // // // // // // // // // // //             setUploadingFiles([...loadingStatus]); // Update loading state
// // // // // // // // // // // // // // // // // //             return url;
// // // // // // // // // // // // // // // // // //         }));

// // // // // // // // // // // // // // // // // //         // Update newMessage with uploaded file URLs
// // // // // // // // // // // // // // // // // //         newMessage.files = uploadedFiles;

// // // // // // // // // // // // // // // // // //         // Push message to Firebase Database
// // // // // // // // // // // // // // // // // //         await push(messagesRef, newMessage);
// // // // // // // // // // // // // // // // // //         setMessageText(''); // Clear input after sending
// // // // // // // // // // // // // // // // // //         setSelectedFiles([]); // Clear selected files
// // // // // // // // // // // // // // // // // //         setUploadingFiles([]); // Clear uploading status

// // // // // // // // // // // // // // // // // //         // Update the recipient's message status
// // // // // // // // // // // // // // // // // //         const recipientRef = ref(database, `messages/${otherUser.id}/${user.id}`);
// // // // // // // // // // // // // // // // // //         await push(recipientRef, newMessage);
// // // // // // // // // // // // // // // // // //     };

// // // // // // // // // // // // // // // // // //     const renderMedia = (files) => {
// // // // // // // // // // // // // // // // // //         if (!files || files.length === 0) return null;

// // // // // // // // // // // // // // // // // //         const visibleFiles = files.slice(0, 3);
// // // // // // // // // // // // // // // // // //         const extraFiles = files.length - visibleFiles.length;

// // // // // // // // // // // // // // // // // //         return (
// // // // // // // // // // // // // // // // // //             <div className="flex flex-wrap mt-1">
// // // // // // // // // // // // // // // // // //                 {visibleFiles.map((file, index) => (
// // // // // // // // // // // // // // // // // //                     <img
// // // // // // // // // // // // // // // // // //                         key={index}
// // // // // // // // // // // // // // // // // //                         src={file}
// // // // // // // // // // // // // // // // // //                         alt="Media"
// // // // // // // // // // // // // // // // // //                         className="w-20 h-20 object-cover rounded-lg m-1"
// // // // // // // // // // // // // // // // // //                     />
// // // // // // // // // // // // // // // // // //                 ))}
// // // // // // // // // // // // // // // // // //                 {extraFiles > 0 && (
// // // // // // // // // // // // // // // // // //                     <div className="w-20 h-20 bg-gray-200 flex items-center justify-center rounded-lg m-1">
// // // // // // // // // // // // // // // // // //                         +{extraFiles}
// // // // // // // // // // // // // // // // // //                     </div>
// // // // // // // // // // // // // // // // // //                 )}
// // // // // // // // // // // // // // // // // //             </div>
// // // // // // // // // // // // // // // // // //         );
// // // // // // // // // // // // // // // // // //     };

// // // // // // // // // // // // // // // // // //     return (
// // // // // // // // // // // // // // // // // //         <div className="flex flex-col h-screen bg-gray-100">
// // // // // // // // // // // // // // // // // //             <div className="flex-none p-4 bg-white border-b border-gray-300">
// // // // // // // // // // // // // // // // // //                 <h2 className="text-xl text-center">{otherUser.name}</h2>
// // // // // // // // // // // // // // // // // //                 {lastSeen && (
// // // // // // // // // // // // // // // // // //                     <p className="text-sm text-gray-500 text-center">
// // // // // // // // // // // // // // // // // //                         Last seen: {new Date(lastSeen.timestamp).toLocaleString()}
// // // // // // // // // // // // // // // // // //                     </p>
// // // // // // // // // // // // // // // // // //                 )}
// // // // // // // // // // // // // // // // // //             </div>
// // // // // // // // // // // // // // // // // //             <div className="flex-1 overflow-y-auto p-4">
// // // // // // // // // // // // // // // // // //                 {/* Display messages */}
// // // // // // // // // // // // // // // // // //                 {messages.map((msg, index) => (
// // // // // // // // // // // // // // // // // //                     <div key={index} className={`mb-2 ${msg.sender === user.id ? 'text-right' : 'text-left'}`}>
// // // // // // // // // // // // // // // // // //                         <div className={`inline-block p-2 rounded-lg ${msg.sender === user.id ? 'bg-blue-500 text-white' : 'bg-gray-300'}`}>
// // // // // // // // // // // // // // // // // //                             {msg.text}
// // // // // // // // // // // // // // // // // //                             {renderMedia(msg.files)}
// // // // // // // // // // // // // // // // // //                         </div>
// // // // // // // // // // // // // // // // // //                         <div className="text-xs text-gray-500 flex justify-end items-center">
// // // // // // // // // // // // // // // // // //                             {new Date(msg.timestamp).toLocaleTimeString()}
// // // // // // // // // // // // // // // // // //                             {msg.sender === user.id && (
// // // // // // // // // // // // // // // // // //                                 <span className="ml-2">
// // // // // // // // // // // // // // // // // //                                     {msg.read ? (
// // // // // // // // // // // // // // // // // //                                         <span className="text-blue-500">✔✔</span>
// // // // // // // // // // // // // // // // // //                                     ) : (
// // // // // // // // // // // // // // // // // //                                         <span>✔</span>
// // // // // // // // // // // // // // // // // //                                     )}
// // // // // // // // // // // // // // // // // //                                 </span>
// // // // // // // // // // // // // // // // // //                             )}
// // // // // // // // // // // // // // // // // //                             {msg.sender !== user.id && (
// // // // // // // // // // // // // // // // // //                                 <span className="ml-2">
// // // // // // // // // // // // // // // // // //                                     {msg.read ? (
// // // // // // // // // // // // // // // // // //                                         <span className="text-blue-500">✔✔</span>
// // // // // // // // // // // // // // // // // //                                     ) : (
// // // // // // // // // // // // // // // // // //                                         <span>✔✔</span>
// // // // // // // // // // // // // // // // // //                                     )}
// // // // // // // // // // // // // // // // // //                                 </span>
// // // // // // // // // // // // // // // // // //                             )}
// // // // // // // // // // // // // // // // // //                         </div>
// // // // // // // // // // // // // // // // // //                     </div>
// // // // // // // // // // // // // // // // // //                 ))}
// // // // // // // // // // // // // // // // // //                 {/* Tampilkan gambar yang sedang diupload */}
// // // // // // // // // // // // // // // // // //                 {selectedFiles.map((file, index) => (
// // // // // // // // // // // // // // // // // //                     <div key={index} className="flex items-center mb-2">
// // // // // // // // // // // // // // // // // //                         <img
// // // // // // // // // // // // // // // // // //                             src={URL.createObjectURL(file)}
// // // // // // // // // // // // // // // // // //                             alt="Uploading"
// // // // // // // // // // // // // // // // // //                             className="w-20 h-20 object-cover rounded-lg"
// // // // // // // // // // // // // // // // // //                         />
// // // // // // // // // // // // // // // // // //                         {uploadingFiles[index] && (
// // // // // // // // // // // // // // // // // //                             <span className="ml-2 text-sm text-gray-500">Uploading...</span>
// // // // // // // // // // // // // // // // // //                         )}
// // // // // // // // // // // // // // // // // //                     </div>
// // // // // // // // // // // // // // // // // //                 ))}
// // // // // // // // // // // // // // // // // //             </div>
// // // // // // // // // // // // // // // // // //             <div className="flex items-center p-4 border-t border-gray-300">
// // // // // // // // // // // // // // // // // //                 <input
// // // // // // // // // // // // // // // // // //                     type="file"
// // // // // // // // // // // // // // // // // //                     multiple
// // // // // // // // // // // // // // // // // //                     accept="image/*,video/*"
// // // // // // // // // // // // // // // // // //                     className="hidden"
// // // // // // // // // // // // // // // // // //                     id="fileInput"
// // // // // // // // // // // // // // // // // //                     onChange={handleFileChange}
// // // // // // // // // // // // // // // // // //                 />
// // // // // // // // // // // // // // // // // //                 <label htmlFor="fileInput" className="cursor-pointer flex items-center">
// // // // // // // // // // // // // // // // // //                     <span className="material-icons">attach_file</span> {/* Ganti dengan ikon klip */}
// // // // // // // // // // // // // // // // // //                 </label>
// // // // // // // // // // // // // // // // // //                 <input
// // // // // // // // // // // // // // // // // //                     type="text"
// // // // // // // // // // // // // // // // // //                     className="border rounded-lg p-2 flex-1 mx-2"
// // // // // // // // // // // // // // // // // //                     placeholder="Type a message..."
// // // // // // // // // // // // // // // // // //                     value={messageText}
// // // // // // // // // // // // // // // // // //                     onChange={(e) => setMessageText(e.target.value)}
// // // // // // // // // // // // // // // // // //                 />
// // // // // // // // // // // // // // // // // //                 <button
// // // // // // // // // // // // // // // // // //                     className="ml-2 p-2 bg-blue-500 text-white rounded-lg"
// // // // // // // // // // // // // // // // // //                     onClick={sendMessage}
// // // // // // // // // // // // // // // // // //                 >
// // // // // // // // // // // // // // // // // //                     Send
// // // // // // // // // // // // // // // // // //                 </button>
// // // // // // // // // // // // // // // // // //             </div>
// // // // // // // // // // // // // // // // // //         </div>
// // // // // // // // // // // // // // // // // //     );
// // // // // // // // // // // // // // // // // // };

// // // // // // // // // // // // // // // // // // export default Chat;

// // // // // // // // // // // // // // // // // // // "use client"; // Enable client-side rendering
// // // // // // // // // // // // // // // // // // // import React, { useState, useEffect } from 'react';
// // // // // // // // // // // // // // // // // // // import { database, storage } from '../config/firebase'; // Pastikan Anda sudah mengkonfigurasi Firebase Storage
// // // // // // // // // // // // // // // // // // // import { ref, onValue, push, update, remove } from 'firebase/database';
// // // // // // // // // // // // // // // // // // // import { uploadBytes, getDownloadURL } from 'firebase/storage';
// // // // // // // // // // // // // // // // // // // import 'tailwindcss/tailwind.css';

// // // // // // // // // // // // // // // // // // // const Chat = ({ user }) => {
// // // // // // // // // // // // // // // // // // //     const otherUser = user.id === 'user1' ? { id: 'user2', name: 'User 2' } : { id: 'user1', name: 'User 1' };

// // // // // // // // // // // // // // // // // // //     const [messages, setMessages] = useState([]);
// // // // // // // // // // // // // // // // // // //     const [messageText, setMessageText] = useState('');
// // // // // // // // // // // // // // // // // // //     const [selectedFiles, setSelectedFiles] = useState([]);
// // // // // // // // // // // // // // // // // // //     const [uploadingFiles, setUploadingFiles] = useState([]); // State untuk menyimpan status upload file
// // // // // // // // // // // // // // // // // // //     const [lastSeen, setLastSeen] = useState(null); // State untuk menyimpan waktu terakhir dilihat
// // // // // // // // // // // // // // // // // // //     const [editingMessageId, setEditingMessageId] = useState(null); // State untuk menyimpan ID pesan yang sedang diedit

// // // // // // // // // // // // // // // // // // //     // Fetch messages from Firebase on component mount
// // // // // // // // // // // // // // // // // // //     useEffect(() => {
// // // // // // // // // // // // // // // // // // //         const messagesRef = ref(database, `messages/${user.id}/${otherUser.id}`);
// // // // // // // // // // // // // // // // // // //         onValue(messagesRef, (snapshot) => {
// // // // // // // // // // // // // // // // // // //             const data = snapshot.val();
// // // // // // // // // // // // // // // // // // //             const loadedMessages = data ? Object.values(data) : [];
// // // // // // // // // // // // // // // // // // //             setMessages(loadedMessages);

// // // // // // // // // // // // // // // // // // //             // Mark all messages as read when the user views the chat
// // // // // // // // // // // // // // // // // // //             loadedMessages.forEach((msg) => {
// // // // // // // // // // // // // // // // // // //                 if (!msg.read && msg.sender !== user.id) {
// // // // // // // // // // // // // // // // // // //                     update(ref(database, `messages/${user.id}/${otherUser.id}/${msg.id}`), { read: true });
// // // // // // // // // // // // // // // // // // //                     update(ref(database, `messages/${otherUser.id}/${user.id}/${msg.id}`), { read: true });
// // // // // // // // // // // // // // // // // // //                 }
// // // // // // // // // // // // // // // // // // //             });
// // // // // // // // // // // // // // // // // // //         });

// // // // // // // // // // // // // // // // // // //         // Set last seen status
// // // // // // // // // // // // // // // // // // //         const lastSeenRef = ref(database, `lastSeen/${user.id}`);
// // // // // // // // // // // // // // // // // // //         onValue(lastSeenRef, (snapshot) => {
// // // // // // // // // // // // // // // // // // //             setLastSeen(snapshot.val());
// // // // // // // // // // // // // // // // // // //         });

// // // // // // // // // // // // // // // // // // //         // Update last seen when user is active
// // // // // // // // // // // // // // // // // // //         update(lastSeenRef, { timestamp: Date.now() });
// // // // // // // // // // // // // // // // // // //     }, [user.id, otherUser.id]);

// // // // // // // // // // // // // // // // // // //     // Handle file selection
// // // // // // // // // // // // // // // // // // //     const handleFileChange = (event) => {
// // // // // // // // // // // // // // // // // // //         const files = Array.from(event.target.files);
// // // // // // // // // // // // // // // // // // //         setSelectedFiles((prevFiles) => [...prevFiles, ...files]);
// // // // // // // // // // // // // // // // // // //     };

// // // // // // // // // // // // // // // // // // //     // Remove a selected file
// // // // // // // // // // // // // // // // // // //     const removeFile = (index) => {
// // // // // // // // // // // // // // // // // // //         setSelectedFiles((prevFiles) => prevFiles.filter((_, i) => i !== index));
// // // // // // // // // // // // // // // // // // //         setUploadingFiles((prevUploads) => prevUploads.filter((_, i) => i !== index)); // Hapus status upload yang sesuai
// // // // // // // // // // // // // // // // // // //     };

// // // // // // // // // // // // // // // // // // //     // Function to send a new message
// // // // // // // // // // // // // // // // // // //     const sendMessage = async () => {
// // // // // // // // // // // // // // // // // // //         if (messageText.trim() === "" && selectedFiles.length === 0) return; // Prevent sending empty messages

// // // // // // // // // // // // // // // // // // //         const messagesRef = ref(database, `messages/${user.id}/${otherUser.id}`);
// // // // // // // // // // // // // // // // // // //         const newMessage = {
// // // // // // // // // // // // // // // // // // //             text: messageText,
// // // // // // // // // // // // // // // // // // //             sender: user.id,
// // // // // // // // // // // // // // // // // // //             timestamp: Date.now(),
// // // // // // // // // // // // // // // // // // //             read: false,
// // // // // // // // // // // // // // // // // // //             files: [],
// // // // // // // // // // // // // // // // // // //         };

// // // // // // // // // // // // // // // // // // //         // Update the state to show loading for each file
// // // // // // // // // // // // // // // // // // //         const loadingStatus = Array(selectedFiles.length).fill(true);
// // // // // // // // // // // // // // // // // // //         setUploadingFiles(loadingStatus);

// // // // // // // // // // // // // // // // // // //         // Upload selected files to Firebase Storage
// // // // // // // // // // // // // // // // // // //         const uploadedFiles = await Promise.all(selectedFiles.map(async (file, index) => {
// // // // // // // // // // // // // // // // // // //             const storageRef = ref(storage, `chatFiles/${file.name}`);
// // // // // // // // // // // // // // // // // // //             await uploadBytes(storageRef, file);
// // // // // // // // // // // // // // // // // // //             const url = await getDownloadURL(storageRef);
// // // // // // // // // // // // // // // // // // //             // Update the loading status for the uploaded file
// // // // // // // // // // // // // // // // // // //             loadingStatus[index] = false;
// // // // // // // // // // // // // // // // // // //             setUploadingFiles([...loadingStatus]); // Update loading state
// // // // // // // // // // // // // // // // // // //             return url;
// // // // // // // // // // // // // // // // // // //         }));

// // // // // // // // // // // // // // // // // // //         // Update newMessage with uploaded file URLs
// // // // // // // // // // // // // // // // // // //         newMessage.files = uploadedFiles;

// // // // // // // // // // // // // // // // // // //         // Push message to Firebase Database
// // // // // // // // // // // // // // // // // // //         await push(messagesRef, newMessage);
// // // // // // // // // // // // // // // // // // //         setMessageText(''); // Clear input after sending
// // // // // // // // // // // // // // // // // // //         setSelectedFiles([]); // Clear selected files
// // // // // // // // // // // // // // // // // // //         setUploadingFiles([]); // Clear uploading status

// // // // // // // // // // // // // // // // // // //         // Update the recipient's message status
// // // // // // // // // // // // // // // // // // //         const recipientRef = ref(database, `messages/${otherUser.id}/${user.id}`);
// // // // // // // // // // // // // // // // // // //         await push(recipientRef, newMessage);
// // // // // // // // // // // // // // // // // // //     };

// // // // // // // // // // // // // // // // // // //     // Handle message edit
// // // // // // // // // // // // // // // // // // //     const handleEditMessage = async (id) => {
// // // // // // // // // // // // // // // // // // //         const messageToEdit = messages.find((msg) => msg.id === id);
// // // // // // // // // // // // // // // // // // //         setMessageText(messageToEdit.text);
// // // // // // // // // // // // // // // // // // //         setEditingMessageId(id);
// // // // // // // // // // // // // // // // // // //     };

// // // // // // // // // // // // // // // // // // //     // Function to update the edited message
// // // // // // // // // // // // // // // // // // //     const updateMessage = async () => {
// // // // // // // // // // // // // // // // // // //         if (editingMessageId) {
// // // // // // // // // // // // // // // // // // //             const messageRef = ref(database, `messages/${user.id}/${otherUser.id}/${editingMessageId}`);
// // // // // // // // // // // // // // // // // // //             await update(messageRef, { text: messageText });
// // // // // // // // // // // // // // // // // // //             setMessageText(''); // Clear input after updating
// // // // // // // // // // // // // // // // // // //             setEditingMessageId(null); // Reset editing state
// // // // // // // // // // // // // // // // // // //         }
// // // // // // // // // // // // // // // // // // //     };

// // // // // // // // // // // // // // // // // // //     // Function to delete a message
// // // // // // // // // // // // // // // // // // //     const deleteMessage = async (id) => {
// // // // // // // // // // // // // // // // // // //         const messageRef = ref(database, `messages/${user.id}/${otherUser.id}/${id}`);
// // // // // // // // // // // // // // // // // // //         await remove(messageRef);
// // // // // // // // // // // // // // // // // // //     };

// // // // // // // // // // // // // // // // // // //     const renderMedia = (files) => {
// // // // // // // // // // // // // // // // // // //         if (!files || files.length === 0) return null;

// // // // // // // // // // // // // // // // // // //         const visibleFiles = files.slice(0, 3);
// // // // // // // // // // // // // // // // // // //         const extraFiles = files.length - visibleFiles.length;

// // // // // // // // // // // // // // // // // // //         return (
// // // // // // // // // // // // // // // // // // //             <div className="flex flex-wrap mt-1">
// // // // // // // // // // // // // // // // // // //                 {visibleFiles.map((file, index) => (
// // // // // // // // // // // // // // // // // // //                     <img
// // // // // // // // // // // // // // // // // // //                         key={index}
// // // // // // // // // // // // // // // // // // //                         src={file}
// // // // // // // // // // // // // // // // // // //                         alt="Media"
// // // // // // // // // // // // // // // // // // //                         className="w-20 h-20 object-cover rounded-lg m-1"
// // // // // // // // // // // // // // // // // // //                     />
// // // // // // // // // // // // // // // // // // //                 ))}
// // // // // // // // // // // // // // // // // // //                 {extraFiles > 0 && (
// // // // // // // // // // // // // // // // // // //                     <div className="w-20 h-20 bg-gray-200 flex items-center justify-center rounded-lg m-1">
// // // // // // // // // // // // // // // // // // //                         +{extraFiles}
// // // // // // // // // // // // // // // // // // //                     </div>
// // // // // // // // // // // // // // // // // // //                 )}
// // // // // // // // // // // // // // // // // // //             </div>
// // // // // // // // // // // // // // // // // // //         );
// // // // // // // // // // // // // // // // // // //     };

// // // // // // // // // // // // // // // // // // //     return (
// // // // // // // // // // // // // // // // // // //         <div className="flex flex-col h-screen bg-gray-100">
// // // // // // // // // // // // // // // // // // //             <div className="flex-none p-4 bg-white border-b border-gray-300">
// // // // // // // // // // // // // // // // // // //                 <h2 className="text-xl text-center">{otherUser.name}</h2>
// // // // // // // // // // // // // // // // // // //                 {lastSeen && (
// // // // // // // // // // // // // // // // // // //                     <p className="text-sm text-gray-500 text-center">
// // // // // // // // // // // // // // // // // // //                         Last seen: {new Date(lastSeen.timestamp).toLocaleString()}
// // // // // // // // // // // // // // // // // // //                     </p>
// // // // // // // // // // // // // // // // // // //                 )}
// // // // // // // // // // // // // // // // // // //             </div>
// // // // // // // // // // // // // // // // // // //             <div className="flex-1 overflow-y-auto p-4">
// // // // // // // // // // // // // // // // // // //                 {/* Display messages */}
// // // // // // // // // // // // // // // // // // //                 {messages.map((msg, index) => (
// // // // // // // // // // // // // // // // // // //                     <div key={index} className={`mb-2 ${msg.sender === user.id ? 'text-right' : 'text-left'}`}>
// // // // // // // // // // // // // // // // // // //                         <div 
// // // // // // // // // // // // // // // // // // //                             className={`inline-block p-2 rounded-lg ${msg.sender === user.id ? 'bg-blue-500 text-white' : 'bg-gray-300'}`}
// // // // // // // // // // // // // // // // // // //                             onContextMenu={(e) => {
// // // // // // // // // // // // // // // // // // //                                 e.preventDefault();
// // // // // // // // // // // // // // // // // // //                                 if (msg.sender === user.id) {
// // // // // // // // // // // // // // // // // // //                                     handleEditMessage(msg.id); // Enable editing for the message
// // // // // // // // // // // // // // // // // // //                                 } else {
// // // // // // // // // // // // // // // // // // //                                     deleteMessage(msg.id); // Delete message for others
// // // // // // // // // // // // // // // // // // //                                 }
// // // // // // // // // // // // // // // // // // //                             }}
// // // // // // // // // // // // // // // // // // //                         >
// // // // // // // // // // // // // // // // // // //                             {msg.text}
// // // // // // // // // // // // // // // // // // //                             {renderMedia(msg.files)}
// // // // // // // // // // // // // // // // // // //                         </div>
// // // // // // // // // // // // // // // // // // //                         <div className="text-xs text-gray-500 flex justify-end items-center">
// // // // // // // // // // // // // // // // // // //                             {new Date(msg.timestamp).toLocaleTimeString()}
// // // // // // // // // // // // // // // // // // //                             {msg.sender === user.id && (
// // // // // // // // // // // // // // // // // // //                                 <span className="ml-2">
// // // // // // // // // // // // // // // // // // //                                     {msg.read ? (
// // // // // // // // // // // // // // // // // // //                                         <span className="text-blue-500">✔✔</span>
// // // // // // // // // // // // // // // // // // //                                     ) : (
// // // // // // // // // // // // // // // // // // //                                         <span>✔</span>
// // // // // // // // // // // // // // // // // // //                                     )}
// // // // // // // // // // // // // // // // // // //                                 </span>
// // // // // // // // // // // // // // // // // // //                             )}
// // // // // // // // // // // // // // // // // // //                             {msg.sender !== user.id && (
// // // // // // // // // // // // // // // // // // //                                 <span className="ml-2">
// // // // // // // // // // // // // // // // // // //                                     {msg.read ? (
// // // // // // // // // // // // // // // // // // //                                         <span className="text-blue-500">✔✔</span>
// // // // // // // // // // // // // // // // // // //                                     ) : (
// // // // // // // // // // // // // // // // // // //                                         <span>✔✔</span>
// // // // // // // // // // // // // // // // // // //                                     )}
// // // // // // // // // // // // // // // // // // //                                 </span>
// // // // // // // // // // // // // // // // // // //                             )}
// // // // // // // // // // // // // // // // // // //                         </div>
// // // // // // // // // // // // // // // // // // //                     </div>
// // // // // // // // // // // // // // // // // // //                 ))}
// // // // // // // // // // // // // // // // // // //                 {/* Tampilkan gambar yang sedang diupload */}
// // // // // // // // // // // // // // // // // // //                 {selectedFiles.map((file, index) => (
// // // // // // // // // // // // // // // // // // //                     <div key={index} className="flex items-center mb-2">
// // // // // // // // // // // // // // // // // // //                         <img
// // // // // // // // // // // // // // // // // // //                             src={URL.createObjectURL(file)}
// // // // // // // // // // // // // // // // // // //                             alt="Uploading"
// // // // // // // // // // // // // // // // // // //                             className="w-20 h-20 object-cover rounded-lg"
// // // // // // // // // // // // // // // // // // //                         />
// // // // // // // // // // // // // // // // // // //                         {uploadingFiles[index] && (
// // // // // // // // // // // // // // // // // // //                             <span className="ml-2 text-sm text-gray-500">Uploading...</span>
// // // // // // // // // // // // // // // // // // //                         )}
// // // // // // // // // // // // // // // // // // //                     </div>
// // // // // // // // // // // // // // // // // // //                 ))}
// // // // // // // // // // // // // // // // // // //             </div>
// // // // // // // // // // // // // // // // // // //             <div className="flex items-center p-4 border-t border-gray-300">
// // // // // // // // // // // // // // // // // // //                 <input
// // // // // // // // // // // // // // // // // // //                     type="file"
// // // // // // // // // // // // // // // // // // //                     multiple
// // // // // // // // // // // // // // // // // // //                     accept="image/*,video/*"
// // // // // // // // // // // // // // // // // // //                     onChange={handleFileChange}
// // // // // // // // // // // // // // // // // // //                     className="hidden"
// // // // // // // // // // // // // // // // // // //                     id="file-input"
// // // // // // // // // // // // // // // // // // //                 />
// // // // // // // // // // // // // // // // // // //                 // <label htmlFor="file-input" className="cursor-pointer">
// // // // // // // // // // // // // // // // // // //                 //     <span className="material-icons">attach_file</span>
// // // // // // // // // // // // // // // // // // //                 // </label>
// // // // // // // // // // // // // // // // // // //                     <label htmlFor="file-input" className="mr-2 cursor-pointer">
// // // // // // // // // // // // // // // // // // //                         <span className="text-gray-600 hover:text-blue-500">📎</span>
// // // // // // // // // // // // // // // // // // //                     </label>
// // // // // // // // // // // // // // // // // // //                 <input
// // // // // // // // // // // // // // // // // // //                     type="text"
// // // // // // // // // // // // // // // // // // //                     value={messageText}
// // // // // // // // // // // // // // // // // // //                     onChange={(e) => setMessageText(e.target.value)}
// // // // // // // // // // // // // // // // // // //                     placeholder="Type a message..."
// // // // // // // // // // // // // // // // // // //                     className="flex-1 p-2 border border-gray-300 rounded-lg mx-2"
// // // // // // // // // // // // // // // // // // //                 />
// // // // // // // // // // // // // // // // // // //                 <button
// // // // // // // // // // // // // // // // // // //                     onClick={editingMessageId ? updateMessage : sendMessage}
// // // // // // // // // // // // // // // // // // //                     className="bg-blue-500 text-white rounded-lg px-4 py-2"
// // // // // // // // // // // // // // // // // // //                 >
// // // // // // // // // // // // // // // // // // //                     {editingMessageId ? 'Update' : 'Send'}
// // // // // // // // // // // // // // // // // // //                 </button>
// // // // // // // // // // // // // // // // // // //             </div>
// // // // // // // // // // // // // // // // // // //         </div>
// // // // // // // // // // // // // // // // // // //     );
// // // // // // // // // // // // // // // // // // // };

// // // // // // // // // // // // // // // // // // // export default Chat;
// // // // // // // // // // // // // // //  "use client"; // Enable client-side rendering

// // // // // // // // // // // // // // // import React, { useState, useEffect } from 'react';
// // // // // // // // // // // // // // // import { database, storage } from '../config/firebase'; // Pastikan Anda sudah mengkonfigurasi Firebase Storage
// // // // // // // // // // // // // // // import { ref, onValue, push, update } from 'firebase/database';
// // // // // // // // // // // // // // // import { uploadBytes, getDownloadURL } from 'firebase/storage';
// // // // // // // // // // // // // // // import 'tailwindcss/tailwind.css';

// // // // // // // // // // // // // // // const Chat = ({ user }) => {
// // // // // // // // // // // // // // //     const otherUser = user.id === 'user1' ? { id: 'user2', name: 'User 2' } : { id: 'user1', name: 'User 1' };

// // // // // // // // // // // // // // //     const [messages, setMessages] = useState([]);
// // // // // // // // // // // // // // //     const [messageText, setMessageText] = useState('');
// // // // // // // // // // // // // // //     const [selectedFiles, setSelectedFiles] = useState([]);
// // // // // // // // // // // // // // //     const [uploading, setUploading] = useState(false);

// // // // // // // // // // // // // // //     // Fetch messages from Firebase on component mount
// // // // // // // // // // // // // // //     useEffect(() => {
// // // // // // // // // // // // // // //         const messagesRef = ref(database, `messages/${user.id}/${otherUser.id}`);
// // // // // // // // // // // // // // //         onValue(messagesRef, (snapshot) => {
// // // // // // // // // // // // // // //             const data = snapshot.val();
// // // // // // // // // // // // // // //             const loadedMessages = data ? Object.values(data) : [];
// // // // // // // // // // // // // // //             setMessages(loadedMessages);

// // // // // // // // // // // // // // //             // Mark all messages as read when the user views the chat
// // // // // // // // // // // // // // //             loadedMessages.forEach((msg) => {
// // // // // // // // // // // // // // //                 if (!msg.read && msg.sender !== user.id) {
// // // // // // // // // // // // // // //                     update(ref(database, `messages/${user.id}/${otherUser.id}/${msg.id}`), { read: true });
// // // // // // // // // // // // // // //                     update(ref(database, `messages/${otherUser.id}/${user.id}/${msg.id}`), { read: true });
// // // // // // // // // // // // // // //                 }
// // // // // // // // // // // // // // //             });
// // // // // // // // // // // // // // //         });
// // // // // // // // // // // // // // //     }, [user.id, otherUser.id]);

// // // // // // // // // // // // // // //     // Handle file selection
// // // // // // // // // // // // // // //     const handleFileChange = (event) => {
// // // // // // // // // // // // // // //         const files = Array.from(event.target.files);
// // // // // // // // // // // // // // //         setSelectedFiles((prevFiles) => [...prevFiles, ...files]);
// // // // // // // // // // // // // // //     };

// // // // // // // // // // // // // // //     // Remove a selected file
// // // // // // // // // // // // // // //     const removeFile = (index) => {
// // // // // // // // // // // // // // //         setSelectedFiles((prevFiles) => prevFiles.filter((_, i) => i !== index));
// // // // // // // // // // // // // // //     };

// // // // // // // // // // // // // // //     // Function to send a new message
// // // // // // // // // // // // // // //     const sendMessage = async () => {
// // // // // // // // // // // // // // //         if (messageText.trim() === "" && selectedFiles.length === 0) return; // Prevent sending empty messages

// // // // // // // // // // // // // // //         const messagesRef = ref(database, `messages/${user.id}/${otherUser.id}`);
// // // // // // // // // // // // // // //         const newMessage = {
// // // // // // // // // // // // // // //             text: messageText,
// // // // // // // // // // // // // // //             sender: user.id,
// // // // // // // // // // // // // // //             timestamp: Date.now(),
// // // // // // // // // // // // // // //             read: false,
// // // // // // // // // // // // // // //             files: [],
// // // // // // // // // // // // // // //         };

// // // // // // // // // // // // // // //         setUploading(true);

// // // // // // // // // // // // // // //         // Upload selected files to Firebase Storage
// // // // // // // // // // // // // // //         const uploadedFiles = await Promise.all(selectedFiles.map(async (file) => {
// // // // // // // // // // // // // // //             const storageRef = ref(storage, `chatFiles/${file.name}`);
// // // // // // // // // // // // // // //             await uploadBytes(storageRef, file);
// // // // // // // // // // // // // // //             return getDownloadURL(storageRef);
// // // // // // // // // // // // // // //         }));

// // // // // // // // // // // // // // //         // Update newMessage with uploaded file URLs
// // // // // // // // // // // // // // //         newMessage.files = uploadedFiles;

// // // // // // // // // // // // // // //         // Push message to Firebase Database
// // // // // // // // // // // // // // //         await push(messagesRef, newMessage);
// // // // // // // // // // // // // // //         setMessageText(''); // Clear input after sending
// // // // // // // // // // // // // // //         setSelectedFiles([]); // Clear selected files

// // // // // // // // // // // // // // //         // Update the recipient's message status
// // // // // // // // // // // // // // //         const recipientRef = ref(database, `messages/${otherUser.id}/${user.id}`);
// // // // // // // // // // // // // // //         await push(recipientRef, newMessage);

// // // // // // // // // // // // // // //         setUploading(false);
// // // // // // // // // // // // // // //     };

// // // // // // // // // // // // // // //     const renderMedia = (files) => {
// // // // // // // // // // // // // // //         if (!files || files.length === 0) return null;

// // // // // // // // // // // // // // //         const visibleFiles = files.slice(0, 3);
// // // // // // // // // // // // // // //         const extraFiles = files.length - visibleFiles.length;

// // // // // // // // // // // // // // //         return (
// // // // // // // // // // // // // // //             <div className="flex flex-wrap mt-1">
// // // // // // // // // // // // // // //                 {visibleFiles.map((file, index) => (
// // // // // // // // // // // // // // //                     <img
// // // // // // // // // // // // // // //                         key={index}
// // // // // // // // // // // // // // //                         src={file}
// // // // // // // // // // // // // // //                         alt="Media"
// // // // // // // // // // // // // // //                         className="w-20 h-20 object-cover rounded-lg m-1"
// // // // // // // // // // // // // // //                     />
// // // // // // // // // // // // // // //                 ))}
// // // // // // // // // // // // // // //                 {extraFiles > 0 && (
// // // // // // // // // // // // // // //                     <div className="w-20 h-20 bg-gray-200 flex items-center justify-center rounded-lg m-1">
// // // // // // // // // // // // // // //                         +{extraFiles}
// // // // // // // // // // // // // // //                     </div>
// // // // // // // // // // // // // // //                 )}
// // // // // // // // // // // // // // //             </div>
// // // // // // // // // // // // // // //         );
// // // // // // // // // // // // // // //     };

// // // // // // // // // // // // // // //     return (
// // // // // // // // // // // // // // //         <div className="flex flex-col h-screen bg-gray-100">
// // // // // // // // // // // // // // //             <div className="flex-none p-4 bg-white border-b border-gray-300">
// // // // // // // // // // // // // // //                 <h2 className="text-xl text-center">{otherUser.name}</h2>
// // // // // // // // // // // // // // //             </div>
// // // // // // // // // // // // // // //             <div className="flex-1 overflow-y-auto p-4">
// // // // // // // // // // // // // // //                 {/* Display messages */}
// // // // // // // // // // // // // // //                 {messages.map((msg, index) => (
// // // // // // // // // // // // // // //                     <div key={index} className={`mb-2 ${msg.sender === user.id ? 'text-right' : 'text-left'}`}>
// // // // // // // // // // // // // // //                         <div className={`inline-block p-2 rounded-lg ${msg.sender === user.id ? 'bg-blue-500 text-white' : 'bg-gray-300'}`}>
// // // // // // // // // // // // // // //                             {msg.text}
// // // // // // // // // // // // // // //                             {renderMedia(msg.files)}
// // // // // // // // // // // // // // //                         </div>
// // // // // // // // // // // // // // //                         <div className="text-xs text-gray-500 flex justify-end items-center">
// // // // // // // // // // // // // // //                             {new Date(msg.timestamp).toLocaleTimeString()}
// // // // // // // // // // // // // // //                             {msg.sender === user.id && (
// // // // // // // // // // // // // // //                                 <span className="ml-2">
// // // // // // // // // // // // // // //                                     {msg.read ? (
// // // // // // // // // // // // // // //                                         <span className="text-blue-500">✔✔</span>
// // // // // // // // // // // // // // //                                     ) : (
// // // // // // // // // // // // // // //                                         <span>✔</span>
// // // // // // // // // // // // // // //                                     )}
// // // // // // // // // // // // // // //                                 </span>
// // // // // // // // // // // // // // //                             )}
// // // // // // // // // // // // // // //                             {msg.sender !== user.id && (
// // // // // // // // // // // // // // //                                 <span className="ml-2">
// // // // // // // // // // // // // // //                                     {msg.read ? (
// // // // // // // // // // // // // // //                                         <span className="text-blue-500">✔✔</span>
// // // // // // // // // // // // // // //                                     ) : (
// // // // // // // // // // // // // // //                                         <span>✔✔</span>
// // // // // // // // // // // // // // //                                     )}
// // // // // // // // // // // // // // //                                 </span>
// // // // // // // // // // // // // // //                             )}
// // // // // // // // // // // // // // //                         </div>
// // // // // // // // // // // // // // //                     </div>
// // // // // // // // // // // // // // //                 ))}
// // // // // // // // // // // // // // //             </div>
// // // // // // // // // // // // // // //             <div className="flex items-center p-4 border-t border-gray-300">
// // // // // // // // // // // // // // //                 <input
// // // // // // // // // // // // // // //                     type="file"
// // // // // // // // // // // // // // //                     multiple
// // // // // // // // // // // // // // //                     accept="image/*,video/*"
// // // // // // // // // // // // // // //                     className="hidden"
// // // // // // // // // // // // // // //                     id="fileInput"
// // // // // // // // // // // // // // //                     onChange={handleFileChange}
// // // // // // // // // // // // // // //                 />
// // // // // // // // // // // // // // //                 <label htmlFor="fileInput" className="cursor-pointer">
// // // // // // // // // // // // // // //                     <span className="material-icons">attach_file</span> {/* Ganti ikon disini */}
// // // // // // // // // // // // // // //                 </label>
// // // // // // // // // // // // // // //                 <div className="flex flex-wrap w-64">
// // // // // // // // // // // // // // //                     {selectedFiles.map((file, index) => (
// // // // // // // // // // // // // // //                         <div key={index} className="relative mr-2">
// // // // // // // // // // // // // // //                             <span
// // // // // // // // // // // // // // //                                 className="absolute top-0 right-0 cursor-pointer text-red-500"
// // // // // // // // // // // // // // //                                 onClick={() => removeFile(index)}
// // // // // // // // // // // // // // //                             >
// // // // // // // // // // // // // // //                                 &times;
// // // // // // // // // // // // // // //                             </span>
// // // // // // // // // // // // // // //                             <img
// // // // // // // // // // // // // // //                                 src={URL.createObjectURL(file)} // Menampilkan gambar sebagai preview
// // // // // // // // // // // // // // //                                 alt="Preview"
// // // // // // // // // // // // // // //                                 className="w-20 h-20 object-cover rounded-lg"
// // // // // // // // // // // // // // //                             />
// // // // // // // // // // // // // // //                         </div>
// // // // // // // // // // // // // // //                     ))}
// // // // // // // // // // // // // // //                 </div>
// // // // // // // // // // // // // // //                 <input
// // // // // // // // // // // // // // //                     type="text"
// // // // // // // // // // // // // // //                     className="border rounded-lg p-2 flex-1 mx-2"
// // // // // // // // // // // // // // //                     placeholder="Type a message..."
// // // // // // // // // // // // // // //                     value={messageText}
// // // // // // // // // // // // // // //                     onChange={(e) => setMessageText(e.target.value)}
// // // // // // // // // // // // // // //                 />
// // // // // // // // // // // // // // //                 <button
// // // // // // // // // // // // // // //                     className="ml-2 p-2 bg-blue-500 text-white rounded-lg"
// // // // // // // // // // // // // // //                     onClick={sendMessage}
// // // // // // // // // // // // // // //                     disabled={uploading}
// // // // // // // // // // // // // // //                 >
// // // // // // // // // // // // // // //                     {uploading ? "Sending..." : "Send"}
// // // // // // // // // // // // // // //                 </button>
// // // // // // // // // // // // // // //             </div>
// // // // // // // // // // // // // // //         </div>
// // // // // // // // // // // // // // //     );
// // // // // // // // // // // // // // // };

// // // // // // // // // // // // // // // export default Chat;
// // // // // // // // // // // // // // // // // "use client"; // Enable client-side rendering
// // // // // // // // // // // // // // // // // import React, { useState, useEffect } from 'react';
// // // // // // // // // // // // // // // // // import { database, storage } from '../config/firebase'; // Pastikan Anda sudah mengkonfigurasi Firebase Storage
// // // // // // // // // // // // // // // // // import { ref, onValue, push, update, remove } from 'firebase/database';
// // // // // // // // // // // // // // // // // import { uploadBytes, getDownloadURL } from 'firebase/storage';
// // // // // // // // // // // // // // // // // import 'tailwindcss/tailwind.css';

// // // // // // // // // // // // // // // // // const Chat = ({ user }) => {
// // // // // // // // // // // // // // // // //     const otherUser = user.id === 'user1' ? { id: 'user2', name: 'User 2' } : { id: 'user1', name: 'User 1' };

// // // // // // // // // // // // // // // // //     const [messages, setMessages] = useState([]);
// // // // // // // // // // // // // // // // //     const [messageText, setMessageText] = useState('');
// // // // // // // // // // // // // // // // //     const [selectedFiles, setSelectedFiles] = useState([]);
// // // // // // // // // // // // // // // // //     const [uploadingFiles, setUploadingFiles] = useState([]); // State untuk menyimpan status upload file
// // // // // // // // // // // // // // // // //     const [lastSeen, setLastSeen] = useState(null); // State untuk menyimpan waktu terakhir dilihat
// // // // // // // // // // // // // // // // //     const [editingMessageId, setEditingMessageId] = useState(null); // State untuk menyimpan ID pesan yang sedang diedit
// // // // // // // // // // // // // // // // //     const [isTyping, setIsTyping] = useState(false); // State untuk menyimpan status mengetik
// // // // // // // // // // // // // // // // //     const [isUploading, setIsUploading] = useState(false); // State untuk menyimpan status upload

// // // // // // // // // // // // // // // // //     // Fetch messages from Firebase on component mount
// // // // // // // // // // // // // // // // //     useEffect(() => {
// // // // // // // // // // // // // // // // //         const messagesRef = ref(database, `messages/${user.id}/${otherUser.id}`);
// // // // // // // // // // // // // // // // //         onValue(messagesRef, (snapshot) => {
// // // // // // // // // // // // // // // // //             const data = snapshot.val();
// // // // // // // // // // // // // // // // //             const loadedMessages = data ? Object.values(data) : [];
// // // // // // // // // // // // // // // // //             setMessages(loadedMessages);

// // // // // // // // // // // // // // // // //             // Mark all messages as read when the user views the chat
// // // // // // // // // // // // // // // // //             loadedMessages.forEach((msg) => {
// // // // // // // // // // // // // // // // //                 if (!msg.read && msg.sender !== user.id) {
// // // // // // // // // // // // // // // // //                     update(ref(database, `messages/${user.id}/${otherUser.id}/${msg.id}`), { read: true });
// // // // // // // // // // // // // // // // //                     update(ref(database, `messages/${otherUser.id}/${user.id}/${msg.id}`), { read: true });
// // // // // // // // // // // // // // // // //                 }
// // // // // // // // // // // // // // // // //             });
// // // // // // // // // // // // // // // // //         });

// // // // // // // // // // // // // // // // //         // Set last seen status
// // // // // // // // // // // // // // // // //         const lastSeenRef = ref(database, `lastSeen/${user.id}`);
// // // // // // // // // // // // // // // // //         onValue(lastSeenRef, (snapshot) => {
// // // // // // // // // // // // // // // // //             setLastSeen(snapshot.val());
// // // // // // // // // // // // // // // // //         });

// // // // // // // // // // // // // // // // //         // Update last seen when user is active
// // // // // // // // // // // // // // // // //         const updateLastSeen = () => {
// // // // // // // // // // // // // // // // //             if (isTyping) {
// // // // // // // // // // // // // // // // //                 update(lastSeenRef, { status: "Online", timestamp: Date.now() });
// // // // // // // // // // // // // // // // //             } else {
// // // // // // // // // // // // // // // // //                 update(lastSeenRef, { status: "Last Seen", timestamp: Date.now() });
// // // // // // // // // // // // // // // // //             }
// // // // // // // // // // // // // // // // //         };

// // // // // // // // // // // // // // // // //         // Check typing status
// // // // // // // // // // // // // // // // //         const typingInterval = setInterval(updateLastSeen, 5000); // Update every 5 seconds

// // // // // // // // // // // // // // // // //         return () => clearInterval(typingInterval); // Clean up interval on unmount
// // // // // // // // // // // // // // // // //     }, [user.id, otherUser.id, isTyping]);

// // // // // // // // // // // // // // // // //     // Handle file selection
// // // // // // // // // // // // // // // // //     const handleFileChange = (event) => {
// // // // // // // // // // // // // // // // //         const files = Array.from(event.target.files);
// // // // // // // // // // // // // // // // //         setSelectedFiles((prevFiles) => [...prevFiles, ...files]);
// // // // // // // // // // // // // // // // //     };

// // // // // // // // // // // // // // // // //     // Remove a selected file
// // // // // // // // // // // // // // // // //     const removeFile = (index) => {
// // // // // // // // // // // // // // // // //         setSelectedFiles((prevFiles) => prevFiles.filter((_, i) => i !== index));
// // // // // // // // // // // // // // // // //         setUploadingFiles((prevUploads) => prevUploads.filter((_, i) => i !== index)); // Hapus status upload yang sesuai
// // // // // // // // // // // // // // // // //     };

// // // // // // // // // // // // // // // // //     // Function to send a new message
// // // // // // // // // // // // // // // // //     const sendMessage = async () => {
// // // // // // // // // // // // // // // // //         if (messageText.trim() === "" && selectedFiles.length === 0) return; // Prevent sending empty messages

// // // // // // // // // // // // // // // // //         const messagesRef = ref(database, `messages/${user.id}/${otherUser.id}`);
// // // // // // // // // // // // // // // // //         const newMessage = {
// // // // // // // // // // // // // // // // //             text: messageText,
// // // // // // // // // // // // // // // // //             sender: user.id,
// // // // // // // // // // // // // // // // //             timestamp: Date.now(),
// // // // // // // // // // // // // // // // //             read: false,
// // // // // // // // // // // // // // // // //             files: [],
// // // // // // // // // // // // // // // // //         };

// // // // // // // // // // // // // // // // //         // Update newMessage with uploaded file URLs
// // // // // // // // // // // // // // // // //         if (selectedFiles.length > 0) {
// // // // // // // // // // // // // // // // //             setIsUploading(true); // Set uploading status to true
// // // // // // // // // // // // // // // // //             const uploadedFiles = await Promise.all(selectedFiles.map(async (file) => {
// // // // // // // // // // // // // // // // //                 const storageRef = ref(storage, `chatFiles/${file.name}`);
// // // // // // // // // // // // // // // // //                 await uploadBytes(storageRef, file);
// // // // // // // // // // // // // // // // //                 const url = await getDownloadURL(storageRef);
// // // // // // // // // // // // // // // // //                 return url;
// // // // // // // // // // // // // // // // //             }));
// // // // // // // // // // // // // // // // //             newMessage.files = uploadedFiles;
// // // // // // // // // // // // // // // // //             setIsUploading(false); // Reset uploading status
// // // // // // // // // // // // // // // // //             setSelectedFiles([]); // Clear selected files after upload
// // // // // // // // // // // // // // // // //         }

// // // // // // // // // // // // // // // // //         // Push message to Firebase Database
// // // // // // // // // // // // // // // // //         await push(messagesRef, newMessage);
// // // // // // // // // // // // // // // // //         setMessageText(''); // Clear input after sending

// // // // // // // // // // // // // // // // //         // Update the recipient's message status
// // // // // // // // // // // // // // // // //         const recipientRef = ref(database, `messages/${otherUser.id}/${user.id}`);
// // // // // // // // // // // // // // // // //         await push(recipientRef, newMessage);
// // // // // // // // // // // // // // // // //     };

// // // // // // // // // // // // // // // // //     // Handle message edit
// // // // // // // // // // // // // // // // //     const handleEditMessage = async (id) => {
// // // // // // // // // // // // // // // // //         const messageToEdit = messages.find((msg) => msg.id === id);
// // // // // // // // // // // // // // // // //         setMessageText(messageToEdit.text);
// // // // // // // // // // // // // // // // //         setEditingMessageId(id);
// // // // // // // // // // // // // // // // //     };

// // // // // // // // // // // // // // // // //     // Function to update the edited message
// // // // // // // // // // // // // // // // //     const updateMessage = async () => {
// // // // // // // // // // // // // // // // //         if (editingMessageId) {
// // // // // // // // // // // // // // // // //             const messageRef = ref(database, `messages/${user.id}/${otherUser.id}/${editingMessageId}`);
// // // // // // // // // // // // // // // // //             await update(messageRef, { text: messageText });
// // // // // // // // // // // // // // // // //             setMessageText(''); // Clear input after updating
// // // // // // // // // // // // // // // // //             setEditingMessageId(null); // Reset editing state
// // // // // // // // // // // // // // // // //         }
// // // // // // // // // // // // // // // // //     };

// // // // // // // // // // // // // // // // //     // Function to delete a message
// // // // // // // // // // // // // // // // //     const deleteMessage = async (id) => {
// // // // // // // // // // // // // // // // //         const messageRef = ref(database, `messages/${user.id}/${otherUser.id}/${id}`);
// // // // // // // // // // // // // // // // //         await remove(messageRef);
// // // // // // // // // // // // // // // // //     };

// // // // // // // // // // // // // // // // //     const renderMedia = (files) => {
// // // // // // // // // // // // // // // // //         if (!files || files.length === 0) return null;

// // // // // // // // // // // // // // // // //         const visibleFiles = files.slice(0, 3);
// // // // // // // // // // // // // // // // //         const extraFiles = files.length - visibleFiles.length;

// // // // // // // // // // // // // // // // //         return (
// // // // // // // // // // // // // // // // //             <div className="flex flex-wrap mt-1">
// // // // // // // // // // // // // // // // //                 {visibleFiles.map((file, index) => (
// // // // // // // // // // // // // // // // //                     <div key={index} className="relative">
// // // // // // // // // // // // // // // // //                         <img
// // // // // // // // // // // // // // // // //                             src={file}
// // // // // // // // // // // // // // // // //                             alt="Media"
// // // // // // // // // // // // // // // // //                             className="w-20 h-20 object-cover rounded-lg m-1"
// // // // // // // // // // // // // // // // //                         />
// // // // // // // // // // // // // // // // //                         <button
// // // // // // // // // // // // // // // // //                             onClick={() => removeFile(index)}
// // // // // // // // // // // // // // // // //                             className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1"
// // // // // // // // // // // // // // // // //                         >
// // // // // // // // // // // // // // // // //                             X
// // // // // // // // // // // // // // // // //                         </button>
// // // // // // // // // // // // // // // // //                     </div>
// // // // // // // // // // // // // // // // //                 ))}
// // // // // // // // // // // // // // // // //                 {extraFiles > 0 && (
// // // // // // // // // // // // // // // // //                     <div className="w-20 h-20 bg-gray-200 flex items-center justify-center rounded-lg m-1">
// // // // // // // // // // // // // // // // //                         +{extraFiles}
// // // // // // // // // // // // // // // // //                     </div>
// // // // // // // // // // // // // // // // //                 )}
// // // // // // // // // // // // // // // // //             </div>
// // // // // // // // // // // // // // // // //         );
// // // // // // // // // // // // // // // // //     };

// // // // // // // // // // // // // // // // //     return (
// // // // // // // // // // // // // // // // //         <div className="flex flex-col h-screen bg-gray-100">
// // // // // // // // // // // // // // // // //             <div className="flex-none p-4 bg-white border-b border-gray-300">
// // // // // // // // // // // // // // // // //                 <h2 className="text-xl text-center">{otherUser.name}</h2>
// // // // // // // // // // // // // // // // //                 {lastSeen && (
// // // // // // // // // // // // // // // // //                     <p className="text-sm text-gray-500 text-center">
// // // // // // // // // // // // // // // // //                         {lastSeen.status} (Last seen: {new Date(lastSeen.timestamp).toLocaleString()})
// // // // // // // // // // // // // // // // //                     </p>
// // // // // // // // // // // // // // // // //                 )}
// // // // // // // // // // // // // // // // //             </div>
// // // // // // // // // // // // // // // // //             <div className="flex-1 overflow-y-auto p-4">
// // // // // // // // // // // // // // // // //                 {/* Display messages */}
// // // // // // // // // // // // // // // // //                 {messages.map((msg, index) => (
// // // // // // // // // // // // // // // // //                     <div key={index} className={`mb-2 ${msg.sender === user.id ? 'text-right' : 'text-left'}`}>
// // // // // // // // // // // // // // // // //                         <div 
// // // // // // // // // // // // // // // // //                             className={`inline-block p-2 rounded-lg ${msg.sender === user.id ? 'bg-blue-500 text-white' : 'bg-gray-300'}`}
// // // // // // // // // // // // // // // // //                             onContextMenu={(e) => {
// // // // // // // // // // // // // // // // //                                 e.preventDefault();
// // // // // // // // // // // // // // // // //                                 if (msg.sender === user.id) {
// // // // // // // // // // // // // // // // //                                     handleEditMessage(msg.id); // Enable editing for the message
// // // // // // // // // // // // // // // // //                                 } else {
// // // // // // // // // // // // // // // // //                                     deleteMessage(msg.id); // Delete message for others
// // // // // // // // // // // // // // // // //                                 }
// // // // // // // // // // // // // // // // //                             }}
// // // // // // // // // // // // // // // // //                         >
// // // // // // // // // // // // // // // // //                             {msg.text}
// // // // // // // // // // // // // // // // //                             {renderMedia(msg.files)}
// // // // // // // // // // // // // // // // //                         </div>
// // // // // // // // // // // // // // // // //                         <div className="text-xs text-gray-500 flex justify-end items-center">
// // // // // // // // // // // // // // // // //                             {new Date(msg.timestamp).toLocaleTimeString()}
// // // // // // // // // // // // // // // // //                             {msg.sender === user.id && (
// // // // // // // // // // // // // // // // //                                 <span className="ml-2">
// // // // // // // // // // // // // // // // //                                     {msg.read ? (
// // // // // // // // // // // // // // // // //                                         <span className="text-blue-500">✔✔</span>
// // // // // // // // // // // // // // // // //                                     ) : (
// // // // // // // // // // // // // // // // //                                         <span>✔</span>
// // // // // // // // // // // // // // // // //                                     )}
// // // // // // // // // // // // // // // // //                                 </span>
// // // // // // // // // // // // // // // // //                             )}
// // // // // // // // // // // // // // // // //                             {msg.sender !== user.id && (
// // // // // // // // // // // // // // // // //                                 <span className="ml-2">
// // // // // // // // // // // // // // // // //                                     {msg.read ? (
// // // // // // // // // // // // // // // // //                                         <span className="text-blue-500">✔✔</span>
// // // // // // // // // // // // // // // // //                                     ) : (
// // // // // // // // // // // // // // // // //                                         <span>✔✔</span>
// // // // // // // // // // // // // // // // //                                     )}
// // // // // // // // // // // // // // // // //                                 </span>
// // // // // // // // // // // // // // // // //                             )}
// // // // // // // // // // // // // // // // //                         </div>
// // // // // // // // // // // // // // // // //                     </div>
// // // // // // // // // // // // // // // // //                 ))}
// // // // // // // // // // // // // // // // //             </div>
// // // // // // // // // // // // // // // // //             <div className="flex-none p-4 border-t border-gray-300 flex items-center">
// // // // // // // // // // // // // // // // //                 <input
// // // // // // // // // // // // // // // // //                     type="file"
// // // // // // // // // // // // // // // // //                     accept="image/*,video/*"
// // // // // // // // // // // // // // // // //                     onChange={handleFileChange}
// // // // // // // // // // // // // // // // //                     className="hidden"
// // // // // // // // // // // // // // // // //                     id="file-input"
// // // // // // // // // // // // // // // // //                     multiple
// // // // // // // // // // // // // // // // //                 />
// // // // // // // // // // // // // // // // //                 <label htmlFor="file-input" className="bg-gray-200 rounded-lg px-4 py-2 cursor-pointer">
// // // // // // // // // // // // // // // // //                     📎
// // // // // // // // // // // // // // // // //                 </label>
// // // // // // // // // // // // // // // // //                 {renderMedia(selectedFiles)} {/* Render selected files */}
// // // // // // // // // // // // // // // // //                 <input
// // // // // // // // // // // // // // // // //                     type="text"
// // // // // // // // // // // // // // // // //                     value={messageText}
// // // // // // // // // // // // // // // // //                     onChange={(e) => {
// // // // // // // // // // // // // // // // //                         setMessageText(e.target.value);
// // // // // // // // // // // // // // // // //                         setIsTyping(true); // Set typing status to true
// // // // // // // // // // // // // // // // //                     }}
// // // // // // // // // // // // // // // // //                     placeholder="Type a message..."
// // // // // // // // // // // // // // // // //                     className="flex-1 p-2 border border-gray-300 rounded-lg mx-2"
// // // // // // // // // // // // // // // // //                 />
// // // // // // // // // // // // // // // // //                 <button
// // // // // // // // // // // // // // // // //                     onClick={editingMessageId ? updateMessage : sendMessage}
// // // // // // // // // // // // // // // // //                     className="bg-blue-500 text-white rounded-lg px-4 py-2"
// // // // // // // // // // // // // // // // //                 >
// // // // // // // // // // // // // // // // //                     {editingMessageId ? 'Update' : 'Send'}
// // // // // // // // // // // // // // // // //                 </button>
// // // // // // // // // // // // // // // // //             </div>
// // // // // // // // // // // // // // // // //         </div>
// // // // // // // // // // // // // // // // //     );
// // // // // // // // // // // // // // // // // };

// // // // // // // // // // // // // // // // // export default Chat;



// // // // // // // // // // // // // // // // // "use client"; // Enable client-side rendering
// // // // // // // // // // // // // // // // // import React, { useState, useEffect } from 'react';
// // // // // // // // // // // // // // // // // import { database, storage } from '../config/firebase'; // Pastikan Anda sudah mengkonfigurasi Firebase Storage
// // // // // // // // // // // // // // // // // import { ref, onValue, push, update, remove } from 'firebase/database';
// // // // // // // // // // // // // // // // // import { uploadBytes, getDownloadURL } from 'firebase/storage';
// // // // // // // // // // // // // // // // // import 'tailwindcss/tailwind.css';

// // // // // // // // // // // // // // // // // const Chat = ({ user }) => {
// // // // // // // // // // // // // // // // //     const otherUser = user.id === 'user1' ? { id: 'user2', name: 'User 2' } : { id: 'user1', name: 'User 1' };

// // // // // // // // // // // // // // // // //     const [messages, setMessages] = useState([]);
// // // // // // // // // // // // // // // // //     const [messageText, setMessageText] = useState('');
// // // // // // // // // // // // // // // // //     const [selectedFiles, setSelectedFiles] = useState([]);
// // // // // // // // // // // // // // // // //     const [uploadingFiles, setUploadingFiles] = useState([]); // State untuk menyimpan status upload file
// // // // // // // // // // // // // // // // //     const [lastSeen, setLastSeen] = useState(null); // State untuk menyimpan waktu terakhir dilihat
// // // // // // // // // // // // // // // // //     const [editingMessageId, setEditingMessageId] = useState(null); // State untuk menyimpan ID pesan yang sedang diedit
// // // // // // // // // // // // // // // // //     const [isTyping, setIsTyping] = useState(false); // State untuk menyimpan status mengetik
// // // // // // // // // // // // // // // // //     const [isUploading, setIsUploading] = useState(false); // State untuk menyimpan status upload

// // // // // // // // // // // // // // // // //     // Fetch messages from Firebase on component mount
// // // // // // // // // // // // // // // // //     useEffect(() => {
// // // // // // // // // // // // // // // // //         const messagesRef = ref(database, `messages/${user.id}/${otherUser.id}`);
// // // // // // // // // // // // // // // // //         onValue(messagesRef, (snapshot) => {
// // // // // // // // // // // // // // // // //             const data = snapshot.val();
// // // // // // // // // // // // // // // // //             const loadedMessages = data ? Object.values(data) : [];
// // // // // // // // // // // // // // // // //             setMessages(loadedMessages);

// // // // // // // // // // // // // // // // //             // Mark all messages as read when the user views the chat
// // // // // // // // // // // // // // // // //             loadedMessages.forEach((msg) => {
// // // // // // // // // // // // // // // // //                 if (!msg.read && msg.sender !== user.id) {
// // // // // // // // // // // // // // // // //                     update(ref(database, `messages/${user.id}/${otherUser.id}/${msg.id}`), { read: true });
// // // // // // // // // // // // // // // // //                     update(ref(database, `messages/${otherUser.id}/${user.id}/${msg.id}`), { read: true });
// // // // // // // // // // // // // // // // //                 }
// // // // // // // // // // // // // // // // //             });
// // // // // // // // // // // // // // // // //         });

// // // // // // // // // // // // // // // // //         // Set last seen status
// // // // // // // // // // // // // // // // //         const lastSeenRef = ref(database, `lastSeen/${user.id}`);
// // // // // // // // // // // // // // // // //         onValue(lastSeenRef, (snapshot) => {
// // // // // // // // // // // // // // // // //             setLastSeen(snapshot.val());
// // // // // // // // // // // // // // // // //         });

// // // // // // // // // // // // // // // // //         // Update last seen when user is active
// // // // // // // // // // // // // // // // //         const updateLastSeen = () => {
// // // // // // // // // // // // // // // // //             if (isTyping) {
// // // // // // // // // // // // // // // // //                 update(lastSeenRef, { status: "Online", timestamp: Date.now() });
// // // // // // // // // // // // // // // // //             } else {
// // // // // // // // // // // // // // // // //                 update(lastSeenRef, { status: "Last Seen", timestamp: Date.now() });
// // // // // // // // // // // // // // // // //             }
// // // // // // // // // // // // // // // // //         };

// // // // // // // // // // // // // // // // //         // Check typing status
// // // // // // // // // // // // // // // // //         const typingInterval = setInterval(updateLastSeen, 5000); // Update every 5 seconds

// // // // // // // // // // // // // // // // //         return () => clearInterval(typingInterval); // Clean up interval on unmount
// // // // // // // // // // // // // // // // //     }, [user.id, otherUser.id, isTyping]);

// // // // // // // // // // // // // // // // //     // Handle file selection
// // // // // // // // // // // // // // // // //     const handleFileChange = (event) => {
// // // // // // // // // // // // // // // // //         const files = Array.from(event.target.files);
// // // // // // // // // // // // // // // // //         setSelectedFiles((prevFiles) => [...prevFiles, ...files]);
// // // // // // // // // // // // // // // // //     };

// // // // // // // // // // // // // // // // //     // Remove a selected file
// // // // // // // // // // // // // // // // //     const removeFile = (index) => {
// // // // // // // // // // // // // // // // //         setSelectedFiles((prevFiles) => prevFiles.filter((_, i) => i !== index));
// // // // // // // // // // // // // // // // //         setUploadingFiles((prevUploads) => prevUploads.filter((_, i) => i !== index)); // Hapus status upload yang sesuai
// // // // // // // // // // // // // // // // //     };

// // // // // // // // // // // // // // // // //     // Function to send a new message
// // // // // // // // // // // // // // // // //     const sendMessage = async () => {
// // // // // // // // // // // // // // // // //         if (messageText.trim() === "" && selectedFiles.length === 0) return; // Prevent sending empty messages

// // // // // // // // // // // // // // // // //         const messagesRef = ref(database, `messages/${user.id}/${otherUser.id}`);
// // // // // // // // // // // // // // // // //         const newMessage = {
// // // // // // // // // // // // // // // // //             text: messageText,
// // // // // // // // // // // // // // // // //             sender: user.id,
// // // // // // // // // // // // // // // // //             timestamp: Date.now(),
// // // // // // // // // // // // // // // // //             read: false,
// // // // // // // // // // // // // // // // //             files: [],
// // // // // // // // // // // // // // // // //         };

// // // // // // // // // // // // // // // // //         // Update newMessage with uploaded file URLs
// // // // // // // // // // // // // // // // //         if (selectedFiles.length > 0) {
// // // // // // // // // // // // // // // // //             setIsUploading(true); // Set uploading status to true
// // // // // // // // // // // // // // // // //             const uploadedFiles = await Promise.all(selectedFiles.map(async (file) => {
// // // // // // // // // // // // // // // // //                 const storageRef = ref(storage, `chatFiles/${file.name}`);
// // // // // // // // // // // // // // // // //                 await uploadBytes(storageRef, file);
// // // // // // // // // // // // // // // // //                 const url = await getDownloadURL(storageRef);
// // // // // // // // // // // // // // // // //                 return url;
// // // // // // // // // // // // // // // // //             }));
// // // // // // // // // // // // // // // // //             newMessage.files = uploadedFiles;
// // // // // // // // // // // // // // // // //             setIsUploading(false); // Reset uploading status
// // // // // // // // // // // // // // // // //             setSelectedFiles([]); // Clear selected files after upload
// // // // // // // // // // // // // // // // //         }

// // // // // // // // // // // // // // // // //         // Push message to Firebase Database
// // // // // // // // // // // // // // // // //         await push(messagesRef, newMessage);
// // // // // // // // // // // // // // // // //         setMessageText(''); // Clear input after sending

// // // // // // // // // // // // // // // // //         // Update the recipient's message status
// // // // // // // // // // // // // // // // //         const recipientRef = ref(database, `messages/${otherUser.id}/${user.id}`);
// // // // // // // // // // // // // // // // //         await push(recipientRef, newMessage);
// // // // // // // // // // // // // // // // //     };

// // // // // // // // // // // // // // // // //     // Handle message edit
// // // // // // // // // // // // // // // // //     const handleEditMessage = async (id) => {
// // // // // // // // // // // // // // // // //         const messageToEdit = messages.find((msg) => msg.id === id);
// // // // // // // // // // // // // // // // //         setMessageText(messageToEdit.text);
// // // // // // // // // // // // // // // // //         setEditingMessageId(id);
// // // // // // // // // // // // // // // // //     };

// // // // // // // // // // // // // // // // //     // Function to update the edited message
// // // // // // // // // // // // // // // // //     const updateMessage = async () => {
// // // // // // // // // // // // // // // // //         if (editingMessageId) {
// // // // // // // // // // // // // // // // //             const messageRef = ref(database, `messages/${user.id}/${otherUser.id}/${editingMessageId}`);
// // // // // // // // // // // // // // // // //             await update(messageRef, { text: messageText });
// // // // // // // // // // // // // // // // //             setMessageText(''); // Clear input after updating
// // // // // // // // // // // // // // // // //             setEditingMessageId(null); // Reset editing state
// // // // // // // // // // // // // // // // //         }
// // // // // // // // // // // // // // // // //     };

// // // // // // // // // // // // // // // // //     // Function to delete a message
// // // // // // // // // // // // // // // // //     const deleteMessage = async (id) => {
// // // // // // // // // // // // // // // // //         const messageRef = ref(database, `messages/${user.id}/${otherUser.id}/${id}`);
// // // // // // // // // // // // // // // // //         await remove(messageRef);
// // // // // // // // // // // // // // // // //     };

// // // // // // // // // // // // // // // // //     const renderMedia = (files) => {
// // // // // // // // // // // // // // // // //         if (!files || files.length === 0) return null;

// // // // // // // // // // // // // // // // //         const visibleFiles = files.slice(0, 3);
// // // // // // // // // // // // // // // // //         const extraFiles = files.length - visibleFiles.length;

// // // // // // // // // // // // // // // // //         return (
// // // // // // // // // // // // // // // // //             <div className="flex flex-wrap mt-1">
// // // // // // // // // // // // // // // // //                 {visibleFiles.map((file, index) => (
// // // // // // // // // // // // // // // // //                     <img
// // // // // // // // // // // // // // // // //                         key={index}
// // // // // // // // // // // // // // // // //                         src={file}
// // // // // // // // // // // // // // // // //                         alt="Media"
// // // // // // // // // // // // // // // // //                         className="w-20 h-20 object-cover rounded-lg m-1"
// // // // // // // // // // // // // // // // //                     />
// // // // // // // // // // // // // // // // //                 ))}
// // // // // // // // // // // // // // // // //                 {extraFiles > 0 && (
// // // // // // // // // // // // // // // // //                     <div className="w-20 h-20 bg-gray-200 flex items-center justify-center rounded-lg m-1">
// // // // // // // // // // // // // // // // //                         +{extraFiles}
// // // // // // // // // // // // // // // // //                     </div>
// // // // // // // // // // // // // // // // //                 )}
// // // // // // // // // // // // // // // // //             </div>
// // // // // // // // // // // // // // // // //         );
// // // // // // // // // // // // // // // // //     };

// // // // // // // // // // // // // // // // //     return (
// // // // // // // // // // // // // // // // //         <div className="flex flex-col h-screen bg-gray-100">
// // // // // // // // // // // // // // // // //             <div className="flex-none p-4 bg-white border-b border-gray-300">
// // // // // // // // // // // // // // // // //                 <h2 className="text-xl text-center">{otherUser.name}</h2>
// // // // // // // // // // // // // // // // //                 {lastSeen && (
// // // // // // // // // // // // // // // // //                     <p className="text-sm text-gray-500 text-center">
// // // // // // // // // // // // // // // // //                         {lastSeen.status} (Last seen: {new Date(lastSeen.timestamp).toLocaleString()})
// // // // // // // // // // // // // // // // //                     </p>
// // // // // // // // // // // // // // // // //                 )}
// // // // // // // // // // // // // // // // //             </div>
// // // // // // // // // // // // // // // // //             <div className="flex-1 overflow-y-auto p-4">
// // // // // // // // // // // // // // // // //                 {/* Display messages */}
// // // // // // // // // // // // // // // // //                 {messages.map((msg, index) => (
// // // // // // // // // // // // // // // // //                     <div key={index} className={`mb-2 ${msg.sender === user.id ? 'text-right' : 'text-left'}`}>
// // // // // // // // // // // // // // // // //                         <div 
// // // // // // // // // // // // // // // // //                             className={`inline-block p-2 rounded-lg ${msg.sender === user.id ? 'bg-blue-500 text-white' : 'bg-gray-300'}`}
// // // // // // // // // // // // // // // // //                             onContextMenu={(e) => {
// // // // // // // // // // // // // // // // //                                 e.preventDefault();
// // // // // // // // // // // // // // // // //                                 if (msg.sender === user.id) {
// // // // // // // // // // // // // // // // //                                     handleEditMessage(msg.id); // Enable editing for the message
// // // // // // // // // // // // // // // // //                                 } else {
// // // // // // // // // // // // // // // // //                                     deleteMessage(msg.id); // Delete message for others
// // // // // // // // // // // // // // // // //                                 }
// // // // // // // // // // // // // // // // //                             }}
// // // // // // // // // // // // // // // // //                         >
// // // // // // // // // // // // // // // // //                             {msg.text}
// // // // // // // // // // // // // // // // //                             {renderMedia(msg.files)}
// // // // // // // // // // // // // // // // //                         </div>
// // // // // // // // // // // // // // // // //                         <div className="text-xs text-gray-500 flex justify-end items-center">
// // // // // // // // // // // // // // // // //                             {new Date(msg.timestamp).toLocaleTimeString()}
// // // // // // // // // // // // // // // // //                             {msg.sender === user.id && (
// // // // // // // // // // // // // // // // //                                 <span className="ml-2">
// // // // // // // // // // // // // // // // //                                     {msg.read ? (
// // // // // // // // // // // // // // // // //                                         <span className="text-blue-500">✔✔</span>
// // // // // // // // // // // // // // // // //                                     ) : (
// // // // // // // // // // // // // // // // //                                         <span>✔</span>
// // // // // // // // // // // // // // // // //                                     )}
// // // // // // // // // // // // // // // // //                                 </span>
// // // // // // // // // // // // // // // // //                             )}
// // // // // // // // // // // // // // // // //                             {msg.sender !== user.id && (
// // // // // // // // // // // // // // // // //                                 <span className="ml-2">
// // // // // // // // // // // // // // // // //                                     {msg.read ? (
// // // // // // // // // // // // // // // // //                                         <span className="text-blue-500">✔✔</span>
// // // // // // // // // // // // // // // // //                                     ) : (
// // // // // // // // // // // // // // // // //                                         <span>✔✔</span>
// // // // // // // // // // // // // // // // //                                     )}
// // // // // // // // // // // // // // // // //                                 </span>
// // // // // // // // // // // // // // // // //                             )}
// // // // // // // // // // // // // // // // //                         </div>
// // // // // // // // // // // // // // // // //                     </div>
// // // // // // // // // // // // // // // // //                 ))}
// // // // // // // // // // // // // // // // //             </div>
// // // // // // // // // // // // // // // // //             <div className="flex-none p-4 border-t border-gray-300 flex items-center">
// // // // // // // // // // // // // // // // //                 <input
// // // // // // // // // // // // // // // // //                     type="file"
// // // // // // // // // // // // // // // // //                     accept="image/*,video/*"
// // // // // // // // // // // // // // // // //                     onChange={handleFileChange}
// // // // // // // // // // // // // // // // //                     className="hidden"
// // // // // // // // // // // // // // // // //                     id="file-input"
// // // // // // // // // // // // // // // // //                     multiple
// // // // // // // // // // // // // // // // //                 />
// // // // // // // // // // // // // // // // //                <label htmlFor="file-input" className="mr-2 cursor-pointer">
// // // // // // // // // // // // // // // // //                         <span className="text-gray-600 hover:text-blue-500">📎</span>
// // // // // // // // // // // // // // // // //                     </label>
// // // // // // // // // // // // // // // // //                 <input
// // // // // // // // // // // // // // // // //                     type="text"
// // // // // // // // // // // // // // // // //                     value={messageText}
// // // // // // // // // // // // // // // // //                     onChange={(e) => {
// // // // // // // // // // // // // // // // //                         setMessageText(e.target.value);
// // // // // // // // // // // // // // // // //                         setIsTyping(true); // Set typing status to true
// // // // // // // // // // // // // // // // //                     }}
// // // // // // // // // // // // // // // // //                     placeholder="Type a message..."
// // // // // // // // // // // // // // // // //                     className="flex-1 p-2 border border-gray-300 rounded-lg mx-2"
// // // // // // // // // // // // // // // // //                 />
// // // // // // // // // // // // // // // // //                 <button
// // // // // // // // // // // // // // // // //                     onClick={editingMessageId ? updateMessage : sendMessage}
// // // // // // // // // // // // // // // // //                     className="bg-blue-500 text-white rounded-lg px-4 py-2"
// // // // // // // // // // // // // // // // //                 >
// // // // // // // // // // // // // // // // //                     {editingMessageId ? 'Update' : 'Send'}
// // // // // // // // // // // // // // // // //                 </button>
// // // // // // // // // // // // // // // // //             </div>
// // // // // // // // // // // // // // // // //         </div>
// // // // // // // // // // // // // // // // //     );
// // // // // // // // // // // // // // // // // };

// // // // // // // // // // // // // // // // // export default Chat;

// // // // // // // // // // // // // // // // "use client"; // Enable client-side rendering
// // // // // // // // // // // // // // // // import React, { useState, useEffect } from 'react';
// // // // // // // // // // // // // // // // import { database, storage } from '../config/firebase'; // Pastikan Anda sudah mengkonfigurasi Firebase Storage
// // // // // // // // // // // // // // // // import { ref, onValue, push, update, remove } from 'firebase/database';
// // // // // // // // // // // // // // // // import { uploadBytes, getDownloadURL } from 'firebase/storage';
// // // // // // // // // // // // // // // // import 'tailwindcss/tailwind.css';

// // // // // // // // // // // // // // // // const Chat = ({ user }) => {
// // // // // // // // // // // // // // // //     const otherUser = user.id === 'user1' ? { id: 'user2', name: 'User 2' } : { id: 'user1', name: 'User 1' };

// // // // // // // // // // // // // // // //     const [messages, setMessages] = useState([]);
// // // // // // // // // // // // // // // //     const [messageText, setMessageText] = useState('');
// // // // // // // // // // // // // // // //     const [selectedFiles, setSelectedFiles] = useState([]);
// // // // // // // // // // // // // // // //     const [uploadingFiles, setUploadingFiles] = useState([]); // State untuk menyimpan status upload file
// // // // // // // // // // // // // // // //     const [lastSeen, setLastSeen] = useState(null); // State untuk menyimpan waktu terakhir dilihat
// // // // // // // // // // // // // // // //     const [editingMessageId, setEditingMessageId] = useState(null); // State untuk menyimpan ID pesan yang sedang diedit
// // // // // // // // // // // // // // // //     const [isTyping, setIsTyping] = useState(false); // State untuk menyimpan status mengetik

// // // // // // // // // // // // // // // //     // Fetch messages from Firebase on component mount
// // // // // // // // // // // // // // // //     useEffect(() => {
// // // // // // // // // // // // // // // //         const messagesRef = ref(database, `messages/${user.id}/${otherUser.id}`);
// // // // // // // // // // // // // // // //         onValue(messagesRef, (snapshot) => {
// // // // // // // // // // // // // // // //             const data = snapshot.val();
// // // // // // // // // // // // // // // //             const loadedMessages = data ? Object.values(data) : [];
// // // // // // // // // // // // // // // //             setMessages(loadedMessages);

// // // // // // // // // // // // // // // //             // Mark all messages as read when the user views the chat
// // // // // // // // // // // // // // // //             loadedMessages.forEach((msg) => {
// // // // // // // // // // // // // // // //                 if (!msg.read && msg.sender !== user.id) {
// // // // // // // // // // // // // // // //                     update(ref(database, `messages/${user.id}/${otherUser.id}/${msg.id}`), { read: true });
// // // // // // // // // // // // // // // //                     update(ref(database, `messages/${otherUser.id}/${user.id}/${msg.id}`), { read: true });
// // // // // // // // // // // // // // // //                 }
// // // // // // // // // // // // // // // //             });
// // // // // // // // // // // // // // // //         });

// // // // // // // // // // // // // // // //         // Set last seen status
// // // // // // // // // // // // // // // //         const lastSeenRef = ref(database, `lastSeen/${user.id}`);
// // // // // // // // // // // // // // // //         onValue(lastSeenRef, (snapshot) => {
// // // // // // // // // // // // // // // //             setLastSeen(snapshot.val());
// // // // // // // // // // // // // // // //         });

// // // // // // // // // // // // // // // //         // Update last seen when user is active
// // // // // // // // // // // // // // // //         const updateLastSeen = () => {
// // // // // // // // // // // // // // // //             if (isTyping) {
// // // // // // // // // // // // // // // //                 update(lastSeenRef, { status: "Online", timestamp: Date.now() });
// // // // // // // // // // // // // // // //             } else {
// // // // // // // // // // // // // // // //                 update(lastSeenRef, { status: "Last Seen", timestamp: Date.now() });
// // // // // // // // // // // // // // // //             }
// // // // // // // // // // // // // // // //         };

// // // // // // // // // // // // // // // //         // Check typing status
// // // // // // // // // // // // // // // //         const typingInterval = setInterval(updateLastSeen, 5000); // Update every 5 seconds

// // // // // // // // // // // // // // // //         return () => clearInterval(typingInterval); // Clean up interval on unmount
// // // // // // // // // // // // // // // //     }, [user.id, otherUser.id, isTyping]);

// // // // // // // // // // // // // // // //     // Handle file selection
// // // // // // // // // // // // // // // //     const handleFileChange = (event) => {
// // // // // // // // // // // // // // // //         const files = Array.from(event.target.files);
// // // // // // // // // // // // // // // //         setSelectedFiles((prevFiles) => [...prevFiles, ...files]);
// // // // // // // // // // // // // // // //     };

// // // // // // // // // // // // // // // //     // Remove a selected file
// // // // // // // // // // // // // // // //     const removeFile = (index) => {
// // // // // // // // // // // // // // // //         setSelectedFiles((prevFiles) => prevFiles.filter((_, i) => i !== index));
// // // // // // // // // // // // // // // //         setUploadingFiles((prevUploads) => prevUploads.filter((_, i) => i !== index)); // Hapus status upload yang sesuai
// // // // // // // // // // // // // // // //     };

// // // // // // // // // // // // // // // //     // Function to send a new message
// // // // // // // // // // // // // // // //     const sendMessage = async () => {
// // // // // // // // // // // // // // // //         if (messageText.trim() === "" && selectedFiles.length === 0) return; // Prevent sending empty messages

// // // // // // // // // // // // // // // //         const messagesRef = ref(database, `messages/${user.id}/${otherUser.id}`);
// // // // // // // // // // // // // // // //         const newMessage = {
// // // // // // // // // // // // // // // //             text: messageText,
// // // // // // // // // // // // // // // //             sender: user.id,
// // // // // // // // // // // // // // // //             timestamp: Date.now(),
// // // // // // // // // // // // // // // //             read: false,
// // // // // // // // // // // // // // // //             files: [],
// // // // // // // // // // // // // // // //         };

// // // // // // // // // // // // // // // //         // Update the state to show loading for each file
// // // // // // // // // // // // // // // //         const loadingStatus = Array(selectedFiles.length).fill(true);
// // // // // // // // // // // // // // // //         setUploadingFiles(loadingStatus);

// // // // // // // // // // // // // // // //         // Upload selected files to Firebase Storage
// // // // // // // // // // // // // // // //         const uploadedFiles = await Promise.all(selectedFiles.map(async (file, index) => {
// // // // // // // // // // // // // // // //             const storageRef = ref(storage, `chatFiles/${file.name}`);
// // // // // // // // // // // // // // // //             await uploadBytes(storageRef, file);
// // // // // // // // // // // // // // // //             const url = await getDownloadURL(storageRef);
// // // // // // // // // // // // // // // //             // Update the loading status for the uploaded file
// // // // // // // // // // // // // // // //             loadingStatus[index] = false;
// // // // // // // // // // // // // // // //             setUploadingFiles([...loadingStatus]); // Update loading state
// // // // // // // // // // // // // // // //             return url;
// // // // // // // // // // // // // // // //         }));

// // // // // // // // // // // // // // // //         // Update newMessage with uploaded file URLs
// // // // // // // // // // // // // // // //         newMessage.files = uploadedFiles;

// // // // // // // // // // // // // // // //         // Push message to Firebase Database
// // // // // // // // // // // // // // // //         await push(messagesRef, newMessage);
// // // // // // // // // // // // // // // //         setMessageText(''); // Clear input after sending
// // // // // // // // // // // // // // // //         setSelectedFiles([]); // Clear selected files
// // // // // // // // // // // // // // // //         setUploadingFiles([]); // Clear uploading status

// // // // // // // // // // // // // // // //         // Update the recipient's message status
// // // // // // // // // // // // // // // //         const recipientRef = ref(database, `messages/${otherUser.id}/${user.id}`);
// // // // // // // // // // // // // // // //         await push(recipientRef, newMessage);
// // // // // // // // // // // // // // // //     };

// // // // // // // // // // // // // // // //     // Handle message edit
// // // // // // // // // // // // // // // //     const handleEditMessage = async (id) => {
// // // // // // // // // // // // // // // //         const messageToEdit = messages.find((msg) => msg.id === id);
// // // // // // // // // // // // // // // //         setMessageText(messageToEdit.text);
// // // // // // // // // // // // // // // //         setEditingMessageId(id);
// // // // // // // // // // // // // // // //     };

// // // // // // // // // // // // // // // //     // Function to update the edited message
// // // // // // // // // // // // // // // //     const updateMessage = async () => {
// // // // // // // // // // // // // // // //         if (editingMessageId) {
// // // // // // // // // // // // // // // //             const messageRef = ref(database, `messages/${user.id}/${otherUser.id}/${editingMessageId}`);
// // // // // // // // // // // // // // // //             await update(messageRef, { text: messageText });
// // // // // // // // // // // // // // // //             setMessageText(''); // Clear input after updating
// // // // // // // // // // // // // // // //             setEditingMessageId(null); // Reset editing state
// // // // // // // // // // // // // // // //         }
// // // // // // // // // // // // // // // //     };

// // // // // // // // // // // // // // // //     // Function to delete a message
// // // // // // // // // // // // // // // //     const deleteMessage = async (id) => {
// // // // // // // // // // // // // // // //         const messageRef = ref(database, `messages/${user.id}/${otherUser.id}/${id}`);
// // // // // // // // // // // // // // // //         await remove(messageRef);
// // // // // // // // // // // // // // // //     };

// // // // // // // // // // // // // // // //     const renderMedia = (files) => {
// // // // // // // // // // // // // // // //         if (!files || files.length === 0) return null;

// // // // // // // // // // // // // // // //         const visibleFiles = files.slice(0, 3);
// // // // // // // // // // // // // // // //         const extraFiles = files.length - visibleFiles.length;

// // // // // // // // // // // // // // // //         return (
// // // // // // // // // // // // // // // //             <div className="flex flex-wrap mt-1">
// // // // // // // // // // // // // // // //                 {visibleFiles.map((file, index) => (
// // // // // // // // // // // // // // // //                     <img
// // // // // // // // // // // // // // // //                         key={index}
// // // // // // // // // // // // // // // //                         src={file}
// // // // // // // // // // // // // // // //                         alt="Media"
// // // // // // // // // // // // // // // //                         className="w-20 h-20 object-cover rounded-lg m-1"
// // // // // // // // // // // // // // // //                     />
// // // // // // // // // // // // // // // //                 ))}
// // // // // // // // // // // // // // // //                 {extraFiles > 0 && (
// // // // // // // // // // // // // // // //                     <div className="w-20 h-20 bg-gray-200 flex items-center justify-center rounded-lg m-1">
// // // // // // // // // // // // // // // //                         +{extraFiles}
// // // // // // // // // // // // // // // //                     </div>
// // // // // // // // // // // // // // // //                 )}
// // // // // // // // // // // // // // // //             </div>
// // // // // // // // // // // // // // // //         );
// // // // // // // // // // // // // // // //     };

// // // // // // // // // // // // // // // //     return (
// // // // // // // // // // // // // // // //         <div className="flex flex-col h-screen bg-gray-100">
// // // // // // // // // // // // // // // //             <div className="flex-none p-4 bg-white border-b border-gray-300">
// // // // // // // // // // // // // // // //                 <h2 className="text-xl text-center">{otherUser.name}</h2>
// // // // // // // // // // // // // // // //                 {lastSeen && (
// // // // // // // // // // // // // // // //                     <p className="text-sm text-gray-500 text-center">
// // // // // // // // // // // // // // // //                         {lastSeen.status} (Last seen: {new Date(lastSeen.timestamp).toLocaleString()})
// // // // // // // // // // // // // // // //                     </p>
// // // // // // // // // // // // // // // //                 )}
// // // // // // // // // // // // // // // //             </div>
// // // // // // // // // // // // // // // //             <div className="flex-1 overflow-y-auto p-4">
// // // // // // // // // // // // // // // //                 {/* Display messages */}
// // // // // // // // // // // // // // // //                 {messages.map((msg, index) => (
// // // // // // // // // // // // // // // //                     <div key={index} className={`mb-2 ${msg.sender === user.id ? 'text-right' : 'text-left'}`}>
// // // // // // // // // // // // // // // //                         <div 
// // // // // // // // // // // // // // // //                             className={`inline-block p-2 rounded-lg ${msg.sender === user.id ? 'bg-blue-500 text-white' : 'bg-gray-300'}`}
// // // // // // // // // // // // // // // //                             onContextMenu={(e) => {
// // // // // // // // // // // // // // // //                                 e.preventDefault();
// // // // // // // // // // // // // // // //                                 if (msg.sender === user.id) {
// // // // // // // // // // // // // // // //                                     handleEditMessage(msg.id); // Enable editing for the message
// // // // // // // // // // // // // // // //                                 } else {
// // // // // // // // // // // // // // // //                                     deleteMessage(msg.id); // Delete message for others
// // // // // // // // // // // // // // // //                                 }
// // // // // // // // // // // // // // // //                             }}
// // // // // // // // // // // // // // // //                         >
// // // // // // // // // // // // // // // //                             {msg.text}
// // // // // // // // // // // // // // // //                             {renderMedia(msg.files)}
// // // // // // // // // // // // // // // //                         </div>
// // // // // // // // // // // // // // // //                         <div className="text-xs text-gray-500 flex justify-end items-center">
// // // // // // // // // // // // // // // //                             {new Date(msg.timestamp).toLocaleTimeString()}
// // // // // // // // // // // // // // // //                             {msg.sender === user.id && (
// // // // // // // // // // // // // // // //                                 <span className="ml-2">
// // // // // // // // // // // // // // // //                                     {msg.read ? (
// // // // // // // // // // // // // // // //                                         <span className="text-blue-500">✔✔</span>
// // // // // // // // // // // // // // // //                                     ) : (
// // // // // // // // // // // // // // // //                                         <span>✔</span>
// // // // // // // // // // // // // // // //                                     )}
// // // // // // // // // // // // // // // //                                 </span>
// // // // // // // // // // // // // // // //                             )}
// // // // // // // // // // // // // // // //                             {msg.sender !== user.id && (
// // // // // // // // // // // // // // // //                                 <span className="ml-2">
// // // // // // // // // // // // // // // //                                     {msg.read ? (
// // // // // // // // // // // // // // // //                                         <span className="text-blue-500">✔✔</span>
// // // // // // // // // // // // // // // //                                     ) : (
// // // // // // // // // // // // // // // //                                         <span>✔✔</span>
// // // // // // // // // // // // // // // //                                     )}
// // // // // // // // // // // // // // // //                                 </span>
// // // // // // // // // // // // // // // //                             )}
// // // // // // // // // // // // // // // //                         </div>
// // // // // // // // // // // // // // // //                     </div>
// // // // // // // // // // // // // // // //                 ))}
// // // // // // // // // // // // // // // //             </div>
// // // // // // // // // // // // // // // //             <div className="flex-none p-4 border-t border-gray-300 flex items-center">
// // // // // // // // // // // // // // // //                 <input
// // // // // // // // // // // // // // // //                     type="file"
// // // // // // // // // // // // // // // //                     accept="image/*,video/*"
// // // // // // // // // // // // // // // //                     onChange={handleFileChange}
// // // // // // // // // // // // // // // //                     className="hidden"
// // // // // // // // // // // // // // // //                     id="file-input"
// // // // // // // // // // // // // // // //                     multiple
// // // // // // // // // // // // // // // //                 />
// // // // // // // // // // // // // // // //                 <label htmlFor="file-input" className="mr-2 cursor-pointer">
// // // // // // // // // // // // // // // //                         <span className="text-gray-600 hover:text-blue-500">📎</span>
// // // // // // // // // // // // // // // //                     </label>
// // // // // // // // // // // // // // // //                 <input
// // // // // // // // // // // // // // // //                     type="text"
// // // // // // // // // // // // // // // //                     value={messageText}
// // // // // // // // // // // // // // // //                     onChange={(e) => {
// // // // // // // // // // // // // // // //                         setMessageText(e.target.value);
// // // // // // // // // // // // // // // //                         setIsTyping(true); // Set typing status to true
// // // // // // // // // // // // // // // //                     }}
// // // // // // // // // // // // // // // //                     placeholder="Type a message..."
// // // // // // // // // // // // // // // //                     className="flex-1 p-2 border border-gray-300 rounded-lg mx-2"
// // // // // // // // // // // // // // // //                 />
// // // // // // // // // // // // // // // //                 <button
// // // // // // // // // // // // // // // //                     onClick={editingMessageId ? updateMessage : sendMessage}
// // // // // // // // // // // // // // // //                     className="bg-blue-500 text-white rounded-lg px-4 py-2"
// // // // // // // // // // // // // // // //                 >
// // // // // // // // // // // // // // // //                     {editingMessageId ? 'Update' : 'Send'}
// // // // // // // // // // // // // // // //                 </button>
// // // // // // // // // // // // // // // //             </div>
// // // // // // // // // // // // // // // //         </div>
// // // // // // // // // // // // // // // //     );
// // // // // // // // // // // // // // // // };

// // // // // // // // // // // // // // // // export default Chat;
// // // // // // // // // // // // // // // // // // // "use client"; // Enable client-side rendering
// // // // // // // // // // // // // // // // // // // import React, { useState, useEffect } from 'react';
// // // // // // // // // // // // // // // // // // // import { database, storage } from '../config/firebase'; // Pastikan Anda sudah mengkonfigurasi Firebase Storage
// // // // // // // // // // // // // // // // // // // import { ref, onValue, push, update, remove } from 'firebase/database';
// // // // // // // // // // // // // // // // // // // import { uploadBytes, getDownloadURL } from 'firebase/storage';
// // // // // // // // // // // // // // // // // // // import 'tailwindcss/tailwind.css';

// // // // // // // // // // // // // // // // // // // const Chat = ({ user }) => {
// // // // // // // // // // // // // // // // // // //     const otherUser = user.id === 'user1' ? { id: 'user2', name: 'User 2' } : { id: 'user1', name: 'User 1' };

// // // // // // // // // // // // // // // // // // //     const [messages, setMessages] = useState([]);
// // // // // // // // // // // // // // // // // // //     const [messageText, setMessageText] = useState('');
// // // // // // // // // // // // // // // // // // //     const [selectedFiles, setSelectedFiles] = useState([]);
// // // // // // // // // // // // // // // // // // //     const [uploadingFiles, setUploadingFiles] = useState([]); // State untuk menyimpan status upload file
// // // // // // // // // // // // // // // // // // //     const [lastSeen, setLastSeen] = useState(null); // State untuk menyimpan waktu terakhir dilihat
// // // // // // // // // // // // // // // // // // //     const [editingMessageId, setEditingMessageId] = useState(null); // State untuk menyimpan ID pesan yang sedang diedit

// // // // // // // // // // // // // // // // // // //     // Fetch messages from Firebase on component mount
// // // // // // // // // // // // // // // // // // //     useEffect(() => {
// // // // // // // // // // // // // // // // // // //         const messagesRef = ref(database, `messages/${user.id}/${otherUser.id}`);
// // // // // // // // // // // // // // // // // // //         onValue(messagesRef, (snapshot) => {
// // // // // // // // // // // // // // // // // // //             const data = snapshot.val();
// // // // // // // // // // // // // // // // // // //             const loadedMessages = data ? Object.values(data) : [];
// // // // // // // // // // // // // // // // // // //             setMessages(loadedMessages);

// // // // // // // // // // // // // // // // // // //             // Mark all messages as read when the user views the chat
// // // // // // // // // // // // // // // // // // //             loadedMessages.forEach((msg) => {
// // // // // // // // // // // // // // // // // // //                 if (!msg.read && msg.sender !== user.id) {
// // // // // // // // // // // // // // // // // // //                     update(ref(database, `messages/${user.id}/${otherUser.id}/${msg.id}`), { read: true });
// // // // // // // // // // // // // // // // // // //                     update(ref(database, `messages/${otherUser.id}/${user.id}/${msg.id}`), { read: true });
// // // // // // // // // // // // // // // // // // //                 }
// // // // // // // // // // // // // // // // // // //             });
// // // // // // // // // // // // // // // // // // //         });

// // // // // // // // // // // // // // // // // // //         // Set last seen status
// // // // // // // // // // // // // // // // // // //         const lastSeenRef = ref(database, `lastSeen/${user.id}`);
// // // // // // // // // // // // // // // // // // //         onValue(lastSeenRef, (snapshot) => {
// // // // // // // // // // // // // // // // // // //             setLastSeen(snapshot.val());
// // // // // // // // // // // // // // // // // // //         });

// // // // // // // // // // // // // // // // // // //         // Update last seen when user is active
// // // // // // // // // // // // // // // // // // //         update(lastSeenRef, { timestamp: Date.now() });
// // // // // // // // // // // // // // // // // // //     }, [user.id, otherUser.id]);

// // // // // // // // // // // // // // // // // // //     // Handle file selection
// // // // // // // // // // // // // // // // // // //     const handleFileChange = (event) => {
// // // // // // // // // // // // // // // // // // //         const files = Array.from(event.target.files);
// // // // // // // // // // // // // // // // // // //         setSelectedFiles((prevFiles) => [...prevFiles, ...files]);
// // // // // // // // // // // // // // // // // // //     };

// // // // // // // // // // // // // // // // // // //     // Remove a selected file
// // // // // // // // // // // // // // // // // // //     const removeFile = (index) => {
// // // // // // // // // // // // // // // // // // //         setSelectedFiles((prevFiles) => prevFiles.filter((_, i) => i !== index));
// // // // // // // // // // // // // // // // // // //         setUploadingFiles((prevUploads) => prevUploads.filter((_, i) => i !== index)); // Hapus status upload yang sesuai
// // // // // // // // // // // // // // // // // // //     };

// // // // // // // // // // // // // // // // // // //     // Function to send a new message
// // // // // // // // // // // // // // // // // // //     const sendMessage = async () => {
// // // // // // // // // // // // // // // // // // //         if (messageText.trim() === "" && selectedFiles.length === 0) return; // Prevent sending empty messages

// // // // // // // // // // // // // // // // // // //         const messagesRef = ref(database, `messages/${user.id}/${otherUser.id}`);
// // // // // // // // // // // // // // // // // // //         const newMessage = {
// // // // // // // // // // // // // // // // // // //             text: messageText,
// // // // // // // // // // // // // // // // // // //             sender: user.id,
// // // // // // // // // // // // // // // // // // //             timestamp: Date.now(),
// // // // // // // // // // // // // // // // // // //             read: false,
// // // // // // // // // // // // // // // // // // //             files: [],
// // // // // // // // // // // // // // // // // // //         };

// // // // // // // // // // // // // // // // // // //         // Update the state to show loading for each file
// // // // // // // // // // // // // // // // // // //         const loadingStatus = Array(selectedFiles.length).fill(true);
// // // // // // // // // // // // // // // // // // //         setUploadingFiles(loadingStatus);

// // // // // // // // // // // // // // // // // // //         // Upload selected files to Firebase Storage
// // // // // // // // // // // // // // // // // // //         const uploadedFiles = await Promise.all(selectedFiles.map(async (file, index) => {
// // // // // // // // // // // // // // // // // // //             const storageRef = ref(storage, `chatFiles/${file.name}`);
// // // // // // // // // // // // // // // // // // //             await uploadBytes(storageRef, file);
// // // // // // // // // // // // // // // // // // //             const url = await getDownloadURL(storageRef);
// // // // // // // // // // // // // // // // // // //             // Update the loading status for the uploaded file
// // // // // // // // // // // // // // // // // // //             loadingStatus[index] = false;
// // // // // // // // // // // // // // // // // // //             setUploadingFiles([...loadingStatus]); // Update loading state
// // // // // // // // // // // // // // // // // // //             return url;
// // // // // // // // // // // // // // // // // // //         }));

// // // // // // // // // // // // // // // // // // //         // Update newMessage with uploaded file URLs
// // // // // // // // // // // // // // // // // // //         newMessage.files = uploadedFiles;

// // // // // // // // // // // // // // // // // // //         // Push message to Firebase Database
// // // // // // // // // // // // // // // // // // //         await push(messagesRef, newMessage);
// // // // // // // // // // // // // // // // // // //         setMessageText(''); // Clear input after sending
// // // // // // // // // // // // // // // // // // //         setSelectedFiles([]); // Clear selected files
// // // // // // // // // // // // // // // // // // //         setUploadingFiles([]); // Clear uploading status

// // // // // // // // // // // // // // // // // // //         // Update the recipient's message status
// // // // // // // // // // // // // // // // // // //         const recipientRef = ref(database, `messages/${otherUser.id}/${user.id}`);
// // // // // // // // // // // // // // // // // // //         await push(recipientRef, newMessage);
// // // // // // // // // // // // // // // // // // //     };

// // // // // // // // // // // // // // // // // // //     // Handle message edit
// // // // // // // // // // // // // // // // // // //     const handleEditMessage = async (id) => {
// // // // // // // // // // // // // // // // // // //         const messageToEdit = messages.find((msg) => msg.id === id);
// // // // // // // // // // // // // // // // // // //         setMessageText(messageToEdit.text);
// // // // // // // // // // // // // // // // // // //         setEditingMessageId(id);
// // // // // // // // // // // // // // // // // // //     };

// // // // // // // // // // // // // // // // // // //     // Function to update the edited message
// // // // // // // // // // // // // // // // // // //     const updateMessage = async () => {
// // // // // // // // // // // // // // // // // // //         if (editingMessageId) {
// // // // // // // // // // // // // // // // // // //             const messageRef = ref(database, `messages/${user.id}/${otherUser.id}/${editingMessageId}`);
// // // // // // // // // // // // // // // // // // //             await update(messageRef, { text: messageText });
// // // // // // // // // // // // // // // // // // //             setMessageText(''); // Clear input after updating
// // // // // // // // // // // // // // // // // // //             setEditingMessageId(null); // Reset editing state
// // // // // // // // // // // // // // // // // // //         }
// // // // // // // // // // // // // // // // // // //     };

// // // // // // // // // // // // // // // // // // //     // Function to delete a message
// // // // // // // // // // // // // // // // // // //     const deleteMessage = async (id) => {
// // // // // // // // // // // // // // // // // // //         const messageRef = ref(database, `messages/${user.id}/${otherUser.id}/${id}`);
// // // // // // // // // // // // // // // // // // //         await remove(messageRef);
// // // // // // // // // // // // // // // // // // //     };

// // // // // // // // // // // // // // // // // // //     const renderMedia = (files) => {
// // // // // // // // // // // // // // // // // // //         if (!files || files.length === 0) return null;

// // // // // // // // // // // // // // // // // // //         const visibleFiles = files.slice(0, 3);
// // // // // // // // // // // // // // // // // // //         const extraFiles = files.length - visibleFiles.length;

// // // // // // // // // // // // // // // // // // //         return (
// // // // // // // // // // // // // // // // // // //             <div className="flex flex-wrap mt-1">
// // // // // // // // // // // // // // // // // // //                 {visibleFiles.map((file, index) => (
// // // // // // // // // // // // // // // // // // //                     <img
// // // // // // // // // // // // // // // // // // //                         key={index}
// // // // // // // // // // // // // // // // // // //                         src={file}
// // // // // // // // // // // // // // // // // // //                         alt="Media"
// // // // // // // // // // // // // // // // // // //                         className="w-20 h-20 object-cover rounded-lg m-1"
// // // // // // // // // // // // // // // // // // //                     />
// // // // // // // // // // // // // // // // // // //                 ))}
// // // // // // // // // // // // // // // // // // //                 {extraFiles > 0 && (
// // // // // // // // // // // // // // // // // // //                     <div className="w-20 h-20 bg-gray-200 flex items-center justify-center rounded-lg m-1">
// // // // // // // // // // // // // // // // // // //                         +{extraFiles}
// // // // // // // // // // // // // // // // // // //                     </div>
// // // // // // // // // // // // // // // // // // //                 )}
// // // // // // // // // // // // // // // // // // //             </div>
// // // // // // // // // // // // // // // // // // //         );
// // // // // // // // // // // // // // // // // // //     };

// // // // // // // // // // // // // // // // // // //     return (
// // // // // // // // // // // // // // // // // // //         <div className="flex flex-col h-screen bg-gray-100">
// // // // // // // // // // // // // // // // // // //             <div className="flex-none p-4 bg-white border-b border-gray-300">
// // // // // // // // // // // // // // // // // // //                 <h2 className="text-xl text-center">{otherUser.name}</h2>
// // // // // // // // // // // // // // // // // // //                 {lastSeen && (
// // // // // // // // // // // // // // // // // // //                     <p className="text-sm text-gray-500 text-center">
// // // // // // // // // // // // // // // // // // //                         Last seen: {new Date(lastSeen.timestamp).toLocaleString()}
// // // // // // // // // // // // // // // // // // //                     </p>
// // // // // // // // // // // // // // // // // // //                 )}
// // // // // // // // // // // // // // // // // // //             </div>
// // // // // // // // // // // // // // // // // // //             <div className="flex-1 overflow-y-auto p-4">
// // // // // // // // // // // // // // // // // // //                 {/* Display messages */}
// // // // // // // // // // // // // // // // // // //                 {messages.map((msg, index) => (
// // // // // // // // // // // // // // // // // // //                     <div key={index} className={`mb-2 ${msg.sender === user.id ? 'text-right' : 'text-left'}`}>
// // // // // // // // // // // // // // // // // // //                         <div 
// // // // // // // // // // // // // // // // // // //                             className={`inline-block p-2 rounded-lg ${msg.sender === user.id ? 'bg-blue-500 text-white' : 'bg-gray-300'}`}
// // // // // // // // // // // // // // // // // // //                             onContextMenu={(e) => {
// // // // // // // // // // // // // // // // // // //                                 e.preventDefault();
// // // // // // // // // // // // // // // // // // //                                 if (msg.sender === user.id) {
// // // // // // // // // // // // // // // // // // //                                     handleEditMessage(msg.id); // Enable editing for the message
// // // // // // // // // // // // // // // // // // //                                 } else {
// // // // // // // // // // // // // // // // // // //                                     deleteMessage(msg.id); // Delete message for others
// // // // // // // // // // // // // // // // // // //                                 }
// // // // // // // // // // // // // // // // // // //                             }}
// // // // // // // // // // // // // // // // // // //                         >
// // // // // // // // // // // // // // // // // // //                             {msg.text}
// // // // // // // // // // // // // // // // // // //                             {renderMedia(msg.files)}
// // // // // // // // // // // // // // // // // // //                         </div>
// // // // // // // // // // // // // // // // // // //                         <div className="text-xs text-gray-500 flex justify-end items-center">
// // // // // // // // // // // // // // // // // // //                             {new Date(msg.timestamp).toLocaleTimeString()}
// // // // // // // // // // // // // // // // // // //                             {msg.sender === user.id && (
// // // // // // // // // // // // // // // // // // //                                 <span className="ml-2">
// // // // // // // // // // // // // // // // // // //                                     {msg.read ? (
// // // // // // // // // // // // // // // // // // //                                         <span className="text-blue-500">✔✔</span>
// // // // // // // // // // // // // // // // // // //                                     ) : (
// // // // // // // // // // // // // // // // // // //                                         <span>✔</span>
// // // // // // // // // // // // // // // // // // //                                     )}
// // // // // // // // // // // // // // // // // // //                                 </span>
// // // // // // // // // // // // // // // // // // //                             )}
// // // // // // // // // // // // // // // // // // //                             {msg.sender !== user.id && (
// // // // // // // // // // // // // // // // // // //                                 <span className="ml-2">
// // // // // // // // // // // // // // // // // // //                                     {msg.read ? (
// // // // // // // // // // // // // // // // // // //                                         <span className="text-blue-500">✔✔</span>
// // // // // // // // // // // // // // // // // // //                                     ) : (
// // // // // // // // // // // // // // // // // // //                                         <span>✔✔</span>
// // // // // // // // // // // // // // // // // // //                                     )}
// // // // // // // // // // // // // // // // // // //                                 </span>
// // // // // // // // // // // // // // // // // // //                             )}
// // // // // // // // // // // // // // // // // // //                         </div>
// // // // // // // // // // // // // // // // // // //                     </div>
// // // // // // // // // // // // // // // // // // //                 ))}
// // // // // // // // // // // // // // // // // // //                 {/* Tampilkan gambar yang sedang diupload */}
// // // // // // // // // // // // // // // // // // //                 {selectedFiles.map((file, index) => (
// // // // // // // // // // // // // // // // // // //                     <div key={index} className="flex items-center mb-2">
// // // // // // // // // // // // // // // // // // //                         <img
// // // // // // // // // // // // // // // // // // //                             src={URL.createObjectURL(file)}
// // // // // // // // // // // // // // // // // // //                             alt="Uploading"
// // // // // // // // // // // // // // // // // // //                             className="w-20 h-20 object-cover rounded-lg"
// // // // // // // // // // // // // // // // // // //                         />
// // // // // // // // // // // // // // // // // // //                         {uploadingFiles[index] && (
// // // // // // // // // // // // // // // // // // //                             <span className="ml-2 text-sm text-gray-500">Uploading...</span>
// // // // // // // // // // // // // // // // // // //                         )}
// // // // // // // // // // // // // // // // // // //                     </div>
// // // // // // // // // // // // // // // // // // //                 ))}
// // // // // // // // // // // // // // // // // // //             </div>
// // // // // // // // // // // // // // // // // // //             <div className="flex items-center p-4 border-t border-gray-300">
// // // // // // // // // // // // // // // // // // //                 <input
// // // // // // // // // // // // // // // // // // //                     type="file"
// // // // // // // // // // // // // // // // // // //                     multiple
// // // // // // // // // // // // // // // // // // //                     accept="image/*,video/*"
// // // // // // // // // // // // // // // // // // //                     onChange={handleFileChange}
// // // // // // // // // // // // // // // // // // //                     className="hidden"
// // // // // // // // // // // // // // // // // // //                     id="file-input"
// // // // // // // // // // // // // // // // // // //                 />
               
// // // // // // // // // // // // // // // // // // //                     <label htmlFor="file-input" className="mr-2 cursor-pointer">
// // // // // // // // // // // // // // // // // // //                         <span className="text-gray-600 hover:text-blue-500">📎</span>
// // // // // // // // // // // // // // // // // // //                     </label>
// // // // // // // // // // // // // // // // // // //                 <input
// // // // // // // // // // // // // // // // // // //                     type="text"
// // // // // // // // // // // // // // // // // // //                     value={messageText}
// // // // // // // // // // // // // // // // // // //                     onChange={(e) => setMessageText(e.target.value)}
// // // // // // // // // // // // // // // // // // //                     placeholder="Type a message..."
// // // // // // // // // // // // // // // // // // //                     className="flex-1 p-2 border border-gray-300 rounded-lg mx-2"
// // // // // // // // // // // // // // // // // // //                 />
// // // // // // // // // // // // // // // // // // //                 <button
// // // // // // // // // // // // // // // // // // //                     onClick={editingMessageId ? updateMessage : sendMessage}
// // // // // // // // // // // // // // // // // // //                     className="bg-blue-500 text-white rounded-lg px-4 py-2"
// // // // // // // // // // // // // // // // // // //                 >
// // // // // // // // // // // // // // // // // // //                     {editingMessageId ? 'Update' : 'Send'}
// // // // // // // // // // // // // // // // // // //                 </button>
// // // // // // // // // // // // // // // // // // //             </div>
// // // // // // // // // // // // // // // // // // //         </div>
// // // // // // // // // // // // // // // // // // //     );
// // // // // // // // // // // // // // // // // // // };

// // // // // // // // // // // // // // // // // // // export default Chat;

// // // // // // // // // // // // // // // // // // // // "use client"; // Enable client-side rendering
// // // // // // // // // // // // // // // // // // // // import React, { useState, useEffect } from 'react';
// // // // // // // // // // // // // // // // // // // // import { database, storage } from '../config/firebase'; // Pastikan Anda sudah mengkonfigurasi Firebase Storage
// // // // // // // // // // // // // // // // // // // // import { ref, onValue, push, update } from 'firebase/database';
// // // // // // // // // // // // // // // // // // // // import { uploadBytes, getDownloadURL } from 'firebase/storage';
// // // // // // // // // // // // // // // // // // // // import 'tailwindcss/tailwind.css';

// // // // // // // // // // // // // // // // // // // // const Chat = ({ user }) => {
// // // // // // // // // // // // // // // // // // // //     const otherUser = user.id === 'user1' ? { id: 'user2', name: 'User 2' } : { id: 'user1', name: 'User 1' };

// // // // // // // // // // // // // // // // // // // //     const [messages, setMessages] = useState([]);
// // // // // // // // // // // // // // // // // // // //     const [messageText, setMessageText] = useState('');
// // // // // // // // // // // // // // // // // // // //     const [selectedFiles, setSelectedFiles] = useState([]);
// // // // // // // // // // // // // // // // // // // //     const [uploadingFiles, setUploadingFiles] = useState([]); // State untuk menyimpan status upload file
// // // // // // // // // // // // // // // // // // // //     const [lastSeen, setLastSeen] = useState(null); // State untuk menyimpan waktu terakhir dilihat

// // // // // // // // // // // // // // // // // // // //     // Fetch messages from Firebase on component mount
// // // // // // // // // // // // // // // // // // // //     useEffect(() => {
// // // // // // // // // // // // // // // // // // // //         const messagesRef = ref(database, `messages/${user.id}/${otherUser.id}`);
// // // // // // // // // // // // // // // // // // // //         onValue(messagesRef, (snapshot) => {
// // // // // // // // // // // // // // // // // // // //             const data = snapshot.val();
// // // // // // // // // // // // // // // // // // // //             const loadedMessages = data ? Object.values(data) : [];
// // // // // // // // // // // // // // // // // // // //             setMessages(loadedMessages);

// // // // // // // // // // // // // // // // // // // //             // Mark all messages as read when the user views the chat
// // // // // // // // // // // // // // // // // // // //             loadedMessages.forEach((msg) => {
// // // // // // // // // // // // // // // // // // // //                 if (!msg.read && msg.sender !== user.id) {
// // // // // // // // // // // // // // // // // // // //                     update(ref(database, `messages/${user.id}/${otherUser.id}/${msg.id}`), { read: true });
// // // // // // // // // // // // // // // // // // // //                     update(ref(database, `messages/${otherUser.id}/${user.id}/${msg.id}`), { read: true });
// // // // // // // // // // // // // // // // // // // //                 }
// // // // // // // // // // // // // // // // // // // //             });
// // // // // // // // // // // // // // // // // // // //         });

// // // // // // // // // // // // // // // // // // // //         // Set last seen status
// // // // // // // // // // // // // // // // // // // //         const lastSeenRef = ref(database, `lastSeen/${user.id}`);
// // // // // // // // // // // // // // // // // // // //         onValue(lastSeenRef, (snapshot) => {
// // // // // // // // // // // // // // // // // // // //             setLastSeen(snapshot.val());
// // // // // // // // // // // // // // // // // // // //         });

// // // // // // // // // // // // // // // // // // // //         // Update last seen when user is active
// // // // // // // // // // // // // // // // // // // //         update(lastSeenRef, { timestamp: Date.now() });
// // // // // // // // // // // // // // // // // // // //     }, [user.id, otherUser.id]);

// // // // // // // // // // // // // // // // // // // //     // Handle file selection
// // // // // // // // // // // // // // // // // // // //     const handleFileChange = (event) => {
// // // // // // // // // // // // // // // // // // // //         const files = Array.from(event.target.files);
// // // // // // // // // // // // // // // // // // // //         setSelectedFiles((prevFiles) => [...prevFiles, ...files]);
// // // // // // // // // // // // // // // // // // // //     };

// // // // // // // // // // // // // // // // // // // //     // Remove a selected file
// // // // // // // // // // // // // // // // // // // //     const removeFile = (index) => {
// // // // // // // // // // // // // // // // // // // //         setSelectedFiles((prevFiles) => prevFiles.filter((_, i) => i !== index));
// // // // // // // // // // // // // // // // // // // //         setUploadingFiles((prevUploads) => prevUploads.filter((_, i) => i !== index)); // Hapus status upload yang sesuai
// // // // // // // // // // // // // // // // // // // //     };

// // // // // // // // // // // // // // // // // // // //     // Function to send a new message
// // // // // // // // // // // // // // // // // // // //     const sendMessage = async () => {
// // // // // // // // // // // // // // // // // // // //         if (messageText.trim() === "" && selectedFiles.length === 0) return; // Prevent sending empty messages

// // // // // // // // // // // // // // // // // // // //         const messagesRef = ref(database, `messages/${user.id}/${otherUser.id}`);
// // // // // // // // // // // // // // // // // // // //         const newMessage = {
// // // // // // // // // // // // // // // // // // // //             text: messageText,
// // // // // // // // // // // // // // // // // // // //             sender: user.id,
// // // // // // // // // // // // // // // // // // // //             timestamp: Date.now(),
// // // // // // // // // // // // // // // // // // // //             read: false,
// // // // // // // // // // // // // // // // // // // //             files: [],
// // // // // // // // // // // // // // // // // // // //         };

// // // // // // // // // // // // // // // // // // // //         // Update the state to show loading for each file
// // // // // // // // // // // // // // // // // // // //         const loadingStatus = Array(selectedFiles.length).fill(true);
// // // // // // // // // // // // // // // // // // // //         setUploadingFiles(loadingStatus);

// // // // // // // // // // // // // // // // // // // //         // Upload selected files to Firebase Storage
// // // // // // // // // // // // // // // // // // // //         const uploadedFiles = await Promise.all(selectedFiles.map(async (file, index) => {
// // // // // // // // // // // // // // // // // // // //             const storageRef = ref(storage, `chatFiles/${file.name}`);
// // // // // // // // // // // // // // // // // // // //             await uploadBytes(storageRef, file);
// // // // // // // // // // // // // // // // // // // //             const url = await getDownloadURL(storageRef);
// // // // // // // // // // // // // // // // // // // //             // Update the loading status for the uploaded file
// // // // // // // // // // // // // // // // // // // //             loadingStatus[index] = false;
// // // // // // // // // // // // // // // // // // // //             setUploadingFiles([...loadingStatus]); // Update loading state
// // // // // // // // // // // // // // // // // // // //             return url;
// // // // // // // // // // // // // // // // // // // //         }));

// // // // // // // // // // // // // // // // // // // //         // Update newMessage with uploaded file URLs
// // // // // // // // // // // // // // // // // // // //         newMessage.files = uploadedFiles;

// // // // // // // // // // // // // // // // // // // //         // Push message to Firebase Database
// // // // // // // // // // // // // // // // // // // //         await push(messagesRef, newMessage);
// // // // // // // // // // // // // // // // // // // //         setMessageText(''); // Clear input after sending
// // // // // // // // // // // // // // // // // // // //         setSelectedFiles([]); // Clear selected files
// // // // // // // // // // // // // // // // // // // //         setUploadingFiles([]); // Clear uploading status

// // // // // // // // // // // // // // // // // // // //         // Update the recipient's message status
// // // // // // // // // // // // // // // // // // // //         const recipientRef = ref(database, `messages/${otherUser.id}/${user.id}`);
// // // // // // // // // // // // // // // // // // // //         await push(recipientRef, newMessage);
// // // // // // // // // // // // // // // // // // // //     };

// // // // // // // // // // // // // // // // // // // //     const renderMedia = (files) => {
// // // // // // // // // // // // // // // // // // // //         if (!files || files.length === 0) return null;

// // // // // // // // // // // // // // // // // // // //         const visibleFiles = files.slice(0, 3);
// // // // // // // // // // // // // // // // // // // //         const extraFiles = files.length - visibleFiles.length;

// // // // // // // // // // // // // // // // // // // //         return (
// // // // // // // // // // // // // // // // // // // //             <div className="flex flex-wrap mt-1">
// // // // // // // // // // // // // // // // // // // //                 {visibleFiles.map((file, index) => (
// // // // // // // // // // // // // // // // // // // //                     <img
// // // // // // // // // // // // // // // // // // // //                         key={index}
// // // // // // // // // // // // // // // // // // // //                         src={file}
// // // // // // // // // // // // // // // // // // // //                         alt="Media"
// // // // // // // // // // // // // // // // // // // //                         className="w-20 h-20 object-cover rounded-lg m-1"
// // // // // // // // // // // // // // // // // // // //                     />
// // // // // // // // // // // // // // // // // // // //                 ))}
// // // // // // // // // // // // // // // // // // // //                 {extraFiles > 0 && (
// // // // // // // // // // // // // // // // // // // //                     <div className="w-20 h-20 bg-gray-200 flex items-center justify-center rounded-lg m-1">
// // // // // // // // // // // // // // // // // // // //                         +{extraFiles}
// // // // // // // // // // // // // // // // // // // //                     </div>
// // // // // // // // // // // // // // // // // // // //                 )}
// // // // // // // // // // // // // // // // // // // //             </div>
// // // // // // // // // // // // // // // // // // // //         );
// // // // // // // // // // // // // // // // // // // //     };

// // // // // // // // // // // // // // // // // // // //     return (
// // // // // // // // // // // // // // // // // // // //         <div className="flex flex-col h-screen bg-gray-100">
// // // // // // // // // // // // // // // // // // // //             <div className="flex-none p-4 bg-white border-b border-gray-300">
// // // // // // // // // // // // // // // // // // // //                 <h2 className="text-xl text-center">{otherUser.name}</h2>
// // // // // // // // // // // // // // // // // // // //                 {lastSeen && (
// // // // // // // // // // // // // // // // // // // //                     <p className="text-sm text-gray-500 text-center">
// // // // // // // // // // // // // // // // // // // //                         Last seen: {new Date(lastSeen.timestamp).toLocaleString()}
// // // // // // // // // // // // // // // // // // // //                     </p>
// // // // // // // // // // // // // // // // // // // //                 )}
// // // // // // // // // // // // // // // // // // // //             </div>
// // // // // // // // // // // // // // // // // // // //             <div className="flex-1 overflow-y-auto p-4">
// // // // // // // // // // // // // // // // // // // //                 {/* Display messages */}
// // // // // // // // // // // // // // // // // // // //                 {messages.map((msg, index) => (
// // // // // // // // // // // // // // // // // // // //                     <div key={index} className={`mb-2 ${msg.sender === user.id ? 'text-right' : 'text-left'}`}>
// // // // // // // // // // // // // // // // // // // //                         <div className={`inline-block p-2 rounded-lg ${msg.sender === user.id ? 'bg-blue-500 text-white' : 'bg-gray-300'}`}>
// // // // // // // // // // // // // // // // // // // //                             {msg.text}
// // // // // // // // // // // // // // // // // // // //                             {renderMedia(msg.files)}
// // // // // // // // // // // // // // // // // // // //                         </div>
// // // // // // // // // // // // // // // // // // // //                         <div className="text-xs text-gray-500 flex justify-end items-center">
// // // // // // // // // // // // // // // // // // // //                             {new Date(msg.timestamp).toLocaleTimeString()}
// // // // // // // // // // // // // // // // // // // //                             {msg.sender === user.id && (
// // // // // // // // // // // // // // // // // // // //                                 <span className="ml-2">
// // // // // // // // // // // // // // // // // // // //                                     {msg.read ? (
// // // // // // // // // // // // // // // // // // // //                                         <span className="text-blue-500">✔✔</span>
// // // // // // // // // // // // // // // // // // // //                                     ) : (
// // // // // // // // // // // // // // // // // // // //                                         <span>✔</span>
// // // // // // // // // // // // // // // // // // // //                                     )}
// // // // // // // // // // // // // // // // // // // //                                 </span>
// // // // // // // // // // // // // // // // // // // //                             )}
// // // // // // // // // // // // // // // // // // // //                             {msg.sender !== user.id && (
// // // // // // // // // // // // // // // // // // // //                                 <span className="ml-2">
// // // // // // // // // // // // // // // // // // // //                                     {msg.read ? (
// // // // // // // // // // // // // // // // // // // //                                         <span className="text-blue-500">✔✔</span>
// // // // // // // // // // // // // // // // // // // //                                     ) : (
// // // // // // // // // // // // // // // // // // // //                                         <span>✔✔</span>
// // // // // // // // // // // // // // // // // // // //                                     )}
// // // // // // // // // // // // // // // // // // // //                                 </span>
// // // // // // // // // // // // // // // // // // // //                             )}
// // // // // // // // // // // // // // // // // // // //                         </div>
// // // // // // // // // // // // // // // // // // // //                     </div>
// // // // // // // // // // // // // // // // // // // //                 ))}
// // // // // // // // // // // // // // // // // // // //                 {/* Tampilkan gambar yang sedang diupload */}
// // // // // // // // // // // // // // // // // // // //                 {selectedFiles.map((file, index) => (
// // // // // // // // // // // // // // // // // // // //                     <div key={index} className="flex items-center mb-2">
// // // // // // // // // // // // // // // // // // // //                         <img
// // // // // // // // // // // // // // // // // // // //                             src={URL.createObjectURL(file)}
// // // // // // // // // // // // // // // // // // // //                             alt="Uploading"
// // // // // // // // // // // // // // // // // // // //                             className="w-20 h-20 object-cover rounded-lg"
// // // // // // // // // // // // // // // // // // // //                         />
// // // // // // // // // // // // // // // // // // // //                         {uploadingFiles[index] && (
// // // // // // // // // // // // // // // // // // // //                             <span className="ml-2 text-sm text-gray-500">Uploading...</span>
// // // // // // // // // // // // // // // // // // // //                         )}
// // // // // // // // // // // // // // // // // // // //                     </div>
// // // // // // // // // // // // // // // // // // // //                 ))}
// // // // // // // // // // // // // // // // // // // //             </div>
// // // // // // // // // // // // // // // // // // // //             <div className="flex items-center p-4 border-t border-gray-300">
// // // // // // // // // // // // // // // // // // // //                 <input
// // // // // // // // // // // // // // // // // // // //                     type="file"
// // // // // // // // // // // // // // // // // // // //                     multiple
// // // // // // // // // // // // // // // // // // // //                     accept="image/*,video/*"
// // // // // // // // // // // // // // // // // // // //                     className="hidden"
// // // // // // // // // // // // // // // // // // // //                     id="fileInput"
// // // // // // // // // // // // // // // // // // // //                     onChange={handleFileChange}
// // // // // // // // // // // // // // // // // // // //                 />
// // // // // // // // // // // // // // // // // // // //                 <label htmlFor="fileInput" className="cursor-pointer flex items-center">
// // // // // // // // // // // // // // // // // // // //                     <span className="material-icons">attach_file</span> {/* Ganti dengan ikon klip */}
// // // // // // // // // // // // // // // // // // // //                 </label>
// // // // // // // // // // // // // // // // // // // //                 <input
// // // // // // // // // // // // // // // // // // // //                     type="text"
// // // // // // // // // // // // // // // // // // // //                     className="border rounded-lg p-2 flex-1 mx-2"
// // // // // // // // // // // // // // // // // // // //                     placeholder="Type a message..."
// // // // // // // // // // // // // // // // // // // //                     value={messageText}
// // // // // // // // // // // // // // // // // // // //                     onChange={(e) => setMessageText(e.target.value)}
// // // // // // // // // // // // // // // // // // // //                 />
// // // // // // // // // // // // // // // // // // // //                 <button
// // // // // // // // // // // // // // // // // // // //                     className="ml-2 p-2 bg-blue-500 text-white rounded-lg"
// // // // // // // // // // // // // // // // // // // //                     onClick={sendMessage}
// // // // // // // // // // // // // // // // // // // //                 >
// // // // // // // // // // // // // // // // // // // //                     Send
// // // // // // // // // // // // // // // // // // // //                 </button>
// // // // // // // // // // // // // // // // // // // //             </div>
// // // // // // // // // // // // // // // // // // // //         </div>
// // // // // // // // // // // // // // // // // // // //     );
// // // // // // // // // // // // // // // // // // // // };

// // // // // // // // // // // // // // // // // // // // export default Chat;

// // // // // // // // // // // // // // // // // // // // // "use client"; // Enable client-side rendering
// // // // // // // // // // // // // // // // // // // // // import React, { useState, useEffect } from 'react';
// // // // // // // // // // // // // // // // // // // // // import { database, storage } from '../config/firebase'; // Pastikan Anda sudah mengkonfigurasi Firebase Storage
// // // // // // // // // // // // // // // // // // // // // import { ref, onValue, push, update } from 'firebase/database';
// // // // // // // // // // // // // // // // // // // // // import { uploadBytes, getDownloadURL } from 'firebase/storage';
// // // // // // // // // // // // // // // // // // // // // import 'tailwindcss/tailwind.css';

// // // // // // // // // // // // // // // // // // // // // const Chat = ({ user }) => {
// // // // // // // // // // // // // // // // // // // // //     const otherUser = user.id === 'user1' ? { id: 'user2', name: 'User 2' } : { id: 'user1', name: 'User 1' };

// // // // // // // // // // // // // // // // // // // // //     const [messages, setMessages] = useState([]);
// // // // // // // // // // // // // // // // // // // // //     const [messageText, setMessageText] = useState('');
// // // // // // // // // // // // // // // // // // // // //     const [selectedFiles, setSelectedFiles] = useState([]);
// // // // // // // // // // // // // // // // // // // // //     const [uploading, setUploading] = useState(false);
// // // // // // // // // // // // // // // // // // // // //     const [lastSeen, setLastSeen] = useState(null); // State untuk menyimpan waktu terakhir dilihat

// // // // // // // // // // // // // // // // // // // // //     // Fetch messages from Firebase on component mount
// // // // // // // // // // // // // // // // // // // // //     useEffect(() => {
// // // // // // // // // // // // // // // // // // // // //         const messagesRef = ref(database, `messages/${user.id}/${otherUser.id}`);
// // // // // // // // // // // // // // // // // // // // //         onValue(messagesRef, (snapshot) => {
// // // // // // // // // // // // // // // // // // // // //             const data = snapshot.val();
// // // // // // // // // // // // // // // // // // // // //             const loadedMessages = data ? Object.values(data) : [];
// // // // // // // // // // // // // // // // // // // // //             setMessages(loadedMessages);

// // // // // // // // // // // // // // // // // // // // //             // Mark all messages as read when the user views the chat
// // // // // // // // // // // // // // // // // // // // //             loadedMessages.forEach((msg) => {
// // // // // // // // // // // // // // // // // // // // //                 if (!msg.read && msg.sender !== user.id) {
// // // // // // // // // // // // // // // // // // // // //                     update(ref(database, `messages/${user.id}/${otherUser.id}/${msg.id}`), { read: true });
// // // // // // // // // // // // // // // // // // // // //                     update(ref(database, `messages/${otherUser.id}/${user.id}/${msg.id}`), { read: true });
// // // // // // // // // // // // // // // // // // // // //                 }
// // // // // // // // // // // // // // // // // // // // //             });
// // // // // // // // // // // // // // // // // // // // //         });

// // // // // // // // // // // // // // // // // // // // //         // Set last seen status
// // // // // // // // // // // // // // // // // // // // //         const lastSeenRef = ref(database, `lastSeen/${user.id}`);
// // // // // // // // // // // // // // // // // // // // //         onValue(lastSeenRef, (snapshot) => {
// // // // // // // // // // // // // // // // // // // // //             setLastSeen(snapshot.val());
// // // // // // // // // // // // // // // // // // // // //         });

// // // // // // // // // // // // // // // // // // // // //         // Update last seen when user is active
// // // // // // // // // // // // // // // // // // // // //         update(lastSeenRef, { timestamp: Date.now() });
// // // // // // // // // // // // // // // // // // // // //     }, [user.id, otherUser.id]);

// // // // // // // // // // // // // // // // // // // // //     // Handle file selection
// // // // // // // // // // // // // // // // // // // // //     const handleFileChange = (event) => {
// // // // // // // // // // // // // // // // // // // // //         const files = Array.from(event.target.files);
// // // // // // // // // // // // // // // // // // // // //         setSelectedFiles((prevFiles) => [...prevFiles, ...files]);
// // // // // // // // // // // // // // // // // // // // //     };

// // // // // // // // // // // // // // // // // // // // //     // Remove a selected file
// // // // // // // // // // // // // // // // // // // // //     const removeFile = (index) => {
// // // // // // // // // // // // // // // // // // // // //         setSelectedFiles((prevFiles) => prevFiles.filter((_, i) => i !== index));
// // // // // // // // // // // // // // // // // // // // //     };

// // // // // // // // // // // // // // // // // // // // //     // Function to send a new message
// // // // // // // // // // // // // // // // // // // // //     const sendMessage = async () => {
// // // // // // // // // // // // // // // // // // // // //         if (messageText.trim() === "" && selectedFiles.length === 0) return; // Prevent sending empty messages

// // // // // // // // // // // // // // // // // // // // //         const messagesRef = ref(database, `messages/${user.id}/${otherUser.id}`);
// // // // // // // // // // // // // // // // // // // // //         const newMessage = {
// // // // // // // // // // // // // // // // // // // // //             text: messageText,
// // // // // // // // // // // // // // // // // // // // //             sender: user.id,
// // // // // // // // // // // // // // // // // // // // //             timestamp: Date.now(),
// // // // // // // // // // // // // // // // // // // // //             read: false,
// // // // // // // // // // // // // // // // // // // // //             files: [],
// // // // // // // // // // // // // // // // // // // // //         };

// // // // // // // // // // // // // // // // // // // // //         setUploading(true);

// // // // // // // // // // // // // // // // // // // // //         // Upload selected files to Firebase Storage
// // // // // // // // // // // // // // // // // // // // //         const uploadedFiles = await Promise.all(selectedFiles.map(async (file) => {
// // // // // // // // // // // // // // // // // // // // //             const storageRef = ref(storage, `chatFiles/${file.name}`);
// // // // // // // // // // // // // // // // // // // // //             await uploadBytes(storageRef, file);
// // // // // // // // // // // // // // // // // // // // //             return getDownloadURL(storageRef);
// // // // // // // // // // // // // // // // // // // // //         }));

// // // // // // // // // // // // // // // // // // // // //         // Update newMessage with uploaded file URLs
// // // // // // // // // // // // // // // // // // // // //         newMessage.files = uploadedFiles;

// // // // // // // // // // // // // // // // // // // // //         // Push message to Firebase Database
// // // // // // // // // // // // // // // // // // // // //         await push(messagesRef, newMessage);
// // // // // // // // // // // // // // // // // // // // //         setMessageText(''); // Clear input after sending
// // // // // // // // // // // // // // // // // // // // //         setSelectedFiles([]); // Clear selected files

// // // // // // // // // // // // // // // // // // // // //         // Update the recipient's message status
// // // // // // // // // // // // // // // // // // // // //         const recipientRef = ref(database, `messages/${otherUser.id}/${user.id}`);
// // // // // // // // // // // // // // // // // // // // //         await push(recipientRef, newMessage);

// // // // // // // // // // // // // // // // // // // // //         setUploading(false);
// // // // // // // // // // // // // // // // // // // // //     };

// // // // // // // // // // // // // // // // // // // // //     const renderMedia = (files) => {
// // // // // // // // // // // // // // // // // // // // //         if (!files || files.length === 0) return null;

// // // // // // // // // // // // // // // // // // // // //         const visibleFiles = files.slice(0, 3);
// // // // // // // // // // // // // // // // // // // // //         const extraFiles = files.length - visibleFiles.length;

// // // // // // // // // // // // // // // // // // // // //         return (
// // // // // // // // // // // // // // // // // // // // //             <div className="flex flex-wrap mt-1">
// // // // // // // // // // // // // // // // // // // // //                 {visibleFiles.map((file, index) => (
// // // // // // // // // // // // // // // // // // // // //                     <img
// // // // // // // // // // // // // // // // // // // // //                         key={index}
// // // // // // // // // // // // // // // // // // // // //                         src={file}
// // // // // // // // // // // // // // // // // // // // //                         alt="Media"
// // // // // // // // // // // // // // // // // // // // //                         className="w-20 h-20 object-cover rounded-lg m-1"
// // // // // // // // // // // // // // // // // // // // //                     />
// // // // // // // // // // // // // // // // // // // // //                 ))}
// // // // // // // // // // // // // // // // // // // // //                 {extraFiles > 0 && (
// // // // // // // // // // // // // // // // // // // // //                     <div className="w-20 h-20 bg-gray-200 flex items-center justify-center rounded-lg m-1">
// // // // // // // // // // // // // // // // // // // // //                         +{extraFiles}
// // // // // // // // // // // // // // // // // // // // //                     </div>
// // // // // // // // // // // // // // // // // // // // //                 )}
// // // // // // // // // // // // // // // // // // // // //             </div>
// // // // // // // // // // // // // // // // // // // // //         );
// // // // // // // // // // // // // // // // // // // // //     };

// // // // // // // // // // // // // // // // // // // // //     return (
// // // // // // // // // // // // // // // // // // // // //         <div className="flex flex-col h-screen bg-gray-100">
// // // // // // // // // // // // // // // // // // // // //             <div className="flex-none p-4 bg-white border-b border-gray-300">
// // // // // // // // // // // // // // // // // // // // //                 <h2 className="text-xl text-center">{otherUser.name}</h2>
// // // // // // // // // // // // // // // // // // // // //                 {lastSeen && (
// // // // // // // // // // // // // // // // // // // // //                     <p className="text-sm text-gray-500 text-center">
// // // // // // // // // // // // // // // // // // // // //                         Last seen: {new Date(lastSeen.timestamp).toLocaleString()}
// // // // // // // // // // // // // // // // // // // // //                     </p>
// // // // // // // // // // // // // // // // // // // // //                 )}
// // // // // // // // // // // // // // // // // // // // //             </div>
// // // // // // // // // // // // // // // // // // // // //             <div className="flex-1 overflow-y-auto p-4">
// // // // // // // // // // // // // // // // // // // // //                 {/* Display messages */}
// // // // // // // // // // // // // // // // // // // // //                 {messages.map((msg, index) => (
// // // // // // // // // // // // // // // // // // // // //                     <div key={index} className={`mb-2 ${msg.sender === user.id ? 'text-right' : 'text-left'}`}>
// // // // // // // // // // // // // // // // // // // // //                         <div className={`inline-block p-2 rounded-lg ${msg.sender === user.id ? 'bg-blue-500 text-white' : 'bg-gray-300'}`}>
// // // // // // // // // // // // // // // // // // // // //                             {msg.text}
// // // // // // // // // // // // // // // // // // // // //                             {renderMedia(msg.files)}
// // // // // // // // // // // // // // // // // // // // //                         </div>
// // // // // // // // // // // // // // // // // // // // //                         <div className="text-xs text-gray-500 flex justify-end items-center">
// // // // // // // // // // // // // // // // // // // // //                             {new Date(msg.timestamp).toLocaleTimeString()}
// // // // // // // // // // // // // // // // // // // // //                             {msg.sender === user.id && (
// // // // // // // // // // // // // // // // // // // // //                                 <span className="ml-2">
// // // // // // // // // // // // // // // // // // // // //                                     {msg.read ? (
// // // // // // // // // // // // // // // // // // // // //                                         <span className="text-blue-500">✔✔</span>
// // // // // // // // // // // // // // // // // // // // //                                     ) : (
// // // // // // // // // // // // // // // // // // // // //                                         <span>✔</span>
// // // // // // // // // // // // // // // // // // // // //                                     )}
// // // // // // // // // // // // // // // // // // // // //                                 </span>
// // // // // // // // // // // // // // // // // // // // //                             )}
// // // // // // // // // // // // // // // // // // // // //                             {msg.sender !== user.id && (
// // // // // // // // // // // // // // // // // // // // //                                 <span className="ml-2">
// // // // // // // // // // // // // // // // // // // // //                                     {msg.read ? (
// // // // // // // // // // // // // // // // // // // // //                                         <span className="text-blue-500">✔✔</span>
// // // // // // // // // // // // // // // // // // // // //                                     ) : (
// // // // // // // // // // // // // // // // // // // // //                                         <span>✔✔</span>
// // // // // // // // // // // // // // // // // // // // //                                     )}
// // // // // // // // // // // // // // // // // // // // //                                 </span>
// // // // // // // // // // // // // // // // // // // // //                             )}
// // // // // // // // // // // // // // // // // // // // //                         </div>
// // // // // // // // // // // // // // // // // // // // //                     </div>
// // // // // // // // // // // // // // // // // // // // //                 ))}
// // // // // // // // // // // // // // // // // // // // //             </div>
// // // // // // // // // // // // // // // // // // // // //             <div className="flex items-center p-4 border-t border-gray-300">
// // // // // // // // // // // // // // // // // // // // //                 <input
// // // // // // // // // // // // // // // // // // // // //                     type="file"
// // // // // // // // // // // // // // // // // // // // //                     multiple
// // // // // // // // // // // // // // // // // // // // //                     accept="image/*,video/*"
// // // // // // // // // // // // // // // // // // // // //                     className="hidden"
// // // // // // // // // // // // // // // // // // // // //                     id="fileInput"
// // // // // // // // // // // // // // // // // // // // //                     onChange={handleFileChange}
// // // // // // // // // // // // // // // // // // // // //                 />
// // // // // // // // // // // // // // // // // // // // //                 <label htmlFor="fileInput" className="cursor-pointer flex items-center">
// // // // // // // // // // // // // // // // // // // // //                     <span className="material-icons">attach_file</span> {/* Ganti dengan ikon klip */}
// // // // // // // // // // // // // // // // // // // // //                 </label>
// // // // // // // // // // // // // // // // // // // // //                 <div className="flex flex-wrap w-full">
// // // // // // // // // // // // // // // // // // // // //                     {selectedFiles.map((file, index) => (
// // // // // // // // // // // // // // // // // // // // //                         <div key={index} className="relative mr-2 mb-2">
// // // // // // // // // // // // // // // // // // // // //                             <span
// // // // // // // // // // // // // // // // // // // // //                                 className="absolute top-0 right-0 cursor-pointer text-red-500"
// // // // // // // // // // // // // // // // // // // // //                                 onClick={() => removeFile(index)}
// // // // // // // // // // // // // // // // // // // // //                             >
// // // // // // // // // // // // // // // // // // // // //                                 &times;
// // // // // // // // // // // // // // // // // // // // //                             </span>
// // // // // // // // // // // // // // // // // // // // //                             <img
// // // // // // // // // // // // // // // // // // // // //                                 src={URL.createObjectURL(file)} // Menampilkan gambar sebagai preview
// // // // // // // // // // // // // // // // // // // // //                                 alt="Preview"
// // // // // // // // // // // // // // // // // // // // //                                 className="w-20 h-20 object-cover rounded-lg"
// // // // // // // // // // // // // // // // // // // // //                             />
// // // // // // // // // // // // // // // // // // // // //                         </div>
// // // // // // // // // // // // // // // // // // // // //                     ))}
// // // // // // // // // // // // // // // // // // // // //                 </div>
// // // // // // // // // // // // // // // // // // // // //                 <input
// // // // // // // // // // // // // // // // // // // // //                     type="text"
// // // // // // // // // // // // // // // // // // // // //                     className="border rounded-lg p-2 flex-1 mx-2"
// // // // // // // // // // // // // // // // // // // // //                     placeholder="Type a message..."
// // // // // // // // // // // // // // // // // // // // //                     value={messageText}
// // // // // // // // // // // // // // // // // // // // //                     onChange={(e) => setMessageText(e.target.value)}
// // // // // // // // // // // // // // // // // // // // //                 />
// // // // // // // // // // // // // // // // // // // // //                 <button
// // // // // // // // // // // // // // // // // // // // //                     className="ml-2 p-2 bg-blue-500 text-white rounded-lg"
// // // // // // // // // // // // // // // // // // // // //                     onClick={sendMessage}
// // // // // // // // // // // // // // // // // // // // //                     disabled={uploading}
// // // // // // // // // // // // // // // // // // // // //                 >
// // // // // // // // // // // // // // // // // // // // //                     {uploading ? "Sending..." : "Send"}
// // // // // // // // // // // // // // // // // // // // //                 </button>
// // // // // // // // // // // // // // // // // // // // //             </div>
// // // // // // // // // // // // // // // // // // // // //         </div>
// // // // // // // // // // // // // // // // // // // // //     );
// // // // // // // // // // // // // // // // // // // // // };

// // // // // // // // // // // // // // // // // // // // // export default Chat;
