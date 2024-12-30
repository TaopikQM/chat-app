"use client"; // Pastikan ini ada di bagian atas file jika menggunakan Next.js 13+

import { useEffect, useState } from "react";
import { getStorage, ref, listAll, getDownloadURL, getMetadata } from "firebase/storage";
import { storage } from "../config/firebase"; // Pastikan path ini benar

const Gallery = () => {
    const [files, setFiles] = useState([]);
    
    const [activeFilter, setActiveFilter] = useState("all"); // Tracks the active filter


    useEffect(() => {
        const fetchFiles = async () => {
            const listRef = ref(storage, 'chatFiles/'); // Path ke folder chatFiles

            try {
                const res = await listAll(listRef);
                const fileDetails = await Promise.all(
                    res.items.map(async (item) => {
                        const fileUrl = await getDownloadURL(item); // Mendapatkan URL untuk setiap file
                        const metadata = await getMetadata(item); // Mendapatkan metadata file

                        return { url: fileUrl, contentType: metadata.contentType }; // Menyimpan URL dan contentType
                    })
                );
                setFiles(fileDetails); // Menyimpan data URL dan contentType ke state
            } catch (error) {
                console.error("Error fetching files: ", error);
            }
        };

        fetchFiles(); // Memanggil fungsi untuk mengambil file
    }, []);

        const handleFilterChange = (filter) => {
        setActiveFilter(filter);
    };

    // Filter files based on active filter
    const filteredFiles = files.filter((file) => {
        if (activeFilter === "all") return true;
        if (activeFilter === "images" && file.contentType.startsWith('image/')) return true;
        if (activeFilter === "videos" && file.contentType.startsWith('video/')) return true;
        return false;
    });


    return (
        <div>
            <div className="flex items-center justify-center py-4 md:py-8 flex-wrap">
                {/* All Categories Button */}
                <button
                    type="button"
                    onClick={() => handleFilterChange("all")}
                    className={`${
                        activeFilter === "all"
                            ? "text-blue-700 hover:text-white border border-blue-600 bg-white hover:bg-blue-700 focus:ring-4 focus:outline-none focus:ring-blue-300 dark:border-blue-500 dark:text-blue-500 dark:hover:text-white dark:hover:bg-blue-500 dark:bg-gray-900 dark:focus:ring-blue-800"
                            : "text-gray-900 border border-white hover:border-gray-200 dark:border-gray-900 dark:bg-gray-900 dark:hover:border-gray-700 bg-white focus:ring-4 focus:outline-none focus:ring-gray-300 rounded-full text-base font-medium px-5 py-2.5 text-center me-3 mb-3 dark:text-white dark:focus:ring-gray-800"
                    }`}
                >
                    All Categories
                </button>

                {/* Images Button */}
                <button
                    type="button"
                    onClick={() => handleFilterChange("images")}
                    className={`${
                        activeFilter === "images"
                            ? "text-blue-700 hover:text-white border border-blue-600 bg-white hover:bg-blue-700 focus:ring-4 focus:outline-none focus:ring-blue-300 dark:border-blue-500 dark:text-blue-500 dark:hover:text-white dark:hover:bg-blue-500 dark:bg-gray-900 dark:focus:ring-blue-800"
                            : "text-gray-900 border border-white hover:border-gray-200 dark:border-gray-900 dark:bg-gray-900 dark:hover:border-gray-700 bg-white focus:ring-4 focus:outline-none focus:ring-gray-300 rounded-full text-base font-medium px-5 py-2.5 text-center me-3 mb-3 dark:text-white dark:focus:ring-gray-800"
                    }`}
                >
                    Images
                </button>

                {/* Videos Button */}
                <button
                    type="button"
                    onClick={() => handleFilterChange("videos")}
                    className={`${
                        activeFilter === "videos"
                            ? "text-blue-700 hover:text-white border border-blue-600 bg-white hover:bg-blue-700 focus:ring-4 focus:outline-none focus:ring-blue-300 dark:border-blue-500 dark:text-blue-500 dark:hover:text-white dark:hover:bg-blue-500 dark:bg-gray-900 dark:focus:ring-blue-800"
                            : "text-gray-900 border border-white hover:border-gray-200 dark:border-gray-900 dark:bg-gray-900 dark:hover:border-gray-700 bg-white focus:ring-4 focus:outline-none focus:ring-gray-300 rounded-full text-base font-medium px-5 py-2.5 text-center me-3 mb-3 dark:text-white dark:focus:ring-gray-800"
                    }`}
                >
                    Videos
                </button>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            
                {filteredFiles.length === 0 ? (
                        <p>Tidak ada file untuk ditampilkan.</p>
                    ) : (
                        filteredFiles.map((file, index) => (
                            <div key={index} className="file-preview">
                                {/* Check contentType and render accordingly */}
                                {file.contentType.startsWith('video/') ? (
                                    <video className="h-auto max-w-full rounded-lg" width="100%" controls>
                                        <source src={file.url} type={file.contentType} />
                                        Your browser does not support the video tag.
                                    </video>
                                ) : file.contentType.startsWith('image/') ? (
                                    <img
                                        className="h-auto max-w-full rounded-lg"
                                        src={file.url}
                                        alt={`File ${index}`}
                                        style={{ width: '100%', height: 'auto' }}
                                    />
                                ) : (
                                    <p className="text-red-500">Unsupported format</p>
                                )}
                            </div>
                        ))
                    )}
                </div>
             </div>
    );
};

