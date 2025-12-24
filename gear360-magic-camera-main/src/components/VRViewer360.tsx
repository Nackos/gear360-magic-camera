import { useEffect, useRef, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Maximize2, Minimize2, RotateCcw } from "lucide-react";

interface VRViewer360Props {
  imageUrl: string;
  onClose?: () => void;
}

export const VRViewer360 = ({ imageUrl, onClose }: VRViewer360Props) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isVRMode, setIsVRMode] = useState(false);
  const [rotation, setRotation] = useState({ x: 0, y: 0 });
  const animationFrameRef = useRef<number>();
  const deviceOrientationRef = useRef({ alpha: 0, beta: 0, gamma: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    img.crossOrigin = "anonymous";

    img.onload = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      render();
    };

    img.src = imageUrl;

    const render = () => {
      if (!ctx || !canvas) return;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      ctx.save();
      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.rotate(rotation.y * Math.PI / 180);
      ctx.translate(-canvas.width / 2, -canvas.height / 2);

      const aspectRatio = img.width / img.height;
      let drawWidth = canvas.width;
      let drawHeight = canvas.width / aspectRatio;

      if (drawHeight < canvas.height) {
        drawHeight = canvas.height;
        drawWidth = canvas.height * aspectRatio;
      }

      ctx.drawImage(
        img,
        (canvas.width - drawWidth) / 2,
        (canvas.height - drawHeight) / 2,
        drawWidth,
        drawHeight
      );

      ctx.restore();

      animationFrameRef.current = requestAnimationFrame(render);
    };

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [imageUrl, rotation]);

  // Device orientation for VR mode
  useEffect(() => {
    if (!isVRMode) return;

    const handleOrientation = (event: DeviceOrientationEvent) => {
      if (event.alpha !== null && event.beta !== null && event.gamma !== null) {
        deviceOrientationRef.current = {
          alpha: event.alpha,
          beta: event.beta,
          gamma: event.gamma
        };

        setRotation({
          x: event.beta - 90,
          y: event.gamma
        });
      }
    };

    window.addEventListener('deviceorientation', handleOrientation);

    return () => {
      window.removeEventListener('deviceorientation', handleOrientation);
    };
  }, [isVRMode]);

  // Touch/Mouse controls for non-VR mode
  useEffect(() => {
    if (isVRMode) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    let isDragging = false;
    let lastX = 0;
    let lastY = 0;

    const handleStart = (clientX: number, clientY: number) => {
      isDragging = true;
      lastX = clientX;
      lastY = clientY;
    };

    const handleMove = (clientX: number, clientY: number) => {
      if (!isDragging) return;

      const deltaX = clientX - lastX;
      const deltaY = clientY - lastY;

      setRotation(prev => ({
        x: prev.x + deltaY * 0.5,
        y: prev.y + deltaX * 0.5
      }));

      lastX = clientX;
      lastY = clientY;
    };

    const handleEnd = () => {
      isDragging = false;
    };

    const onMouseDown = (e: MouseEvent) => handleStart(e.clientX, e.clientY);
    const onMouseMove = (e: MouseEvent) => handleMove(e.clientX, e.clientY);
    const onMouseUp = () => handleEnd();

    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        handleStart(e.touches[0].clientX, e.touches[0].clientY);
      }
    };
    const onTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        handleMove(e.touches[0].clientX, e.touches[0].clientY);
      }
    };
    const onTouchEnd = () => handleEnd();

    canvas.addEventListener('mousedown', onMouseDown);
    canvas.addEventListener('mousemove', onMouseMove);
    canvas.addEventListener('mouseup', onMouseUp);
    canvas.addEventListener('touchstart', onTouchStart);
    canvas.addEventListener('touchmove', onTouchMove);
    canvas.addEventListener('touchend', onTouchEnd);

    return () => {
      canvas.removeEventListener('mousedown', onMouseDown);
      canvas.removeEventListener('mousemove', onMouseMove);
      canvas.removeEventListener('mouseup', onMouseUp);
      canvas.removeEventListener('touchstart', onTouchStart);
      canvas.removeEventListener('touchmove', onTouchMove);
      canvas.removeEventListener('touchend', onTouchEnd);
    };
  }, [isVRMode]);

  const toggleVRMode = async () => {
    if (!isVRMode) {
      // Request device orientation permission on iOS
      const DeviceOrientationEventAny = DeviceOrientationEvent as unknown as {
        requestPermission?: () => Promise<'granted' | 'denied'>;
      };

      if (typeof DeviceOrientationEventAny.requestPermission === 'function') {
        try {
          const permission = await DeviceOrientationEventAny.requestPermission();
          if (permission === 'granted') {
            setIsVRMode(true);
          }
        } catch (error) {
          console.error('Error requesting device orientation permission:', error);
        }
      } else {
        setIsVRMode(true);
      }
    } else {
      setIsVRMode(false);
    }
  };

  const resetView = () => {
    setRotation({ x: 0, y: 0 });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black">
      <canvas
        ref={canvasRef}
        className="w-full h-full"
      />

      <div className="absolute top-4 left-4 right-4 flex justify-between items-start z-10">
        <Card className="bg-black/50 backdrop-blur-sm border-white/20 p-2">
          <div className="flex gap-2">
            <Button
              size="icon"
              variant="ghost"
              onClick={toggleVRMode}
              className="text-white hover:bg-white/20"
            >
              {isVRMode ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
            </Button>
            <Button
              size="icon"
              variant="ghost"
              onClick={resetView}
              className="text-white hover:bg-white/20"
            >
              <RotateCcw className="w-5 h-5" />
            </Button>
          </div>
        </Card>

        {onClose && (
          <Button
            variant="ghost"
            onClick={onClose}
            className="text-white hover:bg-white/20"
          >
            Fermer
          </Button>
        )}
      </div>

      {isVRMode && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10">
          <Card className="bg-black/50 backdrop-blur-sm border-white/20 px-4 py-2">
            <p className="text-white text-sm">Mode VR activé - Bougez votre appareil</p>
          </Card>
        </div>
      )}
    </div>
  );
};
