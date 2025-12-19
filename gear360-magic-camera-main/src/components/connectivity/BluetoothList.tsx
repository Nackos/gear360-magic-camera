import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2, Bluetooth, RefreshCw } from "lucide-react";
import { BluetoothDevice } from "@/services/bluetoothService";
import { getSignalIcon } from "./utils";

interface BluetoothListProps {
    devices: BluetoothDevice[];
    isScanning: boolean;
    onScan: () => void;
    onConnect: (device: BluetoothDevice) => Promise<void>;
    connectingId: string | null;
}

export const BluetoothList = ({
    devices,
    isScanning,
    onScan,
    onConnect,
    connectingId
}: BluetoothListProps) => {
    return (
        <>
            <div className="flex justify-between items-center mb-3">
                <p className="text-sm text-muted-foreground">
                    Appareils Bluetooth disponibles
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
                    {devices.map(device => (
                        <Card key={device.id} className={`p-3 ${device.isGear360 ? 'border-primary/50' : ''}`}>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    {getSignalIcon(device.rssi, 'bluetooth')}
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <p className="font-medium">{device.name}</p>
                                            {device.isGear360 && (
                                                <Badge variant="default" className="text-xs">Gear 360</Badge>
                                            )}
                                            {device.paired && (
                                                <Badge variant="secondary" className="text-xs">Jumelé</Badge>
                                            )}
                                        </div>
                                        <p className="text-xs text-muted-foreground">
                                            {device.rssi}dBm • {device.services.join(', ') || 'Services en attente'}
                                        </p>
                                    </div>
                                </div>

                                <Button
                                    size="sm"
                                    onClick={() => onConnect(device)}
                                    disabled={connectingId === device.id}
                                >
                                    {connectingId === device.id ? (
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                    ) : (
                                        'Connecter'
                                    )}
                                </Button>
                            </div>
                        </Card>
                    ))}

                    {devices.length === 0 && !isScanning && (
                        <div className="text-center py-8 text-muted-foreground">
                            <Bluetooth className="w-10 h-10 mx-auto mb-2 opacity-50" />
                            <p>Cliquez sur Scanner pour rechercher des appareils</p>
                        </div>
                    )}
                </div>
            </ScrollArea>
        </>
    );
};
