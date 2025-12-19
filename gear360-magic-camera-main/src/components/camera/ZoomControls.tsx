import { Button } from "@/components/ui/button";
import { Grid } from "lucide-react";

interface ZoomControlsProps {
  zoom: number;
  onZoomChange: (zoom: number) => void;
}

const ZoomControls = ({ zoom, onZoomChange }: ZoomControlsProps) => {
  const zoomLevels = [0.6, 1, 2, 3, 10];

  return (
    <div className="absolute bottom-48 left-1/2 -translate-x-1/2 flex items-center gap-2">
      <div className="flex items-center gap-1 px-4 py-2 bg-secondary/80 backdrop-blur-md rounded-full">
        {zoomLevels.map((level) => (
          <button
            key={level}
            onClick={() => onZoomChange(level)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              zoom === level
                ? "bg-foreground text-background"
                : "text-foreground hover:bg-foreground/10"
            }`}
          >
            {level === 0.6 ? ".6" : level}x
          </button>
        ))}
      </div>
      <Button
        size="icon"
        variant="ghost"
        className="w-12 h-12 rounded-full bg-secondary/80 backdrop-blur-md hover:bg-secondary"
      >
        <Grid className="w-5 h-5 text-foreground" />
      </Button>
    </div>
  );
};

export default ZoomControls;