export default Gallery;

// {files.length === 0 ? (
//                 <p>Tidak ada file untuk ditampilkan.</p>
//             ) : (
//                 files.map((file, index) => (
//                     <div key={index} className="file-preview">
//                         {/* Check contentType and render accordingly */}
//                         {file.contentType.startsWith('video/') ? (
//                             <video className="h-auto max-w-full rounded-lg" width="300" controls>
//                                 <source src={file.url} type={file.contentType} />
//                                 Your browser does not support the video tag.
//                             </video>
//                         ) : file.contentType.startsWith('image/') ? (
//                             <img
//                                 className="h-auto max-w-full rounded-lg"
//                                 src={file.url}
//                                 alt={`File ${index}`}
//                                 style={{ width: '300px', height: 'auto' }}
//                             />
//                         ) : (
//                             <p className="text-red-500">Unsupported format</p>
//                         )}
//                     </div>
//                 ))
//             )}
// "use client"; // Pastikan ini ada di bagian atas file jika menggunakan Next.js 13+

// import { useEffect, useState } from "react";
// import { getStorage, ref, listAll, getDownloadURL } from "firebase/storage";
// import { storage } from "../config/firebase"; // Pastikan path ini benar

// const Gallery = () => {
//     const [files, setFiles] = useState([]);

//     useEffect(() => {
//         const fetchFiles = async () => {
//             const listRef = ref(storage, 'chatFiles/'); // Path ke folder chatFiles

//             try {
//                 const res = await listAll(listRef);
//                 const fileUrls = await Promise.all(
//                     res.items.map(async (item) => {
//                         return await getDownloadURL(item); // Mendapatkan URL untuk setiap file
//                     })
//                 );
//                 setFiles(fileUrls); // Menyimpan URL ke state
//             } catch (error) {
//                 console.error("Error fetching files: ", error);
//             }
//         };

//         fetchFiles(); // Memanggil fungsi untuk mengambil file
//     }, []);

