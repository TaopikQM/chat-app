"use client";

import { useEffect, useRef, useState } from "react";
import { supabase } from "../config/supabase";
import Image from "next/image";
import { useVirtualizer } from "@tanstack/react-virtual";

// ================= HELPER =================
const isImage = (name) => /\.(jpg|jpeg|png|webp|gif)$/i.test(name);
const isVideo = (name) => /\.(mp4|webm|mov|mkv)$/i.test(name);

export default function GalleryPage() {
  const parentRef = useRef();

  // ================= STATE =================
  const [path, setPath] = useState("");
  const [folders, setFolders] = useState([]);
  const [files, setFiles] = useState([]);

  const [offset, setOffset] = useState(0);
  const [loading, setLoading] = useState(false);
  const limit = 20;

  // ================= URL CACHE =================
  const urlCache = useRef({});

  const getUrl = (name) => {
    const fullPath = path ? `${path}/${name}` : name;

    if (urlCache.current[fullPath]) return urlCache.current[fullPath];

    const { data } = supabase.storage
      .from("Env-v2")
      .getPublicUrl(fullPath);

    urlCache.current[fullPath] = data.publicUrl;
    return data.publicUrl;
  };

  const getImage = (name) => {
    const fullPath = path ? `${path}/${name}` : name;

    const { data } = supabase.storage
      .from("Env-v2")
      .getPublicUrl(fullPath, {
        transform: {
          width: 400,
          quality: 60,
        },
      });

    return data.publicUrl;
  };

  // ================= FETCH =================
  const fetchData = async () => {
    if (loading) return;
    setLoading(true);

    const { data, error } = await supabase.storage
      .from("Env-v2")
      .list(path, {
        limit,
        offset,
        sortBy: { column: "created_at", order: "desc" },
      });

    if (!error && data) {
      const newFolders = data.filter((i) => !i.id);
      const newFiles = data.filter((i) => i.id);

      // folder hanya load sekali (biar gak dobel)
      if (offset === 0) setFolders(newFolders);

      setFiles((prev) => [...prev, ...newFiles]);
      setOffset((prev) => prev + limit);
    }

    setLoading(false);
  };

  // reset saat path berubah
  useEffect(() => {
    setFolders([]);
    setFiles([]);
    setOffset(0);
    urlCache.current = {};
    fetchData();
  }, [path]);

  // ================= VIRTUAL =================
  const rowVirtualizer = useVirtualizer({
    count: files.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 300,
    overscan: 5,
  });

  // ================= INFINITE SCROLL =================
  useEffect(() => {
    const items = rowVirtualizer.getVirtualItems();
    if (!items.length) return;

    const last = items[items.length - 1];

    if (last.index >= files.length - 5) {
      fetchData();
    }
  }, [rowVirtualizer.getVirtualItems()]);

  // ================= VIDEO =================
  const VideoItem = ({ src }) => {
    const ref = useRef();

    useEffect(() => {
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (!ref.current) return;

          if (entry.isIntersecting) {
            ref.current.play().catch(() => {});
          } else {
            ref.current.pause();
          }
        },
        { threshold: 0.6 }
      );

      if (ref.current) observer.observe(ref.current);

      return () => observer.disconnect();
    }, []);

    return (
      <video
        ref={ref}
        src={src}
        muted
        loop
        playsInline
        preload="metadata"
        className="w-full h-full object-cover rounded"
      />
    );
  };

  // ================= NAV =================
  const openFolder = (name) => {
    setPath((prev) => (prev ? `${prev}/${name}` : name));
  };

  const goBack = () => {
    if (!path) return;

    const parts = path.split("/");
    parts.pop();
    setPath(parts.join("/"));
  };

  // ================= UI =================
  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">🚀 Super Fast Gallery</h1>

      {/* BACK */}
      {path && (
        <button
          onClick={goBack}
          className="mb-3 px-3 py-1 bg-gray-200 rounded"
        >
          ← Back
        </button>
      )}

      {/* PATH */}
      <div className="text-sm mb-4 text-gray-600">
        📂 {path || "root"}
      </div>

      {/* ================= FOLDER ================= */}
      {folders.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-4">
          {folders.map((f, i) => (
            <div
              key={i}
              onClick={() => openFolder(f.name)}
              className="p-3 border rounded cursor-pointer hover:bg-gray-100"
            >
              📁 {f.name}
            </div>
          ))}
        </div>
      )}

      {/* ================= FILE LIST ================= */}
      <div
        ref={parentRef}
        className="h-[75vh] overflow-auto border rounded"
      >
        <div
          style={{
            height: rowVirtualizer.getTotalSize(),
            position: "relative",
          }}
        >
          {rowVirtualizer.getVirtualItems().map((virtualRow) => {
            const file = files[virtualRow.index];
            if (!file) return null;

            const name = file.name;
            const url = getUrl(name);

            return (
              <div
                key={virtualRow.index}
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "100%",
                  transform: `translateY(${virtualRow.start}px)`,
                }}
                className="p-2"
              >
                <div className="bg-white rounded shadow overflow-hidden">

                  {/* IMAGE */}
                  {isImage(name) && (
                    <Image
                      src={getImage(name)}
                      width={400}
                      height={300}
                      loading="lazy"
                      className="w-full h-auto"
                      alt=""
                    />
                  )}

                  {/* VIDEO */}
                  {isVideo(name) && (
                    <VideoItem src={url} />
                  )}

                  {/* FILE */}
                  {!isImage(name) && !isVideo(name) && (
                    <div className="p-4 text-sm">📄 {name}</div>
                  )}

                </div>
              </div>
            );
          })}
        </div>

        {loading && (
          <div className="text-center p-4">Loading...</div>
        )}
      </div>
    </div>
  );
}




