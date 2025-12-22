import { Capacitor } from '@capacitor/core';

export interface BluetoothDevice {
  id: string;
  name: string;
  address: string;
  rssi: number;
  connected: boolean;
  paired: boolean;
  isGear360: boolean;
  services: string[];
}

export interface BluetoothScanResult {
  devices: BluetoothDevice[];
  isScanning: boolean;
}

type BluetoothListener = (data?: unknown) => void;

class BluetoothService {
  private eventListeners: Map<string, BluetoothListener[]> = new Map();
  private connectedDevice: BluetoothDevice | null = null;
  private isScanning = false;

  // Vérifier si Bluetooth est disponible et activé
  async isBluetoothAvailable(): Promise<boolean> {
    if (!Capacitor.isNativePlatform()) {
      return true; // Simulation pour le web
    }

    try {
      // Ici on utiliserait un plugin Bluetooth Capacitor
      // const status = await BluetoothLE.getState();
      return true;
    } catch (error) {
      console.error('❌ Bluetooth not available:', error);
      return false;
    }
  }

  // Activer le Bluetooth
  async enableBluetooth(): Promise<boolean> {
    if (!Capacitor.isNativePlatform()) {
      return true;
    }

    try {
      // const result = await BluetoothLE.enable();
      return true;
    } catch (error) {
      console.error('❌ Failed to enable Bluetooth:', error);
      return false;
    }
  }

  // Scanner les appareils Bluetooth
  async startScan(): Promise<void> {
    if (this.isScanning) return;

    console.log('🔍 Starting Bluetooth scan...');
    this.isScanning = true;

    if (!Capacitor.isNativePlatform()) {
      // Simulation pour le développement web
      setTimeout(() => {
        const mockDevices: BluetoothDevice[] = [
          {
            id: 'bt_gear360_001',
            name: 'Samsung Gear 360',
            address: '00:11:22:33:44:55',
            rssi: -45,
            connected: false,
            paired: false,
            isGear360: true,
            services: ['camera', 'battery']
          },
          {
            id: 'bt_gear360_002',
            name: 'Gear360-A1B2C3',
            address: '00:11:22:33:44:66',
            rssi: -67,
            connected: false,
            paired: true,
            isGear360: true,
            services: ['camera', 'battery', 'wifi']
          }
        ];

        this.emit('devicesFound', mockDevices);
        this.isScanning = false;
      }, 3000);
      return;
    }

    try {
      // Ici on utiliserait un plugin Bluetooth pour scanner
      // await BluetoothLE.startScan({
      //   services: [],
      //   allowDuplicates: false
      // });
    } catch (error) {
      console.error('❌ Bluetooth scan failed:', error);
      this.isScanning = false;
    }
  }

  // Arrêter le scan
  async stopScan(): Promise<void> {
    if (!this.isScanning) return;

    console.log('⏹️ Stopping Bluetooth scan...');

    if (!Capacitor.isNativePlatform()) {
      this.isScanning = false;
      return;
    }

    try {
      // await BluetoothLE.stopScan();
      this.isScanning = false;
    } catch (error) {
      console.error('❌ Failed to stop scan:', error);
    }
  }

  // Vérifier si un appareil est une Gear 360
  private isGear360Device(device: { name?: string }): boolean {
    const gear360Names = [
      /samsung.*gear.*360/i,
      /gear360/i,
      /sm-r210/i,
      /sm-r200/i
    ];

    return gear360Names.some(pattern => pattern.test(device.name || ''));
  }

  // Se connecter à un appareil
  async connectToDevice(deviceId: string): Promise<boolean> {
    console.log(`🔗 Connecting to Bluetooth device: ${deviceId}`);

    if (!Capacitor.isNativePlatform()) {
      // Simulation pour le développement
      await new Promise(resolve => setTimeout(resolve, 2000));

      this.connectedDevice = {
        id: deviceId,
        name: 'Samsung Gear 360',
        address: '00:11:22:33:44:55',
        rssi: -45,
        connected: true,
        paired: true,
        isGear360: true,
        services: ['camera', 'battery']
      };

      this.emit('deviceConnected', this.connectedDevice);
      return true;
    }

    try {
      // Ici on se connecterait via Bluetooth
      // const result = await BluetoothLE.connect({ address: deviceId });

      // Découvrir les services
      // await BluetoothLE.discover({ address: deviceId });

      return true;
    } catch (error) {
      console.error('❌ Bluetooth connection failed:', error);
      return false;
    }
  }

