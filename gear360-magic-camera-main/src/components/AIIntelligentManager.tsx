import { useState, useEffect, useCallback } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Brain, Lightbulb, TrendingUp, Zap, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

interface AIOptimization {
  type: 'lighting' | 'scene' | 'filter' | 'mode' | 'timing';
  suggestion: string;
  action: () => void;
  priority: 'low' | 'medium' | 'high';
  confidence: number;
}

interface AIIntelligentManagerProps {
  currentMode: string;
  facesDetected: number;
  currentFilter: string | null;
  onModeChange: (mode: string) => void;
  onFilterApply: (filter: string) => void;
  onSettingsChange: (setting: string, value: unknown) => void;
  isActive: boolean;
}

export const AIIntelligentManager = ({
  currentMode,
  facesDetected,
  currentFilter,
  onModeChange,
  onFilterApply,
  onSettingsChange,
  isActive
}: AIIntelligentManagerProps) => {
  const [optimizations, setOptimizations] = useState<AIOptimization[]>([]);
  const [autoMode, setAutoMode] = useState(false);
  const [analysisData, setAnalysisData] = useState({
    timeOfDay: 'jour',
    lighting: 'normal',
    motion: 'stable',
    subjects: 0
  });

  useEffect(() => {
    if (!isActive) return;

    const analyzeEnvironment = () => {
      const hour = new Date().getHours();
      const timeOfDay = hour >= 6 && hour < 12 ? 'matin' :
        hour >= 12 && hour < 18 ? 'après-midi' :
          hour >= 18 && hour < 21 ? 'soirée' : 'nuit';

      setAnalysisData(prev => ({
        ...prev,
        timeOfDay,
        subjects: facesDetected
      }));

      generateOptimizations(timeOfDay, facesDetected);
    };

    analyzeEnvironment();
    const interval = setInterval(analyzeEnvironment, 10000);

    return () => clearInterval(interval);
  }, [isActive, facesDetected, generateOptimizations]);

  const generateOptimizations = useCallback((timeOfDay: string, faces: number) => {
    const newOptimizations: AIOptimization[] = [];

    // Optimisation basée sur l'heure
    if (timeOfDay === 'nuit' && currentMode !== 'video') {
      newOptimizations.push({
        type: 'lighting',
        suggestion: 'Mode nuit recommandé pour de meilleures photos',
        action: () => onSettingsChange('nightMode', true),
        priority: 'high',
        confidence: 0.9
      });
    }

    // Optimisation basée sur le nombre de visages
    if (faces >= 2 && currentFilter !== 'group') {
      newOptimizations.push({
        type: 'scene',
        suggestion: 'Mode groupe détecté, appliquer le filtre adapté',
        action: () => onFilterApply('group'),
        priority: 'medium',
        confidence: 0.85
      });
    }

    if (faces === 1 && currentFilter !== 'portrait') {
      newOptimizations.push({
        type: 'filter',
        suggestion: 'Portrait détecté, optimiser pour selfie',
        action: () => onFilterApply('portrait'),
        priority: 'medium',
        confidence: 0.8
      });
    }

    // Optimisation temporelle
    if (timeOfDay === 'matin' || timeOfDay === 'soirée') {
      newOptimizations.push({
        type: 'timing',
        suggestion: 'Heure dorée idéale pour photos extérieures',
        action: () => toast.info('Profitez de la lumière naturelle !'),
        priority: 'low',
        confidence: 0.75
      });
    }

    setOptimizations(newOptimizations);

    // Mode auto - applique automatiquement les suggestions prioritaires
    if (autoMode && newOptimizations.length > 0) {
      const highPriority = newOptimizations.find(opt => opt.priority === 'high');
      if (highPriority) {
        highPriority.action();
        toast.success(`Auto-optimisation: ${highPriority.suggestion}`);
      }
    }
  }, [currentMode, currentFilter, onSettingsChange, onFilterApply, autoMode]);

  const applyOptimization = (optimization: AIOptimization) => {
    optimization.action();
    setOptimizations(prev => prev.filter(opt => opt !== optimization));
    toast.success('Optimisation appliquée');
  };

  const getPriorityIcon = (priority: AIOptimization['priority']) => {
    switch (priority) {
      case 'high': return <AlertCircle className="w-4 h-4 text-red-400" />;
      case 'medium': return <TrendingUp className="w-4 h-4 text-yellow-400" />;
      case 'low': return <Lightbulb className="w-4 h-4 text-blue-400" />;
    }
  };

  const getPriorityColor = (priority: AIOptimization['priority']) => {
    switch (priority) {
      case 'high': return 'bg-red-500/20 text-red-300';
      case 'medium': return 'bg-yellow-500/20 text-yellow-300';
      case 'low': return 'bg-blue-500/20 text-blue-300';
    }
  };

  if (!isActive) return null;

  return (
    <Card className="absolute top-4 right-4 w-80 p-4 bg-black/80 backdrop-blur-md border-primary/30">
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Brain className="w-5 h-5 text-primary" />
            <span className="text-sm font-semibold text-white">Gestionnaire IA</span>
          </div>
          <Button
            size="sm"
            variant={autoMode ? 'default' : 'ghost'}
            onClick={() => setAutoMode(!autoMode)}
            className="h-7 px-2"
          >
            <Zap className="w-3 h-3 mr-1" />
            Auto
          </Button>
        </div>

        {/* Données d'analyse */}
        <div className="bg-card/10 rounded-lg p-2 space-y-1">
          <div className="text-xs text-muted-foreground">Analyse environnement</div>
          <div className="grid grid-cols-2 gap-2 text-xs text-white">
            <div>Heure: {analysisData.timeOfDay}</div>
            <div>Lumière: {analysisData.lighting}</div>
            <div>Visages: {analysisData.subjects}</div>
            <div>Mode: {currentMode}</div>
          </div>
        </div>

        {/* Optimisations suggérées */}
        <div className="space-y-2">
          <div className="text-xs text-muted-foreground">
            Optimisations ({optimizations.length})
          </div>

          {optimizations.length === 0 ? (
            <div className="text-xs text-white bg-green-500/10 rounded p-2 text-center">
              ✓ Configuration optimale
            </div>
          ) : (
            optimizations.map((opt, index) => (
              <div key={index} className="bg-card/10 rounded-lg p-2">
                <div className="flex items-start gap-2 mb-2">
                  {getPriorityIcon(opt.priority)}
                  <div className="flex-1">
                    <div className="text-xs text-white">{opt.suggestion}</div>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="secondary" className={`text-xs py-0 ${getPriorityColor(opt.priority)}`}>
                        {opt.priority}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {Math.round(opt.confidence * 100)}%
                      </span>
                    </div>
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => applyOptimization(opt)}
                  className="w-full h-7 text-xs"
                >
                  Appliquer
                </Button>
              </div>
            ))
          )}
        </div>

        {autoMode && (
          <Badge variant="secondary" className="w-full bg-primary/20 text-primary text-xs py-1 justify-center">
            Mode automatique actif
          </Badge>
        )}
      </div>
    </Card>
  );
};
