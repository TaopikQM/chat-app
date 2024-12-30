"use client"; // Pastikan ini ada di bagian atas file jika menggunakan Next.js 13+

import { useEffect, useState } from "react";
import { getStorage, ref, listAll, getDownloadURL } from "firebase/storage";
import { storage } from "../config/firebase"; // Pastikan path ini benar

const Gallery = () => {
    const [filesByDate, setFilesByDate] = useState({ images: {}, videos: {} });
    const [activeTab, setActiveTab] = useState("images"); // Tab aktif (images atau videos)

    useEffect(() => {
        const fetchFiles = async () => {
            const listRef = ref(storage, 'chatFiles/'); // Path ke folder chatFiles

            try {
                const res = await listAll(listRef);
                const filesData = await Promise.all(
                    res.items.map(async (item) => {
                        const url = await getDownloadURL(item);
                        const metadata = await item.getMetadata(); // Mendapatkan metadata
                        return {
                            url,
                            name: item.name,
                            timeCreated: metadata.timeCreated,
                        };
                    })
                );

                // Mengelompokkan file berdasarkan jenis (gambar atau video)
                const groupedFiles = filesData.reduce((acc, file) => {
                    const date = new Date(file.timeCreated);
                    const dateKey = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`; // Format YYYY-MM-DD

                    if (file.url.endsWith('.mp4')) {
                        if (!acc.videos[dateKey]) {
                            acc.videos[dateKey] = [];
                        }
                        acc.videos[dateKey].push(file);
                    } else {
                        if (!acc.images[dateKey]) {
                            acc.images[dateKey] = [];
                        }
                        acc.images[dateKey].push(file);
                    }

                    return acc;
                }, { images: {}, videos: {} });

                setFilesByDate(groupedFiles); // Menyimpan data yang dikelompokkan ke state
            } catch (error) {
                console.error("Error fetching files: ", error);
            }
        };

        fetchFiles(); // Memanggil fungsi untuk mengambil file
    }, []);

    return (
        <div className="container mx-auto p-4">
            <h2 className="text-2xl font-bold mb-4">Galeri File</h2>
            <nav className="mb-4">
                <button 
                    onClick={() => setActiveTab("images")} 
                    className={`px-4 py-2 mr-2 rounded ${activeTab === "images" ? "bg-blue-500 text-white" : "bg-gray-200"}`}
                >
                    Gambar
                </button>
                <button 
                    onClick={() => setActiveTab("videos")} 
                    className={`px-4 py-2 rounded ${activeTab === "videos" ? "bg-blue-500 text-white" : "bg-gray-200"}`}
                >
                    Video
                </button>
            </nav>

            {activeTab === "images" && (
                <>
                    {Object.keys(filesByDate.images).length === 0 ? (
                        <p>Tidak ada gambar untuk ditampilkan.</p>
                    ) : (
                        Object.keys(filesByDate.images).map((dateKey) => (
                            <div key={dateKey} className="mb-6">
                                <span className="block text-xl font-semibold mb-2">{dateKey}</span>
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                                    {filesByDate.images[dateKey].map((file, index) => (
                                        <div key={index}>
                                            <img src={file.url} alt={`Image ${index + 1}`} className="h-auto max-w-full rounded-lg object-cover" />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))
                    )}
                </>
            )}

            {activeTab === "videos" && (
                <>
                    {Object.keys(filesByDate.videos).length === 0 ? (
                        <p>Tidak ada video untuk ditampilkan.</p>
                    ) : (
                        Object.keys(filesByDate.videos).map((dateKey) => (
                            <div key={dateKey} className="mb-6">
                                <span className="block text-xl font-semibold mb-2">{dateKey}</span>
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                                    {filesByDate.videos[dateKey].map((file, index) => (
                                        <div key={index}>
                                            <video controls className="h-auto max-w-full rounded-lg object-cover">
                                                <source src={file.url} type="video/mp4" />
                                                Your browser does not support the video tag.
                                            </video>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))
                    )}
                </>
            )}
        </div>
    );
};

export default Gallery;


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
// // "use client";
// // import { useEffect, useState } from "react";
// // import { getStorage, ref, listAll, getDownloadURL } from "firebase/storage";
// // import { storage } from "../config/firebase"; // Pastikan path ini benar

// // const Gallery = () => {
// //     const [files, setFiles] = useState([]);

// //     useEffect(() => {
// //         const fetchFiles = async () => {
// //             const listRef = ref(storage, 'chatFiles/'); // Path ke folder chatFiles

// //             try {
// //                 const res = await listAll(listRef);
// //                 const fileUrls = await Promise.all(
// //                     res.items.map(async (item) => {
// //                         return await getDownloadURL(item);
// //                     })
// //                 );
// //                 setFiles(fileUrls); // Menyimpan URL ke state
// //             } catch (error) {
// //                 console.error("Error fetching files: ", error);
// //             }
// //         };

// //         fetchFiles(); // Memanggil fungsi untuk mengambil file
// //     }, []);

// //     return (
// //          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
       
// //                 {files.length === 0 ? (
// //                     <p>Tidak ada file untuk ditampilkan.</p>
// //                 ) : (
// //                     files.map((url, index) => (
// //                         <div key={index} className="file-preview">
// //                             {url.endsWith('.mp4') ? (
// //                                 <video width="300" controls>
// //                                     <source src={url} type="video/mp4" />
// //                                     Your browser does not support the video tag.
// //                                 </video>
// //                             ) : (
// //                                 <img src={url} alt={`File ${index}`} style={{ width: '300px', height: 'auto' }} />
// //                             )}
// //                         </div>
// //                     ))
// //                 )}
// //         </div>
// //     );
// // };

// // export default Gallery;



// // // "use client";

// // // import { useEffect, useState } from "react";
// // // import { ref as storageRef, listAll, getDownloadURL } from "firebase/storage";
// // // import { storage } from "../config/firebase"; // Impor konfigurasi Firebase

// // // const Gallery = () => {
// // //     const [mediaFiles, setMediaFiles] = useState([]);

// // //     useEffect(() => {
// // //         const fetchMediaFiles = async () => {
// // //             try {
// // //                 // Referensi ke folder utama "chatFiles"
// // //                 const folderRef = storageRef(storage, "chatFiles/");

// // //                 // Mendapatkan semua file dalam folder
// // //                 const fileList = await listAll(folderRef);

// // //                 // Ambil URL untuk semua file
// // //                 const urls = await Promise.all(
// // //                     fileList.items.map((item) =>
// // //                         getDownloadURL(item).catch((error) => {
// // //                             console.error("Error fetching URL:", error);
// // //                             return null; // Lewati file yang gagal diakses
// // //                         })
// // //                     )
// // //                 );

// // //                 // Hanya tambahkan URL yang valid
// // //                 setMediaFiles(urls.filter((url) => url !== null));
// // //             } catch (error) {
// // //                 console.error("Error fetching media files:", error);
// // //                 setMediaFiles([]); // Default jika terjadi error
// // //             }
// // //         };

// // //         fetchMediaFiles();
// // //     }, []);

// // //     return (
// // //         <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
// // //             {mediaFiles.map((fileUrl, index) => {
// // //                  const isImage = /\.(jpg|jpeg|png|gif|bmp|svg|webp)$/i.test(fileUrl);
// // //                 const isVideo = /\.(mp4|webm|ogg|mkv)$/i.test(fileUrl);

// // //                 return (
// // //                     <div key={index} className="relative">
// // //                         {isImage ? (
// // //                             <img
// // //                                 src={fileUrl}
// // //                                 alt={`Media ${index}`}
// // //                                 className="h-auto max-w-full rounded-lg"
// // //                             />
// // //                         ) : isVideo ? (
// // //                             <video controls className="h-auto max-w-full rounded-lg">
// // //                                 <source src={fileUrl} type="video/mp4" />
// // //                                 Your browser does not support the video tag.
// // //                             </video>
// // //                         ) : (
// // //                             <p className="text-red-500">Unsupported format</p>
// // //                         )}
// // //                     </div>
// // //                 );
// // //             })}
// // //         </div>
// // //     );
// // // };

// // // export default Gallery;

// // // // "use client";

// // // // import { useEffect, useState } from "react";
// // // // import { ref as storageRef, listAll, getDownloadURL } from "firebase/storage";
// // // // import { storage } from "../config/firebase";

// // // // const Gallery = () => {
// // // //     const [mediaFiles, setMediaFiles] = useState([]);

// // // //     useEffect(() => {
// // // //         const fetchMediaFiles = async () => {
// // // //             try {
// // // //                 // Referensi ke folder utama "chatFiles"
// // // //                 const folderRef = storageRef(storage, "chatFiles/");
// // // //                 const fileList = await listAll(folderRef);

// // // //                 // Ambil URL untuk semua file
// // // //                 const urls = await Promise.all(
// // // //                     fileList.items.map((item) =>
// // // //                         getDownloadURL(item).catch((error) => {
// // // //                             console.error("Error fetching URL:", error);
// // // //                             return null; // Lewati file yang gagal diakses
// // // //                         })
// // // //                     )
// // // //                 );

// // // //                 // Hanya tambahkan URL yang valid
// // // //                 setMediaFiles(urls.filter((url) => url !== null));
// // // //             } catch (error) {
// // // //                 console.error("Error fetching media files:", error);
// // // //                 setMediaFiles([]); // Default jika terjadi error
// // // //             }
// // // //         };

// // // //         fetchMediaFiles();
// // // //     }, []);

// // // //     return (
// // // //         <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
// // // //             {mediaFiles.map((fileUrl, index) => {
// // // //                 const isImage = fileUrl.match(/\.(jpg|jpeg|png|gif|bmp|svg|webp)$/i);
// // // //                 const isVideo = fileUrl.match(/\.(mp4|webm|ogg|mkv)$/i);
// // // //                 const isPdf = fileUrl.match(/\.pdf$/i);
// // // //                 const isAudio = fileUrl.match(/\.(mp3|wav|ogg)$/i);

// // // //                 return (
// // // //                     <div key={index} className="relative">
// // // //                         {isImage ? (
// // // //                             <img
// // // //                                 src={fileUrl}
// // // //                                 alt={`Media ${index}`}
// // // //                                 className="h-auto max-w-full rounded-lg"
// // // //                             />
// // // //                         ) : isVideo ? (
// // // //                             <video controls className="h-auto max-w-full rounded-lg">
// // // //                                 <source src={fileUrl} type="video/mp4" />
// // // //                                 Your browser does not support the video tag.
// // // //                             </video>
// // // //                         ) : isPdf ? (
// // // //                             <a
// // // //                                 href={fileUrl}
// // // //                                 target="_blank"
// // // //                                 rel="noopener noreferrer"
// // // //                                 className="text-blue-500 underline"
// // // //                             >
// // // //                                 View PDF
// // // //                             </a>
// // // //                         ) : isAudio ? (
// // // //                             <audio controls className="h-auto max-w-full rounded-lg">
// // // //                                 <source src={fileUrl} type="audio/mpeg" />
// // // //                                 Your browser does not support the audio element.
// // // //                             </audio>
// // // //                         ) : (
// // // //                             <p className="text-red-500">Unsupported format</p>
// // // //                         )}
// // // //                     </div>
// // // //                 );
// // // //             })}
// // // //         </div>
// // // //     );
// // // // };

// // // // export default Gallery;
// // // // // "use client";

// // // // // import { useEffect, useState } from "react";
// // // // // import { ref as storageRef, listAll, getDownloadURL } from "firebase/storage";
// // // // // import { storage } from "../config/firebase";

// // // // // const Gallery = () => {
// // // // //     const [mediaFiles, setMediaFiles] = useState([]);

// // // // //     useEffect(() => {
// // // // //         const fetchMediaFiles = async () => {
// // // // //             try {
// // // // //                 // Referensi ke folder utama "chatFiles"
// // // // //                 const folderRef = storageRef(storage, "chatFiles/");
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
// // // // //                 const isImage = fileUrl.match(/\.(jpg|jpeg|png|gif|bmp|svg|webp)$/i);
// // // // //                 const isVideo = fileUrl.match(/\.(mp4|webm|ogg|mkv)$/i);

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
// // // // // //                 const folderRef = storageRef(storage, "chatFiles/");
// // // // // //                 const fileList = await listAll(folderRef);

// // // // // //                 const urls = await Promise.all(
// // // // // //                     fileList.items.map((item) => getDownloadURL(item))
// // // // // //                 );

// // // // // //                 setMediaFiles(urls);
// // // // // //             } catch (error) {
// // // // // //                 console.error("Error fetching media files:", error);
// // // // // //                 setMediaFiles([]); // Default jika error
// // // // // //             }
// // // // // //         };

// // // // // //         fetchMediaFiles();
// // // // // //     }, []);

// // // // // //     return (
// // // // // //         <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
// // // // // //             {mediaFiles.map((fileUrl, index) => {
// // // // // //                 // Cek format file
// // // // // //                 const isImage = fileUrl.match(/\.(jpg|jpeg|png|gif|bmp|svg|webp)$/i);
// // // // // //                 const isVideo = fileUrl.match(/\.(mp4|webm|ogg|mkv)$/i);

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
// // // // // // // import { useEffect, useState } from 'react';
// // // // // // // import { ref as storageRef, listAll, getDownloadURL } from 'firebase/storage';
// // // // // // // import { storage } from '../config/firebase'; // Pastikan ini adalah konfigurasi Firebase Anda

// // // // // // // const Gallery = () => {
// // // // // // //     const [mediaFiles, setMediaFiles] = useState([]);

// // // // // // //     useEffect(() => {
// // // // // // //         const fetchMediaFiles = async () => {
// // // // // // //             try {
// // // // // // //                 const folderRef = storageRef(storage, 'chatFiles/');
// // // // // // //                 const fileList = await listAll(folderRef);

// // // // // // //                 const urls = await Promise.all(
// // // // // // //                     fileList.items.map((item) => getDownloadURL(item))
// // // // // // //                 );

// // // // // // //                 setMediaFiles(urls);
// // // // // // //             } catch (error) {
// // // // // // //                 console.error('Error fetching media files:', error);
// // // // // // //             setMediaFiles([]); // Set default data jika terjadi error
// // // // // // //             }
// // // // // // //         };

// // // // // // //         fetchMediaFiles();
// // // // // // //     }, []);

// // // // // // //     return (
// // // // // // //         <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
// // // // // // //             {mediaFiles.map((fileUrl, index) => (
// // // // // // //                 <div key={index} className="relative">
// // // // // // //                     {fileUrl.match(/\.(jpg|jpeg|png|gif)$/i) ? (
// // // // // // //                         <img
// // // // // // //                             src={fileUrl}
// // // // // // //                             alt={`Media ${index}`}
// // // // // // //                             className="h-auto max-w-full rounded-lg"
// // // // // // //                         />
// // // // // // //                     ) : fileUrl.match(/\.(mp4|webm|ogg)$/i) ? (
// // // // // // //                         <video
// // // // // // //                             controls
// // // // // // //                             className="h-auto max-w-full rounded-lg"
// // // // // // //                         >
// // // // // // //                             <source src={fileUrl} type="video/mp4" />
// // // // // // //                             Your browser does not support the video tag.
// // // // // // //                         </video>
// // // // // // //                     ) : (
// // // // // // //                         <p>Unsupported format</p>
// // // // // // //                     )}
// // // // // // //                 </div>
// // // // // // //             ))}
// // // // // // //         </div>
// // // // // // //     );
// // // // // // // };

// // // // // // // export default Gallery;
// // // // // // // // import React, { useEffect, useState } from 'react';
// // // // // // // // import { storage } from '../config/firebase';
// // // // // // // // import { ref as storageRef, listAll, getDownloadURL } from 'firebase/storage';

// // // // // // // // const Gallery = () => {
// // // // // // // //     const [imageUrls, setImageUrls] = useState([]);

// // // // // // // //     useEffect(() => {
// // // // // // // //         const fetchImages = async () => {
// // // // // // // //             try {
// // // // // // // //                 const imagesRef = storageRef(storage, 'chatFiles'); // Replace with your folder path
// // // // // // // //                 const imageList = await listAll(imagesRef);

// // // // // // // //                 const urls = await Promise.all(
// // // // // // // //                     imageList.items.map(async (item) => {
// // // // // // // //                         const url = await getDownloadURL(item);
// // // // // // // //                         return url;
// // // // // // // //                     })
// // // // // // // //                 );

// // // // // // // //                 setImageUrls(urls);
// // // // // // // //             } catch (error) {
// // // // // // // //                 console.error('Error fetching images:', error);
// // // // // // // //             }
// // // // // // // //         };

// // // // // // // //         fetchImages();
// // // // // // // //     }, []);

// // // // // // // //     return (
// // // // // // // //         <div className="grid grid-cols-2 md:grid-cols-3 gap-4 p-4">
// // // // // // // //             {imageUrls.map((url, index) => (
// // // // // // // //                 <div key={index}>
// // // // // // // //                     <img
// // // // // // // //                         className="h-auto max-w-full rounded-lg"
// // // // // // // //                         src={url}
// // // // // // // //                         alt={`Uploaded file ${index + 1}`}
// // // // // // // //                     />
// // // // // // // //                 </div>
// // // // // // // //             ))}
// // // // // // // //         </div>
// // // // // // // //     );
// // // // // // // // };

// // // // // // // // export default Gallery;

