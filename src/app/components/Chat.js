// components/Chat.js
import React, { useState, useEffect } from 'react';
import { database, storage } from '../lib/firebase';
import { ref, onValue, push, update } from 'firebase/database';
import { getDownloadURL, ref as storageRef, uploadBytes } from 'firebase/storage';
import { Picker } from 'emoji-mart'; // Pastikan Anda menginstal emoji-mart

const Chat = ({ user }) => {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [file, setFile] = useState(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  useEffect(() => {
    const messageRef = ref(database, 'chats');
    onValue(messageRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setMessages(Object.values(data));
      }
    });
  }, []);

  const sendMessage = () => {
    const messageRef = ref(database, 'chats');
    const newMessage = {
      user,
      message,
      timestamp: Date.now(),
      type: 'text',
      read: false,
    };
    push(messageRef, newMessage);
    setMessage('');
  };

  const markAsRead = (msgId) => {
    const messageRef = ref(database, 'chats', msgId);
    update(messageRef, { read: true });
  };

  const sendFile = () => {
    const fileRef = storageRef(storage, `files/${file.name}`);
    uploadBytes(fileRef, file).then((snapshot) => {
      getDownloadURL(snapshot.ref).then((url) => {
        const messageRef = ref(database, 'chats');
        const newMessage = {
          user,
          fileUrl: url,
          timestamp: Date.now(),
          type: file.type.startsWith('image') ? 'image' : 'file',
          read: false,
        };
        push(messageRef, newMessage);
        setFile(null);
      });
    });
  };

  const addEmoji = (emoji) => {
    setMessage(message + emoji.native);
    setShowEmojiPicker(false);
  };

  return (
    <div className="flex flex-col h-screen p-4 bg-gray-100">
      <div className="flex-grow overflow-auto mb-4">
        {messages.map((msg, index) => (
          <div key={index} className={`flex ${msg.user === user ? 'justify-end' : 'justify-start'} mb-2`}>
            <div className={`max-w-xs p-3 rounded-lg ${msg.user === user ? 'bg-blue-500 text-white' : 'bg-gray-200 text-black'}`}>
              {msg.type === 'text' && (
                <>
                  <p>{msg.message}</p>
                  {msg.read && (
                    <span className="inline-block w-2 h-2 rounded-full bg-blue-600 ml-2"></span>
                  )}
                </>
              )}
              {msg.type === 'image' && <img src={msg.fileUrl} alt="image" className="max-w-full rounded-lg" />}
              {msg.type === 'file' && <a href={msg.fileUrl} className="text-blue-500 underline">Download File</a>}
            </div>
          </div>
        ))}
      </div>
      <div className="flex items-center">
        <input
          type="text"
          className="flex-grow p-2 border border-gray-300 rounded-lg"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type a message..."
        />
        <button onClick={sendMessage} className="ml-2 p-2 bg-blue-600 text-white rounded-lg">Send</button>
        <input
          type="file"
          onChange={(e) => setFile(e.target.files[0])}
          className="ml-2"
        />
        <button onClick={sendFile} className="ml-2 p-2 bg-blue-600 text-white rounded-lg">Send File</button>
        <button onClick={() => setShowEmojiPicker(!showEmojiPicker)} className="ml-2 p-2 bg-green-500 text-white rounded-lg">😀</button>
      </div>
      {showEmojiPicker && (
        <Picker onSelect={addEmoji} style={{ position: 'absolute', bottom: '60px' }} />
      )}
    </div>
  );
};

export default Chat;
