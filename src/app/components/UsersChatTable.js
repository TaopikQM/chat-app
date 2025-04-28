"use client";

import { useEffect, useState } from "react";
import { database } from "../config/firebase";
import { ref as databaseRef, get, onValue,remove,update } from "firebase/database";
import { format } from "date-fns";

const UsersChatTable = () => {
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState(''); 
    
  // const [totalItems, setTotalItems] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortOrderName, setSortOrderName] = useState('asc');
  
    useEffect(() => {
        const usersRef = databaseRef(database, "pengguna");

        onValue(usersRef, (snapshot) => {
            const data = snapshot.val();
            if (data) {
                const usersArray = Object.keys(data).map(key => ({
                    id: key,
                    ...data[key]
                }));

                // Urutkan berdasarkan status online (true di atas)
                usersArray.sort((a, b) => b.isOnline - a.isOnline);

                setUsers(usersArray);
                // console.log("data",usersArray)
            }
        });
    }, []);
  // 🔹 Hapus pengguna
  const handleDelete = async (userId, userName) => {
    const confirmDelete = window.confirm(`Apakah Anda yakin ingin menghapus pengguna ${userName}?`);
    if (confirmDelete) {
        try {
            await remove(databaseRef(database, `pengguna/${userId}`));
            alert(`Pengguna ${userName} berhasil dihapus.`);
        } catch (error) {
            console.error("Error menghapus pengguna:", error);
            alert("Terjadi kesalahan saat menghapus pengguna.");
        }
    }
};
  const toggleOnlineStatus = async (userId, currentStatus) => {
    const userRef = databaseRef(database, `pengguna/${userId}`);

    try {
        await update(userRef, { isOnline: !currentStatus }); // Hanya update isOnline
        console.log(`Status ${userId} diubah menjadi ${!currentStatus}`);
    } catch (error) {
        console.error("Gagal mengubah status online:", error);
    }
};

  // Fungsi untuk mengurutkan berdasarkan nama
  const sortByName = () => {
    const sortedData = [...users].sort((a, b) => {
        const comparison = a.pesan.localeCompare(b.name);
        return sortOrderName === 'asc' ? comparison : -comparison;
    });
    setUsers(sortedData);
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
const filteredData = users.filter(item =>
    searchTerm === "" || (item?.user && item.user.toLowerCase().includes(searchTerm.toLowerCase()))
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

  

  const handleToggleStatus = async (Id, currentStatus) => {
    const userRef = databaseRef(database, `pengguna/${Id}`);

    try {
        const newStatus = currentStatus === "ACTIVE" ? "NOT ACTIVE" : "ACTIVE";
        const confirmation = window.confirm(`Apakah Anda yakin ingin mengubah status ke ${newStatus}?`);
        
        if (confirmation) {
            await update(userRef, { status: newStatus });

            // Update state secara lokal agar UI langsung berubah tanpa reload
            setUsers(prevMessages =>
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
                <h2 className="text-xl font-bold mb-4">User Messages</h2>
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
          <table className="w-full text-sm bg-white border border-gray-300 rounded-lg">
            <thead>
                <tr className="bg-gray-200">
                  <th className="border border-gray-300 px-4 py-2">No 
                   
                  </th>
                  <th className="border border-gray-300 px-4 py-2">Pengguna
                    <button onClick={sortByName} className="ml-2">
                        {sortOrderName === 'asc' ? '↑' : '↓'}
                    </button>
                  </th>
                  <th className="border border-gray-300 px-4 py-2">Status</th>
                  <th className="border border-gray-300 px-4 py-2">Time Logs Online</th>
{/*<th className="border border-gray-300 px-4 py-2">Action</th>*/}
                </tr>
            </thead>
            <tbody>
              {displayedData.length>0?
                displayedData.map((msg, index) => (
                <tr key={index} className="hover:bg-gray-100">
                  <td className="border border-gray-300 px-4 py-2 text-center">{(currentPage - 1) * itemsPerPage + index + 1}</td>
                  <td className="border border-gray-300 px-4 py-2 text-center">{msg.user}</td>
                  {/* <td className={`border px-4 py-2 ${msg.isOnline ? 'text-green-600' : 'text-red-600'}`}>
                    {msg.isOnline ? "Online" : "Offline"}
                </td> */}
                <td className="border border-gray-300 px-4 py-2">
    <button
        type="button"
        onClick={() => toggleOnlineStatus(msg.id, msg.isOnline)}
        className={`focus:outline-none flex items-center text-white font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 
            ${msg.isOnline ? "bg-green-700 hover:bg-green-800 focus:ring-4 focus:ring-green-300" : "bg-red-700 hover:bg-red-800 focus:ring-4 focus:ring-red-300"}
        `}
    >
        <div className={`h-2.5 w-2.5 rounded-full me-2 ${msg.isOnline ? "bg-green-500" : "bg-red-500"}`}></div>
        {msg.isOnline ? "Online" : "Offline"}
    </button>
</td>
                <td className="border px-4 py-2">
                                {new Date(msg.lastSeen).toLocaleString()}
                            </td>
                  {/* <td className="border border-gray-300 px-4 py-2 text-center">{msg.status}</td> */}
                  {/* <td className="border border-gray-300 px-4 py-2 text-center">{msg.timestamp && format(msg.timestamp, "dd/MM/yyyy HH:mm:ss")}</td> */}
                  
                  
{/* <td className="border border-gray-300 py-2 px-4  text-center">
                    <>
                        <button
                            onClick={() => handleDelete(msg.id)}
                            // className="bg-red-500 text-white px-4 py-2 rounded-md"
                            type="button" className="focus:outline-none text-white bg-red-700 hover:bg-red-800 focus:ring-4 focus:ring-red-300 font-medium rounded-md text-sm px-4 py-2  dark:bg-red-600 dark:hover:bg-red-700 dark:focus:ring-red-900"
                        >
                            Hapus
                        </button>
                    </>
                  </td>*/}
                </tr>
              )): (
                <tr>
                    <td colSpan="5" className="py-2 px-4 text-center">Data tidak ditemukann</td>
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

export default UsersChatTable;
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
