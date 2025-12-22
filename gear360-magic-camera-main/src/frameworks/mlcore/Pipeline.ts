// Pipeline - Chain multiple models together (like VNSequenceRequestHandler)

import { MLModel } from './MLModel';
import { InferenceResult, Tensor } from './types';

interface PipelineStage<TInput = unknown, TOutput = unknown> {
  name: string;
  model: MLModel<TInput, TOutput>;
  transform?: (input: any) => TInput;
  condition?: (input: any) => boolean;
}

interface PipelineResult {
  outputs: Record<string, any>;
  stageResults: Map<string, InferenceResult>;
  totalTimeMs: number;
  stagesExecuted: string[];
}

export class MLPipeline {
  private stages: PipelineStage[] = [];
  private name: string;

  constructor(name: string) {
    this.name = name;
  }

  /**
   * Add a stage to the pipeline
   */
  addStage<TInput, TOutput>(stage: PipelineStage<TInput, TOutput>): this {
    this.stages.push(stage as PipelineStage);
    return this;
  }

  /**
   * Remove a stage by name
   */
  removeStage(name: string): boolean {
    const index = this.stages.findIndex(s => s.name === name);
    if (index >= 0) {
      this.stages.splice(index, 1);
      return true;
    }
    return false;
  }

  /**
   * Load all models in the pipeline
   */
  async loadAll(): Promise<void> {
    console.log(`🔄 Loading pipeline: ${this.name}`);
    
    await Promise.all(
      this.stages.map(async (stage) => {
        if (stage.model.getState() !== 'ready') {
          await stage.model.load();
        }
      })
    );
    
    console.log(`✅ Pipeline ready: ${this.name}`);
  }

  /**
   * Run the pipeline
   */
  async run(input: any): Promise<PipelineResult> {
    const startTime = performance.now();
    const stageResults = new Map<string, InferenceResult>();
    const stagesExecuted: string[] = [];
    
    let currentInput = input;
    const outputs: Record<string, any> = {};

    for (const stage of this.stages) {
      // Check condition
      if (stage.condition && !stage.condition(currentInput)) {
        console.log(`⏭️ Skipping stage: ${stage.name} (condition not met)`);
        continue;
      }

      // Transform input if needed
      const stageInput = stage.transform ? stage.transform(currentInput) : currentInput;

      // Run inference
      console.log(`▶️ Running stage: ${stage.name}`);
      const result = await stage.model.predict(stageInput);
      
      stageResults.set(stage.name, result);
      stagesExecuted.push(stage.name);
      
      // Use parsed output as next input
      currentInput = result.parsed;
      outputs[stage.name] = result.parsed;
    }

    const totalTimeMs = performance.now() - startTime;

    return {
      outputs,
      stageResults,
      totalTimeMs,
      stagesExecuted
    };
  }

  /**
   * Run pipeline with batched input
   */
  async runBatch(inputs: any[]): Promise<PipelineResult[]> {
    return Promise.all(inputs.map(input => this.run(input)));
  }

  /**
   * Dispose all models
   */
  disposeAll(): void {
    this.stages.forEach(stage => stage.model.dispose());
    this.stages = [];
  }

  /**
   * Get pipeline info
   */
  getInfo(): { name: string; stages: string[]; totalStages: number } {
    return {
      name: this.name,
      stages: this.stages.map(s => s.name),
      totalStages: this.stages.length
    };
  }
}

/**
 * Builder for creating pipelines fluently
 */
export class PipelineBuilder {
  private pipeline: MLPipeline;

  constructor(name: string) {
    this.pipeline = new MLPipeline(name);
  }

  /**
   * Add detection stage
   */
  detect<T>(name: string, model: MLModel<any, T>): this {
    this.pipeline.addStage({ name, model });
    return this;
  }

  /**
   * Add conditional stage
   */
  when<TInput, TOutput>(
    condition: (input: any) => boolean,
    name: string,
    model: MLModel<TInput, TOutput>
  ): this {
    this.pipeline.addStage({ name, model, condition });
    return this;
  }

  /**
   * Add stage with input transformation
   */
  transform<TInput, TOutput>(
    name: string,
    model: MLModel<TInput, TOutput>,
    transform: (input: any) => TInput
  ): this {
    this.pipeline.addStage({ name, model, transform });
    return this;
  }

  /**
   * Build the pipeline
   */
  build(): MLPipeline {
    return this.pipeline;
  }
}
