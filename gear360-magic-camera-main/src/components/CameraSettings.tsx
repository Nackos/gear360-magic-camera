import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Settings, Camera, Image, Wifi, RotateCcw } from "lucide-react";

export const CameraSettings = () => {
  const [settings, setSettings] = useState({
    quality: "ultra",
    iso: [800],
    whiteBalance: "auto",
    exposure: [0],
    sharpness: [50],
    saturation: [50],
    autoFocus: true,
    imageStabilization: true,
    gridLines: false,
    gpsTagging: true
  });

  const handleReset = () => {
    setSettings({
      quality: "ultra",
      iso: [800],
      whiteBalance: "auto",
      exposure: [0],
      sharpness: [50],
      saturation: [50],
      autoFocus: true,
      imageStabilization: true,
      gridLines: false,
      gpsTagging: true
    });
  };

  return (
    <Card className="p-6">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-samsung-blue" />
            <h3 className="text-lg font-semibold">Paramètres Caméra</h3>
          </div>
          <Button variant="outline" size="sm" onClick={handleReset}>
            <RotateCcw className="w-4 h-4 mr-2" />
            Reset
          </Button>
        </div>

        {/* Image Quality */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Image className="w-4 h-4" />
            <Label className="font-medium">Qualité d'Image</Label>
          </div>
          <Select value={settings.quality} onValueChange={(value) => setSettings({...settings, quality: value})}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="basic">Basique (6MP)</SelectItem>
              <SelectItem value="high">Haute (10MP)</SelectItem>
              <SelectItem value="ultra">Ultra (14MP)</SelectItem>
              <SelectItem value="raw">RAW + JPEG</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Separator />

        {/* Manual Controls */}
        <div className="space-y-6">
          <Label className="font-medium">Contrôles Manuels</Label>
          
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-2">
                <Label className="text-sm">ISO</Label>
                <span className="text-sm text-muted-foreground">{settings.iso[0]}</span>
              </div>
              <Slider
                value={settings.iso}
                onValueChange={(value) => setSettings({...settings, iso: value})}
                max={3200}
                min={100}
                step={100}
                className="w-full"
              />
            </div>

            <div>
              <div className="flex justify-between mb-2">
                <Label className="text-sm">Exposition</Label>
                <span className="text-sm text-muted-foreground">
                  {settings.exposure[0] > 0 ? '+' : ''}{settings.exposure[0]} EV
                </span>
              </div>
              <Slider
                value={settings.exposure}
                onValueChange={(value) => setSettings({...settings, exposure: value})}
                max={3}
                min={-3}
                step={0.5}
                className="w-full"
              />
            </div>

            <div>
              <Label className="text-sm mb-2 block">Balance des Blancs</Label>
              <Select value={settings.whiteBalance} onValueChange={(value) => setSettings({...settings, whiteBalance: value})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="auto">Automatique</SelectItem>
                  <SelectItem value="daylight">Lumière du jour</SelectItem>
                  <SelectItem value="cloudy">Nuageux</SelectItem>
                  <SelectItem value="tungsten">Tungstène</SelectItem>
                  <SelectItem value="fluorescent">Fluorescent</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <Separator />

        {/* Enhancement Settings */}
        <div className="space-y-6">
          <Label className="font-medium">Améliorations</Label>
          
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-2">
                <Label className="text-sm">Netteté</Label>
                <span className="text-sm text-muted-foreground">{settings.sharpness[0]}%</span>
              </div>
              <Slider
                value={settings.sharpness}
                onValueChange={(value) => setSettings({...settings, sharpness: value})}
                max={100}
                min={0}
                step={5}
                className="w-full"
              />
            </div>

            <div>
              <div className="flex justify-between mb-2">
                <Label className="text-sm">Saturation</Label>
                <span className="text-sm text-muted-foreground">{settings.saturation[0]}%</span>
              </div>
              <Slider
                value={settings.saturation}
                onValueChange={(value) => setSettings({...settings, saturation: value})}
                max={100}
                min={0}
                step={5}
                className="w-full"
              />
            </div>
          </div>
        </div>

        <Separator />

        {/* Toggle Settings */}
        <div className="space-y-4">
          <Label className="font-medium">Options</Label>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label className="text-sm">Mise au point automatique</Label>
                <p className="text-xs text-muted-foreground">Focus automatique continu</p>
              </div>
              <Switch
                checked={settings.autoFocus}
                onCheckedChange={(checked) => setSettings({...settings, autoFocus: checked})}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label className="text-sm">Stabilisation d'image</Label>
                <p className="text-xs text-muted-foreground">Réduction des tremblements</p>
              </div>
              <Switch
                checked={settings.imageStabilization}
                onCheckedChange={(checked) => setSettings({...settings, imageStabilization: checked})}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label className="text-sm">Lignes de grille</Label>
                <p className="text-xs text-muted-foreground">Aide à la composition</p>
              </div>
              <Switch
                checked={settings.gridLines}
                onCheckedChange={(checked) => setSettings({...settings, gridLines: checked})}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label className="text-sm">Géolocalisation</Label>
                <p className="text-xs text-muted-foreground">Ajouter les coordonnées GPS</p>
              </div>
              <Switch
                checked={settings.gpsTagging}
                onCheckedChange={(checked) => setSettings({...settings, gpsTagging: checked})}
              />
            </div>
          </div>
        </div>

        <Button className="w-full bg-samsung-gradient">
          <Camera className="w-4 h-4 mr-2" />
          Appliquer les paramètres
        </Button>
      </div>
    </Card>
  );
};