import React, { useState, useEffect } from 'react';
import { getDatabase, ref as databaseRef, onValue } from 'firebase/database';

const FilesList = ({isDayMode}) => {
  const [files, setFiles] = useState([]);
  const [filteredFiles, setFilteredFiles] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [yearFilter, setYearFilter] = useState('');
  const [monthFilter, setMonthFilter] = useState('');
  const [dateFilter, setDateFilter] = useState(''); // New date filter
 
  const [itemsPerPage, setItemsPerPage] = useState(30); // State for items per page
  const itemsPerPageOptions = [30, 50, 100];


  // Firebase setup
  useEffect(() => {
    const db = getDatabase();
    const filesRef = databaseRef(db, 'chatFiles');

    onValue(filesRef, (snapshot) => {
      const data = snapshot.val();
      const fileList = [];

      for (let id in data) {
        if (data[id].files && Array.isArray(data[id].files)) {
          data[id].files.forEach(file => {
            fileList.push({
              ...file,
              id,
            });
          });
        }
      }
      setFiles(fileList);
      setFilteredFiles(fileList);
    });
  }, []);

  // Filter and search logic
  useEffect(() => {
    let filtered = files;

    // Filter by year and month
    if (yearFilter) {
      filtered = filtered.filter(file => new Date(file.createdTime).getFullYear().toString() === yearFilter);
    }
    if (monthFilter) {
      filtered = filtered.filter(file => new Date(file.createdTime).getMonth().toString() === monthFilter);
    }

    // Filter by specific date
    if (dateFilter) {
      filtered = filtered.filter(file => new Date(file.createdTime).toDateString() === new Date(dateFilter).toDateString());
    }

    // Search filter (case insensitive)
    if (searchQuery) {
      filtered = filtered.filter(file =>
        file.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredFiles(filtered);
    setCurrentPage(1); // Reset to first page on filter change
  }, [files, searchQuery, yearFilter, monthFilter, dateFilter]);

  const handleItemsPerPageChange = (e) => {
    setItemsPerPage(Number(e.target.value));
    setCurrentPage(1); // Reset to first page on items per page change
  };

  // Pagination logic
  const totalPages = Math.ceil(filteredFiles.length / itemsPerPage);
  const currentFiles = filteredFiles.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const getPagination = () => {
    let pages = [];
    if (totalPages <= 5) {
      pages = Array.from({ length: totalPages }, (_, i) => i + 1);
    } else if (currentPage <= 3) {
      pages = [1, 2, 3, 4, 5, '...'];
    } else if (currentPage >= totalPages - 2) {
      pages = [1, '...', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
    } else {
      pages = [1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages];
    }
    return pages;
  };

  return (
    <div className={isDayMode ? 'bg-white text-black' : 'bg-gray-800 text-white'}> {/* Tailwind for day/night mode */}
      {/* Search and Filter Bar */}
      <div className="flex flex-wrap gap-4 mb-4 p-4  text-black">
        <input
          type="text"
          placeholder="Search files..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="p-2 border rounded w-full md:w-auto border-gray-300"
        />
       
        <input
          type="date"
          value={dateFilter}
          onChange={(e) => setDateFilter(e.target.value)}
          className="p-2 border rounded w-full md:w-auto border-gray-300"
        />
       
      </div>

      {/* Total Filtered Files Display */}
      <div className="flex items-center  text-black">
          <select
            id="itemsPerPage"
            value={itemsPerPage}
            onChange={handleItemsPerPageChange}
            className="border rounded px-2 py-1"
          >
            {itemsPerPageOptions.map(option => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
          <div className="mt-4 text-sm text-gray-500">
            Total Files: {filteredFiles.length}
          </div>
        </div>

      {/* File Display */}
     <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-4">
        {currentFiles.map((file, index) => (
          <div 
            key={index} 
            className={`border rounded-lg shadow p-4 text-center ${isDayMode ? 'bg-white' : 'bg-gray-800'} transition-colors duration-300`}
          >
              <a href={file.url} target="_blank" rel="noopener noreferrer">
                {file.type === 'image' ? (
                  <img src={file.url} alt={file.name} className="w-full h-32 object-cover mb-2 rounded" />
                ) : file.type === 'video' ? (
                  <video controls src={file.url} className="w-full h-32 mb-2 rounded" />
                ) : (
                  <div className={`h-32 flex items-center justify-center ${isDayMode ? 'bg-gray-100' : 'bg-gray-700'} rounded`}>
                    📄 {file.name}
                  </div>
                )}
                 </a>
          </div>
        ))}
      </div>


      {/* Pagination */}
      {filteredFiles.length > itemsPerPage && (
        <nav className="flex justify-between items-center mt-4" aria-label="Table navigation">
          <span className="text-sm text-gray-500">Page {currentPage} of {totalPages}</span>
          <ul className="inline-flex  text-black items-center space-x-1">
            <li>
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                className="px-4 py-2 border rounded-l-lg border-gray-300"
                disabled={currentPage === 1}
              >
                Previous
              </button>
            </li>
            {getPagination().map((page, idx) => (
              <li key={idx}>
                {page === '...' ? (
                  <span className="px-4 py-2">...</span>
                ) : (
                  <button
                    onClick={() => setCurrentPage(page)}
                    className={`px-4 py-2 border ${currentPage === page ? 'bg-gray-200' : 'border-gray-300'}`}
                  >
                    {page}
                  </button>
                )}
              </li>
            ))}
            <li>
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                className="px-4 py-2 border rounded-r-lg border-gray-300"
                disabled={currentPage === totalPages}
              >
                Next
              </button>
            </li>
          </ul>
        </nav>
      )}
    </div>
  );
};

export default FilesList;// import React, { useState, useEffect } from 'react';
// import { getDatabase, ref as databaseRef, onValue } from 'firebase/database';
// import { database, storage } from '../config/firebase';
// import { getDownloadURL, ref as storageRef, uploadBytes } from 'firebase/storage';

// const FilesList = ({isDayMode}) => {
//   const [files, setFiles] = useState([]);
//   const [filteredFiles, setFilteredFiles] = useState([]);
//   const [currentPage, setCurrentPage] = useState(1);
//   const [searchQuery, setSearchQuery] = useState('');
//   const [yearFilter, setYearFilter] = useState('');
//   const [monthFilter, setMonthFilter] = useState('');
//   const [dateFilter, setDateFilter] = useState(''); // New date filter
 
//   const [itemsPerPage, setItemsPerPage] = useState(30); // State for items per page
//   const itemsPerPageOptions = [30, 50, 100];


//   // Firebase setup
//   useEffect(() => {
//     const db = getDatabase();
//     const filesRef = databaseRef(db, 'chatFiles');

//     onValue(filesRef, (snapshot) => {
//       const data = snapshot.val();
//       const fileList = [];

//       for (let id in data) {
//         if (data[id].files && Array.isArray(data[id].files)) {
//           data[id].files.forEach(file => {
//             fileList.push({
//               ...file,
//               id,
//             });
//           });
//         }
//       }
//       setFiles(fileList);
//       setFilteredFiles(fileList);
//     });
//   }, []);

//   // Filter and search logic
//   useEffect(() => {
//     let filtered = files;

//     // Filter by year and month
//     if (yearFilter) {
//       filtered = filtered.filter(file => new Date(file.createdTime).getFullYear().toString() === yearFilter);
//     }
//     if (monthFilter) {
//       filtered = filtered.filter(file => new Date(file.createdTime).getMonth().toString() === monthFilter);
//     }

//     // Filter by specific date
//     if (dateFilter) {
//       filtered = filtered.filter(file => new Date(file.createdTime).toDateString() === new Date(dateFilter).toDateString());
//     }

//     // Search filter (case insensitive)
//     if (searchQuery) {
//       filtered = filtered.filter(file =>
//         file.name.toLowerCase().includes(searchQuery.toLowerCase())
//       );
//     }

//     setFilteredFiles(filtered);
//     setCurrentPage(1); // Reset to first page on filter change
//   }, [files, searchQuery, yearFilter, monthFilter, dateFilter]);

//   const handleItemsPerPageChange = (e) => {
//     setItemsPerPage(Number(e.target.value));
//     setCurrentPage(1); // Reset to first page on items per page change
//   };

//   // Pagination logic
//   const totalPages = Math.ceil(filteredFiles.length / itemsPerPage);
//   const currentFiles = filteredFiles.slice(
//     (currentPage - 1) * itemsPerPage,
//     currentPage * itemsPerPage
//   );

//   const getPagination = () => {
//     let pages = [];
//     if (totalPages <= 5) {
//       pages = Array.from({ length: totalPages }, (_, i) => i + 1);
//     } else if (currentPage <= 3) {
//       pages = [1, 2, 3, 4, 5, '...'];
//     } else if (currentPage >= totalPages - 2) {
//       pages = [1, '...', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
//     } else {
//       pages = [1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages];
//     }
//     return pages;
//   };

//   return (
//     <div className={isDayMode ? 'bg-white text-black' : 'bg-gray-800 text-white'}> {/* Tailwind for day/night mode */}
//       {/* Search and Filter Bar */}
//       <div className="flex flex-wrap gap-4 mb-4 p-4  text-black">
//         <input
//           type="text"
//           placeholder="Search files..."
//           value={searchQuery}
//           onChange={(e) => setSearchQuery(e.target.value)}
//           className="p-2 border rounded w-full md:w-auto border-gray-300"
//         />
       
//         <input
//           type="date"
//           value={dateFilter}
//           onChange={(e) => setDateFilter(e.target.value)}
//           className="p-2 border rounded w-full md:w-auto border-gray-300"
//         />
       
//       </div>

//       {/* Total Filtered Files Display */}
//       <div className="flex items-center  text-black">
//           <select
//             id="itemsPerPage"
//             value={itemsPerPage}
//             onChange={handleItemsPerPageChange}
//             className="border rounded px-2 py-1"
//           >
//             {itemsPerPageOptions.map(option => (
//               <option key={option} value={option}>{option}</option>
//             ))}
//           </select>
//           <div className="mt-4 text-sm text-gray-500">
//             Total Files: {filteredFiles.length}
//           </div>
//         </div>

//       {/* File Display */}
//      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-4">
//         {currentFiles.map((file, index) => (
//           <div 
//             key={index} 
//             className={`border rounded-lg shadow p-4 text-center ${isDayMode ? 'bg-white' : 'bg-gray-800'} transition-colors duration-300`}
//           >
//               <a href={file.url} target="_blank" rel="noopener noreferrer">
//                 {file.type === 'image' ? (
//                   <img src={file.url} alt={file.name} className="w-full h-32 object-cover mb-2 rounded" />
//                 ) : file.type === 'video' ? (
//                   <video controls src={file.url} className="w-full h-32 mb-2 rounded" />
//                 ) : (
//                   <div className={`h-32 flex items-center justify-center ${isDayMode ? 'bg-gray-100' : 'bg-gray-700'} rounded`}>
//                     📄 {file.name}
//                   </div>
//                 )}
//                  </a>
//           </div>
//         ))}
//       </div>


//       {/* Pagination */}
//       {filteredFiles.length > itemsPerPage && (
//         <nav className="flex justify-between items-center mt-4" aria-label="Table navigation">
//           <span className="text-sm text-gray-500">Page {currentPage} of {totalPages}</span>
//           <ul className="inline-flex  text-black items-center space-x-1">
//             <li>
//               <button
//                 onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
//                 className="px-4 py-2 border rounded-l-lg border-gray-300"
//                 disabled={currentPage === 1}
//               >
//                 Previous
//               </button>
//             </li>
//             {getPagination().map((page, idx) => (
//               <li key={idx}>
//                 {page === '...' ? (
//                   <span className="px-4 py-2">...</span>
//                 ) : (
//                   <button
//                     onClick={() => setCurrentPage(page)}
//                     className={`px-4 py-2 border ${currentPage === page ? 'bg-gray-200' : 'border-gray-300'}`}
//                   >
//                     {page}
//                   </button>
//                 )}
//               </li>
//             ))}
//             <li>
//               <button
//                 onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
//                 className="px-4 py-2 border rounded-r-lg border-gray-300"
//                 disabled={currentPage === totalPages}
//               >
//                 Next
//               </button>
//             </li>
//           </ul>
//         </nav>
//       )}
//     </div>
//   );
// };

// export default FilesList;

//  // <p className={`text-sm mt-2 ${isDayMode ? 'text-black' : 'text-white'}`}>{file.name}</p>
         
//         //        <select
//         //   value={yearFilter}
//         //   onChange={(e) => setYearFilter(e.target.value)}
//         //   className="p-2 border rounded w-full md:w-auto border-gray-300"
//         // >
//         //   <option value="">Filter by Year</option>
//         //   {[2023, 2024].map(year => (
//         //     <option key={year} value={year}>{year}</option>
//         //   ))}
//         // </select>
//         // <select
//         //   value={monthFilter}
//         //   onChange={(e) => setMonthFilter(e.target.value)}
//         //   className="p-2 border rounded w-full md:w-auto border-gray-300"
//         // >
//         //   <option value="">Filter by Month</option>
//         //   {Array.from({ length: 12 }, (_, i) => (
//         //     <option key={i} value={i}>{new Date(0, i).toLocaleString('default', { month: 'long' })}</option>
//         //   ))}
//         // </select>
// // import React, { useState, useEffect } from 'react';
// // import { getDatabase, ref as databaseRef, onValue } from 'firebase/database';
// // import { rtdb, storage } from '../config/firebase';
// // import { getDownloadURL, ref as storageRef, uploadBytes } from 'firebase/storage';

// // const FilesList = () => {
// //   const [files, setFiles] = useState([]);
// //   const [filteredFiles, setFilteredFiles] = useState([]);
// //   const [currentPage, setCurrentPage] = useState(1);
// //   const [searchQuery, setSearchQuery] = useState('');
// //   const [yearFilter, setYearFilter] = useState('');
// //   const [monthFilter, setMonthFilter] = useState('');
// //   const itemsPerPage = 30;

// //   // Firebase setup
// //   useEffect(() => {
// //     const db = getDatabase();
// //     const filesRef = databaseRef(db, 'product_L');

// //     onValue(filesRef, (snapshot) => {
// //       const data = snapshot.val();
// //       const fileList = [];

// //       // Extract files from each product entry, handling multiple files per ID
// //       for (let id in data) {
// //         if (data[id].files && Array.isArray(data[id].files)) {
// //           data[id].files.forEach(file => {
// //             fileList.push({
// //               ...file,
// //               id, // Add product ID for each file
// //             });
// //           });
// //         }
// //       }
// //       setFiles(fileList);
// //       setFilteredFiles(fileList);
// //     });
// //   }, []);

// //   // Filter and search logic
// //   useEffect(() => {
// //     let filtered = files;

// //     // Filter by year and month
// //     if (yearFilter) {
// //       filtered = filtered.filter(file => new Date(file.createdTime).getFullYear().toString() === yearFilter);
// //     }
// //     if (monthFilter) {
// //       filtered = filtered.filter(file => new Date(file.createdTime).getMonth().toString() === monthFilter);
// //     }

// //     // Search filter (case insensitive)
// //     if (searchQuery) {
// //       filtered = filtered.filter(file =>
// //         file.name.toLowerCase().includes(searchQuery.toLowerCase())
// //       );
// //     }

// //     setFilteredFiles(filtered);
// //     setCurrentPage(1); // Reset to first page on filter change
// //   }, [files, searchQuery, yearFilter, monthFilter]);

// //   // Pagination logic
// //   const totalPages = Math.ceil(filteredFiles.length / itemsPerPage);
// //   const currentFiles = filteredFiles.slice(
// //     (currentPage - 1) * itemsPerPage,
// //     currentPage * itemsPerPage
// //   );

// //   const getPagination = () => {
// //     let pages = [];
// //     if (totalPages <= 5) {
// //       pages = Array.from({ length: totalPages }, (_, i) => i + 1);
// //     } else if (currentPage <= 3) {
// //       pages = [1, 2, 3, 4, 5, '...'];
// //     } else if (currentPage >= totalPages - 2) {
// //       pages = [1, '...', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
// //     } else {
// //       pages = [1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages];
// //     }
// //     return pages;
// //   };

// //   return (
// //     <div>
// //       {/* Search and Filter Bar */}
// //       <div className="flex flex-wrap gap-4 mb-4">
// //         <input
// //           type="text"
// //           placeholder="Search files..."
// //           value={searchQuery}
// //           onChange={(e) => setSearchQuery(e.target.value)}
// //           className="p-2 border rounded w-full md:w-auto"
// //         />
// //         <select
// //           value={yearFilter}
// //           onChange={(e) => setYearFilter(e.target.value)}
// //           className="p-2 border rounded w-full md:w-auto"
// //         >
// //           <option value="">Filter by Year</option>
// //           {/* Options for years */}
// //           {[2023, 2024].map(year => (
// //             <option key={year} value={year}>{year}</option>
// //           ))}
// //         </select>
// //       </div>

// //       {/* File Display */}
// //       <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
// //         {currentFiles.map((file, index) => (
// //           <div key={index} className="border rounded-lg shadow p-4 text-center">
// //             <a href={file.url} target="_blank" rel="noopener noreferrer">
// //               {file.type === 'image' ? (
// //                 <img src={file.url} alt={file.name} className="w-full h-32 object-cover mb-2 rounded" />
// //               ) : file.type === 'video' ? (
// //                 <video controls src={file.url} className="w-full h-32 mb-2 rounded" />
// //               ) : (
// //                 <div className="h-32 flex items-center justify-center bg-gray-100 rounded">📄 {file.name}</div>
// //               )}
// //               <p className="text-sm mt-2">{file.name}</p>
// //             </a>
// //           </div>
// //         ))}
// //       </div>

// //       {/* Pagination */}
// //       {filteredFiles.length > itemsPerPage && (
// //         <nav className="flex justify-between items-center mt-4" aria-label="Table navigation">
// //           <span className="text-sm text-gray-500">Page {currentPage} of {totalPages}</span>
// //           <ul className="inline-flex items-center space-x-1">
// //             <li>
// //               <button
// //                 onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
// //                 className="px-4 py-2 border rounded-l-lg"
// //                 disabled={currentPage === 1}
// //               >
// //                 Previous
// //               </button>
// //             </li>
// //             {getPagination().map((page, idx) => (
// //               <li key={idx}>
// //                 {page === '...' ? (
// //                   <span className="px-4 py-2">...</span>
// //                 ) : (
// //                   <button
// //                     onClick={() => setCurrentPage(page)}
// //                     className={`px-4 py-2 border ${currentPage === page ? 'bg-gray-200' : ''}`}
// //                   >
// //                     {page}
// //                   </button>
// //                 )}
// //               </li>
// //             ))}
// //             <li>
// //               <button
// //                 onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
// //                 className="px-4 py-2 border rounded-r-lg"
// //                 disabled={currentPage === totalPages}
// //               >
// //                 Next
// //               </button>
// //             </li>
// //           </ul>
// //         </nav>
// //       )}
// //     </div>
// //   );
// // };

// // export default FilesList;
// // // import React, { useState, useEffect } from 'react';
// // // import { getDatabase, ref as databaseRef, onValue } from 'firebase/database';

// // // // import { ref, onValue, remove, child, getDatabase, update } from 'firebase/database';
// // // import { rtdb, storage } from '../config/firebase';
// // // import { getDownloadURL, ref as storageRef, deleteObject, uploadBytes } from 'firebase/storage';


// // // const FilesList = () => {
// // //   const [files, setFiles] = useState([]);
// // //   const [filteredFiles, setFilteredFiles] = useState([]);
// // //   const [currentPage, setCurrentPage] = useState(1);
// // //   const [searchQuery, setSearchQuery] = useState('');
// // //   const [yearFilter, setYearFilter] = useState('');
// // //   const [monthFilter, setMonthFilter] = useState('');
// // //   const itemsPerPage = 30;
  
// // //   // Firebase setup
// // //   useEffect(() => {
// // //     const db = getDatabase();
// // //     const filesRef = databaseRef(db, 'product_L');
    
// // //     onValue(filesRef, (snapshot) => {
// // //       const data = snapshot.val();
// // //       const fileList = [];

// // //       // Extract files from each product entry, handling multiple files per ID
// // //       for (let id in data) {
// // //         if (data[id].files && Array.isArray(data[id].files)) {
// // //           data[id].files.forEach(file => {
// // //             fileList.push({
// // //               ...file,
// // //               id, // Add product ID for each file
// // //             });
// // //           });
// // //         }
// // //       }
// // //       setFiles(fileList);
// // //       setFilteredFiles(fileList);
// // //     });
// // //   }, []);

// // //   // Filter and search logic
// // //   useEffect(() => {
// // //     let filtered = files;

// // //     // Filter by year and month
// // //     if (yearFilter) {
// // //       filtered = filtered.filter(file => new Date(file.date).getFullYear().toString() === yearFilter);
// // //     }
// // //     if (monthFilter) {
// // //       filtered = filtered.filter(file => new Date(file.date).getMonth().toString() === monthFilter);
// // //     }

// // //     // Search filter (case insensitive)
// // //     if (searchQuery) {
// // //       filtered = filtered.filter(file =>
// // //         file.name.toLowerCase().includes(searchQuery.toLowerCase())
// // //       );
// // //     }

// // //     setFilteredFiles(filtered);
// // //     setCurrentPage(1); // Reset to first page on filter change
// // //   }, [files, searchQuery, yearFilter, monthFilter]);

// // //   // Pagination logic
// // //   const totalPages = Math.ceil(filteredFiles.length / itemsPerPage);
// // //   const currentFiles = filteredFiles.slice(
// // //     (currentPage - 1) * itemsPerPage,
// // //     currentPage * itemsPerPage
// // //   );

// // //   const getPagination = () => {
// // //     let pages = [];
// // //     if (totalPages <= 5) {
// // //       pages = Array.from({ length: totalPages }, (_, i) => i + 1);
// // //     } else if (currentPage <= 3) {
// // //       pages = [1, 2, 3, 4, 5, '...'];
// // //     } else if (currentPage >= totalPages - 2) {
// // //       pages = [1, '...', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
// // //     } else {
// // //       pages = [1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages];
// // //     }
// // //     return pages;
// // //   };

// // //   return (
// // //     <div>
// // //       {/* Search and Filter Bar */}
// // //       <div className="flex flex-wrap gap-4 mb-4">
// // //         <input
// // //           type="text"
// // //           placeholder="Search files..."
// // //           value={searchQuery}
// // //           onChange={(e) => setSearchQuery(e.target.value)}
// // //           className="p-2 border rounded w-full md:w-auto"
// // //         />
// // //         <select
// // //           value={yearFilter}
// // //           onChange={(e) => setYearFilter(e.target.value)}
// // //           className="p-2 border rounded w-full md:w-auto"
// // //         >
// // //           <option value="">Filter by Year</option>
// // //           {/* Options for years */}
// // //           {[2023, 2024].map(year => (
// // //             <option key={year} value={year}>{year}</option>
// // //           ))}
// // //         </select>
       
// // //       </div>

// // //       {/* File Display */}
// // //       <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
// // //         {currentFiles.map((file, index) => (
// // //           <div key={index} className="border rounded-lg shadow p-4 text-center">
// // //             {file.type === 'image' ? (
// // //               <img src={file.url} alt={file.name} className="w-full h-32 object-cover mb-2 rounded" />
// // //             ) : file.type === 'video' ? (
// // //               <video controls src={file.url} className="w-full h-32 mb-2 rounded" />
// // //             ) : (
// // //               <div className="h-32 flex items-center justify-center bg-gray-100 rounded">📄 {file.name}</div>
// // //             )}
// // //             <p className="text-sm mt-2">{file.name}</p>
// // //           </div>
// // //         ))}
// // //       </div>

// // //       {/* Pagination */}
// // //       {filteredFiles.length > itemsPerPage && (
// // //         <nav className="flex justify-between items-center mt-4" aria-label="Table navigation">
// // //           <span className="text-sm text-gray-500">Page {currentPage} of {totalPages}</span>
// // //           <ul className="inline-flex items-center space-x-1">
// // //             <li>
// // //               <button
// // //                 onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
// // //                 className="px-4 py-2 border rounded-l-lg"
// // //                 disabled={currentPage === 1}
// // //               >
// // //                 Previous
// // //               </button>
// // //             </li>
// // //             {getPagination().map((page, idx) => (
// // //               <li key={idx}>
// // //                 {page === '...' ? (
// // //                   <span className="px-4 py-2">...</span>
// // //                 ) : (
// // //                   <button
// // //                     onClick={() => setCurrentPage(page)}
// // //                     className={`px-4 py-2 border ${currentPage === page ? 'bg-gray-200' : ''}`}
// // //                   >
// // //                     {page}
// // //                   </button>
// // //                 )}
// // //               </li>
// // //             ))}
// // //             <li>
// // //               <button
// // //                 onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
// // //                 className="px-4 py-2 border rounded-r-lg"
// // //                 disabled={currentPage === totalPages}
// // //               >
// // //                 Next
// // //               </button>
// // //             </li>
// // //           </ul>
// // //         </nav>
// // //       )}
// // //     </div>
// // //   );
// // // };

// // // export default FilesList;

// // //  // <select
// // //         //   value={monthFilter}
// // //         //   onChange={(e) => setMonthFilter(e.target.value)}
// // //         //   className="p-2 border rounded w-full md:w-auto"
// // //         // >
// // //         //   <option value="">Filter by Month</option>
// // //         //   {/* Options for months */}
// // //         //   {Array.from({ length: 12 }, (_, i) => i).map(month => (
// // //         //     <option key={month} value={month}>{new Date(0, month).toLocaleString('en', { month: 'long' })}</option>
// // //         //   ))}
// // //         // </select>
// // // // import React, { useState, useEffect } from 'react';
// // // // import { ref, onValue, remove, child, getDatabase, update } from 'firebase/database';
// // // // import { rtdb, storage } from '../config/firebase';
// // // // import { getDownloadURL, ref as storageRef, deleteObject, uploadBytes } from 'firebase/storage';
// // // // import { Carousel } from 'react-responsive-carousel';
// // // // import 'react-responsive-carousel/lib/styles/carousel.min.css';

// // // // import { useHistory } from'react-router-dom';

// // // // const ProductList = ({ navigateToReviewPage}) => {
// // // //   const [places, setPlaces] = useState([]);
// // // //   const [editModalOpen, setEditModalOpen] = useState(false);
// // // //   const [newData, setNewData] = useState({});
// // // //   const [selectedPlaceId, setSelectedPlaceId] = useState(null);
// // // //   const [imageUrls, setImageUrls] = useState([]);
 
 
// // // //   useEffect(() => {
// // // //     const placesRef = ref(rtdb, 'product_L');
// // // //     onValue(placesRef, (snapshot) => {
// // // //       const data = snapshot.val();
// // // //       const placesArray = data ? Object.keys(data).map(key => ({ id: key, ...data[key] })) : [];
// // // //       setPlaces(placesArray);
// // // //     });
// // // //   }, []);

// // // //   useEffect(() => {
// // // //     setImageUrls(newData.imageUrls || []);
// // // //   }, [newData]);

// // // //   const toggleStatus = (id, currentStatus) => {
// // // //     const newStatus = currentStatus === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
// // // //     update(ref(rtdb, `product_B/${id}`), { status: newStatus });
// // // //   };

// // // //   const deletePlace = (id) => {
// // // //     const placeRef = ref(rtdb, `product_L/${id}`);
// // // //     remove(placeRef);
// // // //   };

 

// // // //   const openEditModal = (place) => {
// // // //     setNewData(place);
// // // //     setSelectedPlaceId(place.id);
// // // //     setEditModalOpen(true);
// // // //   };

// // // //   const handleEditChange = (e) => {
// // // //     const { name, value } = e.target;
// // // //     setNewData({ ...newData, [name]: value });
// // // //   };

// // // //   const handleFileChange = (e) => {
// // // //     const { name, files } = e.target;
// // // //     setNewData({ ...newData, [name]: files });
// // // //   };

// // // //   const saveEdit = async () => {
// // // //     const placeRef = ref(rtdb, `product_B/${selectedPlaceId}`);
// // // //     const updates = { ...newData };
// // // //     if (newData.images) {
// // // //       const imageUrls = await Promise.all(
// // // //         Array.from(newData.images).map(async (image) => {
// // // //           const imageRef = storageRef(storage, `product_B/${selectedPlaceId}/${image.name}`);
// // // //           await uploadBytes(imageRef, image);
// // // //           return getDownloadURL(imageRef);
// // // //         })
// // // //       );
// // // //       updates.imageUrls = imageUrls;
// // // //     }

    
// // // //     update(placeRef, updates);
// // // //     setEditModalOpen(false);
// // // //   };

// // // //   return (
// // // //     <div className="overflow-x-auto">
// // // //       <table className="min-w-full bg-white">
// // // //         <thead>
// // // //           <tr>
// // // //            <th className="px-6 py-3 border-b border-gray-200 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Media</th>
// // // //             <th className="px-6 py-3 border-b border-gray-200 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">N Files</th>
// // // //             <th className="px-6 py-3 border-b border-gray-200 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
// // // //           </tr>
// // // //         </thead>
// // // //         <tbody className="bg-white divide-y divide-gray-200">
// // // //           {places.map((place) => (
// // // //             <tr key={place.id}>
              
// // // //               <td className="px-6 py-4 whitespace-nowrap max-w-xs">
// // // //               <div>
// // // //                  {place.fileUrls && place.fileUrls.map((fileUrl, index) => (
// // // //                     <div key={index} className="relative">
// // // //                       <a 
// // // //                         href={fileUrl} 
// // // //                         target="_blank" 
// // // //                         rel="noopener noreferrer" // For security reasons when opening in a new tab
// // // //                         className="text-blue-500 hover:underline" // Styling for the link
// // // //                       >
// // // //                         File {index + 1}
// // // //                       </a>
// // // //                     </div>
// // // //                   ))}

// // // //                 </div>

// // // //               </td>
// // // //               <td className="px-6 py-4 whitespace-normal max-w-xs text-sm font-medium text-gray-900">
// // // //                 <div className="text-sm text-gray-900">{place.name}</div>
// // // //                </td>
            
// // // //               <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
// // // //                  // <button onClick={() => openEditModal(place)} className="text-indigo-600 hover:text-indigo-900 ml-4">Edit</button>
// // // //                 <button onClick={() => deletePlace(place.id)} className="text-red-600 hover:text-red-900 ml-4">Delete</button>
// // // //               </td>
// // // //             </tr>
// // // //           ))}
// // // //         </tbody>
// // // //       </table>

// // // //       {editModalOpen && (
// // // //         <div className="fixed z-10 inset-0 overflow-y-auto">
// // // //           <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
// // // //             <div className="fixed inset-0 transition-opacity" aria-hidden="true">
// // // //               <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
// // // //             </div>
// // // //             <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
// // // //             <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
// // // //               <div>
// // // //                 <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
// // // //                   <h3 className="text-lg leading-6 font-medium text-gray-900">Edit Files</h3>
// // // //                   <div className="mt-2">
// // // //                     <div>
// // // //                       <label htmlFor="name" className="block text-sm font-medium text-gray-700">Name</label>
// // // //                       <input type="text" id="name" name="name" value={newData.name || ''} onChange={handleEditChange} placeholder="Enter place name" className="mb-2 border p-2 rounded w-full" />
// // // //                       <label htmlFor="images" className="block text-sm font-medium text-gray-700">Images</label>
// // // //                       <input type="file" id="images" name="images" onChange={handleFileChange} multiple className="mb-2 border p-2 rounded w-full" />
                      
// // // //                      </div>
// // // //                   </div>
// // // //                 </div>
// // // //               </div>
// // // //               <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
// // // //                 <button onClick={saveEdit} className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 sm:ml-3 sm:w-auto sm:text-sm">Save</button>
// // // //                 <button onClick={() => setEditModalOpen(false)} className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 sm:mt-0 sm:w-auto sm:text-sm">Cancel</button>
// // // //               </div>
// // // //             </div>
// // // //           </div>
// // // //         </div>
// // // //       )}
// // // //     </div>
// // // //   );
// // // // };

// // // // export default ProductList;
