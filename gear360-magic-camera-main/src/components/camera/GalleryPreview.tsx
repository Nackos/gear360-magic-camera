import { Link } from "react-router-dom";
import { useState, useEffect } from "react";

const GalleryPreview = () => {
  const [lastPhoto, setLastPhoto] = useState<string | null>(null);

  useEffect(() => {
    const loadLastPhoto = () => {
      const galleryItems = JSON.parse(localStorage.getItem('galleryItems') || '[]');
      if (galleryItems.length > 0 && galleryItems[0].thumbnail) {
        setLastPhoto(galleryItems[0].thumbnail);
      }
    };

    loadLastPhoto();
    const interval = setInterval(loadLastPhoto, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <Link to="/gallery">
      <button className="relative w-14 h-14 rounded-full overflow-hidden border-3 border-foreground shadow-lg active:scale-95 transition-transform">
        {lastPhoto ? (
          <img 
            src={lastPhoto} 
            alt="Dernière photo" 
            className="absolute inset-0 w-full h-full object-cover"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-primary/30 to-secondary/30 flex items-center justify-center">
            <div className="w-8 h-8 rounded-full bg-primary/50" />
          </div>
        )}
      </button>
    </Link>
  );
};

export default GalleryPreview;
