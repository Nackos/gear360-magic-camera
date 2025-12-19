import { Zap, ZapOff, Timer, Play, Smile } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

interface CameraTopBarProps {
  isMotionActive: boolean;
  onToggleMotion: () => void;
  onOpenFaceFilters: () => void;
}

const CameraTopBar = ({ isMotionActive, onToggleMotion, onOpenFaceFilters }: CameraTopBarProps) => {
  const [flash, setFlash] = useState(false);
  const [timer, setTimer] = useState(false);

  return (
    <div className="absolute top-0 left-0 right-0 z-10 pt-safe">
      {/* Motion Photo Banner */}
      {isMotionActive && (
        <div className="flex items-center justify-center pt-4 pb-2">
          <div className="px-6 py-2 bg-secondary/90 backdrop-blur-md rounded-full">
            <span className="text-sm font-medium">
              Photo avec mouvement <span className="text-primary">Activé</span>
            </span>
          </div>
        </div>
      )}

      {/* Top Controls */}
      <div className="flex items-center justify-between px-6 pt-4">
        <Button
          size="icon"
          variant="ghost"
          className="w-10 h-10 rounded-full hover:bg-secondary/50"
          onClick={() => setFlash(!flash)}
        >
          {flash ? (
            <Zap className="w-5 h-5 text-yellow-500" />
          ) : (
            <ZapOff className="w-5 h-5 text-foreground" />
          )}
        </Button>

        <div className="flex items-center gap-4">
          <span className="text-sm font-medium text-foreground">12M</span>
          <button onClick={onToggleMotion}>
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
              isMotionActive ? "bg-yellow-500" : "border-2 border-foreground"
            }`}>
              <Play className={`w-4 h-4 ${isMotionActive ? "text-background" : "text-foreground"}`} />
            </div>
          </button>
          <Button
            size="icon"
            variant="ghost"
            className="w-10 h-10 rounded-full hover:bg-secondary/50"
            onClick={() => setTimer(!timer)}
          >
            <Timer className={`w-5 h-5 ${timer ? "text-yellow-500" : "text-foreground"}`} />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            className="w-10 h-10 rounded-full hover:bg-secondary/50"
            onClick={onOpenFaceFilters}
          >
            <Smile className="w-5 h-5 text-yellow-500" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CameraTopBar;
