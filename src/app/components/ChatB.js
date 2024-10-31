"use client"; // Enable client-side rendering
import React, { useState, useEffect } from 'react';
import { database, storage } from '../config/firebase';
import { ref as databaseRef, onValue, push, update } from 'firebase/database';
import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
import 'tailwindcss/tailwind.css';

const Chat = ({ user }) => {
    const otherUser = user.id === 'user1' ? { id: 'user2', name: 'User 2' } : { id: 'user1', name: 'User 1' };
    const [messages, setMessages] = useState([]);
    const [messageText, setMessageText] = useState('');
    const [selectedFiles, setSelectedFiles] = useState([]);
    const [uploading, setUploading] = useState(false);
    const [lastSeen, setLastSeen] = useState('Offline');
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [chatSettings, setChatSettings] = useState({
        senderBubbleColor: '#3B82F6', // Default bubble color
        receiverBubbleColor: '#E5E7EB', // Default bubble color
        senderTextColor: '#FFFFFF', // Default sender text color
        receiverTextColor: '#000000', // Default receiver text color
        isNightMode: false,
    });

    useEffect(() => {
        const savedSettings = JSON.parse(localStorage.getItem(`chatSettings-${user.id}`));
        if (savedSettings) {
            setChatSettings(savedSettings);
        }
    }, [user.id]);

    const saveSettings = (newSettings) => {
        const settings = { ...chatSettings, ...newSettings };
        setChatSettings(settings);
        localStorage.setItem(`chatSettings-${user.id}`, JSON.stringify(settings));
    };

    useEffect(() => {
        const messagesRef = databaseRef(database, `messagesA/${user.id}/${otherUser.id}`);
        onValue(messagesRef, (snapshot) => {
            const data = snapshot.val();
            setMessages(data ? Object.values(data) : []);

            data && Object.values(data).forEach((msg) => {
                if (!msg.read && msg.sender !== user.id) {
                    update(databaseRef(database, `messagesA/${user.id}/${otherUser.id}/${msg.id}`), { read: true });
                    update(databaseRef(database, `messagesA/${otherUser.id}/${user.id}/${msg.id}`), { read: true });
                }
            });
        });

        const userStatusRef = databaseRef(database, `lastSeenA/${otherUser.id}`);
        onValue(userStatusRef, (snapshot) => {
            const timestamp = snapshot.val()?.timestamp || null;
            if (timestamp) {
                const date = new Date(Number(timestamp));
                setLastSeen(date.toLocaleString() || 'Offline');
            }
        });

        update(databaseRef(database, `lastSeenA/${user.id}`), { timestamp: Date.now() });

        return () => {
            update(databaseRef(database, `lastSeenA/${user.id}`), { timestamp: null });
        };
    }, [user.id, otherUser.id]);

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
        setUploading(false);

        await push(databaseRef(database, `messagesA/${otherUser.id}/${user.id}`), { ...newMessage, id: newMsgRef.key });
        update(databaseRef(database, `lastSeenA/${user.id}`), { timestamp: Date.now() });
    };

    const renderMedia = (files) => {
        return files && files.length > 0 ? (
            <div className="grid grid-cols-4 gap-2 mt-2">
                {files.map((file, index) => (
                    <a key={index} href={file} target="_blank" rel="noopener noreferrer" className="w-20 h-20 border rounded-lg overflow-hidden bg-white">
                        {file.endsWith('.jpg') || file.endsWith('.png') || file.endsWith('.gif') ? (
                            <img src={file} alt="Media" className="object-cover h-full w-full" />
                        ) : (
                            <span className="text-sm text-gray-600">File</span>
                        )}
                    </a>
                ))}
            </div>
        ) : null;
    };

    return (
        <div className={`flex flex-col h-screen ${chatSettings.isNightMode ? 'bg-gray-900' : 'bg-gray-100'}`}>
            <header className="flex-none p-4 bg-white border-b border-gray-300 text-center">
                <h2 className="text-xl">{otherUser.name}</h2>
                <p className="text-sm">{lastSeen ? 'Last seen: ' + lastSeen : 'Offline'}</p>
                <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="text-gray-500 hover:text-gray-700">
                    •
                    •
                    •                    
                </button>
                {isMenuOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white border rounded shadow-lg z-10">
                        <div className="p-2">
                            <label className="block text-sm">Sender Bubble Color:</label>
                            <input
                                type="color"
                                value={chatSettings.senderBubbleColor}
                                onChange={(e) => saveSettings({ senderBubbleColor: e.target.value })}
                                className="w-full h-8 p-0 border-none"
                            />
                        </div>
                        <div className="p-2">
                            <label className="block text-sm">Receiver Bubble Color:</label>
                            <input
                                type="color"
                                value={chatSettings.receiverBubbleColor}
                                onChange={(e) => saveSettings({ receiverBubbleColor: e.target.value })}
                                className="w-full h-8 p-0 border-none"
                            />
                        </div>
                        <div className="p-2">
                            <label className="block text-sm">Sender Text Color:</label>
                            <input
                                type="color"
                                value={chatSettings.senderTextColor}
                                onChange={(e) => saveSettings({ senderTextColor: e.target.value })}
                                className="w-full h-8 p-0 border-none"
                            />
                        </div>
                        <div className="p-2">
                            <label className="block text-sm">Receiver Text Color:</label>
                            <input
                                type="color"
                                value={chatSettings.receiverTextColor}
                                onChange={(e) => saveSettings({ receiverTextColor: e.target.value })}
                                className="w-full h-8 p-0 border-none"
                            />
                        </div>
                        <button onClick={() => saveSettings({ isNightMode: !chatSettings.isNightMode })} className="block px-4 py-2 text-sm hover:bg-gray-100 w-full text-left">
                            Toggle Day/Night Mode
                        </button>
                    </div>
                )}
            </header>
            <main className="flex-1 overflow-y-auto p-4">
                {messages.map((msg) => (
                    (msg.text || (msg.files && msg.files.length > 0)) && (
                        <div key={msg.id || msg.timestamp} className={`mb-2 ${msg.sender === user.id ? 'text-right' : 'text-left'}`}>
                            <div className={`inline-block p-2 rounded-lg`} style={{ backgroundColor: msg.sender === user.id ? chatSettings.senderBubbleColor : chatSettings.receiverBubbleColor }}>
                                {msg.text && <div style={{ color: msg.sender === user.id ? chatSettings.senderTextColor : chatSettings.receiverTextColor }}>{msg.text}</div>}
                                {msg.files && renderMedia(msg.files)}
                            </div>
                            <div className={`text-xs ${chatSettings.isNightMode ? 'text-gray-400' : 'text-gray-500'} mt-1`}>
                                {new Date(msg.timestamp).toLocaleString()}
                            </div>
                        </div>
                    )
                ))}
            </main>
            <footer className="flex items-center p-4 border-t">
                <input
                    type="text"
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    placeholder="Type a message"
                    className="flex-1 border rounded-lg p-2"
                />
                <input type="file" multiple onChange={handleFileChange} className="ml-2" />
                <button onClick={sendMessage} className="ml-2 bg-blue-500 text-white rounded-lg p-2" disabled={uploading}>
                    Send
                </button>
            </footer>
        </div>
    );
};

export default Chat;

// "use client"; // Enable client-side rendering
// import React, { useState, useEffect } from 'react';
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
//     const [lastSeen, setLastSeen] = useState('Offline');
//     const [isMenuOpen, setIsMenuOpen] = useState(false);
//     const [isColorMenuOpen, setIsColorMenuOpen] = useState(false);
//     const [isSenderSettingsOpen, setIsSenderSettingsOpen] = useState(false);
//     const [isReceiverSettingsOpen, setIsReceiverSettingsOpen] = useState(false);
//     const [chatSettings, setChatSettings] = useState({
//         senderBubbleColor: '#3B82F6',
//         receiverBubbleColor: '#E5E7EB',
//         senderTextColor: '#FFFFFF',
//         receiverTextColor: '#000000',
//         isNightMode: false,
//     });

//     useEffect(() => {
//         const savedSettings = JSON.parse(localStorage.getItem(`chatSettings-${user.id}`));
//         if (savedSettings) {
//             setChatSettings(savedSettings);
//         }
//     }, [user.id]);

//     const saveSettings = (newSettings) => {
//         const settings = { ...chatSettings, ...newSettings };
//         setChatSettings(settings);
//         localStorage.setItem(`chatSettings-${user.id}`, JSON.stringify(settings));
//     };

//     useEffect(() => {
//         const messagesRef = databaseRef(database, `messagesA/${user.id}/${otherUser.id}`);
//         onValue(messagesRef, (snapshot) => {
//             const data = snapshot.val();
//             setMessages(data ? Object.values(data) : []);

//             data && Object.values(data).forEach((msg) => {
//                 if (!msg.read && msg.sender !== user.id) {
//                     update(databaseRef(database, `messagesA/${user.id}/${otherUser.id}/${msg.id}`), { read: true });
//                     update(databaseRef(database, `messagesA/${otherUser.id}/${user.id}/${msg.id}`), { read: true });
//                 }
//             });
//         });

//         const userStatusRef = databaseRef(database, `lastSeenA/${otherUser.id}`);
//         onValue(userStatusRef, (snapshot) => {
//             const timestamp = snapshot.val()?.timestamp || null;
//             if (timestamp) {
//                 const date = new Date(Number(timestamp));
//                 setLastSeen(date.toLocaleString() || 'Offline');
//             }
//         });

//         update(databaseRef(database, `lastSeenA/${user.id}`), { timestamp: Date.now() });

//         return () => {
//             update(databaseRef(database, `lastSeenA/${user.id}`), { timestamp: null });
//         };
//     }, [user.id, otherUser.id]);

//     const handleFileChange = (event) => {
//         const files = Array.from(event.target.files);
//         setSelectedFiles((prevFiles) => [...prevFiles, ...files]);
//     };

//     const removeFile = (index) => {
//         setSelectedFiles((prevFiles) => prevFiles.filter((_, i) => i !== index));
//     };

//     const sendMessage = async () => {
//         if (messageText.trim() === "" && selectedFiles.length === 0) return;

//         const messagesRef = databaseRef(database, `messagesA/${user.id}/${otherUser.id}`);
//         const newMessage = {
//             text: messageText,
//             sender: user.id,
//             timestamp: Date.now(),
//             read: false,
//             files: [],
//         };

//         setUploading(true);
//         const uploadedFiles = await Promise.all(selectedFiles.map(async (file) => {
//             const fileRef = storageRef(storage, `chatFilesA/${file.name}`);
//             await uploadBytes(fileRef, file);
//             return getDownloadURL(fileRef);
//         }));

//         newMessage.files = uploadedFiles;
//         const newMsgRef = await push(messagesRef, newMessage);
//         setMessageText('');
//         setSelectedFiles([]);
//         setUploading(false);

//         await push(databaseRef(database, `messagesA/${otherUser.id}/${user.id}`), { ...newMessage, id: newMsgRef.key });
//         update(databaseRef(database, `lastSeenA/${user.id}`), { timestamp: Date.now() });
//     };

//     const renderMedia = (files) => {
//         return files && files.length > 0 ? (
//             <div className="grid grid-cols-4 gap-2 mt-2">
//                 {files.map((file, index) => (
//                     <a key={index} href={file} target="_blank" rel="noopener noreferrer" className="w-20 h-20 border rounded-lg overflow-hidden bg-white">
//                         {file.endsWith('.jpg') || file.endsWith('.png') || file.endsWith('.gif') ? (
//                             <img src={file} alt="Media" className="object-cover h-full w-full" />
//                         ) : (
//                             <span className="text-sm text-gray-600">File</span>
//                         )}
//                     </a>
//                 ))}
//             </div>
//         ) : null;
//     };

//     return (
//         <div className={`flex flex-col h-screen ${chatSettings.isNightMode ? 'bg-gray-900' : 'bg-gray-100'}`}>
//             <header className="flex-none p-4 bg-white border-b border-gray-300 text-center relative">
//                 <h2 className="text-xl">{otherUser.name}</h2>
//                 <p className="text-sm">{lastSeen ? 'Last seen: ' + lastSeen : 'Offline'}</p>
//                 <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="text-gray-500 hover:text-gray-700">
//                     •••
//                 </button>
//                 {isMenuOpen && (
//                     <div className="absolute right-0 mt-2 w-48 bg-white border rounded shadow-lg z-10">
//                         <div className="p-2">
//                             <button onClick={() => setIsColorMenuOpen(!isColorMenuOpen)} className="block text-left w-full">
//                                 Colors
//                             </button>
//                             {isColorMenuOpen && (
//                                 <div className="mt-2 bg-gray-100 p-2 rounded">
//                                     <button onClick={() => setIsSenderSettingsOpen(!isSenderSettingsOpen)} className="block text-left w-full">Sender</button>
//                                     {isSenderSettingsOpen && (
//                                         <div className="mt-2">
//                                             <label className="block text-sm">Sender Bubble Color:</label>
//                                             <input
//                                                 type="color"
//                                                 value={chatSettings.senderBubbleColor}
//                                                 onChange={(e) => saveSettings({ senderBubbleColor: e.target.value })}
//                                                 className="w-full h-8 p-0 border-none"
//                                             />
//                                             <label className="block text-sm">Sender Text Color:</label>
//                                             <input
//                                                 type="color"
//                                                 value={chatSettings.senderTextColor}
//                                                 onChange={(e) => saveSettings({ senderTextColor: e.target.value })}
//                                                 className="w-full h-8 p-0 border-none"
//                                             />
//                                         </div>
//                                     )}
//                                     <button onClick={() => setIsReceiverSettingsOpen(!isReceiverSettingsOpen)} className="block text-left w-full mt-2">Receiver</button>
//                                     {isReceiverSettingsOpen && (
//                                         <div className="mt-2">
//                                             <label className="block text-sm">Receiver Bubble Color:</label>
//                                             <input
//                                                 type="color"
//                                                 value={chatSettings.receiverBubbleColor}
//                                                 onChange={(e) => saveSettings({ receiverBubbleColor: e.target.value })}
//                                                 className="w-full h-8 p-0 border-none"
//                                             />
//                                             <label className="block text-sm">Receiver Text Color:</label>
//                                             <input
//                                                 type="color"
//                                                 value={chatSettings.receiverTextColor}
//                                                 onChange={(e) => saveSettings({ receiverTextColor: e.target.value })}
//                                                 className="w-full h-8 p-0 border-none"
//                                             />
//                                         </div>
//                                     )}
//                                 </div>
//                             )}
//                         </div>
//                         <div className="flex items-center justify-between p-2">
//                             <span className="text-sm">Day/Night Mode</span>
//                             <button
//                                 onClick={() => saveSettings({ isNightMode: !chatSettings.isNightMode })}
//                                 className={`flex items-center ${chatSettings.isNightMode ? 'bg-gray-800' : 'bg-gray-300'} w-16 h-8 rounded-full relative`}
//                             >
//                                 <span className={`absolute w-8 h-8 bg-white rounded-full transition-transform ${chatSettings.isNightMode ? 'transform translate-x-8' : ''}`} />
//                                 <span className={`text-gray-700 ${chatSettings.isNightMode ? 'hidden' : 'block'}`}>☀️</span>
//                                 <span className={`text-gray-700 ${chatSettings.isNightMode ? 'block' : 'hidden'}`}>🌙</span>
//                             </button>
//                         </div>
//                     </div>
//                 )}
//             </header>
//             <main className="flex-1 overflow-y-auto p-4">
//                 {messages.map((msg, index) => (
//                     <div key={index} className={`flex my-2 ${msg.sender === user.id ? 'justify-end' : 'justify-start'}`}>
//                         <div
//                             className={`max-w-xs p-2 rounded-lg ${msg.sender === user.id ? chatSettings.senderBubbleColor : chatSettings.receiverBubbleColor}`}
//                         >
//                             <p style={{ color: msg.sender === user.id ? chatSettings.senderTextColor : chatSettings.receiverTextColor }}>
//                                 {msg.text}
//                             </p>
//                             {renderMedia(msg.files)}
//                         </div>
//                     </div>
//                 ))}
//             </main>
//             <footer className="flex-none p-4 bg-white border-t border-gray-300">
//                 <div className="flex items-center">
//                     <input
//                         type="text"
//                         value={messageText}
//                         onChange={(e) => setMessageText(e.target.value)}
//                         placeholder="Type a message"
//                         className="flex-1 border rounded-lg p-2"
//                     />
//                     <input type="file" multiple onChange={handleFileChange} className="ml-2" />
//                     <button onClick={sendMessage} className="ml-2 bg-blue-500 text-white rounded-lg p-2" disabled={uploading}>
//                         Send
//                     </button>
//                 </div>
//             </footer>
//         </div>
//     );
// };

// export default Chat;


// // "use client"; // Enable client-side rendering
// // import React, { useState, useEffect } from 'react';
// // import { database, storage } from '../config/firebase';
// // import { ref as databaseRef, onValue, push, update } from 'firebase/database';
// // import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
// // import 'tailwindcss/tailwind.css';

// // const Chat = ({ user }) => {
// //     const otherUser = user.id === 'user1' ? { id: 'user2', name: 'User 2' } : { id: 'user1', name: 'User 1' };
// //     const [messages, setMessages] = useState([]);
// //     const [messageText, setMessageText] = useState('');
// //     const [selectedFiles, setSelectedFiles] = useState([]);
// //     const [uploading, setUploading] = useState(false);
// //     const [lastSeen, setLastSeen] = useState('Offline');
// //     const [isMenuOpen, setIsMenuOpen] = useState(false);
// //     const [isColorMenuOpen, setIsColorMenuOpen] = useState(false);
// //     const [chatSettings, setChatSettings] = useState({
// //         senderBubbleColor: '#3B82F6',
// //         receiverBubbleColor: '#E5E7EB',
// //         senderTextColor: '#FFFFFF',
// //         receiverTextColor: '#000000',
// //         isNightMode: false,
// //     });

// //     useEffect(() => {
// //         const savedSettings = JSON.parse(localStorage.getItem(`chatSettings-${user.id}`));
// //         if (savedSettings) setChatSettings(savedSettings);
// //     }, [user.id]);

// //     const saveSettings = (newSettings) => {
// //         const updatedSettings = { ...chatSettings, ...newSettings };
// //         setChatSettings(updatedSettings);
// //         localStorage.setItem(`chatSettings-${user.id}`, JSON.stringify(updatedSettings));
// //     };

// //     useEffect(() => {
// //         const messagesRef = databaseRef(database, `messagesA/${user.id}/${otherUser.id}`);
// //         onValue(messagesRef, (snapshot) => {
// //             const data = snapshot.val();
// //             setMessages(data ? Object.values(data) : []);
// //             if (data) {
// //                 Object.values(data).forEach((msg) => {
// //                     if (!msg.read && msg.sender !== user.id) {
// //                         update(databaseRef(database, `messagesA/${user.id}/${otherUser.id}/${msg.id}`), { read: true });
// //                         update(databaseRef(database, `messagesA/${otherUser.id}/${user.id}/${msg.id}`), { read: true });
// //                     }
// //                 });
// //             }
// //         });

// //         const userStatusRef = databaseRef(database, `lastSeenA/${otherUser.id}`);
// //         onValue(userStatusRef, (snapshot) => {
// //             const timestamp = snapshot.val()?.timestamp || null;
// //             if (timestamp) {
// //                 const date = new Date(Number(timestamp));
// //                 setLastSeen(date.toLocaleString() || 'Offline');
// //             }
// //         });

// //         update(databaseRef(database, `lastSeenA/${user.id}`), { timestamp: Date.now() });
// //         return () => {
// //             update(databaseRef(database, `lastSeenA/${user.id}`), { timestamp: null });
// //         };
// //     }, [user.id, otherUser.id]);

// //     const handleFileChange = (event) => {
// //         setSelectedFiles([...selectedFiles, ...Array.from(event.target.files)]);
// //     };

// //     const removeFile = (index) => {
// //         setSelectedFiles(selectedFiles.filter((_, i) => i !== index));
// //     };

// //     const sendMessage = async () => {
// //         if (!messageText.trim() && !selectedFiles.length) return;

