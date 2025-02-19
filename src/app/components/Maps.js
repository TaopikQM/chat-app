"use client"; // Pastikan ini ada agar berjalan di client

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { database } from "../config/firebase";
import { ref as databaseRef, onValue } from "firebase/database";
import "leaflet/dist/leaflet.css";

// Load komponen Leaflet secara dinamis untuk menghindari error SSR
const MapContainer = dynamic(() => import("react-leaflet").then(mod => mod.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import("react-leaflet").then(mod => mod.TileLayer), { ssr: false });
const Polyline = dynamic(() => import("react-leaflet").then(mod => mod.Polyline), { ssr: false });
const Marker = dynamic(() => import("react-leaflet").then(mod => mod.Marker), { ssr: false });

const deviceId = "your_device_id"; // Ganti sesuai kebutuhan
const locationRef = databaseRef(database, `locations/${deviceId}`);

export default function Maps() {
  const [positions, setPositions] = useState([]);
  const [currentPosition, setCurrentPosition] = useState(null);

  useEffect(() => {
    if (typeof window === "undefined") return; // Mencegah error SSR

    const unsubscribe = onValue(locationRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const locations = Object.values(data).map(d => [d.latitude, d.longitude]);
        setPositions(locations);
        setCurrentPosition(locations[locations.length - 1]); // Ambil lokasi terbaru
      }
    });

    return () => unsubscribe();
  }, []);

  return (
    <MapContainer center={currentPosition || [0, 0]} zoom={15} style={{ height: "100vh", width: "100%" }}>
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      {positions.length > 0 && <Polyline positions={positions} color="blue" />}
      {currentPosition && <Marker position={currentPosition} />}
    </MapContainer>
  );
}
