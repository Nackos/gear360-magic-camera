// VisionRequest - High-level vision APIs (like VNRequest in Vision framework)

import { TensorUtils } from './TensorUtils';
import { Tensor, PreprocessConfig, PostprocessConfig } from './types';

export interface BoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
  confidence: number;
  label?: string;
  labelIndex?: number;
}

export interface ClassificationResult {
  label: string;
  confidence: number;
  index: number;
}

export interface Landmark {
  x: number;
  y: number;
  z?: number;
  visibility?: number;
  name?: string;
}

export interface SegmentationMask {
  data: Uint8Array;
  width: number;
  height: number;
  numClasses: number;
}

/**
 * Vision utilities for common CV tasks
 */
export class VisionRequest {
  /**
   * Parse object detection results (YOLO/SSD format)
   */
  static parseDetections(
    output: Tensor,
    config: {
      numClasses: number;
      labels?: string[];
      scoreThreshold?: number;
      iouThreshold?: number;
      inputWidth: number;
      inputHeight: number;
    }
  ): BoundingBox[] {
    const { numClasses, labels, scoreThreshold = 0.5, iouThreshold = 0.45, inputWidth, inputHeight } = config;
    const data = output.data as Float32Array;
    const detections: BoundingBox[] = [];

    // Assuming output format: [batch, num_detections, 5 + num_classes]
    // where 5 = [x_center, y_center, width, height, objectness]
    const numDetections = output.shape.dims[1] || data.length / (5 + numClasses);
    const stride = 5 + numClasses;

    for (let i = 0; i < numDetections; i++) {
      const offset = i * stride;
      const objectness = data[offset + 4];

      if (objectness < scoreThreshold) continue;

      // Find best class
      let maxClassScore = 0;
      let maxClassIdx = 0;
      
      for (let c = 0; c < numClasses; c++) {
        const classScore = data[offset + 5 + c];
        if (classScore > maxClassScore) {
          maxClassScore = classScore;
          maxClassIdx = c;
        }
      }

      const confidence = objectness * maxClassScore;
      if (confidence < scoreThreshold) continue;

      // Convert from center format to corner format
      const cx = data[offset];
      const cy = data[offset + 1];
      const w = data[offset + 2];
      const h = data[offset + 3];

      detections.push({
        x: (cx - w / 2) * inputWidth,
        y: (cy - h / 2) * inputHeight,
        width: w * inputWidth,
        height: h * inputHeight,
        confidence,
        labelIndex: maxClassIdx,
        label: labels?.[maxClassIdx]
      });
    }

    // Apply NMS
    if (iouThreshold < 1) {
      return this.applyNMS(detections, iouThreshold);
    }

    return detections;
  }

  /**
   * Parse classification results
   */
  static parseClassification(
    output: Tensor,
    labels?: string[],
    topK: number = 5,
    applySoftmax: boolean = true
  ): ClassificationResult[] {
    let tensor = output;
    
    if (applySoftmax) {
      tensor = TensorUtils.softmax(output);
    }

    const { indices, values } = TensorUtils.topK(tensor, topK);

    return indices.map((idx, i) => ({
      label: labels?.[idx] || `class_${idx}`,
      confidence: values[i],
      index: idx
    }));
  }

  /**
   * Parse pose estimation results (MediaPipe/COCO format)
   */
  static parsePoseLandmarks(
    output: Tensor,
    config: {
      numLandmarks: number;
      landmarkNames?: string[];
      visibilityThreshold?: number;
    }
  ): Landmark[] {
    const { numLandmarks, landmarkNames, visibilityThreshold = 0.5 } = config;
    const data = output.data as Float32Array;
    const landmarks: Landmark[] = [];

    // Assuming format: [x, y, z, visibility] per landmark
    const stride = 4;

    for (let i = 0; i < numLandmarks; i++) {
      const offset = i * stride;
      const visibility = data[offset + 3];

      if (visibility < visibilityThreshold) continue;

      landmarks.push({
        x: data[offset],
        y: data[offset + 1],
        z: data[offset + 2],
        visibility,
        name: landmarkNames?.[i]
      });
    }

    return landmarks;
  }

  /**
   * Parse hand landmarks (21 points)
   */
  static parseHandLandmarks(output: Tensor): Landmark[] {
    const handLandmarkNames = [
      'wrist',
      'thumb_cmc', 'thumb_mcp', 'thumb_ip', 'thumb_tip',
      'index_mcp', 'index_pip', 'index_dip', 'index_tip',
      'middle_mcp', 'middle_pip', 'middle_dip', 'middle_tip',
      'ring_mcp', 'ring_pip', 'ring_dip', 'ring_tip',
      'pinky_mcp', 'pinky_pip', 'pinky_dip', 'pinky_tip'
    ];

    return this.parsePoseLandmarks(output, {
      numLandmarks: 21,
      landmarkNames: handLandmarkNames,
      visibilityThreshold: 0
    });
  }

