"use client"
import { useState, useEffect } from 'react';

const calculateAzimuth = (lat1, lon1, lat2, lon2) => {
  const toRad = (angle) => angle * (Math.PI / 180);
  const toDeg = (rad) => rad * (180 / Math.PI);

  const dLon = toRad(lon2 - lon1);
  const lat1Rad = toRad(lat1);
  const lat2Rad = toRad(lat2);

  const y = Math.sin(dLon) * Math.cos(lat2Rad);
  const x =
    Math.cos(lat1Rad) * Math.sin(lat2Rad) -
    Math.sin(lat1Rad) * Math.cos(lat2Rad) * Math.cos(dLon);

  let azimuth = Math.atan2(y, x);
  azimuth = toDeg(azimuth);

  return (azimuth + 360) % 360; // Mengembalikan azimuth dalam derajat antara 0 dan 360
};

const calculateDirection = (degree) => {
  if (degree >= 337.5 || degree < 22.5) return "Utara";
  if (degree >= 22.5 && degree < 67.5) return "Timur Laut";
  if (degree >= 67.5 && degree < 112.5) return "Timur";
  if (degree >= 112.5 && degree < 157.5) return "Tenggara";
  if (degree >= 157.5 && degree < 202.5) return "Selatan";
  if (degree >= 202.5 && degree < 247.5) return "Barat Daya";
  if (degree >= 247.5 && degree < 292.5) return "Barat";
  if (degree >= 292.5 && degree < 337.5) return "Barat Laut";
  return "Tidak Diketahui";
};

const ArahMataAngin  = () => {
  const [location, setLocation] = useState(null);
  const [direction, setDirection] = useState(null);
  const [error, setError] = useState(null);

  const fetchGpsLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setLocation({ lat: latitude, lon: longitude });
        },
        (error) => {
          setError("Gagal mendapatkan lokasi GPS.");
          console.error(error);
        }
      );
    } else {
      setError("Geolocation tidak didukung oleh browser.");
    }
  };

  useEffect(() => {
    fetchGpsLocation();
  }, []);

  useEffect(() => {
    if (location) {
      const azimuth = calculateAzimuth(location.lat, location.lon, 0, 0);
      const dir = calculateDirection(azimuth);
      setDirection(dir);
    }
  }, [location]);

  return (
    <div style={{ textAlign: 'center', marginTop: '50px' }}>
      <h1>Kompas Arah Mata Angin Berdasarkan Lokasi GPS</h1>
      {error ? (
        <p style={{ color: 'red' }}>{error}</p>
      ) : location ? (
        <>
          <p>
            Lokasi Anda: {location.lat.toFixed(6)}° Lat, {location.lon.toFixed(6)}° Lon
          </p>
          <h2>
            Arah Mata Angin: {direction}
          </h2>
          <div
            style={{
              margin: '20px auto',
              width: '150px',
              height: '150px',
              border: '5px solid black',
              borderRadius: '50%',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              transform: `rotate(${calculateAzimuth(location.lat, location.lon, 0, 0)}deg)`,
            }}
          >
            <img
              src="https://upload.wikimedia.org/wikipedia/commons/3/37/Red_arrow.svg" // URL gambar panah (bisa diganti dengan gambar lain)
              alt="Panah"
              style={{
                width: '50px',
                height: '50px',
                transform: `rotate(${calculateAzimuth(location.lat, location.lon, 0, 0)}deg)`, // Menyesuaikan arah panah dengan azimuth
              }}
            />
          </div>
        </>
      ) : (
        <p>Memuat lokasi GPS...</p>
      )}
    </div>
  );
};

export default ArahMataAngin ;



// "use client"
//   import { useState, useEffect } from "react";

// const ArahMataAngin = () => {
//   const [heading, setHeading] = useState(null); // Derajat arah utara
//   const [error, setError] = useState(null);

//   useEffect(() => {
//     if (window.DeviceOrientationEvent) {
//       const handleOrientation = (event) => {
//         const alpha = event.alpha; // Orientasi terhadap utara magnetik
//         if (alpha !== null) {
//           setHeading(alpha); // Simpan orientasi ke state
//         }
//       };

//       window.addEventListener("deviceorientation", handleOrientation);

//       return () => {
//         window.removeEventListener("deviceorientation", handleOrientation);
//       };
//     } else {
//       setError("Perangkat Anda tidak mendukung orientasi.");
//     }
//   }, []);

//   const calculateDirection = (degree) => {
//     if (degree >= 337.5 || degree < 22.5) return "Utara";
//     if (degree >= 22.5 && degree < 67.5) return "Timur Laut";
//     if (degree >= 67.5 && degree < 112.5) return "Timur";
//     if (degree >= 112.5 && degree < 157.5) return "Tenggara";
//     if (degree >= 157.5 && degree < 202.5) return "Selatan";
//     if (degree >= 202.5 && degree < 247.5) return "Barat Daya";
//     if (degree >= 247.5 && degree < 292.5) return "Barat";
//     if (degree >= 292.5 && degree < 337.5) return "Barat Laut";
//     return "Tidak Diketahui";
//   };

//   return (
//     <div style={{ textAlign: "center", marginTop: "50px" }}>
//       <h1>Arah Mata Angin</h1>
//       {error ? (
//         <p style={{ color: "red" }}>{error}</p>
//       ) : heading !== null ? (
//         <>
//           <h2>
//             {calculateDirection(heading)} ({Math.round(heading)}°)
//           </h2>
//           <div
//             style={{
//               margin: "20px auto",
//               width: "150px",
//               height: "150px",
//               border: "5px solid black",
//               borderRadius: "50%",
//               display: "flex",
//               justifyContent: "center",
//               alignItems: "center",
//               transform: `rotate(${heading}deg)`,
//             }}
//           >
//             <span style={{ fontSize: "24px", fontWeight: "bold" }}>N</span>
//           </div>
//         </>
//       ) : (
//         <p>Memuat data...</p>
//       )}
//     </div>
//   );
// };

// export default ArahMataAngin;
