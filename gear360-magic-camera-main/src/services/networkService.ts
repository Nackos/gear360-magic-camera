import { Capacitor, PluginListenerHandle } from '@capacitor/core';

export interface WifiNetwork {
  ssid: string;
  bssid: string;
  level: number;
  security: string;
  frequency: number;
  isGear360: boolean;
}

export interface NetworkStatus {
  connected: boolean;
  ssid?: string;
  ipAddress?: string;
  signalStrength?: number;
}

type NetworkListener = (data?: unknown) => void;

class NetworkService {
  private eventListeners: Map<string, NetworkListener[]> = new Map();
  private networkStatusListener: PluginListenerHandle | null = null;

  // Scanner les réseaux Wi-Fi disponibles
  async scanWifiNetworks(): Promise<WifiNetwork[]> {
    console.log('🔍 Scanning WiFi networks...');

    if (!Capacitor.isNativePlatform()) {
      // Simulation pour le développement web
      return [
        {
          ssid: 'Gear360_A1B2C3',
          bssid: '00:11:22:33:44:55',
          level: -45,
          security: 'WPA2',
          frequency: 2437,
          isGear360: true
        },
        {
          ssid: 'Gear360_DEF456',
          bssid: '00:11:22:33:44:66',
          level: -67,
          security: 'OPEN',
          frequency: 2412,
          isGear360: true
        },
        {
          ssid: 'HomeWifi',
          bssid: '00:11:22:33:44:77',
          level: -35,
          security: 'WPA2',
          frequency: 2462,
          isGear360: false
        }
      ];
    }

    try {
      // Ici on utiliserait un plugin Capacitor pour scanner le Wi-Fi
      // const networks = await CapacitorWifi.scan();
      const networks: WifiNetwork[] = [];

      return networks.map(network => ({
        ...network,
        isGear360: this.isGear360Network(network.ssid)
      }));
    } catch (error) {
      console.error('❌ WiFi scan failed:', error);
      return [];
    }
  }

  // Vérifier si un SSID correspond à un réseau Gear 360
  private isGear360Network(ssid: string): boolean {
    const gear360Patterns = [
      /^Gear360_/i,
      /^Samsung_Gear360/i,
      /^SM-R210/i,
      /^SM-R200/i
    ];

    return gear360Patterns.some(pattern => pattern.test(ssid));
  }

  // Connexion à un réseau Wi-Fi
  async connectToWifi(ssid: string, password?: string): Promise<boolean> {
    console.log(`🔗 Connecting to WiFi: ${ssid}`);

    if (!Capacitor.isNativePlatform()) {
      // Simulation pour le développement
      await new Promise(resolve => setTimeout(resolve, 2000));
      return true;
    }

    try {
      // Ici on utiliserait un plugin Capacitor pour se connecter
      // const result = await CapacitorWifi.connect({ ssid, password });
      return true;
    } catch (error) {
      console.error('❌ WiFi connection failed:', error);
      return false;
    }
  }

  // Déconnexion du Wi-Fi
  async disconnectWifi(): Promise<boolean> {
    console.log('🔌 Disconnecting from WiFi');

    if (!Capacitor.isNativePlatform()) {
      return true;
    }

    try {
      // const result = await CapacitorWifi.disconnect();
      return true;
    } catch (error) {
      console.error('❌ WiFi disconnection failed:', error);
      return false;
    }
  }

  // Obtenir le statut du réseau actuel
  async getNetworkStatus(): Promise<NetworkStatus> {
    if (!Capacitor.isNativePlatform()) {
      // Simulation pour le développement
      return {
        connected: true,
        ssid: 'Gear360_A1B2C3',
        ipAddress: '192.168.1.100',
        signalStrength: -45
      };
    }

    try {
      // const status = await CapacitorWifi.getStatus();
      return {
        connected: false
      };
    } catch (error) {
      console.error('❌ Failed to get network status:', error);
      return { connected: false };
    }
  }

