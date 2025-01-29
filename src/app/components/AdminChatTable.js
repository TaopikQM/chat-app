"use client";

import { useEffect, useState } from "react";
import { database } from "../config/firebase";
import { ref as databaseRef, onValue } from "firebase/database";
import { format } from "date-fns";

const AdminChatTable = () => {
  const [messages, setMessages] = useState([]);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');


  // Fungsi untuk mengurutkan berdasarkan nama
  const sortByName = () => {
    const sortedData = [...messages].sort((a, b) => {
        const comparison = a.name.localeCompare(b.name);
        return sortOrderName === 'asc' ? comparison : -comparison;
    });
    setAttendanceData(sortedData);
    setSortOrderName(sortOrderName === 'asc' ? 'desc' : 'asc');
  };

   const handleSearch = (e) => {
      setSearchTerm(e.target.value);
  };

  const handleItemsPerPageChange = (e) => {
      setItemsPerPage(e.target.value);
      setCurrentPage(1);
  };
  const filteredData = Array.isArray(messages) ? messages.filter(item => {
     const name = item.name.toLowerCase().includes(searchTerm.toLowerCase()) || item.pesan.toLowerCase().includes(searchTerm.toLowerCase()) || item.penerima.toLowerCase().includes(searchTerm.toLowerCase()) || item.pengirim.includes(searchTerm);
        return  name;
  }) : [];

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

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        if(response.ok){
          const data = await response.json();
          setMessages(data);
          console.log("Data berhasil diambil"); // Debugging: menampilkan pesan jika data berhasil diambil
          setSortOrderName('asc'); // Menjadikan data diambil secara ascending
          setSearchTerm(''); // Menghapus search term setelah data diambil
          setItemsPerPage(10); // Mengatur jumlah item per halaman menjadi 10
          setCurrentPage(1); // Mengatur halaman yang ditampilkan menjadi 1
          } else {
            console.error("Data gagal diambil"); // Debugging: menampilkan pesan jika data gagal diambil
        }
      } catch (error) {
        console.error("Data gagal diambil", error); // Debugging: menampilkan pesan jika data gagal diambil
      }
      // ambil data Firebase
      const dbRef = databaseRef(database, "messages");
      onValue(dbRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
          setMessages(Object.values(data));
        }
      });
      };
    
      fetchMessages();
  }, []);
  

  return (
    <div>
        <div className="relative overflow-x-auto shadow-md sm:rounded-lg ">
            {/* //title */}
            <div className="flex justify-between items-center px-4 py-3 ">
                <h2 className="text-xl font-bold mb-4">Laporan Data4</h2>
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
                  <th className="border border-gray-300 px-4 py-2">No</th>
                  <th className="border border-gray-300 px-4 py-2">Pengirim</th>
                  <th className="border border-gray-300 px-4 py-2">Penerima</th>
                  <th className="border border-gray-300 px-4 py-2">Pesan</th>
                  <th className="border border-gray-300 px-4 py-2">File</th>
                  <th className="border border-gray-300 px-4 py-2">Waktu</th>
                  <th className="border border-gray-300 px-4 py-2">Status</th>
                  <th className="border border-gray-300 px-4 py-2">Read</th>
                </tr>
            </thead>
            <tbody>
              {displayedData.length>0?
                displayedData.map((msg, index) => (
                <tr key={index} className="hover:bg-gray-100">
                  <td className="border border-gray-300 px-4 py-2 text-center">{index + 1}</td>
                  <td className="border border-gray-300 px-4 py-2 text-center">{msg.pengirim}</td>
                  <td className="border border-gray-300 px-4 py-2 text-center">{msg.penerima}</td>
                  <td className="border border-gray-300 px-4 py-2 text-left">{msg.pesan}</td>
                  <td className="border border-gray-300 px-4 py-2 text-center">
                    {msg.file && <a href={msg.file} target="_blank" rel="noopener noreferrer">{msg.file.substring(msg.file.lastIndexOf('/') + 1)}</a>}
                  </td>
                  <td className="border border-gray-300 px-4 py-2 text-center">{msg.timestamp && format(msg.timestamp, "dd/MM/yyyy HH:mm:ss")}</td>
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
// import { database } from "../config/firebase";
// import { ref as databaseRef, onValue } from "firebase/database";
// import { format } from "date-fns";

// const AdminChatTable = () => {
//   const [messages, setMessages] = useState([]);
//   const [itemsPerPage, setItemsPerPage] = useState(10);
//   const [currentPage, setCurrentPage] = useState(1);
//   const [searchTerm, setSearchTerm] = useState('');


//    const handleSearch = (e) => {
//       setSearchTerm(e.target.value);
//   };

//   const handleItemsPerPageChange = (e) => {
//       setItemsPerPage(e.target.value);
//       setCurrentPage(1);
//   };
//   const filteredData = Array.isArray(messages) ? messages.filter(item => {
//      const name = item.name.toLowerCase().includes(searchTerm.toLowerCase()) || item.pesan.toLowerCase().includes(searchTerm.toLowerCase()) || item.penerima.toLowerCase().includes(searchTerm.toLowerCase()) || item.pengirim.includes(searchTerm);
//         return  name;
//   }) : [];

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

//   useEffect(() => {
//     const messagesRef = databaseRef(database, "chatsBox"); // Referensi ke chatsBox di Firebase
//     onValue(messagesRef, (snapshot) => {
//       const data = snapshot.val(); // Mengambil data dari Firebase
//       if (data) {
//          console.log("Data dari Firebase:", data); // Debugging: menampilkan data di console
     
//         setMessages(Object.values(data).reverse()); // Mengambil data dan langsung menampilkan tanpa format
//       }
//     });
//   }, []);

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
//                   <th className="border border-gray-300 px-4 py-2">No</th>
//                   <th className="border border-gray-300 px-4 py-2">Pengirim</th>
//                   <th className="border border-gray-300 px-4 py-2">Penerima</th>
//                   <th className="border border-gray-300 px-4 py-2">Pesan</th>
//                   <th className="border border-gray-300 px-4 py-2">File</th>
//                   <th className="border border-gray-300 px-4 py-2">Waktu</th>
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
//                   <td className="border border-gray-300 px-4 py-2 text-center">
//                     {msg.file && <a href={msg.file} target="_blank" rel="noopener noreferrer">{msg.file.substring(msg.file.lastIndexOf('/') + 1)}</a>}
//                   </td>
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
// // // 
// // "use client";

// // import { useEffect, useState } from "react";
// // import { database } from "../config/firebase";
// // import { ref as databaseRef, onValue } from "firebase/database";
// // import { format } from "date-fns";

// // const AdminChatTable = () => {
// //   const [messages, setMessages] = useState([]);
// //   const [itemsPerPage, setItemsPerPage] = useState(10);
// //   const [currentPage, setCurrentPage] = useState(1);
// //   const [searchTerm, setSearchTerm] = useState('');


// //    const handleSearch = (e) => {
// //       setSearchTerm(e.target.value);
// //   };

// //   const handleItemsPerPageChange = (e) => {
// //       setItemsPerPage(e.target.value);
// //       setCurrentPage(1);
// //   };
// //   const filteredData = Array.isArray(messages) ? messages.filter(item => {
// //      const name = item.name.toLowerCase().includes(searchTerm.toLowerCase()) || item.pesan.toLowerCase().includes(searchTerm.toLowerCase()) || item.penerima.toLowerCase().includes(searchTerm.toLowerCase()) || item.pengirim.includes(searchTerm);
// //         return  name;
// //   }) : [];

// //   // Pagination Logic
// //   const totalItems = filteredData.length;
// //   const indexOfLast = currentPage * itemsPerPage;
// //   const indexOfFirst = indexOfLast - itemsPerPage;
// //   const displayedData = filteredData.slice(indexOfFirst, indexOfLast);
// //   const totalPages = Math.ceil(totalItems / itemsPerPage);

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
// //     const messagesRef = databaseRef(database, "chatsBox"); // Referensi ke chatsBox di Firebase
// //     onValue(messagesRef, (snapshot) => {
// //       const data = snapshot.val(); // Mengambil data dari Firebase
// //       if (data) {
// //          console.log("Data dari Firebase:", data); // Debugging: menampilkan data di console
     
// //         setMessages(Object.values(data).reverse()); // Mengambil data dan langsung menampilkan tanpa format
// //       }
// //     });
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
// //                   <th className="border border-gray-300 px-4 py-2">Pengirim</th>
// //                   <th className="border border-gray-300 px-4 py-2">Penerima</th>
// //                   <th className="border border-gray-300 px-4 py-2">Pesan</th>
// //                   <th className="border border-gray-300 px-4 py-2">File</th>
// //                   <th className="border border-gray-300 px-4 py-2">Waktu</th>
// //                   <th className="border border-gray-300 px-4 py-2">Status</th>
// //                   <th className="border border-gray-300 px-4 py-2">Read</th>
// //                 </tr>
// //             </thead>
// //             <tbody>
// //               {displayedData.map((msg, index) => (
// //                 <tr key={index} className="hover:bg-gray-100">
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


// // //    const handleSearch = (e) => {
// // //       setSearchTerm(e.target.value);
// // //   };

// // //   const handleItemsPerPageChange = (e) => {
// // //       setItemsPerPage(e.target.value);
// // //       setCurrentPage(1);
// // //   };
// // //   const filteredData = Array.isArray(messages) ? messages.filter(item => {
// // //      const name = item.name.toLowerCase().includes(searchTerm.toLowerCase()) || item.pesan.toLowerCase().includes(searchTerm.toLowerCase()) || item.penerima.toLowerCase().includes(searchTerm.toLowerCase()) || item.pengirim.includes(searchTerm);
// // //         return  name;
// // //   }) : [];

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
// // //     const messagesRef = databaseRef(database, "chatsBox"); // Referensi ke chatsBox di Firebase
// // //     onValue(messagesRef, (snapshot) => {
// // //       const data = snapshot.val(); // Mengambil data dari Firebase
// // //       if (data) {
// // //          console.log("Data dari Firebase:", data); // Debugging: menampilkan data di console
     
// // //         setMessages(Object.values(data).reverse()); // Mengambil data dan langsung menampilkan tanpa format
// // //       }
// // //     });
// // //   }, []);

// // //   return (
// // //     <div>
// // //         <div className="relative overflow-x-auto shadow-md sm:rounded-lg ">
// // //             //title
// // //             <div className="flex justify-between items-center px-4 py-3 ">
// // //                 <h2 className="text-xl font-bold mb-4">Laporan Data4</h2>
// // //             </div>
// // //             //search
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
// // //         </div>
// // //         <br />
// // //         <table className="w-full text-sm bg-white border border-gray-300 rounded-lg">
// // //           <thead>
// // //               <tr className="bg-gray-200">
// // //                 <th className="border border-gray-300 px-4 py-2">Pengirim</th>
// // //                 <th className="border border-gray-300 px-4 py-2">Penerima</th>
// // //                 <th className="border border-gray-300 px-4 py-2">Pesan</th>
// // //                 <th className="border border-gray-300 px-4 py-2">File</th>
// // //                 <th className="border border-gray-300 px-4 py-2">Waktu</th>
// // //                 <th className="border border-gray-300 px-4 py-2">Status</th>
// // //               </tr>
// // //           </thead>
                                           
        
                            
// // //     </div>
// // //     <div className="max-w-6xl mx-auto p-6 bg-white rounded-lg shadow-md">
// // //       <h2 className="text-2xl font-semibold mb-4">📋 Semua Pesan Chat</h2>
// // //       <div className="overflow-x-auto">
// // //         <table className="w-full border-collapse border border-gray-300">
// // //           <thead>
// // //             <tr className="bg-gray-200">
// // //               <th className="border border-gray-300 px-4 py-2">Pengirim</th>
// // //               <th className="border border-gray-300 px-4 py-2">Penerima</th>
// // //               <th className="border border-gray-300 px-4 py-2">Pesan</th>
// // //               <th className="border border-gray-300 px-4 py-2">File</th>
// // //               <th className="border border-gray-300 px-4 py-2">Waktu</th>
// // //               <th className="border border-gray-300 px-4 py-2">Status</th>
// // //             </tr>
// // //           </thead>
// // //           <tbody>
// // //              {messages.map((msg, index) => (
// // //               <tr key={index} className="hover:bg-gray-100">
// // //                 <td className="border border-gray-300 px-4 py-2 text-center">{msg.pengirim}</td>
// // //                 <td className="border border-gray-300 px-4 py-2 text-center">{msg.penerima}</td>
// // //                 <td className="border border-gray-300 px-4 py-2">{msg.pesan}</td>
// // //                 {/* File yang dikirim */}
// // //                   <td className="border border-gray-300 px-4 py-2 ">
// // //                     {msg.files && msg.files.length > 0 ? (
// // //                       <div className="flex flex-col gap-1">
// // //                         {msg.files.map((file, fileIndex) => (
// // //                           <a
// // //                             key={fileIndex}
// // //                             href={file.url}
// // //                             target="_blank"
// // //                             rel="noopener noreferrer"
// // //                             className="text-blue-500 underline"
// // //                           >
// // //                             📄 {file.name}
// // //                           </a>
// // //                         ))}
// // //                       </div>
// // //                     ) : (
// // //                       "-"
// // //                     )}
// // //                   </td>
// // //                 <td className="border border-gray-300 px-4 py-2">{msg.timestamp && format(msg.timestamp, "dd/MM/yyyy HH:mm")}</td>
// // //                 <td className="border border-gray-300 px-4 py-2">{msg.read ? (
// // //                     <button
// // //                       type="button"
// // //                       className="focus:outline-none text-white bg-green-700 hover:bg-green-800 focus:ring-4 focus:ring-green-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2"
// // //                     >
// // //                       ✅ Dibaca
// // //                     </button>
// // //                   ) : (
// // //                     <button
// // //                       type="button"
// // //                       className="focus:outline-none text-white bg-red-700 hover:bg-red-800 focus:ring-4 focus:ring-red-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2"
// // //                     >
// // //                       ❌ Belum Dibaca
// // //                     </button>
// // //                   )}</td>
// // //               </tr>
// // //             ))}
// // //           </tbody>
// // //         </table>
// // //       </div>
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

// // // //   useEffect(() => {
// // // //     const messagesRef = databaseRef(database, "chatsBox");
// // // //     onValue(messagesRef, (snapshot) => {
// // // //       const data = snapshot.val();
// // // //       if (data) {
// // // //         const formattedData = Object.entries(data).map(([id, value]) => ({
// // // //           id,
// // // //           ...value,
// // // //           timestamp: value.timestamp ? new Date(value.timestamp) : null,
// // // //           timestampRead: value.timestampRead ? new Date(value.timestampRead) : null,
// // // //         }));
// // // //         setMessages(formattedData.reverse());
// // // //       }
// // // //     });
// // // //   }, []);

// // // //   return (
// // // //     <div className="max-w-6xl mx-auto p-6 bg-white rounded-lg shadow-md">
// // // //       <h2 className="text-2xl font-semibold mb-4">📋 Semua Pesan Chat</h2>
// // // //       <div className="overflow-x-auto">
// // // //         <table className="w-full border-collapse border border-gray-300">
// // // //           <thead>
// // // //             <tr className="bg-gray-200">
// // // //               <th className="border border-gray-300 px-4 py-2">Pengirim</th>
// // // //               <th className="border border-gray-300 px-4 py-2">Penerima</th>
// // // //               <th className="border border-gray-300 px-4 py-2">Pesan</th>
// // // //               <th className="border border-gray-300 px-4 py-2">File</th>
// // // //               <th className="border border-gray-300 px-4 py-2">Waktu</th>
// // // //               <th className="border border-gray-300 px-4 py-2">Status</th>
// // // //             </tr>
// // // //           </thead>
// // // //           <tbody>
// // // //             {messages.map((msg) => (
// // // //               <tr key={msg.id} className="hover:bg-gray-100">
// // // //                 <td className="border border-gray-300 px-4 py-2 text-center">{msg.pengirim}</td>
// // // //                 <td className="border border-gray-300 px-4 py-2 text-center">{msg.penerima}</td>
// // // //                 <td className="border border-gray-300 px-4 py-2">{msg.pesan}</td>
// // // //                 <td className="border border-gray-300 px-4 py-2 text-center">
// // // //                   {msg.fileUrl && (
// // // //                     <a href={msg.fileUrl} target="_blank" className="text-blue-500 underline">
// // // //                       📄 {msg.fileName}
// // // //                     </a>
// // // //                   )}
// // // //                 </td>
// // // //                 <td className="border border-gray-300 px-4 py-2">{format(msg.timestamp, "dd/MM/yyyy HH:mm")}</td>
// // // //                 <td className="border border-gray-300 px-4 py-2">{msg.read ? "✅ Dibaca" : "❌ Belum Dibaca"}</td>
// // // //               </tr>
// // // //             ))}
// // // //           </tbody>
// // // //         </table>
// // // //       </div>
// // // //     </div>
// // // //   );
// // // // };

// // // // export default AdminChatTable;
