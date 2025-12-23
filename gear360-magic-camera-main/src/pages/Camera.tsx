import { useState, useRef, useEffect, useCallback } from "react";
import { MoreVertical, Image, Video, Eye, Grid, Sparkles, SwitchCamera, Shield, Scan, Mic, Settings, Hand } from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import FaceFiltersMenu from "@/components/camera/FaceFiltersMenu";
import { Button } from "@/components/ui/button";
import ZoomControls from "@/components/camera/ZoomControls";
import GalleryPreview from "@/components/camera/GalleryPreview";
import QuickActionsBar from "@/components/camera/QuickActionsBar";
import ModesDrawer from "@/components/camera/ModesDrawer";
import { ObjectDetection } from "@/components/ObjectDetection";
import { HolisticDetection } from "@/components/HolisticDetection";
import MaskDetection from "@/components/MaskDetection";
import FullBodyEstimation from "@/components/FullBodyEstimation";
import { AIVoiceControl } from "@/components/AIVoiceControl";
import { AIVoiceAssistant } from "@/components/AIVoiceAssistant";
import { SocialSharing } from "@/components/SocialSharing";
import { AIFilters } from "@/components/AIFilters";
import { AdvancedCaptureModes } from "@/components/AdvancedCaptureModes";
import { GestureRecognition } from "@/components/GestureRecognition";
import { CommandController } from "@/components/CommandController";
import { AIIntelligentManager } from "@/components/AIIntelligentManager";
import { ProSettings } from "@/components/camera/ProSettings";
import { VRViewer360 } from "@/components/VRViewer360";
import { IntegratedDetectionPipeline } from "@/components/IntegratedDetectionPipeline";
import { useToast } from "@/hooks/use-toast";
import type { Detection } from "@/components/ObjectDetection";
import { gear360Service } from "@/services/gear360Service";
import { kinectService } from "@/services/kinectService";

