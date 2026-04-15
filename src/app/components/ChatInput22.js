"use client";

import { useState } from "react";
import { database } from "../config/firebase";
import { ref, push, get } from "firebase/database";

export default function ChatInput({ currentUser, chatWith }) {
  const [text, setText] = useState("");

  const sendMessage = async () => {
    if (!text) return;

    // simpan chat
    await push(ref(database, "chats"), {
      from: currentUser,
      to: chatWith,
      text,
      createdAt: Date.now(),
      timestamp: Date.now(),
      status: "sent",
    });

    // ambil token lawan
    const snap = await get(ref(database, `usersDevices/${chatWith}`));
    const data = snap.val();

    if (!data) return;

    const tokens = Object.values(data).map((d) => d.token);

    // kirim notif
    await fetch("/api/send-notif22", {
      method: "POST",
      body: JSON.stringify({
        tokens,
        title: `Pesan dari ${currentUser}`,
        body: text,
      }),
    });

    setText("");
  };

  return (
    <div style={{ display: "flex", gap: 10 }}>
      <input
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Ketik..."
      />
      <button onClick={sendMessage}>Kirim</button>
    </div>
  );
}
