
"use client";
import { useEffect, useState, useCallback, useRef } from "react";
import { ref, list, getDownloadURL, getMetadata } from "firebase/storage";
import { storage, storageBackup1 } from "../config/firebase";

export default function Tablegallery1() {
  const [folders, setFolders] = useState([]); // daftar subfolder di currentFolder
  const [currentFolder, setCurrentFolder] = useState(""); // path folder aktif
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [nextPageToken, setNextPageToken] = useState(null);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [selectedFile1, setSelectedFile1] = useState(null);
  const [openId, setOpenId] = useState(null);


  const [selectedFile, setSelectedFile] = useState(null);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });
  const loaderRef = useRef(null);

  // Ambil isi folder (subfolder + files)
  const fetchContents = useCallback(
    async (folder, pageToken = null) => {
      setLoading(true);
      const folderPath = folder ? folder + "/" : ""; // root atau subfolder
      const folderRef = ref(storageBackup1, folderPath);
      const res = await list(folderRef, { pageToken });

      // subfolder
      const subFolders = res.prefixes.map((p) => {
        return {
          name: p.name.replace(folderPath, "").replace(/\/$/, ""),
          path: p.fullPath,
        };
      });

      // files
      const urls = await Promise.all(
        res.items.map(async (itemRef) => {
          const url = await getDownloadURL(itemRef);
          const metadata = await getMetadata(itemRef);
          return { name: itemRef.name, url, size: metadata.size, 
          timeCreated: new Date(metadata.timeCreated), };
        })
      );

      urls.sort((a, b) => b.timeCreated - a.timeCreated);

      if (pageToken) {
        setFiles((prev) => [...prev, ...urls]);
      } else {
        setFolders(subFolders);
        setFiles(urls);
      }
      setNextPageToken(res.nextPageToken || null);
      setLoading(false);
    },
    []
  );

  // load awal (root)
  useEffect(() => {
    fetchContents("");
  }, [fetchContents]);

  // jika currentFolder berubah → ambil isinya
  useEffect(() => {
    fetchContents(currentFolder);
  }, [currentFolder, fetchContents]);

  // Infinite scroll untuk file
  useEffect(() => {
    if (!loaderRef.current) return;
    const observer = new IntersectionObserver(
      (entries) => {
        const target = entries[0];
        if (target.isIntersecting && nextPageToken && !loading) {
          fetchContents(currentFolder, nextPageToken);
        }
      },
      { threshold: 1 }
    );
    observer.observe(loaderRef.current);
    return () => observer.disconnect();
  }, [nextPageToken, loading, currentFolder, fetchContents]);

  // Navigasi ke atas (back folder)
  const goUp = () => {
    if (!currentFolder) return; // sudah root
    const parts = currentFolder.split("/");
    parts.pop(); // hapus folder terakhir
    setCurrentFolder(parts.join("/"));
  };

  const renderPreview = (file) => {
    const name = file.name.toLowerCase();
    if (name.match(/\.(jpg|jpeg|png|gif)$/i)) {
      return <img src={file.url} alt={file.name} className="w-20 h-20 object-cover rounded" />;
    } else if (name.match(/\.(mp4|webm|ogg)$/i)) {
      return <video src={file.url} controls className="w-20 h-20 object-cover rounded" />;
    } else if (name.match(/\.(mp3|wav|m4a)$/i)) {
      return <audio src={file.url} controls className="w-40" />;
    } else if (name.match(/\.(pdf)$/i)) {
      return <span className="inline-block w-20 h-20 bg-red-200 text-red-800 flex items-center justify-center rounded font-bold">PDF</span>;
    } else {
      return <span className="inline-block w-20 h-20 bg-gray-200 text-gray-800 flex items-center justify-center rounded font-bold">FILE</span>;
    }
  };