// "use client";

// import { useEffect, useState,useRef  } from "react";
// import { supabase } from "../config/supabase";
// import { useVirtualizer } from '@tanstack/react-virtual'
// import Image from "next/image";


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
//   const [selectedItems, setSelectedItems] = useState({});
//   const [downloading, setDownloading] = useState(false);

//   const isImage = (name) => /\.(jpg|jpeg|png|webp|gif)$/i.test(name);
//   const isVideo = (name) => /\.(mp4|webm|mov|mkv)$/i.test(name);

//   const [viewerOpen, setViewerOpen] = useState(false);
//   const [viewerIndex, setViewerIndex] = useState(0);

//   const [sizes, setSizes] = useState({});
  
//   const selectAllRef = useRef();



//   const handleImageLoad = (e, name) => {
//   const height = e.target.naturalHeight;
//   setSizes((prev) => ({
//     ...prev,
//     [name]: height
//   }));
// };

//   const handleVideoLoad = (e, name) => {
//   const height = e.target.videoHeight;
//   setSizes((prev) => ({
//     ...prev,
//     [name]: height
//   }));
// };

//   const makeKey = (type, name) =>
//     path ? `${type}-${path}-${name}` : `${type}-${name}`;
  
//   const extractFileName = (key) => {
//     if (path) return key.replace(`file-${path}-`, "");
//     return key.replace("file-", "");
//   };

//   const toggleSelect = (key) => {
//     setSelectedItems((prev) => ({
//       ...prev,
//       [key]: {
//         checked: !prev[key]?.checked,
//         downloaded: prev[key]?.downloaded || false
//       }
//     }));
//   };

//   const allFileKeys = files.map((f) => makeKey("file", f.name));
  

 
//   const handleSelectAll = () => {
//       const updated = {};
    
//       [...folders, ...files].forEach((item) => {
//         const type = item.id ? "file" : "folder";
//         const key = makeKey(type, item.name);
    
//         updated[key] = {
//           checked: !isAllChecked,
//           downloaded: selectedItems[key]?.downloaded || false
//         };
//       });
    
