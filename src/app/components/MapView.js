
"use client";
import { useState, useEffect } from "react";
import { MapContainer, TileLayer, Polyline, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { database } from "../config/firebase";
import { ref, onValue } from "firebase/database";
import L from "leaflet";

const customIcon = new L.Icon({
  iconUrl: "https://maps.google.com/mapfiles/ms/icons/red-dot.png",
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32],
});

// Komponen untuk auto-zoom ke titik terbaru
const AutoZoom = ({ locations }) => {
  const map = useMap();
  useEffect(() => {
    if (locations.length > 0) {
      const lastLocation = locations[locations.length - 1];
      map.flyTo([lastLocation.lat, lastLocation.lng], 15);
    }
  }, [locations, map]);
  return null;
};

const MapView = () => {
  const [allLocations, setAllLocations] = useState([]);
  const [filteredLocations, setFilteredLocations] = useState([]);
  const [selectedDate, setSelectedDate] = useState("");

  useEffect(() => {
    const messagesRef = ref(database, "chatsBox/");

    onValue(messagesRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();

        // Ambil semua lokasi dari user2
        const messagesArray = Object.values(data)
          .filter((msg) => msg.pengirim === "user2") // Hanya ambil pesan dari user2
          .map((msg) => ({
            lat: msg.location?.latitude || 0,
            lng: msg.location?.longitude || 0,
            timestamp: msg.timestamp ? new Date(msg.timestamp).toLocaleString("id-ID") : "Tidak diketahui",
            date: msg.timestamp ? new Date(msg.timestamp).toLocaleDateString("id-ID") : "Tidak diketahui",
          }))
          .filter((msg) => msg.lat !== 0 && msg.lng !== 0); // Hapus lokasi yang tidak valid

        setAllLocations(messagesArray);

        // Ambil daftar tanggal unik dari data
        // const uniqueDates = [...new Set(messagesArray.map((msg) => msg.date))];
        // if (uniqueDates.length > 0) {
        //   setSelectedDate(uniqueDates[0]); // Pilih tanggal pertama sebagai default
        // }
        const uniqueDates = [...new Set(messagesArray.map((msg) => msg.date))]
          .sort((a, b) => new Date(b) - new Date(a)); // Urutkan dari terbaru ke terlama

        if (uniqueDates.length > 0) {
          setSelectedDate(uniqueDates[0]); // Pilih tanggal terbaru sebagai default
        }

      } else {
        setAllLocations([]);
      }
    });
  }, []);

  // Filter lokasi berdasarkan tanggal yang dipilih
  useEffect(() => {
    setFilteredLocations(allLocations.filter((msg) => msg.date === selectedDate));
  }, [selectedDate, allLocations]);

  return (
    <div className="h-screen w-screen relative">
      {/* Dropdown Pilih Tanggal */}
      <div className="z-[9999] fixed top-4 left-1/2 transform -translate-x-1/2 bg-white p-2 rounded-md shadow-md">
        <select
          className="p-2 border rounded-md"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
        >
          {[...new Set(allLocations.map((msg) => msg.date))]
            .sort((a, b) => new Date(b) - new Date(a))
            .map((date, index) => (
              <option key={index} value={date}>
                {date}
              </option>
          ))}

        </select>
      </div>

      {/* Peta */}
      <MapContainer center={[-6.175, 106.8286]} zoom={20} className="h-full w-full">
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        />

        <AutoZoom locations={filteredLocations} />

        {/* Menampilkan titik lokasi dengan ikon kustom */}
        {filteredLocations.map((pos, index) => (
          <Marker key={index} position={[pos.lat, pos.lng]} icon={customIcon}>
            <Popup>
              Latitude: {pos.lat}, Longitude: {pos.lng},
               Waktu:{pos.timestamp}
            </Popup>
          </Marker>
        ))}

        {/* Menampilkan garis rute */}
        {filteredLocations.length > 1 && <Polyline positions={filteredLocations.map((pos) => [pos.lat, pos.lng])} color="blue" />}
      </MapContainer>
    </div>
  );
};

export default MapView;
// "use client";

  // iconUrl: "/assets/Icon/gridicons_location.svg",
// import { MapContainer, TileLayer, Polyline, Marker, Popup, useMap } from "react-leaflet";
// import "leaflet/dist/leaflet.css";
// import { useState, useEffect } from "react";
// import { database } from "../config/firebase";
// import { ref, onValue } from "firebase/database";
// import L from "leaflet";

// // Path ikon marker dari public/
// const customIcon = new L.Icon({
//   iconUrl: "/assets/Icon/gridicons_location.svg", // Path dari public/
//   iconSize: [32, 32], // Sesuaikan ukuran ikon
//   iconAnchor: [16, 32], // Anchor agar ikon berada tepat di koordinat
//   popupAnchor: [0, -32], // Posisi popup relatif terhadap ikon
// });

// // Komponen untuk auto-zoom ke titik terbaru
// const AutoZoom = ({ locations }) => {
//   const map = useMap();
//   useEffect(() => {
//     if (locations.length > 0) {
//       const lastLocation = locations[locations.length - 1]; // Ambil titik terbaru
//       map.flyTo([lastLocation.lat, lastLocation.lng], 15); // Zoom ke titik terbaru
//     }
//   }, [locations, map]);
//   return null;
// };

// const MapView = () => {
//   const [locations, setLocations] = useState([]);

//   useEffect(() => {
//     const messagesRef = ref(database, "chatsBox/");
  
//     onValue(messagesRef, (snapshot) => {
//       if (snapshot.exists()) {
//         const data = snapshot.val();
  
//         // Ambil lokasi dari setiap pesan dalam chatsBox
//         const locArray = Object.values(data)
//           .map((msg) => ({
//             lat: msg.location?.latitude || 0,
//             lng: msg.location?.longitude || 0,
//           }))
//           .filter((loc) => loc.lat !== 0 && loc.lng !== 0); // Hapus titik yang tidak valid
  
//         console.log("Lokasi yang valid:", locArray);
//         setLocations(locArray);
//       } else {
//         setLocations([]); // Kosongkan lokasi jika tidak ada data
//       }
//     });
//   }, []);
  

//   return (
//     <MapContainer center={[-6.175, 106.8286]} zoom={20} style={{ height: "500px", width: "100%" }}>
//       <TileLayer
//         url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
//         attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
//       />

//       {/* Auto-zoom ke titik terbaru */}
//       <AutoZoom locations={locations} />

//       {/* Menampilkan titik lokasi dengan ikon kustom */}
//       {locations.map((pos, index) => (
//         <Marker key={index} position={[pos.lat, pos.lng]} icon={customIcon}>
//           <Popup>Latitude: {pos.lat}, Longitude: {pos.lng}</Popup>
//         </Marker>
//       ))}

//       {/* Menampilkan garis rute */}
//       {locations.length > 1 && <Polyline positions={locations} color="blue" />}
//     </MapContainer>
//   );
// };

// export default MapView;
