"use client"; // Enable client-side rendering
import React, { useState, useEffect } from 'react';
import { database, storage } from '../config/firebase'; // Pastikan Firebase Storage sudah dikonfigurasi
import { ref as databaseRef, onValue, push, update } from 'firebase/database';
import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
import 'tailwindcss/tailwind.css';

const Chat0 = ({ user }) => {
    const [otherUser, setOtherUser] = useState(null);
  // Fetch other user data from Firebase
    useEffect(() => {
        const fetchOtherUserData = async () => {
            const usersRef = databaseRef(database, 'chat/users');
            const usersSnapshot = await get(usersRef);

            if (usersSnapshot.exists()) {
                const usersData = usersSnapshot.val();
                const otherUserId = Object.keys(usersData).find(
                    (key) => usersData[key].name !== user.name
                );

                if (otherUserId) {
                    setOtherUser({ id: otherUserId, name: usersData[otherUserId].name });
                }
            } else {
                console.log('Users data not found');
            }
        };

        if (user.id) {
            fetchOtherUserData();
        }
    }, [user.id, user.name]);
    const [messages, setMessages] = useState([]);
    const [messageText, setMessageText] = useState('');
    const [selectedFiles, setSelectedFiles] = useState([]);
    const [uploading, setUploading] = useState(false);
    const [otherUserStatus, setOtherUserStatus] = useState(''); // Online status or last seen
    const [lastSeen, setLastSeen] = useState(''); // Last seen timestamp

    // Fetch messages and user status from Firebase on component mount
    useEffect(() => {
        if (!otherUser) return;
      
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
        <div className="flex flex-col h-screen bg-gray-100">
            <div className="flex-none p-4 bg-white border-b border-gray-300">
                <h2 className="text-xl text-center">{otherUser.name}</h2>
                <p className="text-sm text-center">{lastSeen ? 'Last seen: ' + lastSeen : 'Offline'}</p>
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
                        </div>
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
                <label htmlFor="fileInput" className="cursor-pointer">
                    <span className="material-icons">file</span>
                </label>
                <div className="flex flex-wrap">
                    {selectedFiles.map((file, index) => (
                        <div key={index} className="relative mr-2 flex items-center">
                            <span
                                className="absolute top-0 right-0 cursor-pointer text-red-500"
                                onClick={() => removeFile(index)}
                            >
                                &times;
                            </span>
                            {/* Display a thumbnail or video preview based on file type */}
                            {file.type.startsWith("video") ? (
                                <video
                                    src={URL.createObjectURL(file)}
                                    className="w-20 h-20 object-cover rounded-lg m-1"
                                    controls
                                />
                            ) : (
                                <img
                                    src={URL.createObjectURL(file)}
                                    alt="Selected file"
                                    className="w-20 h-20 object-cover rounded-lg m-1"
                                />
                            )}
                        </div>
                    ))}
                </div>

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
                    disabled={uploading}
                >
                    {uploading ? "Sending..." : "Send"}
                </button>
            </div>
        </div>
    );
};

export default Chat0;