// //         const messagesRef = databaseRef(database, `messagesA/${user.id}/${otherUser.id}`);
// //         const newMessage = { text: messageText, sender: user.id, timestamp: Date.now(), read: false, files: [] };

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
// //         setUploading(false);

// //         await push(databaseRef(database, `messagesA/${otherUser.id}/${user.id}`), { ...newMessage, id: newMsgRef.key });
// //         update(databaseRef(database, `lastSeenA/${user.id}`), { timestamp: Date.now() });
// //     };

// //     const renderMedia = (files) => files?.length > 0 && (
// //         <div className="grid grid-cols-4 gap-2 mt-2">
// //             {files.map((file, index) => (
// //                 <a key={index} href={file} target="_blank" rel="noopener noreferrer" className="w-20 h-20 border rounded-lg overflow-hidden bg-white">
// //                     {file.endsWith('.jpg') || file.endsWith('.png') || file.endsWith('.gif') ? (
// //                         <img src={file} alt="Media" className="object-cover h-full w-full" />
// //                     ) : (
// //                         <span className="text-sm text-gray-600">File</span>
// //                     )}
// //                 </a>
// //             ))}
// //         </div>
// //     );

// //     return (
// //         <div className={`flex flex-col h-screen ${chatSettings.isNightMode ? 'bg-gray-900' : 'bg-gray-100'}`}>
// //             <header className="flex-none p-4 bg-white border-b border-gray-300 text-center relative">
// //                 <h2 className="text-xl">{otherUser.name}</h2>
// //                 <p className="text-sm">{lastSeen ? 'Last seen: ' + lastSeen : 'Offline'}</p>
// //                 <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="text-gray-500 hover:text-gray-700">•••</button>
// //                 {isMenuOpen && (
// //                     <div className="absolute right-0 mt-2 w-48 bg-white border rounded shadow-lg z-10">
// //                         {/* Settings Menu */}
// //                     </div>
// //                 )}
// //             </header>
// //             <main className="flex-1 overflow-y-auto p-4">
// //                 {messages.map((msg, index) => (
// //                     <div key={index} className={`flex my-2 ${msg.sender === user.id ? 'justify-end' : 'justify-start'}`}>
// //                         <div
// //                             className="max-w-xs p-2 rounded-lg"
// //                             style={{
// //                                 backgroundColor: msg.sender === user.id ? chatSettings.senderBubbleColor : chatSettings.receiverBubbleColor,
// //                                 color: msg.sender === user.id ? chatSettings.senderTextColor : chatSettings.receiverTextColor
// //                             }}
// //                         >
// //                             <p>{msg.text}</p>
// //                             {renderMedia(msg.files)}
// //                         </div>
// //                     </div>
// //                 ))}
// //             </main>
// //             <footer className="flex-none p-4 bg-white border-t border-gray-300">
// //                 <div className="flex items-center">
// //                     <input
// //                         type="text"
// //                         value={messageText}
// //                         onChange={(e) => setMessageText(e.target.value)}
// //                         placeholder="Type a message"
// //                         className="flex-1 border rounded-lg p-2"
// //                     />
// //                     <input type="file" multiple onChange={handleFileChange} className="ml-2" />
// //                     <button onClick={sendMessage} className="ml-2 bg-blue-500 text-white rounded-lg p-2" disabled={uploading}>
// //                         Send
// //                     </button>
// //                 </div>
// //             </footer>
// //         </div>
// //     );
// // };

// // export default Chat;

// // // "use client"; // Enable client-side rendering
// // // import React, { useState, useEffect } from 'react';
// // // import { database, storage } from '../config/firebase';
// // // import { ref as databaseRef, onValue, push, update } from 'firebase/database';
// // // import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
// // // import 'tailwindcss/tailwind.css';

// // // const Chat = ({ user }) => {
// // //     const otherUser = user.id === 'user1' ? { id: 'user2', name: 'User 2' } : { id: 'user1', name: 'User 1' };
// // //     const [messages, setMessages] = useState([]);
// // //     const [messageText, setMessageText] = useState('');
// // //     const [selectedFiles, setSelectedFiles] = useState([]);
// // //     const [uploading, setUploading] = useState(false);
// // //     const [lastSeen, setLastSeen] = useState('Offline');
// // //     const [isMenuOpen, setIsMenuOpen] = useState(false);
// // //     const [isColorMenuOpen, setIsColorMenuOpen] = useState(false);
// // //     const [isSenderSettingsOpen, setIsSenderSettingsOpen] = useState(false);
// // //     const [isReceiverSettingsOpen, setIsReceiverSettingsOpen] = useState(false);
// // //     const [chatSettings, setChatSettings] = useState({
// // //         senderBubbleColor: '#3B82F6',
// // //         receiverBubbleColor: '#E5E7EB',
// // //         senderTextColor: '#FFFFFF',
// // //         receiverTextColor: '#000000',
// // //         isNightMode: false,
// // //     });

// // //     useEffect(() => {
// // //         const savedSettings = JSON.parse(localStorage.getItem(chatSettings-${user.id}));
// // //         if (savedSettings) {
// // //             setChatSettings(savedSettings);
// // //         }
// // //     }, [user.id]);

// // //     const saveSettings = (newSettings) => {
// // //         const settings = { ...chatSettings, ...newSettings };
// // //         setChatSettings(settings);
// // //         localStorage.setItem(chatSettings-${user.id}, JSON.stringify(settings));
// // //     };

// // //     useEffect(() => {
// // //         const messagesRef = databaseRef(database, messagesA/${user.id}/${otherUser.id});
// // //         onValue(messagesRef, (snapshot) => {
// // //             const data = snapshot.val();
// // //             setMessages(data ? Object.values(data) : []);

// // //             data && Object.values(data).forEach((msg) => {
// // //                 if (!msg.read && msg.sender !== user.id) {
// // //                     update(databaseRef(database, messagesA/${user.id}/${otherUser.id}/${msg.id}), { read: true });
// // //                     update(databaseRef(database, messagesA/${otherUser.id}/${user.id}/${msg.id}), { read: true });
// // //                 }
// // //             });
// // //         });

// // //         const userStatusRef = databaseRef(database, lastSeenA/${otherUser.id});
// // //         onValue(userStatusRef, (snapshot) => {
// // //             const timestamp = snapshot.val()?.timestamp || null;
// // //             if (timestamp) {
// // //                 const date = new Date(Number(timestamp));
// // //                 setLastSeen(date.toLocaleString() || 'Offline');
// // //             }
// // //         });

// // //         update(databaseRef(database, lastSeenA/${user.id}), { timestamp: Date.now() });

// // //         return () => {
// // //             update(databaseRef(database, lastSeenA/${user.id}), { timestamp: null });
// // //         };
// // //     }, [user.id, otherUser.id]);

// // //     const handleFileChange = (event) => {
// // //         const files = Array.from(event.target.files);
// // //         setSelectedFiles((prevFiles) => [...prevFiles, ...files]);
// // //     };

// // //     const removeFile = (index) => {
// // //         setSelectedFiles((prevFiles) => prevFiles.filter((_, i) => i !== index));
// // //     };

// // //     const sendMessage = async () => {
// // //         if (messageText.trim() === "" && selectedFiles.length === 0) return;

// // //         const messagesRef = databaseRef(database, messagesA/${user.id}/${otherUser.id});
// // //         const newMessage = {
// // //             text: messageText,
// // //             sender: user.id,
// // //             timestamp: Date.now(),
// // //             read: false,
// // //             files: [],
// // //         };

// // //         setUploading(true);
// // //         const uploadedFiles = await Promise.all(selectedFiles.map(async (file) => {
// // //             const fileRef = storageRef(storage, chatFilesA/${file.name});
// // //             await uploadBytes(fileRef, file);
// // //             return getDownloadURL(fileRef);
// // //         }));

// // //         newMessage.files = uploadedFiles;
// // //         const newMsgRef = await push(messagesRef, newMessage);
// // //         setMessageText('');
// // //         setSelectedFiles([]);
// // //         setUploading(false);

// // //         await push(databaseRef(database, messagesA/${otherUser.id}/${user.id}), { ...newMessage, id: newMsgRef.key });
// // //         update(databaseRef(database, lastSeenA/${user.id}), { timestamp: Date.now() });
// // //     };

// // //     const renderMedia = (files) => {
// // //         return files && files.length > 0 ? (
// // //             <div className="grid grid-cols-4 gap-2 mt-2">
// // //                 {files.map((file, index) => (
// // //                     <a key={index} href={file} target="_blank" rel="noopener noreferrer" className="w-20 h-20 border rounded-lg overflow-hidden bg-white">
// // //                         {file.endsWith('.jpg') || file.endsWith('.png') || file.endsWith('.gif') ? (
// // //                             <img src={file} alt="Media" className="object-cover h-full w-full" />
// // //                         ) : (
// // //                             <span className="text-sm text-gray-600">File</span>
// // //                         )}
// // //                     </a>
// // //                 ))}
// // //             </div>
// // //         ) : null;
// // //     };

// // //     return (
// // //         <div className={flex flex-col h-screen ${chatSettings.isNightMode ? 'bg-gray-900' : 'bg-gray-100'}}>
// // //             <header className="flex-none p-4 bg-white border-b border-gray-300 text-center relative">
// // //                 <h2 className="text-xl">{otherUser.name}</h2>
// // //                 <p className="text-sm">{lastSeen ? 'Last seen: ' + lastSeen : 'Offline'}</p>
// // //                 <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="text-gray-500 hover:text-gray-700">
// // //                     •••
// // //                 </button>
// // //                 {isMenuOpen && (
// // //                     <div className="absolute right-0 mt-2 w-48 bg-white border rounded shadow-lg z-10">
// // //                         <div className="p-2">
// // //                             <button onClick={() => setIsColorMenuOpen(!isColorMenuOpen)} className="block text-left w-full">
// // //                                 Colors
// // //                             </button>
// // //                             {isColorMenuOpen && (
// // //                                 <div className="mt-2 bg-gray-100 p-2 rounded">
// // //                                     <button onClick={() => setIsSenderSettingsOpen(!isSenderSettingsOpen)} className="block text-left w-full">Sender</button>
// // //                                     {isSenderSettingsOpen && (
// // //                                         <div className="mt-2">
// // //                                             <label className="block text-sm">Sender Bubble Color:</label>
// // //                                             <input
// // //                                                 type="color"
// // //                                                 value={chatSettings.senderBubbleColor}
// // //                                                 onChange={(e) => saveSettings({ senderBubbleColor: e.target.value })}
// // //                                                 className="w-full h-8 p-0 border-none"
// // //                                             />
// // //                                             <label className="block text-sm">Sender Text Color:</label>
// // //                                             <input
// // //                                                 type="color"
// // //                                                 value={chatSettings.senderTextColor}
// // //                                                 onChange={(e) => saveSettings({ senderTextColor: e.target.value })}
// // //                                                 className="w-full h-8 p-0 border-none"
// // //                                             />
// // //                                         </div>
// // //                                     )}
// // //                                     <button onClick={() => setIsReceiverSettingsOpen(!isReceiverSettingsOpen)} className="block text-left w-full mt-2">Receiver</button>
// // //                                     {isReceiverSettingsOpen && (
// // //                                         <div className="mt-2">
// // //                                             <label className="block text-sm">Receiver Bubble Color:</label>
// // //                                             <input
// // //                                                 type="color"
// // //                                                 value={chatSettings.receiverBubbleColor}
// // //                                                 onChange={(e) => saveSettings({ receiverBubbleColor: e.target.value })}
// // //                                                 className="w-full h-8 p-0 border-none"
// // //                                             />
// // //                                             <label className="block text-sm">Receiver Text Color:</label>
// // //                                             <input
// // //                                                 type="color"
// // //                                                 value={chatSettings.receiverTextColor}
// // //                                                 onChange={(e) => saveSettings({ receiverTextColor: e.target.value })}
// // //                                                 className="w-full h-8 p-0 border-none"
// // //                                             />
// // //                                         </div>
// // //                                     )}
// // //                                 </div>
// // //                             )}
// // //                         </div>
// // //                         <div className="flex items-center justify-between p-2">
// // //                             <span className="text-sm">Day/Night Mode</span>
// // //                             <button
// // //                                 onClick={() => saveSettings({ isNightMode: !chatSettings.isNightMode })}
// // //                                 className={flex items-center ${chatSettings.isNightMode ? 'bg-gray-800' : 'bg-gray-300'} w-16 h-8 rounded-full relative}
// // //                             >
// // //                                 <span className={absolute w-8 h-8 bg-white rounded-full transition-transform ${chatSettings.isNightMode ? 'transform translate-x-8' : ''}} />
// // //                                 <span className={text-gray-700 ${chatSettings.isNightMode ? 'hidden' : 'block'}}>☀️</span>
// // //                                 <span className={text-gray-700 ${chatSettings.isNightMode ? 'block' : 'hidden'}}>🌙</span>
// // //                             </button>
// // //                         </div>
// // //                     </div>
// // //                 )}
// // //             </header>
// // //             <main className="flex-1 overflow-y-auto p-4">
// // //                 {messages.map((msg, index) => (
// // //                     <div key={index} className={flex my-2 ${msg.sender === user.id ? 'justify-end' : 'justify-start'}}>
// // //                         <div
// // //                             className={max-w-xs p-2 rounded-lg ${msg.sender === user.id ? chatSettings.senderBubbleColor : chatSettings.receiverBubbleColor}}
// // //                         >
// // //                             <p style={{ color: msg.sender === user.id ? chatSettings.senderTextColor : chatSettings.receiverTextColor }}>
// // //                                 {msg.text}
// // //                             </p>
// // //                             {renderMedia(msg.files)}
// // //                         </div>
// // //                     </div>
// // //                 ))}
// // //             </main>
// // //             <footer className="flex-none p-4 bg-white border-t border-gray-300">
// // //                 <div className="flex items-center">
// // //                     <input
// // //                         type="text"
// // //                         value={messageText}
// // //                         onChange={(e) => setMessageText(e.target.value)}
// // //                         placeholder="Type a message"
// // //                         className="flex-1 border rounded-lg p-2"
// // //                     />
// // //                     <input type="file" multiple onChange={handleFileChange} className="ml-2" />
// // //                     <button onClick={sendMessage} className="ml-2 bg-blue-500 text-white rounded-lg p-2" disabled={uploading}>
// // //                         Send
// // //                     </button>
// // //                 </div>
// // //             </footer>
// // //         </div>
// // //     );
// // // };

// // // export default Chat;

// // // // "use client"; // Enable client-side rendering
// // // // import React, { useState, useEffect } from 'react';
// // // // import { database, storage } from '../config/firebase';
// // // // import { ref as databaseRef, onValue, push, update } from 'firebase/database';
// // // // import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
// // // // import 'tailwindcss/tailwind.css';

// // // // const Chat = ({ user }) => {
// // // //     const otherUser = user.id === 'user1' ? { id: 'user2', name: 'User 2' } : { id: 'user1', name: 'User 1' };
// // // //     const [messages, setMessages] = useState([]);
// // // //     const [messageText, setMessageText] = useState('');
// // // //     const [selectedFiles, setSelectedFiles] = useState([]);
// // // //     const [uploading, setUploading] = useState(false);
// // // //     const [lastSeen, setLastSeen] = useState('Offline');
// // // //     const [isMenuOpen, setIsMenuOpen] = useState(false);
// // // //     const [isColorMenuOpen, setIsColorMenuOpen] = useState(false);
// // // //     const [isBubbleStyleMenuOpen, setIsBubbleStyleMenuOpen] = useState(false);
// // // //     const [chatSettings, setChatSettings] = useState({
// // // //         senderBubbleColor: '#3B82F6',
// // // //         receiverBubbleColor: '#E5E7EB',
// // // //         senderTextColor: '#FFFFFF',
// // // //         receiverTextColor: '#000000',
// // // //         isNightMode: false,
// // // //         bubbleStyle: 'default', // New state for bubble style
// // // //     });

// // // //     useEffect(() => {
// // // //         const savedSettings = JSON.parse(localStorage.getItem(`chatSettings-${user.id}`));
// // // //         if (savedSettings) {
// // // //             setChatSettings(savedSettings);
// // // //         }
// // // //     }, [user.id]);

// // // //     const saveSettings = (newSettings) => {
// // // //         const settings = { ...chatSettings, ...newSettings };
// // // //         setChatSettings(settings);
// // // //         localStorage.setItem(`chatSettings-${user.id}`, JSON.stringify(settings));
// // // //     };

// // // //     useEffect(() => {
// // // //         const messagesRef = databaseRef(database, `messagesA/${user.id}/${otherUser.id}`);
// // // //         onValue(messagesRef, (snapshot) => {
// // // //             const data = snapshot.val();
// // // //             setMessages(data ? Object.values(data) : []);
// // // //             data && Object.values(data).forEach((msg) => {
// // // //                 if (!msg.read && msg.sender !== user.id) {
// // // //                     update(databaseRef(database, `messagesA/${user.id}/${otherUser.id}/${msg.id}`), { read: true });
// // // //                     update(databaseRef(database, `messagesA/${otherUser.id}/${user.id}/${msg.id}`), { read: true });
// // // //                 }
// // // //             });
// // // //         });

// // // //         const userStatusRef = databaseRef(database, `lastSeenA/${otherUser.id}`);
// // // //         onValue(userStatusRef, (snapshot) => {
// // // //             const timestamp = snapshot.val()?.timestamp || null;
// // // //             if (timestamp) {
// // // //                 const date = new Date(Number(timestamp));
// // // //                 setLastSeen(date.toLocaleString() || 'Offline');
// // // //             }
// // // //         });

// // // //         update(databaseRef(database, `lastSeenA/${user.id}`), { timestamp: Date.now() });

// // // //         return () => {
// // // //             update(databaseRef(database, `lastSeenA/${user.id}`), { timestamp: null });
// // // //         };
// // // //     }, [user.id, otherUser.id]);

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
// // // //         setUploading(false);

// // // //         await push(databaseRef(database, `messagesA/${otherUser.id}/${user.id}`), { ...newMessage, id: newMsgRef.key });
// // // //         update(databaseRef(database, `lastSeenA/${user.id}`), { timestamp: Date.now() });
// // // //     };

// // // //     const renderMedia = (files) => {
// // // //         return files && files.length > 0 ? (
// // // //             <div className="grid grid-cols-4 gap-2 mt-2">
// // // //                 {files.map((file, index) => (
// // // //                     <a key={index} href={file} target="_blank" rel="noopener noreferrer" className="w-20 h-20 border rounded-lg overflow-hidden bg-white">
// // // //                         {file.endsWith('.jpg') || file.endsWith('.png') || file.endsWith('.gif') ? (
// // // //                             <img src={file} alt="Media" className="object-cover h-full w-full" />
// // // //                         ) : (
// // // //                             <span className="text-sm text-gray-600">File</span>
// // // //                         )}
// // // //                     </a>
// // // //                 ))}
// // // //             </div>
// // // //         ) : null;
// // // //     };