//       setSelectedItems((prev) => ({
//         ...prev,
//         ...updated
//       }));
//     };

//   const isChecked = (key) => selectedItems[key]?.checked;
//   const isDownloaded = (key) => selectedItems[key]?.downloaded;



//   const totalChecked = Object.values(selectedItems).filter(
//     (v) => v.checked && !v.downloaded
//   ).length;

// const downloadSelected = async () => {
//   setDownloading(true);

//   for (const key in selectedItems) {
//     const item = selectedItems[key];

//     if (!item.checked || item.downloaded) continue;
//      if (!key.startsWith("file-")) continue;

    
//     const fileName = extractFileName(key);
//     const url = getUrl(fileName);

//     // ✅ FORCE DOWNLOAD (SEKARANG WORK)
//     const a = document.createElement("a");
//     a.href = url;
//     a.download = fileName;
//     document.body.appendChild(a);
//     a.click();
//     document.body.removeChild(a);

//     // update state
//     setSelectedItems((prev) => ({
//       ...prev,
//       [key]: {
//         ...prev[key],
//         downloaded: true,
//         checked: false
//       }
//     }));

//     await new Promise((res) => setTimeout(res, 300));
//   }

//   setDownloading(false);
// };
  


//   // ================= FETCH ALL (NO LIMIT) =================
//   const fetchData = async (folder = "") => {
//     let allData = [];
//     let offset = 0;
//     const limit = 30;

//     while (true) {
//       const { data, error } = await supabase.storage
//         .from("Env-v2")
//         .list(folder, {
//           limit,
//           offset,
//           sortBy: { column: "created_at", order: "desc" }
//         });

//       if (error) {
//         console.error(error);
//         break;
//       }

//       if (!data || data.length === 0) break;

//       allData = [...allData, ...data];

//       if (data.length < limit) break;
//       offset += limit;
//     }

//     const flds = [];
//     const fls = [];

//     allData.forEach((item) => {
//       // ✅ folder biasanya id null
//       if (!item.id) {
//         flds.push(item);
//       } else {
//         fls.push(item);
//       }
//     });

//     // ✅ SORT FINAL (DOUBLE SAFETY)
//     fls.sort((a, b) => {
//       return new Date(b.created_at || 0) - new Date(a.created_at || 0);
//     });

//     setFolders(flds);
//     setFiles(fls);
//   };

//   useEffect(() => {
//     fetchData(path);
//   }, [path]);

//   // ================= NAV =================
//   const openFolder = (name) => {
//     setHistory((prev) => [...prev, path]);
//     setPath(path ? `${path}/${name}` : name);
//   };

//   const goBack = () => {
//     setHistory((prev) => {
//       const newHistory = [...prev];
//       const last = newHistory.pop() || "";
//       setPath(last);
//       return newHistory;
//     });
//   };

//   // ================= URL =================
//   const getUrl = (fileName) => {
//     const fullPath = path ? `${path}/${fileName}` : fileName;
  
//     const { data } = supabase.storage
//       .from("Env-v2")
//       .getPublicUrl(fullPath, {
//         download: true // 🔥 INI KUNCI
//       });
  
//     return data.publicUrl;
//   };

//   const getUrl1 = (fileName) => {
//     const fullPath = path ? `${path}/${fileName}` : fileName;
//     return supabase.storage.from("Env-v2").getPublicUrl(fullPath).data.publicUrl;
//   };

//   // ================= GROUP =================
//   const grouped = {};
//   files.forEach((file) => {
//     const date = new Date(file.created_at || Date.now());
//     const key = `${bulanIndo[date.getMonth()]} ${date.getFullYear()}`;

//     if (!grouped[key]) grouped[key] = [];
//     grouped[key].push(file);
//   });

//  useEffect(() => {
//   if (selectAllRef.current) {
//     selectAllRef.current.indeterminate = isIndeterminate;
//   }
// }, [selectedItems, grouped]);

//    const fileKeys = Object.values(grouped)
//         .flat()
//         .map((f) => makeKey("file", f.name));
      
