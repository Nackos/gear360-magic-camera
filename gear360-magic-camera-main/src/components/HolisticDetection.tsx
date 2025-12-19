import { useEffect, useRef, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, Scan, Eye } from 'lucide-react';
import { FaceDetector, FilesetResolver, Detection } from '@mediapipe/tasks-vision';

interface PersonData {
  id: number;
  faceDetected: boolean;
  boundingBox?: { x: number; y: number; width: number; height: number };
  confidence: number;
  landmarks?: Array<{ x: number; y: number }>;
}

interface HolisticDetectionProps {
  videoRef: React.RefObject<HTMLVideoElement>;
  isActive: boolean;
  onPersonDataChange?: (people: PersonData[]) => void;
}

export const HolisticDetection = ({ videoRef, isActive, onPersonDataChange }: HolisticDetectionProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [faceDetector, setFaceDetector] = useState<FaceDetector | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [peopleData, setPeopleData] = useState<PersonData[]>([]);
  const animationRef = useRef<number>();
  const lastVideoTime = useRef(-1);

  // Initialiser MediaPipe Face Detector
  useEffect(() => {
    if (!isActive) return;

    const initializeFaceDetector = async () => {
      try {
        setIsLoading(true);
        const vision = await FilesetResolver.forVisionTasks(
          "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"
        );

        const detector = await FaceDetector.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath: "https://storage.googleapis.com/mediapipe-models/face_detector/blaze_face_short_range/float16/1/blaze_face_short_range.tflite",
            delegate: "GPU"
          },
          runningMode: "VIDEO",
          minDetectionConfidence: 0.6 // Increased for better accuracy
        });

        setFaceDetector(detector);
        console.log('Face detector initialized successfully');
      } catch (error) {
        console.error('Error initializing face detector:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeFaceDetector();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isActive]);

  // Détecter les visages en temps réel
  useEffect(() => {
    if (!faceDetector || !isActive || !videoRef.current) return;

    const detectFaces = async () => {
      const video = videoRef.current;
      const canvas = canvasRef.current;

      if (!video || !canvas || video.readyState !== video.HAVE_ENOUGH_DATA) {
        animationRef.current = requestAnimationFrame(detectFaces);
        return;
      }

      // Optimisation avancée: traiter 1 frame sur 2 pour performance
      if (video.currentTime === lastVideoTime.current) {
        animationRef.current = requestAnimationFrame(detectFaces);
        return;
      }
      
      // Skip alternate frames for better performance
      const shouldProcess = Math.floor(video.currentTime * 30) % 2 === 0;
      if (!shouldProcess) {
        lastVideoTime.current = video.currentTime;
        animationRef.current = requestAnimationFrame(detectFaces);
        return;
      }
      
      lastVideoTime.current = video.currentTime;

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      try {
        const startTimeMs = performance.now();
        const detections = faceDetector.detectForVideo(video, startTimeMs);

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        const people: PersonData[] = detections.detections.map((detection: Detection, index: number) => {
          const box = detection.boundingBox;
          if (!box) return null;

          // Dessiner le rectangle autour du visage
          ctx.strokeStyle = '#00FF88';
          ctx.lineWidth = 3;
          ctx.strokeRect(box.originX, box.originY, box.width, box.height);

          // Dessiner les points clés du visage
          if (detection.keypoints) {
            detection.keypoints.forEach((keypoint) => {
              ctx.fillStyle = '#FF0088';
              ctx.beginPath();
              ctx.arc(keypoint.x, keypoint.y, 3, 0, 2 * Math.PI);
              ctx.fill();
            });
          }

          // Label avec confiance
          const confidence = Math.round((detection.categories[0]?.score || 0) * 100);
          const label = `Personne ${index + 1} (${confidence}%)`;
          ctx.font = 'bold 16px Arial';
          const textWidth = ctx.measureText(label).width;

          ctx.fillStyle = '#00FF88';
          ctx.fillRect(box.originX, box.originY - 30, textWidth + 10, 30);

          ctx.fillStyle = '#000000';
          ctx.fillText(label, box.originX + 5, box.originY - 8);

          const personData: PersonData = {
            id: index,
            faceDetected: true,
            boundingBox: {
              x: box.originX,
              y: box.originY,
              width: box.width,
              height: box.height
            },
            confidence: detection.categories[0]?.score || 0,
            landmarks: detection.keypoints?.map(kp => ({ x: kp.x, y: kp.y }))
          };
          
          return personData;
        }).filter((p): p is PersonData => p !== null);

        setPeopleData(people);
        
        if (onPersonDataChange) {
          onPersonDataChange(people);
        }
      } catch (error) {
        console.error('Error detecting faces:', error);
      }

      animationRef.current = requestAnimationFrame(detectFaces);
    };

    detectFaces();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [faceDetector, isActive, videoRef, onPersonDataChange]);

  if (!isActive) return null;

  return (
    <div className="absolute inset-0 pointer-events-none z-20">
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
      />

      {/* Stats de détection - Positioned to avoid top bar overlap */}
      <Card className="absolute top-20 left-4 p-3 bg-black/60 backdrop-blur-md border-primary/30 pointer-events-auto">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2 text-white font-semibold">
            <Users className="w-4 h-4 text-green-400" />
            <span className="text-sm">Personnes: {peopleData.length}</span>
          </div>
          
          {peopleData.length > 0 && (
            <div className="flex flex-col gap-1">
              {peopleData.slice(0, 3).map((person) => (
                <div key={person.id} className="flex items-center gap-2">
                  <Eye className="w-3 h-3 text-green-400" />
                  <Badge variant="secondary" className="bg-green-500/20 text-green-300 text-xs">
                    P{person.id + 1}: {Math.round(person.confidence * 100)}%
                  </Badge>
                </div>
              ))}
              {peopleData.length > 3 && (
                <span className="text-xs text-muted-foreground">
                  +{peopleData.length - 3} autres...
                </span>
              )}
            </div>
          )}
        </div>
      </Card>

      {/* Loading - Positioned to avoid overlap */}
      {isLoading && (
        <Card className="absolute top-20 right-4 p-2 bg-black/60 backdrop-blur-md pointer-events-auto">
          <div className="flex items-center gap-2 text-white">
            <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            <span className="text-sm">Chargement IA...</span>
          </div>
        </Card>
      )}

      {/* Info technique - Positioned to avoid bottom controls */}
      <Card className="absolute bottom-48 left-4 p-2 bg-black/60 backdrop-blur-md border-primary/30 pointer-events-auto">
        <div className="text-xs text-white flex items-center gap-2">
          <Scan className="w-3 h-3 text-green-400" />
          <span>MediaPipe Face Detection (GPU)</span>
        </div>
      </Card>
    </div>
  );
};
