"use client"; // Enable client-side rendering
import React, { useState, useEffect } from 'react';
import { database, storage } from '../config/firebase'; // Ensure Firebase Storage is configured
import { ref as databaseRef, onValue, push, update } from 'firebase/database';
import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
import 'tailwindcss/tailwind.css';

const Chat = ({ user }) => {
    const otherUser = user.id === 'user1' ? { id: 'user2', name: 'User 2' } : { id: 'user1', name: 'User 1' };

    const [messages, setMessages] = useState([]);
    const [messageText, setMessageText] = useState('');
    const [selectedFiles, setSelectedFiles] = useState([]);
    const [uploading, setUploading] = useState(false);
    const [lastSeen, setLastSeen] = useState(''); // Last seen timestamp
    const [dropdownOpen, setDropdownOpen] = useState(null);

    useEffect(() => {
        const messagesRef = databaseRef(database, `messagesA/${user.id}/${otherUser.id}`);
        onValue(messagesRef, (snapshot) => {
            const data = snapshot.val();
            const loadedMessages = data ? Object.values(data) : [];
            setMessages(loadedMessages);
            loadedMessages.forEach((msg) => {
                if (!msg.read && msg.sender !== user.id) {
                    update(databaseRef(database, `messagesA/${user.id}/${otherUser.id}/${msg.id}`), { read: true });
                    update(databaseRef(database, `messagesA/${otherUser.id}/${user.id}/${msg.id}`), { read: true });
                }
            });
        });
        const userStatusRef = databaseRef(database, `lastSeenA/${otherUser.id}`);
        onValue(userStatusRef, (snapshot) => {
            const status = snapshot.val();
            const timestamp = status?.timestamp ? Number(status.timestamp) : null;
            if (timestamp && timestamp.toString().length === 13) {
                const date = new Date(timestamp);
                setLastSeen(
                    !isNaN(date.getTime()) ? `${date.toLocaleDateString()} ${date.toLocaleTimeString()}` : 'Offline'
                );
            } else {
                setLastSeen('Offline');
            }
        });
        const lastSeenRef = databaseRef(database, `lastSeenA/${user.id}`);
        update(lastSeenRef, { timestamp: Date.now() });

        return () => {
            update(lastSeenRef, { timestamp: null });
        };
    }, [user.id, otherUser.id]);

    const toggleDropdown = (index) => {
        setDropdownOpen(dropdownOpen === index ? null : index);
    };

    const handleFileChange = (event) => {
        const files = Array.from(event.target.files);
        setSelectedFiles((prevFiles) => [...prevFiles, ...files]);
    };

    const removeFile = (index) => {
        setSelectedFiles((prevFiles) => prevFiles.filter((_, i) => i !== index));
    };

    const sendMessage = async () => {
        if (messageText.trim() === "" && selectedFiles.length === 0) return;

        const messagesRef = databaseRef(database, `messagesA/${user.id}/${otherUser.id}`);
        const newMessage = {
            text: messageText,
            sender: user.id,
            timestamp: Date.now(),
            read: false,
            files: [],
        };

        setUploading(true);
        const uploadedFiles = await Promise.all(selectedFiles.map(async (file) => {
            const fileRef = storageRef(storage, `chatFilesA/${file.name}`);
            await uploadBytes(fileRef, file);
            return getDownloadURL(fileRef);
        }));

        newMessage.files = uploadedFiles;
        const newMsgRef = await push(messagesRef, newMessage);
        setMessageText('');
        setSelectedFiles([]);
        const recipientRef = databaseRef(database, `messagesA/${otherUser.id}/${user.id}`);
        await push(recipientRef, { ...newMessage, id: newMsgRef.key });
        setUploading(false);
        const lastSeenRef = databaseRef(database, `lastSeenA/${user.id}`);
        update(lastSeenRef, { timestamp: Date.now() });
    };

    return (
        <div className="flex flex-col h-screen bg-gray-100">
            <div className="flex-none p-4 bg-white border-b border-gray-300">
                <h2 className="text-xl text-center">{otherUser.name}</h2>
                <p className="text-sm text-center">{lastSeen ? 'Last seen: ' + lastSeen : 'Offline'}</p>
            </div>
            <div className="flex-1 overflow-y-auto p-4">
              {messages.map((msg, index) => {
                const showDateHeader =
                  index === 0 || new Date(msg.timestamp).toDateString() !== new Date(messages[index - 1].timestamp).toDateString();
        
                return (
                  <React.Fragment key={msg.id || msg.timestamp}>
                    {showDateHeader && (
                      <div className="text-center text-gray-500 my-4">
                        {new Date(msg.timestamp).toLocaleDateString()}
                      </div>
                    )}
        
                    <div
                      className={`flex items-start gap-2.5 mb-4 ${
                        msg.sender === 'user1' ? 'flex-row-reverse' : ''
                      }`}
                    >
                     
                      <div
                        className={`flex flex-col w-full max-w-[326px] p-4 ${
                          msg.sender === 'user1'
                            ? 'bg-blue-100 rounded-s-xl'
                            : 'bg-gray-100 rounded-e-xl'
                        } border border-gray-200`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-semibold text-gray-900">
                            {msg.senderName}
                          </span>
                          <span className="text-sm font-normal text-gray-500">
                            {new Date(msg.timestamp).toLocaleTimeString()}
                          </span>
                        </div>
                        <p className="text-sm font-normal text-gray-900 mb-2">{msg.text}</p>
                        {msg.files && msg.files.length > 0 && (
                          <div className="grid grid-cols-2 gap-4 my-2.5">
                            {msg.files.slice(0, 3).map((file, i) => (
                              <div key={i} className="group relative">
                                <img src={file} className="rounded-lg" alt={`file-${i}`} />
                              </div>
                            ))}
                            {msg.files.length > 3 && (
                              <div className="group relative">
                                <button className="absolute w-full h-full bg-gray-900/90 text-white rounded-lg flex items-center justify-center">
                                  +{msg.files.length - 3}
                                </button>
                                <img src={msg.files[0]} className="rounded-lg" alt="Additional files" />
                              </div>
                            )}
                          </div>
                        )}
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-normal text-gray-500">
                            {msg.read ? '✔✔' : '✔'}
                          </span>
                        </div>
                      </div>
                      <button
                        id={`dropdownMenuIconButton-${index}`}
                        className="inline-flex self-center items-center p-2 text-sm font-medium text-gray-900 bg-white rounded-lg hover:bg-gray-100"
                        type="button"
                      >
                        <svg
                          className="w-4 h-4 text-gray-500"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="currentColor"
                          viewBox="0 0 4 15"
                        >
                          <path d="M3.5 1.5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0Zm0 6.041a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0Zm0 5.959a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0Z" />
                        </svg>
                      </button>
                    </div>
                  </React.Fragment>
                );
              })}
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
                <label htmlFor="fileInput" className="cursor-pointer">
                    {/* Add your button or icon here for file input */}
                </label>
                {/* Add message input and send button here */}
            </div>
        </div>
    );
};

export default Chat;



// "use client"; // Enable client-side rendering
// import React, { useState, useEffect } from 'react';
// import { database, storage } from '../config/firebase'; // Pastikan Firebase Storage sudah dikonfigurasi
// import { ref as databaseRef, onValue, push, update } from 'firebase/database';
// import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
// import 'tailwindcss/tailwind.css';

// const Chat = ({ user }) => {
//     const otherUser = user.id === 'user1' ? { id: 'user2', name: 'User 2' } : { id: 'user1', name: 'User 1' };

//     const [messages, setMessages] = useState([]);
//     const [messageText, setMessageText] = useState('');
//     const [selectedFiles, setSelectedFiles] = useState([]);
//     const [uploading, setUploading] = useState(false);
//     const [otherUserStatus, setOtherUserStatus] = useState(''); // Online status or last seen
//     const [lastSeen, setLastSeen] = useState(''); // Last seen timestamp

//     useEffect(() => {
//         const messagesRef = databaseRef(database, `messagesA/${user.id}/${otherUser.id}`);
//         onValue(messagesRef, (snapshot) => {
//             const data = snapshot.val();
//             const loadedMessages = data ? Object.values(data) : [];
//             setMessages(loadedMessages);
    
//             // Mark all messages as read when the user views the chat
//             loadedMessages.forEach((msg) => {
//                 if (!msg.read && msg.sender !== user.id) {
//                     update(databaseRef(database, `messagesA/${user.id}/${otherUser.id}/${msg.id}`), { read: true });
//                     update(databaseRef(database, `messagesA/${otherUser.id}/${user.id}/${msg.id}`), { read: true });
//                 }
//             });
//         });
//         const userStatusRef = databaseRef(database, `lastSeenA/${otherUser.id}`);
        
//         onValue(userStatusRef, (snapshot) => {
//             const status = snapshot.val();
//             const timestamp = status && status.timestamp ? Number(status.timestamp) : null;
    
//             if (timestamp && timestamp.toString().length === 13) {  // Check if in milliseconds
//                 const date = new Date(timestamp);
//                 setLastSeen(
//                     !isNaN(date.getTime())
//                         ? `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`
//                         : 'Offline'
//                 );
//             } else {
//                 console.error("Timestamp is invalid or missing:", timestamp);
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

//         // Upload selected files (images and videos) to Firebase Storage
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
//               {messages.map((msg, index) => {
//                 // Determine if a new date header is needed
//                 const showDateHeader =
//                   index === 0 || new Date(msg.timestamp).toDateString() !== new Date(messages[index - 1].timestamp).toDateString();
        
//                 return (
//                   <React.Fragment key={msg.id || msg.timestamp}>
//                     {/* Date Header */}
//                     {showDateHeader && (
//                       <div className="text-center text-gray-500 dark:text-gray-400 my-4">
//                         {new Date(msg.timestamp).toLocaleDateString()}
//                       </div>
//                     )}
        
//                     {/* Message Bubble */}
//                     <div
//                       className={`flex items-start gap-2.5 mb-4 ${
//                         msg.sender === 'user1' ? 'flex-row-reverse' : ''
//                       }`}
//                     >
//                       {/* Profile Picture */}
//                       <img
//                         className="w-8 h-8 rounded-full"
//                         src={msg.profileImage}
//                         alt={`${msg.senderName} profile`}
//                       />
        
//                       {/* Message Content */}
//                       <div
//                         className={`flex flex-col w-full max-w-[326px] p-4 ${
//                           msg.sender === 'user1'
//                             ? 'bg-blue-100 dark:bg-blue-800 rounded-s-xl rounded-es-xl'
//                             : 'bg-gray-100 dark:bg-gray-700 rounded-e-xl rounded-es-xl'
//                         } border border-gray-200 dark:border-gray-600`}
//                       >
//                         <div className="flex items-center justify-between mb-2">
//                           <span className="text-sm font-semibold text-gray-900 dark:text-white">
//                             {msg.senderName}
//                           </span>
//                           <span className="text-sm font-normal text-gray-500 dark:text-gray-400">
//                             {new Date(msg.timestamp).toLocaleTimeString()}
//                           </span>
//                         </div>
        
//                         {/* Message Text */}
//                         <p className="text-sm font-normal text-gray-900 dark:text-white mb-2">{msg.text}</p>
        
//                         {/* Media Grid (if any) */}
//                         {msg.files && msg.files.length > 0 && (
//                           <div className="grid grid-cols-2 gap-4 my-2.5">
//                             {msg.files.slice(0, 3).map((file, i) => (
//                               <div key={i} className="group relative">
//                                 <img src={file.url} className="rounded-lg" alt={`file-${i}`} />
//                               </div>
//                             ))}
//                             {msg.files.length > 3 && (
//                               <div className="group relative">
//                                 <button className="absolute w-full h-full bg-gray-900/90 text-white rounded-lg flex items-center justify-center">
//                                   +{msg.files.length - 3}
//                                 </button>
//                                 <img src={msg.files[0].url} className="rounded-lg" alt="Additional files" />
//                               </div>
//                             )}
//                           </div>
//                         )}
        
//                         {/* Message Status */}
//                         <div className="flex justify-between items-center">
//                           <span className="text-sm font-normal text-gray-500 dark:text-gray-400">
//                             {msg.read ? '✔✔' : '✔'}
//                           </span>
//                         </div>
//                       </div>
        
//                       {/* Dropdown Menu Button */}
//                       <button
//                         id={`dropdownMenuIconButton-${index}`}
//                         className="inline-flex self-center items-center p-2 text-sm font-medium text-gray-900 bg-white rounded-lg hover:bg-gray-100 focus:ring-4 focus:outline-none dark:text-white focus:ring-gray-50 dark:bg-gray-900 dark:hover:bg-gray-800 dark:focus:ring-gray-600"
//                         type="button"
//                       >
//                         <svg
//                           className="w-4 h-4 text-gray-500 dark:text-gray-400"
//                           xmlns="http://www.w3.org/2000/svg"
//                           fill="currentColor"
//                           viewBox="0 0 4 15"
//                         >
//                           <path d="M3.5 1.5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0Zm0 6.041a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0Zm0 5.959a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0Z" />
//                         </svg>
//                       </button>
        
//                       {/* Dropdown Menu Content */}
//                       <div
//                         id={`dropdownDots-${index}`}
//                         className="z-10 hidden bg-white divide-y divide-gray-100 rounded-lg shadow w-40 dark:bg-gray-700 dark:divide-gray-600"
//                       >
//                         <ul className="py-2 text-sm text-gray-700 dark:text-gray-200" aria-labelledby={`dropdownMenuIconButton-${index}`}>
//                           <li><a href="#" className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600">Reply</a></li>
//                           <li><a href="#" className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600">Forward</a></li>
//                           <li><a href="#" className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600">Copy</a></li>
//                           <li><a href="#" className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600">Report</a></li>
//                           <li><a href="#" className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600">Delete</a></li>
//                         </ul>
//                       </div>
//                     </div>
//                   </React.Fragment>
//                 );
//               })}
//             </div>




//             <div className="flex items-center p-4 border-t border-gray-300">
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
//                 <div className="flex flex-wrap">
//                     {selectedFiles.map((file, index) => (
//                         <div key={index} className="relative mr-2 flex items-center">
//                             <span
//                                 className="absolute top-0 right-0 cursor-pointer text-red-500"
//                                 onClick={() => removeFile(index)}
//                             >
//                                 &times;
//                             </span>
//                             {/* Display a thumbnail or video preview based on file type */}
//                             {file.type.startsWith("video") ? (
//                                 <video
//                                     src={URL.createObjectURL(file)}
//                                     className="w-20 h-20 object-cover rounded-lg m-1"
//                                     controls
//                                 />
//                             ) : (
//                                 <img
//                                     src={URL.createObjectURL(file)}
//                                     alt="Selected file"
//                                     className="w-20 h-20 object-cover rounded-lg m-1"
//                                 />
//                             )}
//                         </div>
//                     ))}
//                 </div>

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




// // "use client"; // Enable client-side rendering
// // import React, { useState, useEffect } from 'react';
// // import { database, storage } from '../config/firebase'; // Ensure Firebase is configured
// // import { ref as databaseRef, onValue, push, update } from 'firebase/database';
// // import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
// // import 'tailwindcss/tailwind.css';

// // const Chat = ({ user }) => {
// //     const otherUser = user.id === 'user1' ? { id: 'user2', name: 'User 2' } : { id: 'user1', name: 'User 1' };

// //     const [messages, setMessages] = useState([]);
// //     const [messageText, setMessageText] = useState('');
// //     const [selectedFiles, setSelectedFiles] = useState([]);
// //     const [uploading, setUploading] = useState(false);
// //     const [otherUserStatus, setOtherUserStatus] = useState('');
// //     const [lastSeen, setLastSeen] = useState('');

// //     useEffect(() => {
// //         const messagesRef = databaseRef(database, `messagesA/${user.id}/${otherUser.id}`);
// //         onValue(messagesRef, (snapshot) => {
// //             const data = snapshot.val();
// //             const loadedMessages = data ? Object.values(data) : [];
// //             setMessages(loadedMessages);
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
// //             if (timestamp && timestamp.toString().length === 13) {
// //                 const date = new Date(timestamp);
// //                 setLastSeen(
// //                     !isNaN(date.getTime())
// //                         ? `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`
// //                         : 'Offline'
// //                 );
// //             } else {
// //                 setLastSeen('Offline');
// //             }
// //         });

// //         const lastSeenRef = databaseRef(database, `lastSeenA/${user.id}`);
// //         update(lastSeenRef, { timestamp: Date.now() });

// //         return () => {
// //             update(lastSeenRef, { timestamp: null });
// //         };
// //     }, [user.id, otherUser.id]);

// //     // Handle file selection
// //     const handleFileChange = (event) => {
// //         const files = Array.from(event.target.files);
// //         setSelectedFiles((prevFiles) => [...prevFiles, ...files]);
// //     };

// //     const removeFile = (index) => {
// //         setSelectedFiles((prevFiles) => prevFiles.filter((_, i) => i !== index));
// //     };

// //     const sendMessage = async () => {
// //         if (messageText.trim() === "" && selectedFiles.length === 0) return;

// //         const messagesRef = databaseRef(database, `messagesA/${user.id}/${otherUser.id}`);
// //         const newMessage = {
// //             text: messageText,
// //             sender: user.id,
// //             timestamp: Date.now(),
// //             read: false,
// //             files: [],
// //         };

// //         setUploading(true);

// //         const uploadedFiles = await Promise.all(selectedFiles.map(async (file) => {
// //             const fileRef = storageRef(storage, `chatFilesA/${file.name}`);
// //             await uploadBytes(fileRef, file);
// //             return getDownloadURL(fileRef);
// //         }));

// //         newMessage.files = uploadedFiles;

// //         const newMsgRef = await push(messagesRef, newMessage);
// //         setMessageText('');
// //         setSelectedFiles([]);

// //         const recipientRef = databaseRef(database, `messagesA/${otherUser.id}/${user.id}`);
// //         await push(recipientRef, { ...newMessage, id: newMsgRef.key });

// //         setUploading(false);
// //         const lastSeenRef = databaseRef(database, `lastSeenA/${user.id}`);
// //         update(lastSeenRef, { timestamp: Date.now() });
// //     };

// //     const renderMedia = () => {
// //         if (selectedFiles.length === 0) return null;

// //         return (
// //             <div className="flex flex-wrap mt-1">
// //                 {selectedFiles.map((file, index) => (
// //                     <div key={index} className="relative w-20 h-20 m-1">
// //                         <div className="flex flex-col items-center">
// //                             <a
// //                                 href={URL.createObjectURL(file)}
// //                                 target="_blank"
// //                                 rel="noopener noreferrer"
// //                                 className="flex items-center justify-center border border-gray-300 rounded-lg w-full h-full"
// //                             >
// //                                 {file.type.startsWith('image/') ? (
// //                                     <img src={URL.createObjectURL(file)} alt="Media" className="object-cover h-full w-full rounded-lg" />
// //                                 ) : (
// //                                     <span className="text-sm">File</span>
// //                                 )}
// //                             </a>
// //                             <div className="dropdown relative">
// //                                 <button className="focus:outline-none">
// //                                     <span className="material-icons">more_vert</span>
// //                                 </button>
// //                                 <div className="dropdown-menu absolute hidden bg-white border rounded shadow-lg mt-1">
// //                                     <div className="py-1">
// //                                         <button
// //                                             className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
// //                                             onClick={() => removeFile(index)}
// //                                         >
// //                                             Remove
// //                                         </button>
// //                                     </div>
// //                                 </div>
// //                             </div>
// //                         </div>
// //                     </div>
// //                 ))}
// //             </div>
// //         );
// //     };

// //     return (
// //         <div className="flex flex-col h-screen bg-gray-100">
// //             <div className="flex-none p-4 bg-white border-b border-gray-300">
// //                 <h2 className="text-xl text-center">{otherUser.name}</h2>
// //                 <p className="text-sm text-center">{lastSeen ? 'Last seen: ' + lastSeen : 'Offline'}</p>
// //             </div>
// //             <div className="flex-1 overflow-y-auto p-4">
// //                 {messages.map((msg, index) => {
// //                     const showDateHeader =
// //                         index === 0 || new Date(msg.timestamp).toDateString() !== new Date(messages[index - 1].timestamp).toDateString();

// //                     return (
// //                         <React.Fragment key={msg.id || msg.timestamp}>
// //                             {showDateHeader && (
// //                                 <div className="text-center text-gray-500 dark:text-gray-400 my-4">
// //                                     {new Date(msg.timestamp).toLocaleDateString()}
// //                                 </div>
// //                             )}
// //                             <div
// //                                 className={`flex items-start gap-2.5 mb-4 ${
// //                                     msg.sender === user.id ? 'flex-row-reverse' : ''
// //                                 }`}
// //                             >
// //                                 <div
// //                                     className={`flex flex-col w-full max-w-[326px] p-4 ${
// //                                         msg.sender === user.id
// //                                             ? 'bg-blue-100 dark:bg-blue-800 rounded-s-xl rounded-es-xl'
// //                                             : 'bg-gray-100 dark:bg-gray-700 rounded-e-xl rounded-es-xl'
// //                                     } border border-gray-200 dark:border-gray-600`}
// //                                 >
// //                                     <div className="flex items-center justify-between mb-2">
// //                                         <span className="text-sm font-semibold text-gray-900 dark:text-white">
// //                                             {msg.senderName}
// //                                         </span>
// //                                         <span className="text-sm font-normal text-gray-500 dark:text-gray-400">
// //                                             {new Date(msg.timestamp).toLocaleTimeString()}
// //                                         </span>
// //                                     </div>
// //                                     <p className="text-sm font-normal text-gray-900 dark:text-white mb-2">{msg.text}</p>
// //                                     {renderMedia()}
// //                                     <div className="flex justify-between items-center">
// //                                         <span className="text-sm font-normal text-gray-500 dark:text-gray-400">
// //                                             {msg.read ? '✔✔' : '✔'}
// //                                         </span>
// //                                     </div>
// //                                 </div>
// //                             </div>
// //                         </React.Fragment>
// //                     );
// //                 })}
// //             </div>

// //             <div className="flex items-center p-4 border-t border-gray-300">
// //                 <input
// //                     type="file"
// //                     multiple
// //                     accept="image/*,video/*"
// //                     className="hidden"
// //                     id="fileInput"
// //                     onChange={handleFileChange}
// //                 />
// //                 <label htmlFor="fileInput" className="cursor-pointer">
// //                     <span className="material-icons">attach_file</span>
// //                 </label>
// //                 <input
// //                     type="text"
// //                     value={messageText}
// //                     onChange={(e) => setMessageText(e.target.value)}
// //                     placeholder="Type a message..."
// //                     className="flex-1 p-2 border rounded-lg mx-2"
// //                 />
// //                 <button
// //                     onClick={sendMessage}
// //                     className={`px-4 py-2 text-white rounded-lg ${uploading ? 'bg-gray-400' : 'bg-blue-500 hover:bg-blue-600'}`}
// //                     disabled={uploading}
// //                 >
// //                     {uploading ? 'Sending...' : 'Send'}
// //                 </button>
// //             </div>
// //         </div>
// //     );
// // };

// // export default Chat;

// // // "use client"; // Enable client-side rendering
// // // import React, { useState, useEffect } from 'react';
// // // import { database, storage } from '../config/firebase'; // Ensure Firebase is configured
// // // import { ref as databaseRef, onValue, push, update } from 'firebase/database';
// // // import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
// // // import 'tailwindcss/tailwind.css';

// // // const Chat = ({ user }) => {
// // //     const otherUser = user.id === 'user1' ? { id: 'user2', name: 'User 2' } : { id: 'user1', name: 'User 1' };

// // //     const [messages, setMessages] = useState([]);
// // //     const [messageText, setMessageText] = useState('');
// // //     const [selectedFiles, setSelectedFiles] = useState([]);
// // //     const [uploading, setUploading] = useState(false);
// // //     const [otherUserStatus, setOtherUserStatus] = useState('');
// // //     const [lastSeen, setLastSeen] = useState('');

// // //     useEffect(() => {
// // //         const messagesRef = databaseRef(database, `messagesA/${user.id}/${otherUser.id}`);
// // //         onValue(messagesRef, (snapshot) => {
// // //             const data = snapshot.val();
// // //             const loadedMessages = data ? Object.values(data) : [];
// // //             setMessages(loadedMessages);
// // //             loadedMessages.forEach((msg) => {
// // //                 if (!msg.read && msg.sender !== user.id) {
// // //                     update(databaseRef(database, `messagesA/${user.id}/${otherUser.id}/${msg.id}`), { read: true });
// // //                     update(databaseRef(database, `messagesA/${otherUser.id}/${user.id}/${msg.id}`), { read: true });
// // //                 }
// // //             });
// // //         });

// // //         const userStatusRef = databaseRef(database, `lastSeenA/${otherUser.id}`);
// // //         onValue(userStatusRef, (snapshot) => {
// // //             const status = snapshot.val();
// // //             const timestamp = status && status.timestamp ? Number(status.timestamp) : null;
// // //             if (timestamp && timestamp.toString().length === 13) {
// // //                 const date = new Date(timestamp);
// // //                 setLastSeen(
// // //                     !isNaN(date.getTime())
// // //                         ? `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`
// // //                         : 'Offline'
// // //                 );
// // //             } else {
// // //                 setLastSeen('Offline');
// // //             }
// // //         });

// // //         const lastSeenRef = databaseRef(database, `lastSeenA/${user.id}`);
// // //         update(lastSeenRef, { timestamp: Date.now() });

// // //         return () => {
// // //             update(lastSeenRef, { timestamp: null });
// // //         };
// // //     }, [user.id, otherUser.id]);

// // //     // Handle file selection
// // //     const handleFileChange = (event) => {
// // //         const files = Array.from(event.target.files);
// // //         setSelectedFiles((prevFiles) => [...prevFiles, ...files]);
// // //     };

// // //     const removeFile = (index) => {
// // //         setSelectedFiles((prevFiles) => prevFiles.filter((_, i) => i !== index));
// // //     };

// // //     const sendMessage = async () => {
// // //         if (messageText.trim() === "" && selectedFiles.length === 0) return;

// // //         const messagesRef = databaseRef(database, `messagesA/${user.id}/${otherUser.id}`);
// // //         const newMessage = {
// // //             text: messageText,
// // //             sender: user.id,
// // //             timestamp: Date.now(),
// // //             read: false,
// // //             files: [],
// // //         };

// // //         setUploading(true);

// // //         const uploadedFiles = await Promise.all(selectedFiles.map(async (file) => {
// // //             const fileRef = storageRef(storage, `chatFilesA/${file.name}`);
// // //             await uploadBytes(fileRef, file);
// // //             return getDownloadURL(fileRef);
// // //         }));

// // //         newMessage.files = uploadedFiles;

// // //         const newMsgRef = await push(messagesRef, newMessage);
// // //         setMessageText('');
// // //         setSelectedFiles([]);

// // //         const recipientRef = databaseRef(database, `messagesA/${otherUser.id}/${user.id}`);
// // //         await push(recipientRef, { ...newMessage, id: newMsgRef.key });

// // //         setUploading(false);
// // //         const lastSeenRef = databaseRef(database, `lastSeenA/${user.id}`);
// // //         update(lastSeenRef, { timestamp: Date.now() });
// // //     };

// // //     const renderMedia = (files) => {
// // //         if (!files || files.length === 0) return null;

// // //         const displayedFiles = files.slice(0, 3);
// // //         const additionalCount = files.length > 3 ? files.length - 3 : 0;

// // //         return (
// // //             <div className="flex flex-wrap mt-1">
// // //                 {displayedFiles.map((file, index) => (
// // //                     <div key={index} className="relative w-20 h-20 m-1">
// // //                         <button
// // //                             onClick={() => removeFile(index)}
// // //                             className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1"
// // //                         >
// // //                             ✖
// // //                         </button>
// // //                         <a
// // //                             href={file}
// // //                             target="_blank"
// // //                             rel="noopener noreferrer"
// // //                             className="flex items-center justify-center border border-gray-300 rounded-lg w-full h-full"
// // //                         >
// // //                             {file.endsWith('.jpg') || file.endsWith('.png') || file.endsWith('.gif') ? (
// // //                                 <img src={file} alt="Media" className="object-cover h-full w-full rounded-lg" />
// // //                             ) : (
// // //                                 <span className="text-sm">File</span>
// // //                             )}
// // //                         </a>
// // //                     </div>
// // //                 ))}
// // //                 {additionalCount > 0 && (
// // //                     <div className="flex items-center justify-center w-20 h-20 border border-gray-300 rounded-lg m-1">
// // //                         <span className="text-sm">{`+${additionalCount} more`}</span>
// // //                     </div>
// // //                 )}
// // //             </div>
// // //         );
// // //     };

// // //     return (
// // //         <div className="flex flex-col h-screen bg-gray-100">
// // //             <div className="flex-none p-4 bg-white border-b border-gray-300">
// // //                 <h2 className="text-xl text-center">{otherUser.name}</h2>
// // //                 <p className="text-sm text-center">{lastSeen ? 'Last seen: ' + lastSeen : 'Offline'}</p>
// // //             </div>
// // //             <div className="flex-1 overflow-y-auto p-4">
// // //                 {messages.map((msg, index) => {
// // //                     const showDateHeader =
// // //                         index === 0 || new Date(msg.timestamp).toDateString() !== new Date(messages[index - 1].timestamp).toDateString();

// // //                     return (
// // //                         <React.Fragment key={msg.id || msg.timestamp}>
// // //                             {showDateHeader && (
// // //                                 <div className="text-center text-gray-500 dark:text-gray-400 my-4">
// // //                                     {new Date(msg.timestamp).toLocaleDateString()}
// // //                                 </div>
// // //                             )}
// // //                             <div
// // //                                 className={`flex items-start gap-2.5 mb-4 ${
// // //                                     msg.sender === user.id ? 'flex-row-reverse' : ''
// // //                                 }`}
// // //                             >
// // //                                 <img
// // //                                     className="w-8 h-8 rounded-full"
// // //                                     src={msg.profileImage || 'default-profile.png'}
// // //                                     alt={`${msg.sender} profile`}
// // //                                 />
// // //                                 <div
// // //                                     className={`flex flex-col w-full max-w-[326px] p-4 ${
// // //                                         msg.sender === user.id
// // //                                             ? 'bg-blue-100 dark:bg-blue-800 rounded-s-xl rounded-es-xl'
// // //                                             : 'bg-gray-100 dark:bg-gray-700 rounded-e-xl rounded-es-xl'
// // //                                     } border border-gray-200 dark:border-gray-600`}
// // //                                 >
// // //                                     <div className="flex items-center justify-between mb-2">
// // //                                         <span className="text-sm font-semibold text-gray-900 dark:text-white">
// // //                                             {msg.senderName}
// // //                                         </span>
// // //                                         <span className="text-sm font-normal text-gray-500 dark:text-gray-400">
// // //                                             {new Date(msg.timestamp).toLocaleTimeString()}
// // //                                         </span>
// // //                                     </div>
// // //                                     <p className="text-sm font-normal text-gray-900 dark:text-white mb-2">{msg.text}</p>
// // //                                     {renderMedia(msg.files)}
// // //                                     <div className="flex justify-between items-center">
// // //                                         <span className="text-sm font-normal text-gray-500 dark:text-gray-400">
// // //                                             {msg.read ? '✔✔' : '✔'}
// // //                                         </span>
// // //                                     </div>
// // //                                 </div>
// // //                             </div>
// // //                         </React.Fragment>
// // //                     );
// // //                 })}
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
// // //                 <input
// // //                     type="text"
// // //                     value={messageText}
// // //                     onChange={(e) => setMessageText(e.target.value)}
// // //                     placeholder="Type a message..."
// // //                     className="flex-1 p-2 border rounded-lg mx-2"
// // //                 />
// // //                 <button
// // //                     onClick={sendMessage}
// // //                     className={`px-4 py-2 text-white rounded-lg ${uploading ? 'bg-gray-400' : 'bg-blue-500 hover:bg-blue-600'}`}
// // //                     disabled={uploading}
// // //                 >
// // //                     {uploading ? 'Sending...' : 'Send'}
// // //                 </button>
// // //             </div>
// // //         </div>
// // //     );
// // // };

// // // export default Chat;



// // // // "use client"; // Enable client-side rendering
// // // // import React, { useState, useEffect } from 'react';
// // // // import { database, storage } from '../config/firebase'; // Ensure Firebase is configured
// // // // import { ref as databaseRef, onValue, push, update } from 'firebase/database';
// // // // import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
// // // // import 'tailwindcss/tailwind.css';

// // // // const Chat = ({ user }) => {
// // // //     const otherUser = user.id === 'user1' ? { id: 'user2', name: 'User 2' } : { id: 'user1', name: 'User 1' };

// // // //     const [messages, setMessages] = useState([]);
// // // //     const [messageText, setMessageText] = useState('');
// // // //     const [selectedFiles, setSelectedFiles] = useState([]);
// // // //     const [uploading, setUploading] = useState(false);
// // // //     const [otherUserStatus, setOtherUserStatus] = useState('');
// // // //     const [lastSeen, setLastSeen] = useState('');

// // // //     useEffect(() => {
// // // //         const messagesRef = databaseRef(database, `messagesA/${user.id}/${otherUser.id}`);
// // // //         onValue(messagesRef, (snapshot) => {
// // // //             const data = snapshot.val();
// // // //             const loadedMessages = data ? Object.values(data) : [];
// // // //             setMessages(loadedMessages);
// // // //             loadedMessages.forEach((msg) => {
// // // //                 if (!msg.read && msg.sender !== user.id) {
// // // //                     update(databaseRef(database, `messagesA/${user.id}/${otherUser.id}/${msg.id}`), { read: true });
// // // //                     update(databaseRef(database, `messagesA/${otherUser.id}/${user.id}/${msg.id}`), { read: true });
// // // //                 }
// // // //             });
// // // //         });

// // // //         const userStatusRef = databaseRef(database, `lastSeenA/${otherUser.id}`);
// // // //         onValue(userStatusRef, (snapshot) => {
// // // //             const status = snapshot.val();
// // // //             const timestamp = status && status.timestamp ? Number(status.timestamp) : null;
// // // //             if (timestamp && timestamp.toString().length === 13) {
// // // //                 const date = new Date(timestamp);
// // // //                 setLastSeen(
// // // //                     !isNaN(date.getTime())
// // // //                         ? `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`
// // // //                         : 'Offline'
// // // //                 );
// // // //             } else {
// // // //                 setLastSeen('Offline');
// // // //             }
// // // //         });

// // // //         const lastSeenRef = databaseRef(database, `lastSeenA/${user.id}`);
// // // //         update(lastSeenRef, { timestamp: Date.now() });

// // // //         return () => {
// // // //             update(lastSeenRef, { timestamp: null });
// // // //         };
// // // //     }, [user.id, otherUser.id]);

// // // //     // Handle file selection
// // // //     const handleFileChange = (event) => {
// // // //         const files = Array.from(event.target.files);
// // // //         setSelectedFiles((prevFiles) => [...prevFiles, ...files]);
// // // //     };

// // // //     const removeFile = (index) => {
// // // //         setSelectedFiles((prevFiles) => prevFiles.filter((_, i) => i !== index));
// // // //     };

// // // //     const sendMessage = async () => {
// // // //         if (messageText.trim() === "" && selectedFiles.length === 0) return;

// // // //         const messagesRef = databaseRef(database, `messagesA/${user.id}/${otherUser.id}`);
// // // //         const newMessage = {
// // // //             text: messageText,
// // // //             sender: user.id,
// // // //             timestamp: Date.now(),
// // // //             read: false,
// // // //             files: [],
// // // //         };

// // // //         setUploading(true);

// // // //         const uploadedFiles = await Promise.all(selectedFiles.map(async (file) => {
// // // //             const fileRef = storageRef(storage, `chatFilesA/${file.name}`);
// // // //             await uploadBytes(fileRef, file);
// // // //             return getDownloadURL(fileRef);
// // // //         }));

// // // //         newMessage.files = uploadedFiles;

// // // //         const newMsgRef = await push(messagesRef, newMessage);
// // // //         setMessageText('');
// // // //         setSelectedFiles([]);

// // // //         const recipientRef = databaseRef(database, `messagesA/${otherUser.id}/${user.id}`);
// // // //         await push(recipientRef, { ...newMessage, id: newMsgRef.key });

// // // //         setUploading(false);
// // // //         const lastSeenRef = databaseRef(database, `lastSeenA/${user.id}`);
// // // //         update(lastSeenRef, { timestamp: Date.now() });
// // // //     };

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
// // // //                 <p className="text-sm text-center">{lastSeen ? 'Last seen: ' + lastSeen : 'Offline'}</p>
// // // //             </div>
// // // //             <div className="flex-1 overflow-y-auto p-4">
// // // //                 {messages.map((msg, index) => {
// // // //                     const showDateHeader =
// // // //                         index === 0 || new Date(msg.timestamp).toDateString() !== new Date(messages[index - 1].timestamp).toDateString();

// // // //                     return (
// // // //                         <React.Fragment key={msg.id || msg.timestamp}>
// // // //                             {showDateHeader && (
// // // //                                 <div className="text-center text-gray-500 dark:text-gray-400 my-4">
// // // //                                     {new Date(msg.timestamp).toLocaleDateString()}
// // // //                                 </div>
// // // //                             )}
// // // //                             <div
// // // //                                 className={`flex items-start gap-2.5 mb-4 ${
// // // //                                     msg.sender === user.id ? 'flex-row-reverse' : ''
// // // //                                 }`}
// // // //                             >
                              
// // // //                                 <div
// // // //                                     className={`flex flex-col w-full max-w-[326px] p-4 ${
// // // //                                         msg.sender === user.id
// // // //                                             ? 'bg-blue-100 dark:bg-blue-800 rounded-s-xl rounded-es-xl'
// // // //                                             : 'bg-gray-100 dark:bg-gray-700 rounded-e-xl rounded-es-xl'
// // // //                                     } border border-gray-200 dark:border-gray-600`}
// // // //                                 >
// // // //                                     <div className="flex items-center justify-between mb-2">
// // // //                                         <span className="text-sm font-semibold text-gray-900 dark:text-white">
// // // //                                             {msg.senderName}
// // // //                                         </span>
// // // //                                         <span className="text-sm font-normal text-gray-500 dark:text-gray-400">
// // // //                                             {new Date(msg.timestamp).toLocaleTimeString()}
// // // //                                         </span>
// // // //                                     </div>
// // // //                                     <p className="text-sm font-normal text-gray-900 dark:text-white mb-2">{msg.text}</p>
// // // //                                     {renderMedia(msg.files)}
// // // //                                     <div className="flex justify-between items-center">
// // // //                                         <span className="text-sm font-normal text-gray-500 dark:text-gray-400">
// // // //                                             {msg.read ? '✔✔' : '✔'}
// // // //                                         </span>
// // // //                                     </div>
// // // //                                 </div>
// // // //                             </div>
// // // //                         </React.Fragment>
// // // //                     );
// // // //                 })}
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
// // // //                     <span className="material-icons">attach_file</span>
// // // //                 </label>
// // // //                 <input
// // // //                     type="text"
// // // //                     value={messageText}
// // // //                     onChange={(e) => setMessageText(e.target.value)}
// // // //                     placeholder="Type a message..."
// // // //                     className="flex-1 p-2 border rounded-lg mx-2"
// // // //                 />
// // // //                 <button
// // // //                     onClick={sendMessage}
// // // //                     className={`px-4 py-2 text-white rounded-lg ${uploading ? 'bg-gray-500' : 'bg-blue-500'}`}
// // // //                     disabled={uploading}
// // // //                 >
// // // //                     {uploading ? 'Sending...' : 'Send'}
// // // //                 </button>
// // // //             </div>
// // // //         </div>
// // // //     );
// // // // };

// // // // export default Chat;



// // // // // "use client"; // Enable client-side rendering
// // // // // import React, { useState, useEffect } from 'react';
// // // // // import { database, storage } from '../config/firebase'; // Pastikan Firebase Storage sudah dikonfigurasi
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
// // // // //     const [lastSeen, setLastSeen] = useState(''); // Last seen timestamp

// // // // //     // Fetch messages and user status from Firebase on component mount
// // // // //     // useEffect(() => {
// // // // //     //     const messagesRef = databaseRef(database, `messages/${user.id}/${otherUser.id}`);
// // // // //     //     onValue(messagesRef, (snapshot) => {
// // // // //     //         const data = snapshot.val();
// // // // //     //         const loadedMessages = data ? Object.values(data) : [];
// // // // //     //         setMessages(loadedMessages);

// // // // //     //         // Mark all messages as read when the user views the chat
// // // // //     //         loadedMessages.forEach((msg) => {
// // // // //     //             if (!msg.read && msg.sender !== user.id) {
// // // // //     //                 update(databaseRef(database, `messages/${user.id}/${otherUser.id}/${msg.id}`), { read: true });
// // // // //     //                 update(databaseRef(database, `messages/${otherUser.id}/${user.id}/${msg.id}`), { read: true });
// // // // //     //             }
// // // // //     //         });
// // // // //     //     });

// // // // //     //     // Fetch other user's last seen status
// // // // //     //     const userStatusRef = databaseRef(database, `lastSeen/${otherUser.id}`);
// // // // //     //     onValue(userStatusRef, (snapshot) => {
// // // // //     //         const status = snapshot.val();
// // // // //     //         setLastSeen(status ? new Date(status.timestamp).toLocaleTimeString() : 'Offline');
// // // // //     //     });

// // // // //     //     // Update last seen when user is active
// // // // //     //     const lastSeenRef = databaseRef(database, `lastSeen/${user.id}`);
// // // // //     //     update(lastSeenRef, { timestamp: Date.now() });

// // // // //     //     return () => {
// // // // //     //         // Cleanup: Remove last seen status when component unmounts
// // // // //     //         update(lastSeenRef, { timestamp: null });
// // // // //     //     };
// // // // //     // }, [user.id, otherUser.id]);
// // // // //     useEffect(() => {
// // // // //         const messagesRef = databaseRef(database, `messagesA/${user.id}/${otherUser.id}`);
// // // // //         onValue(messagesRef, (snapshot) => {
// // // // //             const data = snapshot.val();
// // // // //             const loadedMessages = data ? Object.values(data) : [];
// // // // //             setMessages(loadedMessages);
    
// // // // //             // Mark all messages as read when the user views the chat
// // // // //             loadedMessages.forEach((msg) => {
// // // // //                 if (!msg.read && msg.sender !== user.id) {
// // // // //                     update(databaseRef(database, `messagesA/${user.id}/${otherUser.id}/${msg.id}`), { read: true });
// // // // //                     update(databaseRef(database, `messagesA/${otherUser.id}/${user.id}/${msg.id}`), { read: true });
// // // // //                 }
// // // // //             });
// // // // //         });
    
// // // // //         // Fetch other user's last seen status
// // // // //         // const userStatusRef = databaseRef(database, `lastSeenA/${otherUser.id}`);
// // // // //         // onValue(userStatusRef, (snapshot) => {
// // // // //         //     const status = snapshot.val();
// // // // //         //     const timestamp = status && status.timestamp ? status.timestamp : null;
            
// // // // //         //     // Only attempt to convert to Date if timestamp exists
// // // // //         //     if (timestamp) {
// // // // //         //         try {
// // // // //         //             const date = new Date(parseInt(timestamp, 10)); // Ensures timestamp is treated as an integer
// // // // //         //             setLastSeen(!isNaN(date.getTime()) ? date.toLocaleTimeString() : 'Offline');
// // // // //         //         } catch (error) {
// // // // //         //             console.error("Error parsing date:", error);
// // // // //         //             setLastSeen('Offline');
// // // // //         //         }
// // // // //         //     } else {
// // // // //         //         setLastSeen('Offline');
// // // // //         //     }
// // // // //         // });
// // // // //         const userStatusRef = databaseRef(database, `lastSeenA/${otherUser.id}`);
// // // // //         // onValue(userStatusRef, (snapshot) => {
// // // // //         //     const status = snapshot.val();
// // // // //         //     const timestamp = status && status.timestamp ? Number(status.timestamp) : null;
    
// // // // //         //     if (timestamp && timestamp.toString().length === 13) {  // Check if in milliseconds
// // // // //         //         const date = new Date(timestamp);
// // // // //         //         setLastSeen(!isNaN(date.getTime()) ? date.toLocaleTimeString() : 'Offline');
// // // // //         //     } else {
// // // // //         //         console.error("Timestamp is invalid or missing:", timestamp);
// // // // //         //         setLastSeen('Offline');
// // // // //         //     }
// // // // //         // });
// // // // //         onValue(userStatusRef, (snapshot) => {
// // // // //             const status = snapshot.val();
// // // // //             const timestamp = status && status.timestamp ? Number(status.timestamp) : null;
    
// // // // //             if (timestamp && timestamp.toString().length === 13) {  // Check if in milliseconds
// // // // //                 const date = new Date(timestamp);
// // // // //                 setLastSeen(
// // // // //                     !isNaN(date.getTime())
// // // // //                         ? `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`
// // // // //                         : 'Offline'
// // // // //                 );
// // // // //             } else {
// // // // //                 console.error("Timestamp is invalid or missing:", timestamp);
// // // // //                 setLastSeen('Offline');
// // // // //             }
// // // // //         });
    
// // // // //         // Update last seen when user is active
// // // // //         const lastSeenRef = databaseRef(database, `lastSeenA/${user.id}`);
// // // // //         update(lastSeenRef, { timestamp: Date.now() });
    
// // // // //         return () => {
// // // // //             // Cleanup: Remove last seen status when component unmounts
// // // // //             update(lastSeenRef, { timestamp: null });
// // // // //         };
// // // // //     }, [user.id, otherUser.id]);

// // // // //     const [dropdownOpen, setDropdownOpen] = useState(null);

// // // // //     const toggleDropdown = (index) => {
// // // // //         setDropdownOpen(dropdownOpen === index ? null : index);
// // // // //     };
    
// // // // //     const isDropdownOpen = (index) => dropdownOpen === index;


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

// // // // //         const messagesRef = databaseRef(database, `messagesA/${user.id}/${otherUser.id}`);
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
// // // // //             const fileRef = storageRef(storage, `chatFilesA/${file.name}`);
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
// // // // //         const recipientRef = databaseRef(database, `messagesA/${otherUser.id}/${user.id}`);
// // // // //         await push(recipientRef, { ...newMessage, id: newMsgRef.key });

// // // // //         setUploading(false);

// // // // //         // Update last seen when a message is sent
// // // // //         const lastSeenRef = databaseRef(database, `lastSeenA/${user.id}`);
// // // // //         update(lastSeenRef, { timestamp: Date.now() });
// // // // //     };

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
// // // // //                 <p className="text-sm text-center">{lastSeen ? 'Last seen: ' + lastSeen : 'Offline'}</p>
// // // // //             </div>
// // // // //             <div className="flex-1 overflow-y-auto p-4">
// // // // //               {messages.map((msg, index) => {
// // // // //                 // Determine if a new date header is needed
// // // // //                 const showDateHeader =
// // // // //                   index === 0 || new Date(msg.timestamp).toDateString() !== new Date(messages[index - 1].timestamp).toDateString();
        
// // // // //                 return (
// // // // //                   <React.Fragment key={msg.id || msg.timestamp}>
// // // // //                     {/* Date Header */}
// // // // //                     {showDateHeader && (
// // // // //                       <div className="text-center text-gray-500 dark:text-gray-400 my-4">
// // // // //                         {new Date(msg.timestamp).toLocaleDateString()}
// // // // //                       </div>
// // // // //                     )}
        
// // // // //                     {/* Message Bubble */}
// // // // //                     <div
// // // // //                       className={`flex items-start gap-2.5 mb-4 ${
// // // // //                         msg.sender === 'user1' ? 'flex-row-reverse' : ''
// // // // //                       }`}
// // // // //                     >
// // // // //                       {/* Profile Picture */}
// // // // //                       <img
// // // // //                         className="w-8 h-8 rounded-full"
// // // // //                         src={msg.profileImage}
// // // // //                         alt={`${msg.senderName} profile`}
// // // // //                       />
        
// // // // //                       {/* Message Content */}
// // // // //                       <div
// // // // //                         className={`flex flex-col w-full max-w-[326px] p-4 ${
// // // // //                           msg.sender === 'user1'
// // // // //                             ? 'bg-blue-100 dark:bg-blue-800 rounded-s-xl rounded-es-xl'
// // // // //                             : 'bg-gray-100 dark:bg-gray-700 rounded-e-xl rounded-es-xl'
// // // // //                         } border border-gray-200 dark:border-gray-600`}
// // // // //                       >
// // // // //                         <div className="flex items-center justify-between mb-2">
// // // // //                           <span className="text-sm font-semibold text-gray-900 dark:text-white">
// // // // //                             {msg.senderName}
// // // // //                           </span>
// // // // //                           <span className="text-sm font-normal text-gray-500 dark:text-gray-400">
// // // // //                             {new Date(msg.timestamp).toLocaleTimeString()}
// // // // //                           </span>
// // // // //                         </div>
        
// // // // //                         {/* Message Text */}
// // // // //                         <p className="text-sm font-normal text-gray-900 dark:text-white mb-2">{msg.text}</p>
        
// // // // //                         {/* Media Grid (if any) */}
// // // // //                         {msg.files && msg.files.length > 0 && (
// // // // //                           <div className="grid grid-cols-2 gap-4 my-2.5">
// // // // //                             {msg.files.slice(0, 3).map((file, i) => (
// // // // //                               <div key={i} className="group relative">
// // // // //                                 <img src={file.url} className="rounded-lg" alt={`file-${i}`} />
// // // // //                               </div>
// // // // //                             ))}
// // // // //                             {msg.files.length > 3 && (
// // // // //                               <div className="group relative">
// // // // //                                 <button className="absolute w-full h-full bg-gray-900/90 text-white rounded-lg flex items-center justify-center">
// // // // //                                   +{msg.files.length - 3}
// // // // //                                 </button>
// // // // //                                 <img src={msg.files[0].url} className="rounded-lg" alt="Additional files" />
// // // // //                               </div>
// // // // //                             )}
// // // // //                           </div>
// // // // //                         )}
        
// // // // //                         {/* Message Status */}
// // // // //                         <div className="flex justify-between items-center">
// // // // //                           <span className="text-sm font-normal text-gray-500 dark:text-gray-400">
// // // // //                             {msg.read ? '✔✔' : '✔'}
// // // // //                           </span>
// // // // //                         </div>
// // // // //                       </div>
        
// // // // //                       {/* Dropdown Menu Button */}
// // // // //                       <button
// // // // //                         id={`dropdownMenuIconButton-${index}`}
// // // // //                         className="inline-flex self-center items-center p-2 text-sm font-medium text-gray-900 bg-white rounded-lg hover:bg-gray-100 focus:ring-4 focus:outline-none dark:text-white focus:ring-gray-50 dark:bg-gray-900 dark:hover:bg-gray-800 dark:focus:ring-gray-600"
// // // // //                         type="button"
// // // // //                       >
// // // // //                         <svg
// // // // //                           className="w-4 h-4 text-gray-500 dark:text-gray-400"
// // // // //                           xmlns="http://www.w3.org/2000/svg"
// // // // //                           fill="currentColor"
// // // // //                           viewBox="0 0 4 15"
// // // // //                         >
// // // // //                           <path d="M3.5 1.5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0Zm0 6.041a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0Zm0 5.959a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0Z" />
// // // // //                         </svg>
// // // // //                       </button>
        
// // // // //                       {/* Dropdown Menu Content */}
// // // // //                       <div
// // // // //                         id={`dropdownDots-${index}`}
// // // // //                         className="z-10 hidden bg-white divide-y divide-gray-100 rounded-lg shadow w-40 dark:bg-gray-700 dark:divide-gray-600"
// // // // //                       >
// // // // //                         <ul className="py-2 text-sm text-gray-700 dark:text-gray-200" aria-labelledby={`dropdownMenuIconButton-${index}`}>
// // // // //                           <li><a href="#" className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600">Reply</a></li>
// // // // //                           <li><a href="#" className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600">Forward</a></li>
// // // // //                           <li><a href="#" className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600">Copy</a></li>
// // // // //                           <li><a href="#" className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600">Report</a></li>
// // // // //                           <li><a href="#" className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600">Delete</a></li>
// // // // //                         </ul>
// // // // //                       </div>
// // // // //                     </div>
// // // // //                   </React.Fragment>
// // // // //                 );
// // // // //               })}
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
// // // // //                     <span className="material-icons">file</span>
// // // // //                 </label>
// // // // //                 <div className="flex flex-wrap">
// // // // //                     {selectedFiles.map((file, index) => (
// // // // //                         <div key={index} className="relative mr-2 flex items-center">
// // // // //                             <span
// // // // //                                 className="absolute top-0 right-0 cursor-pointer text-red-500"
// // // // //                                 onClick={() => removeFile(index)}
// // // // //                             >
// // // // //                                 &times;
// // // // //                             </span>
// // // // //                             {/* Display a thumbnail or video preview based on file type */}
// // // // //                             {file.type.startsWith("video") ? (
// // // // //                                 <video
// // // // //                                     src={URL.createObjectURL(file)}
// // // // //                                     className="w-20 h-20 object-cover rounded-lg m-1"
// // // // //                                     controls
// // // // //                                 />
// // // // //                             ) : (
// // // // //                                 <img
// // // // //                                     src={URL.createObjectURL(file)}
// // // // //                                     alt="Selected file"
// // // // //                                     className="w-20 h-20 object-cover rounded-lg m-1"
// // // // //                                 />
// // // // //                             )}
// // // // //                         </div>
// // // // //                     ))}
// // // // //                 </div>

// // // // //                 <input
// // // // //                     type="text"
// // // // //                     className="border rounded-lg p-2 flex-1 mx-2"
// // // // //                     placeholder="Type a message..."
// // // // //                     value={messageText}
// // // // //                     onChange={(e) => setMessageText(e.target.value)}
// // // // //                 />
// // // // //                 <button
// // // // //                     className="ml-2 p-2 bg-blue-500 text-white rounded-lg"
// // // // //                     onClick={sendMessage}
// // // // //                     disabled={uploading}
// // // // //                 >
// // // // //                     {uploading ? "Sending..." : "Send"}
// // // // //                 </button>
// // // // //             </div>
// // // // //         </div>
// // // // //     );
// // // // // };

// // // // // export default Chat;


// // // // // // "use client"; // Enable client-side rendering
// // // // // // import React, { useState, useEffect } from 'react';
// // // // // // import { database, storage } from '../config/firebase'; // Ensure Firebase is configured
// // // // // // import { ref as databaseRef, onValue, push, update } from 'firebase/database';
// // // // // // import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
// // // // // // import 'tailwindcss/tailwind.css';

// // // // // // const ChatA = ({ user }) => {
// // // // // //     const isAdmin = user.id === 'admin'; // Define if the user is an admin
// // // // // //     const [messages, setMessages] = useState([]);
// // // // // //     const [messageText, setMessageText] = useState('');
// // // // // //     const [selectedFiles, setSelectedFiles] = useState([]);
// // // // // //     const [uploading, setUploading] = useState(false);
// // // // // //     const [lastSeen, setLastSeen] = useState(''); // Last seen timestamp
// // // // // //     const [allConversations, setAllConversations] = useState({}); // For admin to see all chats

// // // // // //     useEffect(() => {
// // // // // //         if (isAdmin) {
// // // // // //             // Admin view: Load all conversations
// // // // // //             const messagesRef = databaseRef(database, `messages`);
// // // // // //             onValue(messagesRef, (snapshot) => {
// // // // // //                 const data = snapshot.val() || {};
// // // // // //                 setAllConversations(data);
// // // // // //             });
// // // // // //         } else {
// // // // // //             // Normal user view: Load user-specific messages
// // // // // //             const otherUser = user.id === 'user1' ? { id: 'user2', name: 'User 2' } : { id: 'user1', name: 'User 1' };
// // // // // //             const messagesRef = databaseRef(database, `messages/${user.id}/${otherUser.id}`);

// // // // // //             onValue(messagesRef, (snapshot) => {
// // // // // //                 const data = snapshot.val();
// // // // // //                 const loadedMessages = data ? Object.values(data) : [];
// // // // // //                 setMessages(loadedMessages);

// // // // // //                 // Mark all messages as read when the user views the chat
// // // // // //                 loadedMessages.forEach((msg) => {
// // // // // //                     if (!msg.read && msg.sender !== user.id) {
// // // // // //                         update(databaseRef(database, `messages/${user.id}/${otherUser.id}/${msg.id}`), { read: true });
// // // // // //                         update(databaseRef(database, `messages/${otherUser.id}/${user.id}/${msg.id}`), { read: true });
// // // // // //                     }
// // // // // //                 });
// // // // // //             });
// // // // // //         }
// // // // // //     }, [user.id, isAdmin]);

// // // // // //     // Fetch other user's last seen status
// // // // // //     useEffect(() => {
// // // // // //         const userStatusRef = databaseRef(database, `lastSeen/${user.id}`);
// // // // // //         onValue(userStatusRef, (snapshot) => {
// // // // // //             const status = snapshot.val();
// // // // // //             setLastSeen(status ? new Date(status.timestamp).toLocaleTimeString() : 'Offline');
// // // // // //         });

// // // // // //         // Update last seen when user is active
// // // // // //         const lastSeenRef = databaseRef(database, `lastSeen/${user.id}`);
// // // // // //         update(lastSeenRef, { timestamp: Date.now() });

// // // // // //         return () => {
// // // // // //             // Cleanup: Remove last seen status when component unmounts
// // // // // //             update(lastSeenRef, { timestamp: null });
// // // // // //         };
// // // // // //     }, [user.id]);

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

// // // // // //         const messagesRef = databaseRef(database, `messages/${user.id}/user2`); // Adjust if targeting specific users
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

// // // // // //         // Update last seen when a message is sent
// // // // // //         const lastSeenRef = databaseRef(database, `lastSeen/${user.id}`);
// // // // // //         update(lastSeenRef, { timestamp: Date.now() });

// // // // // //         setUploading(false);
// // // // // //     };

// // // // // //     // Render grouped messages by date
// // // // // //     const renderMessages = (msgs) => {
// // // // // //         let currentDay = '';

// // // // // //         return msgs.sort((a, b) => a.timestamp - b.timestamp).map((msg, index) => {
// // // // // //             const messageDate = new Date(msg.timestamp);
// // // // // //             const messageDay = messageDate.toDateString();
// // // // // //             const isNewDay = messageDay !== currentDay;
// // // // // //             currentDay = messageDay;

// // // // // //             return (
// // // // // //                 <div key={index}>
// // // // // //                     {isNewDay && (
// // // // // //                         <div className="text-center text-gray-500 mt-4 mb-2">
// // // // // //                             {messageDate.toLocaleDateString()}
// // // // // //                         </div>
// // // // // //                     )}
// // // // // //                     <div className={`mb-2 ${msg.sender === user.id ? 'text-right' : 'text-left'}`}>
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
// // // // // //                 </div>
// // // // // //             );
// // // // // //         });
// // // // // //     };

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
// // // // // //                 <h2 className="text-xl text-center">{isAdmin ? 'All Conversations' : 'Chat'}</h2>
// // // // // //                 <p className="text-sm text-center">{lastSeen ? 'Last seen: ' + lastSeen : 'Offline'}</p>
// // // // // //             </div>
// // // // // //             <div className="flex-1 overflow-y-auto p-4">
// // // // // //                 {/* Display messages */}
// // // // // //                 {isAdmin ? (
// // // // // //                     // Admin view: Show all conversations
// // // // // //                     Object.entries(allConversations).map(([userId, chats]) => (
// // // // // //                         <div key={userId}>
// // // // // //                             <h3 className="text-center text-lg mb-4">{`Conversation with ${userId}`}</h3>
// // // // // //                             {renderMessages(Object.values(chats))}
// // // // // //                         </div>
// // // // // //                     ))
// // // // // //                 ) : (
// // // // // //                     // Regular user view
// // // // // //                     renderMessages(messages)
// // // // // //                 )}
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
// // // // // //                     <span className="material-icons">file</span>
// // // // // //                 </label>
// // // // // //                 <div className="flex flex-wrap">
// // // // // //                     {selectedFiles.map((file, index) => (
// // // // // //                         <div key={index} className="relative mr-2">
// // // // // //                             <span>{file.name}</span>
// // // // // //                             <button
// // // // // //                                 onClick={() => removeFile(index)}
// // // // // //                                 className="absolute top-0 right-0 bg-red-500 text-white rounded-full"
// // // // // //                             >
// // // // // //                                 &times;
// // // // // //                             </button>
// // // // // //                         </div>
// // // // // //                     ))}
// // // // // //                 </div>
// // // // // //                 <input
// // // // // //                     type="text"
// // // // // //                     value={messageText}
// // // // // //                     onChange={(e) => setMessageText(e.target.value)}
// // // // // //                     placeholder="Type a message..."
// // // // // //                     className="flex-1 p-2 border rounded-md"
// // // // // //                 />
// // // // // //                 <button
// // // // // //                     onClick={sendMessage}
// // // // // //                     disabled={uploading}
// // // // // //                     className="ml-2 px-4 py-2 bg-blue-500 text-white rounded-md"
// // // // // //                 >
// // // // // //                     {uploading ? 'Sending...' : 'Send'}
// // // // // //                 </button>
// // // // // //             </div>
// // // // // //         </div>
// // // // // //     );
// // // // // // };

// // // // // // export default ChatA;
