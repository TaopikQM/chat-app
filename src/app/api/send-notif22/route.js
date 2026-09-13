// // // export default async function handler(req, res) {
// // //     try {
// // //       const response = await fetch("https://web-api.nordvpn.com/v1/ips/info");
// // //       const data = await response.json();
  
// // //       // Set header agar bisa diakses dari frontend
// // //       res.setHeader("Access-Control-Allow-Origin", "*");
// // //       res.status(200).json(data);
// // //     } catch (error) {
// // //       res.status(500).json({ error: "Failed to fetch IP data" });
// // //     }
// // //   }
  
// // File: src/app/api/ip/route.js
// export async function GET() {
//   try {
//     const response = await fetch("https://web-api.nordvpn.com/v1/ips/info");
//     const data = await response.json();

//     return new Response(JSON.stringify(data), {
//       status: 200,
//       headers: {
//         "Content-Type": "application/json",
//         "Access-Control-Allow-Origin": "*",
//       },
//     });
//   } catch (error) {
//     return new Response(JSON.stringify({ error: "Failed to fetch IP data" }), {
//       status: 500,
//     });
//   }
// }





// import { NextResponse } from "next/server";

// export async function POST(req) {
//   const { tokens, title, body } = await req.json();

//   // const serverKey = "ISI_SERVER_KEY_FIREBASE";
//   const serverKey = "BBiuf9a4Q4j75ggkXu-oSJ2ywJZhQL-D01V0V3RdOK4sQ449WDmXo11Km1MTTF5eioVgPg4B_SGhzhDWEhAW580ISI_SERVER_KEY_FIREBASE";

//   try {
//     await fetch("https://fcm.googleapis.com/fcm/send", {
//       method: "POST",
//       headers: {
//         Authorization: `key=${serverKey}`,
//         "Content-Type": "application/json",
//       },
//       body: JSON.stringify({
//         registration_ids: tokens,
//         notification: {
//           title,
//           body,
//         },
//       }),
//     });

//     return NextResponse.json({ success: true });
//   } catch (err) {
//     return NextResponse.json({ error: err });
//   }
// }








// import { NextResponse } from "next/server";
// import admin from "firebase-admin";

// if (!admin.apps.length) {
//   admin.initializeApp({
//     credential: admin.credential.cert({
//       projectId: process.env.FB_PROJECT_ID,
//       clientEmail: process.env.FB_CLIENT_EMAIL,
//       privateKey: process.env.FB_PRIVATE_KEY.replace(/\\n/g, "\n"),
//     }),
//   });
// }

// export async function POST(req) {
//   const { tokens, title, body } = await req.json();

//   try {
//     await admin.messaging().sendEachForMulticast({
//       tokens,
//       notification: {
//         title,
//         body,
//       },
//     });

//     return NextResponse.json({ success: true });
//   } catch (err) {
//     console.error(err);
//     return NextResponse.json({ error: err });
//   }
// }
