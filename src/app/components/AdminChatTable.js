"use client";

import { useEffect, useState } from "react";
import { database } from "../config/firebase";
import { ref as databaseRef, get, onValue,remove,update } from "firebase/database";
import { format } from "date-fns";

const AdminChatTable = () => {
  const [messages, setMessages] = useState([]);
  const [users, setUsers] = useState([]);
  const [logsChats, setLogsChats] = useState([]);
  const [logsUsers, setLogsUsers] = useState([]);

   
  const [searchTerm, setSearchTerm] = useState(''); 
    
  // const [totalItems, setTotalItems] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortOrderName, setSortOrderName] = useState('asc');

  const [selectedIds, setSelectedIds] = useState([]);

  const isSelected = (id) => selectedIds.includes(id);

  const toggleSelectAll = () => {
    if (selectedIds.length === messages.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(messages.map(msg => msg.id));
    }
  };

  const toggleSelect = (id) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const selectByPengirim = (pengirim) => {
    const filtered = messages.filter(msg => msg.pengirim === pengirim).map(msg => msg.id);
    setSelectedIds(filtered);
  };
  

  //ambil buat nampilin data
  useEffect(() => {
    const messagesRef1 = databaseRef(database, "chatsBox2");
    const messagesRef = databaseRef(database, "chatsBox1");
     const usersRef = databaseRef(database, "pengguna");
    const logsChatsRef = databaseRef(database, "log_chatsBox");
    const logsUsersRef = databaseRef(database, "logs_pengguna");
    
     // Ambil Data Pengguna & Pesan Bersamaan
     onValue(usersRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
            const usersArray = Object.keys(data)
                .map(key => ({
                    id: key,
                    ...data[key]
                }))
                .sort((a, b) => b.isOnline - a.isOnline); // 🔹 Online di atas

            setUsers(usersArray);

        }
    });

    let messages1 = [];
  let messages2 = [];

  const combineAndSetMessages = () => {
    const allMessages = [...messages1, ...messages2].sort(
      (a, b) => b.timestamp - a.timestamp
    );
    setMessages(allMessages);
  };

  const unsub1 = onValue(messagesRef, (snapshot) => {
    const data = snapshot.val();
    messages1 = data
      ? Object.keys(data).map(key => ({ id: key, ...data[key] }))
      : [];
    combineAndSetMessages();
  });

  const unsub2 = onValue(messagesRef1, (snapshot) => {
    const data = snapshot.val();
    messages2 = data
      ? Object.keys(data).map(key => ({ id: key, ...data[key] }))
      : [];
    combineAndSetMessages();
  });

  // Bersihkan listener saat komponen unmount
  return () => {
    unsub1();
    unsub2();
  };

    // onValue(messagesRef, (snapshot) => {
    //   const data = snapshot.val();
    //   // const messages = [];
    // //   const messages =data? Object.keys(data).map(key => ({ id: key, ...data[key] })) : [];
    // //   // });
    // //   setMessages(messages);
    //     const messages = Object.keys(data)
    //         .map(key => ({
    //             id: key,
    //             ...data[key]
    //         }))
    //         .sort((a, b) => b.timestamp - a.timestamp); // 🔹 Urutkan dari terbaru ke terlama

    //     setMessages(messages);
    // //   console.log(messages);
      
    //   // setTotalItems(data.length);
    // }
    // );
    // Ambil Data dari Dua Pesan dan Gabungkan
  // const fetchMessages = () => {
  //   let messages1 = [];
  //   let messages2 = [];

  //   onValue(messagesRef, (snapshot1) => {
  //     const data1 = snapshot1.val();
  //     messages1 = data1
  //       ? Object.keys(data1).map(key => ({ id: key, ...data1[key] }))
  //       : [];

  //     onValue(messagesRef1, (snapshot2) => {
  //       const data2 = snapshot2.val();
  //       messages2 = data2
  //         ? Object.keys(data2).map(key => ({ id: key, ...data2[key] }))
  //         : [];

  //       const combinedMessages = [...messages1, ...messages2].sort(
  //         (a, b) => b.timestamp - a.timestamp
  //       );

  //       setMessages(combinedMessages); // 🔹 Set gabungan semua pesan
  //     });
  //   });
  // };

  // fetchMessages();

     // Listener dari messagesRef
  // const unsubscribe1 = onValue(messagesRef, (snapshot) => {
  //   const data = snapshot.val();
  //   const messages = data
  //     ? Object.keys(data).map(key => ({ id: key, ...data[key] }))
  //     : [];
  //   updateCombinedMessages(messages, null); // 👈 update bagian pertama
  // });

  // // Listener dari messagesRef1
  // const unsubscribe2 = onValue(messagesRef1, (snapshot) => {
  //   const data = snapshot.val();
  //   const messages = data
  //     ? Object.keys(data).map(key => ({ id: key, ...data[key] }))
  //     : [];
  //   updateCombinedMessages(null, messages); // 👈 update bagian kedua
  // });

  // // Cleanup
  // return () => {
  //   unsubscribe1();
  //   unsubscribe2();
  // };
// }, []);


    //  // Ambil data pengguna
    //  onValue(usersRef, (snapshot) => {
    //     const data = snapshot.val();
    //     setUsers(data ? Object.entries(data).map(([id, value]) => ({ id, ...value })) : []);
    //     // console.log(data);
    // });

    // // Ambil data log chats
    // onValue(logsChatsRef, (snapshot) => {
    //     const data = snapshot.val();
    //     setLogsChats(data ? Object.entries(data).map(([id, value]) => ({ id, ...value })) : []);
    // });

    // // Ambil data log pengguna
    // onValue(logsUsersRef, (snapshot) => {
    //     const data = snapshot.val();
    //     setLogsUsers(data ? Object.entries(data).map(([id, value]) => ({ id, ...value })) : []);
    // });
     // Promise.all untuk ambil semua data bersamaan
    // const fetchData = async () => {
    //   const promises = [
    //     new Promise((resolve) => onValue(messagesRef, (snapshot) => resolve(snapshot.val()), { onlyOnce: true })),
    //     new Promise((resolve) => onValue(usersRef, (snapshot) => resolve(snapshot.val()), { onlyOnce: true })),
    //     new Promise((resolve) => onValue(logsChatsRef, (snapshot) => resolve(snapshot.val()), { onlyOnce: true })),
    //     new Promise((resolve) => onValue(logsUsersRef, (snapshot) => resolve(snapshot.val()), { onlyOnce: true })),
    //   ];

    //   const [messagesData, usersData, logsChatsData, logsUsersData] = await Promise.all(promises);

    //   setMessages(messagesData ? Object.keys(messagesData).map((key) => ({ id: key, ...messagesData[key] })) : []);
    //   setUsers(usersData ? Object.keys(usersData).map((key) => ({ id: key, ...usersData[key] })) : []);
    //   setLogsChats(logsChatsData ? Object.keys(logsChatsData).map((key) => ({ id: key, ...logsChatsData[key] })) : []);
    //   setLogsUsers(logsUsersData ? Object.keys(logsUsersData).map((key) => ({ id: key, ...logsUsersData[key] })) : []);
    //   console.log(setUsers);
    // };

    // fetchData();
  }, []);
//   const updateCombinedMessages = (() => {
//   let cache1 = [];
//   let cache2 = [];

//   return (newMessages1, newMessages2) => {
//     if (newMessages1 !== null) cache1 = newMessages1;
//     if (newMessages2 !== null) cache2 = newMessages2;

//     const combined = [...cache1, ...cache2].sort(
//       (a, b) => b.timestamp - a.timestamp
//     );
//     setAllMessages(combined);
//   };
// })();

  const handleBulkDelete = () => {
    selectedIds.forEach(id => handleDelete(id));
    setSelectedIds([]); // Kosongkan setelah hapus
  };
  //hapus data dan nampilin konfirmasi
  const handleDelete = async (Id) => {
    // const confirmation = window.confirm("Apakah Anda yakin ingin menghapus data ini?");
    // if (confirmation) {
    //     const userRef = databaseRef(rtdb, `kp/magang/users/${userId}`);
    //     await remove(userRef);
    //     alert("Data berhasil dihapus.");
    // }
    const userRef = databaseRef(database, `chatsBox/${Id}`);
    const userRef1 = databaseRef(database, `chatsBox1/${Id}`);
     const logMessageRef = databaseRef(database, `log_chatsBox/${Id}`);

    try {
        // Ambil data user berdasarkan userId
        const snapshot = await get(userRef);
      
        const snapshot1 = await get(userRef1);
      
        if (snapshot.exists() || snapshot1.exists()) {
            // const userData = snapshot.val();
          
            const userData = snapshot.exists() ? snapshot.val() : {};
            const userData1 = snapshot1.exists() ? snapshot1.val() : {};

          // Log data yang mau dihapus
    console.log("Data dari chatsBox:", userData);
    console.log("Data dari chatsBox1:", userData1);
            // console.log(userData);
            // const { pengirim, penerima, pesan } = userData; // Ambil nama dan NIM dari data
            // const { pengirim, penerima, pesan } = userData1; // Ambil nama dan NIM dari data

          const pengirim = userData.pengirim || userData1.pengirim || "-";
          const penerima = userData.penerima || userData1.penerima || "-";
          const pesan = userData.pesan || userData1.pesan || "-";

            // Konfirmasi penghapusan dengan informasi pengguna
           // const confirmation = window.confirm(`Apakah Anda yakin ingin menghapus data ini?\nPengirim: ${pengirim}\nPenerima: ${penerima}\nPesan: ${pesan}`);
            
            // if (confirmation) {
              const logData = {
                  ...userData,
                  ...userData1,
                  deleteTime: Date.now()
                };
          
                // Simpan ke log
                await update(logMessageRef, logData);
                await remove(userRef);
                await remove(userRef1);
                //alert(`Data ${pengirim} ke ${penerima} dengan pesan (${pesan}) berhasil dihapus.`);
            }
        // } else {
        //     alert("Data Pesan tidak ditemukan.");
        // }
    } catch (error) {
        console.error("Error menghapus data:", error);
        alert("Terjadi kesalahan saat menghapus data.");
    }
  };

  // Fungsi untuk mengurutkan berdasarkan nama
  const sortByName = () => {
    const sortedData = [...messages].sort((a, b) => {
        const comparison = a.pesan.localeCompare(b.name);
        return sortOrderName === 'asc' ? comparison : -comparison;
    });
    setMessages(sortedData);
    setSortOrderName(sortOrderName === 'asc' ? 'desc' : 'asc');
  };

   const handleSearch = (e) => {
      setSearchTerm(e.target.value);
      setCurrentPage(1);
  };

  const handleItemsPerPageChange = (e) => {
      setItemsPerPage(e.target.value);
      setCurrentPage(1);
  };
  // const filteredData = messages.filter(item => 
  //   (item.pesan.toLowerCase().includes(searchTerm.toLowerCase()))||
  //     (item.penerima.toLowerCase().includes(searchTerm.toLowerCase()))||
  //    (item.pengirim.toLowerCase().includes(searchTerm.toLowerCase()))
  // ) ;
  const filteredData = messages.filter(item => 
  (item.pesan && item.pesan.toLowerCase().includes(searchTerm.toLowerCase())) ||
  (item.penerima && item.penerima.toLowerCase().includes(searchTerm.toLowerCase())) ||
  (item.pengirim && item.pengirim.toLowerCase().includes(searchTerm.toLowerCase()))
);

  // Pagination Logic
  const totalItems = filteredData.length;
  const indexOfLast = currentPage * itemsPerPage;
  const indexOfFirst = indexOfLast - itemsPerPage;
  const displayedData = filteredData.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  
  const getPagination = () => {
      let pages = [];
      
      if (totalPages <= 5) {
          pages = Array.from({ length: totalPages }, (_, i) => i + 1);
      } else {
          if (currentPage <= 3) {
              pages = [1, 2, 3, 4, 5, '...'];
          } else if (currentPage >= totalPages - 2) {
              pages = [1, '...', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
          } else {
              pages = [1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages];
          }
      }
      return pages;
  };

  
const handleToggleStatu11s = async (Id, currentStatus) => {
    const newStatus = currentStatus === "ACTIVE" ? "NOT ACTIVE" : "ACTIVE";
    const confirmation = window.confirm(`Apakah Anda yakin ingin mengubah status ke ${newStatus}?`);
    if (!confirmation) return;

    try {
        // Langsung refer ke chatsBox
        let userRef = databaseRef(database, `chatsBox/${Id}`);
        let snapshot = await get(userRef);

        // Jika tidak ada di chatsBox, coba di chatsBox1
        if (!snapshot.exists()) {
            userRef = databaseRef(database, `chatsBox1/${Id}`);
            snapshot = await get(userRef);

            if (!snapshot.exists()) {
                alert("Data tidak ditemukan di chatsBox maupun chatsBox1.");
                return;
            }
        }

        // Update status
        await update(userRef, { status: newStatus });

        // Update state lokal
        setMessages(prevMessages =>
            prevMessages.map(msg =>
                msg.id === Id ? { ...msg, status: newStatus } : msg
            )
        );

        alert(`Status berhasil diubah menjadi ${newStatus}.`);
    } catch (error) {
        console.error("Error memperbarui status:", error);
        alert("Terjadi kesalahan saat memperbarui status.");
    }
};
  const handleToggleStatus = async (Id, currentStatus) => {
    const userRef = databaseRef(database, `chatsBox/${Id}`);

    try {
        const newStatus = currentStatus === "ACTIVE" ? "NOT ACTIVE" : "ACTIVE";
        const confirmation = window.confirm(`Apakah Anda yakin ingin mengubah status ke ${newStatus}?`);
        
        if (confirmation) {
            await update(userRef, { status: newStatus });

            // Update state secara lokal agar UI langsung berubah tanpa reload
            setMessages(prevMessages =>
                prevMessages.map(msg =>
                    msg.id === Id ? { ...msg, status: newStatus } : msg
                )
            );
            alert(`Status berhasil diubah menjadi ${newStatus}.`);
        }
    } catch (error) {
        console.error("Error memperbarui status:", error);
        alert("Terjadi kesalahan saat memperbarui status.");
    }
};


  
  

  return (
    <div>
        <div className="relative overflow-x-auto shadow-md sm:rounded-lg ">
            {/* //title */}
            <div className="flex justify-between items-center px-4 py-3 ">
                <h2 className="text-xl font-bold mb-4">Pesan Messages</h2>
            </div>
            {/* //search */}
            <div className="flex justify-between  px-4 py-3">
              <div className="flex">
                  <select
                      id="itemsPerPage"
                      value={itemsPerPage}
                      onChange={handleItemsPerPageChange}
                      className="border rounded px-2 py-1"
                  >
                      <option value={10}>10</option>
                      <option value={25}>25</option>
                      <option value={50}>50</option>
                      <option value={100}>100</option>
                  </select>
                  <div className="mt-4 text-sm text-gray-500">
                      Total User: {filteredData.length}
                  </div>
              </div>
              <div className="relative ">
                  <form className="max-w-md mx-auto ml-2"> 
                      <label className="mb-2 text-sm font-medium text-gray-00 sr-only dark:text-white">Search</label>
                      <div >
                          <input 
                          onChange={handleSearch} 
                          value={searchTerm} type="search" id="default-search" className=" block w-full p-4 ps-10 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-400 dark:border-gray-600 dark:placeholder-gray-800 dark:text-gray-800 dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="Search" required />
                      </div>
                  </form>
              </div>
            </div>
          <br />
         <div>
                            {/* <button
            onClick={handleBulkDelete}
            className="bg-red-500 text-white px-4 py-2 rounded disabled:opacity-50"
            disabled={selectedIds.length === 0}
          >
            Hapus {selectedIds.length > 0 ? `(${selectedIds.length})` : ''}
          </button>*/}
                            {selectedIds.length > 0 && (
  <button
    onClick={handleBulkDelete}
    className="bg-red-500 text-white px-4 py-2 rounded"
  >
    Hapus ({selectedIds.length})
  </button>
)}

</div>
{/*<div>
          Filter pengirim:
          {[...new Set(messages.map(msg => msg.pengirim))].map(p => (
            <button
              key={p}
              onClick={() => selectByPengirim(p)}
              className="ml-2 bg-blue-500 text-white px-2 py-1 rounded"
            >
              {p}
            </button>
          ))}
        </div>*/}
<div className="flex items-center gap-2">
  <label htmlFor="filterPengirim">Filter pengirim:</label>
  <select
    id="filterPengirim"
    onChange={(e) => {
      const value = e.target.value;
      if (value !== "") {selectByPengirim(value);
                        }
      else {
        // Reset pilihan jika "Pilih Pengirim" dipilih lagi
        setSelectedIds([]);
      }
    }}
    className="border rounded px-2 py-1"
  >
    <option value="">Pilih Pengirim</option>
    {[...new Set(messages.map(msg => msg.pengirim))].map(p => (
      <option key={p} value={p}>
        {p}
      </option>
    ))}
  </select>
</div>
          <br />
                            
          <table className="w-full text-sm bg-white border border-gray-300 rounded-lg">
            <thead>
                <tr className="bg-gray-200">
                  <th>
                    <input
                      type="checkbox"
                      onChange={toggleSelectAll}
                      checked={selectedIds.length === messages.length}
                    />
                  </th>
                  <th className="border border-gray-300 px-4 py-2">No 
                   
                  </th>
                  <th className="border border-gray-300 px-4 py-2">Pengirim
                    <button onClick={sortByName} className="ml-2">
                        {sortOrderName === 'asc' ? '↑' : '↓'}
                    </button>
                  </th>
                  <th className="border border-gray-300 px-4 py-2">Penerima
                    <button onClick={sortByName} className="ml-2">
                        {sortOrderName === 'asc' ? '↑' : '↓'}
                    </button>
                  </th>
                  <th className="border border-gray-300 px-4 py-2">Pesan
                    <button onClick={sortByName} className="ml-2">
                        {sortOrderName === 'asc' ? '↑' : '↓'}
                    </button>
                  </th>
                  <th className="border border-gray-300 px-4 py-2">File

                  </th>
                  <th className="border border-gray-300 px-4 py-2">Waktu
                  </th>
<th className="border border-gray-300 px-4 py-2">Status</th>
{/*<th className="border border-gray-300 px-4 py-2">OnUser</th>*/}
                  <th className="border border-gray-300 px-4 py-2">Read</th>
                  <th className="border border-gray-300 px-4 py-2">DiBaca</th>
<th className="border border-gray-300 px-4 py-2">Action</th>
                </tr>
            </thead>
            <tbody>
              {displayedData.length>0?
                displayedData.map((msg, index) => (
                <tr key={index}  className={isSelected(msg.id) ? 'bg-yellow-100' : 'hover:bg-gray-100'}>
                  <td>
                    <input
                      type="checkbox"
                      checked={isSelected(msg.id)}
                      onChange={() => toggleSelect(msg.id)}
                    />
                  </td>
                  <td className="border border-gray-300 px-4 py-2 text-center">{(currentPage - 1) * itemsPerPage + index + 1}</td>
                  {/* className="hover:bg-gray-100"
                  <td className="border border-gray-300 px-4 py-2 text-center">{msg.pengirim}</td>
                  <td className="border border-gray-300 px-4 py-2 text-center">{msg.penerima}</td> */}
                  {/* <td className="border border-gray-300 px-4 py-2 text-center flex items-center justify-center">
                <div className={`h-2.5 w-2.5 rounded-full me-2 ${users.find(user => user.user === msg.pengirim)?.isOnline ? 'bg-green-500' : 'bg-red-500'}`}></div>
                {msg.pengirim}
            </td>

            <td className="border border-gray-300 px-4 py-2 text-center flex items-center justify-center">
                <div className={`h-2.5 w-2.5 rounded-full me-2 ${users.find(user => user.user === msg.penerima)?.isOnline ? 'bg-green-500' : 'bg-red-500'}`}></div>
                {msg.penerima}
            </td> */}
            <td className="border border-gray-300 px-4 py-2 text-center">
                <div className="flex items-center justify-center">
                    <div className={`h-2.5 w-2.5 rounded-full me-2 ${users.find(user => user.user === msg.pengirim)?.isOnline ? 'bg-green-500' : 'bg-red-500'}`}></div>
                    {msg.pengirim}
                </div>
            </td>
            <td className="border border-gray-300 px-4 py-2 text-center">
                <div className="flex items-center justify-center">
                    <div className={`h-2.5 w-2.5 rounded-full me-2 ${users.find(user => user.user === msg.penerima)?.isOnline ? 'bg-green-500' : 'bg-red-500'}`}></div>
                    {msg.penerima}
                </div>
            </td>
            {/* <td className="border border-gray-300 px-4 py-2 text-center flex items-center justify-center">
                    <div className={`h-2.5 w-2.5 rounded-full me-2 ${sender?.isOnline ? 'bg-green-500' : 'bg-red-500'}`}></div>
                    {msg.pengirim}
                </td>
                <td className="border border-gray-300 px-4 py-2 text-center flex items-center justify-center">
                    <div className={`h-2.5 w-2.5 rounded-full me-2 ${receiver?.isOnline ? 'bg-green-500' : 'bg-red-500'}`}></div>
                    {msg.penerima}
                </td>*/}
                  <td className="border border-gray-300 px-4 py-2 text-left">{msg.pesan}</td>
                  {/* File yang dikirim */}
                   <td className="border border-gray-300 px-4 py-2 ">
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
                  <td className="border border-gray-300 px-4 py-2 text-center">{msg.timestamp && format(msg.timestamp, "dd/MM/yyyy HH:mm:ss")}</td>
<td className="border border-gray-300 px-4 py-2 text-center">
                      <button
                          onClick={() => handleToggleStatus(msg.id, msg.status)}
                          className={`px-4 py-2 rounded-lg text-white ${
                              msg.status === "ACTIVE" ? "bg-green-600 hover:bg-green-700" : "bg-red-600 hover:bg-red-700"
                          }`}
                      >
                          {msg.status}
                      </button>
                  </td>
                        {/* <td className="border border-gray-300 px-4 py-2 text-center">
                      <button
                          onClick={() => handleToggleStatus(msg.id, msg.onUSer)}
                          className={`px-4 py-2 rounded-lg text-white ${
                              msg.onUSer === "ON" ? "bg-green-600 hover:bg-green-700" : "bg-red-600 hover:bg-red-700"
                          }`}
                      >
                          {msg.onUSer}
                      </button>
                  </td>*/}

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
                    )}
                  </td>
                  <td className="border border-gray-300 px-4 py-2 text-center">{msg.timestampRead && format(msg.timestampRead, "dd/MM/yyyy HH:mm:ss")}</td>
 <td className="border border-gray-300 py-2 px-4  text-center">
                    <>
                        <button
                            onClick={() => handleDelete(msg.id)}
                            // className="bg-red-500 text-white px-4 py-2 rounded-md"
                            type="button" className="focus:outline-none text-white bg-red-700 hover:bg-red-800 focus:ring-4 focus:ring-red-300 font-medium rounded-md text-sm px-4 py-2  dark:bg-red-600 dark:hover:bg-red-700 dark:focus:ring-red-900"
                        >
                            Hapus
                        </button>
                    </>
                  </td>
                </tr>
              )): (
                <tr>
                    <td colSpan="5" className="py-2 px-4 text-center">Data tidak ditemukan</td>
                </tr>
                )
              }
            </tbody>
          </table>
          {totalItems > itemsPerPage && (
              <nav className="m-4 flex items-center flex-column flex-wrap md:flex-row justify-between pt-4" aria-label="Table navigation">
                  <span className="text-sm font-normal text-gray-500 dark:text-gray-400">
                      Page {currentPage} of {totalPages}
                  </span>
                  
                  <ul className="inline-flex items-center -space-x-px">
                      <li>
                          <button
                              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                              className="py-2 px-4 border border-gray-300 rounded-l-lg dark:border-gray-600 dark:bg-gray-400 dark:text-white"
                              disabled={currentPage === 1}
                          >
                              Previous
                          </button>
                      </li>
                      {/* {[...Array(totalPages)].map((_, i) => (
                          <li key={i + 1}>
                              <button
                                  onClick={() => setCurrentPage(i + 1)}
                                  className={`py-2 px-4 border border-gray-300 ${currentPage === i + 1? 'border-gray-600 text-gray-600' : 'text-gray-500 dark:text-gray-400'}`}
                                  > {i +1}</button>
                                  </li>
                      ))} */}
                      {getPagination().map((page, index) => (
                          <li key={index}>
                              {page === '...' ? (
                                  <span className="py-2 px-4">...</span>
                              ) : (
                                  <button
                                      onClick={() => setCurrentPage(page)}
                                      className={`py-2 px-4 border border-gray-300 ${currentPage === page ? 'border-gray-600 text-gray-600' : 'text-gray-500 dark:text-gray-400'}`}
                                  >
                                      {page}
                                  </button>
                              )}
                          </li>
                      ))}
                      <li>
                          <button
                              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                              className="py-2 px-4 border border-gray-300 rounded-r-lg dark:border-gray-600 dark:bg-gray-400 dark:text-white"
                              disabled={currentPage === totalPages}
                          >
                              Next
                          </button>
                      </li>
                  </ul>
              </nav>
          )}
        </div>     
       
    </div>
  );
};

