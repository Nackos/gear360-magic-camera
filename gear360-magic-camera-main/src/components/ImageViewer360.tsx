import { useState } from "react";
import { ArrowLeft, Share2, Trash2, Heart, Edit, Sparkles, MoreVertical, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

interface ImageViewer360Props {
  image: {
    id: string;
    title: string;
    thumbnail: string;
    dataUrl?: string;
    type: string;
  };
  onClose: () => void;
  onDelete: () => void;
}

type ViewMode = "360" | "panoramic" | "double" | "rounded" | "stretched";

const ImageViewer360 = ({ image, onClose, onDelete }: ImageViewer360Props) => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState<ViewMode>("360");
  const [defaultLens, setDefaultLens] = useState<"front" | "back">("front");
  const [showLensDialog, setShowLensDialog] = useState(false);

  const handleShare = async () => {
    if (navigator.share && image.dataUrl) {
      try {
        const response = await fetch(image.dataUrl);
        const blob = await response.blob();
        const file = new File([blob], `${image.title}.jpg`, { type: blob.type });
        await navigator.share({ files: [file], title: image.title });
        toast({ title: "Partagé avec succès" });
      } catch (error) {
        toast({ title: "Erreur de partage", variant: "destructive" });
      }
    }
  };

  const saveLensPreference = () => {
    localStorage.setItem('default360Lens', defaultLens);
    toast({ title: "Viseur par défaut enregistré", description: `Objectif ${defaultLens === 'front' ? 'avant' : 'arrière'} défini` });
    setShowLensDialog(false);
  };

  const getViewModeStyle = () => {
    switch (viewMode) {
      case "360":
        return "rounded-full w-[90vmin] h-[90vmin] object-cover mx-auto";
      case "panoramic":
        return "w-full h-auto object-contain";
      case "double":
        return "w-full h-[50vh] object-cover";
      case "rounded":
        return "rounded-[3rem] w-full max-w-2xl h-auto object-cover mx-auto";
      case "stretched":
        return "w-full h-[60vh] object-cover";
      default:
        return "rounded-full w-[90vmin] h-[90vmin] object-cover mx-auto";
    }
  };

  const getContainerStyle = () => {
    switch (viewMode) {
      case "panoramic":
        return "bg-gradient-to-b from-blue-400 to-blue-600";
      case "double":
      case "stretched":
        return "bg-gradient-to-b from-blue-500 to-blue-300";
      default:
        return "bg-black";
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-background">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between p-4 bg-gradient-to-b from-black/70 to-transparent">
        <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full text-white hover:bg-white/20">
          <ArrowLeft className="w-6 h-6" />
        </Button>
        <h1 className="text-xl font-semibold text-white">Capturer image</h1>
        <div className="flex gap-2">
          <Button variant="ghost" size="icon" className="rounded-full text-white hover:bg-white/20">
            <RotateCcw className="w-6 h-6" />
          </Button>
          <Button variant="ghost" size="icon" className="rounded-full text-white hover:bg-white/20">
            <Eye className="w-6 h-6" />
          </Button>
          <Button variant="ghost" size="icon" className="rounded-full text-white hover:bg-white/20">
            <MoreVertical className="w-6 h-6" />
          </Button>
        </div>
      </div>

      {/* Image Display */}
      <div className={`w-full h-full flex items-center justify-center p-4 ${getContainerStyle()}`}>
        <img 
          src={image.dataUrl || image.thumbnail} 
          alt={image.title}
          className={getViewModeStyle()}
        />
      </div>

      {/* Pause Button (for 360 view) */}
      {viewMode === "360" && (
        <div className="absolute bottom-32 left-1/2 -translate-x-1/2">
          <Button variant="ghost" size="lg" className="text-white hover:bg-white/20 gap-2">
            <div className="flex gap-1">
              <div className="w-1 h-6 bg-white rounded-full" />
              <div className="w-1 h-6 bg-white rounded-full" />
            </div>
          </Button>
        </div>
      )}

      {/* View Mode Selector */}
      <div className="absolute bottom-16 left-1/2 -translate-x-1/2 w-[95%] max-w-2xl">
        <div className="bg-black/60 backdrop-blur-lg rounded-2xl p-3 flex items-center justify-around">
          <button
            onClick={() => setViewMode("double")}
            className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-colors ${
              viewMode === "double" ? "text-primary" : "text-white/80 hover:text-white"
            }`}
          >
            <div className="flex gap-[2px]">
              <div className="w-6 h-6 border-2 border-current rounded" />
            </div>
            <span className="text-xs">Double</span>
          </button>

          <button
            onClick={() => setViewMode("panoramic")}
            className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-colors ${
              viewMode === "panoramic" ? "text-primary" : "text-white/80 hover:text-white"
            }`}
          >
            <div className="flex gap-1">
              <div className="w-3 h-6 border-2 border-current rounded" />
              <div className="w-3 h-6 border-2 border-current rounded" />
              <div className="w-3 h-6 border-2 border-current rounded" />
            </div>
            <span className="text-xs">Panoramique</span>
          </button>

          <button
            onClick={() => setViewMode("360")}
            className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-colors ${
              viewMode === "360" ? "text-primary" : "text-white/80 hover:text-white"
            }`}
          >
            <div className="w-6 h-6 border-2 border-current rounded-full flex items-center justify-center">
              <div className="text-[8px] font-bold">360°</div>
            </div>
            <span className="text-xs">360°</span>
          </button>

          <button
            onClick={() => setViewMode("rounded")}
            className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-colors ${
              viewMode === "rounded" ? "text-primary" : "text-white/80 hover:text-white"
            }`}
          >
            <div className="w-6 h-6 border-2 border-current rounded-full" />
            <span className="text-xs">Arrondie</span>
          </button>

          <button
            onClick={() => setViewMode("stretched")}
            className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-colors ${
              viewMode === "stretched" ? "text-primary" : "text-white/80 hover:text-white"
            }`}
          >
            <div className="w-6 h-4 border-2 border-current rounded flex items-center justify-center">
              <div className="flex gap-[2px]">
                <div className="w-[2px] h-2 bg-current" />
                <div className="w-[2px] h-2 bg-current" />
              </div>
            </div>
            <span className="text-xs">Étirée</span>
          </button>
        </div>
      </div>

      {/* Bottom Actions */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4 pb-safe">
        <div className="flex items-center justify-around max-w-2xl mx-auto">
          <button 
            onClick={() => navigate('/camera')}
            className="flex flex-col items-center text-white"
          >
            <div className="w-12 h-12 flex items-center justify-center rounded-lg bg-white/10 backdrop-blur-sm border border-white/20">
              <div className="text-primary">📁</div>
            </div>
            <span className="text-xs mt-1">Affich. mouv.</span>
          </button>

          <button 
            onClick={() => setShowLensDialog(!showLensDialog)}
            className="flex flex-col items-center text-white"
          >
            <div className="w-12 h-12 flex items-center justify-center rounded-lg bg-white/10 backdrop-blur-sm border border-white/20">
              <RotateCcw className="w-5 h-5" />
            </div>
            <span className="text-xs mt-1">Réinitialiser</span>
          </button>

          <button 
            className={`flex flex-col items-center ${viewMode === "360" ? "text-primary" : "text-white"}`}
          >
            <div className={`w-12 h-12 flex items-center justify-center rounded-lg backdrop-blur-sm border ${
              viewMode === "360" ? "bg-primary/20 border-primary" : "bg-white/10 border-white/20"
            }`}>
              <div className="text-sm font-bold">360°</div>
            </div>
            <span className="text-xs mt-1">Vue à 360°</span>
          </button>

          <button className="flex flex-col items-center text-white">
            <div className="w-12 h-12 flex items-center justify-center rounded-lg bg-white/10 backdrop-blur-sm border border-white/20">
              <MoreVertical className="w-5 h-5" />
            </div>
          </button>
        </div>
      </div>

      {/* Lens Selection Dialog */}
      {showLensDialog && (
        <div className="absolute inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-20" onClick={() => setShowLensDialog(false)}>
          <div className="bg-background rounded-2xl p-6 max-w-md w-[90%] mx-4" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-semibold mb-4">
              Sélectionnez l'objectif arrière ou avant comme viseur par défaut des photos et des vidéos à 360°.
            </h3>
            
            <div className="space-y-3 mb-6">
              <button
                onClick={() => setDefaultLens("back")}
                className={`w-full flex items-center gap-4 p-4 rounded-lg border transition-colors ${
                  defaultLens === "back" ? "border-primary bg-primary/10" : "border-border hover:border-primary/50"
                }`}
              >
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                  defaultLens === "back" ? "border-primary" : "border-border"
                }`}>
                  {defaultLens === "back" && <div className="w-3 h-3 rounded-full bg-primary" />}
                </div>
                <div className="flex-1">
                  <div className="font-medium text-left">Arrière</div>
                </div>
                {defaultLens === "back" && (
                  <div className="w-16 h-16 bg-muted rounded-lg" />
                )}
              </button>

              <button
                onClick={() => setDefaultLens("front")}
                className={`w-full flex items-center gap-4 p-4 rounded-lg border transition-colors ${
                  defaultLens === "front" ? "border-primary bg-primary/10" : "border-border hover:border-primary/50"
                }`}
              >
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                  defaultLens === "front" ? "border-primary" : "border-border"
                }`}>
                  {defaultLens === "front" && <div className="w-3 h-3 rounded-full bg-primary" />}
                </div>
                <div className="flex-1">
                  <div className="font-medium text-left">Avant</div>
                </div>
                {defaultLens === "front" && (
                  <div className="w-16 h-16 bg-muted rounded-lg" />
                )}
              </button>
            </div>

            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setShowLensDialog(false)} className="flex-1">
                Annuler
              </Button>
              <Button onClick={saveLensPreference} className="flex-1">
                Enregistrer
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Add missing Eye import
import { Eye } from "lucide-react";

export default ImageViewer360;
