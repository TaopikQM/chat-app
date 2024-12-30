


"use client"; // Pastikan ini ada di bagian atas file jika menggunakan Next.js 13+

import { useEffect, useState } from "react";
import { getStorage, ref, listAll, getDownloadURL } from "firebase/storage";
import { storage } from "../config/firebase"; // Pastikan path ini benar

const Gallery = () => {
    const [files, setFiles] = useState([]);

    useEffect(() => {
        const fetchFiles = async () => {
            const listRef = ref(storage, 'chatFiles/'); // Path ke folder chatFiles

            try {
                const res = await listAll(listRef);
                const fileUrls = await Promise.all(
                    res.items.map(async (item) => {
                        return await getDownloadURL(item); // Mendapatkan URL untuk setiap file
                    })
                );
                setFiles(fileUrls); // Menyimpan URL ke state
            } catch (error) {
                console.error("Error fetching files: ", error);
            }
        };

        fetchFiles(); // Memanggil fungsi untuk mengambil file
    }, []);

    return (
        <div className="grid grid-cols-3 md:grid-cols-4 gap-2">
            {files.length === 0 ? (
                <p>Tidak ada file untuk ditampilkan.</p>
            ) : (
                files.map((url, index) => (
                    <div key={index} className="file-preview">
                        {url.endsWith('.mp4') ? (
                            <video class="h-auto max-w-full rounded-lg" width="300" controls>
                                <source src={url} type="video/mp4" />
                                Your browser does not support the video tag.
                            </video>
                        ) : (
                            <img class="h-auto max-w-full rounded-lg" src={url} alt={`File ${index}`} style={{ width: '300px', height: 'auto' }} />
                        )}
                    </div>
                ))
            )}
        </div>
    );
};

export default Gallery;
