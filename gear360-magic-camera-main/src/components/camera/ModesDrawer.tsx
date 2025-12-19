import { Eye } from "lucide-react";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerClose,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";

interface ModesDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onModeSelect: (modeId: string, modeLabel: string) => void;
}

const ModesDrawer = ({ isOpen, onClose, onModeSelect }: ModesDrawerProps) => {
  const handleModeClick = (modeId: string, modeLabel: string) => {
    onModeSelect(modeId, modeLabel);
    onClose();
  };
  const modes = [
    { id: "expert-raw", label: "EXPERT RAW", icon: "RAW", hasDownload: true },
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
    <Drawer open={isOpen} onOpenChange={onClose}>
      <DrawerContent className="bg-secondary/95 backdrop-blur-xl border-t border-border/50">
        <div className="mx-auto w-full max-w-sm pb-8">
          <DrawerHeader className="flex items-center justify-between px-6 pt-4">
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full w-12 h-12 bg-secondary/80"
            >
              <Eye className="w-5 h-5" />
            </Button>
            <DrawerClose asChild>
              <Button variant="ghost" className="text-sm text-primary">
                Modifier
              </Button>
            </DrawerClose>
          </DrawerHeader>

          {/* Modes Grid */}
          <div className="px-6 pt-4 grid grid-cols-4 gap-4">
            {modes.map((mode) => (
              <button
                key={mode.id}
                className="flex flex-col items-center gap-2 group"
                onClick={() => handleModeClick(mode.id, mode.label)}
              >
                {/* Icon Container */}
                <div className="relative w-16 h-16 rounded-full bg-card/50 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <span className="text-2xl">{mode.icon}</span>
                  {mode.hasDownload && (
                    <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-background flex items-center justify-center">
                      <span className="text-xs">↓</span>
                    </div>
                  )}
                </div>

                {/* Label */}
                <span className="text-[10px] text-center font-medium leading-tight text-foreground/90">
                  {mode.label}
                </span>
              </button>
            ))}
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
};

export default ModesDrawer;
