/**
 * Configuration IA pour détection d'objets/personnes et reconnaissance gestuelle
 * Paramètres optimisés pour performance temps réel
 */

export interface DetectionConfig {
  model: string;
  imgSize: number;
  confThreshold: number;
  iouThreshold: number;
  maxDetections: number;
  device: 'cpu' | 'webgpu' | 'wasm' | 'cuda';
}

export interface PoseConfig {
  useMediaPipe: boolean;
  minDetectionConfidence: number;
  minTrackingConfidence: number;
  smoothPose: boolean;
  smoothingAlpha: number;
}

export interface GestureConfig {
  windowSize: number;
  stride: number;
  model?: string;
  classes: string[];
  confThreshold: number;
  stableGestureFrames: number;
}

export interface TrackingConfig {
  tracker: 'bytetrack' | 'deepsort' | 'none';
  maxAge: number;
  minHits: number;
}

export interface SearchConfig {
  vectorDim: number;
  indexType: 'faiss' | 'faiss_ivf' | 'simple';
  updateFrequency: 'realtime' | 'batch';
}

export interface CommandMapping {
  action: string;
  apk?: string;
  description: string;
}

export interface CommandsConfig {
  gestureCommandMap: Record<string, CommandMapping>;
  defaultActionConfidence: number;
  enableVoiceConfirmation: boolean;
}

export interface AIDetectionSettings {
  detection: DetectionConfig;
  pose: PoseConfig;
  gesture: GestureConfig;
  tracking: TrackingConfig;
  search: SearchConfig;
  commands: CommandsConfig;
}

// Configuration par défaut optimisée pour mobile/web
export const defaultAISettings: AIDetectionSettings = {
  detection: {
    model: 'yolov8n.pt',
    imgSize: 640,
    confThreshold: 0.35,
    iouThreshold: 0.45,
    maxDetections: 50,
    device: 'cuda' // Mappé vers webgpu/wasm pour navigateur
  },
  pose: {
    useMediaPipe: true,
    minDetectionConfidence: 0.6,
    minTrackingConfidence: 0.6,
    smoothPose: true,
    smoothingAlpha: 0.4
  },
  gesture: {
    windowSize: 24,
    stride: 8,
    model: 'gesture_lstm_v1.pt',
    classes: [
      'paume',
      'poing',
      'pouce_haut',
      'index_point',
      'swipe_gauche',
      'swipe_droite',
      'v_sign'
    ],
    confThreshold: 0.7,
    stableGestureFrames: 6
  },
  tracking: {
    tracker: 'bytetrack',
    maxAge: 30,
    minHits: 3
  },
  search: {
    vectorDim: 512,
    indexType: 'faiss_ivf',
    updateFrequency: 'realtime'
  },
  commands: {
    gestureCommandMap: {
      'pouce_haut': {
        action: 'like',
        apk: 'com.example.app',
        description: 'Aimer / Valider'
      },
      'swipe_gauche': {
        action: 'prev',
        apk: 'com.media.player',
        description: 'Précédent'
      },
      'swipe_droite': {
        action: 'next',
        apk: 'com.media.player',
        description: 'Suivant'
      },
      'paume': {
        action: 'pause',
        apk: 'com.media.player',
        description: 'Pause / Arrêt'
      },
      'poing': {
        action: 'capture',
        description: 'Capturer photo'
      },
      'v_sign': {
        action: 'selfie',
        description: 'Mode selfie'
      },
      'index_point': {
        action: 'select',
        description: 'Sélectionner'
      }
    },
    defaultActionConfidence: 0.75,
    enableVoiceConfirmation: false
  }
};

// Traductions des classes de détection
export const objectClassTranslations: Record<string, string> = {
  'person': 'personne',
  'bicycle': 'vélo',
  'car': 'voiture',
  'motorcycle': 'moto',
  'airplane': 'avion',
  'bus': 'bus',
  'train': 'train',
  'truck': 'camion',
  'boat': 'bateau',
  'traffic light': 'feu de circulation',
  'fire hydrant': 'bouche d\'incendie',
  'stop sign': 'panneau stop',
  'parking meter': 'parcmètre',
  'bench': 'banc',
  'bird': 'oiseau',
  'cat': 'chat',
  'dog': 'chien',
  'horse': 'cheval',
  'sheep': 'mouton',
  'cow': 'vache',
  'elephant': 'éléphant',
  'bear': 'ours',
  'zebra': 'zèbre',
  'giraffe': 'girafe',
  'backpack': 'sac à dos',
  'umbrella': 'parapluie',
  'handbag': 'sac à main',
  'tie': 'cravate',
  'suitcase': 'valise',
  'frisbee': 'frisbee',
  'skis': 'skis',
  'snowboard': 'snowboard',
  'sports ball': 'ballon',
  'kite': 'cerf-volant',
  'baseball bat': 'batte de baseball',
  'baseball glove': 'gant de baseball',
  'skateboard': 'skateboard',
  'surfboard': 'planche de surf',
  'tennis racket': 'raquette de tennis',
  'bottle': 'bouteille',
  'wine glass': 'verre à vin',
  'cup': 'tasse',
  'fork': 'fourchette',
  'knife': 'couteau',
  'spoon': 'cuillère',
  'bowl': 'bol',
  'banana': 'banane',
  'apple': 'pomme',
  'sandwich': 'sandwich',
  'orange': 'orange',
  'broccoli': 'brocoli',
  'carrot': 'carotte',
  'hot dog': 'hot dog',
  'pizza': 'pizza',
  'donut': 'donut',
  'cake': 'gâteau',
  'chair': 'chaise',
  'couch': 'canapé',
  'potted plant': 'plante en pot',
  'bed': 'lit',
  'dining table': 'table à manger',
  'toilet': 'toilettes',
  'tv': 'télévision',
  'laptop': 'ordinateur portable',
  'mouse': 'souris',
  'remote': 'télécommande',
  'keyboard': 'clavier',
  'cell phone': 'téléphone portable',
  'microwave': 'micro-ondes',
  'oven': 'four',
  'toaster': 'grille-pain',
  'sink': 'évier',
  'refrigerator': 'réfrigérateur',
  'book': 'livre',
  'clock': 'horloge',
  'vase': 'vase',
  'scissors': 'ciseaux',
  'teddy bear': 'ours en peluche',
  'hair drier': 'sèche-cheveux',
  'toothbrush': 'brosse à dents'
};

// Helpers pour gérer les paramètres
export const loadAISettings = (): AIDetectionSettings => {
  const saved = localStorage.getItem('aiDetectionSettings');
  if (saved) {
    try {
      return { ...defaultAISettings, ...JSON.parse(saved) };
    } catch (e) {
      console.error('Erreur chargement paramètres IA:', e);
    }
  }
  return defaultAISettings;
};

export const saveAISettings = (settings: Partial<AIDetectionSettings>) => {
  const current = loadAISettings();
  const updated = { ...current, ...settings };
  localStorage.setItem('aiDetectionSettings', JSON.stringify(updated));
};
