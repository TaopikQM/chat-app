"use client"; // Enable client-side rendering
import React, { useState, useEffect } from 'react';
import { database, storage } from '../config/firebase'; // Adjust this import based on your firebase setup
import { ref, onValue, push, update, onDisconnect } from 'firebase/database';
import { uploadBytes, getDownloadURL, ref as storageRef } from 'firebase/storage';
import 'tailwindcss/tailwind.css';

const Chat = ({ user }) => {
    const otherUser = user.id === 'user1' ? { id: 'user2', name: 'User 2' } : { id: 'user1', name: 'User 1' };

    const [messages, setMessages] = useState([]); // State for messages
    const [messageText, setMessageText] = useState(''); // State for input message
    const [file, setFile] = useState(null); // State for file input
    const [preview, setPreview] = useState(null); // State for previewing the selected file
    const [isUploading, setIsUploading] = useState(false); // State to track if file is uploading
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

    // Function to handle file input and preview
    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) {
            setFile(selectedFile);
            setPreview(URL.createObjectURL(selectedFile)); // Create a preview URL for the selected file
        }
    };

    // Function to upload file to Firebase Storage
    const uploadFile = async (file) => {
        if (!file) return null;

        // Create a storage reference
        const storageReference = storageRef(storage, `files/${user.id}/${Date.now()}_${file.name}`);
        
        try {
            setIsUploading(true); // Start loading
            // Upload file to Firebase Storage
            await uploadBytes(storageReference, file);

            // Get the download URL after upload
            const downloadURL = await getDownloadURL(storageReference);
            setIsUploading(false); // End loading
            return downloadURL;
        } catch (error) {
            console.error("Error uploading file:", error);
            setIsUploading(false); // End loading on error
            return null;
        }
    };

    // Function to send a new message
    const sendMessage = async () => {
        if (messageText.trim() === "" && !file) return; // Prevent sending empty messages

        const messagesRef = ref(database, `messages/${user.id}/${otherUser.id}`);
        const newMessageKey = push(messagesRef).key;

        let fileURL = null;
        if (file) {
            // Upload the file and get its URL
            fileURL = await uploadFile(file);
            setFile(null); // Clear file state after uploading
            setPreview(null); // Clear preview after sending
        }

        const newMessage = {
            text: messageText,
            sender: user.id,
            timestamp: Date.now(),
            read: false, // Initially mark as unread
            id: newMessageKey, // Ensure message has unique ID
            file: fileURL // Set file URL (null if no file)
        };

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
                            {msg.file && <a href={msg.file} className="block text-blue-500 underline">Download File</a>}
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
            <div className="p-4 border-t border-gray-300">
                {/* Show file preview if a file is selected */}
                {preview && (
                    <div className="mb-2">
                        <img src={preview} alt="File preview" className="max-w-full h-32 object-cover" />
                    </div>
                )}

                <div className="flex items-center">
                    {/* File input */}
                    <input type="file" onChange={handleFileChange} className="hidden" id="fileInput" />
                    <label htmlFor="fileInput" className="mr-2 cursor-pointer">
                        <span className="text-gray-600 hover:text-blue-500">
                            📎
                        </span>
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
                        disabled={isUploading} // Disable button if uploading
                    >
                        {isUploading ? 'Uploading...' : 'Send'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Chat;
