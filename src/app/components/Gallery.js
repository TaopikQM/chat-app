"use client";

import { useEffect, useState } from "react";
import { ref as storageRef, listAll, getDownloadURL } from "firebase/storage";
import { storage } from "../config/firebase"; // Pastikan Anda mengimpor konfigurasi Firebase yang benar

const Gallery = () => {
    const [mediaFiles, setMediaFiles] = useState([]);

    useEffect(() => {
        const fetchMediaFiles = async () => {
            try {
                // Referensi ke folder utama "chatFiles"
                const folderRef = storageRef(storage, "chatFiles/");
                const fileList = await listAll(folderRef);

                // Ambil URL untuk semua file secara dinamis
                const urls = await Promise.all(
                    fileList.items.map(async (item) => {
                        try {
                            // Ambil URL file
                            const url = await getDownloadURL(item);
                            return { url, name: item.name, contentType: item.metadata.contentType };
                        } catch (error) {
                            console.error("Error fetching URL:", error);
                            return null; // Lewati file yang gagal diakses
                        }
                    })
                );

                // Filter file yang berhasil diakses
                setMediaFiles(urls.filter((file) => file !== null));
            } catch (error) {
                console.error("Error fetching media files:", error);
                setMediaFiles([]); // Default jika terjadi error
            }
        };

        fetchMediaFiles();
    }, []);

    return (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {mediaFiles.map((file, index) => {
                const isImage = /\.(jpg|jpeg|png|gif|bmp|svg|webp)$/i.test(file.url);
                const isVideo = /\.(mp4|webm|ogg|mkv)$/i.test(file.url);

                return (
                    <div key={index} className="relative">
                        {isImage ? (
                            <img
                                src={file.url}
                                alt={`Media ${index}`}
                                className="h-auto max-w-full rounded-lg"
                            />
                        ) : isVideo ? (
                            <video controls className="h-auto max-w-full rounded-lg">
                                <source src={file.url} type={file.contentType} />
                                Your browser does not support the video tag.
                            </video>
                        ) : (
                            <p className="text-red-500">Unsupported format</p>
                        )}
                    </div>
                );
            })}
        </div>
    );
};

export default Gallery;

// "use client";

// import { useEffect, useState } from "react";
// import { ref as storageRef, listAll, getDownloadURL } from "firebase/storage";
// import { storage } from "../config/firebase"; // Impor konfigurasi Firebase

// const Gallery = () => {
//     const [mediaFiles, setMediaFiles] = useState([]);

//     useEffect(() => {
//         const fetchMediaFiles = async () => {
//             try {
//                 // Referensi ke folder utama "chatFiles"
//                 const folderRef = storageRef(storage, "chatFiles/");

//                 // Mendapatkan semua file dalam folder
//                 const fileList = await listAll(folderRef);

//                 // Ambil URL untuk semua file
//                 const urls = await Promise.all(
//                     fileList.items.map((item) =>
//                         getDownloadURL(item).catch((error) => {
//                             console.error("Error fetching URL:", error);
//                             return null; // Lewati file yang gagal diakses
//                         })
//                     )
//                 );

//                 // Hanya tambahkan URL yang valid
//                 setMediaFiles(urls.filter((url) => url !== null));
//             } catch (error) {
//                 console.error("Error fetching media files:", error);
//                 setMediaFiles([]); // Default jika terjadi error
//             }
//         };

//         fetchMediaFiles();
//     }, []);

//     return (
//         <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
//             {mediaFiles.map((fileUrl, index) => {
//                  const isImage = /\.(jpg|jpeg|png|gif|bmp|svg|webp)$/i.test(fileUrl);
//                 const isVideo = /\.(mp4|webm|ogg|mkv)$/i.test(fileUrl);

//                 return (
//                     <div key={index} className="relative">
//                         {isImage ? (
//                             <img
//                                 src={fileUrl}
//                                 alt={`Media ${index}`}
//                                 className="h-auto max-w-full rounded-lg"
//                             />
//                         ) : isVideo ? (
//                             <video controls className="h-auto max-w-full rounded-lg">
//                                 <source src={fileUrl} type="video/mp4" />
//                                 Your browser does not support the video tag.
//                             </video>
//                         ) : (
//                             <p className="text-red-500">Unsupported format</p>
//                         )}
//                     </div>
//                 );
//             })}
//         </div>
//     );
// };

