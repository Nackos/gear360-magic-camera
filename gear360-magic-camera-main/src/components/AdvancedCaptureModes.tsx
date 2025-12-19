import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Hand, User, Activity, Eye } from 'lucide-react';

interface GestureData {
  type: 'wave' | 'thumbsup' | 'peace' | 'point' | 'none';
  confidence: number;
}

interface PostureData {
  type: 'standing' | 'sitting' | 'lying' | 'moving' | 'unknown';
  confidence: number;
}

interface AdvancedCaptureModesProps {
  videoRef: React.RefObject<HTMLVideoElement>;
  isActive: boolean;
  settings: {
    gestureRecognition: boolean;
    postureDetection: boolean;
    adaptiveCapture: boolean;
  };
  onGestureDetected?: (gesture: GestureData) => void;
  onPostureDetected?: (posture: PostureData) => void;
}

export const AdvancedCaptureModes = ({ 
  videoRef, 
  isActive, 
  settings,
  onGestureDetected,
  onPostureDetected 
}: AdvancedCaptureModesProps) => {
  const [currentGesture, setCurrentGesture] = useState<GestureData>({ type: 'none', confidence: 0 });
  const [currentPosture, setCurrentPosture] = useState<PostureData>({ type: 'unknown', confidence: 0 });
  const [adaptiveMode, setAdaptiveMode] = useState<string>('Auto');

  useEffect(() => {
    if (!isActive || !videoRef.current) return;

    // Simulation de détection de gestes
    const gestureInterval = setInterval(() => {
      if (settings.gestureRecognition) {
        // Gestes étendus
        const gestures: GestureData['type'][] = ['wave', 'thumbsup', 'peace', 'point', 'none'];
        const randomGesture = gestures[Math.floor(Math.random() * gestures.length)];
        const gesture: GestureData = {
          type: randomGesture,
          confidence: randomGesture !== 'none' ? Math.random() * 0.5 + 0.5 : 0
        };
        
        setCurrentGesture(gesture);
        if (onGestureDetected && gesture.type !== 'none') {
          onGestureDetected(gesture);
        }
      }
    }, 3000);

    // Simulation de détection de posture
    const postureInterval = setInterval(() => {
      if (settings.postureDetection) {
        const postures: PostureData['type'][] = ['standing', 'sitting', 'lying', 'moving', 'unknown'];
        const randomPosture = postures[Math.floor(Math.random() * postures.length)];
        const posture: PostureData = {
          type: randomPosture,
          confidence: randomPosture !== 'unknown' ? Math.random() * 0.3 + 0.7 : 0
        };
        
        setCurrentPosture(posture);
        if (onPostureDetected && posture.type !== 'unknown') {
          onPostureDetected(posture);
        }
      }
    }, 2000);

    // Mode adaptatif
    if (settings.adaptiveCapture) {
      const adaptiveInterval = setInterval(() => {
        const modes = ['Portrait', 'Action', 'Paysage', 'Nuit', 'Auto'];
        setAdaptiveMode(modes[Math.floor(Math.random() * modes.length)]);
      }, 5000);

      return () => {
        clearInterval(gestureInterval);
        clearInterval(postureInterval);
        clearInterval(adaptiveInterval);
      };
    }

    return () => {
      clearInterval(gestureInterval);
      clearInterval(postureInterval);
    };
  }, [isActive, videoRef, settings, onGestureDetected, onPostureDetected]);

  if (!isActive) return null;

  const getGestureLabel = (type: GestureData['type']) => {
    const labels = {
      wave: '👋 Salut',
      thumbsup: '👍 Pouce levé',
      peace: '✌️ Paix',
      point: '☝️ Pointage',
      none: 'Aucun geste'
    };
    return labels[type];
  };

  const getPostureLabel = (type: PostureData['type']) => {
    const labels = {
      standing: '🧍 Debout',
      sitting: '🪑 Assis',
      lying: '🛌 Allongé',
      moving: '🏃 En mouvement',
      unknown: 'Indéterminé'
    };
    return labels[type];
  };

  return (
    <div className="absolute top-4 left-4 space-y-2 pointer-events-none">
      {settings.gestureRecognition && currentGesture.type !== 'none' && (
        <Card className="p-3 bg-black/70 backdrop-blur-md border-primary/30">
          <div className="flex items-center gap-2">
            <Hand className="w-4 h-4 text-green-400" />
            <div>
              <div className="text-sm font-semibold text-white">
                {getGestureLabel(currentGesture.type)}
              </div>
              <div className="text-xs text-muted-foreground">
                Confiance: {Math.round(currentGesture.confidence * 100)}%
              </div>
            </div>
          </div>
        </Card>
      )}

      {settings.postureDetection && currentPosture.type !== 'unknown' && (
        <Card className="p-3 bg-black/70 backdrop-blur-md border-primary/30">
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-blue-400" />
            <div>
              <div className="text-sm font-semibold text-white">
                Posture: {getPostureLabel(currentPosture.type)}
              </div>
              <div className="text-xs text-muted-foreground">
                Confiance: {Math.round(currentPosture.confidence * 100)}%
              </div>
            </div>
          </div>
        </Card>
      )}

      {settings.adaptiveCapture && (
        <Card className="p-3 bg-black/70 backdrop-blur-md border-primary/30">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-primary" />
            <div>
              <div className="text-sm font-semibold text-white">
                Mode adaptatif
              </div>
              <Badge variant="secondary" className="bg-primary/20 text-primary text-xs mt-1">
                {adaptiveMode}
              </Badge>
            </div>
          </div>
        </Card>
      )}

      {(settings.gestureRecognition || settings.postureDetection || settings.adaptiveCapture) && (
        <Card className="p-2 bg-black/70 backdrop-blur-md border-primary/30">
          <div className="flex items-center gap-2 text-xs text-white">
            <Eye className="w-3 h-3 text-green-400" />
            <span>Analyse en temps réel active</span>
          </div>
        </Card>
      )}
    </div>
  );
};
