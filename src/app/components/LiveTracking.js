// "use client";
// import { useEffect } from "react";
// import { database } from "../config/firebase";
// import { ref as databaseRef, push, update } from "firebase/database";
// import UAParser from "ua-parser-js";

// const deviceInfo = new UAParser().getResult();
// const deviceName = `${deviceInfo.device.vendor || "Unknown"} ${deviceInfo.device.model || "Unknown"}`.trim();
// const deviceId = `${deviceName}-${deviceInfo.os.name || "Unknown"}`.replace(/\s+/g, "_");
// const locationRef = databaseRef(database, `locations/${deviceId}`);

// const fetchIpData = async () => {
//   try {
//     const response = await fetch("https://ipapi.co/json/");
//     return response.ok ? await response.json() : {};
//   } catch (error) {
//     console.error("Error fetching IP data:", error);
//     return {};
//   }
// };

// const fetchGpsLocation = async () => {
//   if (navigator.geolocation) {
//     navigator.geolocation.getCurrentPosition(async (position) => {
//       const latitude = position.coords.latitude;
//       const longitude = position.coords.longitude;
//       const ipData = await fetchIpData();
//       const createdAt = new Date().toISOString();

//       // Simpan lokasi ke Firebase
//       const newLocationRef = push(locationRef);
//       await update(newLocationRef, {
//         latitude,
//         longitude,
//         timestamp: createdAt,
//         createdAt,
//         device: deviceInfo,
//         deviceName,
//         ip: ipData.ip || "Unknown",
//         city: ipData.city || "Unknown",
//         region: ipData.region || "Unknown",
//         country: ipData.country || "Unknown"
//       });
//     }, (error) => console.error(error), { enableHighAccuracy: true, maximumAge: 0, timeout: 5000 });
//   }
// };

// export default function LiveTracking() {
//   useEffect(() => {
//     const interval = setInterval(() => {
//       fetchGpsLocation();
//     }, 5000); // Mengirim lokasi setiap 5 detik

//     return () => clearInterval(interval);
//   }, []);

//   return null; // Komponen ini hanya berjalan di latar belakang
// }