const renderPreview1 = (file) => {
  if (file.type?.startsWith("image")) {
    return (
      <img
        src={file.url}
        className="max-h-64 mx-auto rounded"
      />
    );
  }

  if (file.type?.startsWith("video")) {
    return (
      <video controls className="max-h-64 mx-auto">
        <source src={file.url} />
      </video>
    );
  }

  return (
    <a
      href={file.url}
      target="_blank"
      className="text-blue-600 underline"
    >
      Buka File
    </a>
  );
};


  const toggleSelectFile = (file) => {
    setSelectedFiles((prev) =>
      prev.includes(file) ? prev.filter((f) => f !== file) : [...prev, file]
    );
  };

  const toggleSelectAll = () => {
    if (selectedFiles.length === files.length) {
      setSelectedFiles([]);
    } else {
      setSelectedFiles([...files]);
    }
  };

  const downloadSelected = () => {
    selectedFiles.forEach((file) => {
      const a = document.createElement("a");
      a.href = file.url;
      a.download = file.name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    });
  };

  const formatBytes = (bytes) => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const totalSelectedSize = selectedFiles.reduce((acc, f) => acc + (f.size || 0), 0);

  const requestSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  const sortedFiles = [...files];
  if (sortConfig.key) {
    sortedFiles.sort((a, b) => {
      if (sortConfig.key === "name") {
        return sortConfig.direction === "asc"
          ? a.name.localeCompare(b.name)
          : b.name.localeCompare(a.name);
      } else if (sortConfig.key === "size") {
        return sortConfig.direction === "asc" ? a.size - b.size : b.size - a.size;
      }
      return 0;
    });
  }

// Auto-refresh isi folder setiap 7 detik (cek pembaruan file)
// useEffect(() => {
//   const interval = setInterval(async () => {
//     if (!currentFolder) return;
//     const folderPath = currentFolder ? currentFolder + "/" : "";
//     const folderRef = ref(storage, folderPath);
//     const res = await list(folderRef);
//     const urls = await Promise.all(
//       res.items.map(async (itemRef) => {
//         const url = await getDownloadURL(itemRef);
//         const metadata = await getMetadata(itemRef);
//         return { name: itemRef.name, url, size: metadata.size,
//           timeCreated: new Date(metadata.timeCreated), };
//       })
//     );

//     // Urutkan terbaru dulu (berdasarkan nama, bisa juga timestamp kalau ada)
//     // urls.sort((a, b) => b.name.localeCompare(a.name));
    
//     urls.sort((a, b) => b.timeCreated - a.timeCreated);

//     // Bandingkan dengan state lama, kalau beda → update
//     setFiles((prevFiles) => {
//       if (JSON.stringify(urls) !== JSON.stringify(prevFiles)) {
//         return urls;
//       }
//       return prevFiles;
//     });
//   }, 60000); // setiap 7 detik cek

