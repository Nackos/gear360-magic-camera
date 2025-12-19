import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import ModeCard from "@/components/modes/ModeCard";

const Modes = () => {
  const modes = [
    { id: "expert-raw", label: "EXPERT RAW", icon: "RAW", badge: true },
    { id: "video-pro", label: "VIDÉO PRO", icon: "▶" },
    { id: "night", label: "NUIT", icon: "🌙" },
    { id: "food", label: "NOURRITURE", icon: "🍴" },
    { id: "panorama", label: "PANORAMA", icon: "⌒" },
    { id: "super-slow", label: "SUPER RALENTI", icon: "⊙" },
    { id: "slow-motion", label: "RALENTI", icon: "◉" },
    { id: "hyperlapse", label: "HYPERLAPSE", icon: "⊕" },
    { id: "video-portrait", label: "VIDÉO PORTRAIT", icon: "◎" },
    { id: "director", label: "VUE DU RÉALISATEUR", icon: "▶" },
    { id: "single-take", label: "SINGLE TAKE", icon: "◉" },
  ];

  return (
    <div className="min-h-screen bg-background/95 backdrop-blur-xl">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="flex items-center justify-between px-4 py-4">
          <Link to="/">
            <Button variant="ghost" size="icon" className="rounded-full">
              <ArrowLeft className="w-6 h-6" />
            </Button>
          </Link>
          <h1 className="text-lg font-medium">Modes de capture</h1>
          <Button variant="ghost" className="text-sm">
            Modifier
          </Button>
        </div>
      </div>

      {/* Modes Grid */}
      <div className="p-6 grid grid-cols-3 gap-4">
        {modes.map((mode) => (
          <ModeCard
            key={mode.id}
            label={mode.label}
            icon={mode.icon}
            badge={mode.badge}
          />
        ))}
      </div>
    </div>
  );
};

export default Modes;