//       const checkedCount = fileKeys.filter(
//         (k) => selectedItems[k]?.checked
//       ).length;
      
//       const isAllChecked =
//         fileKeys.length > 0 && checkedCount === fileKeys.length;
      
//       const isIndeterminate =
//         checkedCount > 0 && checkedCount < fileKeys.length;
  
  
//   // ================= BREADCRUMB =================
//   const renderPath = () => {
//     if (!path) return "Root";

//     const parts = path.split("/");
//     return parts.map((p, i) => (
//       <span key={i}>
//         {i !== 0 && " / "}
//         {p}
//       </span>
//     ));
//   };


//  const flatFiles = files; // sudah urut dari terbaru
                  
//                   // 🔥 CARI INDEX GLOBAL
//                   const getGlobalIndex = (name) => {
//                     return flatFiles.findIndex((f) => f.name === name);
//                   };
                  
//                   // 🔥 NAV
//                   const next = () => {
//                     setViewerIndex((i) => (i < flatFiles.length - 1 ? i + 1 : i));
//                   };
                  
//                   const prev = () => {
//                     setViewerIndex((i) => (i > 0 ? i - 1 : i));
//                   };


                  
//                   let startX = 0;

//                   const handleTouchStart = (e) => {
//                     startX = e.touches[0].clientX;
//                   };
                  
//                   const handleTouchEnd = (e) => {
//                     const endX = e.changedTouches[0].clientX;
                  
//                     if (startX - endX > 50) next(); // kiri
//                     if (endX - startX > 50) prev(); // kanan
//                   };


//                   useEffect(() => {
//                     const handleKey = (e) => {
//                       if (!viewerOpen) return;
                  
//                       if (e.key === "ArrowRight") next();
//                       if (e.key === "ArrowLeft") prev();
//                       if (e.key === "Escape") setViewerOpen(false);
//                     };
                  
//                     window.addEventListener("keydown", handleKey);
//                     return () => window.removeEventListener("keydown", handleKey);
//                   }, [viewerOpen]);


//  const VideoItem = ({ url }) => {
//   const ref = useRef();
//   const [visible, setVisible] = useState(false);

//   useEffect(() => {
//     const observer = new IntersectionObserver(([entry]) => {
//       setVisible(entry.isIntersecting);
//     });

//     if (ref.current) observer.observe(ref.current);

//     return () => observer.disconnect();
//   }, []);

//   return (
//     <div ref={ref}>
//       {visible && (
//         <video
//           src={url}
//           autoPlay
//           muted
//           loop
//           playsInline
//         />
//       )}
//     </div>
//   );
// };

// const preloadVideo = (url) => {
//   const video = document.createElement("video");
//   video.src = url;
//   video.preload = "auto";
// };

// useEffect(() => {
//   if (files[viewerIndex + 1]) {
//     preloadVideo(getUrl1(files[viewerIndex + 1].name));
//   }
// }, [viewerIndex]);

// // const url = getUrl(file.name);

// const urlCache = useRef({});

// const getCachedUrl = (name) => {
//   if (!urlCache.current[name]) {
//     urlCache.current[name] = getUrl(name);
//   }
//   return urlCache.current[name];
// };

//   return (
//     <div className="p-4">
//       <h1 className="text-xl font-bold mb-4">Gallery Supabase</h1>

//       {/* BACK */}
//       {history.length > 0 && (
//         <button onClick={goBack} className="mb-2 px-3 py-1 bg-gray-200 rounded">
//           ← Kembali
//         </button>
//       )}

//       {/* 📍 CURRENT PATH */}
//       <div className="mb-3 text-sm text-gray-600">
//         📂 {renderPath()}
//       </div>

//       {/* 📊 TOTAL  <input type="checkbox" onChange={handleSelectAll} />*/}
//       <div className="mb-4 text-sm">
//         Total: {folders.length} Folder | {files.length} File
//       </div>

