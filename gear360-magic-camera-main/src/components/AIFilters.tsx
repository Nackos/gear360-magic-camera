import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Wand2, User, Mountain, Sparkles, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

interface AIFiltersProps {
  isActive: boolean;
  videoRef: React.RefObject<HTMLVideoElement>;
  settings: {
    aiTransformation: boolean;
    backgroundReplacement: boolean;
  };
}

export const AIFilters = ({ isActive, videoRef, settings }: AIFiltersProps) => {
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const filters = [
    {
      id: 'face-transform',
      name: 'Transformation visage',
      icon: User,
      enabled: settings.aiTransformation,
      description: 'Modifier l\'apparence du visage'
    },
    {
      id: 'body-transform',
      name: 'Transformation corps',
      icon: User,
      enabled: settings.aiTransformation,
      description: 'Changer l\'apparence corporelle'
    },
    {
      id: 'background-beach',
      name: 'Plage tropicale',
      icon: Mountain,
      enabled: settings.backgroundReplacement,
      description: 'Arrière-plan plage'
    },
    {
      id: 'background-studio',
      name: 'Studio photo',
      icon: Sparkles,
      enabled: settings.backgroundReplacement,
      description: 'Arrière-plan studio pro'
    },
    {
      id: 'background-space',
      name: 'Espace cosmique',
      icon: Sparkles,
      enabled: settings.backgroundReplacement,
      description: 'Arrière-plan spatial'
    }
  ];

  const applyFilter = async (filterId: string) => {
    const filter = filters.find(f => f.id === filterId);
    if (!filter || !filter.enabled) {
      toast.error('Cette fonctionnalité est désactivée dans les paramètres');
      return;
    }

    setIsProcessing(true);
    setActiveFilter(filterId);

    // Simulation du traitement IA
    setTimeout(() => {
      setIsProcessing(false);
      toast.success(`Filtre "${filter.name}" appliqué`);
    }, 1500);
  };

  const removeFilter = () => {
    setActiveFilter(null);
    toast.info('Filtres désactivés');
  };

  if (!isActive) return null;

  return (
    <div className="absolute bottom-40 left-4 right-4">
      <Card className="p-4 bg-black/80 backdrop-blur-md border-primary/30">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Wand2 className="w-5 h-5 text-primary" />
              <span className="text-sm font-semibold text-white">Filtres IA</span>
            </div>
            {activeFilter && (
              <Button
                size="sm"
                variant="ghost"
                onClick={removeFilter}
                className="h-8"
              >
                <RefreshCw className="w-4 h-4 mr-1" />
                Réinitialiser
              </Button>
            )}
          </div>

          {!settings.aiTransformation && !settings.backgroundReplacement ? (
            <div className="text-xs text-muted-foreground">
              Activez les transformations IA dans les paramètres
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              {filters.map((filter) => {
                const Icon = filter.icon;
                return (
                  <Button
                    key={filter.id}
                    variant={activeFilter === filter.id ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => applyFilter(filter.id)}
                    disabled={!filter.enabled || isProcessing}
                    className="flex flex-col h-auto py-2 px-2 gap-1"
                  >
                    <Icon className="w-4 h-4" />
                    <span className="text-xs">{filter.name}</span>
                    {!filter.enabled && (
                      <Badge variant="secondary" className="text-xs py-0 px-1">
                        Désactivé
                      </Badge>
                    )}
                  </Button>
                );
              })}
            </div>
          )}

          {isProcessing && (
            <div className="flex items-center justify-center gap-2 py-2">
              <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              <span className="text-xs text-primary">Traitement IA en cours...</span>
            </div>
          )}

          {activeFilter && (
            <Badge variant="secondary" className="w-full bg-primary/20 text-primary text-xs py-1">
              Filtre actif: {filters.find(f => f.id === activeFilter)?.name}
            </Badge>
          )}
        </div>
      </Card>
    </div>
  );
};
