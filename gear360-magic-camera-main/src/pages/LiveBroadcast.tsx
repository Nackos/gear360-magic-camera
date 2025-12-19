import { ArrowLeft, Radio, Youtube, Facebook, Instagram, Settings as SettingsIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useState } from "react";

const LiveBroadcast = () => {
  const navigate = useNavigate();
  const [isLive, setIsLive] = useState(false);

  const platforms = [
    { name: "YouTube", icon: Youtube, connected: true },
    { name: "Facebook", icon: Facebook, connected: false },
    { name: "Instagram", icon: Instagram, connected: false },
  ];

  const handleStartLive = () => {
    setIsLive(!isLive);
    toast.success(isLive ? "Diffusion arrêtée" : "Diffusion en direct démarrée !");
  };

  const handleConnectPlatform = (platform: string) => {
    toast.info(`Connexion à ${platform}...`);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-4 bg-card border-b border-border">
        <button onClick={() => navigate("/")} className="p-2 hover:bg-muted rounded-lg transition-colors">
          <ArrowLeft className="w-6 h-6 text-foreground" />
        </button>
        <h1 className="text-xl font-semibold text-foreground">Diffusion en direct</h1>
        <button className="p-2 hover:bg-muted rounded-lg transition-colors">
          <SettingsIcon className="w-6 h-6 text-foreground" />
        </button>
      </header>

      {/* Live Preview */}
      <div className="flex-1 bg-muted/30 relative flex items-center justify-center">
        <div className="text-center">
          <div className={`w-48 h-48 rounded-full border-4 flex items-center justify-center mx-auto mb-4 ${
            isLive ? 'border-destructive animate-pulse' : 'border-primary/30'
          }`}>
            <Radio className={`w-24 h-24 ${isLive ? 'text-destructive' : 'text-primary'}`} />
          </div>
          {isLive && (
            <div className="inline-flex items-center gap-2 bg-destructive text-destructive-foreground px-4 py-2 rounded-full mb-2">
              <div className="w-3 h-3 bg-white rounded-full animate-pulse" />
              <span className="font-semibold">EN DIRECT</span>
            </div>
          )}
          <p className="text-muted-foreground">
            {isLive ? "Diffusion en cours..." : "Prêt à diffuser"}
          </p>
        </div>
      </div>

      {/* Platforms */}
      <div className="bg-card border-t border-border p-6 space-y-4">
        <h2 className="text-sm font-semibold text-muted-foreground mb-3">Plateformes connectées</h2>
        <div className="space-y-3">
          {platforms.map((platform) => (
            <div key={platform.name} className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-3">
                <platform.icon className="w-6 h-6 text-foreground" />
                <span className="font-medium text-foreground">{platform.name}</span>
              </div>
              {platform.connected ? (
                <span className="text-xs bg-primary/20 text-primary px-3 py-1 rounded-full">
                  Connecté
                </span>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleConnectPlatform(platform.name)}
                >
                  Connecter
                </Button>
              )}
            </div>
          ))}
        </div>

        <Button
          onClick={handleStartLive}
          className={`w-full mt-4 ${isLive ? 'bg-destructive hover:bg-destructive/90' : ''}`}
          size="lg"
        >
          {isLive ? "Arrêter la diffusion" : "Commencer la diffusion"}
        </Button>
      </div>
    </div>
  );
};

export default LiveBroadcast;