//       <div className="flex items-center gap-4 mb-4">
//         <label className="flex items-center gap-2 cursor-pointer">
         
//         <input
//           ref={selectAllRef}
//           type="checkbox"
//           checked={isAllChecked}
//           onChange={handleSelectAll}
//         />
//           Pilih Semua
//         </label>
      
//         <div className="text-sm">
//           Dipilih: {totalChecked}
//         </div>
      
//         <button
//           onClick={downloadSelected}
//           disabled={downloading || totalChecked === 0}
//           className="px-3 py-1 bg-green-500 text-white rounded disabled:bg-gray-300"
//         >
//           {downloading ? "Downloading..." : "Download"}
//         </button>
//       </div>

    

//       {folders.map((f, i) => {
       
//         const key = makeKey("folder", f.name);
      
//         return (
//           <div
//             key={i}
//             className="flex items-center gap-2 p-3 border rounded hover:bg-gray-100"
//           >
//             <input
//               type="checkbox"
//                ref={selectAllRef}
//                     checked={!!isChecked(key)}
               
//                   onChange={handleSelectAll}
//             />
      
//             <div
//               onClick={() => openFolder(f.name)}
//               className="cursor-pointer flex-1"
//             >
//               📁 {f.name}
//             </div>
//           </div>
//         );
//       })}

//           {Object.keys(grouped).map((group) => (
//             <div key={group} className="mb-6">
//               <h2 className="font-semibold mb-2">{group}</h2>
          
//             <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6 gap-2">
//                 {grouped[group].map((file, i) => {
                
//                   const key = makeKey("file", file.name);
//                   const url = getUrl(file.name);
                 
          
//                   return (
//                     <div key={i} 
                    
//                        className="relative"
//                         style={{
//                           gridRowEnd: `span ${Math.ceil((file.height|| 200) / 10)}`
//                         }}
//                     >
//                       {/* ✅ CHECKBOX  className="break-inside-avoid relative" */}
//                       <input
//                         type="checkbox"
//                         className="absolute top-1 left-1 z-10 bg-white"
//                         checked={!!isChecked(key)}
//                         disabled={isDownloaded(key)}
//                         onChange={() => toggleSelect(key)}
//                       />
          
//                       {isImage(file.name) && (
//                       <Image
//   src={url}
//   width={300}
//   height={300}
//   loading="lazy"
// />
                          
//                       )}
          
                   
//                         {isVideo(file.name) && (

//                                 <video
//                                   preload="none" // 🔥 penting
//                                   muted
//                                   playsInline
//                                 />
//                         )}
                      
          
//                       {/* ✅ FALLBACK FILE */}
//                       {!isImage(file.name) && !isVideo(file.name) && (
//                         <div className="p-4 border rounded bg-gray-100 text-sm">
//                           📄 {file.name}
//                         </div>
//                       )}
//                     </div>
//                   );
//                 })}
//               </div>
//             </div>
//           ))}
//             {viewerOpen && (
//   <div
//     className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center"
//     onClick={() => setViewerOpen(false)}
//   >
//     <div
//       className="relative max-w-full max-h-full flex items-center justify-center"
//       onClick={(e) => e.stopPropagation()}
//       onTouchStart={handleTouchStart}
//       onTouchEnd={handleTouchEnd}
//     >
//       {/* CLOSE */}
//       <button
//         className="absolute top-4 right-4 text-white text-2xl z-50"
//         onClick={() => setViewerOpen(false)}
//       >
//         ✕
//       </button>

//       {/* LEFT */}
//       <button
//         className="absolute left-2 top-1/2 -translate-y-1/2 text-white text-3xl z-50"
//         onClick={prev}
//       >
//         ‹
//       </button>

//       {/* RIGHT */}
//       <button
//         className="absolute right-2 top-1/2 -translate-y-1/2 text-white text-3xl z-50"
//         onClick={next}
//       >
//         ›
//       </button>

