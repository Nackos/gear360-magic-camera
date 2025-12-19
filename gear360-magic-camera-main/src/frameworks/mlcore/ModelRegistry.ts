// ModelRegistry - Central registry for managing ML models (like MLModelCollection)

import { MLModel } from './MLModel';
import { ModelConfig, ModelState, PerformanceMetrics } from './types';

interface RegisteredModel {
  model: MLModel;
  config: ModelConfig;
  registeredAt: Date;
  lastUsed: Date;
  useCount: number;
}

export class ModelRegistry {
  private static instance: ModelRegistry;
  private models: Map<string, RegisteredModel> = new Map();
  private loadingPromises: Map<string, Promise<void>> = new Map();

  private constructor() {}

  static getInstance(): ModelRegistry {
    if (!ModelRegistry.instance) {
      ModelRegistry.instance = new ModelRegistry();
    }
    return ModelRegistry.instance;
  }

  /**
   * Register a model with a unique identifier
   */
  register(id: string, model: MLModel): void {
    if (this.models.has(id)) {
      console.warn(`Model ${id} already registered. Use update() to replace.`);
      return;
    }

    this.models.set(id, {
      model,
      config: model.getConfig(),
      registeredAt: new Date(),
      lastUsed: new Date(),
      useCount: 0
    });

    console.log(`📝 Model registered: ${id}`);
  }

  /**
   * Get a model by ID
   */
  get(id: string): MLModel | undefined {
    const entry = this.models.get(id);
    if (entry) {
      entry.lastUsed = new Date();
      entry.useCount++;
      return entry.model;
    }
    return undefined;
  }

  /**
   * Get a model, loading it if necessary
   */
  async getOrLoad(id: string): Promise<MLModel> {
    const model = this.get(id);
    if (!model) {
      throw new Error(`Model ${id} not registered`);
    }

    if (model.getState() === 'ready') {
      return model;
    }

    // Check if already loading
    if (this.loadingPromises.has(id)) {
      await this.loadingPromises.get(id);
      return model;
    }

    // Start loading
    const loadPromise = model.load();
    this.loadingPromises.set(id, loadPromise);

    try {
      await loadPromise;
    } finally {
      this.loadingPromises.delete(id);
    }

    return model;
  }

  /**
   * Unregister and dispose a model
   */
  unregister(id: string): boolean {
    const entry = this.models.get(id);
    if (entry) {
      entry.model.dispose();
      this.models.delete(id);
      console.log(`🗑️ Model unregistered: ${id}`);
      return true;
    }
    return false;
  }

  /**
   * Check if a model is registered
   */
  has(id: string): boolean {
    return this.models.has(id);
  }

  /**
   * Get all registered model IDs
   */
  listModels(): string[] {
    return Array.from(this.models.keys());
  }

  /**
   * Get model info
   */
  getModelInfo(id: string): {
    state: ModelState;
    config: ModelConfig;
    metrics: PerformanceMetrics;
    registeredAt: Date;
    lastUsed: Date;
    useCount: number;
  } | undefined {
    const entry = this.models.get(id);
    if (!entry) return undefined;

    return {
      state: entry.model.getState(),
      config: entry.config,
      metrics: entry.model.getMetrics(),
      registeredAt: entry.registeredAt,
      lastUsed: entry.lastUsed,
      useCount: entry.useCount
    };
  }

  /**
   * Preload multiple models in parallel
   */
  async preloadModels(ids: string[]): Promise<Map<string, boolean>> {
    const results = new Map<string, boolean>();

    await Promise.all(
      ids.map(async (id) => {
        try {
          await this.getOrLoad(id);
          results.set(id, true);
        } catch (error) {
          console.error(`Failed to preload model ${id}:`, error);
          results.set(id, false);
        }
      })
    );

    return results;
  }

  /**
   * Dispose all models
   */
  disposeAll(): void {
    for (const [id, entry] of this.models) {
      entry.model.dispose();
    }
    this.models.clear();
    console.log('🧹 All models disposed');
  }

  /**
   * Get memory usage across all models
   */
  getTotalMemoryUsage(): number {
    let total = 0;
    for (const entry of this.models.values()) {
      total += entry.model.getMetrics().memoryUsageMB;
    }
    return total;
  }

  /**
   * Cleanup unused models (LRU)
   */
  cleanupUnused(maxAge: number = 5 * 60 * 1000): number {
    const now = Date.now();
    let cleaned = 0;

    for (const [id, entry] of this.models) {
      if (now - entry.lastUsed.getTime() > maxAge && entry.model.getState() === 'ready') {
        entry.model.dispose();
        this.models.delete(id);
        cleaned++;
      }
    }

    if (cleaned > 0) {
      console.log(`🧹 Cleaned up ${cleaned} unused model(s)`);
    }

    return cleaned;
  }
}

// Export singleton instance
export const modelRegistry = ModelRegistry.getInstance();
