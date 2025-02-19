import dynamic from "next/dynamic";

// Import `MapView` secara dinamis agar tidak di-render di server
const Maps = dynamic(() => import("@/components/Maps"), { ssr: false });
import LiveTrack = dynamic(() => import("@/components/LiveTrack"), { ssr: false }); // Jalankan tracking lokasi di background

export default function Home() {
  return (
    <>
      <LiveTrack /> {/* Kirim lokasi ke Firebase di background */}
      <Maps /> {/* Tampilkan peta dengan data dari Firebase */}
    </>
  );
}
// import LiveTrackingMap from '../components/LiveTrackingMap';

// export default function Home() {
//   return (
//     <div>
//       <h1>Jadwal Shalat</h1>
//       <LiveTrackingMap />
//     </div>
//   );
// }
