"use client";

import { useEffect, useState } from "react";
import { database } from "../config/firebase";
import { ref as databaseRef, onValue } from "firebase/database";
import { format } from "date-fns";

const AdminChatTable = () => {
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    const messagesRef = databaseRef(database, "chatsBox"); // Referensi ke chatsBox di Firebase
    onValue(messagesRef, (snapshot) => {
      const data = snapshot.val(); // Mengambil data dari Firebase
      if (data) {
         console.log("Data dari Firebase:", data); // Debugging: menampilkan data di console
     
        setMessages(Object.values(data).reverse()); // Mengambil data dan langsung menampilkan tanpa format
      }
    });
  }, []);

  return (
    <div className="max-w-6xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-semibold mb-4">📋 Semua Pesan Chat</h2>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse border border-gray-300">
          <thead>
            <tr className="bg-gray-200">
              <th className="border border-gray-300 px-4 py-2">Pengirim</th>
              <th className="border border-gray-300 px-4 py-2">Penerima</th>
              <th className="border border-gray-300 px-4 py-2">Pesan</th>
              <th className="border border-gray-300 px-4 py-2">File</th>
              <th className="border border-gray-300 px-4 py-2">Waktu</th>
              <th className="border border-gray-300 px-4 py-2">Status</th>
            </tr>
          </thead>
          <tbody>
             {messages.map((msg, index) => (
              <tr key={index} className="hover:bg-gray-100">
                <td className="border border-gray-300 px-4 py-2 text-center">{msg.pengirim}</td>
                <td className="border border-gray-300 px-4 py-2 text-center">{msg.penerima}</td>
                <td className="border border-gray-300 px-4 py-2">{msg.pesan}</td>
                {/* File yang dikirim */}
                  <td className="border border-gray-300 px-4 py-2 text-center">
                    {msg.files && msg.files.length > 0 ? (
                      <div className="flex flex-col gap-1">
                        {msg.files.map((file, fileIndex) => (
                          <a
                            key={fileIndex}
                            href={file.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-500 underline"
                          >
                            📄 {file.name}
                          </a>
                        ))}
                      </div>
                    ) : (
                      "-"
                    )}
                  </td>
                <td className="border border-gray-300 px-4 py-2">{msg.timestamp && format(msg.timestamp, "dd/MM/yyyy HH:mm")}</td>
                <td className="border border-gray-300 px-4 py-2">{msg.read ? (
                    <button
                      type="button"
                      className="focus:outline-none text-white bg-green-700 hover:bg-green-800 focus:ring-4 focus:ring-green-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2"
                    >
                      ✅ Dibaca
                    </button>
                  ) : (
                    <button
                      type="button"
                      className="focus:outline-none text-white bg-red-700 hover:bg-red-800 focus:ring-4 focus:ring-red-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2"
                    >
                      ❌ Belum Dibaca
                    </button>
                  )}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminChatTable;
// "use client";

// import { useEffect, useState } from "react";
// import { database } from "../config/firebase";
// import { ref as databaseRef, onValue } from "firebase/database";
// import { format } from "date-fns";

// const AdminChatTable = () => {
//   const [messages, setMessages] = useState([]);

//   useEffect(() => {
//     const messagesRef = databaseRef(database, "chatsBox");
//     onValue(messagesRef, (snapshot) => {
//       const data = snapshot.val();
//       if (data) {
//         const formattedData = Object.entries(data).map(([id, value]) => ({
//           id,
//           ...value,
//           timestamp: value.timestamp ? new Date(value.timestamp) : null,
//           timestampRead: value.timestampRead ? new Date(value.timestampRead) : null,
//         }));
//         setMessages(formattedData.reverse());
//       }
//     });
//   }, []);

//   return (
//     <div className="max-w-6xl mx-auto p-6 bg-white rounded-lg shadow-md">
//       <h2 className="text-2xl font-semibold mb-4">📋 Semua Pesan Chat</h2>
//       <div className="overflow-x-auto">
//         <table className="w-full border-collapse border border-gray-300">
//           <thead>
//             <tr className="bg-gray-200">
//               <th className="border border-gray-300 px-4 py-2">Pengirim</th>
//               <th className="border border-gray-300 px-4 py-2">Penerima</th>
//               <th className="border border-gray-300 px-4 py-2">Pesan</th>
//               <th className="border border-gray-300 px-4 py-2">File</th>
//               <th className="border border-gray-300 px-4 py-2">Waktu</th>
//               <th className="border border-gray-300 px-4 py-2">Status</th>
//             </tr>
//           </thead>
//           <tbody>
//             {messages.map((msg) => (
//               <tr key={msg.id} className="hover:bg-gray-100">
//                 <td className="border border-gray-300 px-4 py-2 text-center">{msg.pengirim}</td>
//                 <td className="border border-gray-300 px-4 py-2 text-center">{msg.penerima}</td>
//                 <td className="border border-gray-300 px-4 py-2">{msg.pesan}</td>
//                 <td className="border border-gray-300 px-4 py-2 text-center">
//                   {msg.fileUrl && (
//                     <a href={msg.fileUrl} target="_blank" className="text-blue-500 underline">
//                       📄 {msg.fileName}
//                     </a>
//                   )}
//                 </td>
//                 <td className="border border-gray-300 px-4 py-2">{format(msg.timestamp, "dd/MM/yyyy HH:mm")}</td>
//                 <td className="border border-gray-300 px-4 py-2">{msg.read ? "✅ Dibaca" : "❌ Belum Dibaca"}</td>
//               </tr>
//             ))}
//           </tbody>
//         </table>
//       </div>
//     </div>
//   );
// };

// export default AdminChatTable;