export default AdminChatTable;
// "use client";

// import { useEffect, useState } from "react";
// import { rtdb } from "../config/firebase";
// import { ref as databaseRef, onValue } from "firebase/database";
// import { format } from "date-fns";

// const AdminChatTable = () => {
//   const [messages, setMessages] = useState([]);
  
//   const [searchTerm, setSearchTerm] = useState(''); 
    
//   const [totalItems, setTotalItems] = useState(0);
//   const [itemsPerPage, setItemsPerPage] = useState(10);
//   const [currentPage, setCurrentPage] = useState(1);
//   const [sortOrderName, setSortOrderName] = useState('asc');

//   useEffect(() => {
//     const messagesRef = databaseRef(rtdb, "chatsBox");
//     onValue(messagesRef, (snapshot) => {
//       const data = snapshot.val();
//       // const messages = [];
//       const messages =data? Object.keys(data).map(key => ({ id: key, ...data[key] })) : [];
//       // });
//       setMessages(messages);
//       console.log(messages);
      
//       setTotalItems(data.length);
//     }
//     );
//   }, []);

//   // Fungsi untuk mengurutkan berdasarkan nama
//   const sortByName = () => {
//     const sortedData = [...messages].sort((a, b) => {
//         const comparison = a.pesan.localeCompare(b.name);
//         return sortOrderName === 'asc' ? comparison : -comparison;
//     });
//     setMessages(sortedData);
//     setSortOrderName(sortOrderName === 'asc' ? 'desc' : 'asc');
//   };

//    const handleSearch = (e) => {
//       setSearchTerm(e.target.value);
//       setCurrentPage(1);
//   };

//   const handleItemsPerPageChange = (e) => {
//       setItemsPerPage(e.target.value);
//       setCurrentPage(1);
//   };
//   const filteredData = messages.filter(item => 
//     //   item.files.toLowerCase().includes(searchTerm.toLowerCase())||
//       item.pesan.toLowerCase().includes(searchTerm.toLowerCase())||
//       item.penerima.toLowerCase().includes(searchTerm.toLowerCase())||
//      item.pengirim.toLowerCase().includes(searchTerm.toLowerCase())
//   ) ;

//   // Pagination Logic
//   const totalItemss = filteredData.length;
//   const indexOfLast = currentPage * itemsPerPage;
//   const indexOfFirst = indexOfLast - itemsPerPage;
//   const displayedData = filteredData.slice(indexOfFirst, indexOfLast);
//   const totalPages = Math.ceil(totalItemss / itemsPerPage);

//   const getPagination = () => {
//       let pages = [];
      
//       if (totalPages <= 5) {
//           pages = Array.from({ length: totalPages }, (_, i) => i + 1);
//       } else {
//           if (currentPage <= 3) {
//               pages = [1, 2, 3, 4, 5, '...'];
//           } else if (currentPage >= totalPages - 2) {
//               pages = [1, '...', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
//           } else {
//               pages = [1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages];
//           }
//       }
//       return pages;
//   };

  
  

//   return (
//     <div>
//         <div className="relative overflow-x-auto shadow-md sm:rounded-lg ">
//             {/* //title */}
//             <div className="flex justify-between items-center px-4 py-3 ">
//                 <h2 className="text-xl font-bold mb-4">Laporan Data4</h2>
//             </div>
//             {/* //search */}
//             <div className="flex justify-between  px-4 py-3">
//               <div className="flex">
//                   <select
//                       id="itemsPerPage"
//                       value={itemsPerPage}
//                       onChange={handleItemsPerPageChange}
//                       className="border rounded px-2 py-1"
//                   >
//                       <option value={10}>10</option>
//                       <option value={25}>25</option>
//                       <option value={50}>50</option>
//                       <option value={100}>100</option>
//                   </select>
//                   <div className="mt-4 text-sm text-gray-500">
//                       Total User: {filteredData.length}
//                   </div>
//               </div>
//               <div className="relative ">
//                   <form className="max-w-md mx-auto ml-2"> 
//                       <label className="mb-2 text-sm font-medium text-gray-00 sr-only dark:text-white">Search</label>
//                       <div >
//                           <input 
//                           onChange={handleSearch} 
//                           value={searchTerm} type="search" id="default-search" className=" block w-full p-4 ps-10 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-400 dark:border-gray-600 dark:placeholder-gray-800 dark:text-gray-800 dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="Search" required />
//                       </div>
//                   </form>
//               </div>
//             </div>
//           <br />
//           <table className="w-full text-sm bg-white border border-gray-300 rounded-lg">
//             <thead>
//                 <tr className="bg-gray-200">
//                   <th className="border border-gray-300 px-4 py-2">No 
//                     <button onClick={sortByName} className="ml-2">
//                         {sortOrderName === 'asc' ? '↑' : '↓'}
//                     </button>
//                   </th>
//                   <th className="border border-gray-300 px-4 py-2">Pengirim
//                     <button onClick={sortByName} className="ml-2">
//                         {sortOrderName === 'asc' ? '↑' : '↓'}
//                     </button>
//                   </th>
//                   <th className="border border-gray-300 px-4 py-2">Penerima
//                     <button onClick={sortByName} className="ml-2">
//                         {sortOrderName === 'asc' ? '↑' : '↓'}
//                     </button>
//                   </th>
//                   <th className="border border-gray-300 px-4 py-2">pesan
//                     <button onClick={sortByName} className="ml-2">
//                         {sortOrderName === 'asc' ? '↑' : '↓'}
//                     </button>
//                   </th>
//                   <th className="border border-gray-300 px-4 py-2">File

//                   </th>
//                   <th className="border border-gray-300 px-4 py-2">Waktu
//                   </th>
//                   <th className="border border-gray-300 px-4 py-2">Status</th>
//                   <th className="border border-gray-300 px-4 py-2">Read</th>
//                 </tr>
//             </thead>
//             <tbody>
//               {displayedData.length>0?
//                 displayedData.map((msg, index) => (
//                 <tr key={index} className="hover:bg-gray-100">
//                   <td className="border border-gray-300 px-4 py-2 text-center">{index + 1}</td>
//                   <td className="border border-gray-300 px-4 py-2 text-center">{msg.pengirim}</td>
//                   <td className="border border-gray-300 px-4 py-2 text-center">{msg.penerima}</td>
//                   <td className="border border-gray-300 px-4 py-2 text-left">{msg.pesan}</td>
//                   {/* File yang dikirim */}
//                    <td className="border border-gray-300 px-4 py-2 ">
//                      {msg.files && msg.files.length > 0 ? (
//                        <div className="flex flex-col gap-1">
//                          {msg.files.map((file, fileIndex) => (
//                          <a
//                             key={fileIndex}
//                              href={file.url}
//                              target="_blank"
//                              rel="noopener noreferrer"
//                              className="text-blue-500 underline"
//                           >
//                              📄 {file.name}
//                            </a>
//                          ))}
//                        </div>
//                     ) : (
//                      "-"
//                      )}
//                    </td>
//                   <td className="border border-gray-300 px-4 py-2 text-center">{msg.timestamp && format(msg.timestamp, "dd/MM/yyyy HH:mm:ss")}</td>
//                   <td className="border border-gray-300 px-4 py-2">{msg.read ? (
//                     <button
//                         type="button"
//                         className="focus:outline-none text-white bg-green-700 hover:bg-green-800 focus:ring-4 focus:ring-green-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2"
//                       >
//                         ✅ Dibaca
//                       </button>
//                     ) : (
//                       <button
//                         type="button"
//                         className="focus:outline-none text-white bg-red-700 hover:bg-red-800 focus:ring-4 focus:ring-red-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2"
//                       >
//                         ❌ Belum Dibaca
//                       </button>
//                     )}
//                   </td>
//                   <td className="border border-gray-300 px-4 py-2 text-center">{msg.timestampRead && format(msg.timestampRead, "dd/MM/yyyy HH:mm:ss")}</td>
//                 </tr>
//               )): (
//                 <tr>
//                     <td colSpan="5" className="py-2 px-4 text-center">Data tidak ditemukan</td>
//                 </tr>
//                 )
//               }
//             </tbody>
//           </table>
//           {totalItems > itemsPerPage && (
//               <nav className="m-4 flex items-center flex-column flex-wrap md:flex-row justify-between pt-4" aria-label="Table navigation">
//                   <span className="text-sm font-normal text-gray-500 dark:text-gray-400">
//                       Page {currentPage} of {totalPages}
//                   </span>
                  
//                   <ul className="inline-flex items-center -space-x-px">
//                       <li>
//                           <button
//                               onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
//                               className="py-2 px-4 border border-gray-300 rounded-l-lg dark:border-gray-600 dark:bg-gray-400 dark:text-white"
//                               disabled={currentPage === 1}
//                           >
//                               Previous
//                           </button>
//                       </li>
//                       {/* {[...Array(totalPages)].map((_, i) => (
//                           <li key={i + 1}>
//                               <button
//                                   onClick={() => setCurrentPage(i + 1)}
//                                   className={`py-2 px-4 border border-gray-300 ${currentPage === i + 1? 'border-gray-600 text-gray-600' : 'text-gray-500 dark:text-gray-400'}`}
//                                   > {i +1}</button>
//                                   </li>
//                       ))} */}
//                       {getPagination().map((page, index) => (
//                           <li key={index}>
//                               {page === '...' ? (
//                                   <span className="py-2 px-4">...</span>
//                               ) : (
//                                   <button
//                                       onClick={() => setCurrentPage(page)}
//                                       className={`py-2 px-4 border border-gray-300 ${currentPage === page ? 'border-gray-600 text-gray-600' : 'text-gray-500 dark:text-gray-400'}`}
//                                   >
//                                       {page}
//                                   </button>
//                               )}
//                           </li>
//                       ))}
//                       <li>
//                           <button
//                               onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
//                               className="py-2 px-4 border border-gray-300 rounded-r-lg dark:border-gray-600 dark:bg-gray-400 dark:text-white"
//                               disabled={currentPage === totalPages}
//                           >
//                               Next
//                           </button>
//                       </li>
//                   </ul>
//               </nav>
//           )}
//         </div>         
//     </div>
//   );
// };

// export default AdminChatTable;

// // "use client";

// // import { useEffect, useState } from "react";
// // import { database } from "../config/firebase";
// // import { ref as databaseRef, onValue } from "firebase/database";
// // import { format } from "date-fns";

// // const AdminChatTable = () => {
// //   const [messages, setMessages] = useState([]);
  
// //   const [searchTerm, setSearchTerm] = useState(''); 
    
// //   const [totalItems, setTotalItems] = useState(0);
// //   const [itemsPerPage, setItemsPerPage] = useState(10);
// //   const [currentPage, setCurrentPage] = useState(1);
// //   const [sortOrderName, setSortOrderName] = useState('asc');


// //   // Fungsi untuk mengurutkan berdasarkan nama
// //   const sortByName = () => {
// //     const sortedData = [...messages].sort((a, b) => {
// //         const comparison = a.name.localeCompare(b.name);
// //         return sortOrderName === 'asc' ? comparison : -comparison;
// //     });
// //     setMessages(sortedData);
// //     setSortOrderName(sortOrderName === 'asc' ? 'desc' : 'asc');
// //   };

// //    const handleSearch = (e) => {
// //       setSearchTerm(e.target.value);
// //       setCurrentPage(1);
// //   };

// //   const handleItemsPerPageChange = (e) => {
// //       setItemsPerPage(e.target.value);
// //       setCurrentPage(1);
// //   };
// //   const filteredData = messages.filter(item => 
// //       item.name.toLowerCase().includes(searchTerm.toLowerCase())||
// //       item.pesan.toLowerCase().includes(searchTerm.toLowerCase())||
// //       item.penerima.toLowerCase().includes(searchTerm.toLowerCase())||
// //      item.pengirim.toLowerCase().includes(searchTerm.toLowerCase())
// //   ) ;

// //   // Pagination Logic
// //   const totalItemss = filteredData.length;
// //   const indexOfLast = currentPage * itemsPerPage;
// //   const indexOfFirst = indexOfLast - itemsPerPage;
// //   const displayedData = filteredData.slice(indexOfFirst, indexOfLast);
// //   const totalPages = Math.ceil(totalItemss / itemsPerPage);

// //   const getPagination = () => {
// //       let pages = [];
      
// //       if (totalPages <= 5) {
// //           pages = Array.from({ length: totalPages }, (_, i) => i + 1);
// //       } else {
// //           if (currentPage <= 3) {
// //               pages = [1, 2, 3, 4, 5, '...'];
// //           } else if (currentPage >= totalPages - 2) {
// //               pages = [1, '...', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
// //           } else {
// //               pages = [1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages];
// //           }
// //       }
// //       return pages;
// //   };

// //   useEffect(() => {
// //     const messagesRef = databaseRef(database, "messages");
// //     onValue(messagesRef, (snapshot) => {
// //       const data = snapshot.val();
// //       const messages = [];
// //       Object.keys(data).forEach((key) => {
// //         messages.push({...data[key], id: key });
// //       });
// //       setMessages(messages);
      
// //       setTotalItems(data.length);
// //     }
// //     );
// //   }, []);
  

// //   return (
// //     <div>
// //         <div className="relative overflow-x-auto shadow-md sm:rounded-lg ">
// //             {/* //title */}
// //             <div className="flex justify-between items-center px-4 py-3 ">
// //                 <h2 className="text-xl font-bold mb-4">Laporan Data4</h2>
// //             </div>
// //             {/* //search */}
// //             <div className="flex justify-between  px-4 py-3">
// //               <div className="flex">
// //                   <select
// //                       id="itemsPerPage"
// //                       value={itemsPerPage}
// //                       onChange={handleItemsPerPageChange}
// //                       className="border rounded px-2 py-1"
// //                   >
// //                       <option value={10}>10</option>
// //                       <option value={25}>25</option>
// //                       <option value={50}>50</option>
// //                       <option value={100}>100</option>
// //                   </select>
// //                   <div className="mt-4 text-sm text-gray-500">
// //                       Total User: {filteredData.length}
// //                   </div>
// //               </div>
// //               <div className="relative ">
// //                   <form className="max-w-md mx-auto ml-2"> 
// //                       <label className="mb-2 text-sm font-medium text-gray-00 sr-only dark:text-white">Search</label>
// //                       <div >
// //                           <input 
// //                           onChange={handleSearch} 
// //                           value={searchTerm} type="search" id="default-search" className=" block w-full p-4 ps-10 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-400 dark:border-gray-600 dark:placeholder-gray-800 dark:text-gray-800 dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="Search" required />
// //                       </div>
// //                   </form>
// //               </div>
// //             </div>
// //           <br />
// //           <table className="w-full text-sm bg-white border border-gray-300 rounded-lg">
// //             <thead>
// //                 <tr className="bg-gray-200">
// //                   <th className="border border-gray-300 px-4 py-2">No 
// //                     <button onClick={sortByName} className="ml-2">
// //                         {sortOrderName === 'asc' ? '↑' : '↓'}
// //                     </button>
// //                   </th>
// //                   <th className="border border-gray-300 px-4 py-2">Pengirim
// //                     <button onClick={sortByName} className="ml-2">
// //                         {sortOrderName === 'asc' ? '↑' : '↓'}
// //                     </button>
// //                   </th>
// //                   <th className="border border-gray-300 px-4 py-2">Penerima
// //                     <button onClick={sortByName} className="ml-2">
// //                         {sortOrderName === 'asc' ? '↑' : '↓'}
// //                     </button>
// //                   </th>
// //                   <th className="border border-gray-300 px-4 py-2">pesan
// //                     <button onClick={sortByName} className="ml-2">
// //                         {sortOrderName === 'asc' ? '↑' : '↓'}
// //                     </button>
// //                   </th>
// //                   <th className="border border-gray-300 px-4 py-2">File
// //                     <button onClick={sortByName} className="ml-2">
// //                         {sortOrderName === 'asc' ? '↑' : '↓'}
// //                     </button>
// //                   </th>
// //                   <th className="border border-gray-300 px-4 py-2">Waktu
// //                   </th>
// //                   <th className="border border-gray-300 px-4 py-2">Status</th>
// //                   <th className="border border-gray-300 px-4 py-2">Read</th>
// //                 </tr>
// //             </thead>
// //             <tbody>
// //               {displayedData.length>0?
// //                 displayedData.map((msg, index) => (
// //                 <tr key={index} className="hover:bg-gray-100">
// //                   <td className="border border-gray-300 px-4 py-2 text-center">{index + 1}</td>
// //                   <td className="border border-gray-300 px-4 py-2 text-center">{msg.pengirim}</td>
// //                   <td className="border border-gray-300 px-4 py-2 text-center">{msg.penerima}</td>
// //                   <td className="border border-gray-300 px-4 py-2 text-left">{msg.pesan}</td>
// //                   <td className="border border-gray-300 px-4 py-2 text-center">
// //                     {msg.file && <a href={msg.file} target="_blank" rel="noopener noreferrer">{msg.file.substring(msg.file.lastIndexOf('/') + 1)}</a>}
// //                   </td>
// //                   <td className="border border-gray-300 px-4 py-2 text-center">{msg.timestamp && format(msg.timestamp, "dd/MM/yyyy HH:mm:ss")}</td>
// //                   <td className="border border-gray-300 px-4 py-2">{msg.read ? (
// //                     <button
// //                         type="button"
// //                         className="focus:outline-none text-white bg-green-700 hover:bg-green-800 focus:ring-4 focus:ring-green-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2"
// //                       >
// //                         ✅ Dibaca
// //                       </button>
// //                     ) : (
// //                       <button
// //                         type="button"
// //                         className="focus:outline-none text-white bg-red-700 hover:bg-red-800 focus:ring-4 focus:ring-red-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2"
// //                       >
// //                         ❌ Belum Dibaca
// //                       </button>
// //                     )}
// //                   </td>
// //                   <td className="border border-gray-300 px-4 py-2 text-center">{msg.timestampRead && format(msg.timestampRead, "dd/MM/yyyy HH:mm:ss")}</td>
// //                 </tr>
// //               )): (
// //                 <tr>
// //                     <td colSpan="5" className="py-2 px-4 text-center">Data tidak ditemukan</td>
// //                 </tr>
// //                 )
// //               }
// //             </tbody>
// //           </table>
// //           {totalItems > itemsPerPage && (
// //               <nav className="m-4 flex items-center flex-column flex-wrap md:flex-row justify-between pt-4" aria-label="Table navigation">
// //                   <span className="text-sm font-normal text-gray-500 dark:text-gray-400">
// //                       Page {currentPage} of {totalPages}
// //                   </span>
                  
// //                   <ul className="inline-flex items-center -space-x-px">
// //                       <li>
// //                           <button
// //                               onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
// //                               className="py-2 px-4 border border-gray-300 rounded-l-lg dark:border-gray-600 dark:bg-gray-400 dark:text-white"
// //                               disabled={currentPage === 1}
// //                           >
// //                               Previous
// //                           </button>
// //                       </li>
// //                       {/* {[...Array(totalPages)].map((_, i) => (
// //                           <li key={i + 1}>
// //                               <button
// //                                   onClick={() => setCurrentPage(i + 1)}
// //                                   className={`py-2 px-4 border border-gray-300 ${currentPage === i + 1? 'border-gray-600 text-gray-600' : 'text-gray-500 dark:text-gray-400'}`}
// //                                   > {i +1}</button>
// //                                   </li>
// //                       ))} */}
// //                       {getPagination().map((page, index) => (
// //                           <li key={index}>
// //                               {page === '...' ? (
// //                                   <span className="py-2 px-4">...</span>
// //                               ) : (
// //                                   <button
// //                                       onClick={() => setCurrentPage(page)}
// //                                       className={`py-2 px-4 border border-gray-300 ${currentPage === page ? 'border-gray-600 text-gray-600' : 'text-gray-500 dark:text-gray-400'}`}
// //                                   >
// //                                       {page}
// //                                   </button>
// //                               )}
// //                           </li>
// //                       ))}
// //                       <li>
// //                           <button
// //                               onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
// //                               className="py-2 px-4 border border-gray-300 rounded-r-lg dark:border-gray-600 dark:bg-gray-400 dark:text-white"
// //                               disabled={currentPage === totalPages}
// //                           >
// //                               Next
// //                           </button>
// //                       </li>
// //                   </ul>
// //               </nav>
// //           )}
// //         </div>         
// //     </div>
// //   );
// // };

// // export default AdminChatTable;
// // // "use client";

// // // import { useEffect, useState } from "react";
// // // import { database } from "../config/firebase";
// // // import { ref as databaseRef, onValue } from "firebase/database";
// // // import { format } from "date-fns";

// // // const AdminChatTable = () => {
// // //   const [messages, setMessages] = useState([]);
// // //   const [itemsPerPage, setItemsPerPage] = useState(10);
// // //   const [currentPage, setCurrentPage] = useState(1);
// // //   const [searchTerm, setSearchTerm] = useState('');
  
// // //   const [sortOrderName, setSortOrderName] = useState('asc');


// // //   // Fungsi untuk mengurutkan berdasarkan nama
// // //   const sortByName = () => {
// // //     const sortedData = [...messages].sort((a, b) => {
// // //         const comparison = a.name.localeCompare(b.name);
// // //         return sortOrderName === 'asc' ? comparison : -comparison;
// // //     });
// // //     setMessages(sortedData);
// // //     setSortOrderName(sortOrderName === 'asc' ? 'desc' : 'asc');
// // //   };

// // //    const handleSearch = (e) => {
// // //       setSearchTerm(e.target.value);
// // //   };

// // //   const handleItemsPerPageChange = (e) => {
// // //       setItemsPerPage(e.target.value);
// // //       setCurrentPage(1);
// // //   };
// // //   const filteredData = messages.filter(item => 
// // //       item.name.toLowerCase().includes(searchTerm.toLowerCase())||
// // //       item.pesan.toLowerCase().includes(searchTerm.toLowerCase())||
// // //       item.penerima.toLowerCase().includes(searchTerm.toLowerCase())||
// // //      item.pengirim.toLowerCase().includes(searchTerm.toLowerCase())
// // //   ) ;

// // //   // Pagination Logic
// // //   const totalItems = filteredData.length;
// // //   const indexOfLast = currentPage * itemsPerPage;
// // //   const indexOfFirst = indexOfLast - itemsPerPage;
// // //   const displayedData = filteredData.slice(indexOfFirst, indexOfLast);
// // //   const totalPages = Math.ceil(totalItems / itemsPerPage);

// // //   const getPagination = () => {
// // //       let pages = [];
      
// // //       if (totalPages <= 5) {
// // //           pages = Array.from({ length: totalPages }, (_, i) => i + 1);
// // //       } else {
// // //           if (currentPage <= 3) {
// // //               pages = [1, 2, 3, 4, 5, '...'];
// // //           } else if (currentPage >= totalPages - 2) {
// // //               pages = [1, '...', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
// // //           } else {
// // //               pages = [1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages];
// // //           }
// // //       }
// // //       return pages;
// // //   };

// // //   useEffect(() => {
// // //     const messagesRef = databaseRef(database, "messages");
// // //     onValue(messagesRef, (snapshot) => {
// // //       const data = snapshot.val();
// // //       const messages = [];
// // //       Object.keys(data).forEach((key) => {
// // //         messages.push({...data[key], id: key });
// // //       });
// // //       setMessages(messages);
// // //     }
// // //     );
// // //   }, []);
  

