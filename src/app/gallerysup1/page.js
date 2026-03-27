"use client";

import { useEffect, useState } from "react";
import { supabase } from "../config/supabase";

const bulanIndo = [
  "Januari","Februari","Maret","April","Mei","Juni",
  "Juli","Agustus","September","Oktober","November","Desember"
];

export default function GalleryPage() {
  const [path, setPath] = useState("");
  const [history, setHistory] = useState([]);
  const [folders, setFolders] = useState([]);
  const [files, setFiles] = useState([]);

  const [selectedIndex, setSelectedIndex] = useState(null);
  const [selectedItems, setSelectedItems] = useState({});
  const [downloading, setDownloading] = useState(false);

  const toggleSelect = (key) => {
    setSelectedItems((prev) => ({
      ...prev,
      [key]: prev[key]
        ? { ...prev[key], checked: !prev[key].checked }
        : { checked: true, downloaded: false }
    }));
  };

  const isChecked = (key) => selectedItems[key]?.checked;
  const isDownloaded = (key) => selectedItems[key]?.downloaded;

  const handleSelectAll = () => {
    const all = {};
  
    folders.forEach((f) => {
      const key = `folder-${f.name}`;
      all[key] = {
        checked: true,
        downloaded: false
      };
    });
  
    files.forEach((f) => {
      const key = `file-${f.name}`;
      all[key] = {
        checked: true,
        downloaded: false
      };
    });
  
    setSelectedItems(all);
  };

  const totalChecked = Object.values(selectedItems).filter(
    (v) => v.checked && !v.downloaded
  ).length;

  const downloadSelected = async () => {
    setDownloading(true);
  
    for (const key in selectedItems) {
      const item = selectedItems[key];
  
      if (!item.checked || item.downloaded) continue;
  
      const isFile = key.startsWith("file-");
      if (!isFile) continue; // skip folder
  
      const fileName = key.replace("file-", "");
      const url = getUrl(fileName);
  
      // download trigger
      const a = document.createElement("a");
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
  
      // update state -> jadi downloaded & uncheck
      setSelectedItems((prev) => ({
        ...prev,
        [key]: {
          ...prev[key],
          downloaded: true,
          checked: false
        }
      }));
  
      // delay biar ga crash browser
      await new Promise((res) => setTimeout(res, 500));
    }
  
    setDownloading(false);
  };

  // ================= FETCH ALL (NO LIMIT) =================
  const fetchData = async (folder = "") => {
    let allData = [];
    let offset = 0;
    const limit = 1000;

    while (true) {
      const { data, error } = await supabase.storage
        .from("Env-v1")
        .list(folder, {
          limit,
          offset,
          sortBy: { column: "created_at", order: "desc" }
        });

      if (error) {
        console.error(error);
        break;
      }

      if (!data || data.length === 0) break;

      allData = [...allData, ...data];

      if (data.length < limit) break;
      offset += limit;
    }

    const flds = [];
    const fls = [];

    allData.forEach((item) => {
      // ✅ folder biasanya id null
      if (!item.id) {
        flds.push(item);
      } else {
        fls.push(item);
      }
    });

    // ✅ SORT FINAL (DOUBLE SAFETY)
    fls.sort((a, b) => {
      return new Date(b.created_at || 0) - new Date(a.created_at || 0);
    });

    setFolders(flds);
    setFiles(fls);
  };

  useEffect(() => {
    fetchData(path);
  }, [path]);

  // ================= NAV =================
  const openFolder = (name) => {
    setHistory((prev) => [...prev, path]);
    setPath(path ? `${path}/${name}` : name);
  };

  const goBack = () => {
    setHistory((prev) => {
      const newHistory = [...prev];
      const last = newHistory.pop() || "";
      setPath(last);
      return newHistory;
    });
  };

  // ================= URL =================
  const getUrl = (fileName) => {
    const fullPath = path ? `${path}/${fileName}` : fileName;
    return supabase.storage.from("Env-v1").getPublicUrl(fullPath).data.publicUrl;
  };

  // ================= GROUP =================
  const grouped = {};
  files.forEach((file) => {
    const date = new Date(file.created_at || Date.now());
    const key = `${bulanIndo[date.getMonth()]} ${date.getFullYear()}`;

    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(file);
  });

  // ================= BREADCRUMB =================
  const renderPath = () => {
    if (!path) return "Root";

    const parts = path.split("/");
    return parts.map((p, i) => (
      <span key={i}>
        {i !== 0 && " / "}
        {p}
      </span>
    ));
  };

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">Gallery Supabase</h1>

      {/* BACK */}
      {history.length > 0 && (
        <button onClick={goBack} className="mb-2 px-3 py-1 bg-gray-200 rounded">
          ← Kembali
        </button>
      )}

      {/* 📍 CURRENT PATH */}
      <div className="mb-3 text-sm text-gray-600">
        📂 {renderPath()}
      </div>

      {/* 📊 TOTAL */}
      <div className="mb-4 text-sm">
        Total: {folders.length} Folder | {files.length} File
      </div>

      <div className="flex items-center gap-4 mb-4">
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" onChange={handleSelectAll} />
          Pilih Semua
        </label>
      
        <div className="text-sm">
          Dipilih: {totalChecked}
        </div>
      
        <button
          onClick={downloadSelected}
          disabled={downloading || totalChecked === 0}
          className="px-3 py-1 bg-green-500 text-white rounded disabled:bg-gray-300"
        >
          {downloading ? "Downloading..." : "Download"}
        </button>
      </div>

      {/* ================= FOLDER ================= 
      {folders.length > 0 && (
        <div className="mb-6">
          <h2 className="font-semibold mb-2">📁 Folder</h2>
          <div className="grid grid-cols-2 gap-2">
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
        </div>
      )}*/}

      {folders.map((f, i) => {
        const key = `folder-${f.name}`;
      
        return (
          <div
            key={i}
            className="flex items-center gap-2 p-3 border rounded hover:bg-gray-100"
          >
            <input
              type="checkbox"
              checked={isChecked(key)}
              disabled={isDownloaded(key)}
              onChange={() => toggleSelect(key)}
            />
      
            <div
              onClick={() => openFolder(f.name)}
              className="cursor-pointer flex-1"
            >
              📁 {f.name}
            </div>
          </div>
        );
      })}

      {/* ================= FILE =================
      {Object.keys(grouped).map((group) => (
        <div key={group} className="mb-6">
          <h2 className="font-semibold mb-2">{group}</h2>

          <div className="grid grid-cols-3 gap-2">
            {grouped[group].map((file, i) => (
              <img
                key={i}
                src={getUrl(file.name)}
                onClick={() => setSelectedIndex(i)}
                className="w-full h-32 object-cover rounded cursor-pointer"
              />
            ))}
          </div>
        </div>
      ))} */}

       {Object.keys(grouped).map((group) => (
          <div key={group} className="mb-6">
            <h2 className="font-semibold mb-2">{group}</h2>
        
            <div className="grid grid-cols-3 gap-2">
              {grouped[group].map((file, i) => {
                const key = `file-${file.name}`;
        
                return (
                  <div key={i} className="relative">
                    <input
                      type="checkbox"
                      className="absolute top-1 left-1 z-10"
                      checked={isChecked(key)}
                      disabled={isDownloaded(key)}
                      onChange={() => toggleSelect(key)}
                    />
        
                    <img
                      src={getUrl(file.name)}
                      className={`w-full h-32 object-cover rounded cursor-pointer ${
                        isDownloaded(key) ? "opacity-40" : ""
                      }`}
                    />
                  </div>
                );
              })}
            </div>
          </div>
        ))}
    </div>
  );
}
