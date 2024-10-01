"use client"; // Enable client-side rendering

import React, { useState, useEffect } from 'react';
import { database } from '../const/firebase'; // Adjust this import based on your firebase setup
import { ref, onValue, push, update } from 'firebase/database';
import 'tailwindcss/tailwind.css';

const Chat = ({ user }) => {
    const otherUser = user.id === 'user1' ? { id: 'user2', name: 'User 2' } : { id: 'user1', name: 'User 1' };

    const [messages, setMessages] = useState([]); // State for messages
    const [messageText, setMessageText] = useState(''); // State for input message

    // Function to fetch messages bidirectionally from both user1->user2 and user2->user1 paths
    const fetchMessages = () => {
        const user1ToUser2Ref = ref(database, `messages/${user.id}/${otherUser.id}`);
        const user2ToUser1Ref = ref(database, `messages/${otherUser.id}/${user.id}`);

        const allMessages = [];

        // Listen for new messages from user1 -> user2
        onValue(user1ToUser2Ref, (snapshot) => {
            const data = snapshot.val();
            if (data) {
                const user1Messages = Object.values(data);
                allMessages.push(...user1Messages);
            }
        });

        // Listen for new messages from user2 -> user1
        onValue(user2ToUser1Ref, (snapshot) => {
            const data = snapshot.val();
            if (data) {
                const user2Messages = Object.values(data);
                allMessages.push(...user2Messages);
            }
        });

        // Sort messages by timestamp after fetching them
        const sortedMessages = allMessages.sort((a, b) => a.timestamp - b.timestamp);
        setMessages(sortedMessages);

        // Mark messages as read if they are from the other user and not yet read
        sortedMessages.forEach((msg) => {
            if (!msg.read && msg.sender !== user.id) {
                update(ref(database, `messages/${msg.sender}/${user.id}/${msg.id}`), { read: true });
            }
        });
    };

    // Fetch messages once when component mounts
    useEffect(() => {
        fetchMessages();
    }, [user.id, otherUser.id]);

    // Function to send a new message
    const sendMessage = () => {
        if (messageText.trim() === "") return; // Prevent sending empty messages

        const messagesRef = ref(database, `messages/${user.id}/${otherUser.id}`);
        const newMessage = {
            id: Date.now().toString(), // Ensure unique ID
            text: messageText,
            sender: user.id,
            timestamp: Date.now(),
            read: false, // Initially mark as unread
        };

        push(messagesRef, newMessage).then(() => {
            setMessageText(''); // Clear input after sending
        });
    };

    return (
        <div className="flex flex-col h-screen bg-gray-100">
            <div className="flex-1 overflow-y-auto p-4">
                <h2 className="text-xl text-center mb-4">{otherUser.name}</h2>
                {/* Display messages */}
                {messages.map((msg, index) => (
                    <div key={index} className={`mb-2 ${msg.sender === user.id ? 'text-right' : 'text-left'}`}>
                        <div className={`inline-block p-2 rounded-lg ${msg.sender === user.id ? 'bg-blue-500 text-white' : 'bg-gray-300'}`}>
                            {msg.text}
                        </div>
                        <div className="text-xs text-gray-500 flex justify-end items-center">
                            {new Date(msg.timestamp).toLocaleTimeString()}
                            {/* Show ticks: single for sent, double for delivered, blue double for read */}
                            {msg.sender === user.id && (
                                <span className="ml-2">
                                    {msg.read ? (
                                        <span className="text-blue-500">✔✔</span> // Blue double ticks for read messages
                                    ) : (
                                        <span>✔✔</span> // Grey double ticks for delivered messages
                                    )}
                                </span>
                            )}
                        </div>
                    </div>
                ))}
            </div>
            {/* Message input area */}
            <div className="flex items-center p-4 border-t border-gray-300">
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
