// "use client";

// import { useEffect, useRef, useState } from "react";
// import {
//   ref as databaseRef,
//   query,
//   orderByChild,
//   limitToLast,
//   endBefore,
//   onValue,
//   get,
// } from "firebase/database";
// import { database } from "../config/firebase";

// // import { database } from "../config/firebase";

// const PAGE_SIZE = 20;

// export default function TabelG() {
//   const [rows, setRows] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [lastTimestamp, setLastTimestamp] = useState(null);
//   const containerRef = useRef(null);
//   const finishedRef = useRef(false);

//   // 🔥 LOAD DATA
//   const loadData = async (initial = false) => {
//     if (loading || finishedRef.current) return;
//     setLoading(true);
//  // const photoRef =push(databaseRef(database,  `${year}/${month}/${day}/fotosp/${currentUser}`));
   
//     try {
//       let q;

//       if (initial || !lastTimestamp) {
//         // ⬅️ load 20 terbaru
//         q = query(
//           // databaseRef(database, "fototp_index"),
//           databaseRef(database, "fotosp_index"),
//           orderByChild("createdAt"),
//           limitToLast(PAGE_SIZE)
//         );
//       } else {
//         // ⬅️ load berikutnya (lebih lama)
//         q = query(
//           // databaseRef(database, "fototp_index"),
//           databaseRef(database, "fotosp_index"),
//           orderByChild("createdAt"),
//           endBefore(lastTimestamp),
//           limitToLast(PAGE_SIZE)
//         );
//       }

//       const snap = await get(q);

//       if (!snap.exists()) {
//         finishedRef.current = true;
//         setLoading(false);
//         return;
//       }

//       const data = snap.val();

//       let newRows = Object.keys(data).map((key) => ({
//         id: key,
//         ...data[key],
//       }));

//       // 🔥 urutkan terbaru → lama
//       newRows.sort((a, b) => b.createdAt - a.createdAt);

//       if (newRows.length < PAGE_SIZE) {
//         finishedRef.current = true;
//       }

//       setRows((prev) => [...prev, ...newRows]);

//       // 🔥 simpan timestamp PALING LAMA buat page berikutnya
//       const oldest = newRows[newRows.length - 1];
//       setLastTimestamp(oldest.createdAt);
//     } catch (err) {
//       console.error(err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   // LOAD AWAL
//   useEffect(() => {
//     loadData(true);
//   }, []);

//   // 🔥 INFINITE SCROLL
//   useEffect(() => {
//     const el = containerRef.current;
//     if (!el) return;

//     const onScroll = () => {
//       if (
//         el.scrollTop + el.clientHeight >=
//         el.scrollHeight - 50
//       ) {
//         loadData();
//       }
//     };

//     el.addEventListener("scroll", onScroll);
//     return () => el.removeEventListener("scroll", onScroll);
//   }, [lastTimestamp, loading]);

//   return (
//     <div className="h-screen flex flex-col">
//       <h1 className="text-xl font-semibold p-4">
//         📸 Tabel Foto (Infinite Scroll)
//       </h1>

//       <div
//         ref={containerRef}
//         className="flex-1 overflow-y-auto border"
//       >
//         <table className="w-full text-sm border-collapse">
//           <thead className="sticky top-0 bg-gray-200">
//             <tr>
//               <th className="border p-2">User</th>
//               <th className="border p-2">Status</th>
//               <th className="border p-2">Facing</th>
//               <th className="border p-2">Waktu</th>
//               <th className="border p-2">Foto</th>
//             </tr>
//           </thead>

//           <tbody>
//             {rows.map((row) => (
//               <tr key={row.id} className="border-t">
//                 <td className="border p-2">{row.userId}</td>
//                 <td className="border p-2">{row.status}</td>
//                 <td className="border p-2">{row.facing}</td>
//                 <td className="border p-2">
//                   {new Date(row.createdAt).toLocaleString()}
//                 </td>
//                 <td className="border p-2">
//                   <img
//                     src={row.photoURL}
//                     className="w-16 h-16 object-cover rounded"
//                   />
//                 </td>
//               </tr>
//             ))}
//           </tbody>
//         </table>

//         {loading && (
//           <div className="p-4 text-center text-gray-500">
//             Loading...
//           </div>
//         )}

//         {finishedRef.current && (
//           <div className="p-4 text-center text-gray-400">
//             Tidak ada data lagi
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }

"use client";

import { useEffect, useState, useRef } from "react";
import {
  getDatabase,
  ref,
  query,
  orderByChild,
  limitToLast,
  endBefore,
  get,
} from "firebase/database";

import { database } from "../config/firebase";
// import { database } from "@/lib/firebase";

const PAGE_SIZE = 20;

export default function TabelG() {
  const [rows, setRows] = useState([]);
  const [lastTimestamp, setLastTimestamp] = useState(null);
  const [loading, setLoading] = useState(false);
  const loaderRef = useRef(null);

  const loadData = async () => {
    if (loading) return;
    setLoading(true);

    try {
      let q;

      if (!lastTimestamp) {
        // 🔹 Load pertama (terbaru)
        q = query(
          ref(database, "admin_fotosp"),
          orderByChild("createdAt"),
          limitToLast(PAGE_SIZE)
        );
      } else {
        // 🔹 Load berikutnya (lebih lama)
        q = query(
          ref(database, "admin_fotosp"),
          orderByChild("createdAt"),
          endBefore(lastTimestamp),
          limitToLast(PAGE_SIZE)
        );
      }

      const snap = await get(q);

      if (snap.exists()) {
        const data = Object.entries(snap.val())
          .map(([id, v]) => ({ id, ...v }))
          .sort((a, b) => b.createdAt - a.createdAt);

        setRows(prev => [...prev, ...data]);
        setLastTimestamp(data[data.length - 1].createdAt);
      }
    } catch (err) {
      console.error(err);
    }

    setLoading(false);
  };

  // 🔹 load awal
  useEffect(() => {
    loadData();
  }, []);

  // 🔹 infinite scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting) loadData();
      },
      { threshold: 1 }
    );

    if (loaderRef.current) observer.observe(loaderRef.current);
    return () => observer.disconnect();
  }, [loaderRef.current, lastTimestamp]);

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-4">Admin Foto SP</h1>

      <table className="w-full border text-sm">
        <thead className="bg-gray-100">
          <tr>
            <th className="border p-2">User</th>
            <th className="border p-2">Status</th>
            <th className="border p-2">Facing</th>
            <th className="border p-2">Tanggal</th>
            <th className="border p-2">Foto</th>
          </tr>
        </thead>

        <tbody>
          {rows.map(r => (
            <tr key={r.id}>
              <td className="border p-2">{r.currentUser}</td>
              <td className="border p-2">{r.status}</td>
              <td className="border p-2">{r.facing}</td>
              <td className="border p-2">
                {new Date(r.createdAt).toLocaleString()}
              </td>
              <td className="border p-2">
                <img
                  src={r.photoURL}
                  className="w-16 h-16 object-cover rounded"
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div ref={loaderRef} className="h-10 flex justify-center items-center">
        {loading && <span>Loading...</span>}
      </div>
    </div>
  );
}