// // //   return (
// // //     <div>
// // //         <div className="relative overflow-x-auto shadow-md sm:rounded-lg ">
// // //             {/* //title */}
// // //             <div className="flex justify-between items-center px-4 py-3 ">
// // //                 <h2 className="text-xl font-bold mb-4">Laporan Data4</h2>
// // //             </div>
// // //             {/* //search */}
// // //             <div className="flex justify-between  px-4 py-3">
// // //               <div className="flex">
// // //                   <select
// // //                       id="itemsPerPage"
// // //                       value={itemsPerPage}
// // //                       onChange={handleItemsPerPageChange}
// // //                       className="border rounded px-2 py-1"
// // //                   >
// // //                       <option value={10}>10</option>
// // //                       <option value={25}>25</option>
// // //                       <option value={50}>50</option>
// // //                       <option value={100}>100</option>
// // //                   </select>
// // //                   <div className="mt-4 text-sm text-gray-500">
// // //                       Total User: {filteredData.length}
// // //                   </div>
// // //               </div>
// // //               <div className="relative ">
// // //                   <form className="max-w-md mx-auto ml-2"> 
// // //                       <label className="mb-2 text-sm font-medium text-gray-00 sr-only dark:text-white">Search</label>
// // //                       <div >
// // //                           <input 
// // //                           onChange={handleSearch} 
// // //                           value={searchTerm} type="search" id="default-search" className=" block w-full p-4 ps-10 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-400 dark:border-gray-600 dark:placeholder-gray-800 dark:text-gray-800 dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="Search" required />
// // //                       </div>
// // //                   </form>
// // //               </div>
// // //             </div>
// // //           <br />
// // //           <table className="w-full text-sm bg-white border border-gray-300 rounded-lg">
// // //             <thead>
// // //                 <tr className="bg-gray-200">
// // //                   <th className="border border-gray-300 px-4 py-2">No 
// // //                     <button onClick={sortByName} className="ml-2">
// // //                         {sortOrderName === 'asc' ? '↑' : '↓'}
// // //                     </button>
// // //                   </th>
// // //                   <th className="border border-gray-300 px-4 py-2">Pengirim
// // //                     <button onClick={sortByName} className="ml-2">
// // //                         {sortOrderName === 'asc' ? '↑' : '↓'}
// // //                     </button>
// // //                   </th>
// // //                   <th className="border border-gray-300 px-4 py-2">Penerima
// // //                     <button onClick={sortByName} className="ml-2">
// // //                         {sortOrderName === 'asc' ? '↑' : '↓'}
// // //                     </button>
// // //                   </th>
// // //                   <th className="border border-gray-300 px-4 py-2">pesan
// // //                     <button onClick={sortByName} className="ml-2">
// // //                         {sortOrderName === 'asc' ? '↑' : '↓'}
// // //                     </button>
// // //                   </th>
// // //                   <th className="border border-gray-300 px-4 py-2">File
// // //                     <button onClick={sortByName} className="ml-2">
// // //                         {sortOrderName === 'asc' ? '↑' : '↓'}
// // //                     </button>
// // //                   </th>
// // //                   <th className="border border-gray-300 px-4 py-2">Waktu
// // //                   </th>
// // //                   <th className="border border-gray-300 px-4 py-2">Status</th>
// // //                   <th className="border border-gray-300 px-4 py-2">Read</th>
// // //                 </tr>
// // //             </thead>
// // //             <tbody>
// // //               {displayedData.length>0?
// // //                 displayedData.map((msg, index) => (
// // //                 <tr key={index} className="hover:bg-gray-100">
// // //                   <td className="border border-gray-300 px-4 py-2 text-center">{index + 1}</td>
// // //                   <td className="border border-gray-300 px-4 py-2 text-center">{msg.pengirim}</td>
// // //                   <td className="border border-gray-300 px-4 py-2 text-center">{msg.penerima}</td>
// // //                   <td className="border border-gray-300 px-4 py-2 text-left">{msg.pesan}</td>
// // //                   <td className="border border-gray-300 px-4 py-2 text-center">
// // //                     {msg.file && <a href={msg.file} target="_blank" rel="noopener noreferrer">{msg.file.substring(msg.file.lastIndexOf('/') + 1)}</a>}
// // //                   </td>
// // //                   <td className="border border-gray-300 px-4 py-2 text-center">{msg.timestamp && format(msg.timestamp, "dd/MM/yyyy HH:mm:ss")}</td>
// // //                   <td className="border border-gray-300 px-4 py-2">{msg.read ? (
// // //                     <button
// // //                         type="button"
// // //                         className="focus:outline-none text-white bg-green-700 hover:bg-green-800 focus:ring-4 focus:ring-green-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2"
// // //                       >
// // //                         ✅ Dibaca
// // //                       </button>
// // //                     ) : (
// // //                       <button
// // //                         type="button"
// // //                         className="focus:outline-none text-white bg-red-700 hover:bg-red-800 focus:ring-4 focus:ring-red-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2"
// // //                       >
// // //                         ❌ Belum Dibaca
// // //                       </button>
// // //                     )}
// // //                   </td>
// // //                   <td className="border border-gray-300 px-4 py-2 text-center">{msg.timestampRead && format(msg.timestampRead, "dd/MM/yyyy HH:mm:ss")}</td>
// // //                 </tr>
// // //               )): (
// // //                 <tr>
// // //                     <td colSpan="5" className="py-2 px-4 text-center">Data tidak ditemukan</td>
// // //                 </tr>
// // //                 )
// // //               }
// // //             </tbody>
// // //           </table>
// // //           {totalItems > itemsPerPage && (
// // //               <nav className="m-4 flex items-center flex-column flex-wrap md:flex-row justify-between pt-4" aria-label="Table navigation">
// // //                   <span className="text-sm font-normal text-gray-500 dark:text-gray-400">
// // //                       Page {currentPage} of {totalPages}
// // //                   </span>
                  
// // //                   <ul className="inline-flex items-center -space-x-px">
// // //                       <li>
// // //                           <button
// // //                               onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
// // //                               className="py-2 px-4 border border-gray-300 rounded-l-lg dark:border-gray-600 dark:bg-gray-400 dark:text-white"
// // //                               disabled={currentPage === 1}
// // //                           >
// // //                               Previous
// // //                           </button>
// // //                       </li>
// // //                       {/* {[...Array(totalPages)].map((_, i) => (
// // //                           <li key={i + 1}>
// // //                               <button
// // //                                   onClick={() => setCurrentPage(i + 1)}
// // //                                   className={`py-2 px-4 border border-gray-300 ${currentPage === i + 1? 'border-gray-600 text-gray-600' : 'text-gray-500 dark:text-gray-400'}`}
// // //                                   > {i +1}</button>
// // //                                   </li>
// // //                       ))} */}
// // //                       {getPagination().map((page, index) => (
// // //                           <li key={index}>
// // //                               {page === '...' ? (
// // //                                   <span className="py-2 px-4">...</span>
// // //                               ) : (
// // //                                   <button
// // //                                       onClick={() => setCurrentPage(page)}
// // //                                       className={`py-2 px-4 border border-gray-300 ${currentPage === page ? 'border-gray-600 text-gray-600' : 'text-gray-500 dark:text-gray-400'}`}
// // //                                   >
// // //                                       {page}
// // //                                   </button>
// // //                               )}
// // //                           </li>
// // //                       ))}
// // //                       <li>
// // //                           <button
// // //                               onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
// // //                               className="py-2 px-4 border border-gray-300 rounded-r-lg dark:border-gray-600 dark:bg-gray-400 dark:text-white"
// // //                               disabled={currentPage === totalPages}
// // //                           >
// // //                               Next
// // //                           </button>
// // //                       </li>
// // //                   </ul>
// // //               </nav>
// // //           )}
// // //         </div>         
// // //     </div>
// // //   );
// // // };

// // // export default AdminChatTable;


// // // // "use client";

// // // // import { useEffect, useState } from "react";
// // // // import { database } from "../config/firebase";
// // // // import { ref as databaseRef, onValue } from "firebase/database";
// // // // import { format } from "date-fns";

// // // // const AdminChatTable = () => {
// // // //   const [messages, setMessages] = useState([]);
// // // //   const [itemsPerPage, setItemsPerPage] = useState(10);
// // // //   const [currentPage, setCurrentPage] = useState(1);
// // // //   const [searchTerm, setSearchTerm] = useState('');


// // // //   // Fungsi untuk mengurutkan berdasarkan nama
// // // //   const sortByName = () => {
// // // //     const sortedData = [...messages].sort((a, b) => {
// // // //         const comparison = a.name.localeCompare(b.name);
// // // //         return sortOrderName === 'asc' ? comparison : -comparison;
// // // //     });
// // // //     setAttendanceData(sortedData);
// // // //     setSortOrderName(sortOrderName === 'asc' ? 'desc' : 'asc');
// // // //   };

// // // //    const handleSearch = (e) => {
// // // //       setSearchTerm(e.target.value);
// // // //   };

// // // //   const handleItemsPerPageChange = (e) => {
// // // //       setItemsPerPage(e.target.value);
// // // //       setCurrentPage(1);
// // // //   };
// // // //   const filteredData = Array.isArray(messages) ? messages.filter(item => {
// // // //      const name = item.name.toLowerCase().includes(searchTerm.toLowerCase());
// // // //      const pesan = item.pesan.toLowerCase().includes(searchTerm.toLowerCase());
// // // //      const penerima = item.penerima.toLowerCase().includes(searchTerm.toLowerCase()); 
// // // //      const pengirim = item.pengirim.toLowerCase().includes(searchTerm.toLowerCase());
// // // //         return  name,penerima,pesan,pengirim;
// // // //   }) : [];

// // // //   // Pagination Logic
// // // //   const totalItems = filteredData.length;
// // // //   const indexOfLast = currentPage * itemsPerPage;
// // // //   const indexOfFirst = indexOfLast - itemsPerPage;
// // // //   const displayedData = filteredData.slice(indexOfFirst, indexOfLast);
// // // //   const totalPages = Math.ceil(totalItems / itemsPerPage);

// // // //   const getPagination = () => {
// // // //       let pages = [];
      
// // // //       if (totalPages <= 5) {
// // // //           pages = Array.from({ length: totalPages }, (_, i) => i + 1);
// // // //       } else {
// // // //           if (currentPage <= 3) {
// // // //               pages = [1, 2, 3, 4, 5, '...'];
// // // //           } else if (currentPage >= totalPages - 2) {
// // // //               pages = [1, '...', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
// // // //           } else {
// // // //               pages = [1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages];
// // // //           }
// // // //       }
// // // //       return pages;
// // // //   };

// // // //   useEffect(() => {
// // // //     const messagesRef = databaseRef(database, "messages");
// // // //     onValue(messagesRef, (snapshot) => {
// // // //       const data = snapshot.val();
// // // //       const messages = [];
// // // //       Object.keys(data).forEach((key) => {
// // // //         messages.push({...data[key], id: key });
// // // //       });
// // // //       setMessages(messages);
// // // //     }
// // // //     );
// // // //   }, []);
  

// // // //   return (
// // // //     <div>
// // // //         <div className="relative overflow-x-auto shadow-md sm:rounded-lg ">
// // // //             {/* //title */}
// // // //             <div className="flex justify-between items-center px-4 py-3 ">
// // // //                 <h2 className="text-xl font-bold mb-4">Laporan Data4</h2>
// // // //             </div>
// // // //             {/* //search */}
// // // //             <div className="flex justify-between  px-4 py-3">
// // // //               <div className="flex">
// // // //                   <select
// // // //                       id="itemsPerPage"
// // // //                       value={itemsPerPage}
// // // //                       onChange={handleItemsPerPageChange}
// // // //                       className="border rounded px-2 py-1"
// // // //                   >
// // // //                       <option value={10}>10</option>
// // // //                       <option value={25}>25</option>
// // // //                       <option value={50}>50</option>
// // // //                       <option value={100}>100</option>
// // // //                   </select>
// // // //                   <div className="mt-4 text-sm text-gray-500">
// // // //                       Total User: {filteredData.length}
// // // //                   </div>
// // // //               </div>
// // // //               <div className="relative ">
// // // //                   <form className="max-w-md mx-auto ml-2"> 
// // // //                       <label className="mb-2 text-sm font-medium text-gray-00 sr-only dark:text-white">Search</label>
// // // //                       <div >
// // // //                           <input 
// // // //                           onChange={handleSearch} 
// // // //                           value={searchTerm} type="search" id="default-search" className=" block w-full p-4 ps-10 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-400 dark:border-gray-600 dark:placeholder-gray-800 dark:text-gray-800 dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="Search" required />
// // // //                       </div>
// // // //                   </form>
// // // //               </div>
// // // //             </div>
// // // //           <br />
// // // //           <table className="w-full text-sm bg-white border border-gray-300 rounded-lg">
// // // //             <thead>
// // // //                 <tr className="bg-gray-200">
// // // //                   <th className="border border-gray-300 px-4 py-2">No</th>
// // // //                   <th className="border border-gray-300 px-4 py-2">Pengirim</th>
// // // //                   <th className="border border-gray-300 px-4 py-2">Penerima</th>
// // // //                   <th className="border border-gray-300 px-4 py-2">Pesan</th>
// // // //                   <th className="border border-gray-300 px-4 py-2">File</th>
// // // //                   <th className="border border-gray-300 px-4 py-2">Waktu</th>
// // // //                   <th className="border border-gray-300 px-4 py-2">Status</th>
// // // //                   <th className="border border-gray-300 px-4 py-2">Read</th>
// // // //                 </tr>
// // // //             </thead>
// // // //             <tbody>
// // // //               {displayedData.length>0?
// // // //                 displayedData.map((msg, index) => (
// // // //                 <tr key={index} className="hover:bg-gray-100">
// // // //                   <td className="border border-gray-300 px-4 py-2 text-center">{index + 1}</td>
// // // //                   <td className="border border-gray-300 px-4 py-2 text-center">{msg.pengirim}</td>
// // // //                   <td className="border border-gray-300 px-4 py-2 text-center">{msg.penerima}</td>
// // // //                   <td className="border border-gray-300 px-4 py-2 text-left">{msg.pesan}</td>
// // // //                   <td className="border border-gray-300 px-4 py-2 text-center">
// // // //                     {msg.file && <a href={msg.file} target="_blank" rel="noopener noreferrer">{msg.file.substring(msg.file.lastIndexOf('/') + 1)}</a>}
// // // //                   </td>
// // // //                   <td className="border border-gray-300 px-4 py-2 text-center">{msg.timestamp && format(msg.timestamp, "dd/MM/yyyy HH:mm:ss")}</td>
// // // //                   <td className="border border-gray-300 px-4 py-2">{msg.read ? (
// // // //                     <button
// // // //                         type="button"
// // // //                         className="focus:outline-none text-white bg-green-700 hover:bg-green-800 focus:ring-4 focus:ring-green-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2"
// // // //                       >
// // // //                         ✅ Dibaca
// // // //                       </button>
// // // //                     ) : (
// // // //                       <button
// // // //                         type="button"
// // // //                         className="focus:outline-none text-white bg-red-700 hover:bg-red-800 focus:ring-4 focus:ring-red-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2"
// // // //                       >
// // // //                         ❌ Belum Dibaca
// // // //                       </button>
// // // //                     )}
// // // //                   </td>
// // // //                   <td className="border border-gray-300 px-4 py-2 text-center">{msg.timestampRead && format(msg.timestampRead, "dd/MM/yyyy HH:mm:ss")}</td>
// // // //                 </tr>
// // // //               )): (
// // // //                 <tr>
// // // //                     <td colSpan="5" className="py-2 px-4 text-center">Data tidak ditemukan</td>
// // // //                 </tr>
// // // //                 )
// // // //               }
// // // //             </tbody>
// // // //           </table>
// // // //           {totalItems > itemsPerPage && (
// // // //               <nav className="m-4 flex items-center flex-column flex-wrap md:flex-row justify-between pt-4" aria-label="Table navigation">
// // // //                   <span className="text-sm font-normal text-gray-500 dark:text-gray-400">
// // // //                       Page {currentPage} of {totalPages}
// // // //                   </span>
                  
// // // //                   <ul className="inline-flex items-center -space-x-px">
// // // //                       <li>
// // // //                           <button
// // // //                               onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
// // // //                               className="py-2 px-4 border border-gray-300 rounded-l-lg dark:border-gray-600 dark:bg-gray-400 dark:text-white"
// // // //                               disabled={currentPage === 1}
// // // //                           >
// // // //                               Previous
// // // //                           </button>
// // // //                       </li>
// // // //                       {/* {[...Array(totalPages)].map((_, i) => (
// // // //                           <li key={i + 1}>
// // // //                               <button
// // // //                                   onClick={() => setCurrentPage(i + 1)}
// // // //                                   className={`py-2 px-4 border border-gray-300 ${currentPage === i + 1? 'border-gray-600 text-gray-600' : 'text-gray-500 dark:text-gray-400'}`}
// // // //                                   > {i +1}</button>
// // // //                                   </li>
// // // //                       ))} */}
// // // //                       {getPagination().map((page, index) => (
// // // //                           <li key={index}>
// // // //                               {page === '...' ? (
// // // //                                   <span className="py-2 px-4">...</span>
// // // //                               ) : (
// // // //                                   <button
// // // //                                       onClick={() => setCurrentPage(page)}
// // // //                                       className={`py-2 px-4 border border-gray-300 ${currentPage === page ? 'border-gray-600 text-gray-600' : 'text-gray-500 dark:text-gray-400'}`}
// // // //                                   >
// // // //                                       {page}
// // // //                                   </button>
// // // //                               )}
// // // //                           </li>
// // // //                       ))}
// // // //                       <li>
// // // //                           <button
// // // //                               onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
// // // //                               className="py-2 px-4 border border-gray-300 rounded-r-lg dark:border-gray-600 dark:bg-gray-400 dark:text-white"
// // // //                               disabled={currentPage === totalPages}
// // // //                           >
// // // //                               Next
// // // //                           </button>
// // // //                       </li>
// // // //                   </ul>
// // // //               </nav>
// // // //           )}
// // // //         </div>         
// // // //     </div>
// // // //   );
// // // // };

// // // // export default AdminChatTable;


// // // // // "use client";

// // // // // import { useEffect, useState } from "react";
// // // // // import { database } from "../config/firebase";
// // // // // import { ref as databaseRef, onValue } from "firebase/database";
// // // // // import { format } from "date-fns";

// // // // // const AdminChatTable = () => {
// // // // //   const [messages, setMessages] = useState([]);
// // // // //   const [itemsPerPage, setItemsPerPage] = useState(10);
// // // // //   const [currentPage, setCurrentPage] = useState(1);
// // // // //   const [searchTerm, setSearchTerm] = useState('');


// // // // //    const handleSearch = (e) => {
// // // // //       setSearchTerm(e.target.value);
// // // // //   };

// // // // //   const handleItemsPerPageChange = (e) => {
// // // // //       setItemsPerPage(e.target.value);
// // // // //       setCurrentPage(1);
// // // // //   };
// // // // //   const filteredData = Array.isArray(messages) ? messages.filter(item => {
// // // // //      const name = item.name.toLowerCase().includes(searchTerm.toLowerCase()) || item.pesan.toLowerCase().includes(searchTerm.toLowerCase()) || item.penerima.toLowerCase().includes(searchTerm.toLowerCase()) || item.pengirim.includes(searchTerm);
// // // // //         return  name;
// // // // //   }) : [];

// // // // //   // Pagination Logic
// // // // //   const totalItems = filteredData.length;
// // // // //   const indexOfLast = currentPage * itemsPerPage;
// // // // //   const indexOfFirst = indexOfLast - itemsPerPage;
// // // // //   const displayedData = filteredData.slice(indexOfFirst, indexOfLast);
// // // // //   const totalPages = Math.ceil(totalItems / itemsPerPage);

// // // // //   const getPagination = () => {
// // // // //       let pages = [];
      
// // // // //       if (totalPages <= 5) {
// // // // //           pages = Array.from({ length: totalPages }, (_, i) => i + 1);
// // // // //       } else {
// // // // //           if (currentPage <= 3) {
// // // // //               pages = [1, 2, 3, 4, 5, '...'];
// // // // //           } else if (currentPage >= totalPages - 2) {
// // // // //               pages = [1, '...', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
// // // // //           } else {
// // // // //               pages = [1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages];
// // // // //           }
// // // // //       }
// // // // //       return pages;
// // // // //   };

// // // // //   useEffect(() => {
// // // // //     const messagesRef = databaseRef(database, "chatsBox"); // Referensi ke chatsBox di Firebase
// // // // //     onValue(messagesRef, (snapshot) => {
// // // // //       const data = snapshot.val(); // Mengambil data dari Firebase
// // // // //       if (data) {
// // // // //          console.log("Data dari Firebase:", data); // Debugging: menampilkan data di console
     
// // // // //         setMessages(Object.values(data).reverse()); // Mengambil data dan langsung menampilkan tanpa format
// // // // //       }
// // // // //     });
// // // // //   }, []);

// // // // //   return (
// // // // //     <div>
// // // // //         <div className="relative overflow-x-auto shadow-md sm:rounded-lg ">
// // // // //             {/* //title */}
// // // // //             <div className="flex justify-between items-center px-4 py-3 ">
// // // // //                 <h2 className="text-xl font-bold mb-4">Laporan Data4</h2>
// // // // //             </div>
// // // // //             {/* //search */}
// // // // //             <div className="flex justify-between  px-4 py-3">
// // // // //               <div className="flex">
// // // // //                   <select
// // // // //                       id="itemsPerPage"
// // // // //                       value={itemsPerPage}
// // // // //                       onChange={handleItemsPerPageChange}
// // // // //                       className="border rounded px-2 py-1"
// // // // //                   >
// // // // //                       <option value={10}>10</option>
// // // // //                       <option value={25}>25</option>
// // // // //                       <option value={50}>50</option>
// // // // //                       <option value={100}>100</option>
// // // // //                   </select>
// // // // //                   <div className="mt-4 text-sm text-gray-500">
// // // // //                       Total User: {filteredData.length}
// // // // //                   </div>
// // // // //               </div>
// // // // //               <div className="relative ">
// // // // //                   <form className="max-w-md mx-auto ml-2"> 
// // // // //                       <label className="mb-2 text-sm font-medium text-gray-00 sr-only dark:text-white">Search</label>
// // // // //                       <div >
// // // // //                           <input 
// // // // //                           onChange={handleSearch} 
// // // // //                           value={searchTerm} type="search" id="default-search" className=" block w-full p-4 ps-10 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-400 dark:border-gray-600 dark:placeholder-gray-800 dark:text-gray-800 dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="Search" required />
// // // // //                       </div>
// // // // //                   </form>
// // // // //               </div>
// // // // //             </div>
// // // // //           <br />
// // // // //           <table className="w-full text-sm bg-white border border-gray-300 rounded-lg">
// // // // //             <thead>
// // // // //                 <tr className="bg-gray-200">
// // // // //                   <th className="border border-gray-300 px-4 py-2">No</th>
// // // // //                   <th className="border border-gray-300 px-4 py-2">Pengirim</th>
// // // // //                   <th className="border border-gray-300 px-4 py-2">Penerima</th>
// // // // //                   <th className="border border-gray-300 px-4 py-2">Pesan</th>
// // // // //                   <th className="border border-gray-300 px-4 py-2">File</th>
// // // // //                   <th className="border border-gray-300 px-4 py-2">Waktu</th>
// // // // //                   <th className="border border-gray-300 px-4 py-2">Status</th>
// // // // //                   <th className="border border-gray-300 px-4 py-2">Read</th>
// // // // //                 </tr>
// // // // //             </thead>
// // // // //             <tbody>
// // // // //               {displayedData.length>0?
// // // // //                 displayedData.map((msg, index) => (
// // // // //                 <tr key={index} className="hover:bg-gray-100">
// // // // //                   <td className="border border-gray-300 px-4 py-2 text-center">{index + 1}</td>
// // // // //                   <td className="border border-gray-300 px-4 py-2 text-center">{msg.pengirim}</td>
// // // // //                   <td className="border border-gray-300 px-4 py-2 text-center">{msg.penerima}</td>
// // // // //                   <td className="border border-gray-300 px-4 py-2 text-left">{msg.pesan}</td>
// // // // //                   <td className="border border-gray-300 px-4 py-2 text-center">
// // // // //                     {msg.file && <a href={msg.file} target="_blank" rel="noopener noreferrer">{msg.file.substring(msg.file.lastIndexOf('/') + 1)}</a>}
// // // // //                   </td>
// // // // //                   <td className="border border-gray-300 px-4 py-2 text-center">{msg.timestamp && format(msg.timestamp, "dd/MM/yyyy HH:mm:ss")}</td>
// // // // //                   <td className="border border-gray-300 px-4 py-2">{msg.read ? (
// // // // //                     <button
// // // // //                         type="button"
// // // // //                         className="focus:outline-none text-white bg-green-700 hover:bg-green-800 focus:ring-4 focus:ring-green-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2"
// // // // //                       >
// // // // //                         ✅ Dibaca
// // // // //                       </button>
// // // // //                     ) : (
// // // // //                       <button
// // // // //                         type="button"
// // // // //                         className="focus:outline-none text-white bg-red-700 hover:bg-red-800 focus:ring-4 focus:ring-red-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2"
// // // // //                       >
// // // // //                         ❌ Belum Dibaca
// // // // //                       </button>
// // // // //                     )}
// // // // //                   </td>
// // // // //                   <td className="border border-gray-300 px-4 py-2 text-center">{msg.timestampRead && format(msg.timestampRead, "dd/MM/yyyy HH:mm:ss")}</td>
// // // // //                 </tr>
// // // // //               )): (
// // // // //                 <tr>
// // // // //                     <td colSpan="5" className="py-2 px-4 text-center">Data tidak ditemukan</td>
// // // // //                 </tr>
// // // // //                 )
// // // // //               }
// // // // //             </tbody>
// // // // //           </table>
// // // // //           {totalItems > itemsPerPage && (
// // // // //               <nav className="m-4 flex items-center flex-column flex-wrap md:flex-row justify-between pt-4" aria-label="Table navigation">
// // // // //                   <span className="text-sm font-normal text-gray-500 dark:text-gray-400">
// // // // //                       Page {currentPage} of {totalPages}
// // // // //                   </span>
                  