//     return (
//         <div className="grid grid-cols-3 md:grid-cols-4 gap-2">
//             {files.length === 0 ? (
//                 <p>Tidak ada file untuk ditampilkan.</p>
//             ) : (
//                 files.map((url, index) => (
//                     <div key={index} className="file-preview">
//                         {url.endsWith('.mp4') ? (
//                             <video class="h-auto max-w-full rounded-lg" width="300" controls>
//                                 <source src={url} type="video/mp4" />
//                                 Your browser does not support the video tag.
//                             </video>
//                         ) : (
//                             <img class="h-auto max-w-full rounded-lg" src={url} alt={`File ${index}`} style={{ width: '300px', height: 'auto' }} />
//                         )}
//                     </div>
//                 ))
//             )}
//         </div>
//     );
// };

// export default Gallery;
// // // // "use client";
// // // // import { useEffect, useState } from "react";
// // // // import { getStorage, ref, listAll, getDownloadURL } from "firebase/storage";
// // // // import { storage } from "../config/firebase"; // Pastikan path ini benar

// // // // const Gallery = () => {
// // // //     const [files, setFiles] = useState([]);

// // // //     useEffect(() => {
// // // //         const fetchFiles = async () => {
// // // //             const listRef = ref(storage, 'chatFiles/'); // Path ke folder chatFiles

// // // //             try {
// // // //                 const res = await listAll(listRef);
// // // //                 const fileUrls = await Promise.all(
// // // //                     res.items.map(async (item) => {
// // // //                         return await getDownloadURL(item);
// // // //                     })
// // // //                 );
// // // //                 setFiles(fileUrls); // Menyimpan URL ke state
// // // //             } catch (error) {
// // // //                 console.error("Error fetching files: ", error);
// // // //             }
// // // //         };

// // // //         fetchFiles(); // Memanggil fungsi untuk mengambil file
// // // //     }, []);

// // // //     return (
// // // //          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
       
// // // //                 {files.length === 0 ? (
// // // //                     <p>Tidak ada file untuk ditampilkan.</p>
// // // //                 ) : (
// // // //                     files.map((url, index) => (
// // // //                         <div key={index} className="file-preview">
// // // //                             {url.endsWith('.mp4') ? (
// // // //                                 <video width="300" controls>
// // // //                                     <source src={url} type="video/mp4" />
// // // //                                     Your browser does not support the video tag.
// // // //                                 </video>
// // // //                             ) : (
// // // //                                 <img src={url} alt={`File ${index}`} style={{ width: '300px', height: 'auto' }} />
// // // //                             )}
// // // //                         </div>
// // // //                     ))
// // // //                 )}
// // // //         </div>
// // // //     );
// // // // };

// // // // export default Gallery;



// // // // // "use client";

// // // // // import { useEffect, useState } from "react";
// // // // // import { ref as storageRef, listAll, getDownloadURL } from "firebase/storage";
// // // // // import { storage } from "../config/firebase"; // Impor konfigurasi Firebase

// // // // // const Gallery = () => {
// // // // //     const [mediaFiles, setMediaFiles] = useState([]);

// // // // //     useEffect(() => {
// // // // //         const fetchMediaFiles = async () => {
// // // // //             try {
// // // // //                 // Referensi ke folder utama "chatFiles"
// // // // //                 const folderRef = storageRef(storage, "chatFiles/");

// // // // //                 // Mendapatkan semua file dalam folder
// // // // //                 const fileList = await listAll(folderRef);

// // // // //                 // Ambil URL untuk semua file
// // // // //                 const urls = await Promise.all(
// // // // //                     fileList.items.map((item) =>
// // // // //                         getDownloadURL(item).catch((error) => {
// // // // //                             console.error("Error fetching URL:", error);
// // // // //                             return null; // Lewati file yang gagal diakses
// // // // //                         })
// // // // //                     )
// // // // //                 );

// // // // //                 // Hanya tambahkan URL yang valid
// // // // //                 setMediaFiles(urls.filter((url) => url !== null));
// // // // //             } catch (error) {
// // // // //                 console.error("Error fetching media files:", error);
// // // // //                 setMediaFiles([]); // Default jika terjadi error
// // // // //             }
// // // // //         };

