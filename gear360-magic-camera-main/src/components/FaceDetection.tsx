import { useEffect, useRef, useState } from 'react';
import { pipeline } from '@huggingface/transformers';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Eye, Users } from 'lucide-react';

interface Face {
  x: number;
  y: number;
  width: number;
  height: number;
  confidence: number;
}

interface FaceDetectionProps {
  videoRef: React.RefObject<HTMLVideoElement>;
  isActive: boolean;
}

export const FaceDetection = ({ videoRef, isActive }: FaceDetectionProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [faces, setFaces] = useState<Face[]>([]);
  const [detector, setDetector] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isActive && !detector) {
      initializeDetector();
    }
  }, [isActive, detector]);

  const initializeDetector = async () => {
    try {
      setIsLoading(true);
      const faceDetector = await pipeline(
        'object-detection',
        'Xenova/detr-resnet-50',
        { device: 'webgpu' }
      );
      setDetector(faceDetector);
    } catch (error) {
      console.error('Erreur lors de l\'initialisation du détecteur:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!detector || !isActive || !videoRef.current) return;

    const detectFaces = async () => {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      
      if (!video || !canvas || video.videoWidth === 0) return;

      try {
        const results = await detector(video);
        const detectedFaces = results
          .filter((result: any) => result.label === 'person' && result.score > 0.5)
          .map((result: any) => ({
            x: result.box.xmin,
            y: result.box.ymin,
            width: result.box.xmax - result.box.xmin,
            height: result.box.ymax - result.box.ymin,
            confidence: result.score
          }));

        setFaces(detectedFaces);
      } catch (error) {
        console.error('Erreur de détection:', error);
      }
    };

    const interval = setInterval(detectFaces, 200);
    return () => clearInterval(interval);
  }, [detector, isActive, videoRef]);

  if (!isActive) return null;

  return (
    <div className="absolute inset-0 pointer-events-none">
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
        style={{ display: 'none' }}
      />
      
      {/* Face detection overlay */}
      {faces.map((face, index) => (
        <div
          key={index}
          className="absolute border-2 border-samsung-blue animate-pulse"
          style={{
            left: `${face.x}px`,
            top: `${face.y}px`,
            width: `${face.width}px`,
            height: `${face.height}px`,
          }}
        >
          <Badge 
            className="absolute -top-6 left-0 bg-samsung-blue text-white text-xs"
            variant="secondary"
          >
            <Eye className="w-3 h-3 mr-1" />
            {Math.round(face.confidence * 100)}%
          </Badge>
        </div>
      ))}

      {/* Face count indicator */}
      {faces.length > 0 && (
        <Card className="absolute top-4 left-4 p-2 bg-black/40 backdrop-blur-sm border-samsung-blue">
          <div className="flex items-center gap-2 text-white">
            <Users className="w-4 h-4" />
            <span className="text-sm font-medium">
              {faces.length} visage{faces.length > 1 ? 's' : ''} détecté{faces.length > 1 ? 's' : ''}
            </span>
          </div>
        </Card>
      )}

      {/* Loading indicator */}
      {isLoading && (
        <Card className="absolute top-4 right-4 p-2 bg-black/40 backdrop-blur-sm">
          <div className="flex items-center gap-2 text-white">
            <div className="w-4 h-4 border-2 border-samsung-blue border-t-transparent rounded-full animate-spin" />
            <span className="text-sm">Chargement IA...</span>
          </div>
        </Card>
      )}
    </div>
  );
};