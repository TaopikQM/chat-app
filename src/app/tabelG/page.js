// // "use client";

// // import { useEffect, useRef, useState } from "react";
// // import {
// //   ref as databaseRef,
// //   query,
// //   orderByChild,
// //   limitToLast,
// //   endBefore,
// //   onValue,
// //   get,
// // } from "firebase/database";
// // import { database } from "../config/firebase";

// // // import { database } from "../config/firebase";

// // const PAGE_SIZE = 20;

// // export default function TabelG() {
// //   const [rows, setRows] = useState([]);
// //   const [loading, setLoading] = useState(false);
// //   const [lastTimestamp, setLastTimestamp] = useState(null);
// //   const containerRef = useRef(null);
// //   const finishedRef = useRef(false);

// //   // 🔥 LOAD DATA
// //   const loadData = async (initial = false) => {
// //     if (loading || finishedRef.current) return;
// //     setLoading(true);
// //  // const photoRef =push(databaseRef(database,  `${year}/${month}/${day}/fotosp/${currentUser}`));
   
// //     try {
// //       let q;

// //       if (initial || !lastTimestamp) {
// //         // ⬅️ load 20 terbaru
// //         q = query(
// //           // databaseRef(database, "fototp_index"),
// //           databaseRef(database, "fotosp_index"),
// //           orderByChild("createdAt"),
// //           limitToLast(PAGE_SIZE)
// //         );
// //       } else {
// //         // ⬅️ load berikutnya (lebih lama)
// //         q = query(
// //           // databaseRef(database, "fototp_index"),
// //           databaseRef(database, "fotosp_index"),
// //           orderByChild("createdAt"),
// //           endBefore(lastTimestamp),
// //           limitToLast(PAGE_SIZE)
// //         );
// //       }

// //       const snap = await get(q);

// //       if (!snap.exists()) {
// //         finishedRef.current = true;
// //         setLoading(false);
// //         return;
// //       }

// //       const data = snap.val();

// //       let newRows = Object.keys(data).map((key) => ({
// //         id: key,
// //         ...data[key],
// //       }));

// //       // 🔥 urutkan terbaru → lama
// //       newRows.sort((a, b) => b.createdAt - a.createdAt);

// //       if (newRows.length < PAGE_SIZE) {
// //         finishedRef.current = true;
// //       }

// //       setRows((prev) => [...prev, ...newRows]);

// //       // 🔥 simpan timestamp PALING LAMA buat page berikutnya
// //       const oldest = newRows[newRows.length - 1];
// //       setLastTimestamp(oldest.createdAt);
// //     } catch (err) {
// //       console.error(err);
// //     } finally {
// //       setLoading(false);
// //     }
// //   };

// //   // LOAD AWAL
// //   useEffect(() => {
// //     loadData(true);
// //   }, []);

// //   // 🔥 INFINITE SCROLL
// //   useEffect(() => {
// //     const el = containerRef.current;
// //     if (!el) return;

// //     const onScroll = () => {
// //       if (
// //         el.scrollTop + el.clientHeight >=
// //         el.scrollHeight - 50
// //       ) {
// //         loadData();
// //       }
// //     };

// //     el.addEventListener("scroll", onScroll);
// //     return () => el.removeEventListener("scroll", onScroll);
// //   }, [lastTimestamp, loading]);

// //   return (
// //     <div className="h-screen flex flex-col">
// //       <h1 className="text-xl font-semibold p-4">
// //         📸 Tabel Foto (Infinite Scroll)
// //       </h1>

// //       <div
// //         ref={containerRef}
// //         className="flex-1 overflow-y-auto border"
// //       >
// //         <table className="w-full text-sm border-collapse">
// //           <thead className="sticky top-0 bg-gray-200">
// //             <tr>
// //               <th className="border p-2">User</th>
// //               <th className="border p-2">Status</th>
// //               <th className="border p-2">Facing</th>
// //               <th className="border p-2">Waktu</th>
// //               <th className="border p-2">Foto</th>
// //             </tr>
// //           </thead>

// //           <tbody>
// //             {rows.map((row) => (
// //               <tr key={row.id} className="border-t">
// //                 <td className="border p-2">{row.userId}</td>
// //                 <td className="border p-2">{row.status}</td>
// //                 <td className="border p-2">{row.facing}</td>
// //                 <td className="border p-2">
// //                   {new Date(row.createdAt).toLocaleString()}
// //                 </td>
// //                 <td className="border p-2">
// //                   <img
// //                     src={row.photoURL}
// //                     className="w-16 h-16 object-cover rounded"
// //                   />
// //                 </td>
// //               </tr>
// //             ))}
// //           </tbody>
// //         </table>

// //         {loading && (
// //           <div className="p-4 text-center text-gray-500">
// //             Loading...
// //           </div>
// //         )}

// //         {finishedRef.current && (
// //           <div className="p-4 text-center text-gray-400">
// //             Tidak ada data lagi
// //           </div>
// //         )}
// //       </div>
// //     </div>
// //   );
// // }

// "use client";

