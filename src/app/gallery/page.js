import FilePreview  from '../components/FilePreview';
import Gallery from '../components/Gallery';
import GalleryU from '../components/GalleryU';
// Example usage
const files = [
    "https://firebasestorage.googleapis.com/v0/b/env-sib.appspot.com/o/chatFiles%2F1693183058_c6b5a9f146cfab9cc063%20(1).jpg?alt=media&token=8b67096b-a2d4-47b2-8cc3-4b03cc51efe7",
    "https://firebasestorage.googleapis.com/v0/b/env-sib.appspot.com/o/chatFiles%2F-O6YejEikTGc9L8iJtLY.mp4?alt=media&token=9fd37e31-2e11-418d-a8c4-aca1be65833a"
];
export default function HomePage() {
  return (
    <div>
      <Gallery />
    <h1>INI GALERI UTAMA</h1>
      <GalleryU />
    <h1>INI GALERI UTAMAa</h1>
    <FilePreview files={files} />
    </div>
  );
}
