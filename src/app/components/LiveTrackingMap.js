// "use client";
// import { useEffect, useState } from "react";
// import { MapContainer, TileLayer, Polyline, Marker } from "react-leaflet";
// import "leaflet/dist/leaflet.css";
// import { database, storage } from "../config/firebase"; // Pastikan Firebase Storage sudah dikonfigurasi
// import { ref as databaseRef, onValue, push, update } from "firebase/database";
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

// export default function LiveTrackingMap() {
//   const [positions, setPositions] = useState([]);
//   const [currentPosition, setCurrentPosition] = useState(null);

//   const fetchGpsLocation = async () => {
//     if (navigator.geolocation) {
//       navigator.geolocation.getCurrentPosition(async (position) => {
//         const latitude = position.coords.latitude;
//         const longitude = position.coords.longitude;
//         setCurrentPosition([latitude, longitude]);

//         const ipData = await fetchIpData();
//         const createdAt = new Date().toISOString();

//         // Simpan lokasi ke Firebase dengan IP, timestamp, dan createdAt
//         const newLocationRef = push(locationRef);
//         await update(newLocationRef, {
//           latitude,
//           longitude,
//           timestamp: createdAt,
//           createdAt,
//           device: deviceInfo,
//           deviceName: deviceName,
//           ip: ipData.ip || "Unknown",
//           city: ipData.city || "Unknown",
//           region: ipData.region || "Unknown",
//           country: ipData.country || "Unknown"
//         });
//       }, (error) => console.error(error), { enableHighAccuracy: true, maximumAge: 0, timeout: 5000 });
//     }
//   };

//   useEffect(() => {
//     fetchGpsLocation();
//     const unsubscribe = onValue(locationRef, (snapshot) => {
//       const data = snapshot.val();
//       if (data) {
//         const locations = Object.values(data).map(d => [d.latitude, d.longitude]);
//         setPositions(locations);
//       }
//     });
//     return () => unsubscribe();
//   }, []);

//   return (
//     <MapContainer center={currentPosition || [0, 0]} zoom={15} style={{ height: "100vh", width: "100%" }}>
//       <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
//       {positions.length > 0 && <Polyline positions={positions} color="blue" />}
//       {currentPosition && <Marker position={currentPosition} />}
//     </MapContainer>
//   );
// }