// // // //     return (
// // // //         <div className={`flex flex-col h-screen ${chatSettings.isNightMode ? 'bg-gray-900' : 'bg-gray-100'}`}>
// // // //             <header className="flex-none p-4 bg-white border-b border-gray-300 text-center relative">
// // // //                 <h2 className="text-xl">{otherUser.name}</h2>
// // // //                 <p className="text-sm">{lastSeen ? 'Last seen: ' + lastSeen : 'Offline'}</p>
// // // //                 <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="text-gray-500 hover:text-gray-700">
// // // //                     •••
// // // //                 </button>
// // // //                 {isMenuOpen && (
// // // //                     <div className="absolute right-0 mt-2 w-48 bg-white border rounded shadow-lg z-10">
// // // //                         <div className="p-2">
// // // //                             <button onClick={() => setIsColorMenuOpen(!isColorMenuOpen)} className="block text-left w-full">
// // // //                                 Colors
// // // //                             </button>
// // // //                             {isColorMenuOpen && (
// // // //                                 <div className="mt-2 bg-gray-100 p-2 rounded">
// // // //                                     <button onClick={() => setIsSenderSettingsOpen(!isSenderSettingsOpen)} className="block text-left w-full">Sender</button>
// // // //                                     {isSenderSettingsOpen && (
// // // //                                         <div className="mt-2">
// // // //                                             <label className="block text-sm">Sender Bubble Color:</label>
// // // //                                             <input
// // // //                                                 type="color"
// // // //                                                 value={chatSettings.senderBubbleColor}
// // // //                                                 onChange={(e) => saveSettings({ senderBubbleColor: e.target.value })}
// // // //                                                 className="w-full h-8 p-0 border-none"
// // // //                                             />
// // // //                                             <label className="block text-sm">Sender Text Color:</label>
// // // //                                             <input
// // // //                                                 type="color"
// // // //                                                 value={chatSettings.senderTextColor}
// // // //                                                 onChange={(e) => saveSettings({ senderTextColor: e.target.value })}
// // // //                                                 className="w-full h-8 p-0 border-none"
// // // //                                             />
// // // //                                         </div>
// // // //                                     )}
// // // //                                     <button onClick={() => setIsReceiverSettingsOpen(!isReceiverSettingsOpen)} className="block text-left w-full mt-2">Receiver</button>
// // // //                                     {isReceiverSettingsOpen && (
// // // //                                         <div className="mt-2">
// // // //                                             <label className="block text-sm">Receiver Bubble Color:</label>
// // // //                                             <input
// // // //                                                 type="color"
// // // //                                                 value={chatSettings.receiverBubbleColor}
// // // //                                                 onChange={(e) => saveSettings({ receiverBubbleColor: e.target.value })}
// // // //                                                 className="w-full h-8 p-0 border-none"
// // // //                                             />
// // // //                                             <label className="block text-sm">Receiver Text Color:</label>
// // // //                                             <input
// // // //                                                 type="color"
// // // //                                                 value={chatSettings.receiverTextColor}
// // // //                                                 onChange={(e) => saveSettings({ receiverTextColor: e.target.value })}
// // // //                                                 className="w-full h-8 p-0 border-none"
// // // //                                             />
// // // //                                         </div>
// // // //                                     )}
// // // //                                 </div>
// // // //                             )}
// // // //                         </div>
// // // //                         <div className="flex items-center justify-between p-2">
// // // //                             <span className="text-sm">Day/Night Mode</span>
// // // //                             <button
// // // //                                 onClick={() => saveSettings({ isNightMode: !chatSettings.isNightMode })}
// // // //                                 className={`flex items-center ${chatSettings.isNightMode ? 'bg-gray-800' : 'bg-gray-300'} w-16 h-8 rounded-full relative`}
// // // //                             >
// // // //                                 <span className={`absolute w-8 h-8 bg-white rounded-full transition-transform ${chatSettings.isNightMode ? 'transform translate-x-8' : ''}`} />
// // // //                                 <span className={`text-gray-700 ${chatSettings.isNightMode ? 'hidden' : 'block'}`}>☀️</span>
// // // //                                 <span className={`text-gray-700 ${chatSettings.isNightMode ? 'block' : 'hidden'}`}>🌙</span>
// // // //                             </button>
// // // //                         </div>
// // // //                         <div className="p-2">
// // // //                             <button onClick={() => setIsBubbleStyleMenuOpen(!isBubbleStyleMenuOpen)} className="block text-left w-full">
// // // //                                 Bubble Styles
// // // //                             </button>
// // // //                             {isBubbleStyleMenuOpen && (
// // // //                                 <div className="mt-2 bg-gray-100 p-2 rounded">
// // // //                                     <button
// // // //                                         onClick={() => saveSettings({ bubbleStyle: 'default' })}
// // // //                                         className={`block text-left w-full ${chatSettings.bubbleStyle === 'default' ? 'font-bold' : ''}`}
// // // //                                     >
// // // //                                         Default
// // // //                                     </button>
// // // //                                     <button
// // // //                                         onClick={() => saveSettings({ bubbleStyle: 'rounded' })}
// // // //                                         className={`block text-left w-full ${chatSettings.bubbleStyle === 'rounded' ? 'font-bold' : ''}`}
// // // //                                     >
// // // //                                         Rounded
// // // //                                     </button>
// // // //                                     <button
// // // //                                         onClick={() => saveSettings({ bubbleStyle: 'squared' })}
// // // //                                         className={`block text-left w-full ${chatSettings.bubbleStyle === 'squared' ? 'font-bold' : ''}`}
// // // //                                     >
// // // //                                         Squared
// // // //                                     </button>
// // // //                                 </div>
// // // //                             )}
// // // //                         </div>
// // // //                     </div>
// // // //                 )}
// // // //             </header>

// // // //             <main className="flex-grow overflow-auto p-4">
// // // //                 <div className="flex flex-col space-y-4">
// // // //                     {messages.map((msg, index) => (
// // // //                         <div key={index} className={`flex ${msg.sender === user.id ? 'justify-end' : 'justify-start'}`}>
// // // //                             <div
// // // //                                 className={`p-2 rounded-lg ${msg.sender === user.id ? `bg-${chatSettings.senderBubbleColor} text-${chatSettings.senderTextColor}` : `bg-${chatSettings.receiverBubbleColor} text-${chatSettings.receiverTextColor}`} ${chatSettings.bubbleStyle === 'rounded' ? 'rounded-full' : chatSettings.bubbleStyle === 'squared' ? 'rounded-none' : ''}`}
// // // //                             >
// // // //                                 {msg.text && <p>{msg.text}</p>}
// // // //                                 {renderMedia(msg.files)}
// // // //                             </div>
// // // //                         </div>
// // // //                     ))}
// // // //                 </div>
// // // //             </main>

// // // //             <footer className="flex-none p-4 bg-white border-t border-gray-300 flex items-center">
// // // //                 <input
// // // //                     type="text"
// // // //                     value={messageText}
// // // //                     onChange={(e) => setMessageText(e.target.value)}
// // // //                     className="flex-grow border rounded px-2 py-1"
// // // //                     placeholder="Type a message..."
// // // //                 />
// // // //                 <input type="file" multiple onChange={handleFileChange} className="ml-2" />
// // // //                 <button onClick={sendMessage} className={`ml-2 px-4 py-2 text-white rounded ${uploading ? 'bg-gray-400' : 'bg-blue-600'}`} disabled={uploading}>
// // // //                     {uploading ? 'Sending...' : 'Send'}
// // // //                 </button>
// // // //             </footer>
// // // //         </div>
// // // //     );
// // // // };

// // // // export default Chat;


// // // // // "use client";
// // // // // import React, { useState, useEffect } from 'react';
// // // // // import { database, storage } from '../config/firebase';
// // // // // import { ref as databaseRef, onValue, push, update } from 'firebase/database';
// // // // // import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
// // // // // import 'tailwindcss/tailwind.css';

// // // // // const Chat = ({ user }) => {
// // // // //     const otherUser = user.id === 'user1' ? { id: 'user2', name: 'User 2' } : { id: 'user1', name: 'User 1' };
// // // // //     const [messages, setMessages] = useState([]);
// // // // //     const [messageText, setMessageText] = useState('');
// // // // //     const [selectedFiles, setSelectedFiles] = useState([]);
// // // // //     const [uploading, setUploading] = useState(false);
// // // // //     const [lastSeen, setLastSeen] = useState('Offline');
// // // // //     const [isMenuOpen, setIsMenuOpen] = useState(false);
// // // // //     const [isBubbleMenuOpen, setIsBubbleMenuOpen] = useState(false);
// // // // //     const [chatSettings, setChatSettings] = useState({
// // // // //         bubbleStyle: 'wa',  // Default bubble style
// // // // //         senderBubbleColor: '#3B82F6',
// // // // //         receiverBubbleColor: '#E5E7EB',
// // // // //         senderTextColor: '#FFFFFF',
// // // // //         receiverTextColor: '#000000',
// // // // //         isNightMode: false,
// // // // //     });

// // // // //     useEffect(() => {
// // // // //         const savedSettings = JSON.parse(localStorage.getItem(`chatSettings-${user.id}`));
// // // // //         if (savedSettings) {
// // // // //             setChatSettings(savedSettings);
// // // // //         }
// // // // //     }, [user.id]);

// // // // //     const saveSettings = (newSettings) => {
// // // // //         const settings = { ...chatSettings, ...newSettings };
// // // // //         setChatSettings(settings);
// // // // //         localStorage.setItem(`chatSettings-${user.id}`, JSON.stringify(settings));
// // // // //     };

// // // // //     const handleBubbleStyleChange = (style) => {
// // // // //         saveSettings({ bubbleStyle: style });
// // // // //     };

// // // // //     useEffect(() => {
// // // // //         const messagesRef = databaseRef(database, `messagesA/${user.id}/${otherUser.id}`);
// // // // //         onValue(messagesRef, (snapshot) => {
// // // // //             const data = snapshot.val();
// // // // //             setMessages(data ? Object.values(data) : []);
// // // // //             data && Object.values(data).forEach((msg) => {
// // // // //                 if (!msg.read && msg.sender !== user.id) {
// // // // //                     update(databaseRef(database, `messagesA/${user.id}/${otherUser.id}/${msg.id}`), { read: true });
// // // // //                     update(databaseRef(database, `messagesA/${otherUser.id}/${user.id}/${msg.id}`), { read: true });
// // // // //                 }
// // // // //             });
// // // // //         });

// // // // //         const userStatusRef = databaseRef(database, `lastSeenA/${otherUser.id}`);
// // // // //         onValue(userStatusRef, (snapshot) => {
// // // // //             const timestamp = snapshot.val()?.timestamp || null;
// // // // //             if (timestamp) {
// // // // //                 const date = new Date(Number(timestamp));
// // // // //                 setLastSeen(date.toLocaleString() || 'Offline');
// // // // //             }
// // // // //         });

// // // // //         update(databaseRef(database, `lastSeenA/${user.id}`), { timestamp: Date.now() });

// // // // //         return () => {
// // // // //             update(databaseRef(database, `lastSeenA/${user.id}`), { timestamp: null });
// // // // //         };
// // // // //     }, [user.id, otherUser.id]);

// // // // //     const sendMessage = async () => {
// // // // //         if (messageText.trim() === "" && selectedFiles.length === 0) return;

// // // // //         const messagesRef = databaseRef(database, `messagesA/${user.id}/${otherUser.id}`);
// // // // //         const newMessage = {
// // // // //             text: messageText,
// // // // //             sender: user.id,
// // // // //             timestamp: Date.now(),
// // // // //             read: false,
// // // // //             files: [],
// // // // //         };

// // // // //         setUploading(true);
// // // // //         const uploadedFiles = await Promise.all(selectedFiles.map(async (file) => {
// // // // //             const fileRef = storageRef(storage, `chatFilesA/${file.name}`);
// // // // //             await uploadBytes(fileRef, file);
// // // // //             return getDownloadURL(fileRef);
// // // // //         }));

// // // // //         newMessage.files = uploadedFiles;
// // // // //         const newMsgRef = await push(messagesRef, newMessage);
// // // // //         setMessageText('');
// // // // //         setSelectedFiles([]);
// // // // //         setUploading(false);

// // // // //         await push(databaseRef(database, `messagesA/${otherUser.id}/${user.id}`), { ...newMessage, id: newMsgRef.key });
// // // // //         update(databaseRef(database, `lastSeenA/${user.id}`), { timestamp: Date.now() });
// // // // //     };

// // // // //     return (
// // // // //         <div className={`flex flex-col h-screen ${chatSettings.isNightMode ? 'bg-gray-900' : 'bg-gray-100'}`}>
// // // // //             <header className="flex-none p-4 bg-white border-b border-gray-300 text-center relative">
// // // // //                 <h2 className="text-xl">{otherUser.name}</h2>
// // // // //                 <p className="text-sm">{lastSeen ? 'Last seen: ' + lastSeen : 'Offline'}</p>
// // // // //                 <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="text-gray-500 hover:text-gray-700">•••</button>
// // // // //                 {isMenuOpen && (
// // // // //                     <div className="absolute right-0 mt-2 w-48 bg-white border rounded shadow-lg z-10">
// // // // //                         <button onClick={() => setIsBubbleMenuOpen(!isBubbleMenuOpen)} className="block w-full p-2 text-left">Bubble Style</button>
// // // // //                         {isBubbleMenuOpen && (
// // // // //                             <div className="flex flex-col p-2">
// // // // //                                 {['ip', 'tele', 'wa', 'dm'].map(style => (
// // // // //                                     <button key={style} onClick={() => handleBubbleStyleChange(style)} className="p-1 hover:bg-gray-200">{style.toUpperCase()}</button>
// // // // //                                 ))}
// // // // //                             </div>
// // // // //                         )}
// // // // //                         <div className="p-2">
// // // // //                             <span className="text-sm">Day/Night Mode</span>
// // // // //                             <button onClick={() => saveSettings({ isNightMode: !chatSettings.isNightMode })} className={`w-16 h-8 ${chatSettings.isNightMode ? 'bg-gray-800' : 'bg-gray-300'} rounded-full`}>
// // // // //                                 <span className={`absolute w-8 h-8 bg-white rounded-full transition-transform ${chatSettings.isNightMode ? 'transform translate-x-8' : ''}`} />
// // // // //                             </button>
// // // // //                         </div>
// // // // //                     </div>
// // // // //                 )}
// // // // //             </header>
// // // // //             <main className="flex-1 overflow-y-auto p-4">
// // // // //                 {messages.map((msg, index) => (
// // // // //                     <div key={index} className={`flex my-2 ${msg.sender === user.id ? 'justify-end' : 'justify-start'}`}>
// // // // //                         <div className={`max-w-xs p-2 rounded-lg ${msg.sender === user.id ? chatSettings.senderBubbleColor : chatSettings.receiverBubbleColor}`}>
// // // // //                             <p style={{ color: msg.sender === user.id ? chatSettings.senderTextColor : chatSettings.receiverTextColor }}>
// // // // //                                 {msg.text}
// // // // //                             </p>
// // // // //                         </div>
// // // // //                     </div>
// // // // //                 ))}
// // // // //             </main>
// // // // //             <footer className="flex-none p-4 bg-white border-t border-gray-300">
// // // // //                 <div className="flex items-center">
// // // // //                     <input type="text" value={messageText} onChange={(e) => setMessageText(e.target.value)} placeholder="Type a message" className="flex-1 border rounded-lg p-2" />
// // // // //                     <button onClick={sendMessage} className="ml-2 bg-blue-500 text-white rounded-lg p-2">Send</button>
// // // // //                 </div>
// // // // //             </footer>
// // // // //         </div>
// // // // //     );
// // // // // };

// // // // // export default Chat;


// // // // // // "use client"; // Enable client-side rendering
// // // // // // import React, { useState, useEffect } from 'react';
// // // // // // import { database, storage } from '../config/firebase';
// // // // // // import { ref as databaseRef, onValue, push, update } from 'firebase/database';
// // // // // // import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
// // // // // // import 'tailwindcss/tailwind.css';

// // // // // // const Chat = ({ user }) => {
// // // // // //     const otherUser = user.id === 'user1' ? { id: 'user2', name: 'User 2' } : { id: 'user1', name: 'User 1' };
// // // // // //     const [messages, setMessages] = useState([]);
// // // // // //     const [messageText, setMessageText] = useState('');
// // // // // //     const [selectedFiles, setSelectedFiles] = useState([]);
// // // // // //     const [uploading, setUploading] = useState(false);
// // // // // //     const [lastSeen, setLastSeen] = useState('Offline');
// // // // // //     const [isMenuOpen, setIsMenuOpen] = useState(false);
// // // // // //     const [isBubbleMenuOpen, setIsBubbleMenuOpen] = useState(false);
// // // // // //     const [isColorMenuOpen, setIsColorMenuOpen] = useState(false);
// // // // // //     const [isSenderSettingsOpen, setIsSenderSettingsOpen] = useState(false);
// // // // // //     const [isReceiverSettingsOpen, setIsReceiverSettingsOpen] = useState(false);
// // // // // //     const [chatSettings, setChatSettings] = useState({
// // // // // //         senderBubbleColor: '#3B82F6',
// // // // // //         receiverBubbleColor: '#E5E7EB',
// // // // // //         senderTextColor: '#FFFFFF',
// // // // // //         receiverTextColor: '#000000',
// // // // // //         bubbleStyle: 'rounded', // New bubble style option
// // // // // //         isNightMode: false,
// // // // // //     });

// // // // // //     // Retrieve saved settings
// // // // // //     useEffect(() => {
// // // // // //         const savedSettings = JSON.parse(localStorage.getItem(`chatSettings-${user.id}`));
// // // // // //         if (savedSettings) {
// // // // // //             setChatSettings(savedSettings);
// // // // // //         }
// // // // // //     }, [user.id]);

// // // // // //     // Save updated settings
// // // // // //     const saveSettings = (newSettings) => {
// // // // // //         const settings = { ...chatSettings, ...newSettings };
// // // // // //         setChatSettings(settings);
// // // // // //         localStorage.setItem(`chatSettings-${user.id}`, JSON.stringify(settings));
// // // // // //     };

// // // // // //     // Firebase listeners for messages and user status
// // // // // //     useEffect(() => {
// // // // // //         const messagesRef = databaseRef(database, `messagesA/${user.id}/${otherUser.id}`);
// // // // // //         onValue(messagesRef, (snapshot) => {
// // // // // //             const data = snapshot.val();
// // // // // //             setMessages(data ? Object.values(data) : []);

// // // // // //             data && Object.values(data).forEach((msg) => {
// // // // // //                 if (!msg.read && msg.sender !== user.id) {
// // // // // //                     update(databaseRef(database, `messagesA/${user.id}/${otherUser.id}/${msg.id}`), { read: true });
// // // // // //                     update(databaseRef(database, `messagesA/${otherUser.id}/${user.id}/${msg.id}`), { read: true });
// // // // // //                 }
// // // // // //             });
// // // // // //         });

// // // // // //         const userStatusRef = databaseRef(database, `lastSeenA/${otherUser.id}`);
// // // // // //         onValue(userStatusRef, (snapshot) => {
// // // // // //             const timestamp = snapshot.val()?.timestamp || null;
// // // // // //             if (timestamp) {
// // // // // //                 const date = new Date(Number(timestamp));
// // // // // //                 setLastSeen(date.toLocaleString() || 'Offline');
// // // // // //             }
// // // // // //         });

// // // // // //         update(databaseRef(database, `lastSeenA/${user.id}`), { timestamp: Date.now() });

// // // // // //         return () => {
// // // // // //             update(databaseRef(database, `lastSeenA/${user.id}`), { timestamp: null });
// // // // // //         };
// // // // // //     }, [user.id, otherUser.id]);

// // // // // //     // Handle file upload and sending message
// // // // // //     const sendMessage = async () => {
// // // // // //         if (messageText.trim() === "" && selectedFiles.length === 0) return;

// // // // // //         const messagesRef = databaseRef(database, `messagesA/${user.id}/${otherUser.id}`);
// // // // // //         const newMessage = {
// // // // // //             text: messageText,
// // // // // //             sender: user.id,
// // // // // //             timestamp: Date.now(),
// // // // // //             read: false,
// // // // // //             files: [],
// // // // // //         };

// // // // // //         setUploading(true);
// // // // // //         const uploadedFiles = await Promise.all(selectedFiles.map(async (file) => {
// // // // // //             const fileRef = storageRef(storage, `chatFilesA/${file.name}`);
// // // // // //             await uploadBytes(fileRef, file);
// // // // // //             return getDownloadURL(fileRef);
// // // // // //         }));

// // // // // //         newMessage.files = uploadedFiles;
// // // // // //         const newMsgRef = await push(messagesRef, newMessage);
// // // // // //         setMessageText('');
// // // // // //         setSelectedFiles([]);
// // // // // //         setUploading(false);

// // // // // //         await push(databaseRef(database, `messagesA/${otherUser.id}/${user.id}`), { ...newMessage, id: newMsgRef.key });
// // // // // //         update(databaseRef(database, `lastSeenA/${user.id}`), { timestamp: Date.now() });
// // // // // //     };

