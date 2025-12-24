import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Camera, Video, Settings, Wifi, Battery, Circle, Sparkles, Eye, Brain, User, Scan } from "lucide-react";
import { FaceDetection } from "./FaceDetection";
import { AIFilters } from "./AIFilters";
import { AIVoiceAssistant } from "./AIVoiceAssistant";
import { AIIntelligentManager } from "./AIIntelligentManager";
import { HolisticDetection } from "./HolisticDetection";
import { ObjectDetection } from "./ObjectDetection";
import { DeviceConnection } from "./DeviceConnection";
import { gear360Service } from "@/services/gear360Service";
import { toast } from "@/hooks/use-toast";

export const CameraControls = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [captureMode, setCaptureMode] = useState<"photo" | "video">("photo");
  const [faceDetectionActive, setFaceDetectionActive] = useState(false);
  const [holisticDetectionActive, setHolisticDetectionActive] = useState(false);
  const [objectDetectionActive, setObjectDetectionActive] = useState(false);
  const [aiFiltersActive, setAiFiltersActive] = useState(false);
  const [voiceAssistantActive, setVoiceAssistantActive] = useState(false);
  const [intelligentManagerActive, setIntelligentManagerActive] = useState(false);
  const [currentFilter, setCurrentFilter] = useState<string | null>(null);
  const [facesDetected, setFacesDetected] = useState(0);
  const [isConnected, setIsConnected] = useState(false);
  const [deviceStatus, setDeviceStatus] = useState('Disconnected');
  const [batteryLevel, setBatteryLevel] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    // Écouter les événements de connexion
    gear360Service.on('deviceConnected', (device) => {
      setIsConnected(true);
      setDeviceStatus('Connected');
      setBatteryLevel(device.batteryLevel || 0);
      toast({
        title: "Caméra connectée",
        description: `${device.name} est maintenant connectée`,
      });
    });

    gear360Service.on('deviceDisconnected', () => {
      setIsConnected(false);
      setDeviceStatus('Disconnected');
      setBatteryLevel(0);
      toast({
        title: "Caméra déconnectée",
        description: "La connexion à la caméra a été fermée",
      });
    });

    gear360Service.on('connectionError', (error) => {
      toast({
        title: "Erreur de connexion",
        description: "Impossible de se connecter à la caméra",
        variant: "destructive"
      });
    });

    return () => {
      gear360Service.off('deviceConnected', () => { });
      gear360Service.off('deviceDisconnected', () => { });
      gear360Service.off('connectionError', () => { });
    };
  }, []);

  const handleCapture = async () => {
    if (!isConnected) {
      toast({
        title: "Caméra non connectée",
        description: "Connectez-vous d'abord à la caméra",
        variant: "destructive"
      });
      return;
    }

    try {
      if (captureMode === "video") {
        if (isRecording) {
          const videoUrl = await gear360Service.stopVideoRecording();
          setIsRecording(false);
          toast({
            title: "Enregistrement terminé",
            description: "Votre vidéo 360° a été sauvegardée",
          });
        } else {
          const success = await gear360Service.startVideoRecording();
          if (success) {
            setIsRecording(true);
            toast({
              title: "Enregistrement démarré",
              description: "Enregistrement vidéo 360° en cours...",
            });
          }
        }
      } else {
        // Photo capture
        const element = document.querySelector('.capture-btn');
        element?.classList.add('animate-pulse-glow');

        const photoUrl = await gear360Service.capturePhoto();
        toast({
          title: "Photo capturée",
          description: "Votre photo 360° a été prise avec succès",
        });

        setTimeout(() => {
          element?.classList.remove('animate-pulse-glow');
        }, 500);
      }
    } catch (error) {
      toast({
        title: "Erreur de capture",
        description: "Impossible de capturer le contenu",
        variant: "destructive"
      });
    }
  };

  const handleFilterApply = (filterId: string) => {
    setCurrentFilter(filterId);
    // Logic to apply filter would go here
  };

  const handleSettingsChange = (setting: string, value: unknown) => {
    // Logic to change camera settings
    console.log(`Setting ${setting} to ${value}`);
  };

  return (
    <Card className="p-3 bg-camera-surface border-0 shadow-card-custom">
      <div className="space-y-3">
        {/* Camera Status */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
            <span className="text-sm font-medium">{deviceStatus}</span>
          </div>
          <div className="flex items-center gap-2">
            <Wifi className={`w-4 h-4 ${isConnected ? 'text-samsung-blue' : 'text-muted-foreground'}`} />
            <Battery className="w-4 h-4" />
            <span className="text-sm text-muted-foreground">{batteryLevel}%</span>
          </div>
        </div>

        {/* Mode Selection */}
        <div className="flex gap-2">
          <Button
            variant={captureMode === "photo" ? "default" : "secondary"}
            onClick={() => setCaptureMode("photo")}
            className="flex-1"
          >
            <Camera className="w-4 h-4 mr-2" />
            Photo
          </Button>
          <Button
            variant={captureMode === "video" ? "default" : "secondary"}
            onClick={() => setCaptureMode("video")}
            className="flex-1"
          >
            <Video className="w-4 h-4 mr-2" />
            Video
          </Button>
        </div>

        {/* Capture Button */}
        <div className="flex justify-center">
          <Button
            onClick={handleCapture}
            className={`
              capture-btn w-20 h-20 rounded-full p-0 bg-samsung-gradient
              hover:scale-105 transition-all duration-300 shadow-camera
              ${isRecording ? 'animate-pulse-glow' : ''}
            `}
          >
            {captureMode === "video" && isRecording ? (
              <div className="w-6 h-6 bg-red-500 rounded-sm" />
            ) : (
              <Circle className="w-8 h-8" />
            )}
          </Button>
        </div>

        {/* Recording Status */}
        {isRecording && (
          <div className="flex items-center justify-center gap-2">
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
            <span className="text-sm font-medium text-red-500">Recording</span>
            <Badge variant="secondary">00:45</Badge>
          </div>
        )}

        {/* AI Features */}
        <div className="space-y-2">
          <div className="grid grid-cols-2 gap-1.5">
            <Button
              variant={objectDetectionActive ? "default" : "outline"}
              onClick={() => setObjectDetectionActive(!objectDetectionActive)}
              size="sm"
            >
              <Scan className="w-4 h-4 mr-2" />
              Objets
            </Button>
            <Button
              variant={faceDetectionActive ? "default" : "outline"}
              onClick={() => setFaceDetectionActive(!faceDetectionActive)}
              size="sm"
            >
              <Eye className="w-4 h-4 mr-2" />
              Visage
            </Button>
            <Button
              variant={holisticDetectionActive ? "default" : "outline"}
              onClick={() => setHolisticDetectionActive(!holisticDetectionActive)}
              size="sm"
            >
              <User className="w-4 h-4 mr-2" />
              Holistic
            </Button>
            <Button
              variant={aiFiltersActive ? "default" : "outline"}
              onClick={() => setAiFiltersActive(!aiFiltersActive)}
              size="sm"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Filtres
            </Button>
            <Button
              variant={voiceAssistantActive ? "default" : "outline"}
              onClick={() => setVoiceAssistantActive(!voiceAssistantActive)}
              size="sm"
            >
              <Brain className="w-4 h-4 mr-2" />
              Assistant
            </Button>
            <Button
              variant={intelligentManagerActive ? "default" : "outline"}
              onClick={() => setIntelligentManagerActive(!intelligentManagerActive)}
              size="sm"
            >
              <Settings className="w-4 h-4 mr-2" />
              IA Manager
            </Button>
          </div>
        </div>

        {/* Quick Settings */}
        <div className="flex gap-1.5 justify-center">
          <DeviceConnection />
          <Button variant="outline" size="sm">
            <Settings className="w-4 h-4 mr-2" />
            Settings
          </Button>
        </div>

        {/* Hidden video element for AI processing */}
        <video
          ref={videoRef}
          autoPlay
          muted
          playsInline
          className="hidden"
        />

        {/* AI Components */}
        <ObjectDetection
          videoRef={videoRef}
          isActive={objectDetectionActive}
        />
        <FaceDetection
          videoRef={videoRef}
          isActive={faceDetectionActive}
        />
        <HolisticDetection
          videoRef={videoRef}
          isActive={holisticDetectionActive}
        />
        {aiFiltersActive && (
          <AIFilters
            isActive={aiFiltersActive}
            videoRef={videoRef}
            settings={{
              aiTransformation: false,
              backgroundReplacement: false
            }}
          />
        )}
        <AIVoiceAssistant
          onCapture={handleCapture}
          onModeChange={setCaptureMode}
          onFilterApply={handleFilterApply}
          onFaceDetectionToggle={() => setFaceDetectionActive(!faceDetectionActive)}
          settings={{
            voiceControl: false,
            microphone: false,
            backgroundMusic: false
          }}
        />
        <AIIntelligentManager
          currentMode={captureMode}
          facesDetected={facesDetected}
          currentFilter={currentFilter}
          onModeChange={(mode: string) => setCaptureMode(mode as "photo" | "video")}
          onFilterApply={handleFilterApply}
          onSettingsChange={handleSettingsChange}
          isActive={intelligentManagerActive}
        />
      </div>
    </Card>
  );
};