"use client";

import { useEffect } from "react";
import { initFCM } from "../lib/fcm";
import ChatInput from "../components/ChatInput22";
import ChatList from "../components/ChatList22";

export default function Page() {
  const currentUser = "user22";
  const chatWith = "user11";

  useEffect(() => {
    initFCM(currentUser);
  }, [currentUser]);

  return (
    <div>
      <h1>User2 Chat</h1>
      <ChatList currentUser={currentUser} chatWith={chatWith} />
      <ChatInput currentUser={currentUser} chatWith={chatWith} />
    </div>
  );
}
