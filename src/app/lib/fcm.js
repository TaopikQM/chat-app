

"use client";
// import { initFCM } from "@/lib/fcm";
// import { getMessaging, getToken } from "../config/firebase/messaging";
// import { initializeApp } from "firebase/app";
// import { app, database, getMessaging, getToken } from "../config/firebase";
// import { ref, set } from "firebase/database";

import { app, database } from "../config/firebase";
import { getMessaging, getToken } from "firebase/messaging";
import { ref, set } from "firebase/database";


export async function initFCM(userId) {
  try {
    // 🔥 cek browser support
    if (typeof window === "undefined") return;

    const messaging = getMessaging(app);

    // 🔥 minta izin notif
    const permission = await Notification.requestPermission();

    if (permission !== "granted") {
      console.log("❌ Notif tidak diizinkan");
      return;
    }

    // 🔥 ambil token
    const token = await getToken(messaging, {
      vapidKey: "BBiuf9a4Q4j75ggkXu-oSJ2ywJZhQL-D01V0V3RdOK4sQ449WDmXo11Km1MTTF5eioVgPg4B_SGhzhDWEhAW580",
    });

    if (!token) {
      console.log("❌ Token tidak didapat");
      return;
    }

    console.log("✅ FCM Token:", token);

    // 🔥 device ID unik
    let deviceId = localStorage.getItem("deviceId");
    if (!deviceId) {
      deviceId = crypto.randomUUID();
      localStorage.setItem("deviceId", deviceId);
    }

    // 🔥 simpan ke realtime database
    await set(ref(database, `usersDevices/${userId}/${deviceId}`), {
      fcmToken: token,
      notificationPermission: permission,
      isActive: true,
      onChatPage: true,
      lastSeen: Date.now(),
    });

    console.log("✔ Token disimpan ke Firebase");
  } catch (error) {
    console.error("❌ FCM ERROR:", error);
  }
}
