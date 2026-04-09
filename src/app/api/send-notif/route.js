import admin from "firebase-admin";

if (!admin.apps.length) {
  const serviceAccount = JSON.parse(
    
    process.env.FIREBASE_SERVICE_ACCOUNT
  );

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: process.env.NEXT_PUBLIC_DOLANREKID_DATABASE_URL,
  });
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { toUserId, title, body } = req.body;

    if (!toUserId) {
      return res.status(400).json({ error: "toUserId wajib" });
    }

    // 🔥 ambil semua device user tujuan
    const snapshot = await admin
      .database()
      .ref(`usersDevices/${toUserId}`)
      .once("value");

    const devices = snapshot.val();

    if (!devices) {
      return res.status(200).json({
        success: false,
        message: "Tidak ada device",
      });
    }

    // 🔥 filter token
    const tokens = Object.values(devices)
      .filter(
        (d) =>
          d.notificationPermission === "granted" &&
          d.isActive === true &&
          d.onChatPage !== true
      )
      .map((d) => d.fcmToken);

    if (tokens.length === 0) {
      return res.status(200).json({
        success: false,
        message: "Tidak ada token aktif",
      });
    }

    // 🔥 kirim notif
    const response = await admin.messaging().sendEachForMulticast({
      notification: {
        title,
        body,
      },
      tokens,
    });

    // 🔥 hapus token mati
    const deviceEntries = Object.entries(devices);

    response.responses.forEach((resItem, idx) => {
      if (!resItem.success) {
        const err = resItem.error;

        if (
          err.code === "messaging/registration-token-not-registered"
        ) {
          const badToken = tokens[idx];

          deviceEntries.forEach(([deviceId, data]) => {
            if (data.fcmToken === badToken) {
              admin
                .database()
                .ref(`usersDevices/${toUserId}/${deviceId}`)
                .remove();
            }
          });
        }
      }
    });

    return res.status(200).json({
      success: true,
      total: tokens.length,
      successCount: response.successCount,
      failureCount: response.failureCount,
    });
  } catch (error) {
    console.error("❌ SEND NOTIF ERROR:", error);
    return res.status(500).json({
      error: error.message,
    });
  }
}
