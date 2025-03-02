
"use client";
import { MapContainer, TileLayer, Polyline, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { useState, useEffect } from "react";
import { rtdb } from "../config/firebase";
import { ref, onValue } from "firebase/database";
import L from "leaflet";

// Path ikon marker dari public/
const customIcon = new L.Icon({
  iconUrl: "/assets/Icon/gridicons_location.svg", // Path dari public/
  iconSize: [32, 32], // Sesuaikan ukuran ikon
  iconAnchor: [16, 32], // Anchor agar ikon berada tepat di koordinat
  popupAnchor: [0, -32], // Posisi popup relatif terhadap ikon
});

// Komponen untuk auto-zoom ke titik terbaru
const AutoZoom = ({ locations }) => {
  const map = useMap();
  useEffect(() => {
    if (locations.length > 0) {
      const lastLocation = locations[locations.length - 1]; // Ambil titik terbaru
      map.flyTo([lastLocation.lat, lastLocation.lng], 15); // Zoom ke titik terbaru
    }
  }, [locations, map]);
  return null;
};

const MapView = () => {
  const [locations, setLocations] = useState([]);

  useEffect(() => {
    const messagesRef = ref(rtdb, "chatsBox/");
  
    onValue(messagesRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
  
        // Ambil lokasi dari setiap pesan dalam chatsBox
        const locArray = Object.values(data)
          .map((msg) => ({
            lat: msg.location?.latitude || 0,
            lng: msg.location?.longitude || 0,
          }))
          .filter((loc) => loc.lat !== 0 && loc.lng !== 0); // Hapus titik yang tidak valid
  
        console.log("Lokasi yang valid:", locArray);
        setLocations(locArray);
      } else {
        setLocations([]); // Kosongkan lokasi jika tidak ada data
      }
    });
  }, []);
  

  return (
    <MapContainer center={[-6.175, 106.8286]} zoom={20} style={{ height: "500px", width: "100%" }}>
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
      />

      {/* Auto-zoom ke titik terbaru */}
      <AutoZoom locations={locations} />

      {/* Menampilkan titik lokasi dengan ikon kustom */}
      {locations.map((pos, index) => (
        <Marker key={index} position={[pos.lat, pos.lng]} icon={customIcon}>
          <Popup>Latitude: {pos.lat}, Longitude: {pos.lng}</Popup>
        </Marker>
      ))}

      {/* Menampilkan garis rute */}
      {locations.length > 1 && <Polyline positions={locations} color="blue" />}
    </MapContainer>
  );
};

export default MapView;