  // Créer un hotspot Wi-Fi (si supporté)
  async createHotspot(ssid: string, password: string): Promise<boolean> {
    console.log(`📡 Creating hotspot: ${ssid}`);

    if (!Capacitor.isNativePlatform()) {
      return false;
    }

    try {
      // const result = await CapacitorWifi.createHotspot({ ssid, password });
      return true;
    } catch (error) {
      console.error('❌ Hotspot creation failed:', error);
      return false;
    }
  }

  // Vérifier la connectivité internet
  async checkInternetConnectivity(): Promise<boolean> {
    try {
      const response = await fetch('https://www.google.com/favicon.ico', {
        method: 'HEAD',
        mode: 'no-cors'
      });
      return true;
    } catch {
      return false;
    }
  }

  // Ping une adresse IP
  async pingHost(host: string, timeout: number = 5000): Promise<number> {
    const start = Date.now();

    try {
      const response = await fetch(`http://${host}`, {
        method: 'HEAD',
        signal: AbortSignal.timeout(timeout)
      });
      return Date.now() - start;
    } catch {
      return -1;
    }
  }

  // Obtenir les détails de l'adresse IP locale
  async getLocalNetworkInfo(): Promise<{ ip: string; subnet: string; gateway: string } | null> {
    if (!Capacitor.isNativePlatform()) {
      return {
        ip: '192.168.1.100',
        subnet: '255.255.255.0',
        gateway: '192.168.1.1'
      };
    }

    try {
      // Ici on utiliserait un plugin natif pour obtenir les infos réseau
      return null;
    } catch (error) {
      console.error('❌ Failed to get local network info:', error);
      return null;
    }
  }

  // Scanner les appareils sur le réseau local
  async scanLocalNetwork(): Promise<string[]> {
    const networkInfo = await this.getLocalNetworkInfo();
    if (!networkInfo) return [];

    const devices: string[] = [];
    const baseIp = networkInfo.ip.split('.').slice(0, 3).join('.');

    // Scanner les adresses IP de 1 à 254
    const promises = [];
    for (let i = 1; i <= 254; i++) {
      const ip = `${baseIp}.${i}`;
      promises.push(this.pingHost(ip, 1000));
    }

    const results = await Promise.all(promises);

    results.forEach((ping, index) => {
      if (ping > -1) {
        devices.push(`${baseIp}.${index + 1}`);
      }
    });

    return devices;
  }

  // Vérifier si une adresse IP est une Gear 360
  async checkIfGear360(ip: string): Promise<boolean> {
    try {
      // Tenter de se connecter à l'API REST de la Gear 360
      const response = await fetch(`http://${ip}/api/status`, {
        method: 'GET',
        signal: AbortSignal.timeout(3000)
      });

      if (response.ok) {
        const data = await response.json() as { device?: string; model?: string };
        return data.device?.includes('Gear360') || data.model?.includes('SM-R') || false;
      }
    } catch {
      // Pas une Gear 360 ou pas accessible
    }

    return false;
  }

  // Démarrer le monitoring du réseau
  startNetworkMonitoring(): void {
    if (this.networkStatusListener) return;

    // Ici on écouterait les changements de statut réseau
    setInterval(async () => {
      const status = await this.getNetworkStatus();
      this.emit('networkStatusChanged', status);
    }, 5000);
  }

  // Arrêter le monitoring
  stopNetworkMonitoring(): void {
    if (this.networkStatusListener) {
      this.networkStatusListener.remove();
      this.networkStatusListener = null;
    }
  }

  // Gestion des événements
  on(event: string, callback: NetworkListener): void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, []);
    }
    this.eventListeners.get(event)!.push(callback);
  }

  off(event: string, callback: NetworkListener): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      const index = listeners.indexOf(callback);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    }
  }

  private emit(event: string, data?: unknown): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      listeners.forEach(callback => callback(data));
    }
  }
}

export const networkService = new NetworkService();