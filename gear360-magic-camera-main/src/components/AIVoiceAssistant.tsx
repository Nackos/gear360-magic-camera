import { useEffect, useState, useRef, useCallback, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Mic } from 'lucide-react';

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

// Define CustomSpeechRecognition as a global interface to extend the window object's SpeechRecognition
// This is necessary because the original CustomSpeechRecognition interface was removed,
// but the type is still used in the code.
declare global {
  interface Window {
    SpeechRecognition: new () => CustomSpeechRecognition;
    webkitSpeechRecognition: new () => CustomSpeechRecognition;
  }
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

interface VoiceCommand {
  command: string;
  action: () => void;
  description: string;
}

interface AIVoiceAssistantProps {
  onCapture: () => void;
  onModeChange: (mode: 'photo' | 'video') => void;
  onFilterApply: (filter: string) => void;
  onFaceDetectionToggle: () => void;
  settings: {
    voiceControl: boolean;
    microphone: boolean;
    backgroundMusic: boolean;
  };
}

export const AIVoiceAssistant = ({
  onCapture,
  onModeChange,
  onFilterApply,
  onFaceDetectionToggle,
  settings
}: AIVoiceAssistantProps) => {
  const [isListening, setIsListening] = useState(false);
  const isListeningRef = useRef(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [lastCommand, setLastCommand] = useState<string>('');
  const [aiResponse, setAiResponse] = useState<string>('');
  const detectionsRef = useRef(null); // Assuming 'detections' would be passed as a prop or derived
  const [permissionGranted, setPermissionGranted] = useState(false);
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);
  const [currentTrack, setCurrentTrack] = useState('Ambient Background 1');
  const recognitionRef = useRef<CustomSpeechRecognition | null>(null);

  const speak = useCallback((text: string) => {
    if ('speechSynthesis' in window) {
      setIsSpeaking(true);
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'fr-FR';
      utterance.onend = () => setIsSpeaking(false);
      window.speechSynthesis.speak(utterance);
    }
  }, []);

  const toggleMusic = useCallback(() => {
    setIsMusicPlaying(prev => {
      const newState = !prev;
      speak(newState ? 'Musique en lecture' : 'Musique en pause');
      return newState;
    });
  }, [speak]);

  const nextTrack = useCallback(() => {
    const tracks = ['Ambient Background 1', 'Cinematic Score 2', 'Nature Sounds 3'];
    setCurrentTrack(prev => {
      const currentIndex = tracks.indexOf(prev);
      const nextIndex = (currentIndex + 1) % tracks.length;
      speak(`Lecture de ${tracks[nextIndex]} `);
      return tracks[nextIndex];
    });
  }, [speak]);

  const voiceCommands: VoiceCommand[] = useMemo(() => [
    { command: 'prendre photo', action: onCapture, description: 'Prendre une photo' },
    { command: 'mode photo', action: () => onModeChange('photo'), description: 'Passer en mode photo' },
    { command: 'mode vidéo', action: () => onModeChange('video'), description: 'Passer en mode vidéo' },
    { command: 'détection visage', action: onFaceDetectionToggle, description: 'Activer/désactiver détection' },
    { command: 'filtre portrait', action: () => onFilterApply('portrait'), description: 'Appliquer filtre portrait' },
    { command: 'filtre paysage', action: () => onFilterApply('landscape'), description: 'Appliquer filtre paysage' },
    { command: 'jouer musique', action: toggleMusic, description: 'Jouer/Pause musique' },
    { command: 'pause musique', action: toggleMusic, description: 'Pause musique' },
    { command: 'musique suivante', action: nextTrack, description: 'Piste suivante' },
  ], [onCapture, onModeChange, onFaceDetectionToggle, onFilterApply, toggleMusic, nextTrack]);

  const processCommand = useCallback((transcript: string) => {
    const matchedCommand = voiceCommands.find(cmd =>
      transcript.includes(cmd.command)
    );

    if (matchedCommand) {
      matchedCommand.action();
      const response = `Commande exécutée: ${matchedCommand.description} `;
      setAiResponse(response);
      speak(response);
    } else {
      const response = "Commande non reconnue. Dites 'aide' pour voir les commandes disponibles.";
      setAiResponse(response);
      speak(response);
    }
  }, [voiceCommands, speak]);

  const initializeSpeechRecognition = useCallback(() => {
    // Initialiser la reconnaissance vocale
    const windowWithSpeech = window as unknown as { webkitSpeechRecognition: new () => CustomSpeechRecognition; SpeechRecognition: new () => CustomSpeechRecognition };
    const SpeechRecognition = windowWithSpeech.webkitSpeechRecognition || windowWithSpeech.SpeechRecognition;

    if (!SpeechRecognition) {
      console.warn('Speech Recognition not supported in this browser.');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = false;
    recognition.lang = 'fr-FR';

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      const transcript = event.results[event.results.length - 1][0].transcript.toLowerCase();
      setLastCommand(transcript);
      processCommand(transcript);
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      console.error('Speech recognition error:', event.error);
      setIsListening(false);
      isListeningRef.current = false;
    };

    recognition.onend = () => {
      if (isListeningRef.current) {
        recognition.start();
      }
    };

    recognitionRef.current = recognition;
  }, [processCommand]);

  useEffect(() => {
    if (!settings.voiceControl || !settings.microphone) return;

    navigator.mediaDevices.getUserMedia({ audio: true })
      .then(() => {
        setPermissionGranted(true);
        initializeSpeechRecognition();
      })
      .catch((err) => {
        console.error('Erreur accès microphone:', err);
        setPermissionGranted(false);
      });
  }, [settings.voiceControl, settings.microphone, initializeSpeechRecognition]);

  const toggleListening = () => {
    if (!recognitionRef.current) return;

    const recognition = recognitionRef.current;

    if (isListening) {
      recognition.stop();
      setIsListening(false);
      isListeningRef.current = false;
    } else {
      recognition.start();
      setIsListening(true);
      isListeningRef.current = true;
    }
  };

  if (!settings.voiceControl) return null;

  return (
    <div className="absolute top-4 right-16 z-20">
      <Button
        onClick={toggleListening}
        variant={isListening ? "destructive" : "ghost"}
        size="icon"
        className="h-10 w-10 rounded-full bg-background/20 backdrop-blur-sm hover:bg-background/30 border-0 shadow-lg"
        disabled={!permissionGranted}
      >
        <Mic className={`w - 5 h - 5 ${isListening ? 'animate-pulse' : ''} `} />
      </Button>

      {isSpeaking && (
        <div className="absolute -bottom-2 -right-2 w-4 h-4 bg-primary rounded-full animate-pulse" />
      )}
    </div>
  );
};
