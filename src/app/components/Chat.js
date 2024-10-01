"use client"; // Enable client-side rendering
import React, { useState, useEffect } from 'react';
import { database, storage } from '../config/firebase'; // Adjust this import based on your firebase setup
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
            let folder = 'files';
            if (file.type.startsWith('image/')) {
                folder = 'images';
            } else if (file.type.startsWith('video/')) {
                folder = 'videos';
            } else if (file.type === 'application/pdf') {
                folder = 'pdfs';
            }

            const storageReference = storageRef(storage, `${folder}/${user.id}/${Date.now()}_${file.name}`);
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
            files: fileURLs
        };

        const updates = {};
        updates[`messages/${user.id}/${otherUser.id}/${newMessageKey}`] = newMessage;
        updates[`messages/${otherUser.id}/${user.id}/${newMessageKey}`] = newMessage;

        update(ref(database), updates).then(() => {
            setMessageText('');
        });
    };

    const renderPreviews = () => {
        return previews.map((preview, index) => (
            <div key={index} className="relative inline-block m-1">
                {preview.file.type.startsWith('image/') ? (
                    <img src={preview.id} alt="Preview" className="w-20 h-20 object-cover rounded-lg" />
                ) : (
                    <div className="w-20 h-20 bg-gray-200 flex items-center justify-center rounded-lg">
                        <span>{preview.file.name}</span>
                    </div>
                )}
                <button
                    className="absolute top-0 right-0 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center"
                    onClick={() => removeFile(preview.id)}
                >
                    X
                </button>
            </div>
        ));
    };

    const renderMedia = (files) => {
        if (files.length === 0) return null;

        const visibleFiles = files.slice(0, 3);
        const extraFiles = files.length > 3 ? files.length - 3 : 0;

        return (
            <div className="flex space-x-2">
                {visibleFiles.map((file, index) => {
                    if (file.endsWith('.pdf')) {
                        return (
                            <div key={index} className="w-24 h-24 bg-gray-200 flex items-center justify-center rounded-lg">
                                <span>PDF</span>
                            </div>
                        );
                    }
                    return (
                        <img
                            key={index}
                            src={file}
                            alt={`Media ${index + 1}`}
                            className="w-24 h-24 object-cover rounded-lg"
                        />
                    );
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
                    <input
                        type="text"
                        value={messageText}
                        onChange={(e) => setMessageText(e.target.value)}
                        placeholder="Type your message"
                        className="flex-1 p-2 border border-gray-300 rounded-lg"
                    />
                    <button
                        onClick={sendMessage}
                        className={`ml-2 p-2 bg-blue-500 text-white rounded-lg ${isUploading ? 'opacity-50' : ''}`}
                        disabled={isUploading}
                    >
                        Send
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Chat;
