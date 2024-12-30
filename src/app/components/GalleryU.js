"use client"; // Pastikan ini ada di bagian atas file jika menggunakan Next.js 13+

import { useEffect, useState } from "react";
import { getStorage, ref, listAll, getDownloadURL } from "firebase/storage";
import { storage } from "../config/firebase"; // Pastikan path ini benar

const GalleryU = () => {
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

export default GalleryU;
