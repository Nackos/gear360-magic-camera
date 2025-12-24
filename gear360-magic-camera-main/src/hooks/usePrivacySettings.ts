import { useState, useEffect } from 'react';

export interface PrivacySettings {
    location: boolean;
    camera: boolean;
    microphone: boolean;
    analytics: boolean;
    storage: boolean;
}

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
