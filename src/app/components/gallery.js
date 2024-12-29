import React, { useEffect, useState } from 'react';
import { storage } from '../config/firebase';
import { ref as storageRef, listAll, getDownloadURL } from 'firebase/storage';

const Gallery = () => {
    const [imageUrls, setImageUrls] = useState([]);

    useEffect(() => {
        const fetchImages = async () => {
            try {
                const imagesRef = storageRef(storage, 'chatFiles'); // Replace with your folder path
                const imageList = await listAll(imagesRef);

                const urls = await Promise.all(
                    imageList.items.map(async (item) => {
                        const url = await getDownloadURL(item);
                        return url;
                    })
                );

                setImageUrls(urls);
            } catch (error) {
                console.error('Error fetching images:', error);
            }
        };

        fetchImages();
    }, []);

    return (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 p-4">
            {imageUrls.map((url, index) => (
                <div key={index}>
                    <img
                        className="h-auto max-w-full rounded-lg"
                        src={url}
                        alt={`Uploaded file ${index + 1}`}
                    />
                </div>
            ))}
        </div>
    );
};

export default Gallery;
