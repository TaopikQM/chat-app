import React from 'react';

const FilePreview = ({ files }) => {
    // Image preview component
    const ImagePreview = ({ url }) => {
        return (
            <div className="file-preview">
                <img
                    className="h-auto max-w-full rounded-lg"
                    src={url}
                    alt="File preview"
                    style={{ width: '300px', height: 'auto' }}
                />
            </div>
        );
    };

    // Video preview component
    const VideoPreview = ({ url }) => {
        return (
            <div className="file-preview">
                <video className="h-auto max-w-full rounded-lg" width="300" controls>
                    <source src={url} type="video/mp4" />
                    Your browser does not support the video tag.
                </video>
            </div>
        );
    };

    return (
        <div>
            {files.length === 0 ? (
                <p>Tidak ada file untuk ditampilkan.</p>
            ) : (
                files.map((url, index) => {
                    const isVideo = url.toLowerCase().endsWith('.mp4');
                    return (
                        <div key={index}>
                            {isVideo ? (
                                <VideoPreview url={url} />
                            ) : (
                                <ImagePreview url={url} />
                            )}
                        </div>
                    );
                })
            )}
        </div>
    );
};

