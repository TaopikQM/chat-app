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
    const [files, setFiles] = useState([]); // State for selected files
    const [previews, setPreviews] = useState([]); // State for file previews
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
        if (messageText.trim() || files.length > 0) {
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
    }, [messageText, files, user.id, otherUser.id]);

    // Function to handle file input and preview
    const handleFileChange = (e) => {
        const selectedFiles = Array.from(e.target.files);
        setFiles([...files, ...selectedFiles]);

        // Generate previews for selected files
        const newPreviews = selectedFiles.map((file) => ({
            id: URL.createObjectURL(file),
            file,
        }));
        setPreviews([...previews, ...newPreviews]);
    };

    // Function to remove a file from preview
    const removeFile = (previewId) => {
        setPreviews(previews.filter((preview) => preview.id !== previewId));
        setFiles(files.filter((file) => URL.createObjectURL(file) !== previewId));
    };

    // Function to upload files to Firebase Storage
    const uploadFiles = async () => {
        const uploadPromises = files.map((file) => {
            const storageReference = storageRef(storage, `files/${user.id}/${Date.now()}_${file.name}`);
            return uploadBytes(storageReference, file).then(() => getDownloadURL(storageReference));
        });
        return await Promise.all(uploadPromises); // Return all download URLs
    };

    // Function to send a new message
    const sendMessage = async () => {
        if (messageText.trim() === "" && files.length === 0) return; // Prevent sending empty messages

        const messagesRef = ref(database, `messages/${user.id}/${otherUser.id}`);
        const newMessageKey = push(messagesRef).key;

        let fileURLs = [];
        if (files.length > 0) {
            setIsUploading(true);
            fileURLs = await uploadFiles(); // Upload all files and get URLs
            setIsUploading(false);
            setFiles([]); // Clear files after uploading
            setPreviews([]); // Clear previews after sending
        }

        const newMessage = {
            text: messageText,
            sender: user.id,
            timestamp: Date.now(),
            read: false, // Initially mark as unread
            id: newMessageKey,
            files: fileURLs // Store uploaded file URLs
        };

        // Save message for both users
        const updates = {};
        updates[`messages/${user.id}/${otherUser.id}/${newMessageKey}`] = newMessage;
        updates[`messages/${otherUser.id}/${user.id}/${newMessageKey}`] = newMessage;

        update(ref(database), updates).then(() => {
            setMessageText(''); // Clear input after sending
        });
    };

    // Function to render media based on file type
    const renderMedia = (files) => {
        if (files.length === 0) return null;

        return files.map((file, index) => {
            const fileType = file.split('.').pop(); // Get the file extension

            if (['png', 'jpg', 'jpeg', 'gif'].includes(fileType.toLowerCase())) {
                // Render image
                return (
                    <img
                        key={index}
                        src={file}
                        alt={`Media ${index + 1}`}
                        className="w-24 h-24 object-cover rounded-lg"
                    />
                );
            } else if (['mp4', 'mkv', 'webm', 'ogg'].includes(fileType.toLowerCase())) {
                // Render video
                return (
                    <video
                        key={index}
                        controls
                        className="w-24 h-24 object-cover rounded-lg"
                    >
                        <source src={file} type={`video/${fileType}`} />
                        Your browser does not support the video tag.
                    </video>
                );
            } else if (['pdf', 'doc', 'docx', 'xls', 'xlsx'].includes(fileType.toLowerCase())) {
                // Render document link
                return (
                    <a
                        key={index}
                        href={file}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-24 h-24 bg-gray-200 rounded-lg flex items-center justify-center text-center"
                    >
                        <span>{file.split('/').pop()}</span>
                    </a>
                );
            } else {
                return null; // Unsupported file type
            }
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
                    {isOtherUserTyping && <span>...typing</span>}
                </div>
            </div>

            {/* Chat messages */}
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

            {/* Message input */}
            <div className="flex items-center p-4 bg-white border-t">
                <input
                    type="file"
                    onChange={handleFileChange}
                    multiple
                    className="mr-2"
                />
                <input
                    type="text"
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    placeholder="Type a message..."
                    className="flex-1 border rounded-lg p-2"
                />
                <button
                    onClick={sendMessage}
                    disabled={isUploading}
                    className={`ml-2 p-2 rounded-lg ${isUploading ? 'bg-gray-300' : 'bg-blue-500 text-white'}`}
                >
                    Send
                </button>
            </div>
        </div>
    );
};

export default Chat;