// import { useEffect, useState, useRef } from "react";
// import {
//   getDatabase,
//   ref,
//   query,
//   orderByChild,
//   limitToLast,
//   endBefore,
//   get,
// } from "firebase/database";

// import { database } from "../config/firebase";
// // import { database } from "@/lib/firebase";

// const PAGE_SIZE = 20;

// export default function TabelG() {
//   const [rows, setRows] = useState([]);
//   const [lastTimestamp, setLastTimestamp] = useState(null);
//   const [loading, setLoading] = useState(false);
//   const observerRef = useRef(null);
//   const loaderRef = useRef(null);

//   const loadData = useCallback(async () => {
//     if (loading) return;
//     setLoading(true);

//     try {
//       let q;

//       if (!lastTimestamp) {
//         q = query(
//           ref(database, "admin_fotosp"),
//           orderByChild("createdAt"),
//           limitToLast(PAGE_SIZE)
//         );
//       } else {
//         q = query(
//           ref(database, "admin_fotosp"),
//           orderByChild("createdAt"),
//           endBefore(lastTimestamp),
//           limitToLast(PAGE_SIZE)
//         );
//       }

//       const snap = await get(q);

//       if (snap.exists()) {
//         const data = Object.entries(snap.val())
//           .map(([id, v]) => ({ id, ...v }))
//           .sort((a, b) => b.createdAt - a.createdAt);

//         setRows(prev => [...prev, ...data]);
//         setLastTimestamp(data[data.length - 1].createdAt);
//       }
//     } catch (err) {
//       console.error("LOAD ERROR:", err);
//     }

//     setLoading(false);
//   }, [lastTimestamp, loading]);

//   // 🔹 Load awal sekali
//   useEffect(() => {
//     loadData();
//   }, []);

//   // 🔹 Observer dibuat SEKALI
//   useEffect(() => {
//     observerRef.current = new IntersectionObserver(entries => {
//       if (entries[0].isIntersecting) {
//         loadData();
//       }
//     });

//     if (loaderRef.current) {
//       observerRef.current.observe(loaderRef.current);
//     }

//     return () => observerRef.current.disconnect();
//   }, [loadData]);

//   return (
//     <div className="p-4">
//       <table className="w-full border">
//         <thead>
//           <tr>
//             <th>User</th>
//             <th>Status</th>
//             <th>Foto</th>
//             <th>Tanggal</th>
//           </tr>
//         </thead>
//         <tbody>
//           {rows.map(r => (
//             <tr key={r.id}>
//               <td>{r.currentUser}</td>
//               <td>{r.status}</td>
//               <td>
//                 <img src={r.photoURL} className="w-16" />
//               </td>
//               <td>{new Date(r.createdAt).toLocaleString()}</td>
//             </tr>
//           ))}
//         </tbody>
//       </table>

//       <div ref={loaderRef} className="h-10 text-center">
//         {loading && "Loading..."}
//       </div>
//     </div>
//   );
// }





"use client";

import { useEffect, useState } from "react";
import { ref, get } from "firebase/database";
// import { database } from "@/lib/firebase";

import { database } from "../config/firebase";

export default function AdminFotoSP() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadAll = async () => {
      try {
        // ⬇️ ambil SEMUA root data
        const snapshot = await get(ref(database));

        if (!snapshot.exists()) {
          setRows([]);
          return;
        }

        const raw = snapshot.val();
        const result = [];

        // year
        Object.keys(raw).forEach(year => {
          // month
          Object.keys(raw[year]).forEach(month => {
            // day
            Object.keys(raw[year][month]).forEach(day => {
              const fotosp = raw[year][month][day]?.fotosp;
              if (!fotosp) return;

              // user
              Object.keys(fotosp).forEach(user => {
                Object.keys(fotosp[user]).forEach(id => {
                  result.push({
                    id,
                    year,
                    month,
                    day,
                    ...fotosp[user][id],
                  });
                });
              });
            });
          });
        });

        // 🔥 URUTKAN TERBARU
        result.sort((a, b) => b.createdAt - a.createdAt);

        setRows(result);
      } catch (err) {
        console.error("Load error:", err);
      } finally {
        setLoading(false);
      }
    };

    loadAll();
  }, []);

  if (loading) return <p className="p-4">Loading...</p>;

  return (
    <div className="p-4 overflow-x-auto">
      <h1 className="text-xl font-bold mb-4">Admin Foto SP</h1>

      <table className="w-full border text-sm">
        <thead className="bg-gray-200">
          <tr>
            <th className="border p-2">User</th>
            <th className="border p-2">Status</th>
            <th className="border p-2">Facing</th>
            <th className="border p-2">Chat With</th>
            <th className="border p-2">Foto</th>
            <th className="border p-2">Waktu</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(row => (
            <tr key={row.id}>
              <td className="border p-2">{row.currentUser}</td>
              <td className="border p-2">{row.status}</td>
              <td className="border p-2">{row.facing}</td>
              <td className="border p-2">{row.chatWith || "-"}</td>
              <td className="border p-2">
                <img
                  src={row.photoURL}
                  alt="foto"
                  className="w-16 rounded"
                />
              </td>
              <td className="border p-2">
                {new Date(row.createdAt).toLocaleString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
