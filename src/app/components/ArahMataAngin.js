"use client"
import { useState, useEffect } from 'react';

const ArahMataAngin = () => {
  const [heading, setHeading] = useState(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Check if the device supports orientation events
    if (window.DeviceOrientationEvent) {
      setIsMobile(true);
      const handleOrientation = (event) => {
        const { alpha } = event; // alpha is the direction the device is facing (0-360 degrees)
        if (alpha !== null) {
          setHeading(alpha);
        }
      };

      window.addEventListener('deviceorientation', handleOrientation);

      // Cleanup event listener on component unmount
      return () => {
        window.removeEventListener('deviceorientation', handleOrientation);
      };
    } else {
      alert('Device orientation is not supported on this device.');
    }
  }, []);

  if (!isMobile) {
    return <p>Device orientation is not supported on your device.</p>;
  }

  const getArrowRotation = (heading) => {
    // Normalize heading to 0-360 range
    if (heading === null) return 0;
    return heading;
  };

  return (
    <div style={styles.container}>
      <h1>Find North</h1>
      <div style={styles.compassContainer}>
        <div
          style={{
            ...styles.arrow,
            transform: `rotate(${getArrowRotation(heading)}deg)`,
          }}
        />
      </div>
      <p>Heading: {heading ? heading.toFixed(2) : '0'}°</p>
      <p>{heading && heading >= 0 && heading < 45 ? 'North' : 'Rotating...'}</p>
    </div>
  );
};

const styles = {
  container: {
    textAlign: 'center',
    marginTop: '50px',
  },
  compassContainer: {
    position: 'relative',
    width: '200px',
    height: '200px',
    margin: 'auto',
    border: '2px solid black',
    borderRadius: '50%',
    backgroundColor: '#f0f0f0',
  },
  arrow: {
    position: 'absolute',
    width: '10px',
    height: '50px',
    backgroundColor: 'red',
    top: '50%',
    left: '50%',
    transformOrigin: '50% 100%',
    marginLeft: '-5px',
    marginTop: '-100px',
  },
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