const Camera = () => {
  const { toast } = useToast();
  const [activeMode, setActiveMode] = useState("PHOTO");
  const [isMotionActive, setIsMotionActive] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [isQuickMenuOpen, setIsQuickMenuOpen] = useState(false);
  const [isModesDrawerOpen, setIsModesDrawerOpen] = useState(false);
  const [selectedAdvancedMode, setSelectedAdvancedMode] = useState<string | null>(null);
  const [showFaceFiltersFromTop, setShowFaceFiltersFromTop] = useState(false);
  const [isObjectDetectionActive, setIsObjectDetectionActive] = useState(true);
  const [isFaceDetectionActive, setIsFaceDetectionActive] = useState(true);
  const [isMaskDetectionActive, setIsMaskDetectionActive] = useState(false);
  const [isFullBodyEstimationActive, setIsFullBodyEstimationActive] = useState(false);
  const [detections, setDetections] = useState<Detection[]>([]);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment');
  const [isCapturing, setIsCapturing] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [settings, setSettings] = useState(() => {
    const saved = localStorage.getItem('cameraSettings');
    return saved ? JSON.parse(saved) : {
      voiceControl: false,
      microphone: false,
      backgroundMusic: false,
      smartNotifications: false,
      aiTransformation: false,
      backgroundReplacement: false,
      gestureRecognition: false,
      postureDetection: false,
      adaptiveCapture: false,
      fullBodyEstimation: false,
      showTopBar: true,
    };
  });
  const [isAIFiltersActive, setIsAIFiltersActive] = useState(false);
  const [isVoiceAssistantActive, setIsVoiceAssistantActive] = useState(false);
  const [isIntelligentManagerActive, setIsIntelligentManagerActive] = useState(false);
  const [currentFilter, setCurrentFilter] = useState<string | null>(null);
  const [facesDetected, setFacesDetected] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [flash, setFlash] = useState<'off' | 'on' | 'auto'>('off');
  const [timer, setTimer] = useState<number>(0);
  const [burstMode, setBurstMode] = useState(false);
  const [hdr, setHdr] = useState(false);
  const [whiteBalance, setWhiteBalance] = useState<'auto' | 'daylight' | 'cloudy' | 'tungsten'>('auto');
  const [iso, setIso] = useState(800);
  const [exposure, setExposure] = useState(0);
  const [shutterSpeed, setShutterSpeed] = useState('1/60');
  const [resolution, setResolution] = useState<'4K' | '1080p' | '720p'>('4K');
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  const [isProSettingsOpen, setIsProSettingsOpen] = useState(false);
  const [isGestureRecognitionActive, setIsGestureRecognitionActive] = useState(false);
  const [showVRViewer, setShowVRViewer] = useState(false);
  const [currentVRImage, setCurrentVRImage] = useState<string | null>(null);
  const [gear360Connected, setGear360Connected] = useState(false);
  const [kinectConnected, setKinectConnected] = useState(false);
  const [isIntegratedPipelineActive, setIsIntegratedPipelineActive] = useState(false);

  const [customModes, setCustomModes] = useState<Array<{ id: string; label: string }>>([]);

  const defaultModes = [
    { id: "PRO", label: "PRO", icon: Sparkles },
    { id: "PORTRAIT", label: "PORTRAIT", icon: Eye },
    { id: "PHOTO", label: "PHOTO", icon: Image },
    { id: "VIDEO", label: "VIDÉO", icon: Video },
  ];

  const modes = [...defaultModes, ...customModes, { id: "PLUS", label: "PLUS", icon: Grid }];

  const handleModeSelect = (modeId: string, modeLabel: string) => {
    setSelectedAdvancedMode(modeId);
    setActiveMode(modeId);

    if (!customModes.find(m => m.id === modeId)) {
      setCustomModes(prev => [...prev, { id: modeId, label: modeLabel }]);
    }
  };

  const toggleCamera = useCallback(() => {
    setFacingMode(prev => prev === 'environment' ? 'user' : 'environment');
  }, []);

  const saveToGallery = useCallback((dataUrl: string, type: 'photo' | 'video', mode?: string) => {
    const galleryItems = JSON.parse(localStorage.getItem('galleryItems') || '[]');

    const newItem = {
      id: Date.now(),
      type,
      thumbnail: dataUrl,
      dataUrl,
      mode: mode || activeMode,
      title: `${type === 'photo' ? 'Photo' : 'Vidéo'} ${new Date().toLocaleString('fr-FR')}`,
      date: new Date().toLocaleString('fr-FR', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }),
      size: `${(dataUrl.length / 1024 / 1024).toFixed(1)} MB`,
      sizeBytes: dataUrl.length,
      createdAt: new Date().toISOString(),
    };

    galleryItems.unshift(newItem);
    localStorage.setItem('galleryItems', JSON.stringify(galleryItems));
  }, [activeMode]);

  const capturePhoto = useCallback(async () => {
    if (gear360Connected && (activeMode === "360" || activeMode === "PANORAMA")) {
      try {
        const photoUrl = await gear360Service.capturePhoto();
        if (photoUrl) {
          saveToGallery(photoUrl, 'photo', activeMode);
          setCurrentVRImage(photoUrl);
          setShowVRViewer(true);
        }
        return;
      } catch (error) {
        toast({
          title: "❌ Erreur Gear 360",
          description: "Impossible de capturer",
          variant: "destructive",
        });
      }
    }

    if (!videoRef.current || !canvasRef.current) return;

    if (timer > 0) {
      for (let i = timer; i > 0; i--) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    if (flash === 'on' || flash === 'auto') {
      setIsCapturing(true);
    }

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    if (context) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      let filterSettings = `brightness(${100 + exposure * 10}%) contrast(${hdr ? 120 : 100}%) saturate(${100}%)`;

      if (activeMode === 'night' || activeMode === 'NUIT') {
        filterSettings = `brightness(150%) contrast(110%) saturate(90%)`;
      } else if (activeMode === 'food' || activeMode === 'NOURRITURE') {
        filterSettings = `brightness(105%) contrast(115%) saturate(130%)`;
      } else if (activeMode === 'video-portrait' || activeMode === 'VIDÉO PORTRAIT') {
        filterSettings = `brightness(110%) contrast(100%) saturate(105%) blur(0px)`;
      }

      context.filter = filterSettings;
      context.drawImage(video, 0, 0, canvas.width, canvas.height);

      const captureBlob = () => {
        canvas.toBlob((blob) => {
          if (blob) {
            const reader = new FileReader();
            reader.onloadend = () => {
              const base64data = reader.result as string;
              saveToGallery(base64data, 'photo', activeMode);
            };
            reader.readAsDataURL(blob);
          }
          setTimeout(() => setIsCapturing(false), 200);
        }, 'image/jpeg', 0.95);
      };

      if (burstMode) {
        for (let i = 0; i < 5; i++) {
          await new Promise(resolve => setTimeout(resolve, 200));
          captureBlob();
        }
      } else {
        captureBlob();
      }
    }
  }, [gear360Connected, activeMode, toast, timer, flash, exposure, hdr, burstMode, saveToGallery]);

  const startRecording = useCallback(async () => {
    if (!videoRef.current) return;

    try {
      const stream = videoRef.current.srcObject as MediaStream;
      let videoBitsPerSecond = resolution === '4K' ? 8000000 : resolution === '1080p' ? 5000000 : 2500000;

      if (activeMode === 'video-pro' || activeMode === 'VIDÉO PRO') {
        videoBitsPerSecond *= 1.5;
      } else if (activeMode === 'super-slow' || activeMode === 'SUPER RALENTI') {
        videoBitsPerSecond *= 2;
      }

      mediaRecorderRef.current = new MediaRecorder(stream, {
        mimeType: 'video/webm;codecs=vp9',
        videoBitsPerSecond
      });
      recordedChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          recordedChunksRef.current.push(event.data);
        }
      };

      mediaRecorderRef.current.onstop = () => {
        const blob = new Blob(recordedChunksRef.current, { type: 'video/webm' });
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64data = reader.result as string;
          saveToGallery(base64data, 'video', activeMode);
        };
        reader.readAsDataURL(blob);
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
    } catch (err) {
      console.error("Erreur d'enregistrement:", err);
      toast({
        title: "❌ Erreur",
        description: "Impossible de démarrer l'enregistrement vidéo",
        variant: "destructive",
      });
    }
  }, [resolution, activeMode, toast, saveToGallery]);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  }, [isRecording]);

  useEffect(() => {
    const videoElement = videoRef.current;
    const startCamera = async () => {
      try {
        if (videoElement?.srcObject) {
          const stream = videoElement.srcObject as MediaStream;
          stream.getTracks().forEach(track => track.stop());
        }

        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: facingMode }
        });
        if (videoElement) {
          videoElement.srcObject = stream;
        }
      } catch (err) {
        console.error("Erreur d'accès à la caméra:", err);
      }
    };

    startCamera();

    const onGear360Connected = () => {
      setGear360Connected(true);
      toast({ title: "✓ Gear 360 connecté", description: "Caméra 360° prête" });
    };
    const onGear360Disconnected = () => setGear360Connected(false);

    gear360Service.on('deviceConnected', onGear360Connected);
    gear360Service.on('deviceDisconnected', onGear360Disconnected);

    const onKinectConnected = () => {
      setKinectConnected(true);
      toast({ title: "✓ Kinect connecté", description: "Détection de profondeur active" });
      kinectService.startSkeletonTracking();
    };
    const onKinectDisconnected = () => setKinectConnected(false);

    kinectService.on('connected', onKinectConnected);
    kinectService.on('disconnected', onKinectDisconnected);

    kinectService.connect().catch(err => console.log("Kinect non disponible:", err));

    const handleVoiceCapture = () => capturePhoto();
    const handleVoiceMode = (e: CustomEvent<string>) => setActiveMode(e.detail);
    const handleVoiceZoom = (e: CustomEvent<'in' | 'out'>) => {
      if (e.detail === 'in') setZoom(prev => Math.min(prev + 0.5, 5));
      else setZoom(prev => Math.max(prev - 0.5, 1));
    };
    const handleVoiceFlash = (e: CustomEvent<'off' | 'on' | 'auto'>) => setFlash(e.detail);
    const handleVoiceNavigate = (e: CustomEvent<string>) => { window.location.href = e.detail; };

    const handleGestureCapture = () => capturePhoto();
    const handleGestureSelfieMode = () => setFacingMode('user');
    const handleGestureSwitchCamera = () => toggleCamera();
    const handleGestureZoomIn = () => setZoom(prev => Math.min(prev + 0.5, 5));
    const handleGestureStopRecording = () => { if (isRecording) stopRecording(); };

    window.addEventListener('voice-command-capture', handleVoiceCapture);
    window.addEventListener('voice-command-mode', handleVoiceMode as EventListener);
    window.addEventListener('voice-command-zoom', handleVoiceZoom as EventListener);
    window.addEventListener('voice-command-flash', handleVoiceFlash as EventListener);
    window.addEventListener('voice-command-navigate', handleVoiceNavigate as EventListener);
    window.addEventListener('gesture-capture', handleGestureCapture);
    window.addEventListener('gesture-selfie-mode', handleGestureSelfieMode);
    window.addEventListener('gesture-switch-camera', handleGestureSwitchCamera);
    window.addEventListener('gesture-zoom-in', handleGestureZoomIn);
    window.addEventListener('gesture-stop-recording', handleGestureStopRecording);

    return () => {
      if (videoElement?.srcObject) {
        const stream = videoElement.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
      }
      kinectService.off('connected', onKinectConnected);
      kinectService.off('disconnected', onKinectDisconnected);
      gear360Service.off('deviceConnected', onGear360Connected);
      gear360Service.off('deviceDisconnected', onGear360Disconnected);
      kinectService.disconnect();
      window.removeEventListener('voice-command-capture', handleVoiceCapture);
      window.removeEventListener('voice-command-mode', handleVoiceMode as EventListener);
      window.removeEventListener('voice-command-zoom', handleVoiceZoom as EventListener);
      window.removeEventListener('voice-command-flash', handleVoiceFlash as EventListener);
      window.removeEventListener('voice-command-navigate', handleVoiceNavigate as EventListener);
      window.removeEventListener('gesture-capture', handleGestureCapture);
      window.removeEventListener('gesture-selfie-mode', handleGestureSelfieMode);
      window.removeEventListener('gesture-switch-camera', handleGestureSwitchCamera);
      window.removeEventListener('gesture-zoom-in', handleGestureZoomIn);
      window.removeEventListener('gesture-stop-recording', handleGestureStopRecording);
    };
  }, [facingMode, capturePhoto, isRecording, stopRecording, toast, toggleCamera]);

  return (
    <div className="relative h-screen w-full overflow-hidden bg-background">
      {showVRViewer && currentVRImage && (
        <VRViewer360 imageUrl={currentVRImage} onClose={() => setShowVRViewer(false)} />
      )}

      {!showVRViewer && (
        <>
          <div className="absolute inset-0 bg-gradient-to-b from-camera-overlay/40 via-transparent to-camera-overlay/60">
            <div className="relative h-full w-full flex items-center justify-center">
              <video ref={videoRef} autoPlay playsInline muted className="absolute inset-0 w-full h-full object-cover" />
              <canvas ref={canvasRef} className="hidden" />

              {isObjectDetectionActive && <ObjectDetection videoRef={videoRef} isActive={isObjectDetectionActive} onDetectionsChange={setDetections} />}
              {isFaceDetectionActive && <HolisticDetection videoRef={videoRef} isActive={isFaceDetectionActive} onPersonDataChange={(people) => setFacesDetected(people.length)} />}
              {isMaskDetectionActive && <MaskDetection isActive={isMaskDetectionActive} videoRef={videoRef} />}
              {isFullBodyEstimationActive && <FullBodyEstimation isActive={isFullBodyEstimationActive} videoRef={videoRef} />}
              {isIntegratedPipelineActive && (
                <IntegratedDetectionPipeline
                  videoRef={videoRef}
                  isActive={isIntegratedPipelineActive}
                  onDetections={setDetections}
                  onGesture={(gesture, confidence) => console.log(`Geste détecté: ${gesture} (${(confidence * 100).toFixed(0)}%)`)}
                />
              )}

              {isCapturing && <div className="absolute inset-0 bg-white z-50 animate-pulse" />}
              {gear360Connected && <div className="absolute top-4 right-4 bg-green-500/20 backdrop-blur-sm px-3 py-1 rounded-full text-white text-xs">Gear 360 ✓</div>}
              {kinectConnected && <div className="absolute top-16 right-4 bg-blue-500/20 backdrop-blur-sm px-3 py-1 rounded-full text-white text-xs">Kinect ✓</div>}

              {activeMode === "night" && <div className="absolute top-4 right-4 bg-secondary/80 backdrop-blur-md px-4 py-2 rounded-full text-xs font-medium text-primary">🌙 MODE NUIT</div>}
              {activeMode === "panorama" && (
                <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex justify-center">
                  <div className="w-[80%] h-24 border-2 border-primary/50 rounded-lg flex items-center justify-center text-xs text-primary">← Panorez lentement →</div>
                </div>
              )}
            </div>
          </div>

          {settings.showTopBar && (
            <div className="absolute top-0 left-0 right-0 z-30 flex items-center justify-between p-3">
              <Button variant="ghost" size="icon" onClick={() => setIsMotionActive(!isMotionActive)} className="h-9 w-9 rounded-full bg-background/20 backdrop-blur-sm hover:bg-background/30 text-white border-0">
                <Sparkles className="w-4 h-4" />
              </Button>
              <div className="flex items-center gap-2">
                {settings.voiceControl && (
                  <Button variant="ghost" size="icon" onClick={() => setIsVoiceAssistantActive(!isVoiceAssistantActive)} className="h-9 w-9 rounded-full bg-background/20 backdrop-blur-sm hover:bg-background/30 text-white border-0">
                    <Mic className={cn("w-4 h-4", isVoiceAssistantActive && "text-primary")} />
                  </Button>
                )}
                <Link to="/settings">
                  <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full bg-background/20 backdrop-blur-sm hover:bg-background/30 text-white border-0"><Settings className="w-4 h-4" /></Button>
                </Link>
                <Button variant="ghost" size="icon" onClick={() => setIsProSettingsOpen(true)} className="h-9 w-9 rounded-full bg-background/20 backdrop-blur-sm hover:bg-background/30 text-white border-0"><MoreVertical className="w-4 h-4" /></Button>
              </div>
            </div>
          )}

          <div className="absolute bottom-0 left-0 right-0 pb-safe z-40">
            <div className="flex items-center justify-center gap-6 px-4 pb-6">
              {modes.map((mode) => (
                <button
                  key={mode.id}
                  onClick={() => mode.id === "PLUS" ? setIsModesDrawerOpen(true) : setActiveMode(mode.id)}
                  className={`flex flex-col items-center gap-1 transition-all ${activeMode === mode.id ? "text-foreground scale-110" : "text-muted-foreground"}`}
                >
                  <span className="text-xs font-medium tracking-wide">{mode.label}</span>
                </button>
              ))}
            </div>

            <div className="flex items-center justify-between px-6 pb-8">
              <GalleryPreview />
              {activeMode === "VIDEO" || activeMode === "VIDÉO" ? (
                <button
                  onClick={isRecording ? stopRecording : startRecording}
                  className={`relative w-20 h-20 rounded-full ${isRecording ? 'bg-destructive' : 'bg-foreground'} border-4 border-background shadow-2xl active:scale-95 transition-all`}
                >
                  {isRecording && <div className="absolute inset-2 bg-destructive rounded-sm animate-pulse" />}
                </button>
              ) : (
                <button
                  onClick={capturePhoto}
                  disabled={isCapturing}
                  className="relative w-20 h-20 rounded-full bg-foreground border-4 border-background shadow-2xl active:scale-95 transition-transform disabled:opacity-50"
                >
                  {timer > 0 && <span className="absolute -top-8 left-1/2 -translate-x-1/2 text-2xl font-bold text-foreground">{timer}s</span>}
                </button>
              )}
              <Button size="icon" variant="ghost" className="w-14 h-14 rounded-full bg-secondary/80 backdrop-blur-md hover:bg-secondary" onClick={() => setIsProSettingsOpen(true)}>
                <MoreVertical className="w-6 h-6 text-foreground" />
              </Button>
            </div>

            <div className="absolute bottom-32 right-4 flex flex-col gap-3 z-40">
              <Button size="icon" variant={isObjectDetectionActive ? "default" : "ghost"} className="w-12 h-12 rounded-full bg-secondary/80 backdrop-blur-md hover:bg-secondary" onClick={() => setIsObjectDetectionActive(!isObjectDetectionActive)}><Eye className="w-5 h-5" /></Button>
              <Button size="icon" variant={isFaceDetectionActive ? "default" : "ghost"} className="w-12 h-12 rounded-full bg-secondary/80 backdrop-blur-md hover:bg-secondary" onClick={() => setIsFaceDetectionActive(!isFaceDetectionActive)}><Sparkles className="w-5 h-5" /></Button>
              <Button size="icon" variant={isAIFiltersActive ? "default" : "ghost"} className="w-12 h-12 rounded-full bg-secondary/80 backdrop-blur-md hover:bg-secondary" onClick={() => setIsAIFiltersActive(!isAIFiltersActive)}><Grid className="w-5 h-5" /></Button>
              <Button size="icon" variant={isMaskDetectionActive ? "default" : "ghost"} className="w-12 h-12 rounded-full bg-secondary/80 backdrop-blur-md hover:bg-secondary" onClick={() => setIsMaskDetectionActive(!isMaskDetectionActive)}><Shield className="w-5 h-5" /></Button>
              <Button size="icon" variant={isFullBodyEstimationActive ? "default" : "ghost"} className="w-12 h-12 rounded-full bg-secondary/80 backdrop-blur-md hover:bg-secondary" onClick={() => setIsFullBodyEstimationActive(!isFullBodyEstimationActive)}><Scan className="w-5 h-5" /></Button>
              <Button size="icon" variant={isGestureRecognitionActive ? "default" : "ghost"} className="w-12 h-12 rounded-full bg-secondary/80 backdrop-blur-md hover:bg-secondary" onClick={() => setIsGestureRecognitionActive(!isGestureRecognitionActive)}><Hand className="w-5 h-5" /></Button>
              <Button size="icon" variant={isIntegratedPipelineActive ? "default" : "ghost"} className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-primary/80 backdrop-blur-md shadow-lg" onClick={() => setIsIntegratedPipelineActive(!isIntegratedPipelineActive)}><Sparkles className="w-5 h-5 text-white" /></Button>
              <Button size="icon" variant="ghost" className="w-12 h-12 rounded-full bg-secondary/80 backdrop-blur-md hover:bg-secondary" onClick={toggleCamera}><SwitchCamera className="w-5 h-5" /></Button>
            </div>
          </div>

          <QuickActionsBar isOpen={isQuickMenuOpen} onClose={() => setIsQuickMenuOpen(false)} />
          <ModesDrawer isOpen={isModesDrawerOpen} onClose={() => setIsModesDrawerOpen(false)} onModeSelect={handleModeSelect} />
          <AIVoiceControl detections={detections} isActive={isObjectDetectionActive} />
          {isVoiceAssistantActive && <AIVoiceAssistant onCapture={capturePhoto} onModeChange={(mode) => setActiveMode(mode)} onFilterApply={setCurrentFilter} onFaceDetectionToggle={() => setIsFaceDetectionActive(!isFaceDetectionActive)} settings={settings} />}
          <AIFilters isActive={isAIFiltersActive} videoRef={videoRef} settings={settings} />
          <AdvancedCaptureModes isActive={settings.gestureRecognition || settings.postureDetection || settings.adaptiveCapture} settings={settings} videoRef={videoRef} />
          <GestureRecognition videoRef={videoRef} isActive={isGestureRecognitionActive} onGestureDetected={(g) => console.log('Geste:', g)} onCommandTriggered={(c, g) => console.log('Cmd:', c, g)} />
          <CommandController />
          <AIIntelligentManager currentMode={activeMode} facesDetected={facesDetected} currentFilter={currentFilter} onModeChange={setActiveMode} onFilterApply={setCurrentFilter} onSettingsChange={(s, v) => setSettings(p => ({ ...p, [s]: v }))} isActive={isIntelligentManagerActive} />
          <SocialSharing isActive={settings.smartNotifications} settings={settings} />
          <ProSettings isOpen={isProSettingsOpen} onClose={() => setIsProSettingsOpen(false)} flash={flash} setFlash={setFlash} timer={timer} setTimer={setTimer} burstMode={burstMode} setBurstMode={setBurstMode} hdr={hdr} setHdr={setHdr} whiteBalance={whiteBalance} setWhiteBalance={setWhiteBalance} iso={iso} setIso={setIso} exposure={exposure} setExposure={setExposure} shutterSpeed={shutterSpeed} setShutterSpeed={setShutterSpeed} resolution={resolution} setResolution={setResolution} />
        </>
      )}
    </div>
  );
};

export default Camera;