// // // // //                   <ul className="inline-flex items-center -space-x-px">
// // // // //                       <li>
// // // // //                           <button
// // // // //                               onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
// // // // //                               className="py-2 px-4 border border-gray-300 rounded-l-lg dark:border-gray-600 dark:bg-gray-400 dark:text-white"
// // // // //                               disabled={currentPage === 1}
// // // // //                           >
// // // // //                               Previous
// // // // //                           </button>
// // // // //                       </li>
// // // // //                       {/* {[...Array(totalPages)].map((_, i) => (
// // // // //                           <li key={i + 1}>
// // // // //                               <button
// // // // //                                   onClick={() => setCurrentPage(i + 1)}
// // // // //                                   className={`py-2 px-4 border border-gray-300 ${currentPage === i + 1? 'border-gray-600 text-gray-600' : 'text-gray-500 dark:text-gray-400'}`}
// // // // //                                   > {i +1}</button>
// // // // //                                   </li>
// // // // //                       ))} */}
// // // // //                       {getPagination().map((page, index) => (
// // // // //                           <li key={index}>
// // // // //                               {page === '...' ? (
// // // // //                                   <span className="py-2 px-4">...</span>
// // // // //                               ) : (
// // // // //                                   <button
// // // // //                                       onClick={() => setCurrentPage(page)}
// // // // //                                       className={`py-2 px-4 border border-gray-300 ${currentPage === page ? 'border-gray-600 text-gray-600' : 'text-gray-500 dark:text-gray-400'}`}
// // // // //                                   >
// // // // //                                       {page}
// // // // //                                   </button>
// // // // //                               )}
// // // // //                           </li>
// // // // //                       ))}
// // // // //                       <li>
// // // // //                           <button
// // // // //                               onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
// // // // //                               className="py-2 px-4 border border-gray-300 rounded-r-lg dark:border-gray-600 dark:bg-gray-400 dark:text-white"
// // // // //                               disabled={currentPage === totalPages}
// // // // //                           >
// // // // //                               Next
// // // // //                           </button>
// // // // //                       </li>
// // // // //                   </ul>
// // // // //               </nav>
// // // // //           )}
// // // // //         </div>         
// // // // //     </div>
// // // // //   );
// // // // // };

// // // // // export default AdminChatTable;
// // // // // // // 
// // // // // // "use client";

// // // // // // import { useEffect, useState } from "react";
// // // // // // import { database } from "../config/firebase";
// // // // // // import { ref as databaseRef, onValue } from "firebase/database";
// // // // // // import { format } from "date-fns";

// // // // // // const AdminChatTable = () => {
// // // // // //   const [messages, setMessages] = useState([]);
// // // // // //   const [itemsPerPage, setItemsPerPage] = useState(10);
// // // // // //   const [currentPage, setCurrentPage] = useState(1);
// // // // // //   const [searchTerm, setSearchTerm] = useState('');


// // // // // //    const handleSearch = (e) => {
// // // // // //       setSearchTerm(e.target.value);
// // // // // //   };

// // // // // //   const handleItemsPerPageChange = (e) => {
// // // // // //       setItemsPerPage(e.target.value);
// // // // // //       setCurrentPage(1);
// // // // // //   };
// // // // // //   const filteredData = Array.isArray(messages) ? messages.filter(item => {
// // // // // //      const name = item.name.toLowerCase().includes(searchTerm.toLowerCase()) || item.pesan.toLowerCase().includes(searchTerm.toLowerCase()) || item.penerima.toLowerCase().includes(searchTerm.toLowerCase()) || item.pengirim.includes(searchTerm);
// // // // // //         return  name;
// // // // // //   }) : [];

// // // // // //   // Pagination Logic
// // // // // //   const totalItems = filteredData.length;
// // // // // //   const indexOfLast = currentPage * itemsPerPage;
// // // // // //   const indexOfFirst = indexOfLast - itemsPerPage;
// // // // // //   const displayedData = filteredData.slice(indexOfFirst, indexOfLast);
// // // // // //   const totalPages = Math.ceil(totalItems / itemsPerPage);

// // // // // //   const getPagination = () => {
// // // // // //       let pages = [];
      
// // // // // //       if (totalPages <= 5) {
// // // // // //           pages = Array.from({ length: totalPages }, (_, i) => i + 1);
// // // // // //       } else {
// // // // // //           if (currentPage <= 3) {
// // // // // //               pages = [1, 2, 3, 4, 5, '...'];
// // // // // //           } else if (currentPage >= totalPages - 2) {
// // // // // //               pages = [1, '...', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
// // // // // //           } else {
// // // // // //               pages = [1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages];
// // // // // //           }
// // // // // //       }
// // // // // //       return pages;
// // // // // //   };

// // // // // //   useEffect(() => {
// // // // // //     const messagesRef = databaseRef(database, "chatsBox"); // Referensi ke chatsBox di Firebase
// // // // // //     onValue(messagesRef, (snapshot) => {
// // // // // //       const data = snapshot.val(); // Mengambil data dari Firebase
// // // // // //       if (data) {
// // // // // //          console.log("Data dari Firebase:", data); // Debugging: menampilkan data di console
     
// // // // // //         setMessages(Object.values(data).reverse()); // Mengambil data dan langsung menampilkan tanpa format
// // // // // //       }
// // // // // //     });
// // // // // //   }, []);

// // // // // //   return (
// // // // // //     <div>
// // // // // //         <div className="relative overflow-x-auto shadow-md sm:rounded-lg ">
// // // // // //             {/* //title */}
// // // // // //             <div className="flex justify-between items-center px-4 py-3 ">
// // // // // //                 <h2 className="text-xl font-bold mb-4">Laporan Data4</h2>
// // // // // //             </div>
// // // // // //             {/* //search */}
// // // // // //             <div className="flex justify-between  px-4 py-3">
// // // // // //               <div className="flex">
// // // // // //                   <select
// // // // // //                       id="itemsPerPage"
// // // // // //                       value={itemsPerPage}
// // // // // //                       onChange={handleItemsPerPageChange}
// // // // // //                       className="border rounded px-2 py-1"
// // // // // //                   >
// // // // // //                       <option value={10}>10</option>
// // // // // //                       <option value={25}>25</option>
// // // // // //                       <option value={50}>50</option>
// // // // // //                       <option value={100}>100</option>
// // // // // //                   </select>
// // // // // //                   <div className="mt-4 text-sm text-gray-500">
// // // // // //                       Total User: {filteredData.length}
// // // // // //                   </div>
// // // // // //               </div>
// // // // // //               <div className="relative ">
// // // // // //                   <form className="max-w-md mx-auto ml-2"> 
// // // // // //                       <label className="mb-2 text-sm font-medium text-gray-00 sr-only dark:text-white">Search</label>
// // // // // //                       <div >
// // // // // //                           <input 
// // // // // //                           onChange={handleSearch} 
// // // // // //                           value={searchTerm} type="search" id="default-search" className=" block w-full p-4 ps-10 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-400 dark:border-gray-600 dark:placeholder-gray-800 dark:text-gray-800 dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="Search" required />
// // // // // //                       </div>
// // // // // //                   </form>
// // // // // //               </div>
// // // // // //             </div>
// // // // // //           <br />
// // // // // //           <table className="w-full text-sm bg-white border border-gray-300 rounded-lg">
// // // // // //             <thead>
// // // // // //                 <tr className="bg-gray-200">
// // // // // //                   <th className="border border-gray-300 px-4 py-2">Pengirim</th>
// // // // // //                   <th className="border border-gray-300 px-4 py-2">Penerima</th>
// // // // // //                   <th className="border border-gray-300 px-4 py-2">Pesan</th>
// // // // // //                   <th className="border border-gray-300 px-4 py-2">File</th>
// // // // // //                   <th className="border border-gray-300 px-4 py-2">Waktu</th>
// // // // // //                   <th className="border border-gray-300 px-4 py-2">Status</th>
// // // // // //                   <th className="border border-gray-300 px-4 py-2">Read</th>
// // // // // //                 </tr>
// // // // // //             </thead>
// // // // // //             <tbody>
// // // // // //               {displayedData.map((msg, index) => (
// // // // // //                 <tr key={index} className="hover:bg-gray-100">
// // // // // //                   <td className="border border-gray-300 px-4 py-2 text-center">{msg.pengirim}</td>
// // // // // //                   <td className="border border-gray-300 px-4 py-2 text-center">{msg.penerima}</td>
// // // // // //                   <td className="border border-gray-300 px-4 py-2 text-left">{msg.pesan}</td>
// // // // // //                   <td className="border border-gray-300 px-4 py-2 text-center">
// // // // // //                     {msg.file && <a href={msg.file} target="_blank" rel="noopener noreferrer">{msg.file.substring(msg.file.lastIndexOf('/') + 1)}</a>}
// // // // // //                   </td>
// // // // // //                   <td className="border border-gray-300 px-4 py-2 text-center">{msg.timestamp && format(msg.timestamp, "dd/MM/yyyy HH:mm:ss")}</td>
// // // // // //                   <td className="border border-gray-300 px-4 py-2">{msg.read ? (
// // // // // //                     <button
// // // // // //                         type="button"
// // // // // //                         className="focus:outline-none text-white bg-green-700 hover:bg-green-800 focus:ring-4 focus:ring-green-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2"
// // // // // //                       >
// // // // // //                         ✅ Dibaca
// // // // // //                       </button>
// // // // // //                     ) : (
// // // // // //                       <button
// // // // // //                         type="button"
// // // // // //                         className="focus:outline-none text-white bg-red-700 hover:bg-red-800 focus:ring-4 focus:ring-red-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2"
// // // // // //                       >
// // // // // //                         ❌ Belum Dibaca
// // // // // //                       </button>
// // // // // //                     )}
// // // // // //                   </td>
// // // // // //                   <td className="border border-gray-300 px-4 py-2 text-center">{msg.timestampRead && format(msg.timestampRead, "dd/MM/yyyy HH:mm:ss")}</td>
// // // // // //                 </tr>
// // // // // //               )): (
// // // // // //                 <tr>
// // // // // //                     <td colSpan="5" className="py-2 px-4 text-center">Data tidak ditemukan</td>
// // // // // //                 </tr>
// // // // // //                 )
// // // // // //               }
// // // // // //             </tbody>
// // // // // //           </table>
// // // // // //           {totalItems > itemsPerPage && (
// // // // // //               <nav className="m-4 flex items-center flex-column flex-wrap md:flex-row justify-between pt-4" aria-label="Table navigation">
// // // // // //                   <span className="text-sm font-normal text-gray-500 dark:text-gray-400">
// // // // // //                       Page {currentPage} of {totalPages}
// // // // // //                   </span>
                  
// // // // // //                   <ul className="inline-flex items-center -space-x-px">
// // // // // //                       <li>
// // // // // //                           <button
// // // // // //                               onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
// // // // // //                               className="py-2 px-4 border border-gray-300 rounded-l-lg dark:border-gray-600 dark:bg-gray-400 dark:text-white"
// // // // // //                               disabled={currentPage === 1}
// // // // // //                           >
// // // // // //                               Previous
// // // // // //                           </button>
// // // // // //                       </li>
// // // // // //                       {/* {[...Array(totalPages)].map((_, i) => (
// // // // // //                           <li key={i + 1}>
// // // // // //                               <button
// // // // // //                                   onClick={() => setCurrentPage(i + 1)}
// // // // // //                                   className={`py-2 px-4 border border-gray-300 ${currentPage === i + 1? 'border-gray-600 text-gray-600' : 'text-gray-500 dark:text-gray-400'}`}
// // // // // //                                   > {i +1}</button>
// // // // // //                                   </li>
// // // // // //                       ))} */}
// // // // // //                       {getPagination().map((page, index) => (
// // // // // //                           <li key={index}>
// // // // // //                               {page === '...' ? (
// // // // // //                                   <span className="py-2 px-4">...</span>
// // // // // //                               ) : (
// // // // // //                                   <button
// // // // // //                                       onClick={() => setCurrentPage(page)}
// // // // // //                                       className={`py-2 px-4 border border-gray-300 ${currentPage === page ? 'border-gray-600 text-gray-600' : 'text-gray-500 dark:text-gray-400'}`}
// // // // // //                                   >
// // // // // //                                       {page}
// // // // // //                                   </button>
// // // // // //                               )}
// // // // // //                           </li>
// // // // // //                       ))}
// // // // // //                       <li>
// // // // // //                           <button
// // // // // //                               onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
// // // // // //                               className="py-2 px-4 border border-gray-300 rounded-r-lg dark:border-gray-600 dark:bg-gray-400 dark:text-white"
// // // // // //                               disabled={currentPage === totalPages}
// // // // // //                           >
// // // // // //                               Next
// // // // // //                           </button>
// // // // // //                       </li>
// // // // // //                   </ul>
// // // // // //               </nav>
// // // // // //           )}
// // // // // //         </div>         
// // // // // //     </div>
// // // // // //   );
// // // // // // };

// // // // // // export default AdminChatTable;
// // // // // // // "use client";

// // // // // // // import { useEffect, useState } from "react";
// // // // // // // import { database } from "../config/firebase";
// // // // // // // import { ref as databaseRef, onValue } from "firebase/database";
// // // // // // // import { format } from "date-fns";

// // // // // // // const AdminChatTable = () => {
// // // // // // //   const [messages, setMessages] = useState([]);
// // // // // // //   const [itemsPerPage, setItemsPerPage] = useState(10);
// // // // // // //   const [currentPage, setCurrentPage] = useState(1);
// // // // // // //   const [searchTerm, setSearchTerm] = useState('');


// // // // // // //    const handleSearch = (e) => {
// // // // // // //       setSearchTerm(e.target.value);
// // // // // // //   };

// // // // // // //   const handleItemsPerPageChange = (e) => {
// // // // // // //       setItemsPerPage(e.target.value);
// // // // // // //       setCurrentPage(1);
// // // // // // //   };
// // // // // // //   const filteredData = Array.isArray(messages) ? messages.filter(item => {
// // // // // // //      const name = item.name.toLowerCase().includes(searchTerm.toLowerCase()) || item.pesan.toLowerCase().includes(searchTerm.toLowerCase()) || item.penerima.toLowerCase().includes(searchTerm.toLowerCase()) || item.pengirim.includes(searchTerm);
// // // // // // //         return  name;
// // // // // // //   }) : [];

// // // // // // //   // Pagination Logic
// // // // // // //   const totalItems = filteredData.length;
// // // // // // //   const indexOfLast = currentPage * itemsPerPage;
// // // // // // //   const indexOfFirst = indexOfLast - itemsPerPage;
// // // // // // //   const displayedData = filteredData.slice(indexOfFirst, indexOfLast);
// // // // // // //   const totalPages = Math.ceil(totalItems / itemsPerPage);

// // // // // // //   const getPagination = () => {
// // // // // // //       let pages = [];
      
// // // // // // //       if (totalPages <= 5) {
// // // // // // //           pages = Array.from({ length: totalPages }, (_, i) => i + 1);
// // // // // // //       } else {
// // // // // // //           if (currentPage <= 3) {
// // // // // // //               pages = [1, 2, 3, 4, 5, '...'];
// // // // // // //           } else if (currentPage >= totalPages - 2) {
// // // // // // //               pages = [1, '...', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
// // // // // // //           } else {
// // // // // // //               pages = [1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages];
// // // // // // //           }
// // // // // // //       }
// // // // // // //       return pages;
// // // // // // //   };

// // // // // // //   useEffect(() => {
// // // // // // //     const messagesRef = databaseRef(database, "chatsBox"); // Referensi ke chatsBox di Firebase
// // // // // // //     onValue(messagesRef, (snapshot) => {
// // // // // // //       const data = snapshot.val(); // Mengambil data dari Firebase
// // // // // // //       if (data) {
// // // // // // //          console.log("Data dari Firebase:", data); // Debugging: menampilkan data di console
     
// // // // // // //         setMessages(Object.values(data).reverse()); // Mengambil data dan langsung menampilkan tanpa format
// // // // // // //       }
// // // // // // //     });
// // // // // // //   }, []);

// // // // // // //   return (
// // // // // // //     <div>
// // // // // // //         <div className="relative overflow-x-auto shadow-md sm:rounded-lg ">
// // // // // // //             //title
// // // // // // //             <div className="flex justify-between items-center px-4 py-3 ">
// // // // // // //                 <h2 className="text-xl font-bold mb-4">Laporan Data4</h2>
// // // // // // //             </div>
// // // // // // //             //search
// // // // // // //             <div className="flex justify-between  px-4 py-3">
// // // // // // //               <div className="flex">
// // // // // // //                   <select
// // // // // // //                       id="itemsPerPage"
// // // // // // //                       value={itemsPerPage}
// // // // // // //                       onChange={handleItemsPerPageChange}
// // // // // // //                       className="border rounded px-2 py-1"
// // // // // // //                   >
// // // // // // //                       <option value={10}>10</option>
// // // // // // //                       <option value={25}>25</option>
// // // // // // //                       <option value={50}>50</option>
// // // // // // //                       <option value={100}>100</option>
// // // // // // //                   </select>
// // // // // // //                   <div className="mt-4 text-sm text-gray-500">
// // // // // // //                       Total User: {filteredData.length}
// // // // // // //                   </div>
// // // // // // //               </div>
// // // // // // //               <div className="relative ">
// // // // // // //                   <form className="max-w-md mx-auto ml-2"> 
// // // // // // //                       <label className="mb-2 text-sm font-medium text-gray-00 sr-only dark:text-white">Search</label>
// // // // // // //                       <div >
// // // // // // //                           <input 
// // // // // // //                           onChange={handleSearch} 
// // // // // // //                           value={searchTerm} type="search" id="default-search" className=" block w-full p-4 ps-10 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-400 dark:border-gray-600 dark:placeholder-gray-800 dark:text-gray-800 dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="Search" required />
// // // // // // //                       </div>
// // // // // // //                   </form>
// // // // // // //               </div>
// // // // // // //             </div>
// // // // // // //         </div>
// // // // // // //         <br />
// // // // // // //         <table className="w-full text-sm bg-white border border-gray-300 rounded-lg">
// // // // // // //           <thead>
// // // // // // //               <tr className="bg-gray-200">
// // // // // // //                 <th className="border border-gray-300 px-4 py-2">Pengirim</th>
// // // // // // //                 <th className="border border-gray-300 px-4 py-2">Penerima</th>
// // // // // // //                 <th className="border border-gray-300 px-4 py-2">Pesan</th>
// // // // // // //                 <th className="border border-gray-300 px-4 py-2">File</th>
// // // // // // //                 <th className="border border-gray-300 px-4 py-2">Waktu</th>
// // // // // // //                 <th className="border border-gray-300 px-4 py-2">Status</th>
// // // // // // //               </tr>
// // // // // // //           </thead>
                                           
        
                            
// // // // // // //     </div>
// // // // // // //     <div className="max-w-6xl mx-auto p-6 bg-white rounded-lg shadow-md">
// // // // // // //       <h2 className="text-2xl font-semibold mb-4">📋 Semua Pesan Chat</h2>
// // // // // // //       <div className="overflow-x-auto">
// // // // // // //         <table className="w-full border-collapse border border-gray-300">
// // // // // // //           <thead>
// // // // // // //             <tr className="bg-gray-200">
// // // // // // //               <th className="border border-gray-300 px-4 py-2">Pengirim</th>
// // // // // // //               <th className="border border-gray-300 px-4 py-2">Penerima</th>
// // // // // // //               <th className="border border-gray-300 px-4 py-2">Pesan</th>
// // // // // // //               <th className="border border-gray-300 px-4 py-2">File</th>
// // // // // // //               <th className="border border-gray-300 px-4 py-2">Waktu</th>
// // // // // // //               <th className="border border-gray-300 px-4 py-2">Status</th>
// // // // // // //             </tr>
// // // // // // //           </thead>
// // // // // // //           <tbody>
// // // // // // //              {messages.map((msg, index) => (
// // // // // // //               <tr key={index} className="hover:bg-gray-100">
// // // // // // //                 <td className="border border-gray-300 px-4 py-2 text-center">{msg.pengirim}</td>
// // // // // // //                 <td className="border border-gray-300 px-4 py-2 text-center">{msg.penerima}</td>
// // // // // // //                 <td className="border border-gray-300 px-4 py-2">{msg.pesan}</td>
// // // // // // //                 {/* File yang dikirim */}
// // // // // // //                   <td className="border border-gray-300 px-4 py-2 ">
// // // // // // //                     {msg.files && msg.files.length > 0 ? (
// // // // // // //                       <div className="flex flex-col gap-1">
// // // // // // //                         {msg.files.map((file, fileIndex) => (
// // // // // // //                           <a
// // // // // // //                             key={fileIndex}
// // // // // // //                             href={file.url}
// // // // // // //                             target="_blank"
// // // // // // //                             rel="noopener noreferrer"
// // // // // // //                             className="text-blue-500 underline"
// // // // // // //                           >
// // // // // // //                             📄 {file.name}
// // // // // // //                           </a>
// // // // // // //                         ))}
// // // // // // //                       </div>
// // // // // // //                     ) : (
// // // // // // //                       "-"
// // // // // // //                     )}
// // // // // // //                   </td>
// // // // // // //                 <td className="border border-gray-300 px-4 py-2">{msg.timestamp && format(msg.timestamp, "dd/MM/yyyy HH:mm")}</td>
// // // // // // //                 <td className="border border-gray-300 px-4 py-2">{msg.read ? (
// // // // // // //                     <button
// // // // // // //                       type="button"
// // // // // // //                       className="focus:outline-none text-white bg-green-700 hover:bg-green-800 focus:ring-4 focus:ring-green-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2"
// // // // // // //                     >
// // // // // // //                       ✅ Dibaca
// // // // // // //                     </button>
// // // // // // //                   ) : (
// // // // // // //                     <button
// // // // // // //                       type="button"
// // // // // // //                       className="focus:outline-none text-white bg-red-700 hover:bg-red-800 focus:ring-4 focus:ring-red-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2"
// // // // // // //                     >
// // // // // // //                       ❌ Belum Dibaca
// // // // // // //                     </button>
// // // // // // //                   )}</td>
// // // // // // //               </tr>
// // // // // // //             ))}
// // // // // // //           </tbody>
// // // // // // //         </table>
// // // // // // //       </div>
// // // // // // //     </div>
// // // // // // //   );
// // // // // // // };

