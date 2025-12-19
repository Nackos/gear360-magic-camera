import { Signal, Bluetooth } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export type ConnectionType = 'wifi' | 'bluetooth';

export const getSignalIcon = (level: number, type: ConnectionType) => {
    const Icon = type === 'wifi' ? Signal : Bluetooth;
    const color = level > -50 ? 'text-green-500' : level > -70 ? 'text-yellow-500' : 'text-red-500';
    return <Icon className={`w-4 h-4 ${color}`} />;
};

export const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: "default" | "secondary" | "destructive" | "outline"; label: string }> = {
        connected: { variant: "default", label: "Connecté" },
        disconnected: { variant: "secondary", label: "Déconnecté" },
        connecting: { variant: "outline", label: "Connexion..." },
        pairing: { variant: "outline", label: "Jumelage..." },
        error: { variant: "destructive", label: "Erreur" }
    };
    const config = variants[status] || variants.disconnected;
    return <Badge variant={config.variant}>{config.label}</Badge>;
};
