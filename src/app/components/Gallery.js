"use client"; // Pastikan ini ada di bagian atas file jika menggunakan Next.js 13+

import { useEffect, useState } from "react";
import { getStorage, ref, listAll, getDownloadURL } from "firebase/storage";
import { storage } from "../config/firebase"; // Pastikan path ini benar

const Gallery = () => {
    const [imageUrls, setImageUrls] = useState([]);
    const [videoUrls, setVideoUrls] = useState([]);

    useEffect(() => {
        const fetchFiles = async () => {
            const listRef = ref(storage, 'chatFiles/'); // Path ke folder chatFiles

            try {
                const res = await listAll(listRef);
                const urls = await Promise.all(
                    res.items.map(async (item) => {
                        const url = await getDownloadURL(item); // Mendapatkan URL untuk setiap file
                        return { url, name: item.name }; // Mengembalikan URL dan nama file
                    })
                );

                // Memisahkan URL gambar dan video
                const images = urls.filter(file => file.url.endsWith('.jpg') || file.url.endsWith('.jpeg') || file.url.endsWith('.png'));
                const videos = urls.filter(file => file.url.endsWith('.mp4'));

                setImageUrls(images.map(file => file.url)); // Menyimpan URL gambar ke state
                setVideoUrls(videos.map(file => file.url)); // Menyimpan URL video ke state
            } catch (error) {
                console.error("Error fetching files: ", error);
            }
        };

        fetchFiles(); // Memanggil fungsi untuk mengambil file
    }, []);

    return (
        <div className="container mx-auto p-4">
            <h2 className="text-2xl font-bold mb-4">Galeri File</h2>

            {/* Menampilkan Gambar */}
            {imageUrls.length > 0 && (
                <div className="mb-6">
                    <h3 className="text-xl font-semibold mb-2">Gambar</h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                        {imageUrls.map((imageUrl, index) => (
                            <div key={index}>
                                <img src={imageUrl} alt={`Image ${index + 1}`} className="h-60 w-full object-cover rounded-lg" />
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Menampilkan Video */}
            {videoUrls.length > 0 && (
                <div>
                    <h3 className="text-xl font-semibold mb-2">Video</h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                        {videoUrls.map((videoUrl, index) => (
                            <div key={index}>
                                <video controls className="h-60 w-full object-cover rounded-lg">
                                    <source src={videoUrl} type="video/mp4" />
                                    Your browser does not support the video tag.
                                </video>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Pesan jika tidak ada file */}
            {imageUrls.length === 0 && videoUrls.length === 0 && (
                <p>Tidak ada file untuk ditampilkan.</p>
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

