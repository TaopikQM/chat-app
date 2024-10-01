import React, { useState, useEffect } from 'react';
import { database, storage } from '../lib/firebase';
import { ref, onValue, push, update } from 'firebase/database';
import { getDownloadURL, ref as storageRef, uploadBytes } from 'firebase/storage';
import { Picker } from 'emoji-mart'; 
import 'emoji-mart/css/emoji-mart.css'; 
import { FiPaperclip } from 'react-icons/fi'; 
import { FaSmile } from 'react-icons/fa'; 

const Chat = ({ user }) => {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [file, setFile] = useState(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [selectedContact, setSelectedContact] = useState(null);
  const [loading, setLoading] = useState(false); // State for loading status

  useEffect(() => {
    const messageRef = ref(database, 'chats');
    onValue(messageRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setMessages(Object.values(data));
      }
    });

    const contactsRef = ref(database, 'contacts');
    onValue(contactsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setContacts(Object.values(data));
      }
    });
  }, []);

  const sendMessage = () => {
    const messageRef = ref(database, 'chats');
    const newMessage = {
      user,
      message,
      timestamp: Date.now(),
      read: false,
      contact: selectedContact,
    };
    push(messageRef, newMessage);
    setMessage('');
    setFile(null);
  };

  const sendFile = () => {
    if (!file) return;

    setLoading(true); // Start loading
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
          contact: selectedContact,
        };
        push(messageRef, newMessage);
        setFile(null);
        setLoading(false); // Stop loading
      });
    }).catch(() => {
      setLoading(false); // Stop loading on error
    });
  };

  const handleSend = () => {
    if (file) {
      sendFile();
    } else {
      sendMessage();
    }
  };

  const addEmoji = (emoji) => {
    setMessage((prevMessage) => prevMessage + emoji.native);
    setShowEmojiPicker(false);
  };

  return (
    <div className="flex h-screen">
      {/* Sidebar - Contacts */}
      <div className="w-1/3 md:w-1/4 lg:w-1/5 border-r border-gray-300 p-4 overflow-auto">
        <h2 className="font-bold text-xl mb-4">Contacts</h2>
        <ul>
          {contacts.map((contact, index) => (
            <li key={index} className="p-2 hover:bg-gray-200 cursor-pointer" onClick={() => setSelectedContact(contact)}>
              {contact.name}
            </li>
          ))}
        </ul>
      </div>
      
      {/* Main Chat */}
      <div className="flex-1 flex flex-col p-4">
        <div className="flex-grow overflow-auto mb-4">
          {messages.filter(msg => msg.contact === selectedContact).map((msg, index) => (
            <div key={index} className={`flex ${msg.user === user ? 'justify-end' : 'justify-start'} mb-2`}>
              <div className={`max-w-xs p-3 rounded-lg ${msg.user === user ? 'bg-blue-500 text-white' : 'bg-gray-200 text-black'}`}>
                {msg.message && <p>{msg.message}</p>}
                {msg.fileUrl && msg.type === 'image' && <img src={msg.fileUrl} alt="image" className="max-w-full rounded-lg" />}
                {msg.fileUrl && msg.type === 'file' && <a href={msg.fileUrl} className="text-blue-500 underline">Download File</a>}
                {msg.read && <span className="inline-block w-2 h-2 rounded-full bg-blue-600 ml-2"></span>}
              </div>
            </div>
          ))}
        </div>

        {/* Chat input and buttons */}
        <div className="flex items-center">
          <input
            type="text"
            className="flex-grow p-2 border border-gray-300 rounded-lg"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type a message..."
          />
          
          <input
            type="file"
            onChange={(e) => setFile(e.target.files[0])}
            className="hidden"
            id="file-input"
          />
          
          <label htmlFor="file-input" className="flex items-center ml-2 cursor-pointer">
            <FiPaperclip className="text-gray-600 w-6 h-6" />
          </label>
          
          <button 
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            className="ml-2 p-2 bg-green-500 text-white rounded-lg"
          >
            <FaSmile className="w-6 h-6" />
          </button>
          
          <button 
            onClick={handleSend}
            className="ml-2 p-2 bg-blue-600 text-white rounded-lg flex items-center"
          >
            {loading ? (
              <span className="loader"></span> // You can create a CSS loader here
            ) : (
              'Send'
            )}
          </button>
        </div>

        {showEmojiPicker && (
          <Picker onSelect={addEmoji} style={{ position: 'absolute', bottom: '60px', right: '20px' }} />
        )}
      </div>
    </div>
  );
};

export default Chat;