//       {/* CONTENT */}
//       {isImage(flatFiles[viewerIndex]?.name) && (
//         <img
//           src={getUrl1(flatFiles[viewerIndex].name)} // 🔥 TANPA DOWNLOAD MODE
//           className="max-w-screen max-h-screen object-contain"
//         />
//       )}

//       {isVideo(flatFiles[viewerIndex]?.name) && (
//         <video
//           src={getUrl1(flatFiles[viewerIndex].name)} // 🔥 TANPA DOWNLOAD MODE
//           controls
//           autoPlay
//           className="max-w-screen max-h-screen"
//         />
//       )}
//     </div>
//   </div>
// )}
//     </div>
//   );
// }












//   // const downloadSelected1 = async () => {
//   //   setDownloading(true);
  
//   //   for (const key in selectedItems) {
//   //     const item = selectedItems[key];
  
//   //     if (!item.checked || item.downloaded) continue;
  
//   //     const isFile = key.startsWith("file-");
//   //     if (!isFile) continue; // skip folder
  
//   //     const fileName = key.replace("file-", "");
//   //     const url = getUrl(fileName);
  
//   //     // download trigger
//   //     const a = document.createElement("a");
//   //     a.href = url;
//   //     a.download = fileName;
//   //     document.body.appendChild(a);
//   //     a.click();
//   //     document.body.removeChild(a);
  
//   //     // update state -> jadi downloaded & uncheck
//   //     setSelectedItems((prev) => ({
//   //       ...prev,
//   //       [key]: {
//   //         ...prev[key],
//   //         downloaded: true,
//   //         checked: false
//   //       }
//   //     }));
  
//   //     // delay biar ga crash browser
//   //     await new Promise((res) => setTimeout(res, 500));
//   //   }
  
//   //   setDownloading(false);
//   // };


//   // const handleSelectAll121 = () => {
//   //   const all = {};
  
//   //   folders.forEach((f) => {
//   //     // const key = `folder-${f.name}`;
//   //     const key = `folder-${path}-${f.name}`;
//   //     all[key] = {
//   //       checked: true,
//   //       downloaded: false
//   //     };
//   //   });
  
//   //   files.forEach((f) => {
//   //     // const key = `file-${f.name}`;
//   //     const key = `file-${path}-${f.name}`;
//   //     all[key] = {
//   //       checked: true,
//   //       downloaded: false
//   //     };
//   //   });
  
//   //   setSelectedItems(all);
//   // };
//   //  const toggleSelect22222 = (key) => {
//   //   setSelectedItems((prev) => ({
//   //     ...prev,
//   //     [key]: prev[key]
//   //       ? { ...prev[key], checked: !prev[key].checked }
//   //       : { checked: true, downloaded: false }
//   //   }));
//   // };

//   const getUrl1 = (fileName) => {
//     const fullPath = path ? `${path}/${fileName}` : fileName;
//     return supabase.storage.from("Env-v2").getPublicUrl(fullPath).data.publicUrl;
//   };






//   // const isAllChecked =
//   //   allFileKeys.length > 0 &&
//   //   allFileKeys.every((k) => selectedItems[k]?.checked);
  
//   // const isIndeterminate =
//   //   allFileKeys.some((k) => selectedItems[k]?.checked) && !isAllChecked;

//   // 🔥 taruh di sini (di dalam component, sebelum return)

// // ambil semua file dari grouped
   

// // const isFile = key.startsWith("file-");
//     // if (!isFile) continue;

//     // const fileName = key.replace("file-", "");
//     // const fileName = key.replace(`file-${path}-`, "");
//     // const url = getUrl(fileName);

//   {/* ================= FOLDER ================= 
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
//          // const key = `folder-${f.name}`;
//          checked={isChecked(key)}
//               disabled={isDownloaded(key)}
//               onChange={() => toggleSelect(key)}
//       )}*/}



//       {/* ================= FILE =================
//       {Object.keys(grouped).map((group) => (
//         <div key={group} className="mb-6">
//           <h2 className="font-semibold mb-2">{group}</h2>

