// MLModel - Core abstraction for ML models (like MLModel in Core ML)

import {
  ModelConfig,
  ModelMetadata,
  ModelState,
  Tensor,
  InferenceOptions,
  InferenceResult,
  PerformanceMetrics,
  ModelEventMap,
  ModelEventListener,
  DeviceType
} from './types';

export abstract class MLModel<TInput = unknown, TOutput = unknown> {
  protected config: ModelConfig;
  protected metadata: ModelMetadata | null = null;
  protected state: ModelState = 'unloaded';
  protected metrics: PerformanceMetrics = {
    averageInferenceMs: 0,
    minInferenceMs: Infinity,
    maxInferenceMs: 0,
    totalInferences: 0,
    memoryUsageMB: 0,
    deviceUtilization: 0
  };

  private listeners: Map<keyof ModelEventMap, Set<ModelEventListener<keyof ModelEventMap>>> = new Map();
  private inferenceHistory: number[] = [];

  constructor(config: ModelConfig) {
    this.config = {
      device: 'auto',
      numThreads: navigator.hardwareConcurrency || 4,
      enableQuantization: false,
      cacheModel: true,
      warmupRuns: 1,
      ...config
    };
  }

  // Abstract methods to be implemented by specific model types
  protected abstract loadModelImpl(): Promise<void>;
  protected abstract runInferenceImpl(inputs: Record<string, Tensor>): Promise<Record<string, Tensor>>;
  protected abstract disposeImpl(): void;
  protected abstract getMemoryUsage(): number;

  // Preprocessing/Postprocessing hooks
  protected abstract preprocess(input: TInput): Record<string, Tensor>;
  protected abstract postprocess(outputs: Record<string, Tensor>): TOutput;

  // Image processing utility methods (example, can be moved to a separate utility class)
  protected enhanceImage(image: ArrayBuffer, params?: { brightness?: number; contrast?: number }): ArrayBuffer {
    const imageData = new Uint8Array(image);
    const brightness = params?.brightness ?? 1.0;
    const contrast = params?.contrast ?? 1.0;
    // Placeholder for actual image enhancement logic
    // In a real scenario, this would involve iterating over pixels and applying transformations.
    // For now, we return the original image buffer.
    console.log(`Enhancing image with brightness: ${brightness}, contrast: ${contrast}`);
    return image;
  }

  protected applyHDR(image: ArrayBuffer, params?: { intensity?: number }): ArrayBuffer {
    const intensity = params?.intensity ?? 1.0;
    // Placeholder for actual HDR application logic
    console.log(`Applying HDR with intensity: ${intensity}`);
    return image;
  }

  async load(): Promise<void> {
    if (this.state === 'ready') return;

    this.setState('loading');

    try {
      await this.loadModelImpl();

      // Warmup runs
      if (this.config.warmupRuns && this.config.warmupRuns > 0) {
        console.log(`🔥 Running ${this.config.warmupRuns} warmup inference(s)...`);
        for (let i = 0; i < this.config.warmupRuns; i++) {
          await this.warmup();
        }
      }

      this.setState('ready');
      console.log(`✅ Model loaded: ${this.metadata?.name || this.config.modelPath}`);
    } catch (error) {
      this.setState('error');
      this.emit('error', {
        error: error instanceof Error ? error : new Error(String(error)),
        context: 'load'
      });
      throw error;
    }
  }