// // // // // //     // Render media (images/files) attached to messages
// // // // // //     const renderMedia = (files) => {
// // // // // //         return files && files.length > 0 ? (
// // // // // //             <div className="grid grid-cols-4 gap-2 mt-2">
// // // // // //                 {files.map((file, index) => (
// // // // // //                     <a key={index} href={file} target="_blank" rel="noopener noreferrer" className="w-20 h-20 border rounded-lg overflow-hidden bg-white">
// // // // // //                         {file.endsWith('.jpg') || file.endsWith('.png') || file.endsWith('.gif') ? (
// // // // // //                             <img src={file} alt="Media" className="object-cover h-full w-full" />
// // // // // //                         ) : (
// // // // // //                             <span className="text-sm text-gray-600">File</span>
// // // // // //                         )}
// // // // // //                     </a>
// // // // // //                 ))}
// // // // // //             </div>
// // // // // //         ) : null;
// // // // // //     };

// // // // // //     // Conditional bubble styling based on chatSettings
// // // // // //     const bubbleClasses = (isSender) => {
// // // // // //         const baseClasses = `max-w-xs p-2 ${chatSettings.bubbleStyle === 'rounded' ? 'rounded-lg' : chatSettings.bubbleStyle === 'square' ? '' : 'rounded-full'}`;
// // // // // //         return isSender ? `${baseClasses} bg-${chatSettings.senderBubbleColor}` : `${baseClasses} bg-${chatSettings.receiverBubbleColor}`;
// // // // // //     };

// // // // // //     return (
// // // // // //         <div className={`flex flex-col h-screen ${chatSettings.isNightMode ? 'bg-gray-900' : 'bg-gray-100'}`}>
// // // // // //             <header className="flex-none p-4 bg-white border-b border-gray-300 text-center relative">
// // // // // //                 <h2 className="text-xl">{otherUser.name}</h2>
// // // // // //                 <p className="text-sm">{lastSeen ? 'Last seen: ' + lastSeen : 'Offline'}</p>
// // // // // //                 <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="text-gray-500 hover:text-gray-700">
// // // // // //                     •••
// // // // // //                 </button>
// // // // // //                 {isMenuOpen && (
// // // // // //                     <div className="absolute right-0 mt-2 w-48 bg-white border rounded shadow-lg z-10">
// // // // // //                         <div className="p-2">
// // // // // //                             <button onClick={() => setIsBubbleMenuOpen(!isBubbleMenuOpen)} className="block text-left w-full">
// // // // // //                                 Bubble Style
// // // // // //                             </button>
// // // // // //                             {isBubbleMenuOpen && (
// // // // // //                                 <div className="mt-2 bg-gray-100 p-2 rounded">
// // // // // //                                     <button onClick={() => saveSettings({ bubbleStyle: 'rounded' })} className="block w-full text-left mt-1">Rounded</button>
// // // // // //                                     <button onClick={() => saveSettings({ bubbleStyle: 'square' })} className="block w-full text-left mt-1">Square</button>
// // // // // //                                     <button onClick={() => saveSettings({ bubbleStyle: 'circle' })} className="block w-full text-left mt-1">Circle</button>
// // // // // //                                 </div>
// // // // // //                             )}
// // // // // //                         </div>
// // // // // //                         {/* Rest of color and night mode settings */}
// // // // // //                     </div>
// // // // // //                 )}
// // // // // //             </header>
// // // // // //             <main className="flex-1 overflow-y-auto p-4">
// // // // // //                 {messages.map((msg, index) => (
// // // // // //                     <div key={index} className={`flex my-2 ${msg.sender === user.id ? 'justify-end' : 'justify-start'}`}>
// // // // // //                         <div
// // // // // //                             className={bubbleClasses(msg.sender === user.id)}
// // // // // //                             style={{
// // // // // //                                 color: msg.sender === user.id ? chatSettings.senderTextColor : chatSettings.receiverTextColor,
// // // // // //                                 backgroundColor: msg.sender === user.id ? chatSettings.senderBubbleColor : chatSettings.receiverBubbleColor
// // // // // //                             }}
// // // // // //                         >
// // // // // //                             <p>{msg.text}</p>
// // // // // //                             {renderMedia(msg.files)}
// // // // // //                         </div>
// // // // // //                     </div>
// // // // // //                 ))}
// // // // // //             </main>
// // // // // //             <footer className="flex-none p-4 bg-white border-t border-gray-300">
// // // // // //                 <div className="flex items-center">
// // // // // //                     <input
// // // // // //                         type="text"
// // // // // //                         value={messageText}
// // // // // //                         onChange={(e) => setMessageText(e.target.value)}
// // // // // //                         placeholder="Type a message"
// // // // // //                         className="flex-1 border rounded-l-md p-2"
// // // // // //                     />
// // // // // //                     <button onClick={sendMessage} className="bg-blue-500 text-white p-2 rounded-r-md">
// // // // // //                         Send
// // // // // //                     </button>
// // // // // //                 </div>
// // // // // //             </footer>
// // // // // //         </div>
// // // // // //     );
// // // // // // };

// // // // // // export default Chat;



// // // // // // // "use client"; // Enable client-side rendering
// // // // // // // import React, { useState, useEffect } from 'react';
// // // // // // // import { database, storage } from '../config/firebase';
// // // // // // // import { ref as databaseRef, onValue, push, update } from 'firebase/database';
// // // // // // // import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
// // // // // // // import 'tailwindcss/tailwind.css';

// // // // // // // const Chat = ({ user }) => {
// // // // // // //     const otherUser = user.id === 'user1' ? { id: 'user2', name: 'User 2' } : { id: 'user1', name: 'User 1' };
// // // // // // //     const [messages, setMessages] = useState([]);
// // // // // // //     const [messageText, setMessageText] = useState('');
// // // // // // //     const [selectedFiles, setSelectedFiles] = useState([]);
// // // // // // //     const [uploading, setUploading] = useState(false);
// // // // // // //     const [lastSeen, setLastSeen] = useState('Offline');
// // // // // // //     const [isMenuOpen, setIsMenuOpen] = useState(false);
// // // // // // //     const [isColorMenuOpen, setIsColorMenuOpen] = useState(false);
// // // // // // //     const [isSenderSettingsOpen, setIsSenderSettingsOpen] = useState(false);
// // // // // // //     const [isReceiverSettingsOpen, setIsReceiverSettingsOpen] = useState(false);
// // // // // // //     const [chatSettings, setChatSettings] = useState({
// // // // // // //         senderBubbleColor: '#3B82F6',
// // // // // // //         receiverBubbleColor: '#E5E7EB',
// // // // // // //         senderTextColor: '#FFFFFF',
// // // // // // //         receiverTextColor: '#000000',
// // // // // // //         isNightMode: false,
// // // // // // //     });

// // // // // // //     useEffect(() => {
// // // // // // //         const savedSettings = JSON.parse(localStorage.getItem(`chatSettings-${user.id}`));
// // // // // // //         if (savedSettings) {
// // // // // // //             setChatSettings(savedSettings);
// // // // // // //         }
// // // // // // //     }, [user.id]);

// // // // // // //     const saveSettings = (newSettings) => {
// // // // // // //         const settings = { ...chatSettings, ...newSettings };
// // // // // // //         setChatSettings(settings);
// // // // // // //         localStorage.setItem(`chatSettings-${user.id}`, JSON.stringify(settings));
// // // // // // //     };

// // // // // // //     useEffect(() => {
// // // // // // //         const messagesRef = databaseRef(database, `messagesA/${user.id}/${otherUser.id}`);
// // // // // // //         onValue(messagesRef, (snapshot) => {
// // // // // // //             const data = snapshot.val();
// // // // // // //             setMessages(data ? Object.values(data) : []);

// // // // // // //             data && Object.values(data).forEach((msg) => {
// // // // // // //                 if (!msg.read && msg.sender !== user.id) {
// // // // // // //                     update(databaseRef(database, `messagesA/${user.id}/${otherUser.id}/${msg.id}`), { read: true });
// // // // // // //                     update(databaseRef(database, `messagesA/${otherUser.id}/${user.id}/${msg.id}`), { read: true });
// // // // // // //                 }
// // // // // // //             });
// // // // // // //         });

// // // // // // //         const userStatusRef = databaseRef(database, `lastSeenA/${otherUser.id}`);
// // // // // // //         onValue(userStatusRef, (snapshot) => {
// // // // // // //             const timestamp = snapshot.val()?.timestamp || null;
// // // // // // //             if (timestamp) {
// // // // // // //                 const date = new Date(Number(timestamp));
// // // // // // //                 setLastSeen(date.toLocaleString() || 'Offline');
// // // // // // //             }
// // // // // // //         });

// // // // // // //         update(databaseRef(database, `lastSeenA/${user.id}`), { timestamp: Date.now() });

// // // // // // //         return () => {
// // // // // // //             update(databaseRef(database, `lastSeenA/${user.id}`), { timestamp: null });
// // // // // // //         };
// // // // // // //     }, [user.id, otherUser.id]);

// // // // // // //     const handleFileChange = (event) => {
// // // // // // //         const files = Array.from(event.target.files);
// // // // // // //         setSelectedFiles((prevFiles) => [...prevFiles, ...files]);
// // // // // // //     };

// // // // // // //     const removeFile = (index) => {
// // // // // // //         setSelectedFiles((prevFiles) => prevFiles.filter((_, i) => i !== index));
// // // // // // //     };

// // // // // // //     const sendMessage = async () => {
// // // // // // //         if (messageText.trim() === "" && selectedFiles.length === 0) return;

// // // // // // //         const messagesRef = databaseRef(database, `messagesA/${user.id}/${otherUser.id}`);
// // // // // // //         const newMessage = {
// // // // // // //             text: messageText,
// // // // // // //             sender: user.id,
// // // // // // //             timestamp: Date.now(),
// // // // // // //             read: false,
// // // // // // //             files: [],
// // // // // // //         };

// // // // // // //         setUploading(true);
// // // // // // //         const uploadedFiles = await Promise.all(selectedFiles.map(async (file) => {
// // // // // // //             const fileRef = storageRef(storage, `chatFilesA/${file.name}`);
// // // // // // //             await uploadBytes(fileRef, file);
// // // // // // //             return getDownloadURL(fileRef);
// // // // // // //         }));

// // // // // // //         newMessage.files = uploadedFiles;
// // // // // // //         const newMsgRef = await push(messagesRef, newMessage);
// // // // // // //         setMessageText('');
// // // // // // //         setSelectedFiles([]);
// // // // // // //         setUploading(false);

// // // // // // //         await push(databaseRef(database, `messagesA/${otherUser.id}/${user.id}`), { ...newMessage, id: newMsgRef.key });
// // // // // // //         update(databaseRef(database, `lastSeenA/${user.id}`), { timestamp: Date.now() });
// // // // // // //     };

// // // // // // //     const renderMedia = (files) => {
// // // // // // //         return files && files.length > 0 ? (
// // // // // // //             <div className="grid grid-cols-4 gap-2 mt-2">
// // // // // // //                 {files.map((file, index) => (
// // // // // // //                     <a key={index} href={file} target="_blank" rel="noopener noreferrer" className="w-20 h-20 border rounded-lg overflow-hidden bg-white">
// // // // // // //                         {file.endsWith('.jpg') || file.endsWith('.png') || file.endsWith('.gif') ? (
// // // // // // //                             <img src={file} alt="Media" className="object-cover h-full w-full" />
// // // // // // //                         ) : (
// // // // // // //                             <span className="text-sm text-gray-600">File</span>
// // // // // // //                         )}
// // // // // // //                     </a>
// // // // // // //                 ))}
// // // // // // //             </div>
// // // // // // //         ) : null;
// // // // // // //     };

// // // // // // //     return (
// // // // // // //         <div className={`flex flex-col h-screen ${chatSettings.isNightMode ? 'bg-gray-900' : 'bg-gray-100'}`}>
// // // // // // //             <header className="flex-none p-4 bg-white border-b border-gray-300 text-center relative">
// // // // // // //                 <h2 className="text-xl">{otherUser.name}</h2>
// // // // // // //                 <p className="text-sm">{lastSeen ? 'Last seen: ' + lastSeen : 'Offline'}</p>
// // // // // // //                 <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="text-gray-500 hover:text-gray-700">
// // // // // // //                     •••
// // // // // // //                 </button>
// // // // // // //                 {isMenuOpen && (
// // // // // // //                     <div className="absolute right-0 mt-2 w-48 bg-white border rounded shadow-lg z-10">
// // // // // // //                         <div className="p-2">
// // // // // // //                             <button onClick={() => setIsColorMenuOpen(!isColorMenuOpen)} className="block text-left w-full">
// // // // // // //                                 Colors
// // // // // // //                             </button>
// // // // // // //                             {isColorMenuOpen && (
// // // // // // //                                 <div className="mt-2 bg-gray-100 p-2 rounded">
// // // // // // //                                     <button onClick={() => setIsSenderSettingsOpen(!isSenderSettingsOpen)} className="block text-left w-full">Sender</button>
// // // // // // //                                     {isSenderSettingsOpen && (
// // // // // // //                                         <div className="mt-2">
// // // // // // //                                             <label className="block text-sm">Sender Bubble Color:</label>
// // // // // // //                                             <input
// // // // // // //                                                 type="color"
// // // // // // //                                                 value={chatSettings.senderBubbleColor}
// // // // // // //                                                 onChange={(e) => saveSettings({ senderBubbleColor: e.target.value })}
// // // // // // //                                                 className="w-full h-8 p-0 border-none"
// // // // // // //                                             />
// // // // // // //                                             <label className="block text-sm">Sender Text Color:</label>
// // // // // // //                                             <input
// // // // // // //                                                 type="color"
// // // // // // //                                                 value={chatSettings.senderTextColor}
// // // // // // //                                                 onChange={(e) => saveSettings({ senderTextColor: e.target.value })}
// // // // // // //                                                 className="w-full h-8 p-0 border-none"
// // // // // // //                                             />
// // // // // // //                                         </div>
// // // // // // //                                     )}
// // // // // // //                                     <button onClick={() => setIsReceiverSettingsOpen(!isReceiverSettingsOpen)} className="block text-left w-full mt-2">Receiver</button>
// // // // // // //                                     {isReceiverSettingsOpen && (
// // // // // // //                                         <div className="mt-2">
// // // // // // //                                             <label className="block text-sm">Receiver Bubble Color:</label>
// // // // // // //                                             <input
// // // // // // //                                                 type="color"
// // // // // // //                                                 value={chatSettings.receiverBubbleColor}
// // // // // // //                                                 onChange={(e) => saveSettings({ receiverBubbleColor: e.target.value })}
// // // // // // //                                                 className="w-full h-8 p-0 border-none"
// // // // // // //                                             />
// // // // // // //                                             <label className="block text-sm">Receiver Text Color:</label>
// // // // // // //                                             <input
// // // // // // //                                                 type="color"
// // // // // // //                                                 value={chatSettings.receiverTextColor}
// // // // // // //                                                 onChange={(e) => saveSettings({ receiverTextColor: e.target.value })}
// // // // // // //                                                 className="w-full h-8 p-0 border-none"
// // // // // // //                                             />
// // // // // // //                                         </div>
// // // // // // //                                     )}
// // // // // // //                                 </div>
// // // // // // //                             )}
// // // // // // //                         </div>
// // // // // // //                         <div className="flex items-center justify-between p-2">
// // // // // // //                             <span className="text-sm">Day/Night Mode</span>
// // // // // // //                             <button
// // // // // // //                                 onClick={() => saveSettings({ isNightMode: !chatSettings.isNightMode })}
// // // // // // //                                 className={`flex items-center ${chatSettings.isNightMode ? 'bg-gray-800' : 'bg-gray-300'} w-16 h-8 rounded-full relative`}
// // // // // // //                             >
// // // // // // //                                 <span className={`absolute w-8 h-8 bg-white rounded-full transition-transform ${chatSettings.isNightMode ? 'transform translate-x-8' : ''}`} />
// // // // // // //                                 <span className={`text-gray-700 ${chatSettings.isNightMode ? 'hidden' : 'block'}`}>☀️</span>
// // // // // // //                                 <span className={`text-gray-700 ${chatSettings.isNightMode ? 'block' : 'hidden'}`}>🌙</span>
// // // // // // //                             </button>
// // // // // // //                         </div>
// // // // // // //                     </div>
// // // // // // //                 )}
// // // // // // //             </header>
// // // // // // //             <main className="flex-1 overflow-y-auto p-4">
// // // // // // //                 {messages.map((msg, index) => (
// // // // // // //                     <div key={index} className={`flex my-2 ${msg.sender === user.id ? 'justify-end' : 'justify-start'}`}>
// // // // // // //                         <div
// // // // // // //                             className={`max-w-xs p-2 rounded-lg ${msg.sender === user.id ? chatSettings.senderBubbleColor : chatSettings.receiverBubbleColor}`}
// // // // // // //                         >
// // // // // // //                             <p style={{ color: msg.sender === user.id ? chatSettings.senderTextColor : chatSettings.receiverTextColor }}>
// // // // // // //                                 {msg.text}
// // // // // // //                             </p>
// // // // // // //                             {renderMedia(msg.files)}
// // // // // // //                         </div>
// // // // // // //                     </div>
// // // // // // //                 ))}
// // // // // // //             </main>
// // // // // // //             <footer className="flex-none p-4 bg-white border-t border-gray-300">
// // // // // // //                 <div className="flex items-center">
// // // // // // //                     <input
// // // // // // //                         type="text"
// // // // // // //                         value={messageText}
// // // // // // //                         onChange={(e) => setMessageText(e.target.value)}
// // // // // // //                         placeholder="Type a message"
// // // // // // //                         className="flex-1 border rounded-lg p-2"
// // // // // // //                     />
// // // // // // //                     <input type="file" multiple onChange={handleFileChange} className="ml-2" />
// // // // // // //                     <button onClick={sendMessage} className="ml-2 bg-blue-500 text-white rounded-lg p-2" disabled={uploading}>
// // // // // // //                         Send
// // // // // // //                     </button>
// // // // // // //                 </div>
// // // // // // //             </footer>
// // // // // // //         </div>
// // // // // // //     );
// // // // // // // };

// // // // // // // export default Chat;

// // // // // // // // "use client"; // Enable client-side rendering
// // // // // // // // import React, { useState, useEffect } from 'react';
// // // // // // // // import { database, storage } from '../config/firebase';
// // // // // // // // import { ref as databaseRef, onValue, push, update } from 'firebase/database';
// // // // // // // // import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
// // // // // // // // import 'tailwindcss/tailwind.css';

// // // // // // // // const Chat = ({ user }) => {
// // // // // // // //     const otherUser = user.id === 'user1' ? { id: 'user2', name: 'User 2' } : { id: 'user1', name: 'User 1' };
// // // // // // // //     const [messages, setMessages] = useState([]);
// // // // // // // //     const [messageText, setMessageText] = useState('');
// // // // // // // //     const [selectedFiles, setSelectedFiles] = useState([]);
// // // // // // // //     const [uploading, setUploading] = useState(false);
// // // // // // // //     const [lastSeen, setLastSeen] = useState('Offline');
// // // // // // // //     const [isMenuOpen, setIsMenuOpen] = useState(false);
// // // // // // // //     const [isColorMenuOpen, setIsColorMenuOpen] = useState(false);
// // // // // // // //     const [isSenderSettingsOpen, setIsSenderSettingsOpen] = useState(false);
// // // // // // // //     const [isReceiverSettingsOpen, setIsReceiverSettingsOpen] = useState(false);
// // // // // // // //     const [chatSettings, setChatSettings] = useState({
// // // // // // // //         senderBubbleColor: '#3B82F6',
// // // // // // // //         receiverBubbleColor: '#E5E7EB',
// // // // // // // //         senderTextColor: '#FFFFFF',
// // // // // // // //         receiverTextColor: '#000000',
// // // // // // // //         isNightMode: false,
// // // // // // // //     });

// // // // // // // //     useEffect(() => {
// // // // // // // //         const savedSettings = JSON.parse(localStorage.getItem(`chatSettings-${user.id}`));
// // // // // // // //         if (savedSettings) {
// // // // // // // //             setChatSettings(savedSettings);
// // // // // // // //         }
// // // // // // // //     }, [user.id]);

