"use client"; // Enable client-side rendering
import React, { useState, useEffect } from 'react';
import { database, storage } from '../config/firebase'; // Pastikan Anda sudah mengkonfigurasi Firebase Storage
import { ref, onValue, push, update, remove } from 'firebase/database';
import { uploadBytes, getDownloadURL } from 'firebase/storage';
import 'tailwindcss/tailwind.css';

const Chat = ({ user }) => {
    const otherUser = user.id === 'user1' ? { id: 'user2', name: 'User 2' } : { id: 'user1', name: 'User 1' };

    const [messages, setMessages] = useState([]);
    const [messageText, setMessageText] = useState('');
    const [selectedFiles, setSelectedFiles] = useState([]);
    const [uploadingFiles, setUploadingFiles] = useState([]); // State untuk menyimpan status upload file
    const [lastSeen, setLastSeen] = useState(null); // State untuk menyimpan waktu terakhir dilihat
    const [editingMessageId, setEditingMessageId] = useState(null); // State untuk menyimpan ID pesan yang sedang diedit
    const [isTyping, setIsTyping] = useState(false); // State untuk menyimpan status mengetik
    const [isUploading, setIsUploading] = useState(false); // State untuk menyimpan status upload

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
        const updateLastSeen = () => {
            if (isTyping) {
                update(lastSeenRef, { status: "Online", timestamp: Date.now() });
            } else {
                update(lastSeenRef, { status: "Last Seen", timestamp: Date.now() });
            }
        };

        // Check typing status
        const typingInterval = setInterval(updateLastSeen, 5000); // Update every 5 seconds

        return () => clearInterval(typingInterval); // Clean up interval on unmount
    }, [user.id, otherUser.id, isTyping]);

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

        // Update newMessage with uploaded file URLs
        if (selectedFiles.length > 0) {
            setIsUploading(true); // Set uploading status to true
            const uploadedFiles = await Promise.all(selectedFiles.map(async (file) => {
                const storageRef = ref(storage, `chatFiles/${file.name}`);
                await uploadBytes(storageRef, file);
                const url = await getDownloadURL(storageRef);
                return url;
            }));
            newMessage.files = uploadedFiles;
            setIsUploading(false); // Reset uploading status
            setSelectedFiles([]); // Clear selected files after upload
        }

        // Push message to Firebase Database
        await push(messagesRef, newMessage);
        setMessageText(''); // Clear input after sending

        // Update the recipient's message status
        const recipientRef = ref(database, `messages/${otherUser.id}/${user.id}`);
        await push(recipientRef, newMessage);
    };

    // Handle message edit
    const handleEditMessage = async (id) => {
        const messageToEdit = messages.find((msg) => msg.id === id);
        setMessageText(messageToEdit.text);
        setEditingMessageId(id);
    };

    // Function to update the edited message
    const updateMessage = async () => {
        if (editingMessageId) {
            const messageRef = ref(database, `messages/${user.id}/${otherUser.id}/${editingMessageId}`);
            await update(messageRef, { text: messageText });
            setMessageText(''); // Clear input after updating
            setEditingMessageId(null); // Reset editing state
        }
    };

    // Function to delete a message
    const deleteMessage = async (id) => {
        const messageRef = ref(database, `messages/${user.id}/${otherUser.id}/${id}`);
        await remove(messageRef);
    };

    const renderMedia = (files) => {
        if (!files || files.length === 0) return null;

        const visibleFiles = files.slice(0, 3);
        const extraFiles = files.length - visibleFiles.length;

        return (
            <div className="flex flex-wrap mt-1">
                {visibleFiles.map((file, index) => (
                    <div key={index} className="relative">
                        <img
                            src={file}
                            alt="Media"
                            className="w-20 h-20 object-cover rounded-lg m-1"
                        />
                        <button
                            onClick={() => removeFile(index)}
                            className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1"
                        >
                            X
                        </button>
                    </div>
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
                        {lastSeen.status} (Last seen: {new Date(lastSeen.timestamp).toLocaleString()})
                    </p>
                )}
            </div>
            <div className="flex-1 overflow-y-auto p-4">
                {/* Display messages */}
                {messages.map((msg, index) => (
                    <div key={index} className={`mb-2 ${msg.sender === user.id ? 'text-right' : 'text-left'}`}>
                        <div 
                            className={`inline-block p-2 rounded-lg ${msg.sender === user.id ? 'bg-blue-500 text-white' : 'bg-gray-300'}`}
                            onContextMenu={(e) => {
                                e.preventDefault();
                                if (msg.sender === user.id) {
                                    handleEditMessage(msg.id); // Enable editing for the message
                                } else {
                                    deleteMessage(msg.id); // Delete message for others
                                }
                            }}
                        >
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
            </div>
            <div className="flex-none p-4 border-t border-gray-300 flex items-center">
                <input
                    type="file"
                    accept="image/*,video/*"
                    onChange={handleFileChange}
                    className="hidden"
                    id="file-input"
                    multiple
                />
                <label htmlFor="file-input" className="bg-gray-200 rounded-lg px-4 py-2 cursor-pointer">
                    📎
                </label>
                {renderMedia(selectedFiles)} {/* Render selected files */}
                <input
                    type="text"
                    value={messageText}
                    onChange={(e) => {
                        setMessageText(e.target.value);
                        setIsTyping(true); // Set typing status to true
                    }}
                    placeholder="Type a message..."
                    className="flex-1 p-2 border border-gray-300 rounded-lg mx-2"
                />
                <button
                    onClick={editingMessageId ? updateMessage : sendMessage}
                    className="bg-blue-500 text-white rounded-lg px-4 py-2"
                >
                    {editingMessageId ? 'Update' : 'Send'}
                </button>
            </div>
        </div>
    );
};

export default Chat;
