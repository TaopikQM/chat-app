"use client";

import { useEffect, useState } from "react";
import { ref as storageRef, listAll, getDownloadURL } from "firebase/storage";
import { storage } from "../config/firebase";

const Gallery = () => {
    const [mediaFiles, setMediaFiles] = useState([]);

    useEffect(() => {
        const fetchMediaFiles = async () => {
            try {
                const folderRef = storageRef(storage, "chatFiles/");
                const fileList = await listAll(folderRef);

                const urls = await Promise.all(
                    fileList.items.map((item) => getDownloadURL(item))
                );

                setMediaFiles(urls);
            } catch (error) {
                console.error("Error fetching media files:", error);
                setMediaFiles([]); // Default jika error
            }
        };

        fetchMediaFiles();
    }, []);

    return (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {mediaFiles.map((fileUrl, index) => (
                <div key={index} className="relative">
                    {fileUrl.match(/\.(jpg|jpeg|png|gif)$/i) ? (
                        <img
                            src={fileUrl}
                            alt={`Media ${index}`}
                            className="h-auto max-w-full rounded-lg"
                        />
                    ) : fileUrl.match(/\.(mp4|webm|ogg)$/i) ? (
                        <video
                            controls
                            className="h-auto max-w-full rounded-lg"
                        >
                            <source src={fileUrl} type="video/mp4" />
                            Your browser does not support the video tag.
                        </video>
                    ) : (
                        <p>Unsupported format</p>
                    )}
                </div>
            ))}
        </div>
    );
};

export default Gallery;
// "use client";
// import { useEffect, useState } from 'react';
// import { ref as storageRef, listAll, getDownloadURL } from 'firebase/storage';
// import { storage } from '../config/firebase'; // Pastikan ini adalah konfigurasi Firebase Anda

// const Gallery = () => {
//     const [mediaFiles, setMediaFiles] = useState([]);

//     useEffect(() => {
//         const fetchMediaFiles = async () => {
//             try {
//                 const folderRef = storageRef(storage, 'chatFiles/');
//                 const fileList = await listAll(folderRef);

//                 const urls = await Promise.all(
//                     fileList.items.map((item) => getDownloadURL(item))
//                 );

//                 setMediaFiles(urls);
//             } catch (error) {
//                 console.error('Error fetching media files:', error);
//             setMediaFiles([]); // Set default data jika terjadi error
//             }
//         };

//         fetchMediaFiles();
//     }, []);

//     return (
//         <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
//             {mediaFiles.map((fileUrl, index) => (
//                 <div key={index} className="relative">
//                     {fileUrl.match(/\.(jpg|jpeg|png|gif)$/i) ? (
//                         <img
//                             src={fileUrl}
//                             alt={`Media ${index}`}
//                             className="h-auto max-w-full rounded-lg"
//                         />
//                     ) : fileUrl.match(/\.(mp4|webm|ogg)$/i) ? (
//                         <video
//                             controls
//                             className="h-auto max-w-full rounded-lg"
//                         >
//                             <source src={fileUrl} type="video/mp4" />
//                             Your browser does not support the video tag.
//                         </video>
//                     ) : (
//                         <p>Unsupported format</p>
//                     )}
//                 </div>
//             ))}
//         </div>
//     );
// };

// export default Gallery;
// // import React, { useEffect, useState } from 'react';
// // import { storage } from '../config/firebase';
// // import { ref as storageRef, listAll, getDownloadURL } from 'firebase/storage';

// // const Gallery = () => {
// //     const [imageUrls, setImageUrls] = useState([]);

// //     useEffect(() => {
// //         const fetchImages = async () => {
// //             try {
// //                 const imagesRef = storageRef(storage, 'chatFiles'); // Replace with your folder path
// //                 const imageList = await listAll(imagesRef);

// //                 const urls = await Promise.all(
// //                     imageList.items.map(async (item) => {
// //                         const url = await getDownloadURL(item);
// //                         return url;
// //                     })
// //                 );

// //                 setImageUrls(urls);
// //             } catch (error) {
// //                 console.error('Error fetching images:', error);
// //             }
// //         };

// //         fetchImages();
// //     }, []);

// //     return (
// //         <div className="grid grid-cols-2 md:grid-cols-3 gap-4 p-4">
// //             {imageUrls.map((url, index) => (
// //                 <div key={index}>
// //                     <img
// //                         className="h-auto max-w-full rounded-lg"
// //                         src={url}
// //                         alt={`Uploaded file ${index + 1}`}
// //                     />
// //                 </div>
// //             ))}
// //         </div>
// //     );
// // };

// // export default Gallery;

