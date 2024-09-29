"use client"; // Enable client-side rendering
import React, { useState, useEffect } from 'react';
import { database } from '../config/firebase'; // Adjust this import based on your firebase setup
import { ref, onValue, push, update, onDisconnect } from 'firebase/database';
import 'tailwindcss/tailwind.css';

const Chat = ({ user }) => {
    const otherUser = user.id === 'user1' ? { id: 'user2', name: 'User 2' } : { id: 'user1', name: 'User 1' };

    const [messages, setMessages] = useState([]); // State for messages
    const [messageText, setMessageText] = useState(''); // State for input message
    const [file, setFile] = useState(null); // State for file input
    const [otherUserStatus, setOtherUserStatus] = useState(null); // State for tracking other user's online status
    const [isOtherUserTyping, setIsOtherUserTyping] = useState(false); // State to track typing status

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
                    const readTimestamp = Date.now(); // Timestamp for when the message is read
                    update(ref(database, `messages/${user.id}/${otherUser.id}/${msg.id}`), { read: true, readAt: readTimestamp });
                    update(ref(database, `messages/${otherUser.id}/${user.id}/${msg.id}`), { read: true, readAt: readTimestamp });
                }
            });
        });
    }, [user.id, otherUser.id]);

    // Monitor user online status and typing status
    useEffect(() => {
        const userStatusRef = ref(database, `status/${user.id}`);
        const typingRef = ref(database, `typing/${user.id}`);

        // Set user to online when they connect
        update(userStatusRef, { online: true, lastSeen: Date.now() });

        // Set user to offline and record last seen when they disconnect
        onDisconnect(userStatusRef).update({ online: false, lastSeen: Date.now() });

        // Update typing status when the user types
        if (messageText.trim() || file) {
            update(typingRef, { typing: true });
        } else {
            update(typingRef, { typing: false });
        }

        // Listen for the other user's online status
        const otherUserStatusRef = ref(database, `status/${otherUser.id}`);
        onValue(otherUserStatusRef, (snapshot) => {
            const status = snapshot.val();
            setOtherUserStatus(status);
        });

        // Listen for the other user's typing status
        const otherUserTypingRef = ref(database, `typing/${otherUser.id}`);
        onValue(otherUserTypingRef, (snapshot) => {
            const data = snapshot.val();
            setIsOtherUserTyping(data?.typing || false);
        });

        // Cleanup on component unmount
        return () => {
            update(typingRef, { typing: false });
            onDisconnect(userStatusRef).cancel();
        };
    }, [messageText, file, user.id, otherUser.id]);

    // Function to send a new message
    const sendMessage = () => {
        if (messageText.trim() === "" && !file) return; // Prevent sending empty messages

        const messagesRef = ref(database, `messages/${user.id}/${otherUser.id}`);
        const newMessageKey = push(messagesRef).key;

        const newMessage = {
            text: messageText,
            sender: user.id,
            timestamp: Date.now(),
            read: false, // Initially mark as unread
            id: newMessageKey, // Ensure message has unique ID
            file: null // Placeholder for file URL
        };

        if (file) {
            // Here you would typically upload the file to a storage service like Firebase Storage
            // For now, we're just simulating it with a placeholder URL
            const fileURL = URL.createObjectURL(file); // Create a local URL for the file
            newMessage.file = fileURL; // Assign file URL to message
            setFile(null); // Clear file state after sending
        }

        // Save message for both users
        const updates = {};
        updates[`messages/${user.id}/${otherUser.id}/${newMessageKey}`] = newMessage;
        updates[`messages/${otherUser.id}/${user.id}/${newMessageKey}`] = newMessage;

        update(ref(database), updates).then(() => {
            setMessageText(''); // Clear input after sending
        });
    };

    return (
        <div className="flex flex-col h-screen bg-gray-100">
            {/* Sticky header */}
            <div className="bg-white p-4 shadow-md sticky top-0 z-10">
                <h2 className="text-xl text-center">{otherUser.name}</h2>
                {/* Display online status or last seen */}
                <div className="text-sm text-gray-500 text-center">
                    {otherUserStatus?.online ? (
                        <span>{otherUser.name} is online</span>
                    ) : (
                        <span>Last seen at {new Date(otherUserStatus?.lastSeen).toLocaleTimeString()}</span>
                    )}
                </div>
            </div>

            {/* Scrollable chat area */}
            <div className="flex-1 overflow-y-auto p-4">
                {/* Display messages */}
                {messages.map((msg, index) => (
                    <div key={index} className={`mb-2 ${msg.sender === user.id ? 'text-right' : 'text-left'}`}>
                        <div className={`inline-block p-2 rounded-lg ${msg.sender === user.id ? 'bg-blue-500 text-white' : 'bg-gray-300'}`}>
                            {msg.text}
                            {msg.file && <a href={msg.file} className="block text-blue-500 underline">File</a>}
                        </div>
                        <div className="text-xs text-gray-500 flex justify-end items-center">
                            {new Date(msg.timestamp).toLocaleTimeString()}
                            {msg.sender === user.id && (
                                <span className="ml-2">
                                    {msg.read ? (
                                        <span className="text-blue-500">✔✔</span> // Blue double ticks for read messages
                                    ) : (
                                        <span>✔</span> // Grey single tick for sent messages
                                    )}
                                </span>
                            )}
                            {msg.sender !== user.id && (
                                <span className="ml-2">
                                    {msg.read ? (
                                        <span className="text-blue-500">✔✔</span> // Blue double ticks for read messages
                                    ) : (
                                        <span>✔✔</span> // Grey double ticks for delivered messages
                                    )}
                                </span>
                            )}
                            {/* Show read time if message is read */}
                            {msg.read && msg.readAt && (
                                <span className="ml-2">
                                    Dibaca pada {new Date(msg.readAt).toLocaleTimeString()}
                                </span>
                            )}
                        </div>
                    </div>
                ))}

                {/* Show typing indicator */}
                {isOtherUserTyping && (
                    <div className="text-sm text-gray-500 text-center">
                        {otherUser.name} is typing...
                    </div>
                )}
            </div>

            {/* Message input area */}
            <div className="flex items-center p-4 border-t border-gray-300">
                <input
                    type="file"
                    className="hidden"
                    onChange={(e) => setFile(e.target.files[0])}
                    id="fileInput"
                />
                <label htmlFor="fileInput" className="cursor-pointer text-blue-500 mr-2">
                    📎
                </label>
                <input
                    type="text"
                    className="border rounded-lg p-2 flex-1"
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
// import { database } from '../config/firebase'; // Adjust this import based on your firebase setup
// import { ref, onValue, push, update, onDisconnect } from 'firebase/database';
// import 'tailwindcss/tailwind.css';

// const Chat = ({ user }) => {
//     const otherUser = user.id === 'user1' ? { id: 'user2', name: 'User 2' } : { id: 'user1', name: 'User 1' };

//     const [messages, setMessages] = useState([]); // State for messages
//     const [messageText, setMessageText] = useState(''); // State for input message
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
//         if (messageText.trim()) {
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
//     }, [messageText, user.id, otherUser.id]);

//     // Function to send a new message
//     const sendMessage = () => {
//         if (messageText.trim() === "") return; // Prevent sending empty messages

//         const messagesRef = ref(database, `messages/${user.id}/${otherUser.id}`);
//         const newMessageKey = push(messagesRef).key;

//         const newMessage = {
//             text: messageText,
//             sender: user.id,
//             timestamp: Date.now(),
//             read: false, // Initially mark as unread
//             id: newMessageKey, // Ensure message has unique ID
//         };

//         // Save message for both users
//         const updates = {};
//         updates[`messages/${user.id}/${otherUser.id}/${newMessageKey}`] = newMessage;
//         updates[`messages/${otherUser.id}/${user.id}/${newMessageKey}`] = newMessage;

//         update(ref(database), updates).then(() => {
//             setMessageText(''); // Clear input after sending
//         });
//     };

//     return (
//         <div className="flex flex-col h-screen bg-gray-100">
//             <div className="flex-1 overflow-y-auto p-4">
//                 <h2 className="text-xl text-center mb-4">{otherUser.name}</h2>

//                 {/* Display online status or last seen */}
//                 <div className="text-sm text-gray-500 mb-4 text-center">
//                     {otherUserStatus?.online ? (
//                         <span>{otherUser.name} is online</span>
//                     ) : (
//                         <span>Last seen at {new Date(otherUserStatus?.lastSeen).toLocaleTimeString()}</span>
//                     )}
//                 </div>

//                 {/* Display messages */}
//                 {messages.map((msg, index) => (
//                     <div key={index} className={`mb-2 ${msg.sender === user.id ? 'text-right' : 'text-left'}`}>
//                         <div className={`inline-block p-2 rounded-lg ${msg.sender === user.id ? 'bg-blue-500 text-white' : 'bg-gray-300'}`}>
//                             {msg.text}
//                         </div>
//                         <div className="text-xs text-gray-500 flex justify-end items-center">
//                             {new Date(msg.timestamp).toLocaleTimeString()}
//                             {msg.sender === user.id && (
//                                 <span className="ml-2">
//                                     {msg.read ? (
//                                         <span className="text-blue-500">✔✔</span> // Blue double ticks for read messages
//                                     ) : (
//                                         <span>✔</span> // Grey single tick for sent messages
//                                     )}
//                                 </span>
//                             )}
//                             {msg.sender !== user.id && (
//                                 <span className="ml-2">
//                                     {msg.read ? (
//                                         <span className="text-blue-500">✔✔</span> // Blue double ticks for read messages
//                                     ) : (
//                                         <span>✔✔</span> // Grey double ticks for delivered messages
//                                     )}
//                                 </span>
//                             )}
//                             {/* Show read time if message is read */}
//                             {msg.read && msg.readAt && (
//                                 <span className="ml-2">
//                                     Dibaca pada {new Date(msg.readAt).toLocaleTimeString()}
//                                 </span>
//                             )}
//                         </div>
//                     </div>
//                 ))}

//                 {/* Show typing indicator */}
//                 {isOtherUserTyping && (
//                     <div className="text-sm text-gray-500 text-center">
//                         {otherUser.name} is typing...
//                     </div>
//                 )}
//             </div>

//             {/* Message input area */}
//             <div className="flex items-center p-4 border-t border-gray-300">
//                 <input
//                     type="text"
//                     className="border rounded-lg p-2 flex-1"
//                     placeholder="Type a message..."
//                     value={messageText}
//                     onChange={(e) => setMessageText(e.target.value)}
//                 />
//                 <button
//                     className="ml-2 p-2 bg-blue-500 text-white rounded-lg"
//                     onClick={sendMessage}
//                 >
//                     Send
//                 </button>
//             </div>
//         </div>
//     );
// };

// export default Chat;
