import { useEffect, useState, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Mic, Volume2, VolumeX, Music, Pause, SkipForward, Brain } from 'lucide-react';

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
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [lastCommand, setLastCommand] = useState<string>('');
  const [aiResponse, setAiResponse] = useState<string>('');
  const [permissionGranted, setPermissionGranted] = useState(false);
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);
  const [currentTrack, setCurrentTrack] = useState('Ambient Background 1');
  const recognitionRef = useRef<any>(null);

  const voiceCommands: VoiceCommand[] = [
    { command: 'prendre photo', action: onCapture, description: 'Prendre une photo' },
    { command: 'mode photo', action: () => onModeChange('photo'), description: 'Passer en mode photo' },
    { command: 'mode vidéo', action: () => onModeChange('video'), description: 'Passer en mode vidéo' },
    { command: 'détection visage', action: onFaceDetectionToggle, description: 'Activer/désactiver détection' },
    { command: 'filtre portrait', action: () => onFilterApply('portrait'), description: 'Appliquer filtre portrait' },
    { command: 'filtre paysage', action: () => onFilterApply('landscape'), description: 'Appliquer filtre paysage' },
    { command: 'jouer musique', action: () => toggleMusic(), description: 'Jouer/Pause musique' },
    { command: 'pause musique', action: () => toggleMusic(), description: 'Pause musique' },
    { command: 'musique suivante', action: () => nextTrack(), description: 'Piste suivante' },
  ];

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
  }, [settings.voiceControl, settings.microphone]);

  const initializeSpeechRecognition = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      console.error('Speech recognition not supported');
      return;
    }

    const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
    const recognition = new SpeechRecognition();
    
    recognition.continuous = true;
    recognition.interimResults = false;
    recognition.lang = 'fr-FR';

    recognition.onresult = (event: any) => {
      const transcript = event.results[event.results.length - 1][0].transcript.toLowerCase();
      setLastCommand(transcript);
      processCommand(transcript);
    };

    recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
      setIsListening(false);
    };

    recognition.onend = () => {
      if (isListening) {
        recognition.start();
      }
    };

    recognitionRef.current = recognition;
  };

  const processCommand = (transcript: string) => {
    const matchedCommand = voiceCommands.find(cmd => 
      transcript.includes(cmd.command)
    );

    if (matchedCommand) {
      matchedCommand.action();
      const response = `Commande exécutée: ${matchedCommand.description}`;
      setAiResponse(response);
      speak(response);
    } else {
      const response = "Commande non reconnue. Dites 'aide' pour voir les commandes disponibles.";
      setAiResponse(response);
      speak(response);
    }
  };

  const speak = (text: string) => {
    if ('speechSynthesis' in window) {
      setIsSpeaking(true);
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'fr-FR';
      utterance.onend = () => setIsSpeaking(false);
      window.speechSynthesis.speak(utterance);
    }
  };

  const toggleListening = () => {
    if (!recognitionRef.current) return;

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  const toggleSpeech = () => {
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  };

  const toggleMusic = () => {
    setIsMusicPlaying(!isMusicPlaying);
    if (!isMusicPlaying) {
      speak('Musique en lecture');
    } else {
      speak('Musique en pause');
    }
  };

  const nextTrack = () => {
    const tracks = ['Ambient Background 1', 'Cinematic Score 2', 'Nature Sounds 3'];
    const currentIndex = tracks.indexOf(currentTrack);
    const nextIndex = (currentIndex + 1) % tracks.length;
    setCurrentTrack(tracks[nextIndex]);
    speak(`Lecture de ${tracks[nextIndex]}`);
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
        <Mic className={`w-5 h-5 ${isListening ? 'animate-pulse' : ''}`} />
      </Button>
      
      {/* Notification discrète quand l'assistant parle */}
      {isSpeaking && (
        <div className="absolute -bottom-2 -right-2 w-4 h-4 bg-primary rounded-full animate-pulse" />
      )}
    </div>
  );
};
