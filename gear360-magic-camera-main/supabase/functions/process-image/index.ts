import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ImageProcessRequest {
  imageUrl: string;
  operations: ImageOperation[];
}

type EnhanceParams = { brightness?: number; contrast?: number; };
type DenoiseParams = { strength?: number; };
type HdrParams = { intensity?: number; };
type Stitch360Params = { mode?: string; };
type DepthMapParams = unknown; // No specific params defined yet
type ObjectRemovalParams = { mask?: [number, number][]; };

type ImageOperation =
  | { type: 'enhance'; params?: EnhanceParams }
  | { type: 'denoise'; params?: DenoiseParams }
  | { type: 'hdr'; params?: HdrParams }
  | { type: 'stitch360'; params?: Stitch360Params }
  | { type: 'depthMap'; params?: DepthMapParams }
  | { type: 'objectRemoval'; params?: ObjectRemovalParams };

serve(async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { imageUrl, operations }: ImageProcessRequest = await req.json();

    if (!imageUrl || !operations || operations.length === 0) {
      throw new Error("Image URL and operations are required");
    }

    // Fetch the image
    const imageResponse = await fetch(imageUrl);
    if (!imageResponse.ok) {
      throw new Error("Failed to fetch image");
    }

    const imageBuffer = await imageResponse.arrayBuffer();
    let processedImage: ArrayBuffer = imageBuffer;

    // Process each operation
    for (const operation of operations) {
      processedImage = await processOperation(processedImage, operation);
    }

    // Convert back to base64 for response
    const uint8Array = new Uint8Array(processedImage);
    const base64Image = btoa(
      String.fromCharCode(...uint8Array)
    );

    return new Response(
      JSON.stringify({
        success: true,
        processedImage: `data:image/jpeg;base64,${base64Image}`,
        operations: operations.map(op => op.type)
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Image processing error:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : "Unknown error"
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});

async function processOperation(
  image: ArrayBuffer,
  operation: ImageOperation
): Promise<ArrayBuffer> {
  switch (operation.type) {
    case 'enhance':
      return enhanceImage(image, operation.params);
    case 'denoise':
      return denoiseImage(image, operation.params);
    case 'hdr':
      return applyHDR(image, operation.params);
    case 'stitch360':
      return stitch360(image, operation.params);
    case 'depthMap':
      return generateDepthMap(image, operation.params);
    case 'objectRemoval':
      return removeObject(image, operation.params);
    default:
      return image;
  }
}

function enhanceImage(image: ArrayBuffer, params?: { brightness?: number; contrast?: number }): ArrayBuffer {
  const imageData = new Uint8Array(image);
  const brightness = params?.brightness ?? 1.0;
  const contrast = params?.contrast ?? 1.0;

  const enhanced = new Uint8Array(imageData.length);
  for (let i = 0; i < imageData.length; i++) {
    let pixel = imageData[i];
    pixel = pixel * brightness;
    pixel = ((pixel - 128) * contrast) + 128;
    enhanced[i] = Math.min(255, Math.max(0, pixel));
  }

  return enhanced.buffer;
}

function denoiseImage(image: ArrayBuffer, params?: { strength?: number }): ArrayBuffer {
  const strength = params?.strength ?? 0.5;
  return image;
}

function applyHDR(image: ArrayBuffer, params?: { intensity?: number }): ArrayBuffer {
  const intensity = params?.intensity ?? 1.0;
  return image;
}

function stitch360(image: ArrayBuffer, params?: { mode?: string }): ArrayBuffer {
  const mode = params?.mode ?? 'equirectangular';
  return image;
}

function generateDepthMap(image: ArrayBuffer, _params?: unknown): ArrayBuffer {
  return image;
}

function removeObject(image: ArrayBuffer, params?: { mask?: [number, number][] }): ArrayBuffer {
  const maskCoordinates = params?.mask ?? [];
  return image;
}
