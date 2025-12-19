// TensorUtils - Utilities for tensor operations (like MLMultiArray in Core ML)

import { Tensor, TensorShape, DataType, PreprocessConfig } from './types';

export class TensorUtils {
  /**
   * Create a tensor from various input types
   */
  static createTensor(
    data: number[] | Float32Array | ImageData | HTMLImageElement | HTMLCanvasElement | HTMLVideoElement,
    shape?: number[],
    dataType: DataType = 'float32'
  ): Tensor {
    if (data instanceof ImageData) {
      return this.fromImageData(data);
    }
    
    if (data instanceof HTMLImageElement || data instanceof HTMLCanvasElement || data instanceof HTMLVideoElement) {
      return this.fromImageElement(data);
    }

    const typedData = data instanceof Float32Array ? data : new Float32Array(data);
    
    return {
      data: typedData,
      shape: {
        dims: shape || [typedData.length],
        dataType
      }
    };
  }

  /**
   * Convert ImageData to tensor
   */
  static fromImageData(imageData: ImageData, normalize = true): Tensor {
    const { width, height, data } = imageData;
    const numPixels = width * height;
    const tensorData = new Float32Array(numPixels * 3);

    for (let i = 0; i < numPixels; i++) {
      const srcIdx = i * 4;
      const dstIdx = i * 3;
      
      if (normalize) {
        tensorData[dstIdx] = data[srcIdx] / 255.0;
        tensorData[dstIdx + 1] = data[srcIdx + 1] / 255.0;
        tensorData[dstIdx + 2] = data[srcIdx + 2] / 255.0;
      } else {
        tensorData[dstIdx] = data[srcIdx];
        tensorData[dstIdx + 1] = data[srcIdx + 1];
        tensorData[dstIdx + 2] = data[srcIdx + 2];
      }
    }

    return {
      data: tensorData,
      shape: {
        dims: [1, height, width, 3],
        dataType: 'float32'
      }
    };
  }

  /**
   * Convert HTML element (image, canvas, video) to tensor
   */
  static fromImageElement(
    element: HTMLImageElement | HTMLCanvasElement | HTMLVideoElement,
    config?: PreprocessConfig
  ): Tensor {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d')!;

    let width: number, height: number;
    
    if (element instanceof HTMLVideoElement) {
      width = element.videoWidth;
      height = element.videoHeight;
    } else if (element instanceof HTMLImageElement) {
      width = element.naturalWidth;
      height = element.naturalHeight;
    } else {
      width = element.width;
      height = element.height;
    }

    // Apply resize if configured
    if (config?.resize) {
      canvas.width = config.resize.width;
      canvas.height = config.resize.height;
    } else {
      canvas.width = width;
      canvas.height = height;
    }

    // Handle padding to square
    if (config?.padToSquare) {
      const maxDim = Math.max(canvas.width, canvas.height);
      canvas.width = maxDim;
      canvas.height = maxDim;
      ctx.fillStyle = '#000';
      ctx.fillRect(0, 0, maxDim, maxDim);
      
      const offsetX = (maxDim - width) / 2;
      const offsetY = (maxDim - height) / 2;
      ctx.drawImage(element, offsetX, offsetY, width, height);
    } else {
      ctx.drawImage(element, 0, 0, canvas.width, canvas.height);
    }

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    let tensor = this.fromImageData(imageData);

    // Apply normalization
    if (config?.normalize) {
      tensor = this.normalize(tensor, config.normalize.mean, config.normalize.std);
    }

    // Convert color space
    if (config?.colorSpace === 'bgr') {
      tensor = this.rgbToBgr(tensor);
    } else if (config?.colorSpace === 'grayscale') {
      tensor = this.toGrayscale(tensor);
    }

    return tensor;
  }

  /**
   * Normalize tensor with mean and std
   */
  static normalize(tensor: Tensor, mean: number[], std: number[]): Tensor {
    const data = tensor.data as Float32Array;
    const normalized = new Float32Array(data.length);
    const channels = mean.length;

    for (let i = 0; i < data.length; i++) {
      const channel = i % channels;
      normalized[i] = (data[i] - mean[channel]) / std[channel];
    }

    return {
      data: normalized,
      shape: tensor.shape
    };
  }

  /**
   * Convert RGB to BGR
   */
  static rgbToBgr(tensor: Tensor): Tensor {
    const data = tensor.data as Float32Array;
    const converted = new Float32Array(data.length);

    for (let i = 0; i < data.length; i += 3) {
      converted[i] = data[i + 2];     // B
      converted[i + 1] = data[i + 1]; // G
      converted[i + 2] = data[i];     // R
    }

    return {
      data: converted,
      shape: tensor.shape
    };
  }

  /**
   * Convert to grayscale
   */
  static toGrayscale(tensor: Tensor): Tensor {
    const data = tensor.data as Float32Array;
    const numPixels = data.length / 3;
    const grayscale = new Float32Array(numPixels);

    for (let i = 0; i < numPixels; i++) {
      const idx = i * 3;
      // Luminance formula
      grayscale[i] = 0.299 * data[idx] + 0.587 * data[idx + 1] + 0.114 * data[idx + 2];
    }

    const [batch, height, width] = tensor.shape.dims;
    return {
      data: grayscale,
      shape: {
        dims: [batch, height, width, 1],
        dataType: 'float32'
      }
    };
  }

