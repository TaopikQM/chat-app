import { useState } from "react";
import { X, ChevronLeft, ChevronRight } from "lucide-react";

const MediaViewer = ({ media, onClose }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const prevMedia = () => {
    setCurrentIndex((prev) => (prev === 0 ? media.length - 1 : prev - 1));
  };

  const nextMedia = () => {
    setCurrentIndex((prev) => (prev === media.length - 1 ? 0 : prev + 1));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50">
      <button className="absolute top-5 right-5 text-white" onClick={onClose}>
        <X size={30} />
      </button>
      <div className="relative w-full max-w-3xl h-[80vh] flex items-center justify-center">
        {media[currentIndex].type === "image" ? (
          <img src={media[currentIndex].src} alt="Media" className="max-h-full max-w-full rounded-lg" />
        ) : (
          <video controls className="max-h-full max-w-full rounded-lg">
            <source src={media[currentIndex].src} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        )}
        <button
          className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white bg-black bg-opacity-50 p-2 rounded-full"
          onClick={prevMedia}
        >
          <ChevronLeft size={30} />
        </button>
        <button
          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white bg-black bg-opacity-50 p-2 rounded-full"
          onClick={nextMedia}
        >
          <ChevronRight size={30} />
        </button>
      </div>
    </div>
  );
};

export default MediaViewer;
// import React, { useState } from "react";
// import { Button } from "./ui/button";
// import { Card, CardContent } from "./ui/card";
// import { FaDownload, FaShareAlt, FaInfoCircle, FaTrash, FaEllipsisH, FaTimes, FaPlay, FaPause, FaExpand, FaSearchPlus, FaSearchMinus } from "react-icons/fa";

// const MediaViewer = ({ imageUrl, fileName, fileIndex, totalFiles }) => {
//   const [isFullscreen, setIsFullscreen] = useState(false);
//   const [zoomLevel, setZoomLevel] = useState(100);
//   const [isPlaying, setIsPlaying] = useState(false);

//   return (
//     <section className={`media-viewer-container ${isFullscreen ? "fullscreen" : ""}`}>
//       <div className="media-viewer">
//         <header className="viewer-bars">
//           <nav className="menu-bar">
//             <Button className="icon-button" aria-label="Download">
//               <FaDownload />
//             </Button>
//             <Button className="icon-button" aria-label="Share">
//               <FaShareAlt />
//             </Button>
//             <Button className="icon-button" aria-label="Info">
//               <FaInfoCircle />
//             </Button>
//             <Button className="icon-button" aria-label="Delete">
//               <FaTrash />
//             </Button>
//             <Button className="icon-button" aria-label="More Options">
//               <FaEllipsisH />
//             </Button>
//           </nav>
//           <div className="file-info">
//             <span>{fileName}</span>
//             <span>{`File ${fileIndex} of ${totalFiles}`}</span>
//           </div>
//           <nav className="control-bar">
//             <Button className="icon-button" aria-label="Close">
//               <FaTimes />
//             </Button>
//           </nav>
//         </header>
//         <section className="content">
//           <Card className="image-container">
//             <CardContent>
//               <img src={imageUrl} alt="Media" style={{ width: `${zoomLevel}%` }} />
//             </CardContent>
//           </Card>
//         </section>
//         <footer className="viewer-controls">
//           <Button className="icon-button" aria-label="Expand" onClick={() => setIsFullscreen(!isFullscreen)}>
//             <FaExpand />
//           </Button>
//           <Button className="icon-button" aria-label="Zoom Out" onClick={() => setZoomLevel(zoomLevel - 10)}>
//             <FaSearchMinus />
//           </Button>
//           <Button className="icon-button" aria-label="Zoom In" onClick={() => setZoomLevel(zoomLevel + 10)}>
//             <FaSearchPlus />
//           </Button>
//           <Button className="icon-button" aria-label="Play/Pause" onClick={() => setIsPlaying(!isPlaying)}>
//             {isPlaying ? <FaPause /> : <FaPlay />}
//           </Button>
//         </footer>
//       </div>
//     </section>
//   );
// };

// export default MediaViewer;
