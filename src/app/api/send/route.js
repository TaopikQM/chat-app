// src/app/api/send/route.js
export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { NextResponse } from 'next/server';
import admin from 'firebase-admin';

const ADMIN_APP_NAME = 'admin-app';

function getAdminMessaging() {
  let app = admin.apps.find(app => app.name === ADMIN_APP_NAME);

  if (app) {
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
    throw new Error('Service account JSON incomplete');
  }

  try {
    const app = admin.initializeApp(
      {
        credential: admin.credential.cert(serviceAccount),
        databaseURL: `https://${serviceAccount.project_id}.firebaseio.com`
      },
      ADMIN_APP_NAME
    );
    console.log('✅ Firebase Admin initialized with name:', ADMIN_APP_NAME);
    return admin.messaging(app);
  } catch (e) {
    throw new Error(`Admin init failed: ${e.message}`);
  }
}

export async function POST(request) {
  try {
    let messaging;
    try {
      messaging = getAdminMessaging();
    } catch (initError) {
      console.error('❌ Admin init error:', initError.message);
      return NextResponse.json(
        {
          message: 'Server config error',
          error: initError.message,
          envExists: !!process.env.FIREBASE_SERVICE_ACCOUNT,
          envLength: process.env.FIREBASE_SERVICE_ACCOUNT?.length || 0
        },
        { status: 500 }
      );
    }

    const { title, body, targetType, targetIds } = await request.json();

    if (!title || !body) {
      return NextResponse.json(
        { message: 'Title dan Body wajib diisi' },
        { status: 400 }
      );
    }

    // ✅ Gunakan Firebase Admin Database
    const admin_db = admin.database();

    let receivers = [];

    if (targetType === 'all') {
      const snapshot = await admin_db.ref('users').once('value');
      const data = snapshot.val();
      if (data) {
        receivers = Object.keys(data).filter(key => data[key].role === 'user');
      }
    } else if (targetType === 'specific' && Array.isArray(targetIds)) {
      receivers = targetIds;
    }

    if (receivers.length === 0) {
      return NextResponse.json(
        { message: 'Tidak ada penerima valid' },
        { status: 400 }
      );
    }

    let allTokens = [];
    for (const userId of receivers) {
      const snap = await admin_db.ref(`users/${userId}/fcm_tokens`).once('value');
      const tokens = snap.val();
      if (tokens && Array.isArray(tokens)) {
        tokens.forEach(token => {
          allTokens.push({ token, userId });
        });
      }
    }

    if (allTokens.length === 0) {
      return NextResponse.json(
        {
          message: 'Tidak ada token FCM valid',
          receivers: receivers.length
        },
        { status: 400 }
      );
    }

    const msgData = {
      title,
      content: body,
      senderId: 'api_system',
      timestamp: Date.now(),
      type: targetType
    };

    await Promise.all(
      receivers.map(rId =>
        admin_db.ref('messages').push({ ...msgData, receiverId: rId })
      )
    );

    const results = await Promise.allSettled(
      allTokens.map(({ token, userId }) =>
        messaging.send({
          token,
          notification: { title, body },
          data: {
            userId: userId,
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

    return NextResponse.json({
      message: 'Notifikasi diproses',
      receivers: receivers.length,
      tokensTotal: allTokens.length,
      pushSuccess: success,
      pushFailed: failed
    });

  } catch (error) {
    console.error('API Runtime Error:', error);
    return NextResponse.json(
      { message: 'Internal Server Error', error: error.message },
      { status: 500 }
    );
  }
}


// // src/app/api/send/route.js
// export const dynamic = 'force-dynamic'; // ✅ PENTING: Cegah eksekusi saat build

// import { NextResponse } from 'next/server';
// import admin from 'firebase-admin';
// import { getDatabase } from 'firebase-admin/database';
// import { ref, push, set, get } from 'firebase/database';
// import { db } from '../../lib/firebase';

// const ADMIN_APP_NAME = 'admin-app';

// function getAdminMessaging() {
//   let app = admin.apps.find(app => app.name === ADMIN_APP_NAME);

//   if (app) {
//     console.log('✅ Using existing Firebase Admin app:', ADMIN_APP_NAME);
//     return admin.messaging(app);
//   }

//   const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT;

//   if (!serviceAccountJson) {
//     throw new Error('FIREBASE_SERVICE_ACCOUNT env var is MISSING');
//   }

//   let serviceAccount;
//   try {
//     serviceAccount = JSON.parse(serviceAccountJson);
//   } catch (e) {
//     throw new Error(`Invalid JSON in FIREBASE_SERVICE_ACCOUNT: ${e.message}`);
//   }

//   if (!serviceAccount.private_key || !serviceAccount.client_email) {
//     throw new Error('Service account JSON incomplete');
//   }

//   try {
//     const app = admin.initializeApp(
//       {
//         credential: admin.credential.cert(serviceAccount),
//         databaseURL: `https://${serviceAccount.project_id}.firebaseio.com`
//       },
//       ADMIN_APP_NAME
//     );
//     console.log('✅ Firebase Admin initialized with name:', ADMIN_APP_NAME);
//     return admin.messaging(app);
//   } catch (e) {
//     throw new Error(`Admin init failed: ${e.message}`);
//   }
// }

// export async function POST(request) {
//   try {
//     let messaging;
//     try {
//       messaging = getAdminMessaging();
//     } catch (initError) {
//       console.error('❌ Admin init error:', initError.message);
//       return NextResponse.json(
//         {
//           message: 'Server config error',
//           error: initError.message,
//           envExists: !!process.env.FIREBASE_SERVICE_ACCOUNT,
//           envLength: process.env.FIREBASE_SERVICE_ACCOUNT?.length || 0
//         },
//         { status: 500 }
//       );
//     }

//     const { title, body, targetType, targetIds } = await request.json();

//     if (!title || !body) {
//       return NextResponse.json(
//         { message: 'Title dan Body wajib diisi' },
//         { status: 400 }
//       );
//     }

//     let receivers = [];

//     if (targetType === 'all') {
//       const snapshot = await get(ref(db, 'users'));
//       const data = snapshot.val();
//       if (data) {
//         receivers = Object.keys(data).filter(key => data[key].role === 'user');
//       }
//     } else if (targetType === 'specific' && Array.isArray(targetIds)) {
//       receivers = targetIds;
//     }

//     if (receivers.length === 0) {
//       return NextResponse.json(
//         { message: 'Tidak ada penerima valid' },
//         { status: 400 }
//       );
//     }

//     let allTokens = [];
//     for (const userId of receivers) {
//       const snap = await get(ref(db, `users/${userId}/fcm_tokens`));
//       const tokens = snap.val();
//       if (tokens && Array.isArray(tokens)) {
//         tokens.forEach(token => {
//           allTokens.push({ token, userId });
//         });
//       }
//     }

//     if (allTokens.length === 0) {
//       return NextResponse.json(
//         {
//           message: 'Tidak ada token FCM valid',
//           receivers: receivers.length
//         },
//         { status: 400 }
//       );
//     }

//     const msgData = {
//       title,
//       content: body,
//       senderId: 'api_system',
//       timestamp: Date.now(),
//       type: targetType
//     };

//     await Promise.all(
//       receivers.map(rId => {
//         const rRef = push(ref(db, 'messages'));
//         return set(rRef, { ...msgData, receiverId: rId });
//       })
//     );

//     const results = await Promise.allSettled(
//       allTokens.map(({ token, userId }) =>
//         messaging.send({
//           token,
//           notification: { title, body },
//           data: {
//             userId: userId,
//             click_action: `https://rivls.vercel.app/${userId}`
//           },
//           webpush: {
//             notification: { requireInteraction: true, icon: '/dolan.png' },
//             fcmOptions: { link: `https://rivls.vercel.app/${userId}` }
//           }
//         })
//       )
//     );

//     const success = results.filter(r => r.status === 'fulfilled').length;
//     const failed = results.filter(r => r.status === 'rejected').length;

//     return NextResponse.json({
//       message: 'Notifikasi diproses',
//       receivers: receivers.length,
//       tokensTotal: allTokens.length,
//       pushSuccess: success,
//       pushFailed: failed
//     });

//   } catch (error) {
//     console.error('API Runtime Error:', error);
//     return NextResponse.json(
//       { message: 'Internal Server Error', error: error.message },
//       { status: 500 }
//     );
//   }
// }



// // // pages/api/send-notification.js  KENAPA INI MASIH HGAGAL
// // export const dynamic = 'force-dynamic'; // ✅ PENTING: Cegah eksekusi saat build

// // import { NextResponse } from 'next/server';


// // import admin from 'firebase-admin';
// // import { db } from '../../../lib/firebase';
// // import { ref, push, set, get } from 'firebase/database';

// // // ✅ Gunakan nama khusus "admin-app" agar tidak bentrok dengan firebase client
// // const ADMIN_APP_NAME = 'admin-app';

// // function getAdminMessaging() {
// //   // Jika app admin sudah ada, kembalikan messaging-nya
// //  let app = admin.apps.find(app => app.name === ADMIN_APP_NAME);

// //   if (app) {
// //     // App sudah ada, gunakan yang ada
// //     console.log('✅ Using existing Firebase Admin app:', ADMIN_APP_NAME);
// //     return admin.messaging(app);
// //   }

// //   const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT;

// //   if (!serviceAccountJson) {
// //     throw new Error('FIREBASE_SERVICE_ACCOUNT env var is MISSING');
// //   }

// //   let serviceAccount;
// //   try {
// //     serviceAccount = JSON.parse(serviceAccountJson);
// //   } catch (e) {
// //     throw new Error(`Invalid JSON in FIREBASE_SERVICE_ACCOUNT: ${e.message}`);
// //   }

// //   if (!serviceAccount.private_key || !serviceAccount.client_email) {
// //     throw new Error('Service account JSON incomplete (missing private_key or client_email)');
// //   }

// //   try {
// //     const app = admin.initializeApp(
// //       {
// //         credential: admin.credential.cert(serviceAccount),
// //         databaseURL: `https://${serviceAccount.project_id}.firebaseio.com`
// //       },
// //       ADMIN_APP_NAME // ✅ Nama khusus di sini
// //     );
// //     console.log('✅ Firebase Admin initialized with name:', ADMIN_APP_NAME);
// //     return admin.messaging(app);
// //   } catch (e) {
// //     throw new Error(`Admin init failed: ${e.message}`);
// //   }
// // }

// // // export default async function handler(req, res) {
// // export async function POST(request) {
// // // if (req.method !== 'POST') {
// // //     return res.status(405).json({ message: 'Method Not Allowed' });
// // //   }
// //  try {
// //   // ✅ Inisialisasi dengan try-catch yang jelas
// //   let messaging;
// //   try {
// //     messaging = getAdminMessaging();
// //   } catch (initError) {
// //     console.error('❌ Admin init error:', initError.message);
// //     return res.status(500).json({
// //       message: 'Server config error',
// //       error: initError.message,
// //       envExists: !!process.env.FIREBASE_SERVICE_ACCOUNT,
// //       envLength: process.env.FIREBASE_SERVICE_ACCOUNT?.length || 0
// //     });
// //   }

// //   const { title, body, targetType, targetIds } = req.body;

// //   if (!title || !body) {
// //     return res.status(400).json({ message: 'Title dan Body wajib diisi' });
// //   }

// //   try {
// //     let receivers = [];

// //     if (targetType === 'all') {
// //       const snapshot = await get(ref(db, 'users'));
// //       const data = snapshot.val();
// //       if (data) {
// //         receivers = Object.keys(data).filter(key => data[key].role === 'user');
// //       }
// //     } else if (targetType === 'specific' && Array.isArray(targetIds)) {
// //       receivers = targetIds;
// //     }

// //     if (receivers.length === 0) {
// //       return res.status(400).json({ message: 'Tidak ada penerima valid' });
// //     }

// //     // Ambil semua token FCM
// //     let allTokens = [];
// //     for (const userId of receivers) {
// //       const snap = await get(ref(db, `users/${userId}/fcm_tokens`));
// //       const tokens = snap.val();
// //       if (tokens && Array.isArray(tokens)) {
// //         // allTokens.push(...tokens);
// //         tokens.forEach(token => {
// //             allTokens.push({ token, userId }); // ✅ Sekarang token terdefinisi
// //           });
// //       }
// //     }

// //     if (allTokens.length === 0) {
// //       return res.status(400).json({
// //         message: 'Tidak ada token FCM valid',
// //         receivers: receivers.length
// //       });
// //     }

// //     // Simpan ke RTDB
// //     const msgData = { title, content: body, senderId: 'api_system', timestamp: Date.now(), type: targetType };
// //     await Promise.all(
// //       receivers.map(rId => {
// //         const rRef = push(ref(db, 'messages'));
// //         return set(rRef, { ...msgData, receiverId: rId });
// //       })
// //     );

// //     // ✅ Kirim push menggunakan messaging instance yang benar
// //     const results = await Promise.allSettled(
// //       // allTokens.map(token =>
// //       allTokens.map(({ token, userId }) =>
// //         messaging.send({
// //           token,
// //           notification: { title, body },
// //           data: {
// //             userId: userId, // ✅ Simpan userId di data
// //             click_action: `https://rivls.vercel.app/${userId}`
// //           },
// //           webpush: {
// //             notification: { requireInteraction: true, icon: '/dolan.png' },
// //             fcmOptions: { link: `https://rivls.vercel.app/${userId}` }
// //           }
// //         })
// //       )
// //     );

// //     const success = results.filter(r => r.status === 'fulfilled').length;
// //     const failed = results.filter(r => r.status === 'rejected').length;

// //     res.status(200).json({
// //       message: 'Notifikasi diproses',
// //       receivers: receivers.length,
// //       tokensTotal: allTokens.length,
// //       pushSuccess: success,
// //       pushFailed: failed
// //     });

// //   } catch (error) {
// //     console.error('API Runtime Error:', error);
// //     res.status(500).json({ message: 'Internal Server Error', error: error.message });
// //   }
// // }
// // }
