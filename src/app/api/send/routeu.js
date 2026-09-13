import webpush from "web-push";
import { subscribers } from "../subscribe/route";

webpush.setVapidDetails(
  "mailto:test@test.com",
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY_B,
  process.env.VAPID_PRIVATE_KEY_B

);

export async function POST() {
  const payload = JSON.stringify({
    title: "🔥 Notifikasi Baru",
    body: "Pesan masuk / event terjadi!",
  });

  await Promise.all(
    subscribers.map((sub) =>
      webpush.sendNotification(sub, payload).catch((err) => {
        console.error("Push error:", err.message);
      })
    )
  );

  return Response.json({ success: true });
}