// // // // // // // //     const saveSettings = (newSettings) => {
// // // // // // // //         const settings = { ...chatSettings, ...newSettings };
// // // // // // // //         setChatSettings(settings);
// // // // // // // //         localStorage.setItem(`chatSettings-${user.id}`, JSON.stringify(settings));
// // // // // // // //     };

// // // // // // // //     useEffect(() => {
// // // // // // // //         const messagesRef = databaseRef(database, `messagesA/${user.id}/${otherUser.id}`);
// // // // // // // //         onValue(messagesRef, (snapshot) => {
// // // // // // // //             const data = snapshot.val();
// // // // // // // //             setMessages(data ? Object.values(data) : []);

// // // // // // // //             data && Object.values(data).forEach((msg) => {
// // // // // // // //                 if (!msg.read && msg.sender !== user.id) {
// // // // // // // //                     update(databaseRef(database, `messagesA/${user.id}/${otherUser.id}/${msg.id}`), { read: true });
// // // // // // // //                     update(databaseRef(database, `messagesA/${otherUser.id}/${user.id}/${msg.id}`), { read: true });
// // // // // // // //                 }
// // // // // // // //             });
// // // // // // // //         });

// // // // // // // //         const userStatusRef = databaseRef(database, `lastSeenA/${otherUser.id}`);
// // // // // // // //         onValue(userStatusRef, (snapshot) => {
// // // // // // // //             const timestamp = snapshot.val()?.timestamp || null;
// // // // // // // //             if (timestamp) {
// // // // // // // //                 const date = new Date(Number(timestamp));
// // // // // // // //                 setLastSeen(date.toLocaleString() || 'Offline');
// // // // // // // //             }
// // // // // // // //         });

// // // // // // // //         update(databaseRef(database, `lastSeenA/${user.id}`), { timestamp: Date.now() });

// // // // // // // //         return () => {
// // // // // // // //             update(databaseRef(database, `lastSeenA/${user.id}`), { timestamp: null });
// // // // // // // //         };
// // // // // // // //     }, [user.id, otherUser.id]);

// // // // // // // //     const handleFileChange = (event) => {
// // // // // // // //         const files = Array.from(event.target.files);
// // // // // // // //         setSelectedFiles((prevFiles) => [...prevFiles, ...files]);
// // // // // // // //     };

// // // // // // // //     const removeFile = (index) => {
// // // // // // // //         setSelectedFiles((prevFiles) => prevFiles.filter((_, i) => i !== index));
// // // // // // // //     };

// // // // // // // //     const sendMessage = async () => {
// // // // // // // //         if (messageText.trim() === "" && selectedFiles.length === 0) return;

// // // // // // // //         const messagesRef = databaseRef(database, `messagesA/${user.id}/${otherUser.id}`);
// // // // // // // //         const newMessage = {
// // // // // // // //             text: messageText,
// // // // // // // //             sender: user.id,
// // // // // // // //             timestamp: Date.now(),
// // // // // // // //             read: false,
// // // // // // // //             files: [],
// // // // // // // //         };

// // // // // // // //         setUploading(true);
// // // // // // // //         const uploadedFiles = await Promise.all(selectedFiles.map(async (file) => {
// // // // // // // //             const fileRef = storageRef(storage, `chatFilesA/${file.name}`);
// // // // // // // //             await uploadBytes(fileRef, file);
// // // // // // // //             return getDownloadURL(fileRef);
// // // // // // // //         }));

// // // // // // // //         newMessage.files = uploadedFiles;
// // // // // // // //         const newMsgRef = await push(messagesRef, newMessage);
// // // // // // // //         setMessageText('');
// // // // // // // //         setSelectedFiles([]);
// // // // // // // //         setUploading(false);

// // // // // // // //         await push(databaseRef(database, `messagesA/${otherUser.id}/${user.id}`), { ...newMessage, id: newMsgRef.key });
// // // // // // // //         update(databaseRef(database, `lastSeenA/${user.id}`), { timestamp: Date.now() });
// // // // // // // //     };

// // // // // // // //     const renderMedia = (files) => {
// // // // // // // //         return files && files.length > 0 ? (
// // // // // // // //             <div className="grid grid-cols-4 gap-2 mt-2">
// // // // // // // //                 {files.map((file, index) => (
// // // // // // // //                     <a key={index} href={file} target="_blank" rel="noopener noreferrer" className="w-20 h-20 border rounded-lg overflow-hidden bg-white">
// // // // // // // //                         {file.endsWith('.jpg') || file.endsWith('.png') || file.endsWith('.gif') ? (
// // // // // // // //                             <img src={file} alt="Media" className="object-cover h-full w-full" />
// // // // // // // //                         ) : (
// // // // // // // //                             <span className="text-sm text-gray-600">File</span>
// // // // // // // //                         )}
// // // // // // // //                     </a>
// // // // // // // //                 ))}
// // // // // // // //             </div>
// // // // // // // //         ) : null;
// // // // // // // //     };

// // // // // // // //     return (
// // // // // // // //         <div className={`flex flex-col h-screen ${chatSettings.isNightMode ? 'bg-gray-900' : 'bg-gray-100'}`}>
// // // // // // // //             <header className="flex-none p-4 bg-white border-b border-gray-300 text-center relative">
// // // // // // // //                 <h2 className="text-xl">{otherUser.name}</h2>
// // // // // // // //                 <p className="text-sm">{lastSeen ? 'Last seen: ' + lastSeen : 'Offline'}</p>
// // // // // // // //                 <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="text-gray-500 hover:text-gray-700">
// // // // // // // //                     •••
// // // // // // // //                 </button>
// // // // // // // //                 {isMenuOpen && (
// // // // // // // //                     <div className="absolute right-0 mt-2 w-48 bg-white border rounded shadow-lg z-10">
// // // // // // // //                         <div className="p-2">
// // // // // // // //                             <button onClick={() => setIsColorMenuOpen(!isColorMenuOpen)} className="block text-left w-full">
// // // // // // // //                                 Colors
// // // // // // // //                             </button>
// // // // // // // //                             {isColorMenuOpen && (
// // // // // // // //                                 <div className="mt-2 bg-gray-100 p-2 rounded">
// // // // // // // //                                     <button onClick={() => setIsSenderSettingsOpen(!isSenderSettingsOpen)} className="block text-left w-full">Sender</button>
// // // // // // // //                                     {isSenderSettingsOpen && (
// // // // // // // //                                         <div className="mt-2">
// // // // // // // //                                             <label className="block text-sm">Sender Bubble Color:</label>
// // // // // // // //                                             <input
// // // // // // // //                                                 type="color"
// // // // // // // //                                                 value={chatSettings.senderBubbleColor}
// // // // // // // //                                                 onChange={(e) => saveSettings({ senderBubbleColor: e.target.value })}
// // // // // // // //                                                 className="w-full h-8 p-0 border-none"
// // // // // // // //                                             />
// // // // // // // //                                             <label className="block text-sm">Sender Text Color:</label>
// // // // // // // //                                             <input
// // // // // // // //                                                 type="color"
// // // // // // // //                                                 value={chatSettings.senderTextColor}
// // // // // // // //                                                 onChange={(e) => saveSettings({ senderTextColor: e.target.value })}
// // // // // // // //                                                 className="w-full h-8 p-0 border-none"
// // // // // // // //                                             />
// // // // // // // //                                         </div>
// // // // // // // //                                     )}
// // // // // // // //                                     <button onClick={() => setIsReceiverSettingsOpen(!isReceiverSettingsOpen)} className="block text-left w-full mt-2">Receiver</button>
// // // // // // // //                                     {isReceiverSettingsOpen && (
// // // // // // // //                                         <div className="mt-2">
// // // // // // // //                                             <label className="block text-sm">Receiver Bubble Color:</label>
// // // // // // // //                                             <input
// // // // // // // //                                                 type="color"
// // // // // // // //                                                 value={chatSettings.receiverBubbleColor}
// // // // // // // //                                                 onChange={(e) => saveSettings({ receiverBubbleColor: e.target.value })}
// // // // // // // //                                                 className="w-full h-8 p-0 border-none"
// // // // // // // //                                             />
// // // // // // // //                                             <label className="block text-sm">Receiver Text Color:</label>
// // // // // // // //                                             <input
// // // // // // // //                                                 type="color"
// // // // // // // //                                                 value={chatSettings.receiverTextColor}
// // // // // // // //                                                 onChange={(e) => saveSettings({ receiverTextColor: e.target.value })}
// // // // // // // //                                                 className="w-full h-8 p-0 border-none"
// // // // // // // //                                             />
// // // // // // // //                                         </div>
// // // // // // // //                                     )}
// // // // // // // //                                 </div>
// // // // // // // //                             )}
// // // // // // // //                         </div>
// // // // // // // //                         <div className="flex items-center justify-between p-2">
// // // // // // // //                             <span className="text-sm">Day/Night Mode</span>
// // // // // // // //                             <button
// // // // // // // //                                 onClick={() => saveSettings({ isNightMode: !chatSettings.isNightMode })}
// // // // // // // //                                 className={`flex items-center ${chatSettings.isNightMode ? 'bg-gray-800' : 'bg-gray-300'} w-16 h-8 rounded-full relative`}
// // // // // // // //                             >
// // // // // // // //                                 <span className={`absolute w-8 h-8 bg-white rounded-full transition-transform ${chatSettings.isNightMode ? 'transform translate-x-8' : ''}`} />
// // // // // // // //                                 <span className={`text-gray-700 ${chatSettings.isNightMode ? 'hidden' : 'block'}`}>☀️</span>
// // // // // // // //                                 <span className={`text-gray-700 ${chatSettings.isNightMode ? 'block' : 'hidden'}`}>🌙</span>
// // // // // // // //                             </button>
// // // // // // // //                         </div>
// // // // // // // //                     </div>
// // // // // // // //                 )}
// // // // // // // //             </header>
// // // // // // // //             <main className="flex-1 overflow-y-auto p-4">
// // // // // // // //                 {messages.map((msg, index) => (
// // // // // // // //                     <div key={index} className={`flex my-2 ${msg.sender === user.id ? 'justify-end' : 'justify-start'}`}>
// // // // // // // //                         <div
// // // // // // // //                             className={`max-w-xs p-2 rounded-lg ${msg.sender === user.id ? chatSettings.senderBubbleColor : chatSettings.receiverBubbleColor}`}
// // // // // // // //                         >
// // // // // // // //                             <p style={{ color: msg.sender === user.id ? chatSettings.senderTextColor : chatSettings.receiverTextColor }}>
// // // // // // // //                                 {msg.text}
// // // // // // // //                             </p>
// // // // // // // //                             {renderMedia(msg.files)}
// // // // // // // //                         </div>
// // // // // // // //                     </div>
// // // // // // // //                 ))}
// // // // // // // //             </main>
// // // // // // // //             <footer className="flex-none p-4 bg-white border-t border-gray-300">
// // // // // // // //                 <div className="flex items-center">
// // // // // // // //                     <input
// // // // // // // //                         type="text"
// // // // // // // //                         value={messageText}
// // // // // // // //                         onChange={(e) => setMessageText(e.target.value)}
// // // // // // // //                         placeholder="Type a message"
// // // // // // // //                         className="flex-1 border rounded-lg p-2"
// // // // // // // //                     />
// // // // // // // //                     <input type="file" multiple onChange={handleFileChange} className="ml-2" />
// // // // // // // //                     <button onClick={sendMessage} className="ml-2 bg-blue-500 text-white rounded-lg p-2" disabled={uploading}>
// // // // // // // //                         Send
// // // // // // // //                     </button>
// // // // // // // //                 </div>
// // // // // // // //             </footer>
// // // // // // // //         </div>
// // // // // // // //     );
// // // // // // // // };

// // // // // // // // export default Chat;


// // // // // // // // // "use client"; // Enable client-side rendering
// // // // // // // // // import React, { useState, useEffect } from 'react';
// // // // // // // // // import { database, storage } from '../config/firebase';
// // // // // // // // // import { ref as databaseRef, onValue, push, update } from 'firebase/database';
// // // // // // // // // import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
// // // // // // // // // import 'tailwindcss/tailwind.css';

// // // // // // // // // const Chat = ({ user }) => {
// // // // // // // // //     const otherUser = user.id === 'user1' ? { id: 'user2', name: 'User 2' } : { id: 'user1', name: 'User 1' };
// // // // // // // // //     const [messages, setMessages] = useState([]);
// // // // // // // // //     const [messageText, setMessageText] = useState('');
// // // // // // // // //     const [selectedFiles, setSelectedFiles] = useState([]);
// // // // // // // // //     const [uploading, setUploading] = useState(false);
// // // // // // // // //     const [lastSeen, setLastSeen] = useState('Offline');
// // // // // // // // //     const [isMenuOpen, setIsMenuOpen] = useState(false);
// // // // // // // // //     const [chatSettings, setChatSettings] = useState({
// // // // // // // // //         senderBubbleColor: '#3B82F6', // Default bubble color
// // // // // // // // //         receiverBubbleColor: '#E5E7EB', // Default bubble color
// // // // // // // // //         senderTextColor: '#FFFFFF', // Default sender text color
// // // // // // // // //         receiverTextColor: '#000000', // Default receiver text color
// // // // // // // // //         isNightMode: false,
// // // // // // // // //     });

// // // // // // // // //     useEffect(() => {
// // // // // // // // //         const savedSettings = JSON.parse(localStorage.getItem(`chatSettings-${user.id}`));
// // // // // // // // //         if (savedSettings) {
// // // // // // // // //             setChatSettings(savedSettings);
// // // // // // // // //         }
// // // // // // // // //     }, [user.id]);

// // // // // // // // //     const saveSettings = (newSettings) => {
// // // // // // // // //         const settings = { ...chatSettings, ...newSettings };
// // // // // // // // //         setChatSettings(settings);
// // // // // // // // //         localStorage.setItem(`chatSettings-${user.id}`, JSON.stringify(settings));
// // // // // // // // //     };

// // // // // // // // //     useEffect(() => {
// // // // // // // // //         const messagesRef = databaseRef(database, `messagesA/${user.id}/${otherUser.id}`);
// // // // // // // // //         onValue(messagesRef, (snapshot) => {
// // // // // // // // //             const data = snapshot.val();
// // // // // // // // //             setMessages(data ? Object.values(data) : []);

// // // // // // // // //             data && Object.values(data).forEach((msg) => {
// // // // // // // // //                 if (!msg.read && msg.sender !== user.id) {
// // // // // // // // //                     update(databaseRef(database, `messagesA/${user.id}/${otherUser.id}/${msg.id}`), { read: true });
// // // // // // // // //                     update(databaseRef(database, `messagesA/${otherUser.id}/${user.id}/${msg.id}`), { read: true });
// // // // // // // // //                 }
// // // // // // // // //             });
// // // // // // // // //         });

// // // // // // // // //         const userStatusRef = databaseRef(database, `lastSeenA/${otherUser.id}`);
// // // // // // // // //         onValue(userStatusRef, (snapshot) => {
// // // // // // // // //             const timestamp = snapshot.val()?.timestamp || null;
// // // // // // // // //             if (timestamp) {
// // // // // // // // //                 const date = new Date(Number(timestamp));
// // // // // // // // //                 setLastSeen(date.toLocaleString() || 'Offline');
// // // // // // // // //             }
// // // // // // // // //         });

// // // // // // // // //         update(databaseRef(database, `lastSeenA/${user.id}`), { timestamp: Date.now() });

// // // // // // // // //         return () => {
// // // // // // // // //             update(databaseRef(database, `lastSeenA/${user.id}`), { timestamp: null });
// // // // // // // // //         };
// // // // // // // // //     }, [user.id, otherUser.id]);

// // // // // // // // //     const handleFileChange = (event) => {
// // // // // // // // //         const files = Array.from(event.target.files);
// // // // // // // // //         setSelectedFiles((prevFiles) => [...prevFiles, ...files]);
// // // // // // // // //     };

// // // // // // // // //     const removeFile = (index) => {
// // // // // // // // //         setSelectedFiles((prevFiles) => prevFiles.filter((_, i) => i !== index));
// // // // // // // // //     };

// // // // // // // // //     const sendMessage = async () => {
// // // // // // // // //         if (messageText.trim() === "" && selectedFiles.length === 0) return;

// // // // // // // // //         const messagesRef = databaseRef(database, `messagesA/${user.id}/${otherUser.id}`);
// // // // // // // // //         const newMessage = {
// // // // // // // // //             text: messageText,
// // // // // // // // //             sender: user.id,
// // // // // // // // //             timestamp: Date.now(),
// // // // // // // // //             read: false,
// // // // // // // // //             files: [],
// // // // // // // // //         };

// // // // // // // // //         setUploading(true);
// // // // // // // // //         const uploadedFiles = await Promise.all(selectedFiles.map(async (file) => {
// // // // // // // // //             const fileRef = storageRef(storage, `chatFilesA/${file.name}`);
// // // // // // // // //             await uploadBytes(fileRef, file);
// // // // // // // // //             return getDownloadURL(fileRef);
// // // // // // // // //         }));

// // // // // // // // //         newMessage.files = uploadedFiles;
// // // // // // // // //         const newMsgRef = await push(messagesRef, newMessage);
// // // // // // // // //         setMessageText('');
// // // // // // // // //         setSelectedFiles([]);
// // // // // // // // //         setUploading(false);

// // // // // // // // //         await push(databaseRef(database, `messagesA/${otherUser.id}/${user.id}`), { ...newMessage, id: newMsgRef.key });
// // // // // // // // //         update(databaseRef(database, `lastSeenA/${user.id}`), { timestamp: Date.now() });
// // // // // // // // //     };

// // // // // // // // //     const renderMedia = (files) => {
// // // // // // // // //         return files && files.length > 0 ? (
// // // // // // // // //             <div className="grid grid-cols-4 gap-2 mt-2">
// // // // // // // // //                 {files.map((file, index) => (
// // // // // // // // //                     <a key={index} href={file} target="_blank" rel="noopener noreferrer" className="w-20 h-20 border rounded-lg overflow-hidden bg-white">
// // // // // // // // //                         {file.endsWith('.jpg') || file.endsWith('.png') || file.endsWith('.gif') ? (
// // // // // // // // //                             <img src={file} alt="Media" className="object-cover h-full w-full" />
// // // // // // // // //                         ) : (
// // // // // // // // //                             <span className="text-sm text-gray-600">File</span>
// // // // // // // // //                         )}
// // // // // // // // //                     </a>
// // // // // // // // //                 ))}
// // // // // // // // //             </div>
// // // // // // // // //         ) : null;
// // // // // // // // //     };

