"use client"
import React, { useState, useEffect } from 'react';

const ArahMataAngin  = () => {
  const [direction, setDirection] = useState(0); // Arah kompas dalam derajat
  const [error, setError] = useState(null);

  useEffect(() => {
    const handleOrientation = (event) => {
      // event.alpha memberikan rotasi perangkat pada sumbu Z
      if (event.alpha !== null) {
        setDirection(event.alpha); // Set arah sesuai rotasi perangkat
      }
    };

    // Periksa apakah DeviceOrientationEvent didukung oleh perangkat
    if (window.DeviceOrientationEvent) {
      window.addEventListener('deviceorientation', handleOrientation);
    } else {
      setError('DeviceOrientationEvent tidak didukung oleh perangkat ini.');
    }

    // Bersihkan event listener ketika komponen dibersihkan
    return () => {
      if (window.DeviceOrientationEvent) {
        window.removeEventListener('deviceorientation', handleOrientation);
      }
    };
  }, []);

  return (
    <div style={{ textAlign: 'center', marginTop: '50px' }}>
      <h1>Kompas Arah Mata Angin Berdasarkan Orientasi Perangkat</h1>
      {error ? (
        <p style={{ color: 'red' }}>{error}</p>
      ) : (
        <>
          <h2>Arah Mata Angin: {direction.toFixed(2)}°</h2>
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
              transform: `rotate(${direction}deg)`, // Rotasi berdasarkan arah
            }}
          >
            {/* Ikon Panah menggunakan CSS */}
            <div
              style={{
                width: '40px',
                height: '40px',
                borderTop: '4px solid red',
                borderRight: '4px solid transparent',
                borderLeft: '4px solid transparent',
                borderBottom: '4px solid transparent',
                transformOrigin: 'center',
              }}
            />
          </div>
        </>
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
