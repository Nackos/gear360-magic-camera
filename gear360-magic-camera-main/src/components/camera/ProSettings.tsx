import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";

interface ProSettingsProps {
  isOpen: boolean;
  onClose: () => void;
  flash: 'off' | 'on' | 'auto';
  setFlash: (value: 'off' | 'on' | 'auto') => void;
  timer: number;
  setTimer: (value: number) => void;
  burstMode: boolean;
  setBurstMode: (value: boolean) => void;
  hdr: boolean;
  setHdr: (value: boolean) => void;
  whiteBalance: 'auto' | 'daylight' | 'cloudy' | 'tungsten';
  setWhiteBalance: (value: 'auto' | 'daylight' | 'cloudy' | 'tungsten') => void;
  iso: number;
  setIso: (value: number) => void;
  exposure: number;
  setExposure: (value: number) => void;
  shutterSpeed: string;
  setShutterSpeed: (value: string) => void;
  resolution: '4K' | '1080p' | '720p';
  setResolution: (value: '4K' | '1080p' | '720p') => void;
  fps: 30 | 60 | 120;
  setFps: (value: 30 | 60 | 120) => void;
}

export const ProSettings = ({
  isOpen,
  onClose,
  flash,
  setFlash,
  timer,
  setTimer,
  burstMode,
  setBurstMode,
  hdr,
  setHdr,
  whiteBalance,
  setWhiteBalance,
  iso,
  setIso,
  exposure,
  setExposure,
  shutterSpeed,
  setShutterSpeed,
  resolution,
  setResolution,
  fps,
  setFps
}: ProSettingsProps) => {
  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="bottom" className="h-[80vh] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Paramètres Professionnels</SheetTitle>
        </SheetHeader>
        
        <div className="space-y-6 mt-6">
          {/* Flash */}
          <div>
            <Label className="text-sm font-medium mb-2 block">Flash</Label>
            <Select value={flash} onValueChange={(v: 'off' | 'on' | 'auto') => setFlash(v)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="off">Désactivé</SelectItem>
                <SelectItem value="on">Activé</SelectItem>
                <SelectItem value="auto">Automatique</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Separator />

          {/* Timer */}
          <div>
            <Label className="text-sm font-medium mb-2 block">Minuteur</Label>
            <Select value={timer.toString()} onValueChange={(v) => setTimer(parseInt(v))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0">Désactivé</SelectItem>
                <SelectItem value="3">3 secondes</SelectItem>
                <SelectItem value="5">5 secondes</SelectItem>
                <SelectItem value="10">10 secondes</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Separator />

          {/* Burst Mode & HDR */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-sm">Mode rafale (5 photos)</Label>
              <Switch checked={burstMode} onCheckedChange={setBurstMode} />
            </div>
            <div className="flex items-center justify-between">
              <Label className="text-sm">HDR</Label>
              <Switch checked={hdr} onCheckedChange={setHdr} />
            </div>
          </div>

          <Separator />

          {/* White Balance */}
          <div>
            <Label className="text-sm font-medium mb-2 block">Balance des blancs</Label>
            <Select value={whiteBalance} onValueChange={(v: any) => setWhiteBalance(v)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="auto">Automatique</SelectItem>
                <SelectItem value="daylight">Lumière du jour</SelectItem>
                <SelectItem value="cloudy">Nuageux</SelectItem>
                <SelectItem value="tungsten">Tungstène</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Separator />

          {/* ISO */}
          <div>
            <div className="flex justify-between mb-2">
              <Label className="text-sm">ISO</Label>
              <span className="text-sm text-muted-foreground">{iso}</span>
            </div>
            <Slider
              value={[iso]}
              onValueChange={(v) => setIso(v[0])}
              min={100}
              max={3200}
              step={100}
            />
          </div>

          <Separator />

          {/* Exposure */}
          <div>
            <div className="flex justify-between mb-2">
              <Label className="text-sm">Exposition</Label>
              <span className="text-sm text-muted-foreground">{exposure > 0 ? '+' : ''}{exposure} EV</span>
            </div>
            <Slider
              value={[exposure]}
              onValueChange={(v) => setExposure(v[0])}
              min={-3}
              max={3}
              step={0.5}
            />
          </div>

          <Separator />

          {/* Shutter Speed */}
          <div>
            <Label className="text-sm font-medium mb-2 block">Vitesse d'obturation</Label>
            <Select value={shutterSpeed} onValueChange={setShutterSpeed}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1/15">1/15s</SelectItem>
                <SelectItem value="1/30">1/30s</SelectItem>
                <SelectItem value="1/60">1/60s</SelectItem>
                <SelectItem value="1/125">1/125s</SelectItem>
                <SelectItem value="1/250">1/250s</SelectItem>
                <SelectItem value="1/500">1/500s</SelectItem>
                <SelectItem value="1/1000">1/1000s</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Separator />

          {/* Resolution */}
          <div>
            <Label className="text-sm font-medium mb-2 block">Résolution vidéo</Label>
            <Select value={resolution} onValueChange={(v: any) => setResolution(v)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="4K">4K (3840x2160)</SelectItem>
                <SelectItem value="1080p">Full HD (1920x1080)</SelectItem>
                <SelectItem value="720p">HD (1280x720)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Separator />

          {/* FPS */}
          <div>
            <Label className="text-sm font-medium mb-2 block">Images par seconde</Label>
            <Select value={fps.toString()} onValueChange={(v) => setFps(parseInt(v) as any)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="30">30 FPS</SelectItem>
                <SelectItem value="60">60 FPS</SelectItem>
                <SelectItem value="120">120 FPS (Slow Motion)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};