// // // // //         fetchMediaFiles();
// // // // //     }, []);

// // // // //     return (
// // // // //         <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
// // // // //             {mediaFiles.map((fileUrl, index) => {
// // // // //                  const isImage = /\.(jpg|jpeg|png|gif|bmp|svg|webp)$/i.test(fileUrl);
// // // // //                 const isVideo = /\.(mp4|webm|ogg|mkv)$/i.test(fileUrl);

// // // // //                 return (
// // // // //                     <div key={index} className="relative">
// // // // //                         {isImage ? (
// // // // //                             <img
// // // // //                                 src={fileUrl}
// // // // //                                 alt={`Media ${index}`}
// // // // //                                 className="h-auto max-w-full rounded-lg"
// // // // //                             />
// // // // //                         ) : isVideo ? (
// // // // //                             <video controls className="h-auto max-w-full rounded-lg">
// // // // //                                 <source src={fileUrl} type="video/mp4" />
// // // // //                                 Your browser does not support the video tag.
// // // // //                             </video>
// // // // //                         ) : (
// // // // //                             <p className="text-red-500">Unsupported format</p>
// // // // //                         )}
// // // // //                     </div>
// // // // //                 );
// // // // //             })}
// // // // //         </div>
// // // // //     );
// // // // // };

// // // // // export default Gallery;

// // // // // // "use client";

// // // // // // import { useEffect, useState } from "react";
// // // // // // import { ref as storageRef, listAll, getDownloadURL } from "firebase/storage";
// // // // // // import { storage } from "../config/firebase";

// // // // // // const Gallery = () => {
// // // // // //     const [mediaFiles, setMediaFiles] = useState([]);

// // // // // //     useEffect(() => {
// // // // // //         const fetchMediaFiles = async () => {
// // // // // //             try {
// // // // // //                 // Referensi ke folder utama "chatFiles"
// // // // // //                 const folderRef = storageRef(storage, "chatFiles/");
// // // // // //                 const fileList = await listAll(folderRef);

// // // // // //                 // Ambil URL untuk semua file
// // // // // //                 const urls = await Promise.all(
// // // // // //                     fileList.items.map((item) =>
// // // // // //                         getDownloadURL(item).catch((error) => {
// // // // // //                             console.error("Error fetching URL:", error);
// // // // // //                             return null; // Lewati file yang gagal diakses
// // // // // //                         })
// // // // // //                     )
// // // // // //                 );

// // // // // //                 // Hanya tambahkan URL yang valid
// // // // // //                 setMediaFiles(urls.filter((url) => url !== null));
// // // // // //             } catch (error) {
// // // // // //                 console.error("Error fetching media files:", error);
// // // // // //                 setMediaFiles([]); // Default jika terjadi error
// // // // // //             }
// // // // // //         };

// // // // // //         fetchMediaFiles();
// // // // // //     }, []);

// // // // // //     return (
// // // // // //         <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
// // // // // //             {mediaFiles.map((fileUrl, index) => {
// // // // // //                 const isImage = fileUrl.match(/\.(jpg|jpeg|png|gif|bmp|svg|webp)$/i);
// // // // // //                 const isVideo = fileUrl.match(/\.(mp4|webm|ogg|mkv)$/i);
// // // // // //                 const isPdf = fileUrl.match(/\.pdf$/i);
// // // // // //                 const isAudio = fileUrl.match(/\.(mp3|wav|ogg)$/i);

