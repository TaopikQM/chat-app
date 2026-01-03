"use client";
import { useEffect, useState } from "react";
import { getDatabase, ref, get } from "firebase/database";
// import { db } from "@/lib/firebase";

import { database } from "../config/firebase";

export default function AdminRTDBExplorer() {
  const [nodes, setNodes] = useState([]);
  const [currentPath, setCurrentPath] = useState("");
  const [nodeData, setNodeData] = useState(null);

  // const db = getDatabase(app);

  // load root
  useEffect(() => {
    get(ref(database, "/")).then((snap) => {
      if (snap.exists()) {
        setNodes(Object.keys(snap.val()));
      }
    });
  }, []);

  const loadNode = async (key) => {
    const path = currentPath ? `${currentPath}/${key}` : key;
    setCurrentPath(path);
    console.log("LOADING PATH:", path);

    const snap = await get(ref(db, path));
    if (!snap.exists()) return;

    const val = snap.val();
    console.log("LOAD:", path, val);

    if (typeof val === "object") {
      setNodes(Object.keys(val));
    console.log("NODE DATA:", val);
      setNodeData(val);
      console.log("SET NODE DATA:", val);
    } else {
      setNodes([]);
      setNodeData(val);
    }
  };

  return (
    <div style={{ padding: 16 }}>
      <h2>RTDB EXPLORER</h2>

      <div style={{ marginBottom: 8 }}>
        <strong>PATH:</strong> /{currentPath}
      </div>

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        {nodes.map((k) => (
          <button
            key={k}
            onClick={() => loadNode(k)}
            style={{
              padding: "4px 8px",
              border: "1px solid #ccc",
              borderRadius: 4,
            }}
          >
            {k}
          </button>
        ))}
      </div>

      <pre
        style={{
          marginTop: 16,
          background: "#000",
          color: "#0f0",
          padding: 12,
          fontSize: 12,
          maxHeight: "60vh",
          overflow: "auto",
        }}
      >
        {JSON.stringify(nodeData, null, 2)}
      </pre>
    </div>
  );
}
