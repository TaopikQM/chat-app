import { useState, useEffect } from "react";

const ArahMataAngin = () => {
  const [heading, setHeading] = useState(null); // Derajat arah utara
  const [error, setError] = useState(null);

  useEffect(() => {
    if (window.DeviceOrientationEvent) {
      const handleOrientation = (event) => {
        const alpha = event.alpha; // Orientasi terhadap utara magnetik
        if (alpha !== null) {
          setHeading(alpha); // Simpan orientasi ke state
        }
      };

      window.addEventListener("deviceorientation", handleOrientation);

      return () => {
        window.removeEventListener("deviceorientation", handleOrientation);
      };
    } else {
      setError("Perangkat Anda tidak mendukung orientasi.");
    }
  }, []);

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

  return (
    <div style={{ textAlign: "center", marginTop: "50px" }}>
      <h1>Arah Mata Angin</h1>
      {error ? (
        <p style={{ color: "red" }}>{error}</p>
      ) : heading !== null ? (
        <>
          <h2>
            {calculateDirection(heading)} ({Math.round(heading)}°)
          </h2>
          <div
            style={{
              margin: "20px auto",
              width: "150px",
              height: "150px",
              border: "5px solid black",
              borderRadius: "50%",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              transform: `rotate(${heading}deg)`,
            }}
          >
            <span style={{ fontSize: "24px", fontWeight: "bold" }}>N</span>
          </div>
        </>
      ) : (
        <p>Memuat data...</p>
      )}
    </div>
  );
};

export default ArahMataAngin;
