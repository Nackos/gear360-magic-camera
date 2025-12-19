import { useState } from "react";
import { Smile, Droplet, Circle, Waves, Eye, ArrowLeft } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";

interface FaceFiltersMenuProps {
  onBack: () => void;
  onClose: () => void;
}

interface FilterControl {
  icon: React.ElementType;
  label: string;
  sliderLabel: string;
  value: number;
}

const FaceFiltersMenu = ({ onBack, onClose }: FaceFiltersMenuProps) => {
  const [activeFilter, setActiveFilter] = useState(0);
  const [filters, setFilters] = useState<FilterControl[]>([
    { icon: Smile, label: "On", sliderLabel: "Finesse", value: 2 },
    { icon: Droplet, label: "2", sliderLabel: "Teint", value: 2 },
    { icon: Circle, label: "0", sliderLabel: "Forme", value: 0 },
    { icon: Waves, label: "0", sliderLabel: "Mâchoire", value: 0 },
    { icon: Eye, label: "0", sliderLabel: "Yeux", value: 0 },
  ]);

  const handleFilterChange = (index: number, newValue: number) => {
    const newFilters = [...filters];
    newFilters[index].value = newValue;
    newFilters[index].label = index === 0 ? (newValue > 0 ? "On" : "Off") : newValue.toString();
    setFilters(newFilters);
  };

  const activeFilterData = filters[activeFilter];

  return (
    <>
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm z-40"
        onClick={onClose}
      />
      
      {/* Menu */}
      <div className="absolute bottom-0 left-0 right-0 z-50 bg-camera-overlay/95 backdrop-blur-xl rounded-t-3xl p-6 pb-8 shadow-2xl border-t border-white/10 animate-in slide-in-from-bottom duration-300">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full hover:bg-white/10"
            onClick={onBack}
          >
            <ArrowLeft className="w-6 h-6" />
          </Button>
          <h2 className="text-lg font-semibold">Filtres de visage</h2>
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full hover:bg-white/10"
            onClick={onClose}
          >
            <span className="text-xl">×</span>
          </Button>
        </div>

        {/* Filter Controls */}
        <div className="flex items-center justify-center gap-6 mb-8">
          {filters.map((filter, index) => (
            <button
              key={index}
              onClick={() => setActiveFilter(index)}
              className="flex flex-col items-center gap-2 transition-all"
            >
              <div
                className={`w-14 h-14 rounded-full flex items-center justify-center transition-all ${
                  activeFilter === index
                    ? "bg-primary text-camera-overlay scale-110"
                    : filter.value > 0
                    ? "bg-camera-overlay border-2 border-primary text-primary"
                    : "bg-camera-overlay border-2 border-foreground text-foreground"
                }`}
              >
                <filter.icon className="w-6 h-6" />
              </div>
              <span 
                className={`text-sm font-medium ${
                  activeFilter === index || filter.value > 0 
                    ? "text-primary" 
                    : "text-foreground"
                }`}
              >
                {filter.label}
              </span>
            </button>
          ))}
        </div>

        {/* Slider Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between px-2">
            <span className="text-sm text-foreground">{activeFilterData.sliderLabel}</span>
            <span className="text-lg text-primary font-semibold">
              {activeFilterData.value}
            </span>
          </div>
          
          <div className="px-2">
            <Slider
              value={[activeFilterData.value]}
              onValueChange={(value) => handleFilterChange(activeFilter, value[0])}
              max={activeFilter === 0 ? 5 : 10}
              min={0}
              step={1}
              className="w-full"
            />
          </div>

          {/* Slider marks */}
          <div className="flex items-center justify-between px-2">
            <span className="text-xs text-muted-foreground">0</span>
            <span className="text-xs text-muted-foreground">
              {activeFilter === 0 ? "5" : "10"}
            </span>
          </div>
        </div>
      </div>
    </>
  );
};

export default FaceFiltersMenu;
