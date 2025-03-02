"use client";

import { useEffect, useState } from "react";
import { rtdb } from "../config/firebase";
import { ref as databaseRef, get, onValue,remove,update } from "firebase/database";
import { format } from "date-fns";

const LUsersChatTable = () => {
  const [logsUsers, setLogsUsers] = useState([]);

  
  const [searchTerm, setSearchTerm] = useState(''); 
    
  // const [totalItems, setTotalItems] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortOrderName, setSortOrderName] = useState('asc');
  
    useEffect(() => {
        const logsRef = databaseRef(rtdb, "logs_pengguna"); // 🔹 Ambil semua log pengguna

        const unsubscribe = onValue(logsRef, (snapshot) => {
            const data = snapshot.val();
            if (data) {
                let logsArray = [];

                // 🔹 Loop untuk mengambil semua user dalam logs_pengguna
                Object.keys(data).forEach((userId) => {
                    const userLogs = data[userId]; // Data tiap user
                    Object.keys(userLogs).forEach((logId) => {
                        logsArray.push({
                            id: logId,
                            user: userLogs[logId].user, // Ambil user
                            status: userLogs[logId].status, // Ambil status
                            timestamp: userLogs[logId].timestamp // Ambil timestamp
                        });
                    });
                });

                // Urutkan berdasarkan timestamp (terbaru ke terlama)
                logsArray.sort((a, b) => b.timestamp - a.timestamp);

                setLogsUsers(logsArray);
                // console.log("Data logsUsers:", logsArray);
            }
        });

        return () => unsubscribe(); // Unsubscribe saat komponen di-unmount
    }, []);
 // 🔹 Hapus pengguna
    const handleDelete = async (userId, userName) => {
        const confirmDelete = window.confirm(`Apakah Anda yakin ingin menghapus pengguna ${userName}?`);
        if (confirmDelete) {
            try {
                await remove(databaseRef(rtdb, `logs_pengguna/${userId}`));
                alert(`Pengguna ${userName} berhasil dihapus.`);
            } catch (error) {
                console.error("Error menghapus pengguna:", error);
                alert("Terjadi kesalahan saat menghapus pengguna.");
            }
        }
    };

  // Fungsi untuk mengurutkan berdasarkan nama
  const sortByName = () => {
    const sortedData = [...logsUsers].sort((a, b) => {
        const comparison = a.pesan.localeCompare(b.name);
        return sortOrderName === 'asc' ? comparison : -comparison;
    });
    setLogsUsers(sortedData);
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
    const filteredData = logsUsers.filter(item =>
        searchTerm === "" || (item?.user && item.user.toLowerCase().includes(searchTerm.toLowerCase()))
    );
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
                <h2 className="text-xl font-bold mb-4">Logs Users Messages</h2>
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
                  <th className="border border-gray-300 px-4 py-2">Action</th>
                </tr>
            </thead>
            <tbody>
              {displayedData.length>0?
                displayedData.map((msg, index) => (
                <tr key={index} className="hover:bg-gray-100">
                  <td className="border border-gray-300 px-4 py-2 text-center">{(currentPage - 1) * itemsPerPage + index + 1}</td>
                  <td className="border border-gray-300 px-4 py-2 text-center">{msg.user}</td>
                  <td className="border border-gray-300 px-4 py-2 text-center">{msg.status}</td>
                  <td className="border border-gray-300 px-4 py-2 text-center">{msg.timestamp && format(msg.timestamp, "dd/MM/yyyy HH:mm:ss")}</td>
                  
                  
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

export default LUsersChatTable;