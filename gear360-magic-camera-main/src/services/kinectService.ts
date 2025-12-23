/**
 * Kinect Xbox 360 Service
 * Handles depth sensing, skeleton tracking, and motion capture
 * With automatic reconnection and optimistic error handling
 */

// Configuration
const RECONNECT_DELAY = 3000;
const MAX_RECONNECT_ATTEMPTS = 5;
const CONNECTION_TIMEOUT = 10000;

export interface KinectSkeleton {
  id: string;
  joints: KinectJoint[];
  timestamp: number;
}

export interface KinectJoint {
  type: JointType;
  position: { x: number; y: number; z: number };
  orientation: { x: number; y: number; z: number; w: number };
  trackingState: 'Tracked' | 'Inferred' | 'NotTracked';
}

export type JointType =
  | 'Head' | 'Neck' | 'SpineShoulder' | 'SpineMid' | 'SpineBase'
  | 'ShoulderLeft' | 'ShoulderRight' | 'ElbowLeft' | 'ElbowRight'
  | 'WristLeft' | 'WristRight' | 'HandLeft' | 'HandRight'
  | 'HipLeft' | 'HipRight' | 'KneeLeft' | 'KneeRight'
  | 'AnkleLeft' | 'AnkleRight' | 'FootLeft' | 'FootRight';

export interface DepthFrame {
  width: number;
  height: number;
  data: Uint16Array;
  timestamp: number;
}

export interface ColorFrame {
  width: number;
  height: number;
  data: Uint8ClampedArray;
  timestamp: number;
}

export interface KinectConnectionStatus {
  connected: boolean;
  reconnecting: boolean;
  attempts: number;
  lastError?: string;
}

type KinectListener = (data?: unknown) => void;

class KinectService {
  private ws: WebSocket | null = null;
  private isConnected = false;
  private listeners: Map<string, KinectListener[]> = new Map();
  private depthCanvas: HTMLCanvasElement | null = null;
  private colorCanvas: HTMLCanvasElement | null = null;
  private reconnectAttempts = 0;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private serverUrl: string = 'ws://localhost:8181';
  private autoReconnect = true;
  private connectionStatus: KinectConnectionStatus = {
    connected: false,
    reconnecting: false,
    attempts: 0
  };

  constructor() {
    this.depthCanvas = document.createElement('canvas');
    this.colorCanvas = document.createElement('canvas');
  }

  /**
   * Connect to Kinect via WebSocket server with automatic reconnection
   */
  async connect(serverUrl: string = 'ws://localhost:8181', options?: { autoReconnect?: boolean }): Promise<void> {
    this.serverUrl = serverUrl;
    this.autoReconnect = options?.autoReconnect ?? true;

    return new Promise((resolve, reject) => {
      const timeoutId = setTimeout(() => {
        if (this.ws) {
          this.ws.close();
        }
        const error = new Error('Connection timeout');
        this.handleConnectionError(error);
        reject(error);
      }, CONNECTION_TIMEOUT);

      try {
        // Clear any existing connection
        if (this.ws) {
          this.ws.close();
        }

        this.connectionStatus = {
          connected: false,
          reconnecting: this.reconnectAttempts > 0,
          attempts: this.reconnectAttempts
        };
        this.emit('statusChange', this.connectionStatus);

        this.ws = new WebSocket(serverUrl);

        this.ws.onopen = () => {
          clearTimeout(timeoutId);
          this.isConnected = true;
          this.reconnectAttempts = 0;
          this.connectionStatus = {
            connected: true,
            reconnecting: false,
            attempts: 0
          };
          console.log('✅ Kinect connected');
          this.emit('connected', {});
          this.emit('statusChange', this.connectionStatus);
          resolve();
        };

        this.ws.onmessage = (event) => {
          this.handleMessage(event.data);
        };

        this.ws.onerror = (error) => {
          clearTimeout(timeoutId);
          // Log silently instead of error to console (optimistic approach)
          console.log('⚠️ Kinect connection attempt failed, will retry...');
          this.handleConnectionError(error);
        };

        this.ws.onclose = (event) => {
          clearTimeout(timeoutId);
          this.isConnected = false;
          this.connectionStatus.connected = false;
          this.emit('disconnected', { code: event.code, reason: event.reason });
          this.emit('statusChange', this.connectionStatus);

          // Attempt reconnection if enabled
          if (this.autoReconnect && this.reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
            this.scheduleReconnect();
          }
        };
      } catch (error) {
        clearTimeout(timeoutId);
        this.handleConnectionError(error);
        reject(error);
      }
    });
  }

  /**
   * Handle connection errors with optimistic retry
   */
  private handleConnectionError(error: unknown): void {
    const err = error as { message?: string } | null;
    this.connectionStatus = {
      connected: false,
      reconnecting: this.autoReconnect && this.reconnectAttempts < MAX_RECONNECT_ATTEMPTS,
      attempts: this.reconnectAttempts,
      lastError: err?.message || 'Connection failed'
    };
    this.emit('statusChange', this.connectionStatus);
  }

