import { useState } from "react";
import { Settings, Smile, X } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import FaceFiltersMenu from "./FaceFiltersMenu";

interface QuickSettingsMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

const QuickSettingsMenu = ({ isOpen, onClose }: QuickSettingsMenuProps) => {
  const [showFaceFilters, setShowFaceFilters] = useState(false);

  if (!isOpen) return null;

  if (showFaceFilters) {
    return (
      <FaceFiltersMenu 
        onBack={() => setShowFaceFilters(false)} 
        onClose={onClose}
      />
    );
  }

  return (
    <>
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm z-40"
        onClick={onClose}
      />
      
      {/* Menu */}
      <div className="absolute bottom-32 right-4 z-50 bg-camera-overlay/95 backdrop-blur-xl rounded-2xl p-2 shadow-2xl border border-white/10 animate-in slide-in-from-bottom-4 duration-300">
        <Button
          variant="ghost"
          className="w-full justify-start gap-3 text-foreground hover:bg-white/10 h-12 px-4"
          onClick={() => setShowFaceFilters(true)}
        >
          <Smile className="w-5 h-5" />
          <span>Filtres de visage</span>
        </Button>
        
        <Link to="/settings" onClick={onClose}>
          <Button
            variant="ghost"
            className="w-full justify-start gap-3 text-foreground hover:bg-white/10 h-12 px-4"
          >
            <Settings className="w-5 h-5" />
            <span>Paramètres</span>
          </Button>
        </Link>

        <div className="border-t border-white/10 mt-2 pt-2">
          <Button
            variant="ghost"
            className="w-full justify-center text-foreground hover:bg-white/10 h-10"
            onClick={onClose}
          >
            <X className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </>
  );
};

export default QuickSettingsMenu;
