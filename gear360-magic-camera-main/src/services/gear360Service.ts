import { Capacitor } from '@capacitor/core';

export interface Gear360Device {
  id: string;
  name: string;
  ipAddress?: string;
  bluetoothAddress?: string;
  connectionType: 'wifi' | 'bluetooth';
  status: 'connected' | 'disconnected' | 'connecting';
  batteryLevel?: number;
  firmware?: string;
}

export interface CameraSettings {
  resolution: '4K' | '2K' | 'FHD';
  frameRate: 30 | 60;
  quality: 'high' | 'medium' | 'low';
  mode: 'photo' | 'video' | 'timelapse';
  whiteBalance: 'auto' | 'daylight' | 'cloudy' | 'tungsten';
  iso: 'auto' | 100 | 200 | 400 | 800 | 1600;
}

export interface StreamInfo {
  isStreaming: boolean;
  streamUrl?: string;
  resolution: string;
  fps: number;
}

class Gear360Service {
  private device: Gear360Device | null = null;
  private streamInfo: StreamInfo | null = null;
  private eventListeners: Map<string, Function[]> = new Map();

  // Scanner pour détecter les caméras Gear 360
  async scanForDevices(): Promise<Gear360Device[]> {
    console.log('🔍 Scanning for Gear 360 devices...');
    
    try {
      // Scan Wi-Fi networks pour les hotspots Gear 360
      const wifiDevices = await this.scanWifiDevices();
      
      // Scan Bluetooth pour les appareils Gear 360
      const bluetoothDevices = await this.scanBluetoothDevices();
      
      return [...wifiDevices, ...bluetoothDevices];
    } catch (error) {
      console.error('❌ Error scanning devices:', error);
      return [];
    }
  }

  private async scanWifiDevices(): Promise<Gear360Device[]> {
    // Simulation pour les réseaux Gear 360 (format: Gear360_XXXX)
    return [
      {
        id: 'gear360_wifi_001',
        name: 'Samsung Gear 360 (2017)',
        ipAddress: '192.168.1.1',
        connectionType: 'wifi',
        status: 'disconnected',
        batteryLevel: 87
      }
    ];
  }

  private async scanBluetoothDevices(): Promise<Gear360Device[]> {
    if (!Capacitor.isNativePlatform()) {
      return [];
    }

    // Simulation d'appareils Bluetooth Gear 360
    return [
      {
        id: 'gear360_bt_001',
        name: 'Samsung Gear 360 BT',
        bluetoothAddress: '00:11:22:33:44:55',
        connectionType: 'bluetooth',
        status: 'disconnected',
        batteryLevel: 75
      }
    ];
  }

  // Connexion à la caméra
  async connectToDevice(deviceId: string): Promise<boolean> {
    console.log(`🔗 Connecting to device: ${deviceId}`);
    
    try {
      const devices = await this.scanForDevices();
      const targetDevice = devices.find(d => d.id === deviceId);
      
      if (!targetDevice) {
        throw new Error('Device not found');
      }

      targetDevice.status = 'connecting';
      this.emit('connectionStatus', targetDevice);

      // Simulation de connexion
      await new Promise(resolve => setTimeout(resolve, 2000));

      if (targetDevice.connectionType === 'wifi') {
        await this.connectWifi(targetDevice);
      } else {
        await this.connectBluetooth(targetDevice);
      }

      targetDevice.status = 'connected';
      this.device = targetDevice;
      
      // Récupérer les infos de la caméra
      await this.getCameraInfo();
      
      this.emit('deviceConnected', this.device);
      return true;
    } catch (error) {
      console.error('❌ Connection failed:', error);
      this.emit('connectionError', error);
      return false;
    }
  }

  private async connectWifi(device: Gear360Device): Promise<void> {
    // Connexion HTTP à l'API REST de la Gear 360
    const response = await fetch(`http://${device.ipAddress}/api/status`);
    if (!response.ok) {
      throw new Error('Failed to connect via WiFi');
    }
  }

  private async connectBluetooth(device: Gear360Device): Promise<void> {
    // Connexion Bluetooth avec Capacitor
    console.log('Connecting via Bluetooth...');
  }

  // Déconnexion
  async disconnect(): Promise<void> {
    if (this.device) {
      this.device.status = 'disconnected';
      this.emit('deviceDisconnected', this.device);
      this.device = null;
      this.streamInfo = null;
    }
  }

