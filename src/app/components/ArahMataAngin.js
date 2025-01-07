"use client"
// components/ArahMataAngin.js
import { useEffect, useState } from 'react';

const ArahMataAngin = () => {
  const [heading, setHeading] = useState(null); // Device heading angle
  const [direction, setDirection] = useState(''); // Cardinal direction

  // Function to convert heading to cardinal direction
  const headingToString = (heading) => {
    const cardinal = {
      North: 0,
      Northeast: 45,
      East: 90,
      Southeast: 135,
      South: 180,
      Southwest: 225,
      West: 270,
      Northwest: 315,
    };

    let closestDirection = 'North';

    for (const direction in cardinal) {
      const value = cardinal[direction];
      if (Math.abs(heading - value) < 30 || (heading >= 330 && heading <= 30)) {
        closestDirection = direction;
        break;
      }
    }

    return closestDirection;
  };

  // Handle device orientation event
  useEffect(() => {
    const handleOrientation = (event) => {
      if (event.alpha !== null) {
        setHeading(event.alpha);
        setDirection(headingToString(event.alpha));
      }
    };

    // Listen for device orientation changes
    window.addEventListener('deviceorientation', handleOrientation);

    // Clean up the event listener on component unmount
    return () => {
      window.removeEventListener('deviceorientation', handleOrientation);
    };
  }, []);

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
      <h1 className="text-2xl font-bold mb-4">Arah Mata Angin Berdasarkan Rotasi HP</h1>
      {heading !== null ? (
        <div className="text-center">
          <p className="text-lg text-gray-700 mb-2">Heading: {heading.toFixed(2)}°</p>
          <p className="text-3xl font-semibold text-blue-500">{direction}</p>
        </div>
      ) : (
        <p className="text-lg text-gray-500">Menunggu data orientasi...</p>
      )}
    </div>
  );
};

export default ArahMataAngin;






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
