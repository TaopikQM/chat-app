"use client"
import React, { useState } from 'react';

const ArahMataAngin = () => {
  const [heading, setHeading] = useState(0); // Default heading

  // Function to determine the cardinal direction
  const headingToString = (heading) => {
    let strHeading = '?';
    const cardinal = {
      North_1: 0,
      Northeast: 45,
      East: 90,
      Southeast: 135,
      South: 180,
      Southwest: 225,
      West: 270,
      Northwest: 315,
      North_2: 360,
    };

    for (const key in cardinal) {
      const value = cardinal[key];
      if (Math.abs(heading - value) < 30) {
        strHeading = key;
        if (key.includes('North_')) {
          strHeading = 'North';
        }
        break;
      }
    }
    return strHeading;
  };

  // Handle input change for heading
  const handleHeadingChange = (event) => {
    setHeading(parseFloat(event.target.value));
  };

  return (
    <div>
      <h1>Compass Direction</h1>
      <input
        type="number"
        value={heading}
        onChange={handleHeadingChange}
        step="1"
        min="0"
        max="360"
      />
      <p>Heading: {heading}°</p>
      <p>Direction: {headingToString(heading)}</p>
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
