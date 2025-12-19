import { useEffect, useRef, useState, useCallback } from 'react';
import * as tf from '@tensorflow/tfjs';
import { load as loadCocoSsd, ObjectDetection as CocoSsdModel } from '@tensorflow-models/coco-ssd';
import { HandLandmarker, FilesetResolver, DrawingUtils } from '@mediapipe/tasks-vision';
import { loadAISettings } from '@/config/aiDetectionConfig';
import { useGestureCommand } from './CommandController';

interface Detection {
  bbox: [number, number, number, number];
  class: string;
  score: number;
}

interface HandKeypoint {
  x: number;
  y: number;
  z: number;
}

interface GestureBufferEntry {
  keypoints: HandKeypoint[];
  timestamp: number;
}

interface IntegratedDetectionPipelineProps {
  videoRef: React.RefObject<HTMLVideoElement>;
  isActive: boolean;
  onDetections?: (detections: Detection[]) => void;
  onGesture?: (gesture: string, confidence: number) => void;
}

export const IntegratedDetectionPipeline = ({
  videoRef,
  isActive,
  onDetections,
  onGesture
}: IntegratedDetectionPipelineProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [detectionModel, setDetectionModel] = useState<CocoSsdModel | null>(null);
  const [handLandmarker, setHandLandmarker] = useState<HandLandmarker | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentGesture, setCurrentGesture] = useState<string>('');
  const [gestureConfidence, setGestureConfidence] = useState<number>(0);

  const gestureBufferRef = useRef<GestureBufferEntry[]>([]);
  const animationFrameRef = useRef<number>();
  const lastProcessTimeRef = useRef<number>(0);
  const frameSkipCounterRef = useRef<number>(0);

  const { triggerCommand } = useGestureCommand();
  const settings = loadAISettings();

  // Initialiser TensorFlow.js et COCO-SSD
  useEffect(() => {
    const initDetectionModel = async () => {
      try {
        console.log('🔄 Initialisation TensorFlow.js...');
        await tf.ready();
        console.log('✅ TensorFlow.js prêt, backend:', tf.getBackend());

        const model = await loadCocoSsd({
          base: 'lite_mobilenet_v2' // Plus léger et rapide
        });
        setDetectionModel(model);
        console.log('✅ Modèle COCO-SSD chargé');
      } catch (error) {
        console.error('❌ Erreur chargement modèle détection:', error);
      }
    };

    initDetectionModel();

    return () => {
      if (detectionModel) {
        detectionModel.dispose();
      }
    };
  }, []);

  // Initialiser MediaPipe Hand Landmarker
  useEffect(() => {
    const initHandLandmarker = async () => {
      try {
        console.log('🔄 Initialisation MediaPipe HandLandmarker...');
        const vision = await FilesetResolver.forVisionTasks(
          'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm'
        );

        const landmarker = await HandLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath: 'https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/latest/hand_landmarker.task',
            delegate: 'GPU'
          },
          runningMode: 'VIDEO',
          numHands: 2,
          minHandDetectionConfidence: settings.pose.minDetectionConfidence,
          minHandPresenceConfidence: settings.pose.minDetectionConfidence,
          minTrackingConfidence: settings.pose.minTrackingConfidence
        });

        setHandLandmarker(landmarker);
        console.log('✅ MediaPipe HandLandmarker chargé');
      } catch (error) {
        console.error('❌ Erreur chargement HandLandmarker:', error);
      }
    };

    initHandLandmarker();

    return () => {
      if (handLandmarker) {
        handLandmarker.close();
      }
    };
  }, []);

  // Classifier de gestes basé sur les keypoints
  const classifyGesture = useCallback((keypoints: HandKeypoint[]): { gesture: string; confidence: number } => {
    if (keypoints.length !== 21) return { gesture: 'unknown', confidence: 0 };

    const thumb_tip = keypoints[4];
    const index_tip = keypoints[8];
    const middle_tip = keypoints[12];
    const ring_tip = keypoints[16];
    const pinky_tip = keypoints[20];
    const wrist = keypoints[0];
    const index_mcp = keypoints[5];

    // Pouce levé (thumbs up)
    if (thumb_tip.y < index_tip.y && thumb_tip.y < middle_tip.y) {
      const allFingersDown =
        index_tip.y > index_mcp.y &&
        middle_tip.y > keypoints[9].y &&
        ring_tip.y > keypoints[13].y &&
        pinky_tip.y > keypoints[17].y;

      if (allFingersDown) {
        return { gesture: 'pouce_haut', confidence: 0.85 };
      }
    }

    // V-sign (index + majeur levés)
    const indexUp = index_tip.y < index_mcp.y;
    const middleUp = middle_tip.y < keypoints[9].y;
    const ringDown = ring_tip.y > keypoints[13].y;
    const pinkyDown = pinky_tip.y > keypoints[17].y;

    if (indexUp && middleUp && ringDown && pinkyDown) {
      return { gesture: 'v_sign', confidence: 0.82 };
    }

    // Index pointé
    if (indexUp && !middleUp && ringDown && pinkyDown) {
      return { gesture: 'index_point', confidence: 0.80 };
    }

    // Paume ouverte (tous les doigts étendus)
    const allFingersUp =
      indexUp && middleUp &&
      ring_tip.y < keypoints[13].y &&
      pinky_tip.y < keypoints[17].y;

    if (allFingersUp) {
      return { gesture: 'paume', confidence: 0.78 };
    }

    // Poing fermé (tous les doigts repliés)
    const allFingersDown =
      index_tip.y > index_mcp.y &&
      middle_tip.y > keypoints[9].y &&
      ring_tip.y > keypoints[13].y &&
      pinky_tip.y > keypoints[17].y;

    if (allFingersDown) {
      return { gesture: 'poing', confidence: 0.75 };
    }

    return { gesture: 'unknown', confidence: 0 };
  }, []);

  // Détection de swipes sur le buffer temporel
  const detectSwipeGesture = useCallback((buffer: GestureBufferEntry[]): { gesture: string; confidence: number } | null => {
    if (buffer.length < settings.gesture.windowSize * 0.75) return null;

    const firstEntry = buffer[0];
    const lastEntry = buffer[buffer.length - 1];

    const startKeypoint = firstEntry?.keypoints[9];
    const endKeypoint = lastEntry?.keypoints[9];

    if (!startKeypoint || !endKeypoint) return null;

    const startPoint = firstEntry.keypoints[9]; // Middle finger MCP
    const endPoint = lastEntry.keypoints[9];

    const deltaX = endPoint.x - startPoint.x;
    const deltaY = endPoint.y - startPoint.y;
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

    const minSwipeDistance = 0.15; // 15% de l'écran

    if (distance < minSwipeDistance) return null;

    const angle = Math.atan2(deltaY, deltaX) * (180 / Math.PI);

    // Swipe droite
    if (angle > -45 && angle < 45) {
      return { gesture: 'swipe_droite', confidence: 0.75 };
    }
    // Swipe gauche
    if (Math.abs(angle) > 135) {
      return { gesture: 'swipe_gauche', confidence: 0.75 };
    }
    // Swipe bas
    if (angle > 45 && angle < 135) {
      return { gesture: 'swipe_bas', confidence: 0.70 };
    }
    // Swipe haut
    if (angle < -45 && angle > -135) {
      return { gesture: 'swipe_haut', confidence: 0.70 };
    }

    return null;
  }, [settings.gesture.windowSize]);

  // Pipeline de traitement principal
  const processFrame = useCallback(async () => {
    if (!isActive || !videoRef.current || !detectionModel || !handLandmarker || !canvasRef.current) {
      return;
    }

    const video = videoRef.current;
    const canvas = canvasRef.current;

    if (video.readyState !== 4) return;

    // Skip frames pour optimisation (traiter 1 frame sur 2)
    frameSkipCounterRef.current++;
    if (frameSkipCounterRef.current % 2 !== 0) {
      animationFrameRef.current = requestAnimationFrame(processFrame);
      return;
    }

    const now = performance.now();
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    setIsProcessing(true);

    try {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      // 1. Détection d'objets avec COCO-SSD (recherche de personnes)
      const detections = await detectionModel.detect(video);
      const personDetections = detections.filter(d => d.class === 'person' && d.score > settings.detection.confThreshold);

      if (onDetections) {
        onDetections(personDetections.map(d => ({
          bbox: d.bbox as [number, number, number, number],
          class: d.class,
          score: d.score
        })));
      }

      // 2. Pour chaque personne détectée, chercher les mains dans la ROI
      if (personDetections.length > 0) {
        const startTimeMs = performance.now();
        const handResults = handLandmarker.detectForVideo(video, startTimeMs);

        if (handResults.landmarks && handResults.landmarks.length > 0) {
          // Extraire les keypoints de la première main
          const firstHandLandmarks = handResults.landmarks[0];
          const keypoints: HandKeypoint[] = firstHandLandmarks.map(lm => ({
            x: lm.x,
            y: lm.y,
            z: lm.z || 0
          }));

          // Ajouter au buffer circulaire
          gestureBufferRef.current.push({
            keypoints,
            timestamp: now
          });

          // Maintenir la taille du buffer
          if (gestureBufferRef.current.length > settings.gesture.windowSize) {
            gestureBufferRef.current.shift();
          }

          // 3. Classification de geste statique
          const staticGesture = classifyGesture(keypoints);

          // 4. Détection de geste dynamique (swipes)
          const dynamicGesture = detectSwipeGesture(gestureBufferRef.current);

          // Prioriser le geste dynamique sur le statique
          const finalGesture = dynamicGesture || staticGesture;

          if (finalGesture.confidence >= settings.gesture.confThreshold) {
            setCurrentGesture(finalGesture.gesture);
            setGestureConfidence(finalGesture.confidence);

            if (onGesture) {
              onGesture(finalGesture.gesture, finalGesture.confidence);
            }

            // Déclencher la commande associée
            const commandMapping = settings.commands.gestureCommandMap[finalGesture.gesture];
            if (commandMapping && finalGesture.confidence >= settings.commands.defaultActionConfidence) {
              triggerCommand(commandMapping.action, finalGesture.gesture, finalGesture.confidence);
            }

            // Clear buffer après détection de swipe pour éviter répétitions
            if (dynamicGesture) {
              gestureBufferRef.current = [];
            }
          }

          // Dessiner les landmarks
          ctx.save();
          const drawingUtils = new DrawingUtils(ctx);
          for (const landmarks of handResults.landmarks) {
            drawingUtils.drawConnectors(landmarks, HandLandmarker.HAND_CONNECTIONS, {
              color: '#00FF00',
              lineWidth: 2
            });
            drawingUtils.drawLandmarks(landmarks, {
              color: '#FF0000',
              lineWidth: 1,
              radius: 3
            });
          }
          ctx.restore();
        }
      }

      // Dessiner les bounding boxes des détections
      ctx.strokeStyle = '#00FF00';
      ctx.lineWidth = 2;
      ctx.font = '16px Arial';
      ctx.fillStyle = '#00FF00';

      personDetections.forEach(detection => {
        const [x, y, width, height] = detection.bbox;
        ctx.strokeRect(x, y, width, height);
        ctx.fillText(
          `${detection.class} ${(detection.score * 100).toFixed(1)}%`,
          x,
          y > 20 ? y - 5 : y + 20
        );
      });

    } catch (error) {
      console.error('Erreur traitement frame:', error);
    } finally {
      setIsProcessing(false);
      lastProcessTimeRef.current = now;
    }

    animationFrameRef.current = requestAnimationFrame(processFrame);
  }, [
    isActive,
    videoRef,
    detectionModel,
    handLandmarker,
    settings,
    onDetections,
    onGesture,
    classifyGesture,
    detectSwipeGesture,
    triggerCommand
  ]);

  // Démarrer/arrêter le traitement
  useEffect(() => {
    if (isActive && detectionModel && handLandmarker) {
      gestureBufferRef.current = [];
      frameSkipCounterRef.current = 0;
      animationFrameRef.current = requestAnimationFrame(processFrame);
    }

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isActive, detectionModel, handLandmarker, processFrame]);

  return (
    <div className="absolute inset-0 pointer-events-none">
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
        style={{ mixBlendMode: 'normal' }}
      />

      {/* Overlay d'état */}
      {isActive && (
        <div className="absolute top-4 right-4 bg-black/70 text-white px-3 py-2 rounded-lg text-sm backdrop-blur-sm">
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${isProcessing ? 'bg-green-500 animate-pulse' : 'bg-gray-500'}`} />
            <span>Pipeline IA</span>
          </div>
          {currentGesture && currentGesture !== 'unknown' && (
            <div className="mt-1 text-xs">
              Geste: <span className="font-bold">{currentGesture}</span>
              <span className="ml-2 opacity-70">({(gestureConfidence * 100).toFixed(0)}%)</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
