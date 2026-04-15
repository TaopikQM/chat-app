"use client";

import { useEffect, useState } from "react";
import { database } from "../config/firebase";
import { ref, onValue, update } from "firebase/database";

export default function ChatList({ currentUser, chatWith }) {
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    const chatRef = ref(database, "chats");

    onValue(chatRef, (snap) => {
      const data = snap.val();
      if (!data) return;

      // const arr = Object.values(data).filter(
      //   (m) =>
      //     (m.from === currentUser && m.to === chatWith) ||
      //     (m.from === chatWith && m.to === currentUser)
      // );

       const arr = [];

        Object.entries(data).forEach(([key, m]) => {
          if (
            (m.from === currentUser && m.to === chatWith) ||
            (m.from === chatWith && m.to === currentUser)
          ) {
            arr.push({ id: key, ...m });

            // 🔥 1. AUTO DELIVERED
            if (m.to === currentUser && m.status === "sent") {
              update(ref(database, `chats/${key}`), {
                status: "delivered",
              });
            }

            // 🔥 2. AUTO READ (saat halaman kebuka)
            if (m.to === currentUser && m.status === "delivered") {
              update(ref(database, `chats/${key}`), {
                status: "read",
              });
            }
          }
        });

      // sort biar rapi
      arr.sort((a, b) => a.timestamp - b.timestamp);


      setMessages(arr);
    });
  }, [currentUser, chatWith]);

  return (
    <div>
      {messages.map((m, i) => (
        <div key={i}>
          <b>{m.from}</b>: {m.text}

           {/* 🔥 STATUS */}
          {m.from === currentUser && (
            <span style={{ marginLeft: 8, fontSize: 12 }}>
              {m.status === "sent" && "✔"}
              {m.status === "delivered" && "✔✔"}
              {m.status === "read" && "✔✔ (dibaca)"}
            </span>
          )}
        </div>
      ))}
    </div>
  );
}





// "use client";

// import { useState } from "react";
// import { database } from "../config/firebase";
// import { ref, push, get } from "firebase/database";

// export default function ChatInput({ currentUser, chatWith }) {
//   const [text, setText] = useState("");

//   const sendMessage = async () => {
//     if (!text) return;

//     // simpan chat
//     await push(ref(database, "chats"), {
//       from: currentUser,
//       to: chatWith,
//       text,
//       createdAt: Date.now(),
//     });

//     // ambil token lawan
//     const snap = await get(ref(database, `usersDevices/${chatWith}`));
//     const data = snap.val();

//     if (!data) return;

//     const tokens = Object.values(data).map((d) => d.token);

//     // kirim notif
//     await fetch("/api/send-notif", {
//       method: "POST",
//       body: JSON.stringify({
//         tokens,
//         title: `Pesan dari ${currentUser}`,
//         body: text,
//       }),
//     });

//     setText("");
//   };

//   return (
//     <div style={{ display: "flex", gap: 10 }}>
//       <input
//         value={text}
//         onChange={(e) => setText(e.target.value)}
//         placeholder="Ketik..."
//       />
//       <button onClick={sendMessage}>Kirim</button>
//     </div>
//   );
// }