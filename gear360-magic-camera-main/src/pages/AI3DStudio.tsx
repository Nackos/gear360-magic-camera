import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { AI3DGenerator } from "@/components/AI3DGenerator";

const AI3DStudio = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <header className="flex items-center gap-4 px-6 py-4 border-b border-border bg-card sticky top-0 z-50">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate(-1)}
          className="rounded-full"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <h1 className="text-xl font-bold text-foreground">Studio 3D IA</h1>
      </header>

      <main className="container max-w-4xl mx-auto p-6">
        <AI3DGenerator />
      </main>
    </div>
  );
};

export default AI3DStudio;