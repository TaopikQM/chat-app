'use client';

import { useEffect, useState } from 'react';
import { db } from '../config/firebase';
import { ref, push, onValue } from 'firebase/database';
import ChatInput from '../../components/ChatInput';

export default function ChatPage() {
  const [messages, setMessages] = useState([]);
  const myId = 'sitop';
  const chatWith = 'user_lain'; // Ganti dengan ID target

  useEffect(() => {
    const chatRef = ref(db, `chats/${myId}_${chatWith}`);
    const unsubscribe = onValue(chatRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const msgArray = Object.values(data).sort((a, b) => a.timestamp - b.timestamp);
        setMessages(msgArray);
      } else {
        setMessages([]);
      }
    });

    return () => unsubscribe();
  }, []);

  const handleSend = async (text) => {
    const chatRef = ref(db, `chats/${myId}_${chatWith}`);
    
    // 1. Simpan ke DB
    await push(chatRef, {
      sender: myId,
      text,
      timestamp: Date.now(),
    });

    // 2. Kirim Notifikasi ke API
    try {
      await fetch('/api/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: `Pesan dari ${myId}`,
          body: text,
          targetUserId: chatWith,
        }),
      });
    } catch (error) {
      console.error('Gagal kirim notifikasi:', error);
    }
  };

  return (
    <div className="p-4 max-w-2xl mx-auto font-sans">
      <h1 className="text-2xl font-bold mb-4">Chat: {chatWith}</h1>
      
      <div className="bg-gray-100 p-4 rounded-lg h-96 overflow-y-auto mb-4 space-y-3">
        {messages.map((msg, i) => (
          <div key={i} className={`p-3 rounded-lg ${
            msg.sender === myId ? 'bg-blue-100 ml-auto' : 'bg-white mr-auto'
          } max-w-[80%]`}>
            <p className="text-sm font-bold text-gray-600">{msg.sender}</p>
            <p className="text-gray-800">{msg.text}</p>
            <p className="text-xs text-gray-400 mt-1">
              {new Date(msg.timestamp).toLocaleTimeString()}
            </p>
          </div>
        ))}
      </div>

      <ChatInput onSend={handleSend} />
    </div>
  );
}