// // // // // // // export default AdminChatTable;
// // // // // // // // "use client";

// // // // // // // // import { useEffect, useState } from "react";
// // // // // // // // import { database } from "../config/firebase";
// // // // // // // // import { ref as databaseRef, onValue } from "firebase/database";
// // // // // // // // import { format } from "date-fns";

// // // // // // // // const AdminChatTable = () => {
// // // // // // // //   const [messages, setMessages] = useState([]);

// // // // // // // //   useEffect(() => {
// // // // // // // //     const messagesRef = databaseRef(database, "chatsBox");
// // // // // // // //     onValue(messagesRef, (snapshot) => {
// // // // // // // //       const data = snapshot.val();
// // // // // // // //       if (data) {
// // // // // // // //         const formattedData = Object.entries(data).map(([id, value]) => ({
// // // // // // // //           id,
// // // // // // // //           ...value,
// // // // // // // //           timestamp: value.timestamp ? new Date(value.timestamp) : null,
// // // // // // // //           timestampRead: value.timestampRead ? new Date(value.timestampRead) : null,
// // // // // // // //         }));
// // // // // // // //         setMessages(formattedData.reverse());
// // // // // // // //       }
// // // // // // // //     });
// // // // // // // //   }, []);

// // // // // // // //   return (
// // // // // // // //     <div className="max-w-6xl mx-auto p-6 bg-white rounded-lg shadow-md">
// // // // // // // //       <h2 className="text-2xl font-semibold mb-4">📋 Semua Pesan Chat</h2>
// // // // // // // //       <div className="overflow-x-auto">
// // // // // // // //         <table className="w-full border-collapse border border-gray-300">
// // // // // // // //           <thead>
// // // // // // // //             <tr className="bg-gray-200">
// // // // // // // //               <th className="border border-gray-300 px-4 py-2">Pengirim</th>
// // // // // // // //               <th className="border border-gray-300 px-4 py-2">Penerima</th>
// // // // // // // //               <th className="border border-gray-300 px-4 py-2">Pesan</th>
// // // // // // // //               <th className="border border-gray-300 px-4 py-2">File</th>
// // // // // // // //               <th className="border border-gray-300 px-4 py-2">Waktu</th>
// // // // // // // //               <th className="border border-gray-300 px-4 py-2">Status</th>
// // // // // // // //             </tr>
// // // // // // // //           </thead>
// // // // // // // //           <tbody>
// // // // // // // //             {messages.map((msg) => (
// // // // // // // //               <tr key={msg.id} className="hover:bg-gray-100">
// // // // // // // //                 <td className="border border-gray-300 px-4 py-2 text-center">{msg.pengirim}</td>
// // // // // // // //                 <td className="border border-gray-300 px-4 py-2 text-center">{msg.penerima}</td>
// // // // // // // //                 <td className="border border-gray-300 px-4 py-2">{msg.pesan}</td>
// // // // // // // //                 <td className="border border-gray-300 px-4 py-2 text-center">
// // // // // // // //                   {msg.fileUrl && (
// // // // // // // //                     <a href={msg.fileUrl} target="_blank" className="text-blue-500 underline">
// // // // // // // //                       📄 {msg.fileName}
// // // // // // // //                     </a>
// // // // // // // //                   )}
// // // // // // // //                 </td>
// // // // // // // //                 <td className="border border-gray-300 px-4 py-2">{format(msg.timestamp, "dd/MM/yyyy HH:mm")}</td>
// // // // // // // //                 <td className="border border-gray-300 px-4 py-2">{msg.read ? "✅ Dibaca" : "❌ Belum Dibaca"}</td>
// // // // // // // //               </tr>
// // // // // // // //             ))}
// // // // // // // //           </tbody>
// // // // // // // //         </table>
// // // // // // // //       </div>
// // // // // // // //     </div>
// // // // // // // //   );
// // // // // // // // };

// // // // // // // // export default AdminChatTable;

// "use client";

// import { useEffect, useState } from "react";
// import { database } from "../config/firebase";
// import { ref as databaseRef, get, onValue,remove,update } from "firebase/database";
// import { format } from "date-fns";

// const AdminChatTable = () => {
//   const [messages, setMessages] = useState([]);
  
//   const [searchTerm, setSearchTerm] = useState(''); 
    
//   // const [totalItems, setTotalItems] = useState(0);
//   const [itemsPerPage, setItemsPerPage] = useState(10);
//   const [currentPage, setCurrentPage] = useState(1);
//   const [sortOrderName, setSortOrderName] = useState('asc');

//   //ambil buat nampilin data
//   useEffect(() => {
//     const messagesRef = databaseRef(database, "chatsBox");
//     onValue(messagesRef, (snapshot) => {
//       const data = snapshot.val();
//       // const messages = [];
//       const messages =data? Object.keys(data).map(key => ({ id: key, ...data[key] })) : [];
//       // });
//       setMessages(messages);
//       // console.log(messages);
      
//       // setTotalItems(data.length);
//     }
//     );
//   }, []);

//   //hapus data dan nampilin konfirmasi
//   const handleDelete = async (Id) => {
//     // const confirmation = window.confirm("Apakah Anda yakin ingin menghapus data ini?");
//     // if (confirmation) {
//     //     const userRef = databaseRef(rtdb, `kp/magang/users/${userId}`);
//     //     await remove(userRef);
//     //     alert("Data berhasil dihapus.");
//     // }
//     const userRef = databaseRef(database, `chatsBox/${Id}`);

//     try {
//         // Ambil data user berdasarkan userId
//         const snapshot = await get(userRef);
//         if (snapshot.exists()) {
//             const userData = snapshot.val();
//             // console.log(userData);
//             const { pengirim, penerima, pesan } = userData; // Ambil nama dan NIM dari data

//             // Konfirmasi penghapusan dengan informasi pengguna
//             const confirmation = window.confirm(`Apakah Anda yakin ingin menghapus data ini?\nPengirim: ${pengirim}\nPenerima: ${penerima}\nPesan: ${pesan}`);
            
//             if (confirmation) {
//                 await remove(userRef);
//                 alert(`Data ${pengirim} ke ${penerima} dengan pesan (${pesan}) berhasil dihapus.`);
//             }
//         } else {
//             alert("Data Pesan tidak ditemukan.");
//         }
//     } catch (error) {
//         console.error("Error menghapus data:", error);
//         alert("Terjadi kesalahan saat menghapus data.");
//     }
//   };

//   // Fungsi untuk mengurutkan berdasarkan nama
//   const sortByName = () => {
//     const sortedData = [...messages].sort((a, b) => {
//         const comparison = a.pesan.localeCompare(b.name);
//         return sortOrderName === 'asc' ? comparison : -comparison;
//     });
//     setMessages(sortedData);
//     setSortOrderName(sortOrderName === 'asc' ? 'desc' : 'asc');
//   };

//    const handleSearch = (e) => {
//       setSearchTerm(e.target.value);
//       setCurrentPage(1);
//   };

//   const handleItemsPerPageChange = (e) => {
//       setItemsPerPage(e.target.value);
//       setCurrentPage(1);
//   };
//   // const filteredData = messages.filter(item => 
//   //   (item.pesan.toLowerCase().includes(searchTerm.toLowerCase()))||
//   //     (item.penerima.toLowerCase().includes(searchTerm.toLowerCase()))||
//   //    (item.pengirim.toLowerCase().includes(searchTerm.toLowerCase()))
//   // ) ;
//   const filteredData = messages.filter(item => 
//   (item.pesan && item.pesan.toLowerCase().includes(searchTerm.toLowerCase())) ||
//   (item.penerima && item.penerima.toLowerCase().includes(searchTerm.toLowerCase())) ||
//   (item.pengirim && item.pengirim.toLowerCase().includes(searchTerm.toLowerCase()))
// );


//   // Pagination Logic
//   const totalItems = filteredData.length;
//   const indexOfLast = currentPage * itemsPerPage;
//   const indexOfFirst = indexOfLast - itemsPerPage;
//   const displayedData = filteredData.slice(indexOfFirst, indexOfLast);
//   const totalPages = Math.ceil(totalItems / itemsPerPage);

//   const getPagination = () => {
//       let pages = [];
      
//       if (totalPages <= 5) {
//           pages = Array.from({ length: totalPages }, (_, i) => i + 1);
//       } else {
//           if (currentPage <= 3) {
//               pages = [1, 2, 3, 4, 5, '...'];
//           } else if (currentPage >= totalPages - 2) {
//               pages = [1, '...', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
//           } else {
//               pages = [1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages];
//           }
//       }
//       return pages;
//   };

//   const handleToggleStatus = async (Id, currentStatus) => {
//     const userRef = databaseRef(database, `chatsBox/${Id}`);

//     try {
//         const newStatus = currentStatus === "ACTIVE" ? "NOT ACTIVE" : "ACTIVE";
//         const confirmation = window.confirm(`Apakah Anda yakin ingin mengubah status ke ${newStatus}?`);
        
//         if (confirmation) {
//             await update(userRef, { status: newStatus });

//             // Update state secara lokal agar UI langsung berubah tanpa reload
//             setMessages(prevMessages =>
//                 prevMessages.map(msg =>
//                     msg.id === Id ? { ...msg, status: newStatus } : msg
//                 )
//             );
//             alert(`Status berhasil diubah menjadi ${newStatus}.`);
//         }
//     } catch (error) {
//         console.error("Error memperbarui status:", error);
//         alert("Terjadi kesalahan saat memperbarui status.");
//     }
// };


  
  

//   return (
//     <div>
//         <div className="relative overflow-x-auto shadow-md sm:rounded-lg ">
//             {/* //title */}
//             <div className="flex justify-between items-center px-4 py-3 ">
//                 <h2 className="text-xl font-bold mb-4">Pesan Messages</h2>
//             </div>
//             {/* //search */}
//             <div className="flex justify-between  px-4 py-3">
//               <div className="flex">
//                   <select
//                       id="itemsPerPage"
//                       value={itemsPerPage}
//                       onChange={handleItemsPerPageChange}
//                       className="border rounded px-2 py-1"
//                   >
//                       <option value={10}>10</option>
//                       <option value={25}>25</option>
//                       <option value={50}>50</option>
//                       <option value={100}>100</option>
//                   </select>
//                   <div className="mt-4 text-sm text-gray-500">
//                       Total User: {filteredData.length}
//                   </div>
//               </div>
//               <div className="relative ">
//                   <form className="max-w-md mx-auto ml-2"> 
//                       <label className="mb-2 text-sm font-medium text-gray-00 sr-only dark:text-white">Search</label>
//                       <div >
//                           <input 
//                           onChange={handleSearch} 
//                           value={searchTerm} type="search" id="default-search" className=" block w-full p-4 ps-10 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-400 dark:border-gray-600 dark:placeholder-gray-800 dark:text-gray-800 dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="Search" required />
//                       </div>
//                   </form>
//               </div>
//             </div>
//           <br />
//           <table className="w-full text-sm bg-white border border-gray-300 rounded-lg">
//             <thead>
//                 <tr className="bg-gray-200">
//                   <th className="border border-gray-300 px-4 py-2">No 
                   
//                   </th>
//                   <th className="border border-gray-300 px-4 py-2">Pengirim
//                     <button onClick={sortByName} className="ml-2">
//                         {sortOrderName === 'asc' ? '↑' : '↓'}
//                     </button>
//                   </th>
//                   <th className="border border-gray-300 px-4 py-2">Penerima
//                     <button onClick={sortByName} className="ml-2">
//                         {sortOrderName === 'asc' ? '↑' : '↓'}
//                     </button>
//                   </th>
//                   <th className="border border-gray-300 px-4 py-2">Pesan
//                     <button onClick={sortByName} className="ml-2">
//                         {sortOrderName === 'asc' ? '↑' : '↓'}
//                     </button>
//                   </th>
//                   <th className="border border-gray-300 px-4 py-2">File

//                   </th>
//                   <th className="border border-gray-300 px-4 py-2">Waktu
//                   </th>
//                   <th className="border border-gray-300 px-4 py-2">Status</th>
//                   <th className="border border-gray-300 px-4 py-2">Read</th>
//                   <th className="border border-gray-300 px-4 py-2">Status</th>
//                   <th className="border border-gray-300 px-4 py-2">Action</th>
//                 </tr>
//             </thead>
//             <tbody>
//               {displayedData.length>0?
//                 displayedData.map((msg, index) => (
//                 <tr key={index} className="hover:bg-gray-100">
//                   <td className="border border-gray-300 px-4 py-2 text-center">{index + 1}</td>
//                   <td className="border border-gray-300 px-4 py-2 text-center">{msg.pengirim}</td>
//                   <td className="border border-gray-300 px-4 py-2 text-center">{msg.penerima}</td>
//                   <td className="border border-gray-300 px-4 py-2 text-left">{msg.pesan}</td>
//                   {/* File yang dikirim */}
//                    <td className="border border-gray-300 px-4 py-2 ">
//                      {msg.files && msg.files.length > 0 ? (
//                        <div className="flex flex-col gap-1">
//                          {msg.files.map((file, fileIndex) => (
//                          <a
//                             key={fileIndex}
//                              href={file.url}
//                              target="_blank"
//                              rel="noopener noreferrer"
//                              className="text-blue-500 underline"
//                           >
//                              📄 {file.name}
//                            </a>
//                          ))}
//                        </div>
//                     ) : (
//                      "-"
//                      )}
//                    </td>
//                   <td className="border border-gray-300 px-4 py-2 text-center">{msg.timestamp && format(msg.timestamp, "dd/MM/yyyy HH:mm:ss")}</td>
//                   <td className="border border-gray-300 px-4 py-2 text-center">
//                       <button
//                           onClick={() => handleToggleStatus(msg.id, msg.status)}
//                           className={`px-4 py-2 rounded-lg text-white ${
//                               msg.status === "ACTIVE" ? "bg-green-600 hover:bg-green-700" : "bg-red-600 hover:bg-red-700"
//                           }`}
//                       >
//                           {msg.status}
//                       </button>
//                   </td>

//                   <td className="border border-gray-300 px-4 py-2">{msg.read ? (
//                     <button
//                         type="button"
//                         className="focus:outline-none text-white bg-green-700 hover:bg-green-800 focus:ring-4 focus:ring-green-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2"
//                       >
//                         ✅ Dibaca
//                       </button>
//                     ) : (
//                       <button
//                         type="button"
//                         className="focus:outline-none text-white bg-red-700 hover:bg-red-800 focus:ring-4 focus:ring-red-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2"
//                       >
//                         ❌ Belum Dibaca
//                       </button>
//                     )}
//                   </td>
//                   <td className="border border-gray-300 px-4 py-2 text-center">{msg.timestampRead && format(msg.timestampRead, "dd/MM/yyyy HH:mm:ss")}</td>
//                   <td className="border border-gray-300 py-2 px-4  text-center">
//                     <>
//                         <button
//                             onClick={() => handleDelete(msg.id)}
//                             // className="bg-red-500 text-white px-4 py-2 rounded-md"
//                             type="button" className="focus:outline-none text-white bg-red-700 hover:bg-red-800 focus:ring-4 focus:ring-red-300 font-medium rounded-md text-sm px-4 py-2  dark:bg-red-600 dark:hover:bg-red-700 dark:focus:ring-red-900"
//                         >
//                             Hapus
//                         </button>
//                     </>
//                   </td>
//                 </tr>
//               )): (
//                 <tr>
//                     <td colSpan="5" className="py-2 px-4 text-center">Data tidak ditemukan</td>
//                 </tr>
//                 )
//               }
//             </tbody>
//           </table>
//           {totalItems > itemsPerPage && (
//               <nav className="m-4 flex items-center flex-column flex-wrap md:flex-row justify-between pt-4" aria-label="Table navigation">
//                   <span className="text-sm font-normal text-gray-500 dark:text-gray-400">
//                       Page {currentPage} of {totalPages}
//                   </span>
                  
//                   <ul className="inline-flex items-center -space-x-px">
//                       <li>
//                           <button
//                               onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
//                               className="py-2 px-4 border border-gray-300 rounded-l-lg dark:border-gray-600 dark:bg-gray-400 dark:text-white"
//                               disabled={currentPage === 1}
//                           >
//                               Previous
//                           </button>
//                       </li>
//                       {/* {[...Array(totalPages)].map((_, i) => (
//                           <li key={i + 1}>
//                               <button
//                                   onClick={() => setCurrentPage(i + 1)}
//                                   className={`py-2 px-4 border border-gray-300 ${currentPage === i + 1? 'border-gray-600 text-gray-600' : 'text-gray-500 dark:text-gray-400'}`}
//                                   > {i +1}</button>
//                                   </li>
//                       ))} */}
//                       {getPagination().map((page, index) => (
//                           <li key={index}>
//                               {page === '...' ? (
//                                   <span className="py-2 px-4">...</span>
//                               ) : (
//                                   <button
//                                       onClick={() => setCurrentPage(page)}
//                                       className={`py-2 px-4 border border-gray-300 ${currentPage === page ? 'border-gray-600 text-gray-600' : 'text-gray-500 dark:text-gray-400'}`}
//                                   >
//                                       {page}
//                                   </button>
//                               )}
//                           </li>
//                       ))}
//                       <li>
//                           <button
//                               onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
//                               className="py-2 px-4 border border-gray-300 rounded-r-lg dark:border-gray-600 dark:bg-gray-400 dark:text-white"
//                               disabled={currentPage === totalPages}
//                           >
//                               Next
//                           </button>
//                       </li>
//                   </ul>
//               </nav>
//           )}
//         </div>         
//     </div>
//   );
// };

// export default AdminChatTable;
// // "use client";

// // import { useEffect, useState } from "react";
// // import { rtdb } from "../config/firebase";
// // import { ref as databaseRef, onValue } from "firebase/database";
// // import { format } from "date-fns";

// // const AdminChatTable = () => {
// //   const [messages, setMessages] = useState([]);
  
// //   const [searchTerm, setSearchTerm] = useState(''); 
    
// //   const [totalItems, setTotalItems] = useState(0);
// //   const [itemsPerPage, setItemsPerPage] = useState(10);
// //   const [currentPage, setCurrentPage] = useState(1);
// //   const [sortOrderName, setSortOrderName] = useState('asc');

// //   useEffect(() => {
// //     const messagesRef = databaseRef(rtdb, "chatsBox");
// //     onValue(messagesRef, (snapshot) => {
// //       const data = snapshot.val();
// //       // const messages = [];
// //       const messages =data? Object.keys(data).map(key => ({ id: key, ...data[key] })) : [];
// //       // });
// //       setMessages(messages);
// //       console.log(messages);
      
// //       setTotalItems(data.length);
// //     }
// //     );
// //   }, []);

// //   // Fungsi untuk mengurutkan berdasarkan nama
// //   const sortByName = () => {
// //     const sortedData = [...messages].sort((a, b) => {
// //         const comparison = a.pesan.localeCompare(b.name);
// //         return sortOrderName === 'asc' ? comparison : -comparison;
// //     });
// //     setMessages(sortedData);
// //     setSortOrderName(sortOrderName === 'asc' ? 'desc' : 'asc');
// //   };

// //    const handleSearch = (e) => {
// //       setSearchTerm(e.target.value);
// //       setCurrentPage(1);
// //   };

// //   const handleItemsPerPageChange = (e) => {
// //       setItemsPerPage(e.target.value);
// //       setCurrentPage(1);
// //   };
// //   const filteredData = messages.filter(item => 
// //     //   item.files.toLowerCase().includes(searchTerm.toLowerCase())||
// //       item.pesan.toLowerCase().includes(searchTerm.toLowerCase())||
// //       item.penerima.toLowerCase().includes(searchTerm.toLowerCase())||
// //      item.pengirim.toLowerCase().includes(searchTerm.toLowerCase())
// //   ) ;

// //   // Pagination Logic
// //   const totalItemss = filteredData.length;
// //   const indexOfLast = currentPage * itemsPerPage;
// //   const indexOfFirst = indexOfLast - itemsPerPage;
// //   const displayedData = filteredData.slice(indexOfFirst, indexOfLast);
// //   const totalPages = Math.ceil(totalItemss / itemsPerPage);

// //   const getPagination = () => {
// //       let pages = [];
      
// //       if (totalPages <= 5) {
// //           pages = Array.from({ length: totalPages }, (_, i) => i + 1);
// //       } else {
// //           if (currentPage <= 3) {
// //               pages = [1, 2, 3, 4, 5, '...'];
// //           } else if (currentPage >= totalPages - 2) {
// //               pages = [1, '...', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
// //           } else {
// //               pages = [1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages];
// //           }
// //       }
// //       return pages;
// //   };

  
  

// //   return (
// //     <div>
// //         <div className="relative overflow-x-auto shadow-md sm:rounded-lg ">
// //             {/* //title */}
// //             <div className="flex justify-between items-center px-4 py-3 ">
// //                 <h2 className="text-xl font-bold mb-4">Laporan Data4</h2>
// //             </div>
// //             {/* //search */}
// //             <div className="flex justify-between  px-4 py-3">
// //               <div className="flex">
// //                   <select
// //                       id="itemsPerPage"
// //                       value={itemsPerPage}
// //                       onChange={handleItemsPerPageChange}
// //                       className="border rounded px-2 py-1"
// //                   >
// //                       <option value={10}>10</option>
// //                       <option value={25}>25</option>
// //                       <option value={50}>50</option>
// //                       <option value={100}>100</option>
// //                   </select>
// //                   <div className="mt-4 text-sm text-gray-500">
// //                       Total User: {filteredData.length}
// //                   </div>
// //               </div>
// //               <div className="relative ">
// //                   <form className="max-w-md mx-auto ml-2"> 
// //                       <label className="mb-2 text-sm font-medium text-gray-00 sr-only dark:text-white">Search</label>
// //                       <div >
// //                           <input 
// //                           onChange={handleSearch} 
// //                           value={searchTerm} type="search" id="default-search" className=" block w-full p-4 ps-10 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-400 dark:border-gray-600 dark:placeholder-gray-800 dark:text-gray-800 dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="Search" required />
// //                       </div>
// //                   </form>
// //               </div>
// //             </div>
// //           <br />
// //           <table className="w-full text-sm bg-white border border-gray-300 rounded-lg">
// //             <thead>
// //                 <tr className="bg-gray-200">
// //                   <th className="border border-gray-300 px-4 py-2">No 
// //                     <button onClick={sortByName} className="ml-2">
// //                         {sortOrderName === 'asc' ? '↑' : '↓'}
// //                     </button>
// //                   </th>
// //                   <th className="border border-gray-300 px-4 py-2">Pengirim
// //                     <button onClick={sortByName} className="ml-2">
// //                         {sortOrderName === 'asc' ? '↑' : '↓'}
// //                     </button>
// //                   </th>
// //                   <th className="border border-gray-300 px-4 py-2">Penerima
// //                     <button onClick={sortByName} className="ml-2">
// //                         {sortOrderName === 'asc' ? '↑' : '↓'}
// //                     </button>
// //                   </th>
// //                   <th className="border border-gray-300 px-4 py-2">pesan
// //                     <button onClick={sortByName} className="ml-2">
// //                         {sortOrderName === 'asc' ? '↑' : '↓'}
// //                     </button>
// //                   </th>
// //                   <th className="border border-gray-300 px-4 py-2">File