// // // // // // // // //     return (
// // // // // // // // //         <div className={`flex flex-col h-screen ${chatSettings.isNightMode ? 'bg-gray-900' : 'bg-gray-100'}`}>
// // // // // // // // //             <header className="flex-none p-4 bg-white border-b border-gray-300 text-center">
// // // // // // // // //                 <h2 className="text-xl">{otherUser.name}</h2>
// // // // // // // // //                 <p className="text-sm">{lastSeen ? 'Last seen: ' + lastSeen : 'Offline'}</p>
// // // // // // // // //                 <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="text-gray-500 hover:text-gray-700">
// // // // // // // // //                     •••
// // // // // // // // //                 </button>
// // // // // // // // //                 {isMenuOpen && (
// // // // // // // // //                     <div className="absolute right-0 mt-2 w-48 bg-white border rounded shadow-lg z-10">
// // // // // // // // //                         <div className="p-2">
// // // // // // // // //                             <label className="block text-sm">Sender Bubble Color:</label>
// // // // // // // // //                             <input
// // // // // // // // //                                 type="color"
// // // // // // // // //                                 value={chatSettings.senderBubbleColor}
// // // // // // // // //                                 onChange={(e) => saveSettings({ senderBubbleColor: e.target.value })}
// // // // // // // // //                                 className="w-full h-8 p-0 border-none"
// // // // // // // // //                             />
// // // // // // // // //                         </div>
// // // // // // // // //                         <div className="p-2">
// // // // // // // // //                             <label className="block text-sm">Receiver Bubble Color:</label>
// // // // // // // // //                             <input
// // // // // // // // //                                 type="color"
// // // // // // // // //                                 value={chatSettings.receiverBubbleColor}
// // // // // // // // //                                 onChange={(e) => saveSettings({ receiverBubbleColor: e.target.value })}
// // // // // // // // //                                 className="w-full h-8 p-0 border-none"
// // // // // // // // //                             />
// // // // // // // // //                         </div>
// // // // // // // // //                         <div className="p-2">
// // // // // // // // //                             <label className="block text-sm">Sender Text Color:</label>
// // // // // // // // //                             <input
// // // // // // // // //                                 type="color"
// // // // // // // // //                                 value={chatSettings.senderTextColor}
// // // // // // // // //                                 onChange={(e) => saveSettings({ senderTextColor: e.target.value })}
// // // // // // // // //                                 className="w-full h-8 p-0 border-none"
// // // // // // // // //                             />
// // // // // // // // //                         </div>
// // // // // // // // //                         <div className="p-2">
// // // // // // // // //                             <label className="block text-sm">Receiver Text Color:</label>
// // // // // // // // //                             <input
// // // // // // // // //                                 type="color"
// // // // // // // // //                                 value={chatSettings.receiverTextColor}
// // // // // // // // //                                 onChange={(e) => saveSettings({ receiverTextColor: e.target.value })}
// // // // // // // // //                                 className="w-full h-8 p-0 border-none"
// // // // // // // // //                             />
// // // // // // // // //                         </div>
// // // // // // // // //                         <button onClick={() => saveSettings({ isNightMode: !chatSettings.isNightMode })} className="block px-4 py-2 text-sm hover:bg-gray-100 w-full text-left">
// // // // // // // // //                             Toggle Day/Night Mode
// // // // // // // // //                         </button>
// // // // // // // // //                     </div>
// // // // // // // // //                 )}
// // // // // // // // //             </header>
// // // // // // // // //             <main className="flex-1 overflow-y-auto p-4">
// // // // // // // // //                 {messages.map((msg) => (
// // // // // // // // //                     (msg.text || (msg.files && msg.files.length > 0)) && (
// // // // // // // // //                         <div key={msg.id || msg.timestamp} className={`mb-2 ${msg.sender === user.id ? 'text-right' : 'text-left'}`}>
// // // // // // // // //                             <div className={`inline-block p-2 rounded-lg`} style={{ backgroundColor: msg.sender === user.id ? chatSettings.senderBubbleColor : chatSettings.receiverBubbleColor }}>
// // // // // // // // //                                 {msg.text && <div style={{ color: msg.sender === user.id ? chatSettings.senderTextColor : chatSettings.receiverTextColor }}>{msg.text}</div>}
// // // // // // // // //                                 {msg.files && renderMedia(msg.files)}
// // // // // // // // //                             </div>
// // // // // // // // //                             <div className={`text-xs ${chatSettings.isNightMode ? 'text-gray-400' : 'text-gray-500'} mt-1`}>
// // // // // // // // //                                 {new Date(msg.timestamp).toLocaleString()}
// // // // // // // // //                             </div>
// // // // // // // // //                         </div>
// // // // // // // // //                     )
// // // // // // // // //                 ))}
// // // // // // // // //             </main>
// // // // // // // // //             <footer className="flex items-center p-4 border-t">
// // // // // // // // //                 <input
// // // // // // // // //                     type="text"
// // // // // // // // //                     value={messageText}
// // // // // // // // //                     onChange={(e) => setMessageText(e.target.value)}
// // // // // // // // //                     placeholder="Type a message"
// // // // // // // // //                     className="flex-1 border rounded-lg p-2"
// // // // // // // // //                 />
// // // // // // // // //                 <input type="file" multiple onChange={handleFileChange} className="ml-2" />
// // // // // // // // //                 <button onClick={sendMessage} className="ml-2 bg-blue-500 text-white rounded-lg p-2" disabled={uploading}>
// // // // // // // // //                     Send
// // // // // // // // //                 </button>
// // // // // // // // //             </footer>
// // // // // // // // //         </div>
// // // // // // // // //     );
// // // // // // // // // };

// // // // // // // // // export default Chat;



// // // // // // // // // // "use client"; // Enable client-side rendering
// // // // // // // // // // import React, { useState, useEffect } from 'react';
// // // // // // // // // // import { database, storage } from '../config/firebase';
// // // // // // // // // // import { ref as databaseRef, onValue, push, update } from 'firebase/database';
// // // // // // // // // // import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
// // // // // // // // // // import 'tailwindcss/tailwind.css';

// // // // // // // // // // const Chat = ({ user }) => {
// // // // // // // // // //     const otherUser = user.id === 'user1' ? { id: 'user2', name: 'User 2' } : { id: 'user1', name: 'User 1' };
// // // // // // // // // //     const [messages, setMessages] = useState([]);
// // // // // // // // // //     const [messageText, setMessageText] = useState('');
// // // // // // // // // //     const [selectedFiles, setSelectedFiles] = useState([]);
// // // // // // // // // //     const [uploading, setUploading] = useState(false);
// // // // // // // // // //     const [lastSeen, setLastSeen] = useState('Offline');
// // // // // // // // // //     const [isMenuOpen, setIsMenuOpen] = useState(false);
// // // // // // // // // //     const [chatSettings, setChatSettings] = useState({
// // // // // // // // // //         senderBubbleColor: '#3B82F6', // Default to blue
// // // // // // // // // //         receiverBubbleColor: '#E5E7EB', // Default to gray
// // // // // // // // // //         isNightMode: false,
// // // // // // // // // //     });

// // // // // // // // // //     useEffect(() => {
// // // // // // // // // //         const savedSettings = JSON.parse(localStorage.getItem(`chatSettings-${user.id}`));
// // // // // // // // // //         if (savedSettings) {
// // // // // // // // // //             setChatSettings(savedSettings);
// // // // // // // // // //         }
// // // // // // // // // //     }, [user.id]);

// // // // // // // // // //     const saveSettings = (newSettings) => {
// // // // // // // // // //         const settings = { ...chatSettings, ...newSettings };
// // // // // // // // // //         setChatSettings(settings);
// // // // // // // // // //         localStorage.setItem(`chatSettings-${user.id}`, JSON.stringify(settings));
// // // // // // // // // //     };

// // // // // // // // // //     useEffect(() => {
// // // // // // // // // //         const messagesRef = databaseRef(database, `messagesA/${user.id}/${otherUser.id}`);
// // // // // // // // // //         onValue(messagesRef, (snapshot) => {
// // // // // // // // // //             const data = snapshot.val();
// // // // // // // // // //             setMessages(data ? Object.values(data) : []);

// // // // // // // // // //             data && Object.values(data).forEach((msg) => {
// // // // // // // // // //                 if (!msg.read && msg.sender !== user.id) {
// // // // // // // // // //                     update(databaseRef(database, `messagesA/${user.id}/${otherUser.id}/${msg.id}`), { read: true });
// // // // // // // // // //                     update(databaseRef(database, `messagesA/${otherUser.id}/${user.id}/${msg.id}`), { read: true });
// // // // // // // // // //                 }
// // // // // // // // // //             });
// // // // // // // // // //         });

// // // // // // // // // //         const userStatusRef = databaseRef(database, `lastSeenA/${otherUser.id}`);
// // // // // // // // // //         onValue(userStatusRef, (snapshot) => {
// // // // // // // // // //             const timestamp = snapshot.val()?.timestamp || null;
// // // // // // // // // //             if (timestamp) {
// // // // // // // // // //                 const date = new Date(Number(timestamp));
// // // // // // // // // //                 setLastSeen(date.toLocaleString() || 'Offline');
// // // // // // // // // //             }
// // // // // // // // // //         });

// // // // // // // // // //         update(databaseRef(database, `lastSeenA/${user.id}`), { timestamp: Date.now() });

// // // // // // // // // //         return () => {
// // // // // // // // // //             update(databaseRef(database, `lastSeenA/${user.id}`), { timestamp: null });
// // // // // // // // // //         };
// // // // // // // // // //     }, [user.id, otherUser.id]);

// // // // // // // // // //     const handleFileChange = (event) => {
// // // // // // // // // //         const files = Array.from(event.target.files);
// // // // // // // // // //         setSelectedFiles((prevFiles) => [...prevFiles, ...files]);
// // // // // // // // // //     };

// // // // // // // // // //     const removeFile = (index) => {
// // // // // // // // // //         setSelectedFiles((prevFiles) => prevFiles.filter((_, i) => i !== index));
// // // // // // // // // //     };

// // // // // // // // // //     const sendMessage = async () => {
// // // // // // // // // //         if (messageText.trim() === "" && selectedFiles.length === 0) return;

// // // // // // // // // //         const messagesRef = databaseRef(database, `messagesA/${user.id}/${otherUser.id}`);
// // // // // // // // // //         const newMessage = {
// // // // // // // // // //             text: messageText,
// // // // // // // // // //             sender: user.id,
// // // // // // // // // //             timestamp: Date.now(),
// // // // // // // // // //             read: false,
// // // // // // // // // //             files: [],
// // // // // // // // // //         };

// // // // // // // // // //         setUploading(true);
// // // // // // // // // //         const uploadedFiles = await Promise.all(selectedFiles.map(async (file) => {
// // // // // // // // // //             const fileRef = storageRef(storage, `chatFilesA/${file.name}`);
// // // // // // // // // //             await uploadBytes(fileRef, file);
// // // // // // // // // //             return getDownloadURL(fileRef);
// // // // // // // // // //         }));

// // // // // // // // // //         newMessage.files = uploadedFiles;
// // // // // // // // // //         const newMsgRef = await push(messagesRef, newMessage);
// // // // // // // // // //         setMessageText('');
// // // // // // // // // //         setSelectedFiles([]);
// // // // // // // // // //         setUploading(false);

// // // // // // // // // //         await push(databaseRef(database, `messagesA/${otherUser.id}/${user.id}`), { ...newMessage, id: newMsgRef.key });
// // // // // // // // // //         update(databaseRef(database, `lastSeenA/${user.id}`), { timestamp: Date.now() });
// // // // // // // // // //     };

// // // // // // // // // //     const renderMedia = (files) => {
// // // // // // // // // //         return files && files.length > 0 ? (
// // // // // // // // // //             <div className="grid grid-cols-4 gap-2 mt-2">
// // // // // // // // // //                 {files.map((file, index) => (
// // // // // // // // // //                     <a key={index} href={file} target="_blank" rel="noopener noreferrer" className="w-20 h-20 border rounded-lg overflow-hidden bg-white">
// // // // // // // // // //                         {file.endsWith('.jpg') || file.endsWith('.png') || file.endsWith('.gif') ? (
// // // // // // // // // //                             <img src={file} alt="Media" className="object-cover h-full w-full" />
// // // // // // // // // //                         ) : (
// // // // // // // // // //                             <span className="text-sm text-gray-600">File</span>
// // // // // // // // // //                         )}
// // // // // // // // // //                     </a>
// // // // // // // // // //                 ))}
// // // // // // // // // //             </div>
// // // // // // // // // //         ) : null;
// // // // // // // // // //     };

// // // // // // // // // //     return (
// // // // // // // // // //         <div className={`flex flex-col h-screen ${chatSettings.isNightMode ? 'bg-gray-900' : 'bg-gray-100'}`}>
// // // // // // // // // //             <header className="flex-none p-4 bg-white border-b border-gray-300 text-center">
// // // // // // // // // //                 <h2 className="text-xl">{otherUser.name}</h2>
// // // // // // // // // //                 <p className="text-sm">{lastSeen ? 'Last seen: ' + lastSeen : 'Offline'}</p>
// // // // // // // // // //                 <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="text-gray-500 hover:text-gray-700">
// // // // // // // // // //                     •••
// // // // // // // // // //                 </button>
// // // // // // // // // //                 {isMenuOpen && (
// // // // // // // // // //                     <div className="absolute right-0 mt-2 w-48 bg-white border rounded shadow-lg z-10">
// // // // // // // // // //                         <div className="p-2">
// // // // // // // // // //                             <label className="block text-sm">Sender Bubble Color:</label>
// // // // // // // // // //                             <input
// // // // // // // // // //                                 type="color"
// // // // // // // // // //                                 value={chatSettings.senderBubbleColor}
// // // // // // // // // //                                 onChange={(e) => saveSettings({ senderBubbleColor: e.target.value })}
// // // // // // // // // //                                 className="w-full h-8 p-0 border-none"
// // // // // // // // // //                             />
// // // // // // // // // //                         </div>
// // // // // // // // // //                         <div className="p-2">
// // // // // // // // // //                             <label className="block text-sm">Receiver Bubble Color:</label>
// // // // // // // // // //                             <input
// // // // // // // // // //                                 type="color"
// // // // // // // // // //                                 value={chatSettings.receiverBubbleColor}
// // // // // // // // // //                                 onChange={(e) => saveSettings({ receiverBubbleColor: e.target.value })}
// // // // // // // // // //                                 className="w-full h-8 p-0 border-none"
// // // // // // // // // //                             />
// // // // // // // // // //                         </div>
// // // // // // // // // //                         <button onClick={() => saveSettings({ isNightMode: !chatSettings.isNightMode })} className="block px-4 py-2 text-sm hover:bg-gray-100 w-full text-left">
// // // // // // // // // //                             Toggle Day/Night Mode
// // // // // // // // // //                         </button>
// // // // // // // // // //                     </div>
// // // // // // // // // //                 )}
// // // // // // // // // //             </header>
// // // // // // // // // //             <main className="flex-1 overflow-y-auto p-4">
// // // // // // // // // //                 {messages.map((msg) => (
// // // // // // // // // //                     (msg.text || (msg.files && msg.files.length > 0)) && (
// // // // // // // // // //                         <div key={msg.id || msg.timestamp} className={`mb-2 ${msg.sender === user.id ? 'text-right' : 'text-left'}`}>
// // // // // // // // // //                             <div className={`inline-block p-2 rounded-lg`} style={{ backgroundColor: msg.sender === user.id ? chatSettings.senderBubbleColor : chatSettings.receiverBubbleColor }}>
// // // // // // // // // //                                 {msg.text && <div style={{ color: msg.sender === user.id ? '#fff' : '#000' }}>{msg.text}</div>}
// // // // // // // // // //                                 {msg.files && renderMedia(msg.files)}
// // // // // // // // // //                             </div>
// // // // // // // // // //                             <div className={`text-xs ${chatSettings.isNightMode ? 'text-gray-400' : 'text-gray-500'} mt-1`}>
// // // // // // // // // //                                 {new Date(msg.timestamp).toLocaleString()}
// // // // // // // // // //                             </div>
// // // // // // // // // //                         </div>
// // // // // // // // // //                     )
// // // // // // // // // //                 ))}
// // // // // // // // // //             </main>
// // // // // // // // // //             <footer className="flex items-center p-4 border-t">
// // // // // // // // // //                 <label htmlFor="fileInput" className="cursor-pointer">
// // // // // // // // // //                     <span className="material-icons">file</span>
// // // // // // // // // //                 </label>
// // // // // // // // // //                 <input id="fileInput" type="file" multiple accept="image/*,video/*" className="hidden" onChange={handleFileChange} />
// // // // // // // // // //                 <input type="text" placeholder="Type a message..." value={messageText} onChange={(e) => setMessageText(e.target.value)} className="border rounded-lg p-2 flex-1 mx-2" />
// // // // // // // // // //                 <button onClick={sendMessage} className="ml-2 p-2 bg-blue-500 text-white rounded-lg" disabled={uploading}>
// // // // // // // // // //                     {uploading ? "Sending..." : "Send"}
// // // // // // // // // //                 </button>
// // // // // // // // // //             </footer>
// // // // // // // // // //         </div>
// // // // // // // // // //     );
// // // // // // // // // // };

// // // // // // // // // // export default Chat;

// // // // // // // // // // "use client"; // Enable client-side rendering
// // // // // // // // // // import React, { useState, useEffect } from 'react';
// // // // // // // // // // import { database, storage } from '../config/firebase'; // Ensure Firebase Storage is configured
// // // // // // // // // // import { ref as databaseRef, onValue, push, update } from 'firebase/database';
// // // // // // // // // // import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
// // // // // // // // // // import 'tailwindcss/tailwind.css';

// // // // // // // // // // const Chat = ({ user }) => {
// // // // // // // // // //     const otherUser = user.id === 'user1' ? { id: 'user2', name: 'User 2' } : { id: 'user1', name: 'User 1' };
// // // // // // // // // //     const [messages, setMessages] = useState([]);
// // // // // // // // // //     const [messageText, setMessageText] = useState('');
// // // // // // // // // //     const [selectedFiles, setSelectedFiles] = useState([]);
// // // // // // // // // //     const [uploading, setUploading] = useState(false);
// // // // // // // // // //     const [lastSeen, setLastSeen] = useState('Offline');
// // // // // // // // // //     const [isMenuOpen, setIsMenuOpen] = useState(false);
// // // // // // // // // //     const [chatBubbleColor, setChatBubbleColor] = useState('bg-gray-300');
// // // // // // // // // //     const [chatTextColor, setChatTextColor] = useState('text-black');

// // // // // // // // // //     useEffect(() => {
// // // // // // // // // //         const savedSettings = JSON.parse(localStorage.getItem(`chatSettings-${user.id}`));
// // // // // // // // // //         if (savedSettings) {
// // // // // // // // // //             setChatBubbleColor(savedSettings.bubbleColor);
// // // // // // // // // //             setChatTextColor(savedSettings.textColor);
// // // // // // // // // //         }
// // // // // // // // // //     }, [user.id]);

// // // // // // // // // //     const saveSettings = (newSettings) => {
// // // // // // // // // //         const settings = {
// // // // // // // // // //             bubbleColor: newSettings.bubbleColor || chatBubbleColor,
// // // // // // // // // //             textColor: newSettings.textColor || chatTextColor,
// // // // // // // // // //         };
// // // // // // // // // //         setChatBubbleColor(settings.bubbleColor);
// // // // // // // // // //         setChatTextColor(settings.textColor);
// // // // // // // // // //         localStorage.setItem(`chatSettings-${user.id}`, JSON.stringify(settings));
// // // // // // // // // //     };

// // // // // // // // // //     useEffect(() => {
// // // // // // // // // //         const messagesRef = databaseRef(database, `messagesA/${user.id}/${otherUser.id}`);
// // // // // // // // // //         onValue(messagesRef, (snapshot) => {
// // // // // // // // // //             const data = snapshot.val();
// // // // // // // // // //             const loadedMessages = data ? Object.values(data) : [];
// // // // // // // // // //             setMessages(loadedMessages);

// // // // // // // // // //             loadedMessages.forEach((msg) => {
// // // // // // // // // //                 if (!msg.read && msg.sender !== user.id) {
// // // // // // // // // //                     update(databaseRef(database, `messagesA/${user.id}/${otherUser.id}/${msg.id}`), { read: true });
// // // // // // // // // //                     update(databaseRef(database, `messagesA/${otherUser.id}/${user.id}/${msg.id}`), { read: true });
// // // // // // // // // //                 }
// // // // // // // // // //             });
// // // // // // // // // //         });

// // // // // // // // // //         const userStatusRef = databaseRef(database, `lastSeenA/${otherUser.id}`);
// // // // // // // // // //         onValue(userStatusRef, (snapshot) => {
// // // // // // // // // //             const timestamp = snapshot.val()?.timestamp || null;
// // // // // // // // // //             if (timestamp) {
// // // // // // // // // //                 const date = new Date(Number(timestamp));
// // // // // // // // // //                 setLastSeen(date.toLocaleString() || 'Offline');
// // // // // // // // // //             }
// // // // // // // // // //         });

// // // // // // // // // //         update(databaseRef(database, `lastSeenA/${user.id}`), { timestamp: Date.now() });

// // // // // // // // // //         return () => {
// // // // // // // // // //             update(databaseRef(database, `lastSeenA/${user.id}`), { timestamp: null });
// // // // // // // // // //         };
// // // // // // // // // //     }, [user.id, otherUser.id]);

// // // // // // // // // //     const handleFileChange = (event) => {
// // // // // // // // // //         const files = Array.from(event.target.files);
// // // // // // // // // //         setSelectedFiles((prevFiles) => [...prevFiles, ...files]);
// // // // // // // // // //     };

