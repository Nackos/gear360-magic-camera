import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { loadAISettings } from '@/config/aiDetectionConfig';

interface GestureCommand {
  action: string;
  gesture: {
    type: string;
    confidence: number;
    timestamp: number;
  };
}

interface CommandControllerProps {
  onCommand?: (command: string) => void;
}

export const CommandController = ({ onCommand }: CommandControllerProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const settings = loadAISettings();

  const executeCommand = (command: string, gestureType: string) => {
    console.log(`Exécution de la commande: ${command} (geste: ${gestureType})`);

    // Mapper les commandes aux actions de l'application
    switch (command) {
      case 'capture':
        // Déclencher capture photo
        const captureEvent = new CustomEvent('gesture-capture');
        window.dispatchEvent(captureEvent);
        toast({
          title: "📸 Capture déclenchée",
          description: `Geste: ${gestureType}`,
          duration: 2000
        });
        break;

      case 'pause':
      case 'stop_recording':
        // Arrêter l'enregistrement vidéo
        const stopEvent = new CustomEvent('gesture-stop-recording');
        window.dispatchEvent(stopEvent);
        toast({
          title: "⏹️ Enregistrement arrêté",
          description: `Geste: ${gestureType}`,
          duration: 2000
        });
        break;

      case 'next':
        // Navigation suivant (galerie)
        toast({
          title: "➡️ Suivant",
          description: `Geste: ${gestureType}`,
          duration: 1500
        });
        break;

      case 'prev':
        // Navigation précédent
        toast({
          title: "⬅️ Précédent",
          description: `Geste: ${gestureType}`,
          duration: 1500
        });
        break;

      case 'like':
        // Ajouter aux favoris
        toast({
          title: "👍 Favori ajouté",
          description: `Geste: ${gestureType}`,
          duration: 1500
        });
        break;

      case 'dislike':
        // Supprimer des favoris
        toast({
          title: "👎 Retiré",
          description: `Geste: ${gestureType}`,
          duration: 1500
        });
        break;

      case 'selfie':
        // Activer mode selfie
        const selfieEvent = new CustomEvent('gesture-selfie-mode');
        window.dispatchEvent(selfieEvent);
        toast({
          title: "🤳 Mode Selfie",
          description: `Geste: ${gestureType}`,
          duration: 2000
        });
        break;

      case 'switch_camera':
        // Changer de caméra
        const switchEvent = new CustomEvent('gesture-switch-camera');
        window.dispatchEvent(switchEvent);
        toast({
          title: "🔄 Changement de caméra",
          description: `Geste: ${gestureType}`,
          duration: 2000
        });
        break;

      case 'zoom_in':
        // Zoom avant
        const zoomInEvent = new CustomEvent('gesture-zoom-in');
        window.dispatchEvent(zoomInEvent);
        break;

      case 'scroll_up':
      case 'scroll_down':
        // Défiler
        const scrollEvent = new CustomEvent('gesture-scroll', {
          detail: { direction: command.includes('up') ? 'up' : 'down' }
        });
        window.dispatchEvent(scrollEvent);
        break;

      case 'confirm':
        // Confirmation
        toast({
          title: "✅ Confirmé",
          description: `Geste: ${gestureType}`,
          duration: 1500
        });
        break;

      case 'select':
        // Sélection
        const selectEvent = new CustomEvent('gesture-select');
        window.dispatchEvent(selectEvent);
        break;

      default:
        console.log(`Commande non mappée: ${command}`);
    }

    // Callback optionnel
    if (onCommand) {
      onCommand(command);
    }
  };

  useEffect(() => {
    // Écouter les événements de commandes gestuelles
    const handleGestureCommand = (event: CustomEvent<GestureCommand>) => {
      const { action, gesture } = event.detail;
      
      // Vérifier la confiance minimum
      if (gesture.confidence >= settings.commands.defaultActionConfidence) {
        executeCommand(action, gesture.type);
      }
    };

    window.addEventListener('gesture-command', handleGestureCommand as EventListener);

    return () => {
      window.removeEventListener('gesture-command', handleGestureCommand as EventListener);
    };
  }, [settings]);

  return null; // Composant logique uniquement
};

// Hook pour déclencher des commandes depuis n'importe où
export const useGestureCommand = () => {
  const triggerCommand = (action: string, gestureType: string, confidence: number = 1.0) => {
    const event = new CustomEvent('gesture-command', {
      detail: {
        action,
        gesture: {
          type: gestureType,
          confidence,
          timestamp: Date.now()
        }
      }
    });
    window.dispatchEvent(event);
  };

  return { triggerCommand };
};