// //                   </th>
// //                   <th className="border border-gray-300 px-4 py-2">Waktu
// //                   </th>
// //                   <th className="border border-gray-300 px-4 py-2">Status</th>
// //                   <th className="border border-gray-300 px-4 py-2">Read</th>
// //                 </tr>
// //             </thead>
// //             <tbody>
// //               {displayedData.length>0?
// //                 displayedData.map((msg, index) => (
// //                 <tr key={index} className="hover:bg-gray-100">
// //                   <td className="border border-gray-300 px-4 py-2 text-center">{index + 1}</td>
// //                   <td className="border border-gray-300 px-4 py-2 text-center">{msg.pengirim}</td>
// //                   <td className="border border-gray-300 px-4 py-2 text-center">{msg.penerima}</td>
// //                   <td className="border border-gray-300 px-4 py-2 text-left">{msg.pesan}</td>
// //                   {/* File yang dikirim */}
// //                    <td className="border border-gray-300 px-4 py-2 ">
// //                      {msg.files && msg.files.length > 0 ? (
// //                        <div className="flex flex-col gap-1">
// //                          {msg.files.map((file, fileIndex) => (
// //                          <a
// //                             key={fileIndex}
// //                              href={file.url}
// //                              target="_blank"
// //                              rel="noopener noreferrer"
// //                              className="text-blue-500 underline"
// //                           >
// //                              📄 {file.name}
// //                            </a>
// //                          ))}
// //                        </div>
// //                     ) : (
// //                      "-"
// //                      )}
// //                    </td>
// //                   <td className="border border-gray-300 px-4 py-2 text-center">{msg.timestamp && format(msg.timestamp, "dd/MM/yyyy HH:mm:ss")}</td>
// //                   <td className="border border-gray-300 px-4 py-2">{msg.read ? (
// //                     <button
// //                         type="button"
// //                         className="focus:outline-none text-white bg-green-700 hover:bg-green-800 focus:ring-4 focus:ring-green-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2"
// //                       >
// //                         ✅ Dibaca
// //                       </button>
// //                     ) : (
// //                       <button
// //                         type="button"
// //                         className="focus:outline-none text-white bg-red-700 hover:bg-red-800 focus:ring-4 focus:ring-red-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2"
// //                       >
// //                         ❌ Belum Dibaca
// //                       </button>
// //                     )}
// //                   </td>
// //                   <td className="border border-gray-300 px-4 py-2 text-center">{msg.timestampRead && format(msg.timestampRead, "dd/MM/yyyy HH:mm:ss")}</td>
// //                 </tr>
// //               )): (
// //                 <tr>
// //                     <td colSpan="5" className="py-2 px-4 text-center">Data tidak ditemukan</td>
// //                 </tr>
// //                 )
// //               }
// //             </tbody>
// //           </table>
// //           {totalItems > itemsPerPage && (
// //               <nav className="m-4 flex items-center flex-column flex-wrap md:flex-row justify-between pt-4" aria-label="Table navigation">
// //                   <span className="text-sm font-normal text-gray-500 dark:text-gray-400">
// //                       Page {currentPage} of {totalPages}
// //                   </span>
                  
// //                   <ul className="inline-flex items-center -space-x-px">
// //                       <li>
// //                           <button
// //                               onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
// //                               className="py-2 px-4 border border-gray-300 rounded-l-lg dark:border-gray-600 dark:bg-gray-400 dark:text-white"
// //                               disabled={currentPage === 1}
// //                           >
// //                               Previous
// //                           </button>
// //                       </li>
// //                       {/* {[...Array(totalPages)].map((_, i) => (
// //                           <li key={i + 1}>
// //                               <button
// //                                   onClick={() => setCurrentPage(i + 1)}
// //                                   className={`py-2 px-4 border border-gray-300 ${currentPage === i + 1? 'border-gray-600 text-gray-600' : 'text-gray-500 dark:text-gray-400'}`}
// //                                   > {i +1}</button>
// //                                   </li>
// //                       ))} */}
// //                       {getPagination().map((page, index) => (
// //                           <li key={index}>
// //                               {page === '...' ? (
// //                                   <span className="py-2 px-4">...</span>
// //                               ) : (
// //                                   <button
// //                                       onClick={() => setCurrentPage(page)}
// //                                       className={`py-2 px-4 border border-gray-300 ${currentPage === page ? 'border-gray-600 text-gray-600' : 'text-gray-500 dark:text-gray-400'}`}
// //                                   >
// //                                       {page}
// //                                   </button>
// //                               )}
// //                           </li>
// //                       ))}
// //                       <li>
// //                           <button
// //                               onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
// //                               className="py-2 px-4 border border-gray-300 rounded-r-lg dark:border-gray-600 dark:bg-gray-400 dark:text-white"
// //                               disabled={currentPage === totalPages}
// //                           >
// //                               Next
// //                           </button>
// //                       </li>
// //                   </ul>
// //               </nav>
// //           )}
// //         </div>         
// //     </div>
// //   );
// // };

// // export default AdminChatTable;

// // // "use client";

// // // import { useEffect, useState } from "react";
// // // import { database } from "../config/firebase";
// // // import { ref as databaseRef, onValue } from "firebase/database";
// // // import { format } from "date-fns";

// // // const AdminChatTable = () => {
// // //   const [messages, setMessages] = useState([]);
  
// // //   const [searchTerm, setSearchTerm] = useState(''); 
    
// // //   const [totalItems, setTotalItems] = useState(0);
// // //   const [itemsPerPage, setItemsPerPage] = useState(10);
// // //   const [currentPage, setCurrentPage] = useState(1);
// // //   const [sortOrderName, setSortOrderName] = useState('asc');


// // //   // Fungsi untuk mengurutkan berdasarkan nama
// // //   const sortByName = () => {
// // //     const sortedData = [...messages].sort((a, b) => {
// // //         const comparison = a.name.localeCompare(b.name);
// // //         return sortOrderName === 'asc' ? comparison : -comparison;
// // //     });
// // //     setMessages(sortedData);
// // //     setSortOrderName(sortOrderName === 'asc' ? 'desc' : 'asc');
// // //   };

// // //    const handleSearch = (e) => {
// // //       setSearchTerm(e.target.value);
// // //       setCurrentPage(1);
// // //   };

// // //   const handleItemsPerPageChange = (e) => {
// // //       setItemsPerPage(e.target.value);
// // //       setCurrentPage(1);
// // //   };
// // //   const filteredData = messages.filter(item => 
// // //       item.name.toLowerCase().includes(searchTerm.toLowerCase())||
// // //       item.pesan.toLowerCase().includes(searchTerm.toLowerCase())||
// // //       item.penerima.toLowerCase().includes(searchTerm.toLowerCase())||
// // //      item.pengirim.toLowerCase().includes(searchTerm.toLowerCase())
// // //   ) ;

// // //   // Pagination Logic
// // //   const totalItemss = filteredData.length;
// // //   const indexOfLast = currentPage * itemsPerPage;
// // //   const indexOfFirst = indexOfLast - itemsPerPage;
// // //   const displayedData = filteredData.slice(indexOfFirst, indexOfLast);
// // //   const totalPages = Math.ceil(totalItemss / itemsPerPage);

// // //   const getPagination = () => {
// // //       let pages = [];
      
// // //       if (totalPages <= 5) {
// // //           pages = Array.from({ length: totalPages }, (_, i) => i + 1);
// // //       } else {
// // //           if (currentPage <= 3) {
// // //               pages = [1, 2, 3, 4, 5, '...'];
// // //           } else if (currentPage >= totalPages - 2) {
// // //               pages = [1, '...', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
// // //           } else {
// // //               pages = [1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages];
// // //           }
// // //       }
// // //       return pages;
// // //   };

// // //   useEffect(() => {
// // //     const messagesRef = databaseRef(database, "messages");
// // //     onValue(messagesRef, (snapshot) => {
// // //       const data = snapshot.val();
// // //       const messages = [];
// // //       Object.keys(data).forEach((key) => {
// // //         messages.push({...data[key], id: key });
// // //       });
// // //       setMessages(messages);
      
// // //       setTotalItems(data.length);
// // //     }
// // //     );
// // //   }, []);
  

// // //   return (
// // //     <div>
// // //         <div className="relative overflow-x-auto shadow-md sm:rounded-lg ">
// // //             {/* //title */}
// // //             <div className="flex justify-between items-center px-4 py-3 ">
// // //                 <h2 className="text-xl font-bold mb-4">Laporan Data4</h2>
// // //             </div>
// // //             {/* //search */}
// // //             <div className="flex justify-between  px-4 py-3">
// // //               <div className="flex">
// // //                   <select
// // //                       id="itemsPerPage"
// // //                       value={itemsPerPage}
// // //                       onChange={handleItemsPerPageChange}
// // //                       className="border rounded px-2 py-1"
// // //                   >
// // //                       <option value={10}>10</option>
// // //                       <option value={25}>25</option>
// // //                       <option value={50}>50</option>
// // //                       <option value={100}>100</option>
// // //                   </select>
// // //                   <div className="mt-4 text-sm text-gray-500">
// // //                       Total User: {filteredData.length}
// // //                   </div>
// // //               </div>
// // //               <div className="relative ">
// // //                   <form className="max-w-md mx-auto ml-2"> 
// // //                       <label className="mb-2 text-sm font-medium text-gray-00 sr-only dark:text-white">Search</label>
// // //                       <div >
// // //                           <input 
// // //                           onChange={handleSearch} 
// // //                           value={searchTerm} type="search" id="default-search" className=" block w-full p-4 ps-10 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-400 dark:border-gray-600 dark:placeholder-gray-800 dark:text-gray-800 dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="Search" required />
// // //                       </div>
// // //                   </form>
// // //               </div>
// // //             </div>
// // //           <br />
// // //           <table className="w-full text-sm bg-white border border-gray-300 rounded-lg">
// // //             <thead>
// // //                 <tr className="bg-gray-200">
// // //                   <th className="border border-gray-300 px-4 py-2">No 
// // //                     <button onClick={sortByName} className="ml-2">
// // //                         {sortOrderName === 'asc' ? '↑' : '↓'}
// // //                     </button>
// // //                   </th>
// // //                   <th className="border border-gray-300 px-4 py-2">Pengirim
// // //                     <button onClick={sortByName} className="ml-2">
// // //                         {sortOrderName === 'asc' ? '↑' : '↓'}
// // //                     </button>
// // //                   </th>
// // //                   <th className="border border-gray-300 px-4 py-2">Penerima
// // //                     <button onClick={sortByName} className="ml-2">
// // //                         {sortOrderName === 'asc' ? '↑' : '↓'}
// // //                     </button>
// // //                   </th>
// // //                   <th className="border border-gray-300 px-4 py-2">pesan
// // //                     <button onClick={sortByName} className="ml-2">
// // //                         {sortOrderName === 'asc' ? '↑' : '↓'}
// // //                     </button>
// // //                   </th>
// // //                   <th className="border border-gray-300 px-4 py-2">File
// // //                     <button onClick={sortByName} className="ml-2">
// // //                         {sortOrderName === 'asc' ? '↑' : '↓'}
// // //                     </button>
// // //                   </th>
// // //                   <th className="border border-gray-300 px-4 py-2">Waktu
// // //                   </th>
// // //                   <th className="border border-gray-300 px-4 py-2">Status</th>
// // //                   <th className="border border-gray-300 px-4 py-2">Read</th>
// // //                 </tr>
// // //             </thead>
// // //             <tbody>
// // //               {displayedData.length>0?
// // //                 displayedData.map((msg, index) => (
// // //                 <tr key={index} className="hover:bg-gray-100">
// // //                   <td className="border border-gray-300 px-4 py-2 text-center">{index + 1}</td>
// // //                   <td className="border border-gray-300 px-4 py-2 text-center">{msg.pengirim}</td>
// // //                   <td className="border border-gray-300 px-4 py-2 text-center">{msg.penerima}</td>
// // //                   <td className="border border-gray-300 px-4 py-2 text-left">{msg.pesan}</td>
// // //                   <td className="border border-gray-300 px-4 py-2 text-center">
// // //                     {msg.file && <a href={msg.file} target="_blank" rel="noopener noreferrer">{msg.file.substring(msg.file.lastIndexOf('/') + 1)}</a>}
// // //                   </td>
// // //                   <td className="border border-gray-300 px-4 py-2 text-center">{msg.timestamp && format(msg.timestamp, "dd/MM/yyyy HH:mm:ss")}</td>
// // //                   <td className="border border-gray-300 px-4 py-2">{msg.read ? (
// // //                     <button
// // //                         type="button"
// // //                         className="focus:outline-none text-white bg-green-700 hover:bg-green-800 focus:ring-4 focus:ring-green-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2"
// // //                       >
// // //                         ✅ Dibaca
// // //                       </button>
// // //                     ) : (
// // //                       <button
// // //                         type="button"
// // //                         className="focus:outline-none text-white bg-red-700 hover:bg-red-800 focus:ring-4 focus:ring-red-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2"
// // //                       >
// // //                         ❌ Belum Dibaca
// // //                       </button>
// // //                     )}
// // //                   </td>
// // //                   <td className="border border-gray-300 px-4 py-2 text-center">{msg.timestampRead && format(msg.timestampRead, "dd/MM/yyyy HH:mm:ss")}</td>
// // //                 </tr>
// // //               )): (
// // //                 <tr>
// // //                     <td colSpan="5" className="py-2 px-4 text-center">Data tidak ditemukan</td>
// // //                 </tr>
// // //                 )
// // //               }
// // //             </tbody>
// // //           </table>
// // //           {totalItems > itemsPerPage && (
// // //               <nav className="m-4 flex items-center flex-column flex-wrap md:flex-row justify-between pt-4" aria-label="Table navigation">
// // //                   <span className="text-sm font-normal text-gray-500 dark:text-gray-400">
// // //                       Page {currentPage} of {totalPages}
// // //                   </span>
                  
// // //                   <ul className="inline-flex items-center -space-x-px">
// // //                       <li>
// // //                           <button
// // //                               onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
// // //                               className="py-2 px-4 border border-gray-300 rounded-l-lg dark:border-gray-600 dark:bg-gray-400 dark:text-white"
// // //                               disabled={currentPage === 1}
// // //                           >
// // //                               Previous
// // //                           </button>
// // //                       </li>
// // //                       {/* {[...Array(totalPages)].map((_, i) => (
// // //                           <li key={i + 1}>
// // //                               <button
// // //                                   onClick={() => setCurrentPage(i + 1)}
// // //                                   className={`py-2 px-4 border border-gray-300 ${currentPage === i + 1? 'border-gray-600 text-gray-600' : 'text-gray-500 dark:text-gray-400'}`}
// // //                                   > {i +1}</button>
// // //                                   </li>
// // //                       ))} */}
// // //                       {getPagination().map((page, index) => (
// // //                           <li key={index}>
// // //                               {page === '...' ? (
// // //                                   <span className="py-2 px-4">...</span>
// // //                               ) : (
// // //                                   <button
// // //                                       onClick={() => setCurrentPage(page)}
// // //                                       className={`py-2 px-4 border border-gray-300 ${currentPage === page ? 'border-gray-600 text-gray-600' : 'text-gray-500 dark:text-gray-400'}`}
// // //                                   >
// // //                                       {page}
// // //                                   </button>
// // //                               )}
// // //                           </li>
// // //                       ))}
// // //                       <li>
// // //                           <button
// // //                               onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
// // //                               className="py-2 px-4 border border-gray-300 rounded-r-lg dark:border-gray-600 dark:bg-gray-400 dark:text-white"
// // //                               disabled={currentPage === totalPages}
// // //                           >
// // //                               Next
// // //                           </button>
// // //                       </li>
// // //                   </ul>
// // //               </nav>
// // //           )}
// // //         </div>         
// // //     </div>
// // //   );
// // // };

// // // export default AdminChatTable;
// // // // "use client";

// // // // import { useEffect, useState } from "react";
// // // // import { database } from "../config/firebase";
// // // // import { ref as databaseRef, onValue } from "firebase/database";
// // // // import { format } from "date-fns";

// // // // const AdminChatTable = () => {
// // // //   const [messages, setMessages] = useState([]);
// // // //   const [itemsPerPage, setItemsPerPage] = useState(10);
// // // //   const [currentPage, setCurrentPage] = useState(1);
// // // //   const [searchTerm, setSearchTerm] = useState('');
  
// // // //   const [sortOrderName, setSortOrderName] = useState('asc');


// // // //   // Fungsi untuk mengurutkan berdasarkan nama
// // // //   const sortByName = () => {
// // // //     const sortedData = [...messages].sort((a, b) => {
// // // //         const comparison = a.name.localeCompare(b.name);
// // // //         return sortOrderName === 'asc' ? comparison : -comparison;
// // // //     });
// // // //     setMessages(sortedData);
// // // //     setSortOrderName(sortOrderName === 'asc' ? 'desc' : 'asc');
// // // //   };

// // // //    const handleSearch = (e) => {
// // // //       setSearchTerm(e.target.value);
// // // //   };

// // // //   const handleItemsPerPageChange = (e) => {
// // // //       setItemsPerPage(e.target.value);
// // // //       setCurrentPage(1);
// // // //   };
// // // //   const filteredData = messages.filter(item => 
// // // //       item.name.toLowerCase().includes(searchTerm.toLowerCase())||
// // // //       item.pesan.toLowerCase().includes(searchTerm.toLowerCase())||
// // // //       item.penerima.toLowerCase().includes(searchTerm.toLowerCase())||
// // // //      item.pengirim.toLowerCase().includes(searchTerm.toLowerCase())
// // // //   ) ;

// // // //   // Pagination Logic
// // // //   const totalItems = filteredData.length;
// // // //   const indexOfLast = currentPage * itemsPerPage;
// // // //   const indexOfFirst = indexOfLast - itemsPerPage;
// // // //   const displayedData = filteredData.slice(indexOfFirst, indexOfLast);
// // // //   const totalPages = Math.ceil(totalItems / itemsPerPage);

// // // //   const getPagination = () => {
// // // //       let pages = [];
      
// // // //       if (totalPages <= 5) {
// // // //           pages = Array.from({ length: totalPages }, (_, i) => i + 1);
// // // //       } else {
// // // //           if (currentPage <= 3) {
// // // //               pages = [1, 2, 3, 4, 5, '...'];
// // // //           } else if (currentPage >= totalPages - 2) {
// // // //               pages = [1, '...', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
// // // //           } else {
// // // //               pages = [1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages];
// // // //           }
// // // //       }
// // // //       return pages;
// // // //   };

// // // //   useEffect(() => {
// // // //     const messagesRef = databaseRef(database, "messages");
// // // //     onValue(messagesRef, (snapshot) => {
// // // //       const data = snapshot.val();
// // // //       const messages = [];
// // // //       Object.keys(data).forEach((key) => {
// // // //         messages.push({...data[key], id: key });
// // // //       });
// // // //       setMessages(messages);
// // // //     }
// // // //     );
// // // //   }, []);
  

// // // //   return (
// // // //     <div>
// // // //         <div className="relative overflow-x-auto shadow-md sm:rounded-lg ">
// // // //             {/* //title */}
// // // //             <div className="flex justify-between items-center px-4 py-3 ">
// // // //                 <h2 className="text-xl font-bold mb-4">Laporan Data4</h2>
// // // //             </div>
// // // //             {/* //search */}
// // // //             <div className="flex justify-between  px-4 py-3">
// // // //               <div className="flex">
// // // //                   <select
// // // //                       id="itemsPerPage"
// // // //                       value={itemsPerPage}
// // // //                       onChange={handleItemsPerPageChange}
// // // //                       className="border rounded px-2 py-1"
// // // //                   >
// // // //                       <option value={10}>10</option>
// // // //                       <option value={25}>25</option>
// // // //                       <option value={50}>50</option>
// // // //                       <option value={100}>100</option>
// // // //                   </select>
// // // //                   <div className="mt-4 text-sm text-gray-500">
// // // //                       Total User: {filteredData.length}
// // // //                   </div>
// // // //               </div>
// // // //               <div className="relative ">
// // // //                   <form className="max-w-md mx-auto ml-2"> 
// // // //                       <label className="mb-2 text-sm font-medium text-gray-00 sr-only dark:text-white">Search</label>
// // // //                       <div >
// // // //                           <input 
// // // //                           onChange={handleSearch} 
// // // //                           value={searchTerm} type="search" id="default-search" className=" block w-full p-4 ps-10 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-400 dark:border-gray-600 dark:placeholder-gray-800 dark:text-gray-800 dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="Search" required />
// // // //                       </div>
// // // //                   </form>
// // // //               </div>
// // // //             </div>
// // // //           <br />
// // // //           <table className="w-full text-sm bg-white border border-gray-300 rounded-lg">
// // // //             <thead>
// // // //                 <tr className="bg-gray-200">
// // // //                   <th className="border border-gray-300 px-4 py-2">No 
// // // //                     <button onClick={sortByName} className="ml-2">
// // // //                         {sortOrderName === 'asc' ? '↑' : '↓'}
// // // //                     </button>
// // // //                   </th>
// // // //                   <th className="border border-gray-300 px-4 py-2">Pengirim
// // // //                     <button onClick={sortByName} className="ml-2">
// // // //                         {sortOrderName === 'asc' ? '↑' : '↓'}
// // // //                     </button>
// // // //                   </th>
// // // //                   <th className="border border-gray-300 px-4 py-2">Penerima
// // // //                     <button onClick={sortByName} className="ml-2">
// // // //                         {sortOrderName === 'asc' ? '↑' : '↓'}
// // // //                     </button>
// // // //                   </th>
// // // //                   <th className="border border-gray-300 px-4 py-2">pesan
// // // //                     <button onClick={sortByName} className="ml-2">
// // // //                         {sortOrderName === 'asc' ? '↑' : '↓'}
// // // //                     </button>
// // // //                   </th>
// // // //                   <th className="border border-gray-300 px-4 py-2">File
// // // //                     <button onClick={sortByName} className="ml-2">
// // // //                         {sortOrderName === 'asc' ? '↑' : '↓'}
// // // //                     </button>
// // // //                   </th>
// // // //                   <th className="border border-gray-300 px-4 py-2">Waktu
// // // //                   </th>
// // // //                   <th className="border border-gray-300 px-4 py-2">Status</th>
// // // //                   <th className="border border-gray-300 px-4 py-2">Read</th>
// // // //                 </tr>
// // // //             </thead>
// // // //             <tbody>
// // // //               {displayedData.length>0?
// // // //                 displayedData.map((msg, index) => (
// // // //                 <tr key={index} className="hover:bg-gray-100">
// // // //                   <td className="border border-gray-300 px-4 py-2 text-center">{index + 1}</td>
// // // //                   <td className="border border-gray-300 px-4 py-2 text-center">{msg.pengirim}</td>
// // // //                   <td className="border border-gray-300 px-4 py-2 text-center">{msg.penerima}</td>
// // // //                   <td className="border border-gray-300 px-4 py-2 text-left">{msg.pesan}</td>
// // // //                   <td className="border border-gray-300 px-4 py-2 text-center">
// // // //                     {msg.file && <a href={msg.file} target="_blank" rel="noopener noreferrer">{msg.file.substring(msg.file.lastIndexOf('/') + 1)}</a>}
// // // //                   </td>
// // // //                   <td className="border border-gray-300 px-4 py-2 text-center">{msg.timestamp && format(msg.timestamp, "dd/MM/yyyy HH:mm:ss")}</td>
// // // //                   <td className="border border-gray-300 px-4 py-2">{msg.read ? (
// // // //                     <button
// // // //                         type="button"
// // // //                         className="focus:outline-none text-white bg-green-700 hover:bg-green-800 focus:ring-4 focus:ring-green-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2"
// // // //                       >
// // // //                         ✅ Dibaca
// // // //                       </button>
// // // //                     ) : (
// // // //                       <button
// // // //                         type="button"
// // // //                         className="focus:outline-none text-white bg-red-700 hover:bg-red-800 focus:ring-4 focus:ring-red-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2"
// // // //                       >
// // // //                         ❌ Belum Dibaca
// // // //                       </button>
// // // //                     )}
// // // //                   </td>
// // // //                   <td className="border border-gray-300 px-4 py-2 text-center">{msg.timestampRead && format(msg.timestampRead, "dd/MM/yyyy HH:mm:ss")}</td>
// // // //                 </tr>
// // // //               )): (
// // // //                 <tr>
// // // //                     <td colSpan="5" className="py-2 px-4 text-center">Data tidak ditemukan</td>
// // // //                 </tr>
// // // //                 )
// // // //               }
// // // //             </tbody>
// // // //           </table>
// // // //           {totalItems > itemsPerPage && (
// // // //               <nav className="m-4 flex items-center flex-column flex-wrap md:flex-row justify-between pt-4" aria-label="Table navigation">
// // // //                   <span className="text-sm font-normal text-gray-500 dark:text-gray-400">
// // // //                       Page {currentPage} of {totalPages}
// // // //                   </span>
                  
