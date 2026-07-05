import { NextResponse } from 'next/server';
import webpush from 'web-push';
import {  ref as databaseRef, get, update } from "firebase/database";
import { database } from "../../config/firebase";
// import { ref, uploadString, getDownloadURL } from "firebase/storage";
// import { storage, storageBackup } from "../../config/firebase"; // sesuaikan path
// import { getDatabase,  ref as databaseRef, push, set } from "firebase/database";
// import { ref as storageRef, uploadString, getDownloadURL } from "firebase/storage";
// import { storage, storageBackup,database , storageBackup1, storageapotek1, storageuas13256,  storageuas_firebase_a0256, storageproa112113270} from "../../config/firebase"; // sesuaikan path



// Setup VAPID
webpush.setVapidDetails(
  'mailto:kuludin52023@gmail.com', // Ganti dengan email Anda
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
  process.env.VAPID_PRIVATE_KEY
);

export async function POST(request) {
  try {
    const { toUserId, title, body, url } = await request.json();

    if (!toUserId) {
      return NextResponse.json({ error: "User ID penerima diperlukan" }, { status: 400 });
    }

    // 1. Ambil SEMUA device tokens yang terdaftar untuk user ini
    const tokensRef = ref(databaseRef, `notifdevice/${toUserId}/tokens`);
    const snapshot = await get(tokensRef);

    if (!snapshot.exists()) {
      console.log(`⚠️ User ${toUserId} tidak memiliki device terdaftar.`);
      return NextResponse.json({ success: true, message: "Tidak ada device aktif" });
    }

    const devices = snapshot.val();
    const sendPromises = [];
    let successCount = 0;

    // 2. Loop setiap device dan kirim notifikasi
    Object.keys(devices).forEach((deviceId) => {
      const device = devices[deviceId];
      
      if (device && device.token) {
        const payload = JSON.stringify({
          title: title || "Pesan Baru",
          body: body || "Anda memiliki pesan baru.",
          icon: "assets/dolan.png", // Pastikan ada icon di public
          badge: "assets/dolan.png",
          data: { 
            url: url || `/${toUserId}`, // Ganti URL sesuai routing Anda
            chatId: toUserId 
          }
        });

        const promise = webpush.sendNotification(device.token, payload)
          .then(() => {
            successCount++;
            // Update last_active
            return update(databaseRef(database, `notifdevice/${toUserId}/tokens/${deviceId}`), {
              last_active: Date.now()
            });
          })
          .catch((err) => {
            console.error(`❌ Gagal kirim ke device ${deviceId}:`, err.message);
            // Jika token expired (410) atau not found (404), tandai tidak aktif
            if (err.statusCode === 410 || err.statusCode === 404) {
              return update(databaseRef(database, `notifdevice/${toUserId}/tokens/${deviceId}`), {
                is_active: false,
                error: "Token expired"
              });
            }
          });
        
        sendPromises.push(promise);
      }
    });

    await Promise.allSettled(sendPromises);

    return NextResponse.json({ 
      success: true, 
      sent: successCount, 
      total: Object.keys(devices).length 
    });

  } catch (error) {
    console.error("❌ Error sending notifications:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
