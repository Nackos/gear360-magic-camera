import { useState, useEffect, useRef, useCallback } from "react";
import { Mic, MicOff, Volume2, VolumeX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

interface Detection {
  class: string;
  score: number;
  bbox: number[];
}

interface AIVoiceControlProps {
  detections: Detection[];
  isActive: boolean;
}

// Local types for Speech Recognition
interface SpeechRecognitionEvent extends Event {
  results: {
    length: number;
    [index: number]: {
      length: number;
      [index: number]: {
        transcript: string;
      };
    };
  };
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
}

interface CustomSpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: (event: SpeechRecognitionEvent) => void;
  onerror: (event: SpeechRecognitionErrorEvent) => void;
  onend: () => void;
  start: () => void;
  stop: () => void;
}

export const AIVoiceControl = ({ detections, isActive }: AIVoiceControlProps) => {
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [lastCommand, setLastCommand] = useState("");
  const [aiResponse, setAiResponse] = useState("");
  const recognitionRef = useRef<CustomSpeechRecognition | null>(null);
  const detectionsRef = useRef(detections);
  const { toast } = useToast();

  // Update ref when detections change
  useEffect(() => {
    detectionsRef.current = detections;
  }, [detections]);

  const speak = useCallback((text: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'fr-FR';
      utterance.rate = 1;
      utterance.pitch = 1;

      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);

      window.speechSynthesis.speak(utterance);
    }
  }, []);

  const processCommand = useCallback((command: string) => {
    const lowerCommand = command.toLowerCase();
    let response = "";

    // Commandes de comptage
    if (lowerCommand.includes("combien") || lowerCommand.includes("nombre")) {
      if (lowerCommand.includes("personne") || lowerCommand.includes("gens")) {
        const peopleCount = detectionsRef.current.filter(d => d.class === "person").length;
        response = `Je vois ${peopleCount} personne${peopleCount > 1 ? 's' : ''}.`;
      } else if (lowerCommand.includes("objet")) {
        response = `Je détecte ${detectionsRef.current.length} objet${detectionsRef.current.length > 1 ? 's' : ''}.`;
      }
    }

    // Commandes de localisation
    else if (lowerCommand.includes("où") || lowerCommand.includes("trouve")) {
      const splitByOu = lowerCommand.split("où");
      const splitByTrouve = lowerCommand.split("trouve");
      const searchTerm = (splitByOu.length > 1 ? splitByOu[1] : splitByTrouve[1])?.trim();

      const foundObjects = searchTerm
        ? detectionsRef.current.filter(d =>
          searchTerm.toLowerCase().includes(d.class.toLowerCase())
        )
        : [];

      if (foundObjects.length > 0) {
        response = `J'ai trouvé ${foundObjects.length} ${foundObjects[0].class}${foundObjects.length > 1 ? 's' : ''}.`;
      } else {
        response = "Je ne trouve pas cet objet dans le champ de vision.";
      }
    }

    // Commandes d'information
    else if (lowerCommand.includes("que vois-tu") || lowerCommand.includes("qu'est-ce que tu vois")) {
      if (detectionsRef.current.length === 0) {
        response = "Je ne détecte aucun objet pour le moment.";
      } else {
        const uniqueClasses = [...new Set(detectionsRef.current.map(d => d.class))];
        response = `Je vois : ${uniqueClasses.slice(0, 3).join(", ")}.`;
      }
    }

    // Commandes de capture
    else if (lowerCommand.includes("prendre une photo") || lowerCommand.includes("prends une photo") || lowerCommand.includes("capture")) {
      response = "Photo capturée avec succès !";
      window.dispatchEvent(new CustomEvent('voice-command-capture'));
    }

    // Commandes de mode
    else if (lowerCommand.includes("mode")) {
      if (lowerCommand.includes("vidéo")) {
        response = "Mode vidéo activé.";
        window.dispatchEvent(new CustomEvent('voice-command-mode', { detail: 'VIDEO' }));
      } else if (lowerCommand.includes("photo")) {
        response = "Mode photo activé.";
        window.dispatchEvent(new CustomEvent('voice-command-mode', { detail: 'PHOTO' }));
      } else if (lowerCommand.includes("portrait")) {
        response = "Mode portrait activé.";
        window.dispatchEvent(new CustomEvent('voice-command-mode', { detail: 'PORTRAIT' }));
      } else if (lowerCommand.includes("nuit")) {
        response = "Mode nuit activé.";
        window.dispatchEvent(new CustomEvent('voice-command-mode', { detail: 'night' }));
      }
    }

    // Commandes de zoom
    else if (lowerCommand.includes("zoom")) {
      if (lowerCommand.includes("avant") || lowerCommand.includes("plus")) {
        response = "Zoom avant appliqué.";
        window.dispatchEvent(new CustomEvent('voice-command-zoom', { detail: 'in' }));
      } else if (lowerCommand.includes("arrière") || lowerCommand.includes("moins")) {
        response = "Zoom arrière appliqué.";
        window.dispatchEvent(new CustomEvent('voice-command-zoom', { detail: 'out' }));
      }
    }

    // Commandes de flash
    else if (lowerCommand.includes("flash")) {
      if (lowerCommand.includes("activer") || lowerCommand.includes("allumer")) {
        response = "Flash activé.";
        window.dispatchEvent(new CustomEvent('voice-command-flash', { detail: 'on' }));
      } else if (lowerCommand.includes("désactiver") || lowerCommand.includes("éteindre")) {
        response = "Flash désactivé.";
        window.dispatchEvent(new CustomEvent('voice-command-flash', { detail: 'off' }));
      }
    }

    // Commandes de navigation
    else if (lowerCommand.includes("ouvrir galerie") || lowerCommand.includes("voir galerie")) {
      response = "Ouverture de la galerie.";
      window.dispatchEvent(new CustomEvent('voice-command-navigate', { detail: '/gallery' }));
    } else if (lowerCommand.includes("paramètres") || lowerCommand.includes("réglages")) {
      response = "Ouverture des paramètres.";
      window.dispatchEvent(new CustomEvent('voice-command-navigate', { detail: '/settings' }));
    } else if (lowerCommand.includes("studio 3d")) {
      response = "Ouverture du studio 3D.";
      window.dispatchEvent(new CustomEvent('voice-command-navigate', { detail: '/ai-3d-studio' }));
    }

    else {
      response = "Commande non reconnue. Essayez 'Prendre une photo', 'Mode vidéo', 'Zoom avant', 'Flash activer', 'Ouvrir galerie' ou 'Que vois-tu ?'";
    }

    setLastCommand(command);
    setAiResponse(response);
    speak(response);
  }, [speak]);

  useEffect(() => {
    if (!isActive) return;

    // Initialiser la reconnaissance vocale
    const windowWithSpeech = window as unknown as { webkitSpeechRecognition: new () => CustomSpeechRecognition; SpeechRecognition: new () => CustomSpeechRecognition };
    const SpeechRecognition = windowWithSpeech.webkitSpeechRecognition || windowWithSpeech.SpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'fr-FR';

      recognition.onresult = (event: SpeechRecognitionEvent) => {
        const transcript = event.results[0][0].transcript;
        processCommand(transcript);
      };

      recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
        console.error('Erreur de reconnaissance vocale:', event.error);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [isActive, processCommand]);

  const toggleListening = () => {
    if (!recognitionRef.current) {
      toast({
        title: "Non supporté",
        description: "La reconnaissance vocale n'est pas supportée par votre navigateur.",
        variant: "destructive",
      });
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      recognitionRef.current.start();
      setIsListening(true);
      toast({
        title: "Écoute activée",
        description: "Posez votre question...",
      });
    }
  };

  const toggleSpeech = () => {
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  };

  if (!isActive) return null;

  return (
    <div className="absolute bottom-32 left-4 right-4 z-10">
      <Card className="bg-background/80 backdrop-blur-md p-4 border-primary/20">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-foreground">Assistant Vocal IA</h3>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant={isListening ? "default" : "outline"}
              onClick={toggleListening}
              className="h-8"
            >
              {isListening ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
            </Button>
            <Button
              size="sm"
              variant={isSpeaking ? "default" : "outline"}
              onClick={toggleSpeech}
              className="h-8"
            >
              {isSpeaking ? <Volume2 className="w-4 h-4 animate-pulse" /> : <VolumeX className="w-4 h-4" />}
            </Button>
          </div>
        </div>

        {lastCommand && (
          <div className="mb-2">
            <p className="text-xs text-muted-foreground">Vous : {lastCommand}</p>
          </div>
        )}

        {aiResponse && (
          <div className="mb-2">
            <p className="text-xs text-primary font-medium">IA : {aiResponse}</p>
          </div>
        )}

        <div className="text-xs text-muted-foreground">
          <p>Exemples de commandes :</p>
          <p>• "Prendre une photo" • "Mode vidéo/portrait/nuit"</p>
          <p>• "Zoom avant/arrière" • "Flash activer/désactiver"</p>
          <p>• "Ouvrir galerie/paramètres/studio 3D"</p>
          <p>• "Combien de personnes ?" • "Que vois-tu ?"</p>
        </div>
      </Card>
    </div>
  );
};