// // // //                   <ul className="inline-flex items-center -space-x-px">
// // // //                       <li>
// // // //                           <button
// // // //                               onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
// // // //                               className="py-2 px-4 border border-gray-300 rounded-l-lg dark:border-gray-600 dark:bg-gray-400 dark:text-white"
// // // //                               disabled={currentPage === 1}
// // // //                           >
// // // //                               Previous
// // // //                           </button>
// // // //                       </li>
// // // //                       {/* {[...Array(totalPages)].map((_, i) => (
// // // //                           <li key={i + 1}>
// // // //                               <button
// // // //                                   onClick={() => setCurrentPage(i + 1)}
// // // //                                   className={`py-2 px-4 border border-gray-300 ${currentPage === i + 1? 'border-gray-600 text-gray-600' : 'text-gray-500 dark:text-gray-400'}`}
// // // //                                   > {i +1}</button>
// // // //                                   </li>
// // // //                       ))} */}
// // // //                       {getPagination().map((page, index) => (
// // // //                           <li key={index}>
// // // //                               {page === '...' ? (
// // // //                                   <span className="py-2 px-4">...</span>
// // // //                               ) : (
// // // //                                   <button
// // // //                                       onClick={() => setCurrentPage(page)}
// // // //                                       className={`py-2 px-4 border border-gray-300 ${currentPage === page ? 'border-gray-600 text-gray-600' : 'text-gray-500 dark:text-gray-400'}`}
// // // //                                   >
// // // //                                       {page}
// // // //                                   </button>
// // // //                               )}
// // // //                           </li>
// // // //                       ))}
// // // //                       <li>
// // // //                           <button
// // // //                               onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
// // // //                               className="py-2 px-4 border border-gray-300 rounded-r-lg dark:border-gray-600 dark:bg-gray-400 dark:text-white"
// // // //                               disabled={currentPage === totalPages}
// // // //                           >
// // // //                               Next
// // // //                           </button>
// // // //                       </li>
// // // //                   </ul>
// // // //               </nav>
// // // //           )}
// // // //         </div>         
// // // //     </div>
// // // //   );
// // // // };

// // // // export default AdminChatTable;


// // // // // "use client";

// // // // // import { useEffect, useState } from "react";
// // // // // import { database } from "../config/firebase";
// // // // // import { ref as databaseRef, onValue } from "firebase/database";
// // // // // import { format } from "date-fns";

// // // // // const AdminChatTable = () => {
// // // // //   const [messages, setMessages] = useState([]);
// // // // //   const [itemsPerPage, setItemsPerPage] = useState(10);
// // // // //   const [currentPage, setCurrentPage] = useState(1);
// // // // //   const [searchTerm, setSearchTerm] = useState('');


// // // // //   // Fungsi untuk mengurutkan berdasarkan nama
// // // // //   const sortByName = () => {
// // // // //     const sortedData = [...messages].sort((a, b) => {
// // // // //         const comparison = a.name.localeCompare(b.name);
// // // // //         return sortOrderName === 'asc' ? comparison : -comparison;
// // // // //     });
// // // // //     setAttendanceData(sortedData);
// // // // //     setSortOrderName(sortOrderName === 'asc' ? 'desc' : 'asc');
// // // // //   };

// // // // //    const handleSearch = (e) => {
// // // // //       setSearchTerm(e.target.value);
// // // // //   };

// // // // //   const handleItemsPerPageChange = (e) => {
// // // // //       setItemsPerPage(e.target.value);
// // // // //       setCurrentPage(1);
// // // // //   };
// // // // //   const filteredData = Array.isArray(messages) ? messages.filter(item => {
// // // // //      const name = item.name.toLowerCase().includes(searchTerm.toLowerCase());
// // // // //      const pesan = item.pesan.toLowerCase().includes(searchTerm.toLowerCase());
// // // // //      const penerima = item.penerima.toLowerCase().includes(searchTerm.toLowerCase()); 
// // // // //      const pengirim = item.pengirim.toLowerCase().includes(searchTerm.toLowerCase());
// // // // //         return  name,penerima,pesan,pengirim;
// // // // //   }) : [];

// // // // //   // Pagination Logic
// // // // //   const totalItems = filteredData.length;
// // // // //   const indexOfLast = currentPage * itemsPerPage;
// // // // //   const indexOfFirst = indexOfLast - itemsPerPage;
// // // // //   const displayedData = filteredData.slice(indexOfFirst, indexOfLast);
// // // // //   const totalPages = Math.ceil(totalItems / itemsPerPage);

// // // // //   const getPagination = () => {
// // // // //       let pages = [];
      
// // // // //       if (totalPages <= 5) {
// // // // //           pages = Array.from({ length: totalPages }, (_, i) => i + 1);
// // // // //       } else {
// // // // //           if (currentPage <= 3) {
// // // // //               pages = [1, 2, 3, 4, 5, '...'];
// // // // //           } else if (currentPage >= totalPages - 2) {
// // // // //               pages = [1, '...', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
// // // // //           } else {
// // // // //               pages = [1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages];
// // // // //           }
// // // // //       }
// // // // //       return pages;
// // // // //   };

// // // // //   useEffect(() => {
// // // // //     const messagesRef = databaseRef(database, "messages");
// // // // //     onValue(messagesRef, (snapshot) => {
// // // // //       const data = snapshot.val();
// // // // //       const messages = [];
// // // // //       Object.keys(data).forEach((key) => {
// // // // //         messages.push({...data[key], id: key });
// // // // //       });
// // // // //       setMessages(messages);
// // // // //     }
// // // // //     );
// // // // //   }, []);
  

// // // // //   return (
// // // // //     <div>
// // // // //         <div className="relative overflow-x-auto shadow-md sm:rounded-lg ">
// // // // //             {/* //title */}
// // // // //             <div className="flex justify-between items-center px-4 py-3 ">
// // // // //                 <h2 className="text-xl font-bold mb-4">Laporan Data4</h2>
// // // // //             </div>
// // // // //             {/* //search */}
// // // // //             <div className="flex justify-between  px-4 py-3">
// // // // //               <div className="flex">
// // // // //                   <select
// // // // //                       id="itemsPerPage"
// // // // //                       value={itemsPerPage}
// // // // //                       onChange={handleItemsPerPageChange}
// // // // //                       className="border rounded px-2 py-1"
// // // // //                   >
// // // // //                       <option value={10}>10</option>
// // // // //                       <option value={25}>25</option>
// // // // //                       <option value={50}>50</option>
// // // // //                       <option value={100}>100</option>
// // // // //                   </select>
// // // // //                   <div className="mt-4 text-sm text-gray-500">
// // // // //                       Total User: {filteredData.length}
// // // // //                   </div>
// // // // //               </div>
// // // // //               <div className="relative ">
// // // // //                   <form className="max-w-md mx-auto ml-2"> 
// // // // //                       <label className="mb-2 text-sm font-medium text-gray-00 sr-only dark:text-white">Search</label>
// // // // //                       <div >
// // // // //                           <input 
// // // // //                           onChange={handleSearch} 
// // // // //                           value={searchTerm} type="search" id="default-search" className=" block w-full p-4 ps-10 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-400 dark:border-gray-600 dark:placeholder-gray-800 dark:text-gray-800 dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="Search" required />
// // // // //                       </div>
// // // // //                   </form>
// // // // //               </div>
// // // // //             </div>
// // // // //           <br />
// // // // //           <table className="w-full text-sm bg-white border border-gray-300 rounded-lg">
// // // // //             <thead>
// // // // //                 <tr className="bg-gray-200">
// // // // //                   <th className="border border-gray-300 px-4 py-2">No</th>
// // // // //                   <th className="border border-gray-300 px-4 py-2">Pengirim</th>
// // // // //                   <th className="border border-gray-300 px-4 py-2">Penerima</th>
// // // // //                   <th className="border border-gray-300 px-4 py-2">Pesan</th>
// // // // //                   <th className="border border-gray-300 px-4 py-2">File</th>
// // // // //                   <th className="border border-gray-300 px-4 py-2">Waktu</th>
// // // // //                   <th className="border border-gray-300 px-4 py-2">Status</th>
// // // // //                   <th className="border border-gray-300 px-4 py-2">Read</th>
// // // // //                 </tr>
// // // // //             </thead>
// // // // //             <tbody>
// // // // //               {displayedData.length>0?
// // // // //                 displayedData.map((msg, index) => (
// // // // //                 <tr key={index} className="hover:bg-gray-100">
// // // // //                   <td className="border border-gray-300 px-4 py-2 text-center">{index + 1}</td>
// // // // //                   <td className="border border-gray-300 px-4 py-2 text-center">{msg.pengirim}</td>
// // // // //                   <td className="border border-gray-300 px-4 py-2 text-center">{msg.penerima}</td>
// // // // //                   <td className="border border-gray-300 px-4 py-2 text-left">{msg.pesan}</td>
// // // // //                   <td className="border border-gray-300 px-4 py-2 text-center">
// // // // //                     {msg.file && <a href={msg.file} target="_blank" rel="noopener noreferrer">{msg.file.substring(msg.file.lastIndexOf('/') + 1)}</a>}
// // // // //                   </td>
// // // // //                   <td className="border border-gray-300 px-4 py-2 text-center">{msg.timestamp && format(msg.timestamp, "dd/MM/yyyy HH:mm:ss")}</td>
// // // // //                   <td className="border border-gray-300 px-4 py-2">{msg.read ? (
// // // // //                     <button
// // // // //                         type="button"
// // // // //                         className="focus:outline-none text-white bg-green-700 hover:bg-green-800 focus:ring-4 focus:ring-green-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2"
// // // // //                       >
// // // // //                         ✅ Dibaca
// // // // //                       </button>
// // // // //                     ) : (
// // // // //                       <button
// // // // //                         type="button"
// // // // //                         className="focus:outline-none text-white bg-red-700 hover:bg-red-800 focus:ring-4 focus:ring-red-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2"
// // // // //                       >
// // // // //                         ❌ Belum Dibaca
// // // // //                       </button>
// // // // //                     )}
// // // // //                   </td>
// // // // //                   <td className="border border-gray-300 px-4 py-2 text-center">{msg.timestampRead && format(msg.timestampRead, "dd/MM/yyyy HH:mm:ss")}</td>
// // // // //                 </tr>
// // // // //               )): (
// // // // //                 <tr>
// // // // //                     <td colSpan="5" className="py-2 px-4 text-center">Data tidak ditemukan</td>
// // // // //                 </tr>
// // // // //                 )
// // // // //               }
// // // // //             </tbody>
// // // // //           </table>
// // // // //           {totalItems > itemsPerPage && (
// // // // //               <nav className="m-4 flex items-center flex-column flex-wrap md:flex-row justify-between pt-4" aria-label="Table navigation">
// // // // //                   <span className="text-sm font-normal text-gray-500 dark:text-gray-400">
// // // // //                       Page {currentPage} of {totalPages}
// // // // //                   </span>
                  
// // // // //                   <ul className="inline-flex items-center -space-x-px">
// // // // //                       <li>
// // // // //                           <button
// // // // //                               onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
// // // // //                               className="py-2 px-4 border border-gray-300 rounded-l-lg dark:border-gray-600 dark:bg-gray-400 dark:text-white"
// // // // //                               disabled={currentPage === 1}
// // // // //                           >
// // // // //                               Previous
// // // // //                           </button>
// // // // //                       </li>
// // // // //                       {/* {[...Array(totalPages)].map((_, i) => (
// // // // //                           <li key={i + 1}>
// // // // //                               <button
// // // // //                                   onClick={() => setCurrentPage(i + 1)}
// // // // //                                   className={`py-2 px-4 border border-gray-300 ${currentPage === i + 1? 'border-gray-600 text-gray-600' : 'text-gray-500 dark:text-gray-400'}`}
// // // // //                                   > {i +1}</button>
// // // // //                                   </li>
// // // // //                       ))} */}
// // // // //                       {getPagination().map((page, index) => (
// // // // //                           <li key={index}>
// // // // //                               {page === '...' ? (
// // // // //                                   <span className="py-2 px-4">...</span>
// // // // //                               ) : (
// // // // //                                   <button
// // // // //                                       onClick={() => setCurrentPage(page)}
// // // // //                                       className={`py-2 px-4 border border-gray-300 ${currentPage === page ? 'border-gray-600 text-gray-600' : 'text-gray-500 dark:text-gray-400'}`}
// // // // //                                   >
// // // // //                                       {page}
// // // // //                                   </button>
// // // // //                               )}
// // // // //                           </li>
// // // // //                       ))}
// // // // //                       <li>
// // // // //                           <button
// // // // //                               onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
// // // // //                               className="py-2 px-4 border border-gray-300 rounded-r-lg dark:border-gray-600 dark:bg-gray-400 dark:text-white"
// // // // //                               disabled={currentPage === totalPages}
// // // // //                           >
// // // // //                               Next
// // // // //                           </button>
// // // // //                       </li>
// // // // //                   </ul>
// // // // //               </nav>
// // // // //           )}
// // // // //         </div>         
// // // // //     </div>
// // // // //   );
// // // // // };

// // // // // export default AdminChatTable;


// // // // // // "use client";

// // // // // // import { useEffect, useState } from "react";
// // // // // // import { database } from "../config/firebase";
// // // // // // import { ref as databaseRef, onValue } from "firebase/database";
// // // // // // import { format } from "date-fns";

// // // // // // const AdminChatTable = () => {
// // // // // //   const [messages, setMessages] = useState([]);
// // // // // //   const [itemsPerPage, setItemsPerPage] = useState(10);
// // // // // //   const [currentPage, setCurrentPage] = useState(1);
// // // // // //   const [searchTerm, setSearchTerm] = useState('');


// // // // // //    const handleSearch = (e) => {
// // // // // //       setSearchTerm(e.target.value);
// // // // // //   };

// // // // // //   const handleItemsPerPageChange = (e) => {
// // // // // //       setItemsPerPage(e.target.value);
// // // // // //       setCurrentPage(1);
// // // // // //   };
// // // // // //   const filteredData = Array.isArray(messages) ? messages.filter(item => {
// // // // // //      const name = item.name.toLowerCase().includes(searchTerm.toLowerCase()) || item.pesan.toLowerCase().includes(searchTerm.toLowerCase()) || item.penerima.toLowerCase().includes(searchTerm.toLowerCase()) || item.pengirim.includes(searchTerm);
// // // // // //         return  name;
// // // // // //   }) : [];

// // // // // //   // Pagination Logic
// // // // // //   const totalItems = filteredData.length;
// // // // // //   const indexOfLast = currentPage * itemsPerPage;
// // // // // //   const indexOfFirst = indexOfLast - itemsPerPage;
// // // // // //   const displayedData = filteredData.slice(indexOfFirst, indexOfLast);
// // // // // //   const totalPages = Math.ceil(totalItems / itemsPerPage);

// // // // // //   const getPagination = () => {
// // // // // //       let pages = [];
      
// // // // // //       if (totalPages <= 5) {
// // // // // //           pages = Array.from({ length: totalPages }, (_, i) => i + 1);
// // // // // //       } else {
// // // // // //           if (currentPage <= 3) {
// // // // // //               pages = [1, 2, 3, 4, 5, '...'];
// // // // // //           } else if (currentPage >= totalPages - 2) {
// // // // // //               pages = [1, '...', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
// // // // // //           } else {
// // // // // //               pages = [1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages];
// // // // // //           }
// // // // // //       }
// // // // // //       return pages;
// // // // // //   };

// // // // // //   useEffect(() => {
// // // // // //     const messagesRef = databaseRef(database, "chatsBox"); // Referensi ke chatsBox di Firebase
// // // // // //     onValue(messagesRef, (snapshot) => {
// // // // // //       const data = snapshot.val(); // Mengambil data dari Firebase
// // // // // //       if (data) {
// // // // // //          console.log("Data dari Firebase:", data); // Debugging: menampilkan data di console
     
// // // // // //         setMessages(Object.values(data).reverse()); // Mengambil data dan langsung menampilkan tanpa format
// // // // // //       }
// // // // // //     });
// // // // // //   }, []);

// // // // // //   return (
// // // // // //     <div>
// // // // // //         <div className="relative overflow-x-auto shadow-md sm:rounded-lg ">
// // // // // //             {/* //title */}
// // // // // //             <div className="flex justify-between items-center px-4 py-3 ">
// // // // // //                 <h2 className="text-xl font-bold mb-4">Laporan Data4</h2>
// // // // // //             </div>
// // // // // //             {/* //search */}
// // // // // //             <div className="flex justify-between  px-4 py-3">
// // // // // //               <div className="flex">
// // // // // //                   <select
// // // // // //                       id="itemsPerPage"
// // // // // //                       value={itemsPerPage}
// // // // // //                       onChange={handleItemsPerPageChange}
// // // // // //                       className="border rounded px-2 py-1"
// // // // // //                   >
// // // // // //                       <option value={10}>10</option>
// // // // // //                       <option value={25}>25</option>
// // // // // //                       <option value={50}>50</option>
// // // // // //                       <option value={100}>100</option>
// // // // // //                   </select>
// // // // // //                   <div className="mt-4 text-sm text-gray-500">
// // // // // //                       Total User: {filteredData.length}
// // // // // //                   </div>
// // // // // //               </div>
// // // // // //               <div className="relative ">
// // // // // //                   <form className="max-w-md mx-auto ml-2"> 
// // // // // //                       <label className="mb-2 text-sm font-medium text-gray-00 sr-only dark:text-white">Search</label>
// // // // // //                       <div >
// // // // // //                           <input 
// // // // // //                           onChange={handleSearch} 
// // // // // //                           value={searchTerm} type="search" id="default-search" className=" block w-full p-4 ps-10 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-400 dark:border-gray-600 dark:placeholder-gray-800 dark:text-gray-800 dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="Search" required />
// // // // // //                       </div>
// // // // // //                   </form>
// // // // // //               </div>
// // // // // //             </div>
// // // // // //           <br />
// // // // // //           <table className="w-full text-sm bg-white border border-gray-300 rounded-lg">
// // // // // //             <thead>
// // // // // //                 <tr className="bg-gray-200">
// // // // // //                   <th className="border border-gray-300 px-4 py-2">No</th>
// // // // // //                   <th className="border border-gray-300 px-4 py-2">Pengirim</th>
// // // // // //                   <th className="border border-gray-300 px-4 py-2">Penerima</th>
// // // // // //                   <th className="border border-gray-300 px-4 py-2">Pesan</th>
// // // // // //                   <th className="border border-gray-300 px-4 py-2">File</th>
// // // // // //                   <th className="border border-gray-300 px-4 py-2">Waktu</th>
// // // // // //                   <th className="border border-gray-300 px-4 py-2">Status</th>
// // // // // //                   <th className="border border-gray-300 px-4 py-2">Read</th>
// // // // // //                 </tr>
// // // // // //             </thead>
// // // // // //             <tbody>
// // // // // //               {displayedData.length>0?
// // // // // //                 displayedData.map((msg, index) => (
// // // // // //                 <tr key={index} className="hover:bg-gray-100">
// // // // // //                   <td className="border border-gray-300 px-4 py-2 text-center">{index + 1}</td>
// // // // // //                   <td className="border border-gray-300 px-4 py-2 text-center">{msg.pengirim}</td>
// // // // // //                   <td className="border border-gray-300 px-4 py-2 text-center">{msg.penerima}</td>
// // // // // //                   <td className="border border-gray-300 px-4 py-2 text-left">{msg.pesan}</td>
// // // // // //                   <td className="border border-gray-300 px-4 py-2 text-center">
// // // // // //                     {msg.file && <a href={msg.file} target="_blank" rel="noopener noreferrer">{msg.file.substring(msg.file.lastIndexOf('/') + 1)}</a>}
// // // // // //                   </td>
// // // // // //                   <td className="border border-gray-300 px-4 py-2 text-center">{msg.timestamp && format(msg.timestamp, "dd/MM/yyyy HH:mm:ss")}</td>
// // // // // //                   <td className="border border-gray-300 px-4 py-2">{msg.read ? (
// // // // // //                     <button
// // // // // //                         type="button"
// // // // // //                         className="focus:outline-none text-white bg-green-700 hover:bg-green-800 focus:ring-4 focus:ring-green-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2"
// // // // // //                       >
// // // // // //                         ✅ Dibaca
// // // // // //                       </button>
// // // // // //                     ) : (
// // // // // //                       <button
// // // // // //                         type="button"
// // // // // //                         className="focus:outline-none text-white bg-red-700 hover:bg-red-800 focus:ring-4 focus:ring-red-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2"
// // // // // //                       >
// // // // // //                         ❌ Belum Dibaca
// // // // // //                       </button>
// // // // // //                     )}
// // // // // //                   </td>
// // // // // //                   <td className="border border-gray-300 px-4 py-2 text-center">{msg.timestampRead && format(msg.timestampRead, "dd/MM/yyyy HH:mm:ss")}</td>
// // // // // //                 </tr>
// // // // // //               )): (
// // // // // //                 <tr>
// // // // // //                     <td colSpan="5" className="py-2 px-4 text-center">Data tidak ditemukan</td>
// // // // // //                 </tr>
// // // // // //                 )
// // // // // //               }
// // // // // //             </tbody>
// // // // // //           </table>
// // // // // //           {totalItems > itemsPerPage && (
// // // // // //               <nav className="m-4 flex items-center flex-column flex-wrap md:flex-row justify-between pt-4" aria-label="Table navigation">
// // // // // //                   <span className="text-sm font-normal text-gray-500 dark:text-gray-400">
// // // // // //                       Page {currentPage} of {totalPages}
// // // // // //                   </span>
                  
// // // // // //                   <ul className="inline-flex items-center -space-x-px">
// // // // // //                       <li>
// // // // // //                           <button
// // // // // //                               onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
// // // // // //                               className="py-2 px-4 border border-gray-300 rounded-l-lg dark:border-gray-600 dark:bg-gray-400 dark:text-white"
// // // // // //                               disabled={currentPage === 1}
// // // // // //                           >
// // // // // //                               Previous
// // // // // //                           </button>
// // // // // //                       </li>
// // // // // //                       {/* {[...Array(totalPages)].map((_, i) => (
// // // // // //                           <li key={i + 1}>
// // // // // //                               <button
// // // // // //                                   onClick={() => setCurrentPage(i + 1)}
// // // // // //                                   className={`py-2 px-4 border border-gray-300 ${currentPage === i + 1? 'border-gray-600 text-gray-600' : 'text-gray-500 dark:text-gray-400'}`}
// // // // // //                                   > {i +1}</button>
// // // // // //                                   </li>
// // // // // //                       ))} */}
// // // // // //                       {getPagination().map((page, index) => (
// // // // // //                           <li key={index}>
// // // // // //                               {page === '...' ? (
// // // // // //                                   <span className="py-2 px-4">...</span>
// // // // // //                               ) : (
// // // // // //                                   <button
// // // // // //                                       onClick={() => setCurrentPage(page)}
// // // // // //                                       className={`py-2 px-4 border border-gray-300 ${currentPage === page ? 'border-gray-600 text-gray-600' : 'text-gray-500 dark:text-gray-400'}`}
// // // // // //                                   >
// // // // // //                                       {page}
// // // // // //                                   </button>
// // // // // //                               )}
// // // // // //                           </li>
// // // // // //                       ))}
// // // // // //                       <li>
// // // // // //                           <button
// // // // // //                               onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
// // // // // //                               className="py-2 px-4 border border-gray-300 rounded-r-lg dark:border-gray-600 dark:bg-gray-400 dark:text-white"
// // // // // //                               disabled={currentPage === totalPages}
// // // // // //                           >
// // // // // //                               Next
// // // // // //                           </button>
// // // // // //                       </li>
// // // // // //                   </ul>
// // // // // //               </nav>
// // // // // //           )}
// // // // // //         </div>         
// // // // // //     </div>
// // // // // //   );
// // // // // // };

// // // // // // export default AdminChatTable;
// // // // // // // // 
// // // // // // // "use client";

// // // // // // // import { useEffect, useState } from "react";
// // // // // // // import { database } from "../config/firebase";
// // // // // // // import { ref as databaseRef, onValue } from "firebase/database";
// // // // // // // import { format } from "date-fns";

// // // // // // // const AdminChatTable = () => {
// // // // // // //   const [messages, setMessages] = useState([]);
// // // // // // //   const [itemsPerPage, setItemsPerPage] = useState(10);
// // // // // // //   const [currentPage, setCurrentPage] = useState(1);
// // // // // // //   const [searchTerm, setSearchTerm] = useState('');


