// pages/api/send-notification.js  KENAPA INI MASIH HGAGAL
export const dynamic = 'force-dynamic'; // ✅ PENTING: Cegah eksekusi saat build

import { NextResponse } from 'next/server';


import admin from 'firebase-admin';
import { db } from '../../../lib/firebase';
import { ref, push, set, get } from 'firebase/database';

// ✅ Gunakan nama khusus "admin-app" agar tidak bentrok dengan firebase client
const ADMIN_APP_NAME = 'admin-app';

function getAdminMessaging() {
  // Jika app admin sudah ada, kembalikan messaging-nya
 let app = admin.apps.find(app => app.name === ADMIN_APP_NAME);

  if (app) {
    // App sudah ada, gunakan yang ada
    console.log('✅ Using existing Firebase Admin app:', ADMIN_APP_NAME);
    return admin.messaging(app);
  }

  const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT;

  if (!serviceAccountJson) {
    throw new Error('FIREBASE_SERVICE_ACCOUNT env var is MISSING');
  }

  let serviceAccount;
  try {
    serviceAccount = JSON.parse(serviceAccountJson);
  } catch (e) {
    throw new Error(`Invalid JSON in FIREBASE_SERVICE_ACCOUNT: ${e.message}`);
  }

  if (!serviceAccount.private_key || !serviceAccount.client_email) {
    throw new Error('Service account JSON incomplete (missing private_key or client_email)');
  }

  try {
    const app = admin.initializeApp(
      {
        credential: admin.credential.cert(serviceAccount),
        databaseURL: `https://${serviceAccount.project_id}.firebaseio.com`
      },
      ADMIN_APP_NAME // ✅ Nama khusus di sini
    );
    console.log('✅ Firebase Admin initialized with name:', ADMIN_APP_NAME);
    return admin.messaging(app);
  } catch (e) {
    throw new Error(`Admin init failed: ${e.message}`);
  }
}

// export default async function handler(req, res) {
export async function POST(request) {
// if (req.method !== 'POST') {
//     return res.status(405).json({ message: 'Method Not Allowed' });
//   }
 try {
  // ✅ Inisialisasi dengan try-catch yang jelas
  let messaging;
  try {
    messaging = getAdminMessaging();
  } catch (initError) {
    console.error('❌ Admin init error:', initError.message);
    return res.status(500).json({
      message: 'Server config error',
      error: initError.message,
      envExists: !!process.env.FIREBASE_SERVICE_ACCOUNT,
      envLength: process.env.FIREBASE_SERVICE_ACCOUNT?.length || 0
    });
  }

  const { title, body, targetType, targetIds } = req.body;

  if (!title || !body) {
    return res.status(400).json({ message: 'Title dan Body wajib diisi' });
  }

  try {
    let receivers = [];

    if (targetType === 'all') {
      const snapshot = await get(ref(db, 'users'));
      const data = snapshot.val();
      if (data) {
        receivers = Object.keys(data).filter(key => data[key].role === 'user');
      }
    } else if (targetType === 'specific' && Array.isArray(targetIds)) {
      receivers = targetIds;
    }

    if (receivers.length === 0) {
      return res.status(400).json({ message: 'Tidak ada penerima valid' });
    }

    // Ambil semua token FCM
    let allTokens = [];
    for (const userId of receivers) {
      const snap = await get(ref(db, `users/${userId}/fcm_tokens`));
      const tokens = snap.val();
      if (tokens && Array.isArray(tokens)) {
        // allTokens.push(...tokens);
        tokens.forEach(token => {
            allTokens.push({ token, userId }); // ✅ Sekarang token terdefinisi
          });
      }
    }

    if (allTokens.length === 0) {
      return res.status(400).json({
        message: 'Tidak ada token FCM valid',
        receivers: receivers.length
      });
    }

    // Simpan ke RTDB
    const msgData = { title, content: body, senderId: 'api_system', timestamp: Date.now(), type: targetType };
    await Promise.all(
      receivers.map(rId => {
        const rRef = push(ref(db, 'messages'));
        return set(rRef, { ...msgData, receiverId: rId });
      })
    );

    // ✅ Kirim push menggunakan messaging instance yang benar
    const results = await Promise.allSettled(
      // allTokens.map(token =>
      allTokens.map(({ token, userId }) =>
        messaging.send({
          token,
          notification: { title, body },
          data: {
            userId: userId, // ✅ Simpan userId di data
            click_action: `https://rivls.vercel.app/${userId}`
          },
          webpush: {
            notification: { requireInteraction: true, icon: '/dolan.png' },
            fcmOptions: { link: `https://rivls.vercel.app/${userId}` }
          }
        })
      )
    );

    const success = results.filter(r => r.status === 'fulfilled').length;
    const failed = results.filter(r => r.status === 'rejected').length;

    res.status(200).json({
      message: 'Notifikasi diproses',
      receivers: receivers.length,
      tokensTotal: allTokens.length,
      pushSuccess: success,
      pushFailed: failed
    });

  } catch (error) {
    console.error('API Runtime Error:', error);
    res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
}
}
