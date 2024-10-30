"use client"; // Enable client-side rendering
import React, { useState, useEffect } from 'react';
import { database, storage } from '../config/firebase'; // Pastikan Firebase Storage sudah dikonfigurasi
import { ref as databaseRef, onValue, push, update } from 'firebase/database';
import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
import 'tailwindcss/tailwind.css';

const Chat = ({ user }) => {
    const otherUser = user.id === 'user1' ? { id: 'user2', name: 'User 2' } : { id: 'user1', name: 'User 1' };

    const [messages, setMessages] = useState([]);
    const [messageText, setMessageText] = useState('');
    const [selectedFiles, setSelectedFiles] = useState([]);
    const [uploading, setUploading] = useState(false);
    const [otherUserStatus, setOtherUserStatus] = useState(''); // Online status or last seen
    const [lastSeen, setLastSeen] = useState(''); // Last seen timestamp
    const [popupFile, setPopupFile] = useState(null);
    
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [chatBubbleColor, setChatBubbleColor] = useState('bg-gray-300');
    const [chatTextColor, setChatTextColor] = useState('text-black');

    const userId = user.id; // Ambil ID user saat ini

    // Load settings from localStorage (or fetch from server if available)
    useEffect(() => {
        const savedSettings = JSON.parse(localStorage.getItem(`chatSettings-${userId}`));
        if (savedSettings) {
            setChatBubbleColor(savedSettings.bubbleColor);
            setChatTextColor(savedSettings.textColor);
        }
    }, [userId]);

    // Save settings to localStorage when updated
    const saveSettings = (newSettings) => {
        const settings = {
            bubbleColor: newSettings.bubbleColor || chatBubbleColor,
            textColor: newSettings.textColor || chatTextColor,
        };
        setChatBubbleColor(settings.bubbleColor);
        setChatTextColor(settings.textColor);
        localStorage.setItem(`chatSettings-${userId}`, JSON.stringify(settings));
    };
    
    useEffect(() => {
        const messagesRef = databaseRef(database, `messagesA/${user.id}/${otherUser.id}`);
        onValue(messagesRef, (snapshot) => {
            const data = snapshot.val();
            const loadedMessages = data ? Object.values(data) : [];
            setMessages(loadedMessages);
    
            // Mark all messages as read when the user views the chat
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
            const timestamp = status && status.timestamp ? Number(status.timestamp) : null;
    
            if (timestamp && timestamp.toString().length === 13) {  // Check if in milliseconds
                const date = new Date(timestamp);
                setLastSeen(
                    !isNaN(date.getTime())
                        ? `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`
                        : 'Offline'
                );
            } else {
                console.error("Timestamp is invalid or missing:", timestamp);
                setLastSeen('Offline');
            }
        });
    
        // Update last seen when user is active
        const lastSeenRef = databaseRef(database, `lastSeenA/${user.id}`);
        update(lastSeenRef, { timestamp: Date.now() });
    
        return () => {
            // Cleanup: Remove last seen status when component unmounts
            update(lastSeenRef, { timestamp: null });
        };
    }, [user.id, otherUser.id]);

    const [dropdownOpen, setDropdownOpen] = useState(null);

    const toggleDropdown = (index) => {
        setDropdownOpen(dropdownOpen === index ? null : index);
    };
    
    const isDropdownOpen = (index) => dropdownOpen === index;

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

        const messagesRef = databaseRef(database, `messagesA/${user.id}/${otherUser.id}`);
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
            const fileRef = storageRef(storage, `chatFilesA/${file.name}`);
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
        const recipientRef = databaseRef(database, `messagesA/${otherUser.id}/${user.id}`);
        await push(recipientRef, { ...newMessage, id: newMsgRef.key });

        setUploading(false);

        // Update last seen when a message is sent
        const lastSeenRef = databaseRef(database, `lastSeenA/${user.id}`);
        update(lastSeenRef, { timestamp: Date.now() });
    };

    const renderMedia = (files) => {
        if (!files || files.length === 0) return null;

        return (
            <div className="grid grid-cols-4 gap-2 mt-2">
                {files.map((file, index) => (
                    <a
                        key={index}
                        href={file}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="relative w-20 h-20 border border-gray-300 rounded-lg overflow-hidden cursor-pointer flex items-center justify-center bg-white"
                    >
                        {file.endsWith('.jpg') || file.endsWith('.png') || file.endsWith('.gif') ? (
                            <img src={file} alt="Media" className="object-cover h-full w-full rounded-lg" />
                        ) : (
                            <span className="text-sm flex items-center justify-center h-full text-gray-600">File</span>
                        )}
                    </a>
                ))}
            </div>
        );
    };
   
    return (
        <div className="flex flex-col h-screen bg-gray-100">
            <div className="flex-none p-4 bg-white border-b border-gray-300">
                <div>
                    <h2 className="text-xl text-center">{otherUser.name}</h2>
                    <p className="text-sm text-center">{lastSeen ? 'Last seen: ' + lastSeen : 'Offline'}</p>
                </div>
    
                {/* Three Dots Menu */}
                <div className="relative">
                    <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="text-gray-500 hover:text-gray-700">
                        •••
                    </button>
                    {isMenuOpen && (
                        <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-300 rounded shadow-lg z-10">
                            <button
                                onClick={() => alert('Select Pesan')} // Replace with actual action
                                className="block px-4 py-2 text-sm hover:bg-gray-100 w-full text-left"
                            >
                                Select Pesan
                            </button>
                            <button
                                onClick={() => saveSettings({ bubbleColor: 'bg-blue-100', textColor: 'text-blue-900' })}
                                className="block px-4 py-2 text-sm hover:bg-gray-100 w-full text-left"
                            >
                                Ubah Warna (Blue)
                            </button>
                            <button
                                onClick={() => saveSettings({ bubbleColor: 'bg-green-100', textColor: 'text-green-900' })}
                                className="block px-4 py-2 text-sm hover:bg-gray-100 w-full text-left"
                            >
                                Ubah Gelembung Chat (Green)
                            </button>
                            {/* Add more color options as needed */}
                        </div>
                    )}
                </div>
            </div>
    
            <div className="flex-1 p-4 overflow-y-auto">
                <div className="flex flex-col space-y-4">
                    {messages.map((msg, index) => (
                        <div key={index} className={`flex ${msg.sender === user.id ? 'justify-end' : 'justify-start'} mb-2`}>
                            <div className={`p-2 rounded-lg ${msg.sender === user.id ? `${chatBubbleColor} ${chatTextColor}` : 'bg-gray-200 text-black'}`}>
                                {msg.text && <p className={`${msg.sender === user.id ? chatTextColor : 'text-black'}`}>{msg.text}</p>}
                                {renderMedia(msg.files)}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
    
            <div className="flex-none p-4 bg-white border-t border-gray-300">
                <textarea
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    placeholder="Type your message..."
                    className="w-full border border-gray-300 p-2 rounded-lg"
                />
                <input type="file" multiple onChange={handleFileChange} className="mt-2" />
                <button onClick={sendMessage} className="mt-2 bg-blue-500 text-white p-2 rounded-lg" disabled={uploading}>
                    {uploading ? 'Sending...' : 'Send'}
                </button>
            </div>
        </div>
    );
};

export default Chat;
