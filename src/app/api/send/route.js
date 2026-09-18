// import { NextResponse } from 'next/server';
// import admin from 'firebase-admin';

// // Inisialisasi Admin SDK (Singleton)
// const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);

// if (!admin.apps.length) {
//   admin.initializeApp({
//     credential: admin.credential.cert(serviceAccount),
//     databaseURL: `https://${serviceAccount.project_id}.firebaseio.com`,
//   });
// }

// export async function POST(request) {
//   try {
//     const { title, body, targetUserId } = await request.json();

//     // Cek apakah targetUserId ada di DB
//     const db = admin.database();
//     const snapshot = await db.ref(`users/${targetUserId}/fcm_tokens`).once('value');
//     const tokens = snapshot.val() || [];

//     if (tokens.length === 0) {
//       return NextResponse.json(
//         { message: 'User tidak memiliki token FCM' },
//         { status: 400 }
//       );
//     }

//     // Kirim notifikasi ke semua token
//     const messaging = admin.messaging();
//     const result = await messaging.sendEachForMulticast({
//       tokens,
//       notification: { title, body },
//       webpush: {
//         notification: {
//           requireInteraction: true,
//           icon: '/dolan.png'
//         }
//       }
//     });

//     return NextResponse.json({
//       message: 'Notifikasi terkirim',
//       successCount: result.successCount,
//       failureCount: result.failureCount,
//     });

//   } catch (error) {
//     console.error('API Error:', error);
//     return NextResponse.json(
//       { error: error.message },
//       { status: 500 }
//     );
//   }
// }
