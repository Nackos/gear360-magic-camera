import { useEffect, useRef, useState } from 'react';
import { PoseLandmarker, FilesetResolver, DrawingUtils } from '@mediapipe/tasks-vision';
import { Card } from './ui/card';
import { Badge } from './ui/badge';

interface PoseData {
  landmarks: any[];
  worldLandmarks: any[];
  confidence: number;
}

interface FullBodyEstimationProps {
  videoRef: React.RefObject<HTMLVideoElement>;
  isActive: boolean;
  onPoseDataChange?: (poses: PoseData[]) => void;
}

// Extracted function to calculate pose data
const processPoseData = (landmarks: any[], worldLandmarks: any[]): PoseData => {
  let totalConfidence = 0;
  landmarks.forEach((landmark: any) => {
    totalConfidence += landmark.visibility || 0;
  });
  const avgConfidence = totalConfidence / landmarks.length;

  return {
    landmarks,
    worldLandmarks,
    confidence: avgConfidence
  };
};

// Extracted function to draw pose
const drawPose = (drawingUtils: DrawingUtils, landmarks: any[]) => {
  drawingUtils.drawLandmarks(landmarks, {
    radius: (data: any) => DrawingUtils.lerp(data.from!.z, -0.15, 0.1, 5, 1)
  });

  drawingUtils.drawConnectors(
    landmarks,
    PoseLandmarker.POSE_CONNECTIONS,
    { color: '#00FF00', lineWidth: 2 }
  );
};

const FullBodyEstimation = ({ videoRef, isActive, onPoseDataChange }: FullBodyEstimationProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [poseLandmarker, setPoseLandmarker] = useState<PoseLandmarker | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [poseData, setPoseData] = useState<PoseData[]>([]);
  const animationFrameId = useRef<number>();

  // Initialize MediaPipe Pose Landmarker
  useEffect(() => {
    if (!isActive) return;

    let isMounted = true;

    const initializePoseLandmarker = async () => {
      try {
        const vision = await FilesetResolver.forVisionTasks(
          'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm'
        );

        const landmarker = await PoseLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath: 'https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task',
            delegate: 'GPU'
          },
          runningMode: 'VIDEO',
          numPoses: 2,
          minPoseDetectionConfidence: 0.6,
          minPosePresenceConfidence: 0.6,
          minTrackingConfidence: 0.6
        });

        if (isMounted) {
          setPoseLandmarker(landmarker);
          setIsLoading(false);
        }
      } catch (error) {
        console.error('Error initializing Pose Landmarker:', error);
        setIsLoading(false);
      }
    };

    initializePoseLandmarker();

    return () => {
      isMounted = false;
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, [isActive]);

  // Perform pose detection
  useEffect(() => {
    if (!poseLandmarker || !isActive || !videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let lastVideoTime = -1;

    const detectPose = async () => {
      if (!video || video.readyState < 2) {
        animationFrameId.current = requestAnimationFrame(detectPose);
        return;
      }

      // Set canvas dimensions to match video
      if (canvas.width !== video.videoWidth || canvas.height !== video.videoHeight) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
      }

      const currentTime = video.currentTime;

      // Optimisation: traiter 1 frame sur 3 pour meilleure performance
      if (currentTime !== lastVideoTime) {
        const shouldProcess = Math.floor(currentTime * 30) % 3 === 0;
        if (!shouldProcess) {
          lastVideoTime = currentTime;
          animationFrameId.current = requestAnimationFrame(detectPose);
          return;
        }
        lastVideoTime = currentTime;

        try {
          const results = poseLandmarker.detectForVideo(video, performance.now());

          // Clear canvas
          ctx.clearRect(0, 0, canvas.width, canvas.height);

          if (results.landmarks && results.landmarks.length > 0) {
            const drawingUtils = new DrawingUtils(ctx);
            const poses: PoseData[] = [];

            results.landmarks.forEach((landmarks, index) => {
              const worldLandmarks = results.worldLandmarks?.[index] || [];
              const pose = processPoseData(landmarks, worldLandmarks);
              poses.push(pose);

              drawPose(drawingUtils, landmarks);
            });

            setPoseData(poses);
            if (onPoseDataChange) {
              onPoseDataChange(poses);
            }
          } else {
            setPoseData([]);
            if (onPoseDataChange) {
              onPoseDataChange([]);
            }
          }
        } catch (error) {
          console.error('Error detecting pose:', error);
        }
      }

      animationFrameId.current = requestAnimationFrame(detectPose);
    };

    detectPose();

    return () => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, [poseLandmarker, isActive, videoRef, onPoseDataChange]);

  if (!isActive) return null;

  return (
    <div className="absolute inset-0 pointer-events-none z-20">
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full object-cover"
      />

      {/* Pose Information Display - Positioned to avoid top bar overlap */}
      <div className="absolute top-20 right-4 space-y-2 pointer-events-auto">
        {isLoading ? (
          <Card className="p-3 bg-black/60 backdrop-blur-md">
            <p className="text-sm text-white">Chargement du modèle IA...</p>
          </Card>
        ) : (
          <>
            <Card className="p-3 bg-black/60 backdrop-blur-md border-primary/30">
              <div className="flex items-center gap-2">
                <Badge variant="default" className="bg-primary">
                  {poseData.length} {poseData.length === 1 ? 'Personne' : 'Personnes'}
                </Badge>
              </div>
              {poseData.map((pose, index) => (
                <div key={index} className="mt-2">
                  <p className="text-xs text-white">
                    Confiance: {(pose.confidence * 100).toFixed(0)}%
                  </p>
                  <p className="text-xs text-white">
                    Points détectés: {pose.landmarks.length}
                  </p>
                </div>
              ))}
            </Card>

            <Card className="p-3 bg-black/60 backdrop-blur-md border-primary/30">
              <p className="text-xs font-medium text-white">MediaPipe Pose</p>
              <p className="text-xs text-muted-foreground">Détection 33 points</p>
            </Card>
          </>
        )}
      </div>
    </div>
  );
};

export default FullBodyEstimation;