  /**
   * Schedule automatic reconnection
   */
  private scheduleReconnect(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
    }

    this.reconnectAttempts++;
    const delay = RECONNECT_DELAY * Math.min(this.reconnectAttempts, 3); // Exponential backoff cap

    console.log(`🔄 Scheduling Kinect reconnect attempt ${this.reconnectAttempts}/${MAX_RECONNECT_ATTEMPTS} in ${delay}ms`);

    this.connectionStatus.reconnecting = true;
    this.emit('reconnecting', { attempt: this.reconnectAttempts, maxAttempts: MAX_RECONNECT_ATTEMPTS });

    this.reconnectTimer = setTimeout(() => {
      this.connect(this.serverUrl, { autoReconnect: this.autoReconnect }).catch(() => {
        // Error handled in connect method
      });
    }, delay);
  }

  /**
   * Cancel any pending reconnection
   */
  cancelReconnect(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    this.reconnectAttempts = 0;
    this.connectionStatus.reconnecting = false;
    this.emit('statusChange', this.connectionStatus);
  }

  /**
   * Disconnect from Kinect
   */
  disconnect(): void {
    this.autoReconnect = false;
    this.cancelReconnect();

    if (this.ws) {
      this.ws.close();
      this.ws = null;
      this.isConnected = false;
    }

    this.connectionStatus = {
      connected: false,
      reconnecting: false,
      attempts: 0
    };
    this.emit('statusChange', this.connectionStatus);
  }

  /**
   * Handle incoming messages from Kinect
   */
  private handleMessage(data: string): void {
    try {
      const message = JSON.parse(data) as { type: string; data: unknown };

      switch (message.type) {
        case 'skeleton':
          this.emit('skeleton', message.data as KinectSkeleton);
          break;
        case 'depth':
          this.processDepthFrame(message.data);
          break;
        case 'color':
          this.processColorFrame(message.data);
          break;
        case 'gesture':
          this.emit('gesture', message.data);
          break;
        default:
          console.warn('Unknown Kinect message type:', message.type);
      }
    } catch (error) {
      console.error('Error handling Kinect message:', error);
    }
  }

  /**
   * Process depth frame data
   */
  private processDepthFrame(data: { width?: number; height?: number; buffer: ArrayBuffer }): void {
    if (!this.depthCanvas) return;

    const depthFrame: DepthFrame = {
      width: data.width || 640,
      height: data.height || 480,
      data: new Uint16Array(data.buffer),
      timestamp: Date.now()
    };

    this.emit('depth', depthFrame);
  }

  /**
   * Process color frame data
   */
  private processColorFrame(data: { width?: number; height?: number; buffer: ArrayBuffer }): void {
    if (!this.colorCanvas) return;

    const colorFrame: ColorFrame = {
      width: data.width || 640,
      height: data.height || 480,
      data: new Uint8ClampedArray(data.buffer),
      timestamp: Date.now()
    };

    this.emit('color', colorFrame);
  }

  /**
   * Start skeleton tracking
   */
  startSkeletonTracking(): void {
    this.sendCommand({ command: 'startSkeleton' });
  }

  /**
   * Stop skeleton tracking
   */
  stopSkeletonTracking(): void {
    this.sendCommand({ command: 'stopSkeleton' });
  }

  /**
   * Start depth sensing
   */
  startDepthSensing(): void {
    this.sendCommand({ command: 'startDepth' });
  }

  /**
   * Stop depth sensing
   */
  stopDepthSensing(): void {
    this.sendCommand({ command: 'stopDepth' });
  }

  /**
   * Enable gesture recognition
   */
  enableGestureRecognition(gestures: string[]): void {
    this.sendCommand({
      command: 'enableGestures',
      gestures
    });
  }

  /**
   * Get depth map as canvas
   */
  getDepthCanvas(): HTMLCanvasElement | null {
    return this.depthCanvas;
  }

  /**
   * Send command to Kinect
   */
  private sendCommand(command: { command: string;[key: string]: unknown }): void {
    if (this.ws && this.isConnected) {
      this.ws.send(JSON.stringify(command));
    }
  }

  /**
   * Event listener management
   */
  on(event: string, callback: KinectListener): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)!.push(callback);
  }

  off(event: string, callback: KinectListener): void {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    }
  }

  private emit(event: string, data?: unknown): void {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      callbacks.forEach(callback => callback(data));
    }
  }

  get connected(): boolean {
    return this.isConnected;
  }

  get status(): KinectConnectionStatus {
    return { ...this.connectionStatus };
  }

  /**
   * Try to connect with fallback to simulation mode
   */
  async connectWithFallback(serverUrl?: string): Promise<boolean> {
    try {
      await this.connect(serverUrl, { autoReconnect: true });
      return true;
    } catch {
      console.log('📡 Kinect not available, running in simulation mode');
      this.emit('simulationMode', true);
      return false;
    }
  }
}

export const kinectService = new KinectService();
