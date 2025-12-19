import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface KinectData {
  type: 'skeleton' | 'depth' | 'gesture';
  data: any;
  timestamp: number;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const kinectData: KinectData = await req.json();

    let processedData;

    switch (kinectData.type) {
      case 'skeleton':
        processedData = await processSkeleton(kinectData.data);
        break;
      case 'depth':
        processedData = await processDepth(kinectData.data);
        break;
      case 'gesture':
        processedData = await processGesture(kinectData.data);
        break;
      default:
        throw new Error("Unknown Kinect data type");
    }

    return new Response(
      JSON.stringify({
        success: true,
        type: kinectData.type,
        processed: processedData,
        timestamp: Date.now()
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Kinect processing error:", error);
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

async function processSkeleton(skeletonData: any) {
  // Process skeleton tracking data
  const { joints } = skeletonData;
  
  // Calculate body metrics
  const metrics = {
    height: calculateHeight(joints),
    reach: calculateReach(joints),
    posture: analyzePosture(joints),
    activity: detectActivity(joints)
  };

  return {
    joints,
    metrics,
    normalized: normalizeJoints(joints)
  };
}

async function processDepth(depthData: any) {
  // Process depth frame data
  const { width, height, buffer } = depthData;
  
  // Generate point cloud or mesh
  const pointCloud = generatePointCloud(buffer, width, height);
  
  return {
    pointCloud,
    statistics: calculateDepthStats(buffer)
  };
}

async function processGesture(gestureData: any) {
  // Process and recognize gestures
  const { type, confidence, joints } = gestureData;
  
  return {
    recognized: type,
    confidence,
    suggestedAction: mapGestureToAction(type)
  };
}

function calculateHeight(joints: any[]): number {
  const head = joints.find(j => j.type === 'Head');
  const foot = joints.find(j => j.type === 'FootLeft') || joints.find(j => j.type === 'FootRight');
  
  if (!head || !foot) return 0;
  
  return Math.abs(head.position.y - foot.position.y);
}

function calculateReach(joints: any[]): number {
  const leftHand = joints.find(j => j.type === 'HandLeft');
  const rightHand = joints.find(j => j.type === 'HandRight');
  
  if (!leftHand || !rightHand) return 0;
  
  const dx = rightHand.position.x - leftHand.position.x;
  const dy = rightHand.position.y - leftHand.position.y;
  const dz = rightHand.position.z - leftHand.position.z;
  
  return Math.sqrt(dx * dx + dy * dy + dz * dz);
}

function analyzePosture(joints: any[]): string {
  const spine = joints.find(j => j.type === 'SpineMid');
  const head = joints.find(j => j.type === 'Head');
  
  if (!spine || !head) return 'unknown';
  
  const angle = Math.atan2(head.position.x - spine.position.x, head.position.y - spine.position.y);
  
  if (Math.abs(angle) < 0.2) return 'upright';
  if (angle > 0.2) return 'leaning_left';
  return 'leaning_right';
}

function detectActivity(joints: any[]): string {
  const rightHand = joints.find(j => j.type === 'HandRight');
  const head = joints.find(j => j.type === 'Head');
  
  if (!rightHand || !head) return 'idle';
  
  if (rightHand.position.y > head.position.y) return 'hand_raised';
  
  return 'standing';
}

function normalizeJoints(joints: any[]) {
  // Normalize joint coordinates to 0-1 range
  return joints.map(joint => ({
    ...joint,
    normalized: {
      x: (joint.position.x + 2) / 4,
      y: (joint.position.y + 2) / 4,
      z: joint.position.z / 4
    }
  }));
}

function generatePointCloud(buffer: number[], width: number, height: number) {
  const points = [];
  
  for (let y = 0; y < height; y += 2) {
    for (let x = 0; x < width; x += 2) {
      const depth = buffer[y * width + x];
      if (depth > 0) {
        points.push({
          x: (x - width / 2) / width,
          y: (y - height / 2) / height,
          z: depth / 4096
        });
      }
    }
  }
  
  return points;
}

function calculateDepthStats(buffer: number[]) {
  let min = Infinity;
  let max = -Infinity;
  let sum = 0;
  let count = 0;
  
  for (const depth of buffer) {
    if (depth > 0) {
      min = Math.min(min, depth);
      max = Math.max(max, depth);
      sum += depth;
      count++;
    }
  }
  
  return {
    min,
    max,
    average: count > 0 ? sum / count : 0,
    validPixels: count
  };
}

function mapGestureToAction(gestureType: string): string {
  const gestureMap: Record<string, string> = {
    'swipe_left': 'previous_photo',
    'swipe_right': 'next_photo',
    'wave': 'open_menu',
    'thumbs_up': 'confirm',
    'thumbs_down': 'cancel',
    'push': 'capture'
  };
  
  return gestureMap[gestureType] || 'unknown';
}
