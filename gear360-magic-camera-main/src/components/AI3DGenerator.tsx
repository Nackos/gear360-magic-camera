import { useState, useRef, Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Environment, PerspectiveCamera } from "@react-three/drei";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Upload, Wand2, Video, Camera as CameraIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Composant 3D de démonstration
const Scene3D = () => {
  return (
    <>
      <PerspectiveCamera makeDefault position={[0, 2, 5]} />
      <OrbitControls enableDamping dampingFactor={0.05} />
      <Environment preset="sunset" />
      
      {/* Lumières */}
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 5]} intensity={1} />
      
      {/* Sol */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1, 0]} receiveShadow>
        <planeGeometry args={[10, 10]} />
        <meshStandardMaterial color="#4a5568" />
      </mesh>
      
      {/* Cubes d'exemple */}
      <mesh position={[-1.5, 0, 0]} castShadow>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="#fbbf24" metalness={0.3} roughness={0.4} />
      </mesh>
      
      <mesh position={[1.5, 0, 0]} castShadow>
        <sphereGeometry args={[0.7, 32, 32]} />
        <meshStandardMaterial color="#60a5fa" metalness={0.7} roughness={0.2} />
      </mesh>
      
      <mesh position={[0, 1.5, -1]} castShadow>
        <coneGeometry args={[0.6, 1.2, 32]} />
        <meshStandardMaterial color="#f87171" metalness={0.5} roughness={0.3} />
      </mesh>
    </>
  );
};

export const AI3DGenerator = () => {
  const [textPrompt, setTextPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedScene, setGeneratedScene] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const generateFrom2D = async (file: File) => {
    setIsGenerating(true);
    try {
      // Simulation de génération 3D (en production, intégrer une vraie API IA)
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      const url = URL.createObjectURL(file);
      setGeneratedScene(url);
      
      toast({
        title: "Scène 3D générée !",
        description: "Votre environnement immersif est prêt.",
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de générer la scène 3D",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const generateFromText = async () => {
    if (!textPrompt.trim()) {
      toast({
        title: "Texte requis",
        description: "Veuillez entrer une description",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    try {
      // Simulation de génération 3D depuis texte
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // En production, appeler une API comme Meshy.ai, Luma AI, ou un modèle personnalisé
      setGeneratedScene("/placeholder.svg");
      
      toast({
        title: "Scène 3D générée !",
        description: `Monde créé: "${textPrompt.slice(0, 30)}..."`,
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de générer la scène 3D",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      generateFrom2D(file);
    }
  };

  return (
    <Card className="p-6">
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold mb-2">Générateur 3D IA</h2>
          <p className="text-sm text-muted-foreground">
            Créez des espaces immersifs 3D à partir d'images, vidéos ou descriptions textuelles
          </p>
        </div>

        <Tabs defaultValue="text" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="text">Texte</TabsTrigger>
            <TabsTrigger value="image">Image 2D</TabsTrigger>
            <TabsTrigger value="video">Vidéo</TabsTrigger>
          </TabsList>

          <TabsContent value="text" className="space-y-4">
            <div>
              <Label htmlFor="prompt">Description de la scène 3D</Label>
              <Textarea
                id="prompt"
                placeholder="Ex: Une forêt mystérieuse avec des arbres lumineux et un lac cristallin..."
                value={textPrompt}
                onChange={(e) => setTextPrompt(e.target.value)}
                className="min-h-32 mt-2"
              />
            </div>
            <Button 
              onClick={generateFromText} 
              disabled={isGenerating}
              className="w-full"
            >
              <Wand2 className="w-4 h-4 mr-2" />
              {isGenerating ? "Génération en cours..." : "Générer la scène 3D"}
            </Button>
          </TabsContent>

          <TabsContent value="image" className="space-y-4">
            <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
              <CameraIcon className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-sm text-muted-foreground mb-4">
                Uploadez une image 2D pour générer un environnement 3D
              </p>
              <Button 
                onClick={() => fileInputRef.current?.click()}
                disabled={isGenerating}
              >
                <Upload className="w-4 h-4 mr-2" />
                Choisir une image
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="video" className="space-y-4">
            <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
              <input
                ref={videoInputRef}
                type="file"
                accept="video/*"
                onChange={handleFileUpload}
                className="hidden"
              />
              <Video className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-sm text-muted-foreground mb-4">
                Uploadez une vidéo pour extraire et générer un monde 3D
              </p>
              <Button 
                onClick={() => videoInputRef.current?.click()}
                disabled={isGenerating}
              >
                <Upload className="w-4 h-4 mr-2" />
                Choisir une vidéo
              </Button>
            </div>
          </TabsContent>
        </Tabs>

        {/* Preview 3D Scene avec React Three Fiber */}
        {generatedScene && (
          <div className="border border-border rounded-lg p-4 bg-muted/50">
            <h3 className="font-semibold mb-2">Aperçu de la scène 3D</h3>
            <div className="aspect-video bg-background rounded-lg overflow-hidden">
              <Suspense fallback={
                <div className="w-full h-full flex items-center justify-center bg-muted">
                  <p className="text-muted-foreground">Chargement de la scène 3D...</p>
                </div>
              }>
                <Canvas shadows>
                  <Scene3D />
                </Canvas>
              </Suspense>
            </div>
            <div className="flex gap-2 mt-4">
              <Button variant="outline" className="flex-1">
                Modifier
              </Button>
              <Button className="flex-1">
                Exporter
              </Button>
            </div>
          </div>
        )}

        {isGenerating && (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        )}
      </div>
    </Card>
  );
};