// export default Gallery;

// // "use client";

// // import { useEffect, useState } from "react";
// // import { ref as storageRef, listAll, getDownloadURL } from "firebase/storage";
// // import { storage } from "../config/firebase";

// // const Gallery = () => {
// //     const [mediaFiles, setMediaFiles] = useState([]);

// //     useEffect(() => {
// //         const fetchMediaFiles = async () => {
// //             try {
// //                 // Referensi ke folder utama "chatFiles"
// //                 const folderRef = storageRef(storage, "chatFiles/");
// //                 const fileList = await listAll(folderRef);

// //                 // Ambil URL untuk semua file
// //                 const urls = await Promise.all(
// //                     fileList.items.map((item) =>
// //                         getDownloadURL(item).catch((error) => {
// //                             console.error("Error fetching URL:", error);
// //                             return null; // Lewati file yang gagal diakses
// //                         })
// //                     )
// //                 );

// //                 // Hanya tambahkan URL yang valid
// //                 setMediaFiles(urls.filter((url) => url !== null));
// //             } catch (error) {
// //                 console.error("Error fetching media files:", error);
// //                 setMediaFiles([]); // Default jika terjadi error
// //             }
// //         };

// //         fetchMediaFiles();
// //     }, []);

// //     return (
// //         <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
// //             {mediaFiles.map((fileUrl, index) => {
// //                 const isImage = fileUrl.match(/\.(jpg|jpeg|png|gif|bmp|svg|webp)$/i);
// //                 const isVideo = fileUrl.match(/\.(mp4|webm|ogg|mkv)$/i);
// //                 const isPdf = fileUrl.match(/\.pdf$/i);
// //                 const isAudio = fileUrl.match(/\.(mp3|wav|ogg)$/i);

// //                 return (
// //                     <div key={index} className="relative">
// //                         {isImage ? (
// //                             <img
// //                                 src={fileUrl}
// //                                 alt={`Media ${index}`}
// //                                 className="h-auto max-w-full rounded-lg"
// //                             />
// //                         ) : isVideo ? (
// //                             <video controls className="h-auto max-w-full rounded-lg">
// //                                 <source src={fileUrl} type="video/mp4" />
// //                                 Your browser does not support the video tag.
// //                             </video>
// //                         ) : isPdf ? (
// //                             <a
// //                                 href={fileUrl}
// //                                 target="_blank"
// //                                 rel="noopener noreferrer"
// //                                 className="text-blue-500 underline"
// //                             >
// //                                 View PDF
// //                             </a>
// //                         ) : isAudio ? (
// //                             <audio controls className="h-auto max-w-full rounded-lg">
// //                                 <source src={fileUrl} type="audio/mpeg" />
// //                                 Your browser does not support the audio element.
// //                             </audio>
// //                         ) : (
// //                             <p className="text-red-500">Unsupported format</p>
// //                         )}
// //                     </div>
// //                 );
// //             })}
// //         </div>
// //     );
// // };

// // export default Gallery;
// // // "use client";

// // // import { useEffect, useState } from "react";
// // // import { ref as storageRef, listAll, getDownloadURL } from "firebase/storage";
// // // import { storage } from "../config/firebase";

// // // const Gallery = () => {
// // //     const [mediaFiles, setMediaFiles] = useState([]);

// // //     useEffect(() => {
// // //         const fetchMediaFiles = async () => {
// // //             try {
// // //                 // Referensi ke folder utama "chatFiles"
// // //                 const folderRef = storageRef(storage, "chatFiles/");
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
// // //                 const isImage = fileUrl.match(/\.(jpg|jpeg|png|gif|bmp|svg|webp)$/i);
// // //                 const isVideo = fileUrl.match(/\.(mp4|webm|ogg|mkv)$/i);

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
// // // //                 const folderRef = storageRef(storage, "chatFiles/");
// // // //                 const fileList = await listAll(folderRef);

// // // //                 const urls = await Promise.all(
// // // //                     fileList.items.map((item) => getDownloadURL(item))
// // // //                 );

// // // //                 setMediaFiles(urls);
// // // //             } catch (error) {
// // // //                 console.error("Error fetching media files:", error);
// // // //                 setMediaFiles([]); // Default jika error
// // // //             }
// // // //         };

// // // //         fetchMediaFiles();
// // // //     }, []);