  // Se déconnecter
  async disconnect(): Promise<void> {
    if (!this.connectedDevice) return;

    console.log('🔌 Disconnecting from Bluetooth device');

    if (!Capacitor.isNativePlatform()) {
      this.connectedDevice.connected = false;
      this.emit('deviceDisconnected', this.connectedDevice);
      this.connectedDevice = null;
      return;
    }

    try {
      // await BluetoothLE.disconnect({ address: this.connectedDevice.address });
      this.connectedDevice = null;
    } catch (error) {
      console.error('❌ Bluetooth disconnection failed:', error);
    }
  }

  // Jumeler un appareil
  async pairDevice(deviceAddress: string): Promise<boolean> {
    console.log(`🔐 Pairing with device: ${deviceAddress}`);

    if (!Capacitor.isNativePlatform()) {
      await new Promise(resolve => setTimeout(resolve, 1500));
      return true;
    }

    try {
      // await BluetoothLE.bond({ address: deviceAddress });
      return true;
    } catch (error) {
      console.error('❌ Pairing failed:', error);
      return false;
    }
  }

  // Envoyer une commande à la Gear 360
  async sendCommand(command: string, data?: unknown): Promise<unknown> {
    if (!this.connectedDevice || !this.connectedDevice.connected) {
      throw new Error('No device connected');
    }

    console.log(`📤 Sending command: ${command}`, data);

    if (!Capacitor.isNativePlatform()) {
      // Simulation des réponses
      await new Promise(resolve => setTimeout(resolve, 500));

      switch (command) {
        case 'capture_photo':
          return { success: true, photoId: 'photo_' + Date.now() };
        case 'start_recording':
          return { success: true, recordingId: 'video_' + Date.now() };
        case 'stop_recording':
          return { success: true, videoId: 'video_' + Date.now() };
        case 'get_battery':
          return { battery: 87 };
        case 'get_settings':
          return {
            resolution: '4K',
            frameRate: 30,
            quality: 'high'
          };
        default:
          return { success: true };
      }
    }

    try {
      // Ici on enverrait la commande via Bluetooth
      // const characteristic = 'camera-control-uuid';
      // const response = await BluetoothLE.write({
      //   address: this.connectedDevice.address,
      //   service: 'camera-service-uuid',
      //   characteristic,
      //   value: btoa(JSON.stringify({ command, data }))
      // });

      return { success: true };
    } catch (error) {
      console.error('❌ Command failed:', error);
      throw error;
    }
  }

  // Écouter les notifications de la Gear 360
  async startNotifications(): Promise<void> {
    if (!this.connectedDevice) return;

    console.log('👂 Starting notifications...');

    if (!Capacitor.isNativePlatform()) {
      // Simulation des notifications
      setInterval(() => {
        this.emit('notification', {
          type: 'battery',
          value: Math.floor(Math.random() * 100)
        });
      }, 10000);
      return;
    }

    try {
      // await BluetoothLE.startNotification({
      //   address: this.connectedDevice.address,
      //   service: 'notification-service-uuid',
      //   characteristic: 'notification-characteristic-uuid'
      // });
    } catch (error) {
      console.error('❌ Failed to start notifications:', error);
    }
  }

  // Arrêter les notifications
  async stopNotifications(): Promise<void> {
    if (!this.connectedDevice) return;

    try {
      // await BluetoothLE.stopNotification({
      //   address: this.connectedDevice.address,
      //   service: 'notification-service-uuid',
      //   characteristic: 'notification-characteristic-uuid'
      // });
    } catch (error) {
      console.error('❌ Failed to stop notifications:', error);
    }
  }

  // Obtenir les appareils jumelés
  async getPairedDevices(): Promise<BluetoothDevice[]> {
    if (!Capacitor.isNativePlatform()) {
      return [
        {
          id: 'paired_gear360',
          name: 'Samsung Gear 360',
          address: '00:11:22:33:44:55',
          rssi: 0,
          connected: false,
          paired: true,
          isGear360: true,
          services: ['camera', 'battery']
        }
      ];
    }

    try {
      // const devices = await BluetoothLE.getBondedDevices();
      return [];
    } catch (error) {
      console.error('❌ Failed to get paired devices:', error);
      return [];
    }
  }

  // Gestion des événements
  on(event: string, callback: BluetoothListener): void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, []);
    }
    this.eventListeners.get(event)!.push(callback);
  }

  off(event: string, callback: BluetoothListener): void {
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

  // Getters
  get connected(): boolean {
    return this.connectedDevice?.connected || false;
  }

  get currentDevice(): BluetoothDevice | null {
    return this.connectedDevice;
  }

  get scanning(): boolean {
    return this.isScanning;
  }
}

export const bluetoothService = new BluetoothService();