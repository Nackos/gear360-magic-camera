import { useEffect, useRef, useState, useCallback } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Hand, Activity, Zap } from 'lucide-react';
import { defaultAISettings, loadAISettings } from '@/config/aiDetectionConfig';
import { useToast } from '@/hooks/use-toast';

interface GestureData {
  type: string;
  confidence: number;
  timestamp: number;
  trackId?: number;
}

interface KeypointData {
  x: number;
  y: number;
  z?: number;
  visibility?: number;
}

interface GestureRecognitionProps {
  videoRef: React.RefObject<HTMLVideoElement>;
  isActive: boolean;
  onGestureDetected?: (gesture: GestureData) => void;
  onCommandTriggered?: (command: string, gesture: GestureData) => void;
}

export const GestureRecognition = ({
  videoRef,
  isActive,
  onGestureDetected,
  onCommandTriggered
}: GestureRecognitionProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [currentGesture, setCurrentGesture] = useState<GestureData | null>(null);
  const [gestureHistory, setGestureHistory] = useState<GestureData[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const animationFrameRef = useRef<number>();
  const keypointBuffer = useRef<KeypointData[][]>([]);
  const stableGestureCounter = useRef<number>(0);
  const lastGestureRef = useRef<string>('none');
  const { toast } = useToast();

  const settings = loadAISettings();

  // Détection de gestes basée sur les keypoints
  const detectGestureFromKeypoints = (keypoints: KeypointData[]): GestureData | null => {
    if (!keypoints || keypoints.length < 5) return null;

    // Vérifier les formes de main basiques
    const wrist = keypoints[0];
    const thumb = keypoints[4];
    const index = keypoints[8];
    const middle = keypoints[12];
    const ring = keypoints[16];
    const pinky = keypoints[20];

    // Calculer les distances relatives
    const thumbUp = thumb && wrist && thumb.y < wrist.y - 0.1;
    const indexUp = index && wrist && index.y < wrist.y - 0.1;
    const middleUp = middle && wrist && middle.y < wrist.y - 0.1;
    const ringDown = ring && wrist && ring.y > wrist.y;
    const pinkyDown = pinky && wrist && pinky.y > wrist.y;

    let gestureType = 'none';
    let confidence = 0;

    // Pouce levé
    if (thumbUp && !indexUp && ringDown && pinkyDown) {
      gestureType = 'pouce_haut';
      confidence = 0.85;
    }
    // V sign (victoire/paix)
    else if (indexUp && middleUp && ringDown && pinkyDown) {
      gestureType = 'v_sign';
      confidence = 0.8;
    }
    // Index pointé
    else if (indexUp && !middleUp && !thumbUp) {
      gestureType = 'index_point';
      confidence = 0.75;
    }
    // Paume ouverte
    else if (indexUp && middleUp && ringDown === false && pinkyDown === false) {
      gestureType = 'paume';
      confidence = 0.7;
    }
    // Poing fermé
    else if (!indexUp && !middleUp && !thumbUp) {
      gestureType = 'poing';
      confidence = 0.7;
    }

    if (gestureType === 'none') return null;

    return {
      type: gestureType,
      confidence,
      timestamp: Date.now()
    };
  };

  // Détection de swipe basée sur mouvement temporel
  const detectSwipeGesture = useCallback((buffer: KeypointData[][]): GestureData | null => {
    if (buffer.length < settings.gesture.windowSize) return null;

    const firstFrame = buffer[0];
    const lastFrame = buffer[buffer.length - 1];

    if (!firstFrame[0] || !lastFrame[0]) return null;

    const deltaX = lastFrame[0].x - firstFrame[0].x;
    const deltaY = lastFrame[0].y - firstFrame[0].y;
    const threshold = 0.15;

    let gestureType = 'none';
    let confidence = 0;

    if (Math.abs(deltaX) > threshold || Math.abs(deltaY) > threshold) {
      if (Math.abs(deltaX) > Math.abs(deltaY)) {
        gestureType = deltaX > 0 ? 'swipe_droite' : 'swipe_gauche';
        confidence = Math.min(0.9, Math.abs(deltaX) * 3);
      } else {
        gestureType = deltaY > 0 ? 'swipe_bas' : 'swipe_haut';
        confidence = Math.min(0.9, Math.abs(deltaY) * 3);
      }
    }

    if (gestureType === 'none') return null;

    return {
      type: gestureType,
      confidence,
      timestamp: Date.now()
    };
  }, [settings.gesture.windowSize]);

  // Simuler MediaPipe Hands (en réalité il faudrait importer MediaPipe)
  const processFrame = useCallback(async () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;

    if (video.videoWidth === 0) {
      animationFrameRef.current = requestAnimationFrame(processFrame);
      return;
    }

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Simuler détection de keypoints (normalement via MediaPipe)
    // En production, utiliser vraiment MediaPipe Hands
    const mockKeypoints: KeypointData[] = Array.from({ length: 21 }, (_, i) => ({
      x: Math.random(),
      y: Math.random(),
      z: Math.random() * 0.1,
      visibility: Math.random() * 0.5 + 0.5
    }));

    // Ajouter au buffer
    keypointBuffer.current.push(mockKeypoints);
    if (keypointBuffer.current.length > settings.gesture.windowSize) {
      keypointBuffer.current.shift();
    }

    // Détecter gestes statiques
    const staticGesture = detectGestureFromKeypoints(mockKeypoints);

    // Détecter gestes dynamiques (swipes)
    const swipeGesture = detectSwipeGesture(keypointBuffer.current);

    // Prendre le geste avec la plus haute confiance
    const detectedGesture = [staticGesture, swipeGesture]
      .filter(g => g !== null)
      .sort((a, b) => {
        const confA = a?.confidence || 0;
        const confB = b?.confidence || 0;
        return confB - confA;
      })[0];

    if (detectedGesture && detectedGesture.confidence >= settings.gesture.confThreshold) {
      // Vérifier stabilité du geste
      if (lastGestureRef.current === detectedGesture.type) {
        stableGestureCounter.current++;
      } else {
        stableGestureCounter.current = 0;
        lastGestureRef.current = detectedGesture.type;
      }

      // Si le geste est stable pendant N frames
      if (stableGestureCounter.current >= settings.gesture.stableGestureFrames) {
        setCurrentGesture(detectedGesture);

        // Ajouter à l'historique
        setGestureHistory(prev => [detectedGesture, ...prev].slice(0, 10));

        if (onGestureDetected) {
          onGestureDetected(detectedGesture);
        }

        // Déclencher commande si mappée
        const command = settings.commands.gestureCommandMap[detectedGesture.type];
        if (command && detectedGesture.confidence >= settings.commands.defaultActionConfidence) {
          if (onCommandTriggered) {
            onCommandTriggered(command.action, detectedGesture);
          }

          // Notification vocale si activée
          if (settings.commands.enableVoiceConfirmation) {
            toast({
              title: `Geste détecté: ${detectedGesture.type}`,
              description: `Action: ${command.description}`,
              duration: 2000
            });
          }
        }

        stableGestureCounter.current = 0;
      }
    }

    animationFrameRef.current = requestAnimationFrame(processFrame);
  }, [onGestureDetected, onCommandTriggered, settings, toast, videoRef, detectSwipeGesture]);

  useEffect(() => {
    if (!isActive) return;

    setIsProcessing(true);
    processFrame();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      setIsProcessing(false);
    };
  }, [isActive, processFrame]);

  if (!isActive) return null;

  return (
    <div className="absolute inset-0 pointer-events-none z-10">
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full opacity-0"
      />

      {/* Geste actuel détecté */}
      {currentGesture && (
        <Card className="absolute top-20 right-4 p-3 bg-black/70 backdrop-blur-md border-primary/40 pointer-events-auto animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Hand className="w-8 h-8 text-primary animate-pulse" />
              <Zap className="w-4 h-4 text-yellow-400 absolute -top-1 -right-1" />
            </div>
            <div>
              <div className="text-white font-semibold text-sm">
                {currentGesture.type.replace('_', ' ').toUpperCase()}
              </div>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="secondary" className="text-xs bg-primary/20 text-primary">
                  {Math.round(currentGesture.confidence * 100)}%
                </Badge>
                {settings.commands.gestureCommandMap[currentGesture.type] && (
                  <span className="text-xs text-green-400">
                    → {settings.commands.gestureCommandMap[currentGesture.type].description}
                  </span>
                )}
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Historique des gestes */}
      {gestureHistory.length > 0 && (
        <Card className="absolute bottom-48 right-4 p-2 bg-black/60 backdrop-blur-md border-primary/30 max-h-32 overflow-y-auto pointer-events-auto">
          <div className="flex items-center gap-2 mb-2 text-white text-xs font-semibold">
            <Activity className="w-3 h-3 text-primary" />
            <span>Historique</span>
          </div>
          <div className="flex flex-col gap-1">
            {gestureHistory.slice(0, 5).map((gesture, idx) => (
              <div key={idx} className="flex items-center justify-between gap-2 text-xs">
                <span className="text-white/80">{gesture.type}</span>
                <span className="text-primary">{Math.round(gesture.confidence * 100)}%</span>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Status */}
      <Card className="absolute bottom-32 left-4 p-2 bg-black/60 backdrop-blur-md border-primary/30 pointer-events-auto">
        <div className="flex items-center gap-2 text-xs text-white">
          <div className={`w-2 h-2 rounded-full ${isProcessing ? 'bg-green-400 animate-pulse' : 'bg-gray-400'}`} />
          <span>Reconnaissance gestuelle active</span>
        </div>
      </Card>
    </div>
  );
};