// // // // // //                 return (
// // // // // //                     <div key={index} className="relative">
// // // // // //                         {isImage ? (
// // // // // //                             <img
// // // // // //                                 src={fileUrl}
// // // // // //                                 alt={`Media ${index}`}
// // // // // //                                 className="h-auto max-w-full rounded-lg"
// // // // // //                             />
// // // // // //                         ) : isVideo ? (
// // // // // //                             <video controls className="h-auto max-w-full rounded-lg">
// // // // // //                                 <source src={fileUrl} type="video/mp4" />
// // // // // //                                 Your browser does not support the video tag.
// // // // // //                             </video>
// // // // // //                         ) : isPdf ? (
// // // // // //                             <a
// // // // // //                                 href={fileUrl}
// // // // // //                                 target="_blank"
// // // // // //                                 rel="noopener noreferrer"
// // // // // //                                 className="text-blue-500 underline"
// // // // // //                             >
// // // // // //                                 View PDF
// // // // // //                             </a>
// // // // // //                         ) : isAudio ? (
// // // // // //                             <audio controls className="h-auto max-w-full rounded-lg">
// // // // // //                                 <source src={fileUrl} type="audio/mpeg" />
// // // // // //                                 Your browser does not support the audio element.
// // // // // //                             </audio>
// // // // // //                         ) : (
// // // // // //                             <p className="text-red-500">Unsupported format</p>
// // // // // //                         )}
// // // // // //                     </div>
// // // // // //                 );
// // // // // //             })}
// // // // // //         </div>
// // // // // //     );
// // // // // // };

// // // // // // export default Gallery;
// // // // // // // "use client";

// // // // // // // import { useEffect, useState } from "react";
// // // // // // // import { ref as storageRef, listAll, getDownloadURL } from "firebase/storage";
// // // // // // // import { storage } from "../config/firebase";

// // // // // // // const Gallery = () => {
// // // // // // //     const [mediaFiles, setMediaFiles] = useState([]);

// // // // // // //     useEffect(() => {
// // // // // // //         const fetchMediaFiles = async () => {
// // // // // // //             try {
// // // // // // //                 // Referensi ke folder utama "chatFiles"
// // // // // // //                 const folderRef = storageRef(storage, "chatFiles/");
// // // // // // //                 const fileList = await listAll(folderRef);

// // // // // // //                 // Ambil URL untuk semua file
// // // // // // //                 const urls = await Promise.all(
// // // // // // //                     fileList.items.map((item) =>
// // // // // // //                         getDownloadURL(item).catch((error) => {
// // // // // // //                             console.error("Error fetching URL:", error);
// // // // // // //                             return null; // Lewati file yang gagal diakses
// // // // // // //                         })
// // // // // // //                     )
// // // // // // //                 );

// // // // // // //                 // Hanya tambahkan URL yang valid
// // // // // // //                 setMediaFiles(urls.filter((url) => url !== null));
// // // // // // //             } catch (error) {
// // // // // // //                 console.error("Error fetching media files:", error);
// // // // // // //                 setMediaFiles([]); // Default jika terjadi error
// // // // // // //             }
// // // // // // //         };

// // // // // // //         fetchMediaFiles();
// // // // // // //     }, []);

// // // // // // //     return (
// // // // // // //         <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
// // // // // // //             {mediaFiles.map((fileUrl, index) => {
// // // // // // //                 const isImage = fileUrl.match(/\.(jpg|jpeg|png|gif|bmp|svg|webp)$/i);
// // // // // // //                 const isVideo = fileUrl.match(/\.(mp4|webm|ogg|mkv)$/i);

// // // // // // //                 return (
// // // // // // //                     <div key={index} className="relative">
// // // // // // //                         {isImage ? (
// // // // // // //                             <img
// // // // // // //                                 src={fileUrl}
// // // // // // //                                 alt={`Media ${index}`}
// // // // // // //                                 className="h-auto max-w-full rounded-lg"
// // // // // // //                             />
// // // // // // //                         ) : isVideo ? (
// // // // // // //                             <video controls className="h-auto max-w-full rounded-lg">
// // // // // // //                                 <source src={fileUrl} type="video/mp4" />
// // // // // // //                                 Your browser does not support the video tag.
// // // // // // //                             </video>
// // // // // // //                         ) : (
// // // // // // //                             <p className="text-red-500">Unsupported format</p>
// // // // // // //                         )}
// // // // // // //                     </div>
// // // // // // //                 );
// // // // // // //             })}
// // // // // // //         </div>
// // // // // // //     );
// // // // // // // };

