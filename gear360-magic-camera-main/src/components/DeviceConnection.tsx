import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Wifi, Bluetooth, Search, Loader2, Check, X, Signal, Shield, AlertTriangle } from "lucide-react";
import { gear360Service, Gear360Device } from "@/services/gear360Service";
import { networkService, WifiNetwork } from "@/services/networkService";
import { bluetoothService, BluetoothDevice } from "@/services/bluetoothService";
import { toast } from "@/hooks/use-toast";
import { wifiPasswordSchema, checkPasswordStrength, networkScanLimiter, connectionLimiter } from "@/utils/inputValidation";
import { handleSecureError, withTimeout } from "@/utils/errorHandler";

export const DeviceConnection = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("wifi");
  const [isScanning, setIsScanning] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [wifiNetworks, setWifiNetworks] = useState<WifiNetwork[]>([]);
  const [bluetoothDevices, setBluetoothDevices] = useState<BluetoothDevice[]>([]);
  const [selectedDevice, setSelectedDevice] = useState<string | null>(null);
  const [wifiPassword, setWifiPassword] = useState("");
  const [passwordStrength, setPasswordStrength] = useState({ score: 0, feedback: [] });
  const [passwordError, setPasswordError] = useState("");

  // Scanner les appareils Wi-Fi avec rate limiting
  const scanWifiDevices = async () => {
    if (!networkScanLimiter.isAllowed('wifi-scan')) {
      const remainingTime = networkScanLimiter.getRemainingTime('wifi-scan');
      toast({
        title: "Trop de tentatives",
        description: `Veuillez patienter ${Math.ceil(remainingTime / 1000)} secondes avant de scanner à nouveau`,
        variant: "destructive"
      });
      return;
    }

    setIsScanning(true);
    try {
      const networks = await withTimeout(
        networkService.scanWifiNetworks(),
        10000,
        'Scan timeout'
      );
      const gear360Networks = networks.filter(network => network.isGear360);
      setWifiNetworks(gear360Networks);
      
      if (gear360Networks.length === 0) {
        toast({
          title: "Aucune caméra trouvée",
          description: "Vérifiez que votre Gear 360 est allumée et en mode Wi-Fi",
        });
      }
    } catch (error) {
      const secureError = handleSecureError(error, 'wifi-scan');
      toast({
        title: "Erreur de scan",
        description: secureError.userMessage,
        variant: "destructive"
      });
    } finally {
      setIsScanning(false);
    }
  };

  // Scanner les appareils Bluetooth
  const scanBluetoothDevices = async () => {
    setIsScanning(true);
    try {
      await bluetoothService.startScan();
      
      // Écouter les résultats du scan
      bluetoothService.on('devicesFound', (devices: BluetoothDevice[]) => {
        const gear360Devices = devices.filter(device => device.isGear360);
        setBluetoothDevices(gear360Devices);
        setIsScanning(false);
        
        if (gear360Devices.length === 0) {
          toast({
            title: "Aucune caméra trouvée",
            description: "Vérifiez que votre Gear 360 est allumée et visible",
          });
        }
      });
    } catch (error) {
      toast({
        title: "Erreur de scan",
        description: "Impossible de scanner les appareils Bluetooth",
        variant: "destructive"
      });
      setIsScanning(false);
    }
  };

  // Connexion Wi-Fi avec validation sécurisée
  const connectWifi = async (network: WifiNetwork) => {
    if (!connectionLimiter.isAllowed(`wifi-${network.ssid}`)) {
      const remainingTime = connectionLimiter.getRemainingTime(`wifi-${network.ssid}`);
      toast({
        title: "Trop de tentatives",
        description: `Veuillez patienter ${Math.ceil(remainingTime / 1000)} secondes avant de réessayer`,
        variant: "destructive"
      });
      return;
    }

    // Validate password if required
    if (network.security !== 'OPEN') {
      const validation = wifiPasswordSchema.safeParse({ password: wifiPassword });
      if (!validation.success) {
        setPasswordError(validation.error.errors[0].message);
        return;
      }
    }

    setIsConnecting(true);
    setSelectedDevice(network.ssid);
    setPasswordError("");
    
    try {
      // Se connecter au réseau Wi-Fi avec timeout
      const connected = await withTimeout(
        networkService.connectToWifi(
          network.ssid, 
          network.security !== 'OPEN' ? wifiPassword : undefined
        ),
        15000,
        'Connection timeout'
      );
      
      if (connected) {
        // Se connecter à la caméra via le service Gear 360
        const success = await withTimeout(
          gear360Service.connectToDevice(network.ssid),
          10000,
          'Device connection timeout'
        );
        if (success) {
          setIsOpen(false);
          setWifiPassword("");
          toast({
            title: "Connexion réussie",
            description: `Connecté à ${network.ssid} via Wi-Fi`,
          });
        }
      }
    } catch (error) {
      const secureError = handleSecureError(error, 'wifi-connection');
      toast({
        title: "Connexion échouée",
        description: secureError.userMessage,
        variant: "destructive"
      });
    } finally {
      setIsConnecting(false);
      setSelectedDevice(null);
    }
  };

  // Handle password input with strength checking
  const handlePasswordChange = (password: string) => {
    setWifiPassword(password);
    setPasswordError("");
    
    if (password.length > 0) {
      const strength = checkPasswordStrength(password);
      setPasswordStrength(strength);
    } else {
      setPasswordStrength({ score: 0, feedback: [] });
    }
  };

  // Connexion Bluetooth
  const connectBluetooth = async (device: BluetoothDevice) => {
    setIsConnecting(true);
    setSelectedDevice(device.id);
    
    try {
      const connected = await bluetoothService.connectToDevice(device.id);
      if (connected) {
        const success = await gear360Service.connectToDevice(device.id);
        if (success) {
          setIsOpen(false);
          toast({
            title: "Connexion réussie",
            description: `Connecté à ${device.name} via Bluetooth`,
          });
        }
      }
    } catch (error) {
      toast({
        title: "Connexion échouée",
        description: "Impossible de se connecter via Bluetooth",
        variant: "destructive"
      });
    } finally {
      setIsConnecting(false);
      setSelectedDevice(null);
    }
  };

  // Déconnexion
  const disconnect = async () => {
    try {
      await gear360Service.disconnect();
      await networkService.disconnectWifi();
      await bluetoothService.disconnect();
    } catch (error) {
      console.error('Disconnect error:', error);
    }
  };

  const getSignalIcon = (level: number) => {
    if (level > -50) return <Signal className="w-4 h-4 text-green-500" />;
    if (level > -70) return <Signal className="w-4 h-4 text-yellow-500" />;
    return <Signal className="w-4 h-4 text-red-500" />;
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Wifi className="w-4 h-4 mr-2" />
          {gear360Service.isConnected ? 'Changer appareil' : 'Connecter caméra'}
        </Button>
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Connexion Samsung Gear 360</DialogTitle>
          <DialogDescription>
            Choisissez votre méthode de connexion préférée
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="wifi" className="flex items-center gap-2">
              <Wifi className="w-4 h-4" />
              Wi-Fi
            </TabsTrigger>
            <TabsTrigger value="bluetooth" className="flex items-center gap-2">
              <Bluetooth className="w-4 h-4" />
              Bluetooth
            </TabsTrigger>
          </TabsList>

          <TabsContent value="wifi" className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Réseaux Wi-Fi Gear 360 détectés
              </p>
              <Button 
                onClick={scanWifiDevices} 
                disabled={isScanning}
                size="sm"
                variant="outline"
              >
                {isScanning ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Search className="w-4 h-4" />
                )}
                Scanner
              </Button>
            </div>

            <div className="space-y-2 max-h-60 overflow-y-auto">
              {wifiNetworks.map((network) => (
                <Card key={network.ssid} className="p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {getSignalIcon(network.level)}
                      <div>
                        <p className="font-medium">{network.ssid}</p>
                        <p className="text-xs text-muted-foreground">
                          {network.security} • {network.frequency}MHz
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {network.security !== 'OPEN' && (
                        <div className="flex flex-col gap-1">
                          <Input
                            type="password"
                            placeholder="Mot de passe"
                            value={wifiPassword}
                            onChange={(e) => handlePasswordChange(e.target.value)}
                            className={`w-40 ${passwordError ? 'border-destructive' : ''}`}
                            disabled={isConnecting && selectedDevice === network.ssid}
                          />
                          {passwordError && (
                            <div className="flex items-center gap-1 text-xs text-destructive">
                              <AlertTriangle className="w-3 h-3" />
                              {passwordError}
                            </div>
                          )}
                          {wifiPassword.length > 0 && passwordStrength.score < 3 && (
                            <div className="flex items-center gap-1 text-xs text-amber-600">
                              <Shield className="w-3 h-3" />
                              Mot de passe faible
                            </div>
                          )}
                        </div>
                      )}
                      
                      <Button 
                        onClick={() => connectWifi(network)}
                        disabled={isConnecting || (network.security !== 'OPEN' && !wifiPassword)}
                        size="sm"
                      >
                        {isConnecting && selectedDevice === network.ssid ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          'Connecter'
                        )}
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
              
              {wifiNetworks.length === 0 && !isScanning && (
                <div className="text-center py-8 text-muted-foreground">
                  <Wifi className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>Aucun réseau Gear 360 trouvé</p>
                  <p className="text-xs">Assurez-vous que votre caméra est allumée</p>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="bluetooth" className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Appareils Bluetooth Gear 360 détectés
              </p>
              <Button 
                onClick={scanBluetoothDevices} 
                disabled={isScanning}
                size="sm"
                variant="outline"
              >
                {isScanning ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Search className="w-4 h-4" />
                )}
                Scanner
              </Button>
            </div>

            <div className="space-y-2 max-h-60 overflow-y-auto">
              {bluetoothDevices.map((device) => (
                <Card key={device.id} className="p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Bluetooth className="w-4 h-4 text-blue-500" />
                      <div>
                        <p className="font-medium">{device.name}</p>
                        <div className="flex items-center gap-2">
                          <p className="text-xs text-muted-foreground">
                            RSSI: {device.rssi}dBm
                          </p>
                          {device.paired && (
                            <Badge variant="secondary" className="text-xs">
                              Jumelé
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <Button 
                      onClick={() => connectBluetooth(device)}
                      disabled={isConnecting}
                      size="sm"
                    >
                      {isConnecting && selectedDevice === device.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        'Connecter'
                      )}
                    </Button>
                  </div>
                </Card>
              ))}
              
              {bluetoothDevices.length === 0 && !isScanning && (
                <div className="text-center py-8 text-muted-foreground">
                  <Bluetooth className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>Aucun appareil Gear 360 trouvé</p>
                  <p className="text-xs">Assurez-vous que votre caméra est visible</p>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>

        {gear360Service.isConnected && (
          <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-green-600" />
              <span className="text-sm font-medium text-green-800">
                Connecté à {gear360Service.connectedDevice?.name}
              </span>
            </div>
            <Button onClick={disconnect} variant="outline" size="sm">
              Déconnecter
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};