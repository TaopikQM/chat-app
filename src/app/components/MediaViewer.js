import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { FaDownload, FaShareAlt, FaInfoCircle, FaTrash, FaEllipsisH, FaTimes, FaPlay, FaPause, FaExpand, FaSearchPlus, FaSearchMinus } from "react-icons/fa";

const MediaViewer = ({ imageUrl, fileName, fileIndex, totalFiles }) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(100);
  const [isPlaying, setIsPlaying] = useState(false);

  return (
    <section className={`media-viewer-container ${isFullscreen ? "fullscreen" : ""}`}>
      <div className="media-viewer">
        <header className="viewer-bars">
          <nav className="menu-bar">
            <Button className="icon-button" aria-label="Download">
              <FaDownload />
            </Button>
            <Button className="icon-button" aria-label="Share">
              <FaShareAlt />
            </Button>
            <Button className="icon-button" aria-label="Info">
              <FaInfoCircle />
            </Button>
            <Button className="icon-button" aria-label="Delete">
              <FaTrash />
            </Button>
            <Button className="icon-button" aria-label="More Options">
              <FaEllipsisH />
            </Button>
          </nav>
          <div className="file-info">
            <span>{fileName}</span>
            <span>{`File ${fileIndex} of ${totalFiles}`}</span>
          </div>
          <nav className="control-bar">
            <Button className="icon-button" aria-label="Close">
              <FaTimes />
            </Button>
          </nav>
        </header>
        <section className="content">
          <Card className="image-container">
            <CardContent>
              <img src={imageUrl} alt="Media" style={{ width: `${zoomLevel}%` }} />
            </CardContent>
          </Card>
        </section>
        <footer className="viewer-controls">
          <Button className="icon-button" aria-label="Expand" onClick={() => setIsFullscreen(!isFullscreen)}>
            <FaExpand />
          </Button>
          <Button className="icon-button" aria-label="Zoom Out" onClick={() => setZoomLevel(zoomLevel - 10)}>
            <FaSearchMinus />
          </Button>
          <Button className="icon-button" aria-label="Zoom In" onClick={() => setZoomLevel(zoomLevel + 10)}>
            <FaSearchPlus />
          </Button>
          <Button className="icon-button" aria-label="Play/Pause" onClick={() => setIsPlaying(!isPlaying)}>
            {isPlaying ? <FaPause /> : <FaPlay />}
          </Button>
        </footer>
      </div>
    </section>
  );
};

export default MediaViewer;