// // // // // // // export default Gallery;
// // // // // // // // "use client";

// // // // // // // // import { useEffect, useState } from "react";
// // // // // // // // import { ref as storageRef, listAll, getDownloadURL } from "firebase/storage";
// // // // // // // // import { storage } from "../config/firebase";

// // // // // // // // const Gallery = () => {
// // // // // // // //     const [mediaFiles, setMediaFiles] = useState([]);

// // // // // // // //     useEffect(() => {
// // // // // // // //         const fetchMediaFiles = async () => {
// // // // // // // //             try {
// // // // // // // //                 const folderRef = storageRef(storage, "chatFiles/");
// // // // // // // //                 const fileList = await listAll(folderRef);

// // // // // // // //                 const urls = await Promise.all(
// // // // // // // //                     fileList.items.map((item) => getDownloadURL(item))
// // // // // // // //                 );

// // // // // // // //                 setMediaFiles(urls);
// // // // // // // //             } catch (error) {
// // // // // // // //                 console.error("Error fetching media files:", error);
// // // // // // // //                 setMediaFiles([]); // Default jika error
// // // // // // // //             }
// // // // // // // //         };

// // // // // // // //         fetchMediaFiles();
// // // // // // // //     }, []);

// // // // // // // //     return (
// // // // // // // //         <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
// // // // // // // //             {mediaFiles.map((fileUrl, index) => {
// // // // // // // //                 // Cek format file
// // // // // // // //                 const isImage = fileUrl.match(/\.(jpg|jpeg|png|gif|bmp|svg|webp)$/i);
// // // // // // // //                 const isVideo = fileUrl.match(/\.(mp4|webm|ogg|mkv)$/i);

// // // // // // // //                 return (
// // // // // // // //                     <div key={index} className="relative">
// // // // // // // //                         {isImage ? (
// // // // // // // //                             <img
// // // // // // // //                                 src={fileUrl}
// // // // // // // //                                 alt={`Media ${index}`}
// // // // // // // //                                 className="h-auto max-w-full rounded-lg"
// // // // // // // //                             />
// // // // // // // //                         ) : isVideo ? (
// // // // // // // //                             <video controls className="h-auto max-w-full rounded-lg">
// // // // // // // //                                 <source src={fileUrl} type="video/mp4" />
// // // // // // // //                                 Your browser does not support the video tag.
// // // // // // // //                             </video>
// // // // // // // //                         ) : (
// // // // // // // //                             <p className="text-red-500">Unsupported format</p>
// // // // // // // //                         )}
// // // // // // // //                     </div>
// // // // // // // //                 );
// // // // // // // //             })}
// // // // // // // //         </div>
// // // // // // // //     );
// // // // // // // // };

// // // // // // // // export default Gallery;
// // // // // // // // // "use client";
// // // // // // // // // import { useEffect, useState } from 'react';
// // // // // // // // // import { ref as storageRef, listAll, getDownloadURL } from 'firebase/storage';
// // // // // // // // // import { storage } from '../config/firebase'; // Pastikan ini adalah konfigurasi Firebase Anda

// // // // // // // // // const Gallery = () => {
// // // // // // // // //     const [mediaFiles, setMediaFiles] = useState([]);

// // // // // // // // //     useEffect(() => {
// // // // // // // // //         const fetchMediaFiles = async () => {
// // // // // // // // //             try {
// // // // // // // // //                 const folderRef = storageRef(storage, 'chatFiles/');
// // // // // // // // //                 const fileList = await listAll(folderRef);

// // // // // // // // //                 const urls = await Promise.all(
// // // // // // // // //                     fileList.items.map((item) => getDownloadURL(item))
// // // // // // // // //                 );