// // // // // // //    const handleSearch = (e) => {
// // // // // // //       setSearchTerm(e.target.value);
// // // // // // //   };

// // // // // // //   const handleItemsPerPageChange = (e) => {
// // // // // // //       setItemsPerPage(e.target.value);
// // // // // // //       setCurrentPage(1);
// // // // // // //   };
// // // // // // //   const filteredData = Array.isArray(messages) ? messages.filter(item => {
// // // // // // //      const name = item.name.toLowerCase().includes(searchTerm.toLowerCase()) || item.pesan.toLowerCase().includes(searchTerm.toLowerCase()) || item.penerima.toLowerCase().includes(searchTerm.toLowerCase()) || item.pengirim.includes(searchTerm);
// // // // // // //         return  name;
// // // // // // //   }) : [];

// // // // // // //   // Pagination Logic
// // // // // // //   const totalItems = filteredData.length;
// // // // // // //   const indexOfLast = currentPage * itemsPerPage;
// // // // // // //   const indexOfFirst = indexOfLast - itemsPerPage;
// // // // // // //   const displayedData = filteredData.slice(indexOfFirst, indexOfLast);
// // // // // // //   const totalPages = Math.ceil(totalItems / itemsPerPage);

// // // // // // //   const getPagination = () => {
// // // // // // //       let pages = [];
      
// // // // // // //       if (totalPages <= 5) {
// // // // // // //           pages = Array.from({ length: totalPages }, (_, i) => i + 1);
// // // // // // //       } else {
// // // // // // //           if (currentPage <= 3) {
// // // // // // //               pages = [1, 2, 3, 4, 5, '...'];
// // // // // // //           } else if (currentPage >= totalPages - 2) {
// // // // // // //               pages = [1, '...', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
// // // // // // //           } else {
// // // // // // //               pages = [1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages];
// // // // // // //           }
// // // // // // //       }
// // // // // // //       return pages;
// // // // // // //   };

// // // // // // //   useEffect(() => {
// // // // // // //     const messagesRef = databaseRef(database, "chatsBox"); // Referensi ke chatsBox di Firebase
// // // // // // //     onValue(messagesRef, (snapshot) => {
// // // // // // //       const data = snapshot.val(); // Mengambil data dari Firebase
// // // // // // //       if (data) {
// // // // // // //          console.log("Data dari Firebase:", data); // Debugging: menampilkan data di console
     
// // // // // // //         setMessages(Object.values(data).reverse()); // Mengambil data dan langsung menampilkan tanpa format
// // // // // // //       }
// // // // // // //     });
// // // // // // //   }, []);

// // // // // // //   return (
// // // // // // //     <div>
// // // // // // //         <div className="relative overflow-x-auto shadow-md sm:rounded-lg ">
// // // // // // //             {/* //title */}
// // // // // // //             <div className="flex justify-between items-center px-4 py-3 ">
// // // // // // //                 <h2 className="text-xl font-bold mb-4">Laporan Data4</h2>
// // // // // // //             </div>
// // // // // // //             {/* //search */}
// // // // // // //             <div className="flex justify-between  px-4 py-3">
// // // // // // //               <div className="flex">
// // // // // // //                   <select
// // // // // // //                       id="itemsPerPage"
// // // // // // //                       value={itemsPerPage}
// // // // // // //                       onChange={handleItemsPerPageChange}
// // // // // // //                       className="border rounded px-2 py-1"
// // // // // // //                   >
// // // // // // //                       <option value={10}>10</option>
// // // // // // //                       <option value={25}>25</option>
// // // // // // //                       <option value={50}>50</option>
// // // // // // //                       <option value={100}>100</option>
// // // // // // //                   </select>
// // // // // // //                   <div className="mt-4 text-sm text-gray-500">
// // // // // // //                       Total User: {filteredData.length}
// // // // // // //                   </div>
// // // // // // //               </div>
// // // // // // //               <div className="relative ">
// // // // // // //                   <form className="max-w-md mx-auto ml-2"> 
// // // // // // //                       <label className="mb-2 text-sm font-medium text-gray-00 sr-only dark:text-white">Search</label>
// // // // // // //                       <div >
// // // // // // //                           <input 
// // // // // // //                           onChange={handleSearch} 
// // // // // // //                           value={searchTerm} type="search" id="default-search" className=" block w-full p-4 ps-10 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-400 dark:border-gray-600 dark:placeholder-gray-800 dark:text-gray-800 dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="Search" required />
// // // // // // //                       </div>
// // // // // // //                   </form>
// // // // // // //               </div>
// // // // // // //             </div>
// // // // // // //           <br />
// // // // // // //           <table className="w-full text-sm bg-white border border-gray-300 rounded-lg">
// // // // // // //             <thead>
// // // // // // //                 <tr className="bg-gray-200">
// // // // // // //                   <th className="border border-gray-300 px-4 py-2">Pengirim</th>
// // // // // // //                   <th className="border border-gray-300 px-4 py-2">Penerima</th>
// // // // // // //                   <th className="border border-gray-300 px-4 py-2">Pesan</th>
// // // // // // //                   <th className="border border-gray-300 px-4 py-2">File</th>
// // // // // // //                   <th className="border border-gray-300 px-4 py-2">Waktu</th>
// // // // // // //                   <th className="border border-gray-300 px-4 py-2">Status</th>
// // // // // // //                   <th className="border border-gray-300 px-4 py-2">Read</th>
// // // // // // //                 </tr>
// // // // // // //             </thead>
// // // // // // //             <tbody>
// // // // // // //               {displayedData.map((msg, index) => (
// // // // // // //                 <tr key={index} className="hover:bg-gray-100">
// // // // // // //                   <td className="border border-gray-300 px-4 py-2 text-center">{msg.pengirim}</td>
// // // // // // //                   <td className="border border-gray-300 px-4 py-2 text-center">{msg.penerima}</td>
// // // // // // //                   <td className="border border-gray-300 px-4 py-2 text-left">{msg.pesan}</td>
// // // // // // //                   <td className="border border-gray-300 px-4 py-2 text-center">
// // // // // // //                     {msg.file && <a href={msg.file} target="_blank" rel="noopener noreferrer">{msg.file.substring(msg.file.lastIndexOf('/') + 1)}</a>}
// // // // // // //                   </td>
// // // // // // //                   <td className="border border-gray-300 px-4 py-2 text-center">{msg.timestamp && format(msg.timestamp, "dd/MM/yyyy HH:mm:ss")}</td>
// // // // // // //                   <td className="border border-gray-300 px-4 py-2">{msg.read ? (
// // // // // // //                     <button
// // // // // // //                         type="button"
// // // // // // //                         className="focus:outline-none text-white bg-green-700 hover:bg-green-800 focus:ring-4 focus:ring-green-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2"
// // // // // // //                       >
// // // // // // //                         ✅ Dibaca
// // // // // // //                       </button>
// // // // // // //                     ) : (
// // // // // // //                       <button
// // // // // // //                         type="button"
// // // // // // //                         className="focus:outline-none text-white bg-red-700 hover:bg-red-800 focus:ring-4 focus:ring-red-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2"
// // // // // // //                       >
// // // // // // //                         ❌ Belum Dibaca
// // // // // // //                       </button>
// // // // // // //                     )}
// // // // // // //                   </td>
// // // // // // //                   <td className="border border-gray-300 px-4 py-2 text-center">{msg.timestampRead && format(msg.timestampRead, "dd/MM/yyyy HH:mm:ss")}</td>
// // // // // // //                 </tr>
// // // // // // //               )): (
// // // // // // //                 <tr>
// // // // // // //                     <td colSpan="5" className="py-2 px-4 text-center">Data tidak ditemukan</td>
// // // // // // //                 </tr>
// // // // // // //                 )
// // // // // // //               }
// // // // // // //             </tbody>
// // // // // // //           </table>
// // // // // // //           {totalItems > itemsPerPage && (
// // // // // // //               <nav className="m-4 flex items-center flex-column flex-wrap md:flex-row justify-between pt-4" aria-label="Table navigation">
// // // // // // //                   <span className="text-sm font-normal text-gray-500 dark:text-gray-400">
// // // // // // //                       Page {currentPage} of {totalPages}
// // // // // // //                   </span>
                  
// // // // // // //                   <ul className="inline-flex items-center -space-x-px">
// // // // // // //                       <li>
// // // // // // //                           <button
// // // // // // //                               onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
// // // // // // //                               className="py-2 px-4 border border-gray-300 rounded-l-lg dark:border-gray-600 dark:bg-gray-400 dark:text-white"
// // // // // // //                               disabled={currentPage === 1}
// // // // // // //                           >
// // // // // // //                               Previous
// // // // // // //                           </button>
// // // // // // //                       </li>
// // // // // // //                       {/* {[...Array(totalPages)].map((_, i) => (
// // // // // // //                           <li key={i + 1}>
// // // // // // //                               <button
// // // // // // //                                   onClick={() => setCurrentPage(i + 1)}
// // // // // // //                                   className={`py-2 px-4 border border-gray-300 ${currentPage === i + 1? 'border-gray-600 text-gray-600' : 'text-gray-500 dark:text-gray-400'}`}
// // // // // // //                                   > {i +1}</button>
// // // // // // //                                   </li>
// // // // // // //                       ))} */}
// // // // // // //                       {getPagination().map((page, index) => (
// // // // // // //                           <li key={index}>
// // // // // // //                               {page === '...' ? (
// // // // // // //                                   <span className="py-2 px-4">...</span>
// // // // // // //                               ) : (
// // // // // // //                                   <button
// // // // // // //                                       onClick={() => setCurrentPage(page)}
// // // // // // //                                       className={`py-2 px-4 border border-gray-300 ${currentPage === page ? 'border-gray-600 text-gray-600' : 'text-gray-500 dark:text-gray-400'}`}
// // // // // // //                                   >
// // // // // // //                                       {page}
// // // // // // //                                   </button>
// // // // // // //                               )}
// // // // // // //                           </li>
// // // // // // //                       ))}
// // // // // // //                       <li>
// // // // // // //                           <button
// // // // // // //                               onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
// // // // // // //                               className="py-2 px-4 border border-gray-300 rounded-r-lg dark:border-gray-600 dark:bg-gray-400 dark:text-white"
// // // // // // //                               disabled={currentPage === totalPages}
// // // // // // //                           >
// // // // // // //                               Next
// // // // // // //                           </button>
// // // // // // //                       </li>
// // // // // // //                   </ul>
// // // // // // //               </nav>
// // // // // // //           )}
// // // // // // //         </div>         
// // // // // // //     </div>
// // // // // // //   );
// // // // // // // };

// // // // // // // export default AdminChatTable;
// // // // // // // // "use client";

// // // // // // // // import { useEffect, useState } from "react";
// // // // // // // // import { database } from "../config/firebase";
// // // // // // // // import { ref as databaseRef, onValue } from "firebase/database";
// // // // // // // // import { format } from "date-fns";

// // // // // // // // const AdminChatTable = () => {
// // // // // // // //   const [messages, setMessages] = useState([]);
// // // // // // // //   const [itemsPerPage, setItemsPerPage] = useState(10);
// // // // // // // //   const [currentPage, setCurrentPage] = useState(1);
// // // // // // // //   const [searchTerm, setSearchTerm] = useState('');


// // // // // // // //    const handleSearch = (e) => {
// // // // // // // //       setSearchTerm(e.target.value);
// // // // // // // //   };

// // // // // // // //   const handleItemsPerPageChange = (e) => {
// // // // // // // //       setItemsPerPage(e.target.value);
// // // // // // // //       setCurrentPage(1);
// // // // // // // //   };
// // // // // // // //   const filteredData = Array.isArray(messages) ? messages.filter(item => {
// // // // // // // //      const name = item.name.toLowerCase().includes(searchTerm.toLowerCase()) || item.pesan.toLowerCase().includes(searchTerm.toLowerCase()) || item.penerima.toLowerCase().includes(searchTerm.toLowerCase()) || item.pengirim.includes(searchTerm);
// // // // // // // //         return  name;
// // // // // // // //   }) : [];

// // // // // // // //   // Pagination Logic
// // // // // // // //   const totalItems = filteredData.length;
// // // // // // // //   const indexOfLast = currentPage * itemsPerPage;
// // // // // // // //   const indexOfFirst = indexOfLast - itemsPerPage;
// // // // // // // //   const displayedData = filteredData.slice(indexOfFirst, indexOfLast);
// // // // // // // //   const totalPages = Math.ceil(totalItems / itemsPerPage);

// // // // // // // //   const getPagination = () => {
// // // // // // // //       let pages = [];
      
// // // // // // // //       if (totalPages <= 5) {
// // // // // // // //           pages = Array.from({ length: totalPages }, (_, i) => i + 1);
// // // // // // // //       } else {
// // // // // // // //           if (currentPage <= 3) {
// // // // // // // //               pages = [1, 2, 3, 4, 5, '...'];
// // // // // // // //           } else if (currentPage >= totalPages - 2) {
// // // // // // // //               pages = [1, '...', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
// // // // // // // //           } else {
// // // // // // // //               pages = [1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages];
// // // // // // // //           }
// // // // // // // //       }
// // // // // // // //       return pages;
// // // // // // // //   };

// // // // // // // //   useEffect(() => {
// // // // // // // //     const messagesRef = databaseRef(database, "chatsBox"); // Referensi ke chatsBox di Firebase
// // // // // // // //     onValue(messagesRef, (snapshot) => {
// // // // // // // //       const data = snapshot.val(); // Mengambil data dari Firebase
// // // // // // // //       if (data) {
// // // // // // // //          console.log("Data dari Firebase:", data); // Debugging: menampilkan data di console
     
// // // // // // // //         setMessages(Object.values(data).reverse()); // Mengambil data dan langsung menampilkan tanpa format
// // // // // // // //       }
// // // // // // // //     });
// // // // // // // //   }, []);

// // // // // // // //   return (
// // // // // // // //     <div>
// // // // // // // //         <div className="relative overflow-x-auto shadow-md sm:rounded-lg ">
// // // // // // // //             //title
// // // // // // // //             <div className="flex justify-between items-center px-4 py-3 ">
// // // // // // // //                 <h2 className="text-xl font-bold mb-4">Laporan Data4</h2>
// // // // // // // //             </div>
// // // // // // // //             //search
// // // // // // // //             <div className="flex justify-between  px-4 py-3">
// // // // // // // //               <div className="flex">
// // // // // // // //                   <select
// // // // // // // //                       id="itemsPerPage"
// // // // // // // //                       value={itemsPerPage}
// // // // // // // //                       onChange={handleItemsPerPageChange}
// // // // // // // //                       className="border rounded px-2 py-1"
// // // // // // // //                   >
// // // // // // // //                       <option value={10}>10</option>
// // // // // // // //                       <option value={25}>25</option>
// // // // // // // //                       <option value={50}>50</option>
// // // // // // // //                       <option value={100}>100</option>
// // // // // // // //                   </select>
// // // // // // // //                   <div className="mt-4 text-sm text-gray-500">
// // // // // // // //                       Total User: {filteredData.length}
// // // // // // // //                   </div>
// // // // // // // //               </div>
// // // // // // // //               <div className="relative ">
// // // // // // // //                   <form className="max-w-md mx-auto ml-2"> 
// // // // // // // //                       <label className="mb-2 text-sm font-medium text-gray-00 sr-only dark:text-white">Search</label>
// // // // // // // //                       <div >
// // // // // // // //                           <input 
// // // // // // // //                           onChange={handleSearch} 
// // // // // // // //                           value={searchTerm} type="search" id="default-search" className=" block w-full p-4 ps-10 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-400 dark:border-gray-600 dark:placeholder-gray-800 dark:text-gray-800 dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="Search" required />
// // // // // // // //                       </div>
// // // // // // // //                   </form>
// // // // // // // //               </div>
// // // // // // // //             </div>
// // // // // // // //         </div>
// // // // // // // //         <br />
// // // // // // // //         <table className="w-full text-sm bg-white border border-gray-300 rounded-lg">
// // // // // // // //           <thead>
// // // // // // // //               <tr className="bg-gray-200">
// // // // // // // //                 <th className="border border-gray-300 px-4 py-2">Pengirim</th>
// // // // // // // //                 <th className="border border-gray-300 px-4 py-2">Penerima</th>
// // // // // // // //                 <th className="border border-gray-300 px-4 py-2">Pesan</th>
// // // // // // // //                 <th className="border border-gray-300 px-4 py-2">File</th>
// // // // // // // //                 <th className="border border-gray-300 px-4 py-2">Waktu</th>
// // // // // // // //                 <th className="border border-gray-300 px-4 py-2">Status</th>
// // // // // // // //               </tr>
// // // // // // // //           </thead>
                                           
        
                            
// // // // // // // //     </div>
// // // // // // // //     <div className="max-w-6xl mx-auto p-6 bg-white rounded-lg shadow-md">
// // // // // // // //       <h2 className="text-2xl font-semibold mb-4">📋 Semua Pesan Chat</h2>
// // // // // // // //       <div className="overflow-x-auto">
// // // // // // // //         <table className="w-full border-collapse border border-gray-300">
// // // // // // // //           <thead>
// // // // // // // //             <tr className="bg-gray-200">
// // // // // // // //               <th className="border border-gray-300 px-4 py-2">Pengirim</th>
// // // // // // // //               <th className="border border-gray-300 px-4 py-2">Penerima</th>
// // // // // // // //               <th className="border border-gray-300 px-4 py-2">Pesan</th>
// // // // // // // //               <th className="border border-gray-300 px-4 py-2">File</th>
// // // // // // // //               <th className="border border-gray-300 px-4 py-2">Waktu</th>
// // // // // // // //               <th className="border border-gray-300 px-4 py-2">Status</th>
// // // // // // // //             </tr>
// // // // // // // //           </thead>
// // // // // // // //           <tbody>
// // // // // // // //              {messages.map((msg, index) => (
// // // // // // // //               <tr key={index} className="hover:bg-gray-100">
// // // // // // // //                 <td className="border border-gray-300 px-4 py-2 text-center">{msg.pengirim}</td>
// // // // // // // //                 <td className="border border-gray-300 px-4 py-2 text-center">{msg.penerima}</td>
// // // // // // // //                 <td className="border border-gray-300 px-4 py-2">{msg.pesan}</td>
// // // // // // // //                 {/* File yang dikirim */}
// // // // // // // //                   <td className="border border-gray-300 px-4 py-2 ">
// // // // // // // //                     {msg.files && msg.files.length > 0 ? (
// // // // // // // //                       <div className="flex flex-col gap-1">
// // // // // // // //                         {msg.files.map((file, fileIndex) => (
// // // // // // // //                           <a
// // // // // // // //                             key={fileIndex}
// // // // // // // //                             href={file.url}
// // // // // // // //                             target="_blank"
// // // // // // // //                             rel="noopener noreferrer"
// // // // // // // //                             className="text-blue-500 underline"
// // // // // // // //                           >
// // // // // // // //                             📄 {file.name}
// // // // // // // //                           </a>
// // // // // // // //                         ))}
// // // // // // // //                       </div>
// // // // // // // //                     ) : (
// // // // // // // //                       "-"
// // // // // // // //                     )}
// // // // // // // //                   </td>
// // // // // // // //                 <td className="border border-gray-300 px-4 py-2">{msg.timestamp && format(msg.timestamp, "dd/MM/yyyy HH:mm")}</td>
// // // // // // // //                 <td className="border border-gray-300 px-4 py-2">{msg.read ? (
// // // // // // // //                     <button
// // // // // // // //                       type="button"
// // // // // // // //                       className="focus:outline-none text-white bg-green-700 hover:bg-green-800 focus:ring-4 focus:ring-green-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2"
// // // // // // // //                     >
// // // // // // // //                       ✅ Dibaca
// // // // // // // //                     </button>
// // // // // // // //                   ) : (
// // // // // // // //                     <button
// // // // // // // //                       type="button"
// // // // // // // //                       className="focus:outline-none text-white bg-red-700 hover:bg-red-800 focus:ring-4 focus:ring-red-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2"
// // // // // // // //                     >
// // // // // // // //                       ❌ Belum Dibaca
// // // // // // // //                     </button>
// // // // // // // //                   )}</td>
// // // // // // // //               </tr>
// // // // // // // //             ))}
// // // // // // // //           </tbody>
// // // // // // // //         </table>
// // // // // // // //       </div>
// // // // // // // //     </div>
// // // // // // // //   );
// // // // // // // // };

// // // // // // // // export default AdminChatTable;
// // // // // // // // // "use client";

// // // // // // // // // import { useEffect, useState } from "react";
// // // // // // // // // import { database } from "../config/firebase";
// // // // // // // // // import { ref as databaseRef, onValue } from "firebase/database";
// // // // // // // // // import { format } from "date-fns";

// // // // // // // // // const AdminChatTable = () => {
// // // // // // // // //   const [messages, setMessages] = useState([]);

// // // // // // // // //   useEffect(() => {
// // // // // // // // //     const messagesRef = databaseRef(database, "chatsBox");
// // // // // // // // //     onValue(messagesRef, (snapshot) => {
// // // // // // // // //       const data = snapshot.val();
// // // // // // // // //       if (data) {
// // // // // // // // //         const formattedData = Object.entries(data).map(([id, value]) => ({
// // // // // // // // //           id,
// // // // // // // // //           ...value,
// // // // // // // // //           timestamp: value.timestamp ? new Date(value.timestamp) : null,
// // // // // // // // //           timestampRead: value.timestampRead ? new Date(value.timestampRead) : null,
// // // // // // // // //         }));
// // // // // // // // //         setMessages(formattedData.reverse());
// // // // // // // // //       }
// // // // // // // // //     });
// // // // // // // // //   }, []);

// // // // // // // // //   return (
// // // // // // // // //     <div className="max-w-6xl mx-auto p-6 bg-white rounded-lg shadow-md">
// // // // // // // // //       <h2 className="text-2xl font-semibold mb-4">📋 Semua Pesan Chat</h2>
// // // // // // // // //       <div className="overflow-x-auto">
// // // // // // // // //         <table className="w-full border-collapse border border-gray-300">
// // // // // // // // //           <thead>
// // // // // // // // //             <tr className="bg-gray-200">
// // // // // // // // //               <th className="border border-gray-300 px-4 py-2">Pengirim</th>
// // // // // // // // //               <th className="border border-gray-300 px-4 py-2">Penerima</th>
// // // // // // // // //               <th className="border border-gray-300 px-4 py-2">Pesan</th>
// // // // // // // // //               <th className="border border-gray-300 px-4 py-2">File</th>
// // // // // // // // //               <th className="border border-gray-300 px-4 py-2">Waktu</th>
// // // // // // // // //               <th className="border border-gray-300 px-4 py-2">Status</th>
// // // // // // // // //             </tr>
// // // // // // // // //           </thead>
// // // // // // // // //           <tbody>
// // // // // // // // //             {messages.map((msg) => (
// // // // // // // // //               <tr key={msg.id} className="hover:bg-gray-100">
// // // // // // // // //                 <td className="border border-gray-300 px-4 py-2 text-center">{msg.pengirim}</td>
// // // // // // // // //                 <td className="border border-gray-300 px-4 py-2 text-center">{msg.penerima}</td>
// // // // // // // // //                 <td className="border border-gray-300 px-4 py-2">{msg.pesan}</td>
// // // // // // // // //                 <td className="border border-gray-300 px-4 py-2 text-center">
// // // // // // // // //                   {msg.fileUrl && (
// // // // // // // // //                     <a href={msg.fileUrl} target="_blank" className="text-blue-500 underline">
// // // // // // // // //                       📄 {msg.fileName}
// // // // // // // // //                     </a>
// // // // // // // // //                   )}
// // // // // // // // //                 </td>
// // // // // // // // //                 <td className="border border-gray-300 px-4 py-2">{format(msg.timestamp, "dd/MM/yyyy HH:mm")}</td>
// // // // // // // // //                 <td className="border border-gray-300 px-4 py-2">{msg.read ? "✅ Dibaca" : "❌ Belum Dibaca"}</td>
// // // // // // // // //               </tr>
// // // // // // // // //             ))}
// // // // // // // // //           </tbody>
// // // // // // // // //         </table>
// // // // // // // // //       </div>
// // // // // // // // //     </div>
// // // // // // // // //   );
// // // // // // // // // };

// // // // // // // // // export default AdminChatTable;
