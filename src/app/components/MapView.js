"use client";
import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Polyline, Marker } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { database } from "../config/firebase";
import { ref as databaseRef, onValue } from "firebase/database";
import LiveTracking from "./LiveTracking"; // Import komponen pengiriman data

const deviceId = "your_device_id"; // Bisa diganti dengan cara lebih dinamis
const locationRef = databaseRef(database, `locations/${deviceId}`);

export default function MapView() {
  const [positions, setPositions] = useState([]);
  const [currentPosition, setCurrentPosition] = useState(null);

  useEffect(() => {
    const unsubscribe = onValue(locationRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const locations = Object.values(data).map(d => [d.latitude, d.longitude]);
        setPositions(locations);
        setCurrentPosition(locations[locations.length - 1]);
      }
    });

    return () => unsubscribe();
  }, []);

  return (
    <>
      <LiveTracking /> {/* Menjalankan pengiriman data di latar belakang */}
      <MapContainer center={currentPosition || [0, 0]} zoom={15} style={{ height: "100vh", width: "100%" }}>
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        {positions.length > 0 && <Polyline positions={positions} color="blue" />}
        {currentPosition && <Marker position={currentPosition} />}
      </MapContainer>
    </>
  );
}
