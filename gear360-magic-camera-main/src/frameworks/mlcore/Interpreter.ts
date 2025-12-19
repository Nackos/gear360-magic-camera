// Interpreter - TensorFlow.js based model interpreter (like TFLite Interpreter)

import * as tf from '@tensorflow/tfjs';
import { MLModel } from './MLModel';
import { ModelConfig, Tensor as MLTensor, ModelMetadata } from './types';
import { TensorUtils } from './TensorUtils';

export class TFJSInterpreter extends MLModel<
  tf.Tensor | HTMLImageElement | HTMLVideoElement | HTMLCanvasElement | ImageData,
  MLTensor[]
> {
  private model: tf.GraphModel | tf.LayersModel | null = null;
  private inputNames: string[] = [];
  private outputNames: string[] = [];

  constructor(config: ModelConfig) {
    super({ ...config, format: 'tfjs' });
  }

  protected async loadModelImpl(): Promise<void> {
    const device = await this.detectBestDevice();
    
    // Set backend
    if (device === 'webgpu') {
      await tf.setBackend('webgpu');
    } else if (device === 'gpu') {
      await tf.setBackend('webgl');
    } else {
      await tf.setBackend('wasm');
    }
    
    await tf.ready();
    console.log(`🔧 TF.js backend: ${tf.getBackend()}`);

    try {
      // Try loading as GraphModel first (SavedModel/TFJS format)
      this.model = await tf.loadGraphModel(this.config.modelPath);
      console.log('📦 Loaded as GraphModel');
    } catch {
      // Fall back to LayersModel (Keras format)
      this.model = await tf.loadLayersModel(this.config.modelPath);
      console.log('📦 Loaded as LayersModel');
    }

    // Extract input/output info
    if (this.model instanceof tf.GraphModel) {
      this.inputNames = this.model.inputs.map((_, i) => `input_${i}`);
      this.outputNames = this.model.outputs.map((_, i) => `output_${i}`);
    } else {
      this.inputNames = this.model.inputNames;
      this.outputNames = this.model.outputNames;
    }

    this.metadata = {
      name: this.config.modelPath.split('/').pop() || 'unknown',
      version: '1.0',
      inputShapes: {},
      outputShapes: {}
    };
  }

  protected async runInferenceImpl(inputs: Record<string, MLTensor>): Promise<Record<string, MLTensor>> {
    if (!this.model) throw new Error('Model not loaded');

    // Convert to TF tensors
    const tfInputs: tf.Tensor[] = Object.values(inputs).map(t => 
      tf.tensor(t.data as Float32Array, t.shape.dims)
    );

    // Run inference
    const predictions = this.model instanceof tf.GraphModel
      ? this.model.predict(tfInputs.length === 1 ? tfInputs[0] : tfInputs)
      : this.model.predict(tfInputs.length === 1 ? tfInputs[0] : tfInputs);

    // Convert results
    const results: Record<string, MLTensor> = {};
    const predArray = Array.isArray(predictions) ? predictions : [predictions];

    for (let i = 0; i < predArray.length; i++) {
      const pred = predArray[i] as tf.Tensor;
      const data = await pred.data();
      
      results[this.outputNames[i] || `output_${i}`] = {
        data: new Float32Array(data),
        shape: {
          dims: pred.shape as number[],
          dataType: 'float32'
        }
      };
    }

    // Cleanup
    tfInputs.forEach(t => t.dispose());
    predArray.forEach(t => (t as tf.Tensor).dispose());

    return results;
  }

  protected preprocess(
    input: tf.Tensor | HTMLImageElement | HTMLVideoElement | HTMLCanvasElement | ImageData
  ): Record<string, MLTensor> {
    let tensor: MLTensor;

    if (input instanceof tf.Tensor) {
      const data = input.dataSync();
      tensor = {
        data: new Float32Array(data),
        shape: {
          dims: input.shape as number[],
          dataType: 'float32'
        }
      };
    } else {
      tensor = TensorUtils.fromImageElement(
        input as HTMLImageElement | HTMLVideoElement | HTMLCanvasElement
      );
    }

    return { [this.inputNames[0] || 'input']: tensor };
  }

  protected postprocess(outputs: Record<string, MLTensor>): MLTensor[] {
    return Object.values(outputs);
  }

  protected disposeImpl(): void {
    if (this.model) {
      this.model.dispose();
      this.model = null;
    }
  }

  protected getMemoryUsage(): number {
    const memInfo = tf.memory();
    return memInfo.numBytes / (1024 * 1024);
  }

  protected async warmup(): Promise<void> {
    if (!this.model) return;

    // Create dummy input
    const inputShape = this.model.inputs[0]?.shape || [1, 224, 224, 3];
    const dummyShape = inputShape.map(d => d === -1 || d === null ? 1 : d);
    
    const dummyInput = tf.zeros(dummyShape as number[]);
    
    try {
      const result = this.model.predict(dummyInput) as tf.Tensor | tf.Tensor[];
      if (Array.isArray(result)) {
        result.forEach(t => t.dispose());
      } else {
        (result as tf.Tensor).dispose();
      }
    } finally {
      dummyInput.dispose();
    }
  }

  /**
   * Get raw TF.js model for advanced operations
   */
  getRawModel(): tf.GraphModel | tf.LayersModel | null {
    return this.model;
  }
}
