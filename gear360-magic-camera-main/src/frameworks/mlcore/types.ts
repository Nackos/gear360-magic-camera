// MLCore Framework Types - Inspired by Core ML & TensorFlow Lite

export type DeviceType = 'cpu' | 'gpu' | 'webgpu' | 'wasm' | 'auto';
export type ModelFormat = 'tfjs' | 'onnx' | 'tflite' | 'custom';
export type DataType = 'float32' | 'int32' | 'uint8' | 'int8';

export interface TensorShape {
  dims: number[];
  dataType: DataType;
}

export interface Tensor {
  data: Float32Array | Int32Array | Uint8Array | Int8Array;
  shape: TensorShape;
  name?: string;
}

export interface ModelMetadata {
  name: string;
  version: string;
  author?: string;
  description?: string;
  inputShapes: Record<string, TensorShape>;
  outputShapes: Record<string, TensorShape>;
  labels?: string[];
  createdAt?: Date;
}

export interface ModelConfig {
  modelPath: string;
  format: ModelFormat;
  device?: DeviceType;
  numThreads?: number;
  enableQuantization?: boolean;
  cacheModel?: boolean;
  warmupRuns?: number;
}

export interface InferenceOptions {
  batchSize?: number;
  timeout?: number;
  priority?: 'high' | 'normal' | 'low';
}

export interface InferenceResult<T = unknown> {
  outputs: Record<string, Tensor>;
  parsed?: T;
  inferenceTimeMs: number;
  preprocessTimeMs: number;
  postprocessTimeMs: number;
}

export interface PerformanceMetrics {
  averageInferenceMs: number;
  minInferenceMs: number;
  maxInferenceMs: number;
  totalInferences: number;
  memoryUsageMB: number;
  deviceUtilization: number;
}

export interface PreprocessConfig {
  resize?: { width: number; height: number };
  normalize?: { mean: number[]; std: number[] };
  colorSpace?: 'rgb' | 'bgr' | 'grayscale';
  padToSquare?: boolean;
}

export interface PostprocessConfig {
  topK?: number;
  threshold?: number;
  nms?: { iouThreshold: number; scoreThreshold: number };
  softmax?: boolean;
}

export type ModelState = 'unloaded' | 'loading' | 'ready' | 'error' | 'disposed';

export interface ModelEventMap {
  'state-change': { state: ModelState; previousState: ModelState };
  'inference-start': { inputNames: string[] };
  'inference-end': { result: InferenceResult };
  'error': { error: Error; context: string };
  'metrics-update': { metrics: PerformanceMetrics };
}

export type ModelEventListener<K extends keyof ModelEventMap> = (
  event: ModelEventMap[K]
) => void;
