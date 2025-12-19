import { Badge } from "@/components/ui/badge";

interface MultiDeviceStatsProps {
    stats: {
        activeConnections: number;
        wifiDevices: number;
        bluetoothDevices: number;
        pairedDevices: number;
    };
}

export const MultiDeviceStats = ({ stats }: MultiDeviceStatsProps) => {
    return (
        <div className="grid grid-cols-4 gap-2 p-3 bg-muted/50 rounded-lg">
            <div className="text-center">
                <p className="text-2xl font-bold">{stats.activeConnections}</p>
                <p className="text-xs text-muted-foreground">Connectés</p>
            </div>
            <div className="text-center">
                <p className="text-2xl font-bold">{stats.wifiDevices}</p>
                <p className="text-xs text-muted-foreground">Wi-Fi</p>
            </div>
            <div className="text-center">
                <p className="text-2xl font-bold">{stats.bluetoothDevices}</p>
                <p className="text-xs text-muted-foreground">Bluetooth</p>
            </div>
            <div className="text-center">
                <p className="text-2xl font-bold">{stats.pairedDevices}</p>
                <p className="text-xs text-muted-foreground">Jumelés</p>
            </div>
        </div>
    );
};
