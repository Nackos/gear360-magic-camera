// MLCore Framework - Unified ML inference framework for the web
// Inspired by Apple Core ML & Google TensorFlow Lite

export * from './types';
export * from './MLModel';
export * from './TensorUtils';
export * from './ModelRegistry';
export * from './Interpreter';
export * from './Pipeline';
export * from './VisionRequest';

// Re-export commonly used items
export { MLModel } from './MLModel';
export { TensorUtils } from './TensorUtils';
export { ModelRegistry, modelRegistry } from './ModelRegistry';
export { TFJSInterpreter } from './Interpreter';
export { MLPipeline, PipelineBuilder } from './Pipeline';
export { VisionRequest } from './VisionRequest';

/**
 * MLCore - A unified ML inference framework for the web
 * 
 * Features:
 * - Unified model loading and management
 * - Automatic device selection (WebGPU, WebGL, WASM)
 * - Tensor utilities and preprocessing
 * - Model registry for centralized management
 * - Pipeline support for chaining models
 * - Vision utilities for common CV tasks
 * 
 * Example usage:
 * 
 * ```typescript
 * import { TFJSInterpreter, modelRegistry, VisionRequest } from '@/frameworks/mlcore';
 * 
 * // Create and register a model
 * const detector = new TFJSInterpreter({
 *   modelPath: '/models/yolov8n_web/model.json',
 *   format: 'tfjs',
 *   device: 'auto'
 * });
 * 
 * modelRegistry.register('detector', detector);
 * 
 * // Load and run inference
 * const model = await modelRegistry.getOrLoad('detector');
 * const result = await model.predict(imageElement);
 * 
 * // Parse detections
 * const boxes = VisionRequest.parseDetections(result.outputs['output_0'], {
 *   numClasses: 80,
 *   labels: COCO_LABELS,
 *   inputWidth: 640,
 *   inputHeight: 640
 * });
 * ```
 */

console.log('🚀 MLCore Framework initialized');