// // // //     return (
// // // //         <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
// // // //             {mediaFiles.map((fileUrl, index) => {
// // // //                 // Cek format file
// // // //                 const isImage = fileUrl.match(/\.(jpg|jpeg|png|gif|bmp|svg|webp)$/i);
// // // //                 const isVideo = fileUrl.match(/\.(mp4|webm|ogg|mkv)$/i);

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
// // // // // import { useEffect, useState } from 'react';
// // // // // import { ref as storageRef, listAll, getDownloadURL } from 'firebase/storage';
// // // // // import { storage } from '../config/firebase'; // Pastikan ini adalah konfigurasi Firebase Anda

// // // // // const Gallery = () => {
// // // // //     const [mediaFiles, setMediaFiles] = useState([]);

// // // // //     useEffect(() => {
// // // // //         const fetchMediaFiles = async () => {
// // // // //             try {
// // // // //                 const folderRef = storageRef(storage, 'chatFiles/');
// // // // //                 const fileList = await listAll(folderRef);

// // // // //                 const urls = await Promise.all(
// // // // //                     fileList.items.map((item) => getDownloadURL(item))
// // // // //                 );

// // // // //                 setMediaFiles(urls);
// // // // //             } catch (error) {
// // // // //                 console.error('Error fetching media files:', error);
// // // // //             setMediaFiles([]); // Set default data jika terjadi error
// // // // //             }
// // // // //         };

// // // // //         fetchMediaFiles();
// // // // //     }, []);

// // // // //     return (
// // // // //         <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
// // // // //             {mediaFiles.map((fileUrl, index) => (
// // // // //                 <div key={index} className="relative">
// // // // //                     {fileUrl.match(/\.(jpg|jpeg|png|gif)$/i) ? (
// // // // //                         <img
// // // // //                             src={fileUrl}
// // // // //                             alt={`Media ${index}`}
// // // // //                             className="h-auto max-w-full rounded-lg"
// // // // //                         />
// // // // //                     ) : fileUrl.match(/\.(mp4|webm|ogg)$/i) ? (
// // // // //                         <video
// // // // //                             controls
// // // // //                             className="h-auto max-w-full rounded-lg"
// // // // //                         >
// // // // //                             <source src={fileUrl} type="video/mp4" />
// // // // //                             Your browser does not support the video tag.
// // // // //                         </video>
// // // // //                     ) : (
// // // // //                         <p>Unsupported format</p>
// // // // //                     )}
// // // // //                 </div>
// // // // //             ))}
// // // // //         </div>
// // // // //     );
// // // // // };

// // // // // export default Gallery;
// // // // // // import React, { useEffect, useState } from 'react';
// // // // // // import { storage } from '../config/firebase';
// // // // // // import { ref as storageRef, listAll, getDownloadURL } from 'firebase/storage';

// // // // // // const Gallery = () => {
// // // // // //     const [imageUrls, setImageUrls] = useState([]);

// // // // // //     useEffect(() => {
// // // // // //         const fetchImages = async () => {
// // // // // //             try {
// // // // // //                 const imagesRef = storageRef(storage, 'chatFiles'); // Replace with your folder path
// // // // // //                 const imageList = await listAll(imagesRef);

// // // // // //                 const urls = await Promise.all(
// // // // // //                     imageList.items.map(async (item) => {
// // // // // //                         const url = await getDownloadURL(item);
// // // // // //                         return url;
// // // // // //                     })
// // // // // //                 );

// // // // // //                 setImageUrls(urls);
// // // // // //             } catch (error) {
// // // // // //                 console.error('Error fetching images:', error);
// // // // // //             }
// // // // // //         };

// // // // // //         fetchImages();
// // // // // //     }, []);

// // // // // //     return (
// // // // // //         <div className="grid grid-cols-2 md:grid-cols-3 gap-4 p-4">
// // // // // //             {imageUrls.map((url, index) => (
// // // // // //                 <div key={index}>
// // // // // //                     <img
// // // // // //                         className="h-auto max-w-full rounded-lg"
// // // // // //                         src={url}
// // // // // //                         alt={`Uploaded file ${index + 1}`}
// // // // // //                     />
// // // // // //                 </div>
// // // // // //             ))}
// // // // // //         </div>
// // // // // //     );
// // // // // // };

// // // // // // export default Gallery;

