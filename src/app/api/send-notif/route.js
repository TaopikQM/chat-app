import admin from "firebase-admin";

if (!admin.apps.length) {
  const serviceAccount = JSON.parse(
    "type": "service_account",
  "project_id": "dolanrekid",
  "private_key_id": "25026908f46384d41b0e55d63a86b49fbc3df795",
  "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQDwmEU++tcnZDVr\nm4rvSPs9pD8tAEbdXiVvmk1MQrnCwgiTx4Xd7rlY5WuGe3TZd9G/r9RelQ+t6+Ys\n2GqwvK6l57mgckTi0RTz7aYaq+wZL518bSJXKvlUUSNayZC9GmqJ+pfik/qeXw2n\naJwJMEM1zl8UqoEDAyrAR5fAn4gWM95TGbhme6dKmSi4Sc9Nad3XuMz/dJJFU3a+\neN1Z//HWlrqQYSGAekWAI528rpvjhswlPlE7CmqKGjz63HlBlfOHUOSGyA0BH+Cw\n63L+iFAQaNNq/t7V7d+U2xLXPbDp38AgnJC/Tft7WspD/m85xxGTZW79KZOHNd4S\nY1/rY+HrAgMBAAECggEAGTHo9npwM4jT60vjlcFPxhnAH+dKhH4Kb5B6DcVjDJkj\nKs6XHzGTqVKFGxUsnGVmyqsQE0OK28y7UvDq400vAOKuVrYArrv0dMLrRRnB5LVO\nyavoD7bJW2IP0L8Q8CynAYIDi8+xTApqNKDIzlGGiEjvPgvI7NbVEEOvCZXrO1/J\nKJCiOcSrc9V/QnNntF5k6au2lsulaIJhG3bvAMi04b9jNtuBoA7itvhQmMHbPaXa\n3SDEtMwBRpxNhdzU+lgFLerGp9aPmpoP9fagMMcG5by1eNUPcXzyW2S+93Sxr3YJ\nqk2UDwuyveVhhZ0J60GcQF1rVyaWlnbDk/+7FeAaWQKBgQD8yuh2tIUcWd4gxHjT\n8nZ76B/pPgpDJNug3+T6rQHXnWZapVrvwG89cp0wE6SHygfEIIA4/hust/XTs25a\nRdDE1X4ksIPIKFyHorYvbYnWGVXgR9cTji1mXfFU3HuqKF1ANwe2t/nGsY4oQiTL\n4LdgvHxmjS/hYFRBeDG9Xim4HQKBgQDzpb4we/RVbmawXtjFpkvGy/NyrQCp6a4f\nlT3QQmVT/IbXRgzacZQ8GAF2+6UtmFFRZCLaJbRcqjVEO4SLj77IyhIj9/EbgriV\nhS2JasB+VpSaFBpkfoh9YSv54M8KEeeehjOExYA62KQIgwqh4dN3nrWRYxvpPoRu\nW3qE1kszpwKBgCid6Y/5HVIa1mfpaYiUcpkiCM6PG1MCfw9wKfhlB+C+940k+GGB\nR95Vpg/teAghW/IVTsTZf1TXEfZ75AU5JnwZ2XTHr8TfR067xA4GyZjO5U9t+462\nz3CdM4NxEaWbarBAp0qicM2OBctOJV9ksdInNs27bbAGrEMAru1ATe+5AoGAYOyj\nTzhQR5gGo8znYSE5bdj+fLUT2YQLb6b4ExwGoTWJEqRcQp4CQTGvi3yqBgxc9Qrn\nzm5HZMGVNRKUNMy3MbspIkPlF3OWKGz1Y4AjGV8p+G1c3nNzqqT4UIw88J2UzXxH\njF7hFwfNoVE37pQegqyRQEfz94KWPiyH/cYd3msCgYEAlbSyBsJMbCzWRadxWMx5\ndSjOBsz0hNOhyiIapAaP1C6zNf6CVPp2aezKSxRA1G/zMo6sS6RrMqsXKt0KNtWr\n8V16rGpXeYebqhh6oP15CdhGXG5DLWsaRQoPTPG1d+uBOtM0Gsk/+vSU/fQGh9b6\noISJU7s46dKf0XiMHOm8Q/o=\n-----END PRIVATE KEY-----\n",
  "client_email": "firebase-adminsdk-d2tib@dolanrekid.iam.gserviceaccount.com",
  "client_id": "118050311201905272286",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-d2tib%40dolanrekid.iam.gserviceaccount.com",
  "universe_domain": "googleapis.com"
    // process.env.FIREBASE_SERVICE_ACCOUNT
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
