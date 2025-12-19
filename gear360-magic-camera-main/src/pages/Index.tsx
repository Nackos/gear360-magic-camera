import { Camera, Image, Radio, Settings, Battery, MoreVertical, Bluetooth, Wifi, Link2 } from "lucide-react";
import ConnectionIllustration from "@/components/ConnectionIllustration";
import MenuItem from "@/components/MenuItem";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { MultiDeviceConnectionPanel } from "@/components/MultiDeviceConnectionPanel";
import { multiDeviceManager } from "@/services/multiDeviceManager";
import { useEffect, useState } from "react";

const Index = () => {
  const navigate = useNavigate();
  const [connectionCount, setConnectionCount] = useState(0);

  useEffect(() => {
    const updateCount = () => {
      setConnectionCount(multiDeviceManager.getStats().activeConnections);
    };

    updateCount();
    multiDeviceManager.on('deviceConnected', updateCount);
    multiDeviceManager.on('deviceDisconnected', updateCount);

    return () => {
      multiDeviceManager.off('deviceConnected', updateCount);
      multiDeviceManager.off('deviceDisconnected', updateCount);
    };
  }, []);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-border bg-card">
        <h1 className="text-2xl font-bold text-foreground">GEAR 360</h1>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <span>100%</span>
            <Battery className="w-5 h-5" />
          </div>
          <button className="p-2 hover:bg-muted rounded-lg transition-colors">
            <MoreVertical className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>
      </header>

      {/* Connection Illustration */}
      <div className="bg-card border-b border-border">
        <ConnectionIllustration />
        <div className="text-center pb-6 px-6 space-y-3">
          {/* Nouveau panneau multi-appareils */}
          <div className="flex gap-2">
            <MultiDeviceConnectionPanel />
            <Button 
              onClick={() => navigate("/gear360-control")}
              className="flex-1 bg-gradient-to-r from-primary to-accent hover:opacity-90 transition-opacity text-primary-foreground font-semibold py-6"
            >
              <Bluetooth className="w-5 h-5 mr-2" />
              <Wifi className="w-5 h-5 mr-2" />
              Contrôle avancé
            </Button>
          </div>
          
          {/* Indicateur de connexions */}
          {connectionCount > 0 && (
            <div className="flex items-center justify-center gap-2 text-sm text-green-600 bg-green-50 rounded-lg py-2">
              <Link2 className="w-4 h-4" />
              <span>{connectionCount} appareil{connectionCount > 1 ? 's' : ''} connecté{connectionCount > 1 ? 's' : ''}</span>
            </div>
          )}
          
          <div className="flex items-center justify-end text-sm text-muted-foreground">
            <span>100%</span>
            <Battery className="w-5 h-5 ml-1" />
          </div>
        </div>
      </div>

      {/* Menu Items */}
      <main className="bg-background">
        <MenuItem
          icon={Camera}
          title="Caméra"
          description="Prenez des photos et vidéos à 360°."
          onClick={() => navigate("/camera")}
        />
        <MenuItem
          icon={Image}
          title="Galerie"
          description="Consultez vos photos et vidéos."
          onClick={() => navigate("/gallery")}
        />
        <MenuItem
          icon={Radio}
          title="Diffusion en direct"
          description="Diffusez-vous en direct."
          onClick={() => navigate("/live")}
        />
        <MenuItem
          icon={Settings}
          title="Paramètres"
          description="Configurez votre appareil."
          onClick={() => navigate("/settings")}
        />
        <MenuItem
          icon={Camera}
          title="Studio 3D IA"
          description="Générez des mondes 3D immersifs avec l'IA."
          onClick={() => navigate("/ai-3d-studio")}
          className="border-b-0"
        />
      </main>
    </div>
  );
};

export default Index;
