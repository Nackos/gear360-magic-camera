import { useEffect, useRef, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Scan } from 'lucide-react';
import * as cocoSsd from '@tensorflow-models/coco-ssd';
import '@tensorflow/tfjs';

export interface Detection {
  class: string;
  score: number;
  bbox: [number, number, number, number];
}

interface ObjectDetectionProps {
  videoRef: React.RefObject<HTMLVideoElement>;
  isActive: boolean;
  onDetectionsChange?: (detections: Detection[]) => void;
}

export const ObjectDetection = ({ videoRef, isActive, onDetectionsChange }: ObjectDetectionProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [model, setModel] = useState<cocoSsd.ObjectDetection | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [detections, setDetections] = useState<Detection[]>([]);
  const animationFrameRef = useRef<number>();

  useEffect(() => {
    if (isActive && !model) {
      initializeModel();
    }
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isActive]);

  const initializeModel = async () => {
    try {
      setIsLoading(true);
      const loadedModel = await cocoSsd.load({
        base: 'lite_mobilenet_v2' // Optimisé pour mobile
      });
      setModel(loadedModel);
    } catch (error) {
      console.error('Erreur lors du chargement du modèle:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!model || !isActive || !videoRef.current) return;

    const detectObjects = async () => {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      
      if (!video || !canvas || video.videoWidth === 0) {
        animationFrameRef.current = requestAnimationFrame(detectObjects);
        return;
      }

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      try {
        const predictions = await model.detect(video);
        
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        const detected: Detection[] = predictions.map(pred => ({
          class: pred.class,
          score: pred.score,
          bbox: pred.bbox
        }));
        
        setDetections(detected);
        
        if (onDetectionsChange) {
          onDetectionsChange(detected);
        }

        // Dessiner les boîtes de détection
        predictions.forEach(prediction => {
          const [x, y, width, height] = prediction.bbox;
          
          // Boîte
          ctx.strokeStyle = '#00FF00';
          ctx.lineWidth = 3;
          ctx.strokeRect(x, y, width, height);
          
          // Label avec fond
          const text = `${prediction.class} ${Math.round(prediction.score * 100)}%`;
          ctx.font = '16px Arial';
          const textWidth = ctx.measureText(text).width;
          
          ctx.fillStyle = '#00FF00';
          ctx.fillRect(x, y - 25, textWidth + 10, 25);
          
          ctx.fillStyle = '#000000';
          ctx.fillText(text, x + 5, y - 7);
        });
      } catch (error) {
        console.error('Erreur de détection:', error);
      }

      animationFrameRef.current = requestAnimationFrame(detectObjects);
    };

    detectObjects();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [model, isActive, videoRef]);

  if (!isActive) return null;

  const translateObjectClass = (className: string): string => {
    const translations: Record<string, string> = {
      'person': 'personne',
      'bicycle': 'vélo',
      'car': 'voiture',
      'motorcycle': 'moto',
      'airplane': 'avion',
      'bus': 'bus',
      'train': 'train',
      'truck': 'camion',
      'boat': 'bateau',
      'traffic light': 'feu de circulation',
      'fire hydrant': 'bouche d\'incendie',
      'stop sign': 'panneau stop',
      'parking meter': 'parcmètre',
      'bench': 'banc',
      'bird': 'oiseau',
      'cat': 'chat',
      'dog': 'chien',
      'horse': 'cheval',
      'sheep': 'mouton',
      'cow': 'vache',
      'elephant': 'éléphant',
      'bear': 'ours',
      'zebra': 'zèbre',
      'giraffe': 'girafe',
      'backpack': 'sac à dos',
      'umbrella': 'parapluie',
      'handbag': 'sac à main',
      'tie': 'cravate',
      'suitcase': 'valise',
      'frisbee': 'frisbee',
      'skis': 'skis',
      'snowboard': 'snowboard',
      'sports ball': 'ballon',
      'kite': 'cerf-volant',
      'baseball bat': 'batte de baseball',
      'baseball glove': 'gant de baseball',
      'skateboard': 'skateboard',
      'surfboard': 'planche de surf',
      'tennis racket': 'raquette de tennis',
      'bottle': 'bouteille',
      'wine glass': 'verre à vin',
      'cup': 'tasse',
      'fork': 'fourchette',
      'knife': 'couteau',
      'spoon': 'cuillère',
      'bowl': 'bol',
      'banana': 'banane',
      'apple': 'pomme',
      'sandwich': 'sandwich',
      'orange': 'orange',
      'broccoli': 'brocoli',
      'carrot': 'carotte',
      'hot dog': 'hot dog',
      'pizza': 'pizza',
      'donut': 'donut',
      'cake': 'gâteau',
      'chair': 'chaise',
      'couch': 'canapé',
      'potted plant': 'plante en pot',
      'bed': 'lit',
      'dining table': 'table à manger',
      'toilet': 'toilettes',
      'tv': 'télévision',
      'laptop': 'ordinateur portable',
      'mouse': 'souris',
      'remote': 'télécommande',
      'keyboard': 'clavier',
      'cell phone': 'téléphone portable',
      'microwave': 'micro-ondes',
      'oven': 'four',
      'toaster': 'grille-pain',
      'sink': 'évier',
      'refrigerator': 'réfrigérateur',
      'book': 'livre',
      'clock': 'horloge',
      'vase': 'vase',
      'scissors': 'ciseaux',
      'teddy bear': 'ours en peluche',
      'hair drier': 'sèche-cheveux',
      'toothbrush': 'brosse à dents',
    };
    return translations[className] || className;
  };

  return (
    <div className="absolute inset-0 pointer-events-none z-10">
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
      />

      {/* Stats des objets détectés - Positioned to avoid top bar overlap */}
      {detections.length > 0 && (
        <Card className="absolute top-20 left-4 p-3 bg-black/60 backdrop-blur-md border-primary/30 max-h-48 overflow-y-auto pointer-events-auto">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2 text-white font-semibold mb-1">
              <Scan className="w-4 h-4 text-green-400" />
              <span className="text-sm">Objets détectés: {detections.length}</span>
            </div>
            {detections.slice(0, 5).map((obj, idx) => {
              const translatedClass = translateObjectClass(obj.class);
              return (
                <Badge key={idx} variant="secondary" className="bg-green-500/20 text-green-300 text-xs">
                  {translatedClass} ({Math.round(obj.score * 100)}%)
                </Badge>
              );
            })}
          </div>
        </Card>
      )}

      {/* Loading indicator - Positioned to avoid overlap */}
      {isLoading && (
        <Card className="absolute top-20 right-4 p-2 bg-black/60 backdrop-blur-md pointer-events-auto">
          <div className="flex items-center gap-2 text-white">
            <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            <span className="text-sm">Chargement du modèle IA...</span>
          </div>
        </Card>
      )}

      {/* Info - Positioned to avoid bottom controls */}
      <Card className="absolute bottom-48 left-4 p-2 bg-black/60 backdrop-blur-md border-primary/30 pointer-events-auto">
        <div className="text-xs text-white">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-green-400" />
            <span>IA Détection d'objets (80 catégories)</span>
          </div>
        </div>
      </Card>
    </div>
  );
};
