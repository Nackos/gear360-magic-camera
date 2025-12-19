import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RotateCcw, RotateCw, ZoomIn, ZoomOut, FullscreenIcon } from "lucide-react";
import sample360 from "@/assets/360-sample.jpg";

export const PreviewViewer = () => {
  const [rotation, setRotation] = useState(0);
  const [zoom, setZoom] = useState(1);

  return (
    <Card className="p-0 overflow-hidden bg-camera-preview shadow-preview">
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

        {/* Live Preview Badge */}
        <div className="absolute top-4 right-4">
          <div className="flex items-center gap-2 bg-black/40 backdrop-blur-sm px-3 py-1 rounded-full">
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
            <span className="text-white text-sm">Live</span>
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
    </Card>
  );
};