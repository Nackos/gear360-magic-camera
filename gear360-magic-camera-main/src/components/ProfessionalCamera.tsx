import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { 
  Camera, 
  Video, 
  Settings, 
  Zap, 
  ZapOff, 
  Timer, 
  Grid3x3,
  X,
  RotateCw,
  Sparkles,
  User,
  Image as ImageIcon,
  Plus,
  RotateCcw,
  ZoomIn,
  ZoomOut,
  FullscreenIcon
} from "lucide-react";
import { cn } from "@/lib/utils";
import sample360 from "@/assets/360-sample.jpg";

export const ProfessionalCamera = () => {
  const [captureMode, setCaptureMode] = useState<"pro" | "portrait" | "photo" | "video" | "plus">("photo");
  const [flashMode, setFlashMode] = useState<"off" | "on" | "auto">("off");
  const [timerMode, setTimerMode] = useState<0 | 3 | 10>(0);
  const [zoomLevel, setZoomLevel] = useState<0.6 | 1 | 2 | 3 | 10>(1);
  const [resolution, setResolution] = useState<"Full" | "12M">("12M");
  const [gridVisible, setGridVisible] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [aiActive, setAiActive] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [zoom, setZoom] = useState(1);
  const videoRef = useRef<HTMLVideoElement>(null);

  const modes = [
    { id: "pro", label: "PRO", icon: Settings },
    { id: "portrait", label: "PORTRAIT", icon: User },
    { id: "photo", label: "PHOTO", icon: Camera },
    { id: "video", label: "VIDÉO", icon: Video },
    { id: "plus", label: "PLUS", icon: Plus }
  ] as const;

  const zoomLevels = [0.6, 1, 2, 3, 10] as const;

  const handleCapture = () => {
    if (captureMode === "video") {
      setIsRecording(!isRecording);
    } else {
      // Photo capture logic
      console.log("Photo captured");
    }
  };

  return (
    <div className="relative h-full w-full bg-black overflow-hidden flex flex-col">
      {/* Video Preview */}
      <div className="absolute inset-0 bg-black">
        <video
          ref={videoRef}
          autoPlay
          muted
          playsInline
          className="w-full h-full object-cover"
        />
        
        {/* Grid Overlay */}
        {gridVisible && (
          <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 pointer-events-none">
            {[...Array(9)].map((_, i) => (
              <div key={i} className="border border-white/20" />
            ))}
          </div>
        )}

        {/* Center Crosshair */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
          <div className="relative w-24 h-24">
            <div className="absolute inset-0 rounded-full border-2 border-white/40" />
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-0.5 bg-white/60" />
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-0.5 h-4 bg-white/60" />
          </div>
        </div>
      </div>

      {/* Top Toolbar */}
      <div className="relative z-10 flex items-center justify-between px-4 py-3">
        {/* Flash Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="text-white hover:bg-white/10"
            >
              {flashMode === "off" ? (
                <ZapOff className="w-5 h-5" />
              ) : (
                <Zap className="w-5 h-5" fill={flashMode === "on" ? "currentColor" : "none"} />
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="bg-black/90 border-white/20 text-white">
            <DropdownMenuItem onClick={() => setFlashMode("off")} className="hover:bg-white/10">
              <ZapOff className="w-4 h-4 mr-2" /> Désactivé
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setFlashMode("auto")} className="hover:bg-white/10">
              <Zap className="w-4 h-4 mr-2" /> Auto
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setFlashMode("on")} className="hover:bg-white/10">
              <Zap className="w-4 h-4 mr-2" fill="currentColor" /> Activé
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <div className="flex items-center gap-3">
          {/* Resolution Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Badge variant="outline" className="bg-black/40 border-white/20 text-white cursor-pointer hover:bg-black/60">
                {resolution}
              </Badge>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-black/90 border-white/20 text-white">
              <DropdownMenuItem onClick={() => setResolution("Full")} className="hover:bg-white/10">
                Full
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setResolution("12M")} className="hover:bg-white/10">
                12M
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Timer Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="text-yellow-400 hover:bg-white/10 relative"
              >
                <Timer className="w-5 h-5" />
                {timerMode > 0 && (
                  <span className="absolute -top-1 -right-1 text-xs bg-yellow-400 text-black rounded-full w-4 h-4 flex items-center justify-center">
                    {timerMode}
                  </span>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-black/90 border-white/20 text-white">
              <DropdownMenuItem onClick={() => setTimerMode(0)} className="hover:bg-white/10">
                Pas de minuteur
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTimerMode(3)} className="hover:bg-white/10">
                3 secondes
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTimerMode(10)} className="hover:bg-white/10">
                10 secondes
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button
            variant="ghost"
            size="icon"
            className="text-white hover:bg-white/10"
            onClick={() => setGridVisible(!gridVisible)}
          >
            <Grid3x3 className="w-5 h-5" />
          </Button>

          {/* AI Button */}
          <Button
            variant="ghost"
            size="icon"
            className={cn(
              "hover:bg-white/10",
              aiActive ? "text-yellow-400" : "text-white"
            )}
            onClick={() => setAiActive(!aiActive)}
          >
            <Sparkles className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* Middle Controls - Zoom Levels */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 translate-y-32 z-10">
        <div className="flex items-center gap-3 bg-black/60 backdrop-blur-sm rounded-full px-4 py-2">
          {zoomLevels.map((level) => (
            <Button
              key={level}
              variant="ghost"
              size="sm"
              className={cn(
                "text-white hover:bg-white/20 rounded-full min-w-[2.5rem]",
                zoomLevel === level && "bg-white/30"
              )}
              onClick={() => setZoomLevel(level)}
            >
              {level === 1 ? "1×" : level}
            </Button>
          ))}
          <Button
            variant="ghost"
            size="icon"
            className="text-white hover:bg-white/20 rounded-full w-8 h-8"
          >
            <Grid3x3 className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Bottom Toolbar */}
      <div className="relative z-10 mt-auto">
        {/* Secondary Controls */}
        <div className="flex items-center justify-center gap-4 px-4 py-2">
          <Button
            variant="ghost"
            size="icon"
            className="text-white hover:bg-white/10"
          >
            <Settings className="w-5 h-5" />
          </Button>
          
          <Badge variant="outline" className="bg-black/40 border-white/20 text-white">
            {resolution}
          </Badge>
          
          <Button
            variant="ghost"
            size="icon"
            className="text-yellow-400 hover:bg-white/10"
          >
            <Video className="w-5 h-5" />
          </Button>
          
          <Button
            variant="ghost"
            size="icon"
            className="text-white hover:bg-white/10"
          >
            <div className="w-5 h-5 rounded-full border border-white/50" />
          </Button>
          
          <Button
            variant="ghost"
            size="icon"
            className="text-white hover:bg-white/10"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Main Controls */}
        <div className="flex items-center justify-between px-6 py-4">
          {/* Last Photo Thumbnail - Opens preview */}
          <button
            onClick={() => setPreviewOpen(true)}
            className="w-14 h-14 rounded-full bg-white/10 backdrop-blur-sm border-2 border-white/30 overflow-hidden hover:scale-105 transition-transform"
          >
            <img src={sample360} alt="Last capture" className="w-full h-full object-cover" />
          </button>

          {/* Capture Button */}
          <Button
            onClick={handleCapture}
            className={cn(
              "w-20 h-20 rounded-full bg-white hover:bg-white/90 p-0 border-4 border-white/30 transition-all",
              isRecording && "bg-red-500 hover:bg-red-600"
            )}
          >
            {isRecording && captureMode === "video" ? (
              <div className="w-6 h-6 bg-white rounded-sm" />
            ) : (
              <div className="w-full h-full" />
            )}
          </Button>

          {/* Rotate Camera */}
          <Button
            variant="ghost"
            size="icon"
            className="text-white hover:bg-white/10 w-14 h-14"
          >
            <RotateCw className="w-6 h-6" />
          </Button>
        </div>

        {/* Mode Selector */}
        <div className="flex items-center justify-around px-4 py-3 bg-black/60 backdrop-blur-sm">
          {modes.map((mode) => (
            <Button
              key={mode.id}
              variant="ghost"
              onClick={() => setCaptureMode(mode.id)}
              className={cn(
                "flex flex-col items-center gap-1 text-white/70 hover:text-white hover:bg-transparent",
                captureMode === mode.id && "text-white font-semibold"
              )}
            >
              <span className="text-xs tracking-wider">{mode.label}</span>
            </Button>
          ))}
        </div>
      </div>

      {/* Preview Dialog */}
      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="max-w-4xl p-0 bg-black">
          <div className="relative">
            {/* 360° Preview */}
            <div className="relative aspect-video bg-gradient-to-r from-slate-900 to-slate-800">
              <img
                src={sample360}
                alt="360° Preview"
                className="w-full h-full object-cover transition-transform duration-300"
                style={{
                  transform: `rotate(${rotation}deg) scale(${zoom})`,
                }}
              />
              
              {/* Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
              
              {/* 360° Badge */}
              <div className="absolute top-4 left-4">
                <div className="bg-samsung-blue text-white px-3 py-1 rounded-full text-sm font-medium">
                  360°
                </div>
              </div>

              {/* Navigation Hint */}
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
                <div className="bg-black/40 backdrop-blur-sm px-4 py-2 rounded-full">
                  <span className="text-white text-sm">Drag to explore • Pinch to zoom</span>
                </div>
              </div>
            </div>

            {/* Controls */}
            <div className="p-4 bg-card">
              <div className="flex items-center justify-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setRotation(rotation - 90)}
                >
                  <RotateCcw className="w-4 h-4" />
                </Button>
                
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setZoom(Math.max(0.5, zoom - 0.25))}
                >
                  <ZoomOut className="w-4 h-4" />
                </Button>
                
                <Button
                  variant="outline"
                  onClick={() => {
                    setRotation(0);
                    setZoom(1);
                  }}
                  className="px-4"
                >
                  Reset View
                </Button>
                
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setZoom(Math.min(3, zoom + 0.25))}
                >
                  <ZoomIn className="w-4 h-4" />
                </Button>
                
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setRotation(rotation + 90)}
                >
                  <RotateCw className="w-4 h-4" />
                </Button>
                
                <Button variant="outline" size="icon">
                  <FullscreenIcon className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
