import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2, Check, X, Wifi, RefreshCw } from "lucide-react";
import { WifiNetwork } from "@/services/networkService";
import { getSignalIcon } from "./utils";

interface WifiListProps {
    networks: WifiNetwork[];
    isScanning: boolean;
    onScan: () => void;
    onConnect: (network: WifiNetwork, password?: string) => Promise<void>;
    connectingId: string | null;
}

export const WifiList = ({
    networks,
    isScanning,
    onScan,
    onConnect,
    connectingId
}: WifiListProps) => {
    const [selectedNetwork, setSelectedNetwork] = useState<WifiNetwork | null>(null);
    const [wifiPassword, setWifiPassword] = useState("");

    const handleConnect = async (network: WifiNetwork) => {
        if (network.security !== 'OPEN' && !wifiPassword) {
            setSelectedNetwork(network);
            return;
        }
        await onConnect(network, wifiPassword);
        setWifiPassword("");
        setSelectedNetwork(null);
    };

    return (
        <>
            <div className="flex justify-between items-center mb-3">
                <p className="text-sm text-muted-foreground">
                    Réseaux Wi-Fi disponibles
                </p>
                <Button onClick={onScan} disabled={isScanning} size="sm" variant="outline">
                    {isScanning ? (
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    ) : (
                        <RefreshCw className="w-4 h-4 mr-2" />
                    )}
                    Scanner
                </Button>
            </div>

            <ScrollArea className="h-[280px] pr-4">
                <div className="space-y-2">
                    {networks.map(network => (
                        <Card key={network.ssid} className={`p-3 ${network.isGear360 ? 'border-primary/50' : ''}`}>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    {getSignalIcon(network.level, 'wifi')}
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <p className="font-medium">{network.ssid}</p>
                                            {network.isGear360 && (
                                                <Badge variant="default" className="text-xs">Gear 360</Badge>
                                            )}
                                        </div>
                                        <p className="text-xs text-muted-foreground">
                                            {network.security} • {network.frequency}MHz • {network.level}dBm
                                        </p>
                                    </div>
                                </div>

                                {selectedNetwork?.ssid === network.ssid ? (
                                    <div className="flex items-center gap-2">
                                        <Input
                                            type="password"
                                            placeholder="Mot de passe"
                                            value={wifiPassword}
                                            onChange={(e) => setWifiPassword(e.target.value)}
                                            className="w-32 h-8"
                                        />
                                        <Button
                                            size="sm"
                                            onClick={() => handleConnect(network)}
                                            disabled={!wifiPassword || connectingId === network.ssid}
                                        >
                                            {connectingId === network.ssid ? (
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                            ) : (
                                                <Check className="w-4 h-4" />
                                            )}
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            onClick={() => {
                                                setSelectedNetwork(null);
                                                setWifiPassword("");
                                            }}
                                        >
                                            <X className="w-4 h-4" />
                                        </Button>
                                    </div>
                                ) : (
                                    <Button
                                        size="sm"
                                        onClick={() => handleConnect(network)}
                                        disabled={connectingId === network.ssid}
                                    >
                                        {connectingId === network.ssid ? (
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                        ) : (
                                            'Connecter'
                                        )}
                                    </Button>
                                )}
                            </div>
                        </Card>
                    ))}

                    {networks.length === 0 && !isScanning && (
                        <div className="text-center py-8 text-muted-foreground">
                            <Wifi className="w-10 h-10 mx-auto mb-2 opacity-50" />
                            <p>Cliquez sur Scanner pour rechercher des réseaux</p>
                        </div>
                    )}
                </div>
            </ScrollArea>
        </>
    );
};
