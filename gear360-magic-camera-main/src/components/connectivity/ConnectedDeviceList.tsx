import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2, WifiOff, BluetoothOff, Battery, Plus, Unlink, Trash2, Link2 } from "lucide-react";
import { ConnectedDevice } from "@/services/multiDeviceManager";
import { getSignalIcon, getStatusBadge } from "./utils";

interface ConnectedDeviceListProps {
    connectedDevices: ConnectedDevice[];
    pairedDevices: ConnectedDevice[];
    onPair: (device: ConnectedDevice) => void;
    onUnpair: (deviceId: string) => void;
    onDisconnect: (deviceId: string) => void;
    onConnect: (device: ConnectedDevice) => void;
    connectingId: string | null;
}

export const ConnectedDeviceList = ({
    connectedDevices,
    pairedDevices,
    onPair,
    onUnpair,
    onDisconnect,
    onConnect,
    connectingId
}: ConnectedDeviceListProps) => {
    return (
        <ScrollArea className="h-[300px] pr-4">
            {connectedDevices.length === 0 && pairedDevices.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                    <WifiOff className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>Aucun appareil connecté ou jumelé</p>
                    <p className="text-sm">Utilisez les onglets Wi-Fi ou Bluetooth pour ajouter des appareils</p>
                </div>
            ) : (
                <div className="space-y-2">
                    {/* Appareils connectés */}
                    {connectedDevices.length > 0 && (
                        <>
                            <h4 className="text-sm font-medium text-muted-foreground mb-2">Connectés</h4>
                            {connectedDevices.map(device => (
                                <Card key={device.id} className="p-3 border-green-200 bg-green-50/50">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            {getSignalIcon(device.signalStrength, device.type)}
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <p className="font-medium">{device.name}</p>
                                                    {device.isGear360 && (
                                                        <Badge variant="outline" className="text-xs">Gear 360</Badge>
                                                    )}
                                                </div>
                                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                                    <span>{device.type === 'wifi' ? 'Wi-Fi' : 'Bluetooth'}</span>
                                                    {device.batteryLevel && (
                                                        <span className="flex items-center gap-1">
                                                            <Battery className="w-3 h-3" />
                                                            {device.batteryLevel}%
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {getStatusBadge(device.status)}
                                            {!device.isPaired && (
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => onPair(device)}
                                                >
                                                    <Plus className="w-4 h-4" />
                                                </Button>
                                            )}
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => onDisconnect(device.id)}
                                            >
                                                <Unlink className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </div>
                                </Card>
                            ))}
                        </>
                    )}

                    {/* Appareils jumelés non connectés */}
                    {pairedDevices.filter(d => d.status !== 'connected').length > 0 && (
                        <>
                            <h4 className="text-sm font-medium text-muted-foreground mt-4 mb-2">Jumelés</h4>
                            {pairedDevices.filter(d => d.status !== 'connected').map(device => (
                                <Card key={device.id} className="p-3">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            {device.type === 'wifi' ? (
                                                <WifiOff className="w-4 h-4 text-muted-foreground" />
                                            ) : (
                                                <BluetoothOff className="w-4 h-4 text-muted-foreground" />
                                            )}
                                            <div>
                                                <p className="font-medium">{device.name}</p>
                                                <p className="text-xs text-muted-foreground">
                                                    {device.type === 'wifi' ? 'Wi-Fi' : 'Bluetooth'} • Jumelé
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => onConnect(device)}
                                                disabled={connectingId === device.id}
                                            >
                                                {connectingId === device.id ? (
                                                    <Loader2 className="w-4 h-4 animate-spin" />
                                                ) : (
                                                    <Link2 className="w-4 h-4" />
                                                )}
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => onUnpair(device.id)}
                                            >
                                                <Trash2 className="w-4 h-4 text-destructive" />
                                            </Button>
                                        </div>
                                    </div>
                                </Card>
                            ))}
                        </>
                    )}
                </div>
            )}
        </ScrollArea>
    );
};