//   return () => clearInterval(interval);
// }, [currentFolder]);
useEffect(() => {
  if (!currentFolder) return;
  let prevNames = [];

  const interval = setInterval(async () => {
    const folderPath = currentFolder + "/";
    const folderRef = ref(storage, folderPath);
    const res = await list(folderRef);

    const currentNames = res.items.map((item) => item.name);

    // Hanya update jika jumlah atau nama file berubah
    const changed =
      currentNames.length !== prevNames.length ||
      !currentNames.every((n, i) => n === prevNames[i]);

    if (!changed) return; // Tidak ada yang berubah, skip

    prevNames = currentNames;

    const urls = await Promise.all(
      res.items.map(async (itemRef) => {
        const [url, metadata] = await Promise.all([
          getDownloadURL(itemRef),
          getMetadata(itemRef),
        ]);
        return {
          name: itemRef.name,
          url,
          size: metadata.size,
          timeCreated: new Date(metadata.timeCreated),
        };
      })
    );

    urls.sort((a, b) => b.timeCreated - a.timeCreated);
    setFiles(urls);
  }, 60000); // 1 menit sekali

  return () => clearInterval(interval);
}, [currentFolder]);



  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6 text-center">📂 Gallery Files</h1>

      {/* Navigasi folder */}
      <div className="mb-6 flex flex-wrap gap-3">
        {currentFolder && (
          <button
            onClick={goUp}
            className="px-4 py-2 rounded border bg-yellow-200 hover:bg-yellow-300"
          >
            ⬅️ Up
          </button>
        )}
        {folders.map((f) => (
          <button
            key={f.path}
            onClick={() => setCurrentFolder(f.path)}
            className={`px-4 py-2 rounded border ${
              currentFolder === f.path
                ? "bg-blue-500 text-white"
                : "bg-gray-100 hover:bg-gray-200"
            }`}
          >
            {f.name}
          </button>
        ))}
      </div>

      {currentFolder && (
        <h2 className="text-xl font-semibold mb-4">📁 Folder: {currentFolder}</h2>
      )}

      {/* File table 
      {files.length > 0 && (
        <div className="mb-4 flex items-center gap-4">
          <button
            onClick={downloadSelected}
            disabled={selectedFiles.length === 0}
            className={`px-4 py-2 rounded text-white ${
              selectedFiles.length > 0 ? "bg-blue-500 hover:bg-blue-600" : "bg-gray-300 cursor-not-allowed"
            }`}
          >
            Download {selectedFiles.length} file{selectedFiles.length > 1 ? "s" : ""}
          </button>
          {selectedFiles.length > 0 && (
            <span className="text-gray-700">Total Size: {formatBytes(totalSelectedSize)}</span>
          )}
        </div>
      )}*/}

        {files.length > 0 && (
        <div className="mb-4 flex items-center gap-4">
          {selectedFiles.length > 0 ? (
            <>
              <a
                href={`/api/downloadaja?urls=${encodeURIComponent(
                  JSON.stringify(
                    selectedFiles.map((f) => ({ url: f.url, filename: f.name }))
                  )
                )}`}
                className="px-4 py-2 rounded bg-blue-500 text-white hover:bg-blue-600"
              >
                Downloadaja {selectedFiles.length} file
                {selectedFiles.length > 1 ? "s" : ""}
              </a>
              <span className="text-gray-700">
                Total Size: {formatBytes(totalSelectedSize)}
              </span>
            </>
          ) : (
            <button
              disabled
              className="px-4 py-2 rounded text-white bg-gray-300 cursor-not-allowed"
            >
              Download
            </button>
          )}
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="min-w-full border border-gray-300">
          <thead className="bg-gray-100">
            <tr>
              <th className="border px-4 py-2">
                <input
                  type="checkbox"
                  checked={selectedFiles.length === files.length && files.length > 0}
                  onChange={toggleSelectAll}
                />
              </th>
              <th className="border px-4 py-2">No</th>
              <th className="border px-4 py-2 cursor-pointer" onClick={() => requestSort("name")}>
                Nama File
              </th>
              <th className="border px-4 py-2">Preview</th>
              <th className="border px-4 py-2 cursor-pointer" onClick={() => requestSort("size")}>
                Size
              </th>
              <th className="border px-4 py-2">Download</th>
            </tr>
          </thead>
          <tbody>
            {sortedFiles.map((file, idx) => (
              // <tr key={idx} className="hover:bg-gray-50">
              
                <React.Fragment key={file.id}>
              <tr  className="hover:bg-gray-50">
                <td className="border px-4 py-2 text-center">
                  <input
                    type="checkbox"
                    checked={selectedFiles.includes(file)}
                    onChange={() => toggleSelectFile(file)}
                  />
                </td>
                <td className="border px-4 py-2 text-center">{idx + 1}</td>
                <td className="border px-4 py-2">{file.name}</td>
               {/*  <td className="border px-4 py-2 text-center cursor-pointer"onClick={() => setSelectedFile(file)}
                          data-modal-target="preview-modal"
                          data-modal-toggle="preview-modal"
                        >{renderPreview(file)}</td>
                        //                     <button
  //                       onClick={() => setSelectedFile1(file)}
  //                       className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
  //                     >
  //                       Lihat
  //                     </button>
  //                   </td>
  //                         <td className="border px-4 py-2 text-center">
  // <button
  //   onClick={() =>
  //     setOpenId(openId === file.id ? null : file.id)
  //   }
  //   className={`px-3 py-1 rounded text-white ${
  //     openId === file.id ? "bg-red-600" : "bg-blue-600"
  //   }`}
  // >
  //   {openId === file.id ? "Tutup" : "View"}
  // </button>{openId === file.id && (
  <tr>
    <td colSpan={TOTAL_KOLOM} className="border px-4 py-3 bg-gray-50">
      {renderPreview(file)}
    </td>
  </tr>
)}
*/}
                    <td className="border px-4 py-2 text-center">
  
                       <button
  onClick={() =>
    setOpenIndex(openIndex === idx ? null : idx)
  }
  className={`px-3 py-1 rounded text-white ${
    openIndex === idx ? "bg-red-600" : "bg-blue-600"
  }`}
>
  {openIndex === idx ? "Tutup" : "View"}
</button>
</td>



                <td className="border px-4 py-2 text-center">{formatBytes(file.size)}</td>
                <td className="border px-4 py-2 text-center">
                 <a href={`/api/downloadsatuaa?url=${encodeURIComponent(file.url)}&filename=${encodeURIComponent(file.name)}`}
                    className="px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700"
                  >
                    Unduh
                  </a>
                </td>
              </tr>
  {openIndex === idx && (
  <tr>
    <td colSpan={6} className="border bg-gray-50 p-4 text-center">
      <img
        src={file.url}
        alt={file.name}
        className="max-h-64 mx-auto rounded"
      />
    </td>
  </tr>
)}

    </React.Fragment>
            ))}
          </tbody>
        </table>

        <div ref={loaderRef} className="h-10 flex items-center justify-center mt-4">
          {loading && <p className="text-gray-500">Loading...</p>}
          {!nextPageToken && !loading && <p className="text-gray-400">✅ Semua file sudah dimuat</p>}
        </div>
      </div>

           {selectedFile1 && (
  <div className="mt-4 border p-4 rounded">
    {selectedFile1.type?.startsWith("image") && (
      <img
        src={selectedFile1.url}
        alt="preview"
        className="max-w-full max-h-[400px]"
      />
    )}

    {selectedFile1.type?.startsWith("video") && (
      <video controls className="max-w-full max-h-[400px]">
        <source src={selectedFile1.url} />
      </video>
    )}

    {!selectedFile1.type && (
      <a
        href={selectedFile1.url}
        target="_blank"
        className="text-blue-600 underline"
      >
        Buka File
      </a>
    )}
  </div>
)}

            {/* Modal Preview */}
      <div
        id="preview-modal"
        tabIndex="-1"
        aria-hidden="true"
        className={`${
          selectedFile ? "flex" : "hidden"
        } overflow-y-auto overflow-x-hidden fixed top-0 right-0 left-0 z-50 justify-center items-center w-full h-[calc(100%-1rem)] max-h-full bg-black/50`}
      >
        <div className="relative p-4 w-full max-w-md max-h-full">
          <div className="relative bg-white rounded-lg shadow dark:bg-gray-700">
            <button
              type="button"
              className="absolute top-3 end-2.5 text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center dark:hover:bg-gray-600 dark:hover:text-white"
              onClick={() => setSelectedFile(null)}
              data-modal-hide="preview-modal"
            >
              <svg
                className="w-3 h-3"
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 14 14"
              >
                <path
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"
                />
              </svg>
              <span className="sr-only">Close modal</span>
            </button>

            {/* Konten Modal */}
            <div className="p-4 md:p-5 flex flex-col items-center justify-center">
              {selectedFile && selectedFile.name.match(/\.(jpg|jpeg|png|gif)$/i) && (
                <img
                  src={selectedFile.url}
                  alt={selectedFile.name}
                  className="max-h-[70vh] rounded-lg mb-4"
                />
              )}
              {selectedFile && selectedFile.name.match(/\.(mp4|webm|ogg)$/i) && (
                <video
                  src={selectedFile.url}
                  controls
                  className="max-h-[70vh] rounded-lg mb-4"
                />
              )}
              {selectedFile && selectedFile.name.match(/\.(pdf)$/i) && (
                <embed
                  src={selectedFile.url}
                  type="application/pdf"
                  className="w-full h-[70vh] mb-4"
                />
              )}

              <p className="text-sm text-gray-500 dark:text-gray-300">
                {selectedFile?.name}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