  async predict(input: TInput, options?: InferenceOptions): Promise<InferenceResult<TOutput>> {
    if (this.state !== 'ready') {
      throw new Error(`Model not ready. Current state: ${this.state}`);
    }

    const startTotal = performance.now();

    // Preprocess
    const preprocessStart = performance.now();
    const tensorInputs = this.preprocess(input);
    const preprocessTimeMs = performance.now() - preprocessStart;

    this.emit('inference-start', { inputNames: Object.keys(tensorInputs) });

    // Inference
    const inferenceStart = performance.now();
    const tensorOutputs = await this.runInferenceImpl(tensorInputs);
    const inferenceTimeMs = performance.now() - inferenceStart;

    // Postprocess
    const postprocessStart = performance.now();
    const parsed = this.postprocess(tensorOutputs);
    const postprocessTimeMs = performance.now() - postprocessStart;

    // Update metrics
    this.updateMetrics(inferenceTimeMs);

    const result: InferenceResult<TOutput> = {
      outputs: tensorOutputs,
      parsed,
      inferenceTimeMs,
      preprocessTimeMs,
      postprocessTimeMs
    };

    this.emit('inference-end', { result });

    return result;
  }

  async predictBatch(inputs: TInput[], options?: InferenceOptions): Promise<InferenceResult<TOutput>[]> {
    const results: InferenceResult<TOutput>[] = [];

    for (const input of inputs) {
      results.push(await this.predict(input, options));
    }

    return results;
  }

  dispose(): void {
    if (this.state === 'disposed') return;

    this.disposeImpl();
    this.setState('disposed');
    this.listeners.clear();
    console.log(`🗑️ Model disposed: ${this.metadata?.name || this.config.modelPath}`);
  }

  // Event handling
  on<K extends keyof ModelEventMap>(event: K, listener: ModelEventListener<K>): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(listener);
  }

  off<K extends keyof ModelEventMap>(event: K, listener: ModelEventListener<K>): void {
    this.listeners.get(event)?.delete(listener);
  }

  protected emit<K extends keyof ModelEventMap>(event: K, data: ModelEventMap[K]): void {
    this.listeners.get(event)?.forEach(listener => listener(data));
  }

  // State management
  protected setState(newState: ModelState): void {
    const previousState = this.state;
    this.state = newState;
    this.emit('state-change', { state: newState, previousState });
  }

  getState(): ModelState {
    return this.state;
  }

  getMetadata(): ModelMetadata | null {
    return this.metadata;
  }

  getMetrics(): PerformanceMetrics {
    return { ...this.metrics };
  }

  getConfig(): ModelConfig {
    return { ...this.config };
  }

  // Performance tracking
  private updateMetrics(inferenceTimeMs: number): void {
    this.inferenceHistory.push(inferenceTimeMs);

    // Keep last 100 inferences for rolling average
    if (this.inferenceHistory.length > 100) {
      this.inferenceHistory.shift();
    }

    this.metrics.totalInferences++;
    this.metrics.minInferenceMs = Math.min(this.metrics.minInferenceMs, inferenceTimeMs);
    this.metrics.maxInferenceMs = Math.max(this.metrics.maxInferenceMs, inferenceTimeMs);
    this.metrics.averageInferenceMs =
      this.inferenceHistory.reduce((a, b) => a + b, 0) / this.inferenceHistory.length;
    this.metrics.memoryUsageMB = this.getMemoryUsage();

    this.emit('metrics-update', { metrics: this.metrics });
  }

  // Utility to detect best device
  protected async detectBestDevice(): Promise<DeviceType> {
    if (this.config.device !== 'auto') {
      return this.config.device!;
    }

    // Check WebGPU support
    if ('gpu' in navigator) {
      try {
        const gpu = (navigator as unknown as { gpu: { requestAdapter: () => Promise<unknown> } }).gpu;
        const adapter = await gpu.requestAdapter();
        if (adapter) {
          console.log('🎮 WebGPU available, using GPU acceleration');
          return 'webgpu';
        }
      } catch {
        // WebGPU not available
      }
    }

    // Check WebGL support
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
    if (gl) {
      console.log('🖼️ WebGL available, using GPU');
      return 'gpu';
    }

    console.log('💻 Falling back to CPU/WASM');
    return 'wasm';
  }

  // Warmup method (to be overridden if needed)
  protected async warmup(): Promise<void> {
    // Default implementation - subclasses can override
  }
}
