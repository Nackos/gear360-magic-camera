import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Play, Image, Download, Share2, Trash2, Filter, Search, SortAsc, SortDesc } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import sample360 from "@/assets/360-sample.jpg";

export const MediaGallery = () => {
  const { toast } = useToast();
  const [mediaItems, setMediaItems] = useState([
    {
      id: 1,
      type: "photo",
      thumbnail: sample360,
      title: "Mountain View 360°",
      date: "Today, 2:30 PM",
      size: "12.4 MB",
      sizeBytes: 12400000,
      createdAt: new Date("2024-01-15T14:30:00"),
    },
    {
      id: 2,
      type: "video",
      thumbnail: sample360,
      title: "Sunset Timelapse",
      date: "Today, 1:15 PM",
      size: "45.2 MB",
      sizeBytes: 45200000,
      duration: "0:45",
      createdAt: new Date("2024-01-15T13:15:00"),
    },
    {
      id: 3,
      type: "photo",
      thumbnail: sample360,
      title: "Beach Panorama",
      date: "Yesterday, 5:20 PM",
      size: "8.7 MB",
      sizeBytes: 8700000,
      createdAt: new Date("2024-01-14T17:20:00"),
    },
    {
      id: 4,
      type: "video",
      thumbnail: sample360,
      title: "City Tour 360°",
      date: "Yesterday, 3:45 PM",
      size: "128.5 MB",
      sizeBytes: 128500000,
      duration: "2:30",
      createdAt: new Date("2024-01-14T15:45:00"),
    },
  ]);

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("date");
  const [sortOrder, setSortOrder] = useState("desc");
  const [filterType, setFilterType] = useState("all");

  const handleDeleteClick = (item) => {
    setItemToDelete(item);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (itemToDelete) {
      setMediaItems(mediaItems.filter(item => item.id !== itemToDelete.id));
      toast({
        title: "Média supprimé",
        description: `${itemToDelete.title} a été supprimé avec succès.`,
      });
      setDeleteDialogOpen(false);
      setItemToDelete(null);
    }
  };

  const cancelDelete = () => {
    setDeleteDialogOpen(false);
    setItemToDelete(null);
  };

  // Filtrage et tri des médias
  const filteredAndSortedItems = mediaItems
    .filter(item => {
      const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = filterType === "all" || item.type === filterType;
      return matchesSearch && matchesType;
    })
    .sort((a, b) => {
      let compareValue = 0;
      
      switch (sortBy) {
        case "name":
          compareValue = a.title.localeCompare(b.title);
          break;
        case "size":
          compareValue = a.sizeBytes - b.sizeBytes;
          break;
        case "date":
        default:
          compareValue = a.createdAt.getTime() - b.createdAt.getTime();
          break;
      }
      
      return sortOrder === "asc" ? compareValue : -compareValue;
    });

  return (
    <Card className="p-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Galerie de Médias</h3>
          <Badge variant="secondary">{filteredAndSortedItems.length} éléments</Badge>
        </div>

        {/* Organisateur de fichiers */}
        <div className="space-y-4 p-4 bg-muted/50 rounded-lg">
          <div className="flex items-center gap-2 text-sm font-medium">
            <Filter className="w-4 h-4" />
            Organisateur de fichiers
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Recherche */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>

            {/* Filtre par type */}
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger>
                <SelectValue placeholder="Type de média" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les médias</SelectItem>
                <SelectItem value="photo">Photos uniquement</SelectItem>
                <SelectItem value="video">Vidéos uniquement</SelectItem>
              </SelectContent>
            </Select>

            {/* Tri par */}
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger>
                <SelectValue placeholder="Trier par" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="date">Date de création</SelectItem>
                <SelectItem value="name">Nom</SelectItem>
                <SelectItem value="size">Taille</SelectItem>
              </SelectContent>
            </Select>

            {/* Ordre de tri */}
            <Button
              variant="outline"
              onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
              className="flex items-center gap-2"
            >
              {sortOrder === "asc" ? (
                <SortAsc className="w-4 h-4" />
              ) : (
                <SortDesc className="w-4 h-4" />
              )}
              {sortOrder === "asc" ? "Croissant" : "Décroissant"}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {filteredAndSortedItems.map((item) => (
            <Card key={item.id} className="overflow-hidden group hover:shadow-lg transition-shadow">
              <div className="relative aspect-video">
                <img
                  src={item.thumbnail}
                  alt={item.title}
                  className="w-full h-full object-cover"
                />
                
                {/* Type Indicator */}
                <div className="absolute top-2 left-2">
                  {item.type === "video" ? (
                    <div className="bg-black/70 backdrop-blur-sm p-1 rounded">
                      <Play className="w-4 h-4 text-white" />
                    </div>
                  ) : (
                    <div className="bg-black/70 backdrop-blur-sm p-1 rounded">
                      <Image className="w-4 h-4 text-white" />
                    </div>
                  )}
                </div>

                {/* Duration for videos */}
                {item.duration && (
                  <div className="absolute bottom-2 right-2">
                    <div className="bg-black/70 backdrop-blur-sm px-2 py-1 rounded text-white text-xs">
                      {item.duration}
                    </div>
                  </div>
                )}

                {/* Hover Actions */}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <div className="flex gap-2">
                    <Button size="icon" variant="secondary" className="rounded-full">
                      <Play className="w-4 h-4" />
                    </Button>
                    <Button size="icon" variant="secondary" className="rounded-full">
                      <Download className="w-4 h-4" />
                    </Button>
                    <Button size="icon" variant="secondary" className="rounded-full">
                      <Share2 className="w-4 h-4" />
                    </Button>
                    <Button 
                      size="icon" 
                      variant="destructive" 
                      className="rounded-full"
                      onClick={() => handleDeleteClick(item)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>

              <div className="p-3">
                <h4 className="font-medium text-sm mb-1">{item.title}</h4>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>{item.date}</span>
                  <span>{item.size}</span>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {filteredAndSortedItems.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <Image className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>Aucun média trouvé</p>
            <p className="text-sm">Essayez de modifier vos critères de recherche ou de filtre</p>
          </div>
        )}

        <div className="flex justify-center">
          <Button variant="outline" className="w-full">
            Charger plus de médias
          </Button>
        </div>
      </div>

      {/* Dialog de confirmation de suppression */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmer la suppression</DialogTitle>
            <DialogDescription>
              Êtes-vous sûr de vouloir supprimer "{itemToDelete?.title}" ?
              Cette action est irréversible.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={cancelDelete}>
              Annuler
            </Button>
            <Button variant="destructive" onClick={confirmDelete}>
              Supprimer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
};