# Pipeline IA Intégré - Documentation

## 🎯 Vue d'ensemble

Ce document décrit l'implémentation du pipeline de détection IA complet qui réplique la fonctionnalité du code Python avec YOLO + MediaPipe + LSTM dans le navigateur.

## 🏗️ Architecture

### Composant Principal: `IntegratedDetectionPipeline`

**Localisation:** `src/components/IntegratedDetectionPipeline.tsx`

Le pipeline intégré combine trois technologies:

1. **TensorFlow.js avec COCO-SSD** - Détection d'objets (équivalent YOLO)
2. **MediaPipe Hand Landmarker** - Détection et tracking des mains
3. **Classificateur de gestes custom** - Reconnaissance de gestes statiques et dynamiques

### 📊 Flux de traitement

```
Vidéo Frame
    ↓
1. Détection d'objets (COCO-SSD)
    ↓ (si personne détectée)
2. Détection des mains (MediaPipe)
    ↓ (extraction keypoints 21 points)
3. Classification gestes statiques
    ↓
4. Détection gestes dynamiques (buffer temporel)
    ↓
5. Déclenchement commandes
```

## 🔧 Composants techniques

### 1. Détection d'objets

**Modèle:** COCO-SSD (MobileNet V2 Lite)
- Plus léger et rapide que YOLOv8n
- Optimisé pour le navigateur
- Détecte 90 classes d'objets dont "personne"

**Configuration:**
```typescript
const model = await loadCocoSsd({
  base: 'lite_mobilenet_v2'
});
```

**Seuils:**
- Confidence: 0.35 (configurable via `aiDetectionConfig.ts`)
- IOU threshold: 0.45

### 2. Détection des mains

**Modèle:** MediaPipe Hand Landmarker
- 21 points de repère par main
- Support jusqu'à 2 mains simultanées
- GPU-acceleré (WebGPU quand disponible)

**Configuration:**
```typescript
minHandDetectionConfidence: 0.6
minHandPresenceConfidence: 0.6
minTrackingConfidence: 0.6
```

**Points de repère (landmarks):**
```
0: Poignet
1-4: Pouce
5-8: Index
9-12: Majeur
13-16: Annulaire
17-20: Auriculaire
```

### 3. Classification de gestes

#### Gestes statiques détectés

| Geste | Description | Logique |
|-------|-------------|---------|
| `pouce_haut` | Pouce levé | Pouce au-dessus, autres doigts repliés |
| `v_sign` | Signe V | Index + majeur levés, autres repliés |
| `index_point` | Index pointé | Index levé seul |
| `paume` | Main ouverte | Tous les doigts étendus |
| `poing` | Poing fermé | Tous les doigts repliés |

#### Gestes dynamiques (swipes)

| Geste | Détection | Distance min |
|-------|-----------|--------------|
| `swipe_droite` | Mouvement horizontal → | 15% écran |
| `swipe_gauche` | Mouvement horizontal ← | 15% écran |
| `swipe_haut` | Mouvement vertical ↑ | 15% écran |
| `swipe_bas` | Mouvement vertical ↓ | 15% écran |

**Buffer circulaire:**
- Taille: 24 frames (configurable)
- Analyse de trajectoire sur fenêtre glissante
- Calcul d'angle et distance pour classification

### 4. Mapping de commandes

Les gestes déclenchent des actions via le `CommandController`:

```typescript
gestureCommandMap: {
  'pouce_haut': { action: 'like', apk: 'com.example.app' },
  'swipe_gauche': { action: 'prev', apk: 'com.media.player' },
  'swipe_droite': { action: 'next', apk: 'com.media.player' },
  'paume': { action: 'pause', apk: 'com.media.player' },
  'poing': { action: 'capture' },
  'v_sign': { action: 'selfie' },
  'index_point': { action: 'select' }
}
```

## ⚙️ Configuration

**Fichier:** `src/config/aiDetectionConfig.ts`

### Paramètres principaux

