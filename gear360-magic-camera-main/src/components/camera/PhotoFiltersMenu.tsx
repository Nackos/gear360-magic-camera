import { ArrowLeft, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

interface PhotoFiltersMenuProps {
  onBack: () => void;
  onClose: () => void;
}

const PhotoFiltersMenu = ({ onBack, onClose }: PhotoFiltersMenuProps) => {
  const [selectedFilter, setSelectedFilter] = useState<string | null>(null);

  const filters = [
    { id: "none", name: "Aucun", preview: "bg-gradient-to-br from-gray-400 to-gray-600" },
    { id: "vivid", name: "Vif", preview: "bg-gradient-to-br from-red-500 to-pink-500" },
    { id: "warm", name: "Chaud", preview: "bg-gradient-to-br from-orange-400 to-yellow-500" },
    { id: "cool", name: "Frais", preview: "bg-gradient-to-br from-blue-400 to-cyan-500" },
    { id: "mono", name: "Mono", preview: "bg-gradient-to-br from-gray-700 to-gray-900" },
    { id: "vintage", name: "Vintage", preview: "bg-gradient-to-br from-amber-600 to-orange-700" },
    { id: "dramatic", name: "Dramatique", preview: "bg-gradient-to-br from-purple-700 to-indigo-900" },
    { id: "noir", name: "Noir", preview: "bg-gradient-to-br from-black to-gray-800" },
    { id: "pastel", name: "Pastel", preview: "bg-gradient-to-br from-pink-200 to-blue-200" },
    { id: "sepia", name: "Sépia", preview: "bg-gradient-to-br from-amber-700 to-orange-800" },
    { id: "pop", name: "Pop", preview: "bg-gradient-to-br from-fuchsia-500 to-purple-600" },
    { id: "natural", name: "Naturel", preview: "bg-gradient-to-br from-green-400 to-emerald-600" },
  ];

  return (
    <>
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/70 backdrop-blur-sm z-40"
        onClick={onClose}
      />
      
      {/* Menu */}
      <div className="absolute inset-x-4 top-20 bottom-32 z-50 bg-camera-overlay/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/10 animate-in slide-in-from-top-4 duration-300 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <Button
            size="icon"
            variant="ghost"
            onClick={onBack}
            className="w-10 h-10 rounded-full hover:bg-white/10"
          >
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </Button>
          <h2 className="text-lg font-semibold text-foreground">Filtres photo</h2>
          <div className="w-10" />
        </div>

        {/* Filters Grid */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="grid grid-cols-3 gap-4">
            {filters.map((filter) => (
              <button
                key={filter.id}
                onClick={() => setSelectedFilter(filter.id)}
                className="relative flex flex-col items-center gap-2 group"
              >
                <div className={`w-full aspect-square rounded-2xl ${filter.preview} relative overflow-hidden shadow-lg transition-transform group-hover:scale-105 ${
                  selectedFilter === filter.id ? 'ring-2 ring-primary ring-offset-2 ring-offset-camera-overlay' : ''
                }`}>
                  {selectedFilter === filter.id && (
                    <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                      <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                        <Check className="w-5 h-5 text-background" />
                      </div>
                    </div>
                  )}
                </div>
                <span className={`text-xs font-medium transition-colors ${
                  selectedFilter === filter.id ? 'text-primary' : 'text-foreground'
                }`}>
                  {filter.name}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-white/10">
          <Button
            onClick={onClose}
            className="w-full h-12 rounded-full bg-primary text-primary-foreground hover:bg-primary/90"
          >
            Appliquer
          </Button>
        </div>
      </div>
    </>
  );
};

export default PhotoFiltersMenu;