// // // // // // // // // //     const removeFile = (index) => {
// // // // // // // // // //         setSelectedFiles((prevFiles) => prevFiles.filter((_, i) => i !== index));
// // // // // // // // // //     };

// // // // // // // // // //     const sendMessage = async () => {
// // // // // // // // // //         if (messageText.trim() === "" && selectedFiles.length === 0) return;

// // // // // // // // // //         const messagesRef = databaseRef(database, `messagesA/${user.id}/${otherUser.id}`);
// // // // // // // // // //         const newMessage = {
// // // // // // // // // //             text: messageText,
// // // // // // // // // //             sender: user.id,
// // // // // // // // // //             timestamp: Date.now(),
// // // // // // // // // //             read: false,
// // // // // // // // // //             files: [],
// // // // // // // // // //         };

// // // // // // // // // //         setUploading(true);
// // // // // // // // // //         const uploadedFiles = await Promise.all(selectedFiles.map(async (file) => {
// // // // // // // // // //             const fileRef = storageRef(storage, `chatFilesA/${file.name}`);
// // // // // // // // // //             await uploadBytes(fileRef, file);
// // // // // // // // // //             return getDownloadURL(fileRef);
// // // // // // // // // //         }));

// // // // // // // // // //         newMessage.files = uploadedFiles;
// // // // // // // // // //         const newMsgRef = await push(messagesRef, newMessage);
// // // // // // // // // //         setMessageText('');
// // // // // // // // // //         setSelectedFiles([]);
// // // // // // // // // //         setUploading(false);

// // // // // // // // // //         await push(databaseRef(database, `messagesA/${otherUser.id}/${user.id}`), { ...newMessage, id: newMsgRef.key });
// // // // // // // // // //         update(databaseRef(database, `lastSeenA/${user.id}`), { timestamp: Date.now() });
// // // // // // // // // //     };

// // // // // // // // // //     const renderMedia = (files) => {
// // // // // // // // // //         return files && files.length > 0 ? (
// // // // // // // // // //             <div className="grid grid-cols-4 gap-2 mt-2">
// // // // // // // // // //                 {files.map((file, index) => (
// // // // // // // // // //                     <a key={index} href={file} target="_blank" rel="noopener noreferrer" className="w-20 h-20 border rounded-lg overflow-hidden bg-white">
// // // // // // // // // //                         {file.endsWith('.jpg') || file.endsWith('.png') || file.endsWith('.gif') ? (
// // // // // // // // // //                             <img src={file} alt="Media" className="object-cover h-full w-full" />
// // // // // // // // // //                         ) : (
// // // // // // // // // //                             <span className="text-sm text-gray-600">File</span>
// // // // // // // // // //                         )}
// // // // // // // // // //                     </a>
// // // // // // // // // //                 ))}
// // // // // // // // // //             </div>
// // // // // // // // // //         ) : null;
// // // // // // // // // //     };

// // // // // // // // // //     return (
// // // // // // // // // //         <div className="flex flex-col h-screen bg-gray-100">
// // // // // // // // // //             <header className="flex-none p-4 bg-white border-b border-gray-300 text-center">
// // // // // // // // // //                 <h2 className="text-xl">{otherUser.name}</h2>
// // // // // // // // // //                 <p className="text-sm">{lastSeen ? 'Last seen: ' + lastSeen : 'Offline'}</p>
// // // // // // // // // //                 <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="text-gray-500 hover:text-gray-700">
// // // // // // // // // //                     •••
// // // // // // // // // //                 </button>
// // // // // // // // // //                 {isMenuOpen && (
// // // // // // // // // //                     <div className="absolute right-0 mt-2 w-48 bg-white border rounded shadow-lg z-10">
// // // // // // // // // //                         <button onClick={() => saveSettings({ bubbleColor: 'bg-blue-100', textColor: 'text-blue-900' })} className="block px-4 py-2 text-sm hover:bg-gray-100 w-full text-left">
// // // // // // // // // //                             Change Bubble Color (Blue)
// // // // // // // // // //                         </button>
// // // // // // // // // //                         <button onClick={() => saveSettings({ bubbleColor: 'bg-green-100', textColor: 'text-green-900' })} className="block px-4 py-2 text-sm hover:bg-gray-100 w-full text-left">
// // // // // // // // // //                             Change Bubble Color (Green)
// // // // // // // // // //                         </button>
// // // // // // // // // //                     </div>
// // // // // // // // // //                 )}
// // // // // // // // // //             </header>
// // // // // // // // // //             <main className="flex-1 overflow-y-auto p-4">
// // // // // // // // // //                 {messages.map((msg) => (
// // // // // // // // // //                     (msg.text || (msg.files && msg.files.length > 0)) && (
// // // // // // // // // //                         <div key={msg.id || msg.timestamp} className={`mb-2 ${msg.sender === user.id ? 'text-right' : 'text-left'}`}>
// // // // // // // // // //                             <div className={`inline-block p-2 rounded-lg ${msg.sender === user.id ? 'bg-blue-500 text-white' : chatBubbleColor} ${msg.sender === user.id ? '' : chatTextColor}`}>
// // // // // // // // // //                                 {msg.text && <div>{msg.text}</div>}
// // // // // // // // // //                                 {msg.files && renderMedia(msg.files)}
// // // // // // // // // //                             </div>
// // // // // // // // // //                             <div className="text-xs text-gray-500 mt-1">{new Date(msg.timestamp).toLocaleString()}</div>
// // // // // // // // // //                         </div>
// // // // // // // // // //                     )
// // // // // // // // // //                 ))}
// // // // // // // // // //             </main>
// // // // // // // // // //             <footer className="flex items-center p-4 border-t">
// // // // // // // // // //                 <label htmlFor="fileInput" className="cursor-pointer">
// // // // // // // // // //                     <span className="material-icons">file</span>
// // // // // // // // // //                 </label>
// // // // // // // // // //                 <input id="fileInput" type="file" multiple accept="image/*,video/*" className="hidden" onChange={handleFileChange} />
// // // // // // // // // //                 <input type="text" placeholder="Type a message..." value={messageText} onChange={(e) => setMessageText(e.target.value)} className="border rounded-lg p-2 flex-1 mx-2" />
// // // // // // // // // //                 <button onClick={sendMessage} className="ml-2 p-2 bg-blue-500 text-white rounded-lg" disabled={uploading}>
// // // // // // // // // //                     {uploading ? "Sending..." : "Send"}
// // // // // // // // // //                 </button>
// // // // // // // // // //             </footer>
// // // // // // // // // //         </div>
// // // // // // // // // //     );
// // // // // // // // // // };

// // // // // // // // // // export default Chat;

// // // // // // // // // // "use client";
// // // // // // // // // // import React, { useState, useEffect } from 'react';
// // // // // // // // // // import { database } from '../config/firebase'; 
// // // // // // // // // // import { ref as databaseRef, onValue, push } from 'firebase/database';

// // // // // // // // // // const Chat = ({ user }) => {
// // // // // // // // // //     const otherUser = user.id === 'user1' ? { id: 'user2', name: 'User 2' } : { id: 'user1', name: 'User 1' };
// // // // // // // // // //     const [messages, setMessages] = useState([]);
// // // // // // // // // //     const [messageText, setMessageText] = useState('');
// // // // // // // // // //     const [chatBubbleColor, setChatBubbleColor] = useState('#e0e0e0'); // Default bubble color
// // // // // // // // // //     const [chatTextColor, setChatTextColor] = useState('#000000'); // Default text color

// // // // // // // // // //     // Load color settings from localStorage on mount
// // // // // // // // // //     useEffect(() => {
// // // // // // // // // //         const savedBubbleColor = localStorage.getItem('chatBubbleColor');
// // // // // // // // // //         const savedTextColor = localStorage.getItem('chatTextColor');
// // // // // // // // // //         if (savedBubbleColor) setChatBubbleColor(savedBubbleColor);
// // // // // // // // // //         if (savedTextColor) setChatTextColor(savedTextColor);
// // // // // // // // // //     }, []);

// // // // // // // // // //     // Listen for new messages
// // // // // // // // // //     useEffect(() => {
// // // // // // // // // //         const messagesRef = databaseRef(database, `messages/${user.id}/${otherUser.id}`);
// // // // // // // // // //         onValue(messagesRef, (snapshot) => {
// // // // // // // // // //             const messagesData = snapshot.val() || {};
// // // // // // // // // //             setMessages(Object.values(messagesData));
// // // // // // // // // //         });
// // // // // // // // // //     }, [user.id, otherUser.id]);

// // // // // // // // // //     // Send message function
// // // // // // // // // //     const sendMessage = async () => {
// // // // // // // // // //         if (messageText.trim() === '') return;

// // // // // // // // // //         const newMessage = {
// // // // // // // // // //             text: messageText,
// // // // // // // // // //             sender: user.id,
// // // // // // // // // //             timestamp: Date.now(),
// // // // // // // // // //         };

// // // // // // // // // //         const messagesRef = databaseRef(database, `messages/${user.id}/${otherUser.id}`);
// // // // // // // // // //         await push(messagesRef, newMessage);
// // // // // // // // // //         setMessageText(''); 
// // // // // // // // // //     };

// // // // // // // // // //     // Save color settings to localStorage
// // // // // // // // // //     const updateColorSettings = (colorType, colorValue) => {
// // // // // // // // // //         if (colorType === 'bubble') {
// // // // // // // // // //             setChatBubbleColor(colorValue);
// // // // // // // // // //             localStorage.setItem('chatBubbleColor', colorValue);
// // // // // // // // // //         } else if (colorType === 'text') {
// // // // // // // // // //             setChatTextColor(colorValue);
// // // // // // // // // //             localStorage.setItem('chatTextColor', colorValue);
// // // // // // // // // //         }
// // // // // // // // // //     };

// // // // // // // // // //     return (
// // // // // // // // // //         <div className="chat-container">
// // // // // // // // // //             <header className="chat-header">
// // // // // // // // // //                 <h2>{otherUser.name}</h2>
// // // // // // // // // //                 <div className="color-settings">
// // // // // // // // // //                     <label>
// // // // // // // // // //                         Bubble Color:
// // // // // // // // // //                         <input
// // // // // // // // // //                             type="color"
// // // // // // // // // //                             value={chatBubbleColor}
// // // // // // // // // //                             onChange={(e) => updateColorSettings('bubble', e.target.value)}
// // // // // // // // // //                         />
// // // // // // // // // //                     </label>
// // // // // // // // // //                     <label>
// // // // // // // // // //                         Text Color:
// // // // // // // // // //                         <input
// // // // // // // // // //                             type="color"
// // // // // // // // // //                             value={chatTextColor}
// // // // // // // // // //                             onChange={(e) => updateColorSettings('text', e.target.value)}
// // // // // // // // // //                         />
// // // // // // // // // //                     </label>
// // // // // // // // // //                 </div>
// // // // // // // // // //             </header>

// // // // // // // // // //             <div className="chat-messages">
// // // // // // // // // //                 {messages.map((msg, index) => (
// // // // // // // // // //                     <div
// // // // // // // // // //                         key={index}
// // // // // // // // // //                         className={`message ${msg.sender === user.id ? 'sent' : 'received'}`}
// // // // // // // // // //                         style={{
// // // // // // // // // //                             backgroundColor: msg.sender === user.id ? chatBubbleColor : '#ffffff',
// // // // // // // // // //                             color: msg.sender === user.id ? chatTextColor : '#000000',
// // // // // // // // // //                         }}
// // // // // // // // // //                     >
// // // // // // // // // //                         {msg.text}
// // // // // // // // // //                     </div>
// // // // // // // // // //                 ))}
// // // // // // // // // //             </div>

// // // // // // // // // //             <div className="chat-input">
// // // // // // // // // //                 <input
// // // // // // // // // //                     type="text"
// // // // // // // // // //                     value={messageText}
// // // // // // // // // //                     onChange={(e) => setMessageText(e.target.value)}
// // // // // // // // // //                     placeholder="Type your message..."
// // // // // // // // // //                 />
// // // // // // // // // //                 <button onClick={sendMessage}>Send</button>
// // // // // // // // // //             </div>
// // // // // // // // // //         </div>
// // // // // // // // // //     );
// // // // // // // // // // };

// // // // // // // // // // export default Chat;


// // // // // // // // // // // "use client"; // Enable client-side rendering
// // // // // // // // // // // import React, { useState, useEffect } from 'react';
// // // // // // // // // // // import { database, storage } from '../config/firebase'; // Ensure Firebase Storage is configured
// // // // // // // // // // // import { ref as databaseRef, onValue, push, update } from 'firebase/database';
// // // // // // // // // // // import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
// // // // // // // // // // // import 'tailwindcss/tailwind.css';

// // // // // // // // // // // const Chat = ({ user }) => {
// // // // // // // // // // //     // Identifying the other user
// // // // // // // // // // //     const otherUser = user.id === 'user1' ? { id: 'user2', name: 'User 2' } : { id: 'user1', name: 'User 1' };

// // // // // // // // // // //     // State declarations
// // // // // // // // // // //     const [messages, setMessages] = useState([]);
// // // // // // // // // // //     const [messageText, setMessageText] = useState('');
// // // // // // // // // // //     const [selectedFiles, setSelectedFiles] = useState([]);
// // // // // // // // // // //     const [uploading, setUploading] = useState(false);
// // // // // // // // // // //     const [otherUserStatus, setOtherUserStatus] = useState('');
// // // // // // // // // // //     const [lastSeen, setLastSeen] = useState('');
// // // // // // // // // // //     const [popupFile, setPopupFile] = useState(null);
    
// // // // // // // // // // //     const [isMenuOpen, setIsMenuOpen] = useState(false);
// // // // // // // // // // //     const [chatBubbleColor, setChatBubbleColor] = useState('bg-gray-300');
// // // // // // // // // // //     const [chatTextColor, setChatTextColor] = useState('text-black');

// // // // // // // // // // //     const userId = user.id;

// // // // // // // // // // //     // Load settings from localStorage
// // // // // // // // // // //     useEffect(() => {
// // // // // // // // // // //         const savedSettings = JSON.parse(localStorage.getItem(`chatSettings-${userId}`));
// // // // // // // // // // //         if (savedSettings) {
// // // // // // // // // // //             setChatBubbleColor(savedSettings.bubbleColor);
// // // // // // // // // // //             setChatTextColor(savedSettings.textColor);
// // // // // // // // // // //         }
// // // // // // // // // // //     }, [userId]);

// // // // // // // // // // //     // Save settings to localStorage
// // // // // // // // // // //     const saveSettings = (newSettings) => {
// // // // // // // // // // //         const settings = {
// // // // // // // // // // //             bubbleColor: newSettings.bubbleColor || chatBubbleColor,
// // // // // // // // // // //             textColor: newSettings.textColor || chatTextColor,
// // // // // // // // // // //         };
// // // // // // // // // // //         setChatBubbleColor(settings.bubbleColor);
// // // // // // // // // // //         setChatTextColor(settings.textColor);
// // // // // // // // // // //         localStorage.setItem(`chatSettings-${userId}`, JSON.stringify(settings));
// // // // // // // // // // //     };
    
// // // // // // // // // // //     useEffect(() => {
// // // // // // // // // // //         const messagesRef = databaseRef(database, `messagesA/${user.id}/${otherUser.id}`);
// // // // // // // // // // //         onValue(messagesRef, (snapshot) => {
// // // // // // // // // // //             const data = snapshot.val();
// // // // // // // // // // //             const loadedMessages = data ? Object.values(data) : [];
// // // // // // // // // // //             setMessages(loadedMessages);
    
// // // // // // // // // // //             // Mark messages as read when the chat is opened
// // // // // // // // // // //             loadedMessages.forEach((msg) => {
// // // // // // // // // // //                 if (!msg.read && msg.sender !== user.id) {
// // // // // // // // // // //                     update(databaseRef(database, `messagesA/${user.id}/${otherUser.id}/${msg.id}`), { read: true });
// // // // // // // // // // //                     update(databaseRef(database, `messagesA/${otherUser.id}/${user.id}/${msg.id}`), { read: true });
// // // // // // // // // // //                 }
// // // // // // // // // // //             });
// // // // // // // // // // //         });
        
// // // // // // // // // // //         // Last seen status
// // // // // // // // // // //         const userStatusRef = databaseRef(database, `lastSeenA/${otherUser.id}`);
// // // // // // // // // // //         onValue(userStatusRef, (snapshot) => {
// // // // // // // // // // //             const status = snapshot.val();
// // // // // // // // // // //             const timestamp = status && status.timestamp ? Number(status.timestamp) : null;

// // // // // // // // // // //             if (timestamp && timestamp.toString().length === 13) {
// // // // // // // // // // //                 const date = new Date(timestamp);
// // // // // // // // // // //                 setLastSeen(
// // // // // // // // // // //                     !isNaN(date.getTime())
// // // // // // // // // // //                         ? `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`
// // // // // // // // // // //                         : 'Offline'
// // // // // // // // // // //                 );
// // // // // // // // // // //             } else {
// // // // // // // // // // //                 console.error("Invalid or missing timestamp:", timestamp);
// // // // // // // // // // //                 setLastSeen('Offline');
// // // // // // // // // // //             }
// // // // // // // // // // //         });
    
// // // // // // // // // // //         // Update last seen when user is active
// // // // // // // // // // //         const lastSeenRef = databaseRef(database, `lastSeenA/${user.id}`);
// // // // // // // // // // //         update(lastSeenRef, { timestamp: Date.now() });
    
// // // // // // // // // // //         return () => {
// // // // // // // // // // //             // Cleanup: Remove last seen status when component unmounts
// // // // // // // // // // //             update(lastSeenRef, { timestamp: null });
// // // // // // // // // // //         };
// // // // // // // // // // //     }, [user.id, otherUser.id]);

// // // // // // // // // // //     const [dropdownOpen, setDropdownOpen] = useState(null);

// // // // // // // // // // //     const toggleDropdown = (index) => {
// // // // // // // // // // //         setDropdownOpen(dropdownOpen === index ? null : index);
// // // // // // // // // // //     };
    
// // // // // // // // // // //     const isDropdownOpen = (index) => dropdownOpen === index;

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

// // // // // // // // // // //         const messagesRef = databaseRef(database, `messagesA/${user.id}/${otherUser.id}`);
// // // // // // // // // // //         const newMessage = {
// // // // // // // // // // //             text: messageText,
// // // // // // // // // // //             sender: user.id,
// // // // // // // // // // //             timestamp: Date.now(),
// // // // // // // // // // //             read: false,
// // // // // // // // // // //             files: [],
// // // // // // // // // // //         };

// // // // // // // // // // //         setUploading(true);

// // // // // // // // // // //         // Upload selected files to Firebase Storage
// // // // // // // // // // //         const uploadedFiles = await Promise.all(selectedFiles.map(async (file) => {
// // // // // // // // // // //             const fileRef = storageRef(storage, `chatFilesA/${file.name}`);
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
// // // // // // // // // // //         const recipientRef = databaseRef(database, `messagesA/${otherUser.id}/${user.id}`);
// // // // // // // // // // //         await push(recipientRef, { ...newMessage, id: newMsgRef.key });

// // // // // // // // // // //         setUploading(false);

// // // // // // // // // // //         // Update last seen when a message is sent
// // // // // // // // // // //         const lastSeenRef = databaseRef(database, `lastSeenA/${user.id}`);
// // // // // // // // // // //         update(lastSeenRef, { timestamp: Date.now() });
// // // // // // // // // // //     };

// // // // // // // // // // //     const renderMedia = (files) => {
// // // // // // // // // // //         if (!files || files.length === 0) return null;