// // // // // // // // //                 setMediaFiles(urls);
// // // // // // // // //             } catch (error) {
// // // // // // // // //                 console.error('Error fetching media files:', error);
// // // // // // // // //             setMediaFiles([]); // Set default data jika terjadi error
// // // // // // // // //             }
// // // // // // // // //         };

// // // // // // // // //         fetchMediaFiles();
// // // // // // // // //     }, []);

// // // // // // // // //     return (
// // // // // // // // //         <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
// // // // // // // // //             {mediaFiles.map((fileUrl, index) => (
// // // // // // // // //                 <div key={index} className="relative">
// // // // // // // // //                     {fileUrl.match(/\.(jpg|jpeg|png|gif)$/i) ? (
// // // // // // // // //                         <img
// // // // // // // // //                             src={fileUrl}
// // // // // // // // //                             alt={`Media ${index}`}
// // // // // // // // //                             className="h-auto max-w-full rounded-lg"
// // // // // // // // //                         />
// // // // // // // // //                     ) : fileUrl.match(/\.(mp4|webm|ogg)$/i) ? (
// // // // // // // // //                         <video
// // // // // // // // //                             controls
// // // // // // // // //                             className="h-auto max-w-full rounded-lg"
// // // // // // // // //                         >
// // // // // // // // //                             <source src={fileUrl} type="video/mp4" />
// // // // // // // // //                             Your browser does not support the video tag.
// // // // // // // // //                         </video>
// // // // // // // // //                     ) : (
// // // // // // // // //                         <p>Unsupported format</p>
// // // // // // // // //                     )}
// // // // // // // // //                 </div>
// // // // // // // // //             ))}
// // // // // // // // //         </div>
// // // // // // // // //     );
// // // // // // // // // };

// // // // // // // // // export default Gallery;
// // // // // // // // // // import React, { useEffect, useState } from 'react';
// // // // // // // // // // import { storage } from '../config/firebase';
// // // // // // // // // // import { ref as storageRef, listAll, getDownloadURL } from 'firebase/storage';

// // // // // // // // // // const Gallery = () => {
// // // // // // // // // //     const [imageUrls, setImageUrls] = useState([]);

// // // // // // // // // //     useEffect(() => {
// // // // // // // // // //         const fetchImages = async () => {
// // // // // // // // // //             try {
// // // // // // // // // //                 const imagesRef = storageRef(storage, 'chatFiles'); // Replace with your folder path
// // // // // // // // // //                 const imageList = await listAll(imagesRef);

// // // // // // // // // //                 const urls = await Promise.all(
// // // // // // // // // //                     imageList.items.map(async (item) => {
// // // // // // // // // //                         const url = await getDownloadURL(item);
// // // // // // // // // //                         return url;
// // // // // // // // // //                     })
// // // // // // // // // //                 );

// // // // // // // // // //                 setImageUrls(urls);
// // // // // // // // // //             } catch (error) {
// // // // // // // // // //                 console.error('Error fetching images:', error);
// // // // // // // // // //             }
// // // // // // // // // //         };

// // // // // // // // // //         fetchImages();
// // // // // // // // // //     }, []);

// // // // // // // // // //     return (
// // // // // // // // // //         <div className="grid grid-cols-2 md:grid-cols-3 gap-4 p-4">
// // // // // // // // // //             {imageUrls.map((url, index) => (
// // // // // // // // // //                 <div key={index}>
// // // // // // // // // //                     <img
// // // // // // // // // //                         className="h-auto max-w-full rounded-lg"
// // // // // // // // // //                         src={url}
// // // // // // // // // //                         alt={`Uploaded file ${index + 1}`}
// // // // // // // // // //                     />
// // // // // // // // // //                 </div>
// // // // // // // // // //             ))}
// // // // // // // // // //         </div>
// // // // // // // // // //     );
// // // // // // // // // // };

// // // // // // // // // // export default Gallery;

