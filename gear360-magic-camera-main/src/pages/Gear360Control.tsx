import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Wifi, Bluetooth, Camera, Video, Square, Battery, Settings as SettingsIcon, Trash2, RefreshCw, TestTube } from "lucide-react";
import { bluetoothService, BluetoothDevice } from "@/services/bluetoothService";
import { networkService, WifiNetwork } from "@/services/networkService";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ConnectivityTest } from "@/components/ConnectivityTest";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface Notification {
  id: string;
  date: Date;
  data: unknown;
}

const Gear360Control: React.FC = () => {
  const navigate = useNavigate();
  const [bluetoothDevices, setBluetoothDevices] = useState<BluetoothDevice[]>([]);
  const [wifiNetworks, setWifiNetworks] = useState<WifiNetwork[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const [connectedDevice, setConnectedDevice] = useState<BluetoothDevice | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [activeTab, setActiveTab] = useState<'bluetooth' | 'wifi'>('bluetooth');
  const [wifiPassword, setWifiPassword] = useState("");
  const [selectedNetwork, setSelectedNetwork] = useState<WifiNetwork | null>(null);
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [showDisconnectDialog, setShowDisconnectDialog] = useState(false);
  const [loadingCommand, setLoadingCommand] = useState<string | null>(null);

  useEffect(() => {
    const onDevicesFound = (devices: BluetoothDevice[]) => {
      setBluetoothDevices(devices || []);
      setIsScanning(false);
      toast.success(`${(devices || []).length} appareil(s) trouvé(s)`);
    };

    const onDeviceConnected = (device: BluetoothDevice) => {
      setConnectedDevice(device);
      toast.success(`Connecté à ${device.name}`);
    };

    const onDeviceDisconnected = (device: BluetoothDevice) => {
      if (connectedDevice?.id === device?.id) setConnectedDevice(null);
      toast.info("Déconnecté");
    };

    const onNotification = (data: unknown) => {
      const newNotification: Notification = {
        id: Date.now().toString(),
        date: new Date(),
        data,
      };
      setNotifications((prev) => [newNotification, ...prev].slice(0, 50));
    };

    bluetoothService.on("devicesFound", onDevicesFound);
    bluetoothService.on("deviceConnected", onDeviceConnected);
    bluetoothService.on("deviceDisconnected", onDeviceDisconnected);
    bluetoothService.on("notification", onNotification);

    // Charger les appareils appairés au démarrage
    loadPairedDevices();

    return () => {
      bluetoothService.off("devicesFound", onDevicesFound);
      bluetoothService.off("deviceConnected", onDeviceConnected);
      bluetoothService.off("deviceDisconnected", onDeviceDisconnected);
      bluetoothService.off("notification", onNotification);
      bluetoothService.stopScan();
    };
  }, [connectedDevice?.id, loadPairedDevices]);

  const loadPairedDevices = useCallback(async () => {
    try {
      const paired = await bluetoothService.getPairedDevices();
      if (paired && paired.length) {
        setBluetoothDevices((prev) => {
          const ids = new Set(prev.map((x) => x.id));
          const newDevices = paired.filter((p) => !ids.has(p.id));
          return [...prev, ...newDevices];
        });
      }
    } catch (error) {
      console.error("Error loading paired devices:", error);
    }
  }, []);

  const startBluetoothScan = async () => {
    const available = await bluetoothService.isBluetoothAvailable();
    if (!available) {
      toast.error("Bluetooth non disponible");
      return;
    }
    setIsScanning(true);
    await bluetoothService.startScan();
  };

  const stopBluetoothScan = async () => {
    await bluetoothService.stopScan();
    setIsScanning(false);
    toast.info("Scan arrêté");
  };

  const scanWifiNetworks = async () => {
    try {
      setIsScanning(true);
      const networks = await networkService.scanWifiNetworks();
      setWifiNetworks(networks || []);
      toast.success(`${networks.length} réseau(x) trouvé(s)`);
    } catch (error) {
      toast.error("Erreur lors du scan Wi-Fi");
    } finally {
      setIsScanning(false);
    }
  };

  const connectBluetooth = async (device: BluetoothDevice) => {
    const ok = await bluetoothService.connectToDevice(device.id);
    if (ok) {
      await bluetoothService.startNotifications();
    } else {
      toast.error("Échec de la connexion");
    }
  };

  const pairDevice = async (device: BluetoothDevice) => {
    const ok = await bluetoothService.pairDevice(device.address);
    if (ok) {
      toast.success(`${device.name} appairé`);
      setBluetoothDevices((devices) =>
        devices.map((d) => (d.id === device.id ? { ...d, paired: true } : d))
      );
    } else {
      toast.error("Échec de l'appairage");
    }
  };

  const connectWifi = async () => {
    if (!selectedNetwork) return;
    const ok = await networkService.connectToWifi(selectedNetwork.ssid, wifiPassword);
    if (ok) {
      toast.success(`Connecté au réseau ${selectedNetwork.ssid}`);
      setShowPasswordDialog(false);
      setWifiPassword("");
      setSelectedNetwork(null);
    } else {
      toast.error("Échec de connexion Wi-Fi");
    }
  };

  const disconnectDevice = async () => {
    await bluetoothService.disconnect();
    setConnectedDevice(null);
    setShowDisconnectDialog(false);
    toast.info("Déconnecté");
  };

  const sendCommand = async (command: string) => {
    if (!connectedDevice) {
      toast.error("Aucun appareil connecté");
      return;
    }

    setLoadingCommand(command);
    try {
      const res = await bluetoothService.sendCommand(command);

      if (res?.battery !== undefined) {
        toast.success(`Batterie : ${res.battery}%`);
      } else if (res?.resolution) {
        toast.success(`Réglages: ${res.resolution} @ ${res.frameRate}fps`);
      } else if (res?.success) {
        toast.success(`Commande ${command} exécutée`);
      } else {
        toast.info("Réponse reçue");
      }
    } catch (error) {
      console.error(error);
      toast.error("Erreur lors de l'envoi de la commande");
    } finally {
      setLoadingCommand(null);
    }
  };

  const removeDevice = (deviceId: string) => {
    setBluetoothDevices((devices) => devices.filter((d) => d.id !== deviceId));
    toast.info("Appareil supprimé de la liste");
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="ml-2 text-lg font-semibold">Contrôle Gear 360</h1>
        </div>
      </header>

      {/* Content */}
      <main className="container py-6 space-y-6">
        <Tabs defaultValue="connection" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="connection">Connexion</TabsTrigger>
            <TabsTrigger value="test">
              <TestTube className="mr-2 h-4 w-4" />
              Tests
            </TabsTrigger>
          </TabsList>

          <TabsContent value="test" className="mt-6">
            <ConnectivityTest />
          </TabsContent>

          <TabsContent value="connection" className="mt-6 space-y-6">
            {/* Tab Selector */}
            <div className="flex gap-2">
              <Button
                variant={activeTab === "bluetooth" ? "default" : "outline"}
                onClick={() => setActiveTab("bluetooth")}
                className="flex-1"
              >
                <Bluetooth className="mr-2 h-4 w-4" />
                Bluetooth
              </Button>
              <Button
                variant={activeTab === "wifi" ? "default" : "outline"}
                onClick={() => setActiveTab("wifi")}
                className="flex-1"
              >
                <Wifi className="mr-2 h-4 w-4" />
                Wi-Fi
              </Button>
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <Button
                onClick={activeTab === "bluetooth" ? startBluetoothScan : scanWifiNetworks}
                disabled={isScanning}
                className="flex-1"
              >
                <RefreshCw className={`mr-2 h-4 w-4 ${isScanning ? "animate-spin" : ""}`} />
                {isScanning ? "Recherche..." : "Rechercher appareils"}
              </Button>
              {isScanning && activeTab === "bluetooth" && (
                <Button variant="outline" onClick={stopBluetoothScan}>
                  Arrêter
                </Button>
              )}
            </div>

            {/* Bluetooth Devices List */}
            {activeTab === "bluetooth" && (
              <Card>
                <CardHeader>
                  <CardTitle>Appareils Bluetooth</CardTitle>
                  <CardDescription>{bluetoothDevices.length} appareil(s) détecté(s)</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {bluetoothDevices.length === 0 ? (
                    <Alert>
                      <AlertDescription>
                        Aucun appareil. Lance une recherche pour trouver ta Gear 360
                      </AlertDescription>
                    </Alert>
                  ) : (
                    bluetoothDevices.map((device) => (
                      <div
                        key={device.id}
                        className="flex items-center justify-between p-3 rounded-lg border bg-card"
                      >
                        <div className="flex-1">
                          <h3 className="font-medium">{device.name || "Nom inconnu"}</h3>
                          <p className="text-sm text-muted-foreground">
                            {device.address} • RSSI {device.rssi ?? "—"}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Services: {device.services?.join(", ") || "—"}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => connectBluetooth(device)}
                            disabled={connectedDevice?.id === device.id}
                          >
                            {connectedDevice?.id === device.id ? "Connecté" : "Connecter"}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => pairDevice(device)}
                            disabled={device.paired}
                          >
                            {device.paired ? "Appairé" : "Appairer"}
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => removeDevice(device.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>
            )}

            {/* WiFi Networks List */}
            {activeTab === "wifi" && (
              <Card>
                <CardHeader>
                  <CardTitle>Réseaux Wi-Fi</CardTitle>
                  <CardDescription>{wifiNetworks.length} réseau(x) disponible(s)</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {wifiNetworks.length === 0 ? (
                    <Alert>
                      <AlertDescription>
                        Aucun réseau scanné. Lance un scan pour détecter les réseaux Gear 360
                      </AlertDescription>
                    </Alert>
                  ) : (
                    wifiNetworks.map((network, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-3 rounded-lg border bg-card"
                      >
                        <div>
                          <h3 className="font-medium">{network.ssid}</h3>
                          <p className="text-sm text-muted-foreground">
                            Signal: {network.level} dBm • {network.security}
                          </p>
                          {network.isGear360 && (
                            <span className="text-xs text-primary font-medium">Gear 360</span>
                          )}
                        </div>
                        <Button
                          size="sm"
                          onClick={() => {
                            setSelectedNetwork(network);
                            setShowPasswordDialog(true);
                          }}
                        >
                          Se connecter
                        </Button>
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>
            )}

            {/* Control Panel - Only when connected */}
            {connectedDevice && (
              <Card>
                <CardHeader>
                  <CardTitle>{connectedDevice.name}</CardTitle>
                  <CardDescription>{connectedDevice.address}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    <Button
                      onClick={() => sendCommand("capture_photo")}
                      disabled={!!loadingCommand}
                      className="h-auto py-4 flex-col"
                    >
                      <Camera className="h-6 w-6 mb-2" />
                      <span>Photo</span>
                    </Button>

                    <Button
                      onClick={() => sendCommand("start_recording")}
                      disabled={!!loadingCommand}
                      className="h-auto py-4 flex-col"
                    >
                      <Video className="h-6 w-6 mb-2" />
                      <span>Démarrer vidéo</span>
                    </Button>

                    <Button
                      onClick={() => sendCommand("stop_recording")}
                      disabled={!!loadingCommand}
                      className="h-auto py-4 flex-col"
                    >
                      <Square className="h-6 w-6 mb-2" />
                      <span>Arrêter vidéo</span>
                    </Button>

                    <Button
                      onClick={() => sendCommand("get_battery")}
                      disabled={!!loadingCommand}
                      variant="outline"
                      className="h-auto py-4 flex-col"
                    >
                      <Battery className="h-6 w-6 mb-2" />
                      <span>Batterie</span>
                    </Button>

                    <Button
                      onClick={() => sendCommand("get_settings")}
                      disabled={!!loadingCommand}
                      variant="outline"
                      className="h-auto py-4 flex-col"
                    >
                      <SettingsIcon className="h-6 w-6 mb-2" />
                      <span>Réglages</span>
                    </Button>

                    <Button
                      onClick={() => setShowDisconnectDialog(true)}
                      variant="destructive"
                      className="h-auto py-4 flex-col"
                    >
                      <Bluetooth className="h-6 w-6 mb-2" />
                      <span>Déconnecter</span>
                    </Button>
                  </div>

                  {/* Notifications */}
                  <div className="space-y-2">
                    <h3 className="font-medium">Notifications récentes</h3>
                    {notifications.length === 0 ? (
                      <p className="text-sm text-muted-foreground">Aucune notification</p>
                    ) : (
                      <div className="space-y-2 max-h-48 overflow-y-auto">
                        {notifications.slice(0, 6).map((notif) => (
                          <div
                            key={notif.id}
                            className="p-2 rounded border-l-2 border-primary/20 bg-secondary/20 text-sm"
                          >
                            <div className="text-xs text-muted-foreground">
                              {notif.date.toLocaleTimeString()}
                            </div>
                            <pre className="text-xs mt-1 overflow-x-auto">
                              {JSON.stringify(notif.data, null, 2)}
                            </pre>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </main>

      {/* WiFi Password Dialog */}
      <AlertDialog open={showPasswordDialog} onOpenChange={setShowPasswordDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Connexion Wi-Fi</AlertDialogTitle>
            <AlertDialogDescription>
              Connecter au réseau: {selectedNetwork?.ssid}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-4">
            <Input
              type="password"
              placeholder="Mot de passe (optionnel)"
              value={wifiPassword}
              onChange={(e) => setWifiPassword(e.target.value)}
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setWifiPassword("")}>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={connectWifi}>Se connecter</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Disconnect Confirmation Dialog */}
      <AlertDialog open={showDisconnectDialog} onOpenChange={setShowDisconnectDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Déconnecter</AlertDialogTitle>
            <AlertDialogDescription>
              Voulez-vous vraiment vous déconnecter de {connectedDevice?.name}?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={disconnectDevice}>Déconnecter</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Gear360Control;
