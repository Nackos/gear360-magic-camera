import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Shield, Eye, Mic, MapPin, Camera, Settings } from 'lucide-react';

export interface PrivacySettings {
  location: boolean;
  camera: boolean;
  microphone: boolean;
  analytics: boolean;
  storage: boolean;
}

interface PrivacyConsentProps {
  onConsentChange: (settings: PrivacySettings) => void;
}

export const PrivacyConsent = ({ onConsentChange }: PrivacyConsentProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [settings, setSettings] = useState<PrivacySettings>({
    location: false,
    camera: false,
    microphone: false,
    analytics: false,
    storage: false
  });

  useEffect(() => {
    // Check if user has already given consent
    const savedConsent = localStorage.getItem('privacy-consent');
    if (!savedConsent) {
      setIsOpen(true);
    } else {
      try {
        const parsedSettings = JSON.parse(savedConsent);
        setSettings(parsedSettings);
        onConsentChange(parsedSettings);
      } catch {
        setIsOpen(true);
      }
    }
  }, [onConsentChange]);

  const privacyOptions = [
    {
      key: 'camera' as keyof PrivacySettings,
      icon: Camera,
      title: 'Accès caméra',
      description: 'Permettre l\'accès à la caméra pour capturer des photos et vidéos 360°',
      required: true
    },
    {
      key: 'microphone' as keyof PrivacySettings,
      icon: Mic,
      title: 'Accès microphone',
      description: 'Permettre l\'accès au microphone pour l\'assistant vocal IA',
      required: false
    },
    {
      key: 'location' as keyof PrivacySettings,
      icon: MapPin,
      title: 'Géolocalisation',
      description: 'Ajouter automatiquement la localisation aux photos (optionnel)',
      required: false
    },
    {
      key: 'storage' as keyof PrivacySettings,
      icon: Eye,
      title: 'Stockage local',
      description: 'Sauvegarder vos préférences et paramètres localement',
      required: true
    },
    {
      key: 'analytics' as keyof PrivacySettings,
      icon: Settings,
      title: 'Données d\'usage',
      description: 'Collecter des statistiques anonymes pour améliorer l\'application',
      required: false
    }
  ];

  const handleSettingChange = (key: keyof PrivacySettings, value: boolean) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleAccept = () => {
    // Ensure required permissions are enabled
    const finalSettings = {
      ...settings,
      camera: true, // Required for app to function
      storage: true // Required for app to function
    };

    localStorage.setItem('privacy-consent', JSON.stringify(finalSettings));
    localStorage.setItem('privacy-consent-date', new Date().toISOString());
    
    setSettings(finalSettings);
    onConsentChange(finalSettings);
    setIsOpen(false);
  };

  const openSettings = () => {
    setIsOpen(true);
  };

  // Privacy settings component for the main app
  const PrivacySettingsCard = () => (
    <Card className="p-4">
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Shield className="w-5 h-5 text-primary" />
          <h3 className="font-semibold">Paramètres de confidentialité</h3>
        </div>
        
        <div className="space-y-3">
          {privacyOptions.map((option) => (
            <div key={option.key} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <option.icon className="w-4 h-4 text-muted-foreground" />
                <div>
                  <Label className="text-sm font-medium">
                    {option.title}
                    {option.required && <span className="text-red-500 ml-1">*</span>}
                  </Label>
                  <p className="text-xs text-muted-foreground">{option.description}</p>
                </div>
              </div>
              <Switch
                checked={settings[option.key]}
                onCheckedChange={(checked) => handleSettingChange(option.key, checked)}
                disabled={option.required}
              />
            </div>
          ))}
        </div>
        
        <Button onClick={handleAccept} className="w-full" size="sm">
          Sauvegarder les préférences
        </Button>
      </div>
    </Card>
  );

  return (
    <>
      <Dialog open={isOpen} onOpenChange={() => {}}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-primary" />
              Paramètres de confidentialité
            </DialogTitle>
            <DialogDescription>
              Configurez vos préférences de confidentialité pour une expérience personnalisée et sécurisée.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {privacyOptions.map((option) => (
              <div key={option.key} className="flex items-start justify-between p-3 border rounded-lg">
                <div className="flex items-start gap-3">
                  <option.icon className="w-5 h-5 text-muted-foreground mt-0.5" />
                  <div className="space-y-1">
                    <Label className="text-sm font-medium">
                      {option.title}
                      {option.required && <span className="text-red-500 ml-1">*</span>}
                    </Label>
                    <p className="text-xs text-muted-foreground">{option.description}</p>
                  </div>
                </div>
                <Switch
                  checked={settings[option.key]}
                  onCheckedChange={(checked) => handleSettingChange(option.key, checked)}
                  disabled={option.required}
                />
              </div>
            ))}
          </div>

          <div className="bg-blue-50 dark:bg-blue-950/20 p-3 rounded-lg">
            <p className="text-xs text-blue-800 dark:text-blue-200">
              <Shield className="w-3 h-3 inline mr-1" />
              Vos données restent privées et ne sont jamais partagées avec des tiers.
              Les éléments marqués d'un * sont requis pour le fonctionnement de l'application.
            </p>
          </div>

          <div className="flex gap-2">
            <Button onClick={handleAccept} className="flex-1">
              Accepter et continuer
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Export the settings card for use in other components */}
      {!isOpen && (
        <div className="hidden">
          <PrivacySettingsCard />
        </div>
      )}
    </>
  );
};

// Hook for accessing privacy settings
export const usePrivacySettings = () => {
  const [settings, setSettings] = useState<PrivacySettings>({
    location: false,
    camera: false,
    microphone: false,
    analytics: false,
    storage: false
  });

  useEffect(() => {
    const savedConsent = localStorage.getItem('privacy-consent');
    if (savedConsent) {
      try {
        setSettings(JSON.parse(savedConsent));
      } catch {
        // Invalid stored settings, reset to defaults
      }
    }
  }, []);

  const updateSettings = (newSettings: Partial<PrivacySettings>) => {
    const updated = { ...settings, ...newSettings };
    setSettings(updated);
    localStorage.setItem('privacy-consent', JSON.stringify(updated));
  };

  return { settings, updateSettings };
};