// // // // // // // // // // //         return (
// // // // // // // // // // //             <div className="grid grid-cols-4 gap-2 mt-2">
// // // // // // // // // // //                 {files.map((file, index) => (
// // // // // // // // // // //                     <a
// // // // // // // // // // //                         key={index}
// // // // // // // // // // //                         href={file}
// // // // // // // // // // //                         target="_blank"
// // // // // // // // // // //                         rel="noopener noreferrer"
// // // // // // // // // // //                         className="relative w-20 h-20 border border-gray-300 rounded-lg overflow-hidden cursor-pointer flex items-center justify-center bg-white"
// // // // // // // // // // //                     >
// // // // // // // // // // //                         {file.endsWith('.jpg') || file.endsWith('.png') || file.endsWith('.jpeg') ? (
// // // // // // // // // // //                             <img src={file} alt={`media-${index}`} className="object-cover w-full h-full" />
// // // // // // // // // // //                         ) : (
// // // // // // // // // // //                             <span>{file.split('/').pop()}</span>
// // // // // // // // // // //                         )}
// // // // // // // // // // //                         <button onClick={() => removeFile(index)} className="absolute top-0 right-0 p-1 bg-red-500 text-white rounded-full">
// // // // // // // // // // //                             &times;
// // // // // // // // // // //                         </button>
// // // // // // // // // // //                     </a>
// // // // // // // // // // //                 ))}
// // // // // // // // // // //             </div>
// // // // // // // // // // //         );
// // // // // // // // // // //     };

// // // // // // // // // // //     const toggleColorMenu = () => setIsMenuOpen((prev) => !prev);

// // // // // // // // // // //     return (
// // // // // // // // // // //         <div className="flex flex-col h-full p-4">
// // // // // // // // // // //             <header className="flex items-center justify-between">
// // // // // // // // // // //                 <h2 className="text-xl font-bold">{otherUser.name}</h2>
// // // // // // // // // // //                 <span>{otherUserStatus || lastSeen}</span>
// // // // // // // // // // //                 <button onClick={toggleColorMenu} className="p-2 border border-gray-300 rounded">
// // // // // // // // // // //                     Color Settings
// // // // // // // // // // //                 </button>
// // // // // // // // // // //             </header>

// // // // // // // // // // //             <div className={`flex-grow overflow-y-auto p-2 border border-gray-200 rounded mt-4`}>
// // // // // // // // // // //                 {messages.map((msg, index) => (
// // // // // // // // // // //                     <div
// // // // // // // // // // //                         key={index}
// // // // // // // // // // //                         className={`my-2 p-2 rounded-lg ${msg.sender === user.id ? chatBubbleColor : 'bg-blue-200'}`}
// // // // // // // // // // //                     >
// // // // // // // // // // //                         <p className={`mb-1 ${msg.sender === user.id ? chatTextColor : 'text-black'}`}>{msg.text}</p>
// // // // // // // // // // //                         {renderMedia(msg.files)}
// // // // // // // // // // //                     </div>
// // // // // // // // // // //                 ))}
// // // // // // // // // // //             </div>

// // // // // // // // // // //             <div className="flex items-center mt-4">
// // // // // // // // // // //                 <input
// // // // // // // // // // //                     type="file"
// // // // // // // // // // //                     multiple
// // // // // // // // // // //                     onChange={handleFileChange}
// // // // // // // // // // //                     className="p-2 border border-gray-300 rounded"
// // // // // // // // // // //                 />
// // // // // // // // // // //                 <input
// // // // // // // // // // //                     type="text"
// // // // // // // // // // //                     value={messageText}
// // // // // // // // // // //                     onChange={(e) => setMessageText(e.target.value)}
// // // // // // // // // // //                     placeholder="Type your message..."
// // // // // // // // // // //                     className="flex-grow p-2 border border-gray-300 rounded mx-2"
// // // // // // // // // // //                 />
// // // // // // // // // // //                 <button
// // // // // // // // // // //                     onClick={sendMessage}
// // // // // // // // // // //                     className="p-2 bg-blue-500 text-white rounded hover:bg-blue-600"
// // // // // // // // // // //                     disabled={uploading}
// // // // // // // // // // //                 >
// // // // // // // // // // //                     {uploading ? 'Sending...' : 'Send'}
// // // // // // // // // // //                 </button>
// // // // // // // // // // //             </div>

// // // // // // // // // // //             {/* Color Settings Dropdown */}
// // // // // // // // // // //             {isMenuOpen && (
// // // // // // // // // // //                 <div className="absolute mt-2 bg-white shadow-lg rounded">
// // // // // // // // // // //                     <div className="flex flex-col">
// // // // // // // // // // //                         <h4 className="p-2">Chat Bubble Color</h4>
// // // // // // // // // // //                         <input
// // // // // // // // // // //                             type="color"
// // // // // // // // // // //                             value={chatBubbleColor}
// // // // // // // // // // //                             onChange={(e) => saveSettings({ bubbleColor: e.target.value })}
// // // // // // // // // // //                             className="p-2"
// // // // // // // // // // //                         />
// // // // // // // // // // //                         <h4 className="p-2">Text Color</h4>
// // // // // // // // // // //                         <input
// // // // // // // // // // //                             type="color"
// // // // // // // // // // //                             value={chatTextColor}
// // // // // // // // // // //                             onChange={(e) => saveSettings({ textColor: e.target.value })}
// // // // // // // // // // //                             className="p-2"
// // // // // // // // // // //                         />
// // // // // // // // // // //                     </div>
// // // // // // // // // // //                 </div>
// // // // // // // // // // //             )}
// // // // // // // // // // //         </div>
// // // // // // // // // // //     );
// // // // // // // // // // // };

// // // // // // // // // // // export default Chat;


// // // // // // // // // // // // "use client"; // Enable client-side rendering
// // // // // // // // // // // // import React, { useState, useEffect } from 'react';
// // // // // // // // // // // // import { database, storage } from '../config/firebase'; // Pastikan Firebase Storage sudah dikonfigurasi
// // // // // // // // // // // // import { ref as databaseRef, onValue, push, update } from 'firebase/database';
// // // // // // // // // // // // import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
// // // // // // // // // // // // import 'tailwindcss/tailwind.css';

// // // // // // // // // // // // const Chat = ({ user }) => {
// // // // // // // // // // // //     const otherUser = user.id === 'user1' ? { id: 'user2', name: 'User 2' } : { id: 'user1', name: 'User 1' };

// // // // // // // // // // // //     const [messages, setMessages] = useState([]);
// // // // // // // // // // // //     const [messageText, setMessageText] = useState('');
// // // // // // // // // // // //     const [selectedFiles, setSelectedFiles] = useState([]);
// // // // // // // // // // // //     const [uploading, setUploading] = useState(false);
// // // // // // // // // // // //     const [otherUserStatus, setOtherUserStatus] = useState(''); // Online status or last seen
// // // // // // // // // // // //     const [lastSeen, setLastSeen] = useState(''); // Last seen timestamp
// // // // // // // // // // // //     const [popupFile, setPopupFile] = useState(null);
    
// // // // // // // // // // // //     const [isMenuOpen, setIsMenuOpen] = useState(false);
// // // // // // // // // // // //     const [chatBubbleColor, setChatBubbleColor] = useState('bg-gray-300');
// // // // // // // // // // // //     const [chatTextColor, setChatTextColor] = useState('text-black');

// // // // // // // // // // // //     const userId = user.id; // Ambil ID user saat ini

// // // // // // // // // // // //     // Load settings from localStorage (or fetch from server if available)
// // // // // // // // // // // //     useEffect(() => {
// // // // // // // // // // // //         const savedSettings = JSON.parse(localStorage.getItem(`chatSettings-${userId}`));
// // // // // // // // // // // //         if (savedSettings) {
// // // // // // // // // // // //             setChatBubbleColor(savedSettings.bubbleColor);
// // // // // // // // // // // //             setChatTextColor(savedSettings.textColor);
// // // // // // // // // // // //         }
// // // // // // // // // // // //     }, [userId]);

// // // // // // // // // // // //     // Save settings to localStorage when updated
// // // // // // // // // // // //     const saveSettings = (newSettings) => {
// // // // // // // // // // // //         const settings = {
// // // // // // // // // // // //             bubbleColor: newSettings.bubbleColor || chatBubbleColor,
// // // // // // // // // // // //             textColor: newSettings.textColor || chatTextColor,
// // // // // // // // // // // //         };
// // // // // // // // // // // //         setChatBubbleColor(settings.bubbleColor);
// // // // // // // // // // // //         setChatTextColor(settings.textColor);
// // // // // // // // // // // //         localStorage.setItem(`chatSettings-${userId}`, JSON.stringify(settings));
// // // // // // // // // // // //     };
    
// // // // // // // // // // // //     useEffect(() => {
// // // // // // // // // // // //         const messagesRef = databaseRef(database, `messagesA/${user.id}/${otherUser.id}`);
// // // // // // // // // // // //         onValue(messagesRef, (snapshot) => {
// // // // // // // // // // // //             const data = snapshot.val();
// // // // // // // // // // // //             const loadedMessages = data ? Object.values(data) : [];
// // // // // // // // // // // //             setMessages(loadedMessages);
    
// // // // // // // // // // // //             // Mark all messages as read when the user views the chat
// // // // // // // // // // // //             loadedMessages.forEach((msg) => {
// // // // // // // // // // // //                 if (!msg.read && msg.sender !== user.id) {
// // // // // // // // // // // //                     update(databaseRef(database, `messagesA/${user.id}/${otherUser.id}/${msg.id}`), { read: true });
// // // // // // // // // // // //                     update(databaseRef(database, `messagesA/${otherUser.id}/${user.id}/${msg.id}`), { read: true });
// // // // // // // // // // // //                 }
// // // // // // // // // // // //             });
// // // // // // // // // // // //         });
// // // // // // // // // // // //         const userStatusRef = databaseRef(database, `lastSeenA/${otherUser.id}`);
        
// // // // // // // // // // // //         onValue(userStatusRef, (snapshot) => {
// // // // // // // // // // // //             const status = snapshot.val();
// // // // // // // // // // // //             const timestamp = status && status.timestamp ? Number(status.timestamp) : null;
    
// // // // // // // // // // // //             if (timestamp && timestamp.toString().length === 13) {  // Check if in milliseconds
// // // // // // // // // // // //                 const date = new Date(timestamp);
// // // // // // // // // // // //                 setLastSeen(
// // // // // // // // // // // //                     !isNaN(date.getTime())
// // // // // // // // // // // //                         ? `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`
// // // // // // // // // // // //                         : 'Offline'
// // // // // // // // // // // //                 );
// // // // // // // // // // // //             } else {
// // // // // // // // // // // //                 console.error("Timestamp is invalid or missing:", timestamp);
// // // // // // // // // // // //                 setLastSeen('Offline');
// // // // // // // // // // // //             }
// // // // // // // // // // // //         });
    
// // // // // // // // // // // //         // Update last seen when user is active
// // // // // // // // // // // //         const lastSeenRef = databaseRef(database, `lastSeenA/${user.id}`);
// // // // // // // // // // // //         update(lastSeenRef, { timestamp: Date.now() });
    
// // // // // // // // // // // //         return () => {
// // // // // // // // // // // //             // Cleanup: Remove last seen status when component unmounts
// // // // // // // // // // // //             update(lastSeenRef, { timestamp: null });
// // // // // // // // // // // //         };
// // // // // // // // // // // //     }, [user.id, otherUser.id]);

// // // // // // // // // // // //     const [dropdownOpen, setDropdownOpen] = useState(null);

// // // // // // // // // // // //     const toggleDropdown = (index) => {
// // // // // // // // // // // //         setDropdownOpen(dropdownOpen === index ? null : index);
// // // // // // // // // // // //     };
    
// // // // // // // // // // // //     const isDropdownOpen = (index) => dropdownOpen === index;

// // // // // // // // // // // //     // Handle file selection
// // // // // // // // // // // //     const handleFileChange = (event) => {
// // // // // // // // // // // //         const files = Array.from(event.target.files);
// // // // // // // // // // // //         setSelectedFiles((prevFiles) => [...prevFiles, ...files]);
// // // // // // // // // // // //     };

// // // // // // // // // // // //     // Remove a selected file
// // // // // // // // // // // //     const removeFile = (index) => {
// // // // // // // // // // // //         setSelectedFiles((prevFiles) => prevFiles.filter((_, i) => i !== index));
// // // // // // // // // // // //     };

// // // // // // // // // // // //     // Function to send a new message with media support
// // // // // // // // // // // //     const sendMessage = async () => {
// // // // // // // // // // // //         if (messageText.trim() === "" && selectedFiles.length === 0) return; // Prevent sending empty messages

// // // // // // // // // // // //         const messagesRef = databaseRef(database, `messagesA/${user.id}/${otherUser.id}`);
// // // // // // // // // // // //         const newMessage = {
// // // // // // // // // // // //             text: messageText,
// // // // // // // // // // // //             sender: user.id,
// // // // // // // // // // // //             timestamp: Date.now(),
// // // // // // // // // // // //             read: false,
// // // // // // // // // // // //             files: [],
// // // // // // // // // // // //         };

// // // // // // // // // // // //         setUploading(true);

// // // // // // // // // // // //         // Upload selected files (images and videos) to Firebase Storage
// // // // // // // // // // // //         const uploadedFiles = await Promise.all(selectedFiles.map(async (file) => {
// // // // // // // // // // // //             const fileRef = storageRef(storage, `chatFilesA/${file.name}`);
// // // // // // // // // // // //             await uploadBytes(fileRef, file);
// // // // // // // // // // // //             return getDownloadURL(fileRef);
// // // // // // // // // // // //         }));

// // // // // // // // // // // //         // Update newMessage with uploaded file URLs
// // // // // // // // // // // //         newMessage.files = uploadedFiles;

// // // // // // // // // // // //         // Push message to Firebase Database
// // // // // // // // // // // //         const newMsgRef = await push(messagesRef, newMessage);
// // // // // // // // // // // //         setMessageText(''); // Clear input after sending
// // // // // // // // // // // //         setSelectedFiles([]); // Clear selected files

// // // // // // // // // // // //         // Update the recipient's message status
// // // // // // // // // // // //         const recipientRef = databaseRef(database, `messagesA/${otherUser.id}/${user.id}`);
// // // // // // // // // // // //         await push(recipientRef, { ...newMessage, id: newMsgRef.key });

// // // // // // // // // // // //         setUploading(false);

// // // // // // // // // // // //         // Update last seen when a message is sent
// // // // // // // // // // // //         const lastSeenRef = databaseRef(database, `lastSeenA/${user.id}`);
// // // // // // // // // // // //         update(lastSeenRef, { timestamp: Date.now() });
// // // // // // // // // // // //     };

// // // // // // // // // // // //     const renderMedia = (files) => {
// // // // // // // // // // // //         if (!files || files.length === 0) return null;

// // // // // // // // // // // //         return (
// // // // // // // // // // // //             <div className="grid grid-cols-4 gap-2 mt-2">
// // // // // // // // // // // //                 {files.map((file, index) => (
// // // // // // // // // // // //                     <a
// // // // // // // // // // // //                         key={index}
// // // // // // // // // // // //                         href={file}
// // // // // // // // // // // //                         target="_blank"
// // // // // // // // // // // //                         rel="noopener noreferrer"
// // // // // // // // // // // //                         className="relative w-20 h-20 border border-gray-300 rounded-lg overflow-hidden cursor-pointer flex items-center justify-center bg-white"
// // // // // // // // // // // //                     >
// // // // // // // // // // // //                         {file.endsWith('.jpg') || file.endsWith('.png') || file.endsWith('.gif') ? (
// // // // // // // // // // // //                             <img src={file} alt="Media" className="object-cover h-full w-full rounded-lg" />
// // // // // // // // // // // //                         ) : (
// // // // // // // // // // // //                             <span className="text-sm flex items-center justify-center h-full text-gray-600">File</span>
// // // // // // // // // // // //                         )}
// // // // // // // // // // // //                     </a>
// // // // // // // // // // // //                 ))}
// // // // // // // // // // // //             </div>
// // // // // // // // // // // //         );
// // // // // // // // // // // //     };
   
// // // // // // // // // // // //     return (
// // // // // // // // // // // //         <div className="flex flex-col h-screen bg-gray-100">
// // // // // // // // // // // //             <div className="flex-none p-4 bg-white border-b border-gray-300">
// // // // // // // // // // // //                 <div>
// // // // // // // // // // // //                     <h2 className="text-xl text-center">{otherUser.name}</h2>
// // // // // // // // // // // //                     <p className="text-sm text-center">{lastSeen ? 'Last seen: ' + lastSeen : 'Offline'}</p>
// // // // // // // // // // // //                 </div>
    
// // // // // // // // // // // //                 {/* Three Dots Menu */}
// // // // // // // // // // // //                 <div className="relative">
// // // // // // // // // // // //                     <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="text-gray-500 hover:text-gray-700">
// // // // // // // // // // // //                         •••
// // // // // // // // // // // //                     </button>
// // // // // // // // // // // //                     {isMenuOpen && (
// // // // // // // // // // // //                         <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-300 rounded shadow-lg z-10">
// // // // // // // // // // // //                             <button
// // // // // // // // // // // //                                 onClick={() => alert('Select Pesan')} // Replace with actual action
// // // // // // // // // // // //                                 className="block px-4 py-2 text-sm hover:bg-gray-100 w-full text-left"
// // // // // // // // // // // //                             >
// // // // // // // // // // // //                                 Select Pesan
// // // // // // // // // // // //                             </button>
// // // // // // // // // // // //                             <button
// // // // // // // // // // // //                                 onClick={() => saveSettings({ bubbleColor: 'bg-blue-100', textColor: 'text-blue-900' })}
// // // // // // // // // // // //                                 className="block px-4 py-2 text-sm hover:bg-gray-100 w-full text-left"
// // // // // // // // // // // //                             >
// // // // // // // // // // // //                                 Ubah Warna (Blue)
// // // // // // // // // // // //                             </button>
// // // // // // // // // // // //                             <button
// // // // // // // // // // // //                                 onClick={() => saveSettings({ bubbleColor: 'bg-green-100', textColor: 'text-green-900' })}
// // // // // // // // // // // //                                 className="block px-4 py-2 text-sm hover:bg-gray-100 w-full text-left"
// // // // // // // // // // // //                             >
// // // // // // // // // // // //                                 Ubah Gelembung Chat (Green)
// // // // // // // // // // // //                             </button>
// // // // // // // // // // // //                             {/* Add more color options as needed */}
// // // // // // // // // // // //                         </div>
// // // // // // // // // // // //                     )}
// // // // // // // // // // // //                 </div>
// // // // // // // // // // // //             </div>
    
// // // // // // // // // // // //             <div className="flex-1 p-4 overflow-y-auto">
// // // // // // // // // // // //                 <div className="flex flex-col space-y-4">
// // // // // // // // // // // //                     {messages.map((msg, index) => (
// // // // // // // // // // // //                         <div key={index} className={`flex ${msg.sender === user.id ? 'justify-end' : 'justify-start'} mb-2`}>
// // // // // // // // // // // //                             <div className={`p-2 rounded-lg ${msg.sender === user.id ? `${chatBubbleColor} ${chatTextColor}` : 'bg-gray-200 text-black'}`}>
// // // // // // // // // // // //                                 {msg.text && <p className={`${msg.sender === user.id ? chatTextColor : 'text-black'}`}>{msg.text}</p>}
// // // // // // // // // // // //                                 {renderMedia(msg.files)}
// // // // // // // // // // // //                             </div>
// // // // // // // // // // // //                         </div>
// // // // // // // // // // // //                     ))}
// // // // // // // // // // // //                 </div>
// // // // // // // // // // // //             </div>
    
// // // // // // // // // // // //             <div className="flex-none p-4 bg-white border-t border-gray-300">
// // // // // // // // // // // //                 <textarea
// // // // // // // // // // // //                     value={messageText}
// // // // // // // // // // // //                     onChange={(e) => setMessageText(e.target.value)}
// // // // // // // // // // // //                     placeholder="Type your message..."
// // // // // // // // // // // //                     className="w-full border border-gray-300 p-2 rounded-lg"
// // // // // // // // // // // //                 />
// // // // // // // // // // // //                 <input type="file" multiple onChange={handleFileChange} className="mt-2" />
// // // // // // // // // // // //                 <button onClick={sendMessage} className="mt-2 bg-blue-500 text-white p-2 rounded-lg" disabled={uploading}>
// // // // // // // // // // // //                     {uploading ? 'Sending...' : 'Send'}
// // // // // // // // // // // //                 </button>
// // // // // // // // // // // //             </div>
// // // // // // // // // // // //         </div>
// // // // // // // // // // // //     );
// // // // // // // // // // // // };

// // // // // // // // // // // // export default Chat;
