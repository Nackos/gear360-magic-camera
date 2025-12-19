import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  Wifi, Bluetooth, Smartphone, Link2
} from "lucide-react";
import { multiDeviceManager, ConnectedDevice } from "@/services/multiDeviceManager";
import { networkService, WifiNetwork } from "@/services/networkService";
import { bluetoothService, BluetoothDevice } from "@/services/bluetoothService";
import { toast } from "@/hooks/use-toast";

// Sub-components
import { MultiDeviceStats } from "./connectivity/MultiDeviceStats";
import { ConnectedDeviceList } from "./connectivity/ConnectedDeviceList";
import { WifiList } from "./connectivity/WifiList";
import { BluetoothList } from "./connectivity/BluetoothList";

export const MultiDeviceConnectionPanel = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"devices" | "wifi" | "bluetooth">("devices");
  const [isScanning, setIsScanning] = useState(false);
  const [wifiNetworks, setWifiNetworks] = useState<WifiNetwork[]>([]);
  const [bluetoothDevices, setBluetoothDevices] = useState<BluetoothDevice[]>([]);
  const [connectedDevices, setConnectedDevices] = useState<ConnectedDevice[]>([]);
  const [pairedDevices, setPairedDevices] = useState<ConnectedDevice[]>([]);
  const [connectingId, setConnectingId] = useState<string | null>(null);

  // Charger les appareils au montage
  useEffect(() => {
    refreshDevices();

    const handleConnected = (device: ConnectedDevice) => {
      refreshDevices();
      toast({
        title: "Appareil connecté",
        description: `${device.name} connecté via ${device.type === 'wifi' ? 'Wi-Fi' : 'Bluetooth'}`,
      });
    };

    const handleDisconnected = (device: ConnectedDevice) => {
      refreshDevices();
      toast({
        title: "Appareil déconnecté",
        description: `${device.name} déconnecté`,
      });
    };

    const handlePaired = (device: ConnectedDevice) => {
      refreshDevices();
      toast({
        title: "Jumelage réussi",
        description: `${device.name} a été jumelé`,
      });
    };

    multiDeviceManager.on('deviceConnected', handleConnected);
    multiDeviceManager.on('deviceDisconnected', handleDisconnected);
    multiDeviceManager.on('devicePaired', handlePaired);

    return () => {
      multiDeviceManager.off('deviceConnected', handleConnected);
      multiDeviceManager.off('deviceDisconnected', handleDisconnected);
      multiDeviceManager.off('devicePaired', handlePaired);
    };
  }, []);

  const refreshDevices = useCallback(() => {
    setConnectedDevices(multiDeviceManager.getConnectedDevices());
    setPairedDevices(multiDeviceManager.getPairedDevices());
  }, []);

  // Scanner Wi-Fi
  const scanWifi = async () => {
    setIsScanning(true);
    try {
      const networks = await networkService.scanWifiNetworks();
      setWifiNetworks(networks);
    } catch (error) {
      toast({
        title: "Erreur de scan Wi-Fi",
        description: "Impossible de scanner les réseaux",
        variant: "destructive"
      });
    } finally {
      setIsScanning(false);
    }
  };

  // Scanner Bluetooth
  const scanBluetooth = async () => {
    setIsScanning(true);
    try {
      await bluetoothService.startScan();
      bluetoothService.on('devicesFound', (devices: BluetoothDevice[]) => {
        setBluetoothDevices(devices);
        setIsScanning(false);
      });
    } catch (error) {
      toast({
        title: "Erreur de scan Bluetooth",
        description: "Impossible de scanner les appareils",
        variant: "destructive"
      });
      setIsScanning(false);
    }
  };

  // Connexion Wi-Fi
  const connectWifi = async (network: WifiNetwork, password?: string) => {
    setConnectingId(network.ssid);
    try {
      await multiDeviceManager.connectDevice({
        id: `wifi_${network.ssid}`,
        name: network.ssid,
        type: 'wifi',
        address: network.bssid,
        signalStrength: network.level,
        isGear360: network.isGear360,
        metadata: { password: password, security: network.security }
      });
      // La notification de succès est gérée par l'événement
    } finally {
      setConnectingId(null);
    }
  };

  // Connexion Bluetooth
  const connectBluetooth = async (device: BluetoothDevice) => {
    setConnectingId(device.id);
    try {
      await multiDeviceManager.connectDevice({
        id: device.id,
        name: device.name,
        type: 'bluetooth',
        address: device.address,
        signalStrength: device.rssi,
        isPaired: device.paired,
        isGear360: device.isGear360,
        services: device.services
      });
    } finally {
      setConnectingId(null);
    }
  };

  // Connexion (depuis liste jumulés)
  const connectToDevice = async (device: ConnectedDevice) => {
    setConnectingId(device.id);
    try {
      await multiDeviceManager.connectDevice(device);
    } finally {
      setConnectingId(null);
    }
  }

  // Jumelage
  const pairDevice = async (device: ConnectedDevice) => {
    await multiDeviceManager.pairDevice(device);
  };

  // Déconnexion
  const disconnectDevice = async (deviceId: string) => {
    await multiDeviceManager.disconnectDevice(deviceId);
  };

  // Supprimer jumelage
  const unpairDevice = async (deviceId: string) => {
    await multiDeviceManager.unpairDevice(deviceId);
  };

  const stats = multiDeviceManager.getStats();

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Link2 className="w-4 h-4" />
          {stats.activeConnections > 0 ? (
            <Badge variant="secondary" className="px-1.5 py-0.5">
              {stats.activeConnections}
            </Badge>
          ) : (
            'Connecter'
          )}
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[700px] max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Smartphone className="w-5 h-5" />
            Gestion des appareils
          </DialogTitle>
          <DialogDescription>
            Connectez et gérez plusieurs appareils simultanément
          </DialogDescription>
        </DialogHeader>

        {/* Stats rapides */}
        <MultiDeviceStats stats={stats} />

        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="devices" className="gap-2">
              <Smartphone className="w-4 h-4" />
              Appareils
            </TabsTrigger>
            <TabsTrigger value="wifi" className="gap-2">
              <Wifi className="w-4 h-4" />
              Wi-Fi
            </TabsTrigger>
            <TabsTrigger value="bluetooth" className="gap-2">
              <Bluetooth className="w-4 h-4" />
              Bluetooth
            </TabsTrigger>
          </TabsList>

          {/* Liste des appareils connectés et jumelés */}
          <TabsContent value="devices">
            <ConnectedDeviceList
              connectedDevices={connectedDevices}
              pairedDevices={pairedDevices}
              onPair={pairDevice}
              onUnpair={unpairDevice}
              onDisconnect={disconnectDevice}
              onConnect={connectToDevice}
              connectingId={connectingId}
            />
          </TabsContent>

          {/* Scanner Wi-Fi */}
          <TabsContent value="wifi">
            <WifiList
              networks={wifiNetworks}
              isScanning={isScanning}
              onScan={scanWifi}
              onConnect={connectWifi}
              connectingId={connectingId}
            />
          </TabsContent>

          {/* Scanner Bluetooth */}
          <TabsContent value="bluetooth">
            <BluetoothList
              devices={bluetoothDevices}
              isScanning={isScanning}
              onScan={scanBluetooth}
              onConnect={connectBluetooth}
              connectingId={connectingId}
            />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};
