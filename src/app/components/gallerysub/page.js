// "use client"; 

// import { useEffect, useState } from "react";
// //(* import { supabase } from "@/config/supabase"; *)

// import { supabase } from  "../../../config/supabase";

// const bulanIndo = [
//   "Januari","Februari","Maret","April","Mei","Juni",
//   "Juli","Agustus","September","Oktober","November","Desember"
// ];

// export default function GalleryPage() {
//   const [path, setPath] = useState("");
//   const [history, setHistory] = useState([]);
//   const [folders, setFolders] = useState([]);
//   const [files, setFiles] = useState([]);
//   const [selectedIndex, setSelectedIndex] = useState(null);

//   // ================= FETCH =================
//   const fetchData = async (folder = "") => {
//     const { data, error } = await supabase.storage
//       .from("Env-v1")
//       .list(folder, { limit: 1000 });

//     if (error) {
//       console.error(error);
//       return;
//     }

//     const flds = [];
//     const fls = [];

//     data.forEach((item) => {
//       if (item.metadata === null) {
//         flds.push(item);
//       } else {
//         fls.push(item);
//       }
//     });

//     // SORT TERBARU
//     fls.sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at));

//     setFolders(flds);
//     setFiles(fls);
//   };

//   useEffect(() => {
//     fetchData(path);
//   }, [path]);

//   // ================= NAVIGATION =================
//   const openFolder = (name) => {
//     setHistory([...history, path]);
//     setPath(path ? `${path}/${name}` : name);
//   };

//   const goBack = () => {
//     const prev = history.pop() || "";
//     setHistory([...history]);
//     setPath(prev);
//   };

//   // ================= URL =================
//   const getUrl = (fileName) => {
//     const fullPath = path ? `${path}/${fileName}` : fileName;
//     return supabase.storage.from("Env-v1").getPublicUrl(fullPath).data.publicUrl;
//   };

//   // ================= GROUP BY BULAN =================
//   const grouped = {};
//   files.forEach((file) => {
//     const date = new Date(file.updated_at);
//     const key = `${bulanIndo[date.getMonth()]} ${date.getFullYear()}`;

//     if (!grouped[key]) grouped[key] = [];
//     grouped[key].push(file);
//   });

//   // ================= SWIPE =================
//   let startX = 0;

//   const handleTouchStart = (e) => {
//     startX = e.touches[0].clientX;
//   };

//   const handleTouchEnd = (e) => {
//     const endX = e.changedTouches[0].clientX;
//     if (endX - startX > 50) prevSlide();
//     if (startX - endX > 50) nextSlide();
//   };

//   const nextSlide = () => {
//     setSelectedIndex((i) =>
//       i < files.length - 1 ? i + 1 : i
//     );
//   };

//   const prevSlide = () => {
//     setSelectedIndex((i) =>
//       i > 0 ? i - 1 : i
//     );
//   };

//   return (
//     <div className="p-4">
//       <h1 className="text-xl font-bold mb-4">Gallery Supabase</h1>

//       {/* BACK */}
//       {history.length > 0 && (
//         <button
//           onClick={goBack}
//           className="mb-4 px-3 py-1 bg-gray-200 rounded"
//         >
//           ← Kembali
//         </button>
//       )}

//       {/* ================= FOLDER ================= */}
//       {folders.length > 0 && (
//         <div className="mb-6">
//           <h2 className="font-semibold mb-2">📁 Folder</h2>
//           <div className="grid grid-cols-2 gap-2">
//             {folders.map((f, i) => (
//               <div
//                 key={i}
//                 onClick={() => openFolder(f.name)}
//                 className="p-3 border rounded cursor-pointer hover:bg-gray-100"
//               >
//                 📁 {f.name}
//               </div>
//             ))}
//           </div>
//         </div>
//       )}

//       {/* ================= FILE PER BULAN ================= */}
//       {Object.keys(grouped).map((bulan) => (
//         <div key={bulan} className="mb-6">
//           {/* HEADER BULAN */}
//           <div className="flex items-center gap-2 mb-2">
//             <div className="text-sm font-semibold">{bulan}</div>
//             <div className="flex-1 h-[1px] bg-gray-300"></div>
//           </div>

//           {/* GRID */}
//           <div className="grid grid-cols-3 gap-2">
//             {grouped[bulan].map((file, index) => {
//               const globalIndex = files.indexOf(file);
//               const url = getUrl(file.name);
//               const type = file.metadata?.mimetype || "";

//               return (
//                 <div
//                   key={index}
//                   onClick={() => setSelectedIndex(globalIndex)}
//                   className="cursor-pointer"
//                 >
//                   {type.startsWith("image") && (
//                     <img
//                       src={url}
//                       className="w-full h-28 object-cover rounded"
//                     />
//                   )}

//                   {type.startsWith("video") && (
//                     <video className="w-full h-28 object-cover rounded">
//                       <source src={url} />
//                     </video>
//                   )}
//                 </div>
//               );
//             })}
//           </div>
//         </div>
//       ))}

//       {/* ================= MODAL ================= */}
//       {selectedIndex !== null && (
//         <div
//           className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center"
//           onTouchStart={handleTouchStart}
//           onTouchEnd={handleTouchEnd}
//         >
//           {/* CLOSE */}
//           <button
//             className="absolute top-4 right-4 text-white text-xl"
//             onClick={() => setSelectedIndex(null)}
//           >
//             ✕
//           </button>

//           {/* PREV */}
//           <button
//             className="absolute left-4 text-white text-3xl"
//             onClick={prevSlide}
//           >
//             ◀
//           </button>

//           {/* NEXT */}
//           <button
//             className="absolute right-4 text-white text-3xl"
//             onClick={nextSlide}
//           >
//             ▶
//           </button>

//           {/* CONTENT */}
//           {(() => {
//             const file = files[selectedIndex];
//             const url = getUrl(file.name);
//             const type = file.metadata?.mimetype || "";

//             if (type.startsWith("image")) {
//               return <img src={url} className="max-h-[80%]" />;
//             }

//             if (type.startsWith("video")) {
//               return (
//                 <video controls className="max-h-[80%]">
//                   <source src={url} />
//                 </video>
//               );
//             }

//             return <div className="text-white">Tidak bisa preview</div>;
//           })()}
//         </div>
//       )}
//     </div>
//   );
// }