//           <div className="grid grid-cols-3 gap-2">
//             {grouped[group].map((file, i) => (
//               <img
//                 key={i}
//                 src={getUrl(file.name)}
//                 onClick={() => setSelectedIndex(i)}
//                 className="w-full h-32 object-cover rounded cursor-pointer"
//               />
//             ))}
//           </div>
//         </div>
//       ))} */}

// {/*  {Object.keys(grouped).map((group) => (
//           <div key={group} className="mb-6">
//             <h2 className="font-semibold mb-2">{group}</h2>
        
//             <div className="grid grid-cols-3 gap-2">
//               {grouped[group].map((file, i) => {
//                 const key = `file-${file.name}`;
        
//                 return (
//                   <div key={i} className="relative">
//                     <input
//                       type="checkbox"
//                       className="absolute top-1 left-1 z-10"
//                       checked={isChecked(key)}
//                       disabled={isDownloaded(key)}
//                       onChange={() => toggleSelect(key)}
//                     />
        
//                     <img
//                       src={getUrl(file.name)}
//                       className={`w-full h-32 object-cover rounded cursor-pointer ${
//                         isDownloaded(key) ? "opacity-40" : ""
//                       }`}
//                     />
//                   </div>
//                 );
//               })}
//             </div>
//           </div>
//         ))} */}



//      {/* ✅ MASONRY RESPONSIVE
//               <div className="columns-2 md:columns-3 lg:columns-5 xl:columns-6 gap-2 space-y-2"> 
//                 // const key = `file-${path}-${file.name}`;
//                                     <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6 gap-2 auto-rows-[10px] [grid-auto-flow:dense]">*/}
          


//                       {/* ✅ IMAGE
//                       {isImage(file.name) && (
//                         <img
//                           src={url}
//                           className={`w-full h-auto rounded ${
//                             isDownloaded(key) ? "opacity-40" : ""
//                           }`}
//                           loading="lazy"
//                         />
//                       )} */}
//   {/*<img
//                           src={url}
//                           onClick={(e) => {
//                             e.stopPropagation();
//                             setViewerIndex(getGlobalIndex(file.name));
//                             setViewerOpen(true);
//                           }}
//                           className={`w-full h-auto rounded cursor-pointer ${
//                             isDownloaded(key) ? "opacity-40" : ""
//                           }`}
//                           loading="lazy"
//                         />
                        
                        
                        
//                          <img
//                             src={url}
//                             onLoad={(e) => handleImageLoad(e, file.name)}
//                             onClick={(e) => {
//                               e.stopPropagation();
//                               setViewerIndex(getGlobalIndex(file.name));
//                               setViewerOpen(true);
//                             }}
//                             className="w-full h-auto rounded cursor-pointer"
//                           />
                        
//                         */}

//    {/* ✅ VIDEO 
//                       {isVideo(file.name) && (
//                         <video
//                           src={url}
//                           controls
//                           className={`w-full h-auto rounded ${
//                             isDownloaded(key) ? "opacity-40" : ""
//                           }`}
//                         />
//                       )}*/}

//                                   {/* <video
//                             src={url}
//                             onClick={(e) => {
//                               e.stopPropagation();
//                               setViewerIndex(getGlobalIndex(file.name));
//                               setViewerOpen(true);
//                             }}
//                             className={`w-full h-auto rounded cursor-pointer ${
//                               isDownloaded(key) ? "opacity-40" : ""
//                             }`}
//                           />

//                             // <video
//                             //   src={url}
//                             //   onLoadedMetadata={(e) => handleVideoLoad(e, file.name)}
//                             //   onClick={(e) => {
//                             //     e.stopPropagation();
//                             //     setViewerIndex(getGlobalIndex(file.name));
//                             //     setViewerOpen(true);
//                             //   }}
//                             //   className="w-full h-auto rounded cursor-pointer"
//                             // />
                          
//                           */}