```typescript
detection: {
  model: 'yolov8n.pt',          // Nom symbolique (utilise COCO-SSD)
  imgSize: 640,                  // Taille d'entrée
  confThreshold: 0.35,           // Seuil de confiance
  iouThreshold: 0.45,            // Seuil IoU
  maxDetections: 50,             // Max détections par frame
  device: 'cuda'                 // Mappé vers webgpu/wasm
}

pose: {
  useMediaPipe: true,
  minDetectionConfidence: 0.6,
  minTrackingConfidence: 0.6,
  smoothPose: true,
  smoothingAlpha: 0.4
}

gesture: {
  windowSize: 24,                // Taille buffer pour swipes
  stride: 8,                     // Pas d'échantillonnage
  model: 'gesture_lstm_v1.pt',   // Nom symbolique
  classes: [...],                // Classes de gestes
  confThreshold: 0.7,            // Seuil de confiance
  stableGestureFrames: 6         // Frames pour stabilité
}
```

## 🚀 Utilisation

### Activation dans l'interface

1. Ouvrir la page Camera (`/`)
2. Cliquer sur le bouton **Pipeline IA** (icône étoile brillante) dans les contrôles de droite
3. Le pipeline démarre et affiche:
   - Bounding boxes des personnes détectées
   - Squelette des mains avec landmarks
   - Geste détecté en temps réel
   - Indicateur de traitement actif

### Intégration programmatique

```tsx
import { IntegratedDetectionPipeline } from '@/components/IntegratedDetectionPipeline';

<IntegratedDetectionPipeline
  videoRef={videoRef}
  isActive={isActive}
  onDetections={(detections) => {
    console.log('Détections:', detections);
  }}
  onGesture={(gesture, confidence) => {
    console.log(`Geste: ${gesture} (${confidence})`);
  }}
/>
```

## 🎨 Rendu visuel

Le composant dessine sur un canvas overlay:

- **Vert** - Bounding boxes des personnes détectées
- **Rouge** - Points de repère des mains
- **Vert** - Connexions entre les points
- **Overlay HUD** - Statut et geste détecté

## ⚡ Optimisations

### Performance

1. **Frame skipping:** Traite 1 frame sur 2 pour réduire la charge CPU
2. **Buffer limité:** Taille maximale de 24 frames pour swipes
3. **Modèle léger:** COCO-SSD Lite MobileNet V2
4. **GPU acceleration:** Utilise WebGPU/WebGL quand disponible

### Gestion mémoire

- Dispose automatique des tensors TensorFlow.js
- Nettoyage du buffer après détection de swipe
- Release des ressources MediaPipe lors du démontage

## 🔄 Différences avec le code Python

| Aspect | Python | Browser |
|--------|--------|---------|
| Détection objets | YOLOv8n (ultralytics) | COCO-SSD (TensorFlow.js) |
| Backend ML | PyTorch/CUDA | TensorFlow.js/WebGPU |
| Gestes LSTM | Modèle custom PyTorch | Classificateur heuristique |
| Performance | ~30-60 FPS | ~15-30 FPS (frame skip) |
| Mémoire | Illimitée | Limitée (browser) |

## 🛠️ Développement futur

### Améliorations possibles

1. **Modèle YOLO natif**
   - Convertir YOLOv8n en format TFJS
   - Meilleure précision de détection

2. **LSTM pour gestes**
   - Entraîner modèle LSTM personnalisé
   - Convertir en TensorFlow.js
   - Meilleure reconnaissance de gestes dynamiques

3. **Optimisations**
   - WebAssembly pour parties critiques
   - Web Workers pour traitement parallèle
   - Quantization des modèles

4. **Fonctionnalités**
   - Tracking multi-personnes persistant
   - Gestes à deux mains
   - Reconnaissance de poses complexes

## 🐛 Debug

### Logs console

Le composant log:
- Initialisation des modèles
- Backend TensorFlow.js utilisé
- Détections et gestes en temps réel
- Erreurs de traitement

### Indicateurs visuels

- Dot vert pulsant = Traitement actif
- Texte "Pipeline IA" = Overlay activé
- Geste + confidence = Détection en cours

## 📚 Ressources

- [TensorFlow.js](https://www.tensorflow.org/js)
- [COCO-SSD Model](https://github.com/tensorflow/tfjs-models/tree/master/coco-ssd)
- [MediaPipe Hand Landmarker](https://developers.google.com/mediapipe/solutions/vision/hand_landmarker)
- [Configuration IA](./src/config/aiDetectionConfig.ts)
- [Command Controller](./src/components/CommandController.tsx)