  /**
   * Parse segmentation mask
   */
  static parseSegmentationMask(
    output: Tensor,
    width: number,
    height: number
  ): SegmentationMask {
    const data = output.data as Float32Array;
    const numClasses = output.shape.dims[output.shape.dims.length - 1] || 1;
    
    // Get argmax for each pixel
    const mask = new Uint8Array(width * height);
    
    for (let i = 0; i < width * height; i++) {
      let maxVal = -Infinity;
      let maxIdx = 0;
      
      for (let c = 0; c < numClasses; c++) {
        const val = data[i * numClasses + c];
        if (val > maxVal) {
          maxVal = val;
          maxIdx = c;
        }
      }
      
      mask[i] = maxIdx;
    }

    return { data: mask, width, height, numClasses };
  }

  /**
   * Apply Non-Maximum Suppression
   */
  private static applyNMS(detections: BoundingBox[], iouThreshold: number): BoundingBox[] {
    if (detections.length === 0) return [];

    // Sort by confidence
    const sorted = [...detections].sort((a, b) => b.confidence - a.confidence);
    const selected: BoundingBox[] = [];

    while (sorted.length > 0) {
      const best = sorted.shift()!;
      selected.push(best);

      for (let i = sorted.length - 1; i >= 0; i--) {
        if (this.calculateIoU(best, sorted[i]) > iouThreshold) {
          sorted.splice(i, 1);
        }
      }
    }

    return selected;
  }

  private static calculateIoU(box1: BoundingBox, box2: BoundingBox): number {
    const x1 = Math.max(box1.x, box2.x);
    const y1 = Math.max(box1.y, box2.y);
    const x2 = Math.min(box1.x + box1.width, box2.x + box2.width);
    const y2 = Math.min(box1.y + box1.height, box2.y + box2.height);

    const interArea = Math.max(0, x2 - x1) * Math.max(0, y2 - y1);
    const box1Area = box1.width * box1.height;
    const box2Area = box2.width * box2.height;
    const unionArea = box1Area + box2Area - interArea;

    return unionArea > 0 ? interArea / unionArea : 0;
  }

  /**
   * Draw detections on canvas
   */
  static drawDetections(
    ctx: CanvasRenderingContext2D,
    detections: BoundingBox[],
    options: {
      boxColor?: string;
      textColor?: string;
      lineWidth?: number;
      fontSize?: number;
      showLabels?: boolean;
      showConfidence?: boolean;
    } = {}
  ): void {
    const {
      boxColor = '#00FF00',
      textColor = '#FFFFFF',
      lineWidth = 2,
      fontSize = 14,
      showLabels = true,
      showConfidence = true
    } = options;

    ctx.strokeStyle = boxColor;
    ctx.lineWidth = lineWidth;
    ctx.font = `${fontSize}px Arial`;

    for (const det of detections) {
      // Draw box
      ctx.strokeRect(det.x, det.y, det.width, det.height);

      // Draw label
      if (showLabels || showConfidence) {
        const parts: string[] = [];
        if (showLabels && det.label) parts.push(det.label);
        if (showConfidence) parts.push(`${(det.confidence * 100).toFixed(1)}%`);
        
        const text = parts.join(' ');
        const textWidth = ctx.measureText(text).width;

        ctx.fillStyle = boxColor;
        ctx.fillRect(det.x, det.y - fontSize - 4, textWidth + 8, fontSize + 4);
        
        ctx.fillStyle = textColor;
        ctx.fillText(text, det.x + 4, det.y - 4);
      }
    }
  }

  /**
   * Draw landmarks on canvas
   */
  static drawLandmarks(
    ctx: CanvasRenderingContext2D,
    landmarks: Landmark[],
    connections: [number, number][] = [],
    options: {
      pointColor?: string;
      lineColor?: string;
      pointRadius?: number;
      lineWidth?: number;
    } = {}
  ): void {
    const {
      pointColor = '#FF0000',
      lineColor = '#00FF00',
      pointRadius = 4,
      lineWidth = 2
    } = options;

    // Draw connections
    if (connections.length > 0) {
      ctx.strokeStyle = lineColor;
      ctx.lineWidth = lineWidth;

      for (const [i, j] of connections) {
        if (landmarks[i] && landmarks[j]) {
          ctx.beginPath();
          ctx.moveTo(landmarks[i].x, landmarks[i].y);
          ctx.lineTo(landmarks[j].x, landmarks[j].y);
          ctx.stroke();
        }
      }
    }

    // Draw points
    ctx.fillStyle = pointColor;
    
    for (const lm of landmarks) {
      ctx.beginPath();
      ctx.arc(lm.x, lm.y, pointRadius, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}
