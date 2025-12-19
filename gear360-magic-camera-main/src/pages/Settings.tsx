import { ArrowLeft, Brain, Camera, User, Video, Settings as SettingsIcon, Shield, Info, Mic, Bell, Wand2, Music, Hand, Wifi } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import SettingsGroup from "@/components/settings/SettingsGroup";
import SettingsItem from "@/components/settings/SettingsItem";
import { useState, useEffect } from "react";

const Settings = () => {
  const [settings, setSettings] = useState({
    voiceControl: false,
    microphone: false,
    backgroundMusic: false,
    smartNotifications: false,
    aiTransformation: false,
    backgroundReplacement: false,
    gestureRecognition: false,
    postureDetection: false,
    adaptiveCapture: false,
    objectRecognition: false,
    maskDetection: false,
    fullBodyEstimation: false,
    showTopBar: true,
  });

  // Charger les paramètres depuis localStorage au démarrage
  useEffect(() => {
    const savedSettings = localStorage.getItem('cameraSettings');
    if (savedSettings) {
      try {
        setSettings(JSON.parse(savedSettings));
      } catch (error) {
        console.error('Erreur lors du chargement des paramètres:', error);
      }
    }
  }, []);

  const handleSettingChange = (key: string, value: boolean) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    // Sauvegarder dans localStorage
    localStorage.setItem('cameraSettings', JSON.stringify(newSettings));
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background border-b border-border">
        <div className="flex items-center gap-4 px-4 py-4">
          <Link to="/">
            <Button variant="ghost" size="icon" className="rounded-full">
              <ArrowLeft className="w-6 h-6" />
            </Button>
          </Link>
          <h1 className="text-xl font-semibold">Paramètres de l'appareil photo</h1>
        </div>
      </div>

      {/* Settings Content */}
      <div className="p-4 space-y-6 pb-20">
        <SettingsGroup title="Fonctions intelligentes" icon={Brain}>
          <SettingsItem label="Analyser les docs et le texte" defaultChecked />
          <SettingsItem label="Numérisation des codes QR" defaultChecked />
          <SettingsItem 
            label="Aide au cadrage" 
            description="Affichez les lignes de repère pour vous aider à aligner des photos magnifiques."
            defaultChecked 
          />
          <SettingsItem label="Optimisation intelligente" type="link" />
        </SettingsGroup>

        <SettingsGroup title="Assistant vocal et audio" icon={Mic}>
          <SettingsItem 
            label="Contrôle vocal IA" 
            description="Commandes vocales avancées pour contrôler toute l'application"
            defaultChecked={settings.voiceControl}
            onChange={(checked) => handleSettingChange('voiceControl', checked)}
          />
          <SettingsItem 
            label="Accès microphone" 
            description="Autoriser l'accès au microphone pour l'enregistrement"
            defaultChecked={settings.microphone}
            onChange={(checked) => handleSettingChange('microphone', checked)}
          />
          <SettingsItem 
            label="Musique de fond" 
            description="Lecture de musique pendant la capture photo/vidéo"
            defaultChecked={settings.backgroundMusic}
            onChange={(checked) => handleSettingChange('backgroundMusic', checked)}
          />
        </SettingsGroup>

        <SettingsGroup title="Notifications et partage" icon={Bell}>
          <SettingsItem 
            label="Notifications intelligentes" 
            description="Suggestions et alertes IA en temps réel avec partage automatique"
            defaultChecked={settings.smartNotifications}
            onChange={(checked) => handleSettingChange('smartNotifications', checked)}
          />
        </SettingsGroup>

        <SettingsGroup title="Transformations IA" icon={Wand2}>
          <SettingsItem 
            label="Transformation visage/corps IA" 
            description="Amélioration et embellissement automatique par intelligence artificielle"
            defaultChecked={settings.aiTransformation}
            onChange={(checked) => handleSettingChange('aiTransformation', checked)}
          />
          <SettingsItem 
            label="Remplacement d'arrière-plan IA" 
            description="Changement automatique du décor en temps réel par IA"
            defaultChecked={settings.backgroundReplacement}
            onChange={(checked) => handleSettingChange('backgroundReplacement', checked)}
          />
        </SettingsGroup>

        <SettingsGroup title="Détection avancée IA" icon={Hand}>
          <SettingsItem 
            label="Reconnaissance de gestes IA" 
            description="Détecter 5+ gestes de la main (👋👍✌️☝️) pour contrôler l'appareil"
            defaultChecked={settings.gestureRecognition}
            onChange={(checked) => handleSettingChange('gestureRecognition', checked)}
          />
          <SettingsItem 
            label="Détection de posture IA" 
            description="Analyser les postures corporelles (debout, assis, allongé, en mouvement)"
            defaultChecked={settings.postureDetection}
            onChange={(checked) => handleSettingChange('postureDetection', checked)}
          />
          <SettingsItem 
            label="Capture adaptative IA" 
            description="Mode intelligent qui s'adapte automatiquement au contexte (Portrait, Action, Paysage, Nuit)"
            defaultChecked={settings.adaptiveCapture}
            onChange={(checked) => handleSettingChange('adaptiveCapture', checked)}
          />
          <SettingsItem 
            label="Reconnaissance d'objets IA" 
            description="Identification intelligente de 80+ catégories d'objets en temps réel"
            defaultChecked={settings.objectRecognition}
            onChange={(checked) => handleSettingChange('objectRecognition', checked)}
          />
          <SettingsItem 
            label="Détection de masques IA" 
            description="Détecter automatiquement le port du masque facial en temps réel"
            defaultChecked={settings.maskDetection}
            onChange={(checked) => handleSettingChange('maskDetection', checked)}
          />
          <SettingsItem 
            label="Estimation du corps complet IA" 
            description="Détection avancée de pose corporelle avec 33 points de repère en 3D"
            defaultChecked={settings.fullBodyEstimation || false}
            onChange={(checked) => handleSettingChange('fullBodyEstimation', checked)}
          />
        </SettingsGroup>

        <SettingsGroup title="Photos" icon={Camera}>
          <SettingsItem 
            label="Faire glisser la touche du déclencheur pour" 
            type="action"
            actionText="Prendre une rafale"
          />
          <SettingsItem label="Filigrane" />
          <SettingsItem label="Options avancées pour les photos" type="link" />
        </SettingsGroup>

        <SettingsGroup title="Selfies" icon={User}>
          <SettingsItem 
            label="Enregistr. selfies comme aperçus" 
            description="Enregistrez les selfies et les vidéos selfie tels qu'ils apparaissent dans l'aperçu sans les retourner."
          />
        </SettingsGroup>

        <SettingsGroup title="Vidéos" icon={Video}>
          <SettingsItem 
            label="Nombre d'IPS automatique" 
            type="action"
            actionText="Utiliser pour les vidéos de 30 et 60 ips"
          />
          <SettingsItem label="Stabilisation vidéo" defaultChecked />
          <SettingsItem label="Options avancées pour les vidéos" type="link" />
        </SettingsGroup>

        <SettingsGroup title="Général" icon={SettingsIcon}>
          <SettingsItem 
            label="Afficher la barre supérieure" 
            description="Afficher/masquer la barre d'outils en haut de l'appareil photo"
            defaultChecked={settings.showTopBar}
            onChange={(checked) => handleSettingChange('showTopBar', checked)}
          />
          <SettingsItem 
            label="Mise au point auto. avec suivi" 
            description="Laissez l'appareil photo arrière faire la mise au point sur l'objet sélectionné même si ce dernier bouge."
          />
          <SettingsItem label="Guide de composition" />
          <SettingsItem 
            label="Tags de localisation" 
            description="Ajoutez des tags à vos photos et vidéos afin de pouvoir voir où elles ont été prises/enregistrées."
          />
          <SettingsItem 
            label="Glisser aperçu vers haut/bas pour" 
            type="action"
            actionText="Ouvrir les contrôles rapides"
          />
          <SettingsItem label="Modes de prise de vue" type="link" />
          <SettingsItem label="Paramètres à conserver" type="link" />
          <SettingsItem label="Retour vibration" defaultChecked />
        </SettingsGroup>

        <SettingsGroup title="Confidentialité" icon={Shield}>
          <SettingsItem label="Autorisations" type="link" />
        </SettingsGroup>

        <SettingsGroup title="Connectivité Gear 360" icon={Wifi}>
          <Link to="/gear360-control">
            <SettingsItem 
              label="Contrôle Gear 360" 
              description="Connecter et contrôler votre caméra Samsung Gear 360"
              type="link"
            />
          </Link>
        </SettingsGroup>

        <div className="bg-card rounded-2xl p-4 space-y-3">
          <Button 
            variant="ghost" 
            className="w-full justify-start text-sm h-auto py-3 hover:bg-accent"
            onClick={() => {
              localStorage.removeItem('cameraSettings');
              window.location.reload();
            }}
          >
            Réinitialiser les paramètres
          </Button>
          <Button 
            variant="ghost" 
            className="w-full justify-start text-sm h-auto py-3 hover:bg-accent"
          >
            À propos de l'Appareil photo
          </Button>
          <Button 
            variant="ghost" 
            className="w-full justify-start text-sm h-auto py-3 hover:bg-accent"
          >
            Nous contacter
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Settings;