  // Prise de photo
  async capturePhoto(): Promise<string> {
    if (!this.device || this.device.status !== 'connected') {
      throw new Error('No device connected');
    }

    console.log('📸 Capturing photo...');
    
    try {
      if (this.device.connectionType === 'wifi') {
        const response = await fetch(`http://${this.device.ipAddress}/api/capture/photo`, {
          method: 'POST'
        });
        const result = await response.json();
        return result.photoUrl;
      } else {
        // Bluetooth capture
        return 'bluetooth_photo_url';
      }
    } catch (error) {
      console.error('❌ Photo capture failed:', error);
      throw error;
    }
  }

  // Démarrage/arrêt vidéo
  async startVideoRecording(): Promise<boolean> {
    if (!this.device || this.device.status !== 'connected') {
      throw new Error('No device connected');
    }

    console.log('🎥 Starting video recording...');
    
    try {
      if (this.device.connectionType === 'wifi') {
        const response = await fetch(`http://${this.device.ipAddress}/api/recording/start`, {
          method: 'POST'
        });
        return response.ok;
      }
      return true;
    } catch (error) {
      console.error('❌ Video recording failed:', error);
      return false;
    }
  }

  async stopVideoRecording(): Promise<string> {
    if (!this.device) {
      throw new Error('No device connected');
    }

    console.log('⏹️ Stopping video recording...');
    
    try {
      if (this.device.connectionType === 'wifi') {
        const response = await fetch(`http://${this.device.ipAddress}/api/recording/stop`, {
          method: 'POST'
        });
        const result = await response.json();
        return result.videoUrl;
      }
      return 'bluetooth_video_url';
    } catch (error) {
      console.error('❌ Stop recording failed:', error);
      throw error;
    }
  }

  // Streaming en direct
  async startStreaming(): Promise<StreamInfo> {
    if (!this.device || this.device.status !== 'connected') {
      throw new Error('No device connected');
    }

    console.log('📡 Starting live stream...');
    
    try {
      if (this.device.connectionType === 'wifi') {
        const response = await fetch(`http://${this.device.ipAddress}/api/stream/start`, {
          method: 'POST'
        });
        const result = await response.json();
        
        this.streamInfo = {
          isStreaming: true,
          streamUrl: result.streamUrl,
          resolution: '1920x1080',
          fps: 30
        };
      } else {
        this.streamInfo = {
          isStreaming: true,
          streamUrl: 'bluetooth_stream_url',
          resolution: '1920x1080', 
          fps: 30
        };
      }
      
      this.emit('streamStarted', this.streamInfo);
      return this.streamInfo;
    } catch (error) {
      console.error('❌ Streaming failed:', error);
      throw error;
    }
  }

  async stopStreaming(): Promise<void> {
    if (this.streamInfo?.isStreaming) {
      this.streamInfo.isStreaming = false;
      this.emit('streamStopped');
    }
  }

  // Configuration de la caméra
  async updateCameraSettings(settings: Partial<CameraSettings>): Promise<boolean> {
    if (!this.device || this.device.status !== 'connected') {
      throw new Error('No device connected');
    }

    console.log('⚙️ Updating camera settings:', settings);
    
    try {
      if (this.device.connectionType === 'wifi') {
        const response = await fetch(`http://${this.device.ipAddress}/api/settings`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(settings)
        });
        return response.ok;
      }
      return true;
    } catch (error) {
      console.error('❌ Settings update failed:', error);
      return false;
    }
  }

  // Récupération du statut
  async getCameraInfo(): Promise<void> {
    if (!this.device) return;

    try {
      if (this.device.connectionType === 'wifi') {
        const response = await fetch(`http://${this.device.ipAddress}/api/info`);
        const info = await response.json();
        
        this.device.batteryLevel = info.battery;
        this.device.firmware = info.firmware;
      }
    } catch (error) {
      console.error('❌ Failed to get camera info:', error);
    }
  }

  // Téléchargement de fichiers
  async downloadFile(fileUrl: string): Promise<Blob> {
    const response = await fetch(fileUrl);
    return response.blob();
  }

  // Gestion des événements
  on(event: string, callback: Function): void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, []);
    }
    this.eventListeners.get(event)!.push(callback);
  }

  off(event: string, callback: Function): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      const index = listeners.indexOf(callback);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    }
  }

  private emit(event: string, data?: any): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      listeners.forEach(callback => callback(data));
    }
  }

  // Getters
  get connectedDevice(): Gear360Device | null {
    return this.device;
  }

  get isConnected(): boolean {
    return this.device?.status === 'connected';
  }

  get currentStreamInfo(): StreamInfo | null {
    return this.streamInfo;
  }
}

export const gear360Service = new Gear360Service();