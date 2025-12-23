import { Capacitor } from '@capacitor/core';

export type ConnectionType = 'wifi' | 'bluetooth';
export type DeviceStatus = 'connected' | 'disconnected' | 'connecting' | 'pairing' | 'error';

export interface ConnectedDevice {
  id: string;
  name: string;
  type: ConnectionType;
  status: DeviceStatus;
  address: string;
  signalStrength: number;
  batteryLevel?: number;
  isPaired: boolean;
  isGear360: boolean;
  connectedAt?: Date;
  lastSeen: Date;
  services: string[];
  metadata?: Record<string, unknown>;
}

export interface ConnectionStats {
  totalDevices: number;
  wifiDevices: number;
  bluetoothDevices: number;
  pairedDevices: number;
  activeConnections: number;
}

export interface DeviceCommand {
  command: string;
  data?: unknown;
  targetDeviceId?: string;
  broadcast?: boolean;
}

type DeviceListener = (data?: unknown) => void;

class MultiDeviceManager {
  private devices: Map<string, ConnectedDevice> = new Map();
  private pairedDevices: Map<string, ConnectedDevice> = new Map();
  private eventListeners: Map<string, DeviceListener[]> = new Map();
  private maxWifiConnections = 1; // Wi-Fi Direct limite généralement à 1
  private maxBluetoothConnections = 7; // Bluetooth supporte jusqu'à 7 connexions
  private reconnectAttempts: Map<string, number> = new Map();
  private maxReconnectAttempts = 3;

  constructor() {
    this.loadPairedDevices();
  }

  // Charger les appareils jumelés depuis le stockage local
  private loadPairedDevices(): void {
    try {
      const stored = localStorage.getItem('paired_devices');
      if (stored) {
        const devices = JSON.parse(stored) as ConnectedDevice[];
        devices.forEach(device => {
          device.status = 'disconnected';
          device.lastSeen = new Date(device.lastSeen);
          if (device.connectedAt) {
            device.connectedAt = new Date(device.connectedAt);
          }
          this.pairedDevices.set(device.id, device);
        });
        console.log(`📱 Loaded ${this.pairedDevices.size} paired devices`);
      }
    } catch (error) {
      console.warn('⚠️ Failed to load paired devices:', error);
    }
  }

  // Sauvegarder les appareils jumelés
  private savePairedDevices(): void {
    try {
      const devices = Array.from(this.pairedDevices.values());
      localStorage.setItem('paired_devices', JSON.stringify(devices));
    } catch (error) {
      console.warn('⚠️ Failed to save paired devices:', error);
    }
  }

  // Connexion à un appareil avec approche optimiste
  async connectDevice(device: Partial<ConnectedDevice>): Promise<ConnectedDevice | null> {
    const deviceId = device.id || `device_${Date.now()}`;
    const connectionType = device.type || 'wifi';

    // Vérifier les limites de connexion
    if (!this.canConnect(connectionType)) {
      this.emit('connectionLimitReached', { type: connectionType });
      console.warn(`⚠️ Connection limit reached for ${connectionType}`);
      return null;
    }

    const newDevice: ConnectedDevice = {
      id: deviceId,
      name: device.name || 'Unknown Device',
      type: connectionType,
      status: 'connecting',
      address: device.address || '',
      signalStrength: device.signalStrength || -50,
      batteryLevel: device.batteryLevel,
      isPaired: device.isPaired || false,
      isGear360: device.isGear360 || false,
      lastSeen: new Date(),
      services: device.services || [],
      metadata: device.metadata
    };

    // Approche optimiste: ajouter immédiatement
    this.devices.set(deviceId, newDevice);
    this.emit('deviceConnecting', newDevice);

    try {
      // Simulation de connexion (remplacer par vraie implémentation)
      await this.performConnection(newDevice);

      newDevice.status = 'connected';
      newDevice.connectedAt = new Date();
      this.reconnectAttempts.delete(deviceId);

      this.emit('deviceConnected', newDevice);
      console.log(`✅ Connected to ${newDevice.name} via ${connectionType}`);

      return newDevice;
    } catch (error) {
      console.error(`❌ Connection failed for ${newDevice.name}:`, error);

      // Tentative de reconnexion
      const attempts = (this.reconnectAttempts.get(deviceId) || 0) + 1;
      this.reconnectAttempts.set(deviceId, attempts);

      if (attempts < this.maxReconnectAttempts) {
        newDevice.status = 'connecting';
        this.emit('deviceReconnecting', { device: newDevice, attempt: attempts });

        // Retry après délai
        setTimeout(() => this.connectDevice(device), 2000 * attempts);
        return null;
      }

      newDevice.status = 'error';
      this.emit('connectionFailed', { device: newDevice, error });
      return null;
    }
  }

  // Vérifier si on peut ajouter une connexion
  private canConnect(type: ConnectionType): boolean {
    const currentConnections = this.getConnectedDevicesByType(type);
    const limit = type === 'wifi' ? this.maxWifiConnections : this.maxBluetoothConnections;
    return currentConnections.length < limit;
  }

  // Effectuer la connexion réelle
  private async performConnection(device: ConnectedDevice): Promise<void> {
    if (!Capacitor.isNativePlatform()) {
      // Simulation pour le développement web
      await new Promise(resolve => setTimeout(resolve, 1500));
      return;
    }

    if (device.type === 'wifi') {
      // Connexion Wi-Fi via plugin natif
      // await WifiPlugin.connect({ ssid: device.name, password: device.metadata?.password });
    } else {
      // Connexion Bluetooth via plugin natif
      // await BluetoothPlugin.connect({ address: device.address });
    }
  }

