import { useState } from "react";
import { Settings, Zap, ZapOff, Timer, Clock, Image as ImageIcon, Smile, X, Moon, Cloud, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import FaceFiltersMenu from "./FaceFiltersMenu";
import PhotoFiltersMenu from "./PhotoFiltersMenu";

interface QuickActionsBarProps {
  isOpen: boolean;
  onClose: () => void;
}

const QuickActionsBar = ({ isOpen, onClose }: QuickActionsBarProps) => {
  const [showFaceFilters, setShowFaceFilters] = useState(false);
  const [showPhotoFilters, setShowPhotoFilters] = useState(false);
  const [aspectRatio, setAspectRatio] = useState("Full");
  const [resolution, setResolution] = useState("12M");
  const [flash, setFlash] = useState<"off" | "on" | "auto">("off");
  const [timer, setTimer] = useState<number>(0);
  const [hdr, setHdr] = useState(false);
  const [nightMode, setNightMode] = useState(false);

  if (!isOpen) return null;

  if (showFaceFilters) {
    return (
      <FaceFiltersMenu 
        onBack={() => setShowFaceFilters(false)} 
        onClose={onClose}
      />
    );
  }

  if (showPhotoFilters) {
    return (
      <PhotoFiltersMenu 
        onBack={() => setShowPhotoFilters(false)} 
        onClose={onClose}
      />
    );
  }

  const aspectRatios = ["Full", "16:9", "4:3", "1:1"];
  const resolutions = ["12M", "50M", "108M"];
  const timerOptions = [0, 2, 5, 10];

  const toggleFlash = () => {
    if (flash === "off") setFlash("on");
    else if (flash === "on") setFlash("auto");
    else setFlash("off");
  };

  const cycleTimer = () => {
    const currentIndex = timerOptions.indexOf(timer);
    const nextIndex = (currentIndex + 1) % timerOptions.length;
    setTimer(timerOptions[nextIndex]);
  };

  return (
    <>
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/30 backdrop-blur-sm z-40"
        onClick={onClose}
      />
      
      {/* Actions Bar */}
      <div className="absolute bottom-32 left-4 right-4 z-50 animate-in slide-in-from-bottom-4 duration-300">
        <div className="bg-camera-overlay/95 backdrop-blur-xl rounded-full px-4 py-3 shadow-2xl border border-white/10 flex items-center justify-between gap-2">
          {/* Settings */}
          <Button
            size="icon"
            variant="ghost"
            className={`w-10 h-10 rounded-full hover:bg-white/10 ${hdr ? 'text-yellow-500' : 'text-foreground'}`}
            onClick={() => setHdr(!hdr)}
          >
            <Settings className="w-5 h-5" />
          </Button>

          {/* Flash */}
          <Button
            size="icon"
            variant="ghost"
            className={`w-10 h-10 rounded-full hover:bg-white/10 ${flash !== 'off' ? 'text-yellow-500' : 'text-foreground'}`}
            onClick={toggleFlash}
          >
            {flash === "off" ? <ZapOff className="w-5 h-5" /> : <Zap className="w-5 h-5" />}
          </Button>

          {/* Timer */}
          <Button
            size="icon"
            variant="ghost"
            className={`w-10 h-10 rounded-full hover:bg-white/10 relative ${timer > 0 ? 'text-yellow-500' : 'text-foreground'}`}
            onClick={cycleTimer}
          >
            {timer > 0 ? <Clock className="w-5 h-5" /> : <Timer className="w-5 h-5" />}
            {timer > 0 && (
              <span className="absolute -top-1 -right-1 text-[10px] font-bold bg-yellow-500 text-black rounded-full w-4 h-4 flex items-center justify-center">
                {timer}
              </span>
            )}
          </Button>

          {/* Aspect Ratio */}
          <Button
            variant="ghost"
            className="h-10 px-3 rounded-full hover:bg-white/10 text-foreground font-medium text-sm"
            onClick={() => {
              const currentIndex = aspectRatios.indexOf(aspectRatio);
              const nextIndex = (currentIndex + 1) % aspectRatios.length;
              setAspectRatio(aspectRatios[nextIndex]);
            }}
          >
            {aspectRatio}
          </Button>

          {/* Resolution */}
          <Button
            variant="ghost"
            className="h-10 px-3 rounded-full hover:bg-white/10 text-yellow-500 font-medium text-sm"
            onClick={() => {
              const currentIndex = resolutions.indexOf(resolution);
              const nextIndex = (currentIndex + 1) % resolutions.length;
              setResolution(resolutions[nextIndex]);
            }}
          >
            {resolution}
          </Button>

          {/* Video Quality */}
          <Button
            size="icon"
            variant="ghost"
            className="w-10 h-10 rounded-full hover:bg-white/10 text-yellow-500"
          >
            <ImageIcon className="w-5 h-5" />
          </Button>

          {/* Night Mode */}
          <Button
            size="icon"
            variant="ghost"
            className={`w-10 h-10 rounded-full hover:bg-white/10 ${nightMode ? 'text-yellow-500' : 'text-foreground'}`}
            onClick={() => setNightMode(!nightMode)}
          >
            <Moon className="w-5 h-5" />
          </Button>

          {/* Cloud/Storage */}
          <Button
            size="icon"
            variant="ghost"
            className="w-10 h-10 rounded-full hover:bg-white/10 text-foreground"
          >
            <Cloud className="w-5 h-5" />
          </Button>

          {/* Photo Filters */}
          <Button
            size="icon"
            variant="ghost"
            className="w-10 h-10 rounded-full hover:bg-white/10 text-yellow-500"
            onClick={() => setShowPhotoFilters(true)}
          >
            <Sparkles className="w-5 h-5" />
          </Button>

          {/* Face Filters */}
          <Button
            size="icon"
            variant="ghost"
            className="w-10 h-10 rounded-full hover:bg-white/10 text-yellow-500"
            onClick={() => setShowFaceFilters(true)}
          >
            <Smile className="w-5 h-5" />
          </Button>

          {/* Close */}
          <Button
            size="icon"
            variant="ghost"
            className="w-10 h-10 rounded-full hover:bg-white/10 text-foreground"
            onClick={onClose}
          >
            <X className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </>
  );
};

export default QuickActionsBar;