  /**
   * Reshape tensor
   */
  static reshape(tensor: Tensor, newShape: number[]): Tensor {
    const totalElements = newShape.reduce((a, b) => a * b, 1);
    
    if (tensor.data.length !== totalElements) {
      throw new Error(`Cannot reshape tensor of size ${tensor.data.length} to shape ${newShape}`);
    }

    return {
      data: tensor.data,
      shape: {
        dims: newShape,
        dataType: tensor.shape.dataType
      }
    };
  }

  /**
   * Transpose tensor (NHWC to NCHW and vice versa)
   */
  static transpose(tensor: Tensor, perm: number[]): Tensor {
    const { dims } = tensor.shape;
    const data = tensor.data as Float32Array;
    
    if (perm.length !== dims.length) {
      throw new Error('Permutation must have same length as tensor dimensions');
    }

    const newDims = perm.map(i => dims[i]);
    const result = new Float32Array(data.length);

    // Calculate strides
    const oldStrides = this.calculateStrides(dims);
    const newStrides = this.calculateStrides(newDims);

    // Transpose
    const indices = new Array(dims.length).fill(0);
    
    for (let i = 0; i < data.length; i++) {
      // Convert flat index to multi-dimensional indices
      let temp = i;
      for (let d = dims.length - 1; d >= 0; d--) {
        indices[d] = temp % dims[d];
        temp = Math.floor(temp / dims[d]);
      }

      // Calculate new position
      let newIdx = 0;
      for (let d = 0; d < dims.length; d++) {
        newIdx += indices[perm[d]] * newStrides[d];
      }

      result[newIdx] = data[i];
    }

    return {
      data: result,
      shape: {
        dims: newDims,
        dataType: tensor.shape.dataType
      }
    };
  }

  private static calculateStrides(dims: number[]): number[] {
    const strides = new Array(dims.length);
    strides[dims.length - 1] = 1;
    
    for (let i = dims.length - 2; i >= 0; i--) {
      strides[i] = strides[i + 1] * dims[i + 1];
    }
    
    return strides;
  }

  /**
   * Softmax activation
   */
  static softmax(tensor: Tensor): Tensor {
    const data = tensor.data as Float32Array;
    const result = new Float32Array(data.length);
    
    // Find max for numerical stability
    let max = -Infinity;
    for (let i = 0; i < data.length; i++) {
      if (data[i] > max) max = data[i];
    }

    // Compute exp and sum
    let sum = 0;
    for (let i = 0; i < data.length; i++) {
      result[i] = Math.exp(data[i] - max);
      sum += result[i];
    }

    // Normalize
    for (let i = 0; i < data.length; i++) {
      result[i] /= sum;
    }

    return {
      data: result,
      shape: tensor.shape
    };
  }

  /**
   * Get top K indices and values
   */
  static topK(tensor: Tensor, k: number): { indices: number[]; values: number[] } {
    const data = tensor.data as Float32Array;
    const indexed = Array.from(data).map((val, idx) => ({ val, idx }));
    indexed.sort((a, b) => b.val - a.val);
    
    const topK = indexed.slice(0, k);
    
    return {
      indices: topK.map(x => x.idx),
      values: topK.map(x => x.val)
    };
  }

  /**
   * Argmax - get index of maximum value
   */
  static argmax(tensor: Tensor): number {
    const data = tensor.data as Float32Array;
    let maxIdx = 0;
    let maxVal = data[0];
    
    for (let i = 1; i < data.length; i++) {
      if (data[i] > maxVal) {
        maxVal = data[i];
        maxIdx = i;
      }
    }
    
    return maxIdx;
  }

  /**
   * Non-Maximum Suppression
   */
  static nms(
    boxes: number[][],
    scores: number[],
    iouThreshold: number,
    scoreThreshold: number
  ): number[] {
    // Filter by score threshold
    const candidates = scores
      .map((score, idx) => ({ score, idx }))
      .filter(x => x.score >= scoreThreshold)
      .sort((a, b) => b.score - a.score);

    const selected: number[] = [];

    while (candidates.length > 0) {
      const best = candidates.shift()!;
      selected.push(best.idx);

      // Remove boxes with high IoU
      for (let i = candidates.length - 1; i >= 0; i--) {
        const iou = this.calculateIoU(boxes[best.idx], boxes[candidates[i].idx]);
        if (iou > iouThreshold) {
          candidates.splice(i, 1);
        }
      }
    }

    return selected;
  }

  private static calculateIoU(box1: number[], box2: number[]): number {
    const [x1_1, y1_1, x2_1, y2_1] = box1;
    const [x1_2, y1_2, x2_2, y2_2] = box2;

    const xi1 = Math.max(x1_1, x1_2);
    const yi1 = Math.max(y1_1, y1_2);
    const xi2 = Math.min(x2_1, x2_2);
    const yi2 = Math.min(y2_1, y2_2);

    const interWidth = Math.max(0, xi2 - xi1);
    const interHeight = Math.max(0, yi2 - yi1);
    const interArea = interWidth * interHeight;

    const box1Area = (x2_1 - x1_1) * (y2_1 - y1_1);
    const box2Area = (x2_2 - x1_2) * (y2_2 - y1_2);
    const unionArea = box1Area + box2Area - interArea;

    return unionArea > 0 ? interArea / unionArea : 0;
  }
}