  // Déconnexion d'un appareil
  async disconnectDevice(deviceId: string): Promise<boolean> {
    const device = this.devices.get(deviceId);
    if (!device) {
      console.warn(`⚠️ Device ${deviceId} not found`);
      return false;
    }

    try {
      device.status = 'disconnected';
      this.devices.delete(deviceId);
      this.emit('deviceDisconnected', device);
      console.log(`🔌 Disconnected from ${device.name}`);
      return true;
    } catch (error) {
      console.error(`❌ Disconnect failed for ${device.name}:`, error);
      return false;
    }
  }

  // Déconnexion de tous les appareils
  async disconnectAll(): Promise<void> {
    const deviceIds = Array.from(this.devices.keys());
    await Promise.all(deviceIds.map(id => this.disconnectDevice(id)));
    console.log('🔌 All devices disconnected');
  }

  // Jumelage d'un appareil
  async pairDevice(device: ConnectedDevice): Promise<boolean> {
    try {
      device.isPaired = true;
      device.status = 'pairing';
      this.emit('devicePairing', device);

      // Simulation du jumelage
      await new Promise(resolve => setTimeout(resolve, 1000));

      this.pairedDevices.set(device.id, device);
      this.savePairedDevices();

      device.status = device.status === 'pairing' ? 'disconnected' : device.status;
      this.emit('devicePaired', device);
      console.log(`🔐 Paired with ${device.name}`);

      return true;
    } catch (error) {
      console.error(`❌ Pairing failed for ${device.name}:`, error);
      device.status = 'error';
      this.emit('pairingFailed', { device, error });
      return false;
    }
  }

  // Supprimer le jumelage
  async unpairDevice(deviceId: string): Promise<boolean> {
    const device = this.pairedDevices.get(deviceId);
    if (!device) return false;

    device.isPaired = false;
    this.pairedDevices.delete(deviceId);
    this.savePairedDevices();

    // Déconnecter si connecté
    if (this.devices.has(deviceId)) {
      await this.disconnectDevice(deviceId);
    }

    this.emit('deviceUnpaired', device);
    console.log(`🔓 Unpaired ${device.name}`);
    return true;
  }

  // Envoyer une commande à un ou plusieurs appareils
  async sendCommand(cmd: DeviceCommand): Promise<Map<string, { success: boolean; data?: unknown; error?: unknown }>> {
    const results = new Map<string, { success: boolean; data?: unknown; error?: unknown }>();
    const targetDevices = cmd.broadcast
      ? this.getConnectedDevices()
      : cmd.targetDeviceId
        ? [this.devices.get(cmd.targetDeviceId)].filter(Boolean) as ConnectedDevice[]
        : [];

    for (const device of targetDevices) {
      try {
        const result = await this.executeCommand(device, cmd.command, cmd.data);
        results.set(device.id, { success: true, data: result });
      } catch (error) {
        results.set(device.id, { success: false, error });
      }
    }

    return results;
  }

  // Exécuter une commande sur un appareil
  private async executeCommand(device: ConnectedDevice, command: string, data?: unknown): Promise<unknown> {
    console.log(`📤 Sending "${command}" to ${device.name}`, data);

    if (!Capacitor.isNativePlatform()) {
      // Simulation des réponses
      await new Promise(resolve => setTimeout(resolve, 300));

      switch (command) {
        case 'capture_photo':
          return { success: true, photoId: `photo_${Date.now()}` };
        case 'start_recording':
          return { success: true, recordingId: `video_${Date.now()}` };
        case 'stop_recording':
          return { success: true, videoUrl: `video_${Date.now()}.mp4` };
        case 'get_battery':
          return { battery: Math.floor(Math.random() * 40) + 60 };
        case 'get_status':
          return { status: 'ready', storage: 75, temperature: 35 };
        default:
          return { success: true };
      }
    }

    // Implémentation native ici
    return { success: true };
  }

  // Getters
  getDevice(deviceId: string): ConnectedDevice | undefined {
    return this.devices.get(deviceId);
  }

  getConnectedDevices(): ConnectedDevice[] {
    return Array.from(this.devices.values()).filter(d => d.status === 'connected');
  }

  getConnectedDevicesByType(type: ConnectionType): ConnectedDevice[] {
    return this.getConnectedDevices().filter(d => d.type === type);
  }

  getPairedDevices(): ConnectedDevice[] {
    return Array.from(this.pairedDevices.values());
  }

  getGear360Devices(): ConnectedDevice[] {
    return this.getConnectedDevices().filter(d => d.isGear360);
  }

  getAllDevices(): ConnectedDevice[] {
    const all = new Map(this.pairedDevices);
    this.devices.forEach((device, id) => all.set(id, device));
    return Array.from(all.values());
  }

  getStats(): ConnectionStats {
    const connected = this.getConnectedDevices();
    return {
      totalDevices: this.getAllDevices().length,
      wifiDevices: connected.filter(d => d.type === 'wifi').length,
      bluetoothDevices: connected.filter(d => d.type === 'bluetooth').length,
      pairedDevices: this.pairedDevices.size,
      activeConnections: connected.length
    };
  }

  get hasConnections(): boolean {
    return this.getConnectedDevices().length > 0;
  }

  get primaryDevice(): ConnectedDevice | null {
    const gear360 = this.getGear360Devices()[0];
    return gear360 || this.getConnectedDevices()[0] || null;
  }

  // Gestion des événements
  on(event: string, callback: DeviceListener): void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, []);
    }
    this.eventListeners.get(event)!.push(callback);
  }

  off(event: string, callback: DeviceListener): void {
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
      listeners.forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Event handler error for ${event}:`, error);
        }
      });
    }
  }
}

export const multiDeviceManager = new MultiDeviceManager();
