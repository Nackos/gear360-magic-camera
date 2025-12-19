import { useEffect, useRef, useState } from 'react';
import { pipeline, ObjectDetectionPipeline } from '@huggingface/transformers';

interface MaskDetectionProps {
  isActive: boolean;
  videoRef: React.RefObject<HTMLVideoElement>;
}

interface Detection {
  score: number;
  label: string;
  box: {
    xmin: number;
    ymin: number;
    xmax: number;
    ymax: number;
  };
}

const MaskDetection = ({ isActive, videoRef }: MaskDetectionProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [detector, setDetector] = useState<ObjectDetectionPipeline | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const animationFrameRef = useRef<number>();

  useEffect(() => {
    const initDetector = async () => {
      try {
        console.log('Initializing mask detector...');
        const objectDetector = await pipeline(
          'object-detection',
          'Xenova/detr-resnet-50',
          { device: 'webgpu' }
        );
        setDetector(objectDetector);
        setIsLoading(false);
        console.log('Mask detector initialized successfully');
      } catch (error) {
        console.error('Error initializing mask detector:', error);
        setIsLoading(false);
      }
    };

    initDetector();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!isActive || !detector || !videoRef.current || !canvasRef.current) {
      return;
    }

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    if (!ctx) return;

    const detectMasks = async () => {
      if (!video.videoWidth || !video.videoHeight) {
        animationFrameRef.current = requestAnimationFrame(detectMasks);
        return;
      }

      // Set canvas size to match video
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      try {
        // Create a canvas to capture the current video frame
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = canvas.width;
        tempCanvas.height = canvas.height;
        const tempCtx = tempCanvas.getContext('2d');
        
        if (!tempCtx) return;
        
        // Draw current video frame to temp canvas
        tempCtx.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        // Detect objects from the canvas image
        const detections = await detector(tempCanvas.toDataURL(), {
          threshold: 0.5,
          percentage: true,
        }) as Detection[];

        // Filter for person/face detections
        const relevantDetections = detections.filter(
          d => d.label === 'person' || d.label === 'face'
        );

        // Draw detections
        relevantDetections.forEach((detection) => {
          const { box, label, score } = detection;
          const x = box.xmin * canvas.width;
          const y = box.ymin * canvas.height;
          const width = (box.xmax - box.xmin) * canvas.width;
          const height = (box.ymax - box.ymin) * canvas.height;

          // Draw bounding box
          ctx.strokeStyle = '#00ff00';
          ctx.lineWidth = 3;
          ctx.strokeRect(x, y, width, height);

          // Draw label background
          ctx.fillStyle = 'rgba(0, 255, 0, 0.8)';
          const labelText = `${label} ${(score * 100).toFixed(1)}%`;
          const textMetrics = ctx.measureText(labelText);
          ctx.fillRect(x, y - 25, textMetrics.width + 10, 25);

          // Draw label text
          ctx.fillStyle = '#000000';
          ctx.font = 'bold 16px Arial';
          ctx.fillText(labelText, x + 5, y - 7);
        });
      } catch (error) {
        console.error('Detection error:', error);
      }

      animationFrameRef.current = requestAnimationFrame(detectMasks);
    };

    detectMasks();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isActive, detector, videoRef]);

  if (!isActive) return null;

  return (
    <div className="absolute inset-0 pointer-events-none">
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
        style={{ objectFit: 'cover' }}
      />
      {isLoading && (
        <div className="absolute top-4 left-4 bg-black/60 text-white px-4 py-2 rounded-lg">
          Chargement du détecteur de masques...
        </div>
      )}
    </div>
  );
};

export default MaskDetection;
