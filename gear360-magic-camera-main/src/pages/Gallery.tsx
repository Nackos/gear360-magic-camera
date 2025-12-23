import { useState, useEffect } from "react";
import { ArrowLeft, Play, Image, Download, Share2, Trash2, Filter, Search, SortAsc, SortDesc } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import ImageViewer360 from "@/components/ImageViewer360";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { BottomRightMenu } from "@/components/BottomRightMenu";
import sample360 from "@/assets/360-sample.jpg";

interface MediaItem {
  id: number;
  type: 'photo' | 'video';
  thumbnail: string;
  dataUrl: string;
  mode: string;
  title: string;
  date: string;
  size: string;
  sizeBytes: number;
  createdAt: Date;
  duration?: string;
}

const Gallery = () => {
  const { toast } = useToast();
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);

  useEffect(() => {
    // Charger les médias depuis localStorage
    const loadGalleryItems = () => {
      const savedItems = JSON.parse(localStorage.getItem('galleryItems') || '[]');
      setMediaItems(savedItems.map((item: MediaItem) => ({
        ...item,
        createdAt: new Date(item.createdAt),
      })) as MediaItem[]);
    };

    loadGalleryItems();

    // Écouter les changements dans localStorage
    const handleStorageChange = () => {
      loadGalleryItems();
    };

    window.addEventListener('storage', handleStorageChange);

    // Rafraîchir toutes les 2 secondes pour détecter les nouvelles captures
    const interval = setInterval(loadGalleryItems, 2000);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, []);

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<MediaItem | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("date");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [filterType, setFilterType] = useState("all");
  const [selectedImage, setSelectedImage] = useState<MediaItem | null>(null);

  const handleDeleteClick = (item: MediaItem) => {
    setItemToDelete(item);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (itemToDelete) {
      const updatedItems = mediaItems.filter(item => item.id !== itemToDelete.id);
      setMediaItems(updatedItems);
      localStorage.setItem('galleryItems', JSON.stringify(updatedItems));
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
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-md border-b border-border">
        <div className="flex items-center justify-between px-4 py-4">
          <Link to="/">
            <Button variant="ghost" size="icon" className="rounded-full">
              <ArrowLeft className="w-6 h-6" />
            </Button>
          </Link>
          <h1 className="text-xl font-semibold">Galerie</h1>
          <div className="w-10" />
        </div>
      </div>

      {/* Main Content */}
      <div className="p-4 space-y-6">
        {/* Galerie de Médias Header */}
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Galerie de Médias</h2>
          <Badge variant="secondary">{filteredAndSortedItems.length} éléments</Badge>
        </div>

        {/* Organisateur de fichiers */}
        <div className="space-y-4 p-4 bg-muted/50 rounded-lg">
          <div className="flex items-center gap-2 text-sm font-medium">
            <Filter className="w-4 h-4" />
            Organisateur de fichiers
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
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

        {/* Gallery Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {filteredAndSortedItems.map((item) => (
            <Card key={item.id} className="overflow-hidden group hover:shadow-lg transition-shadow">
              <div
                className="relative aspect-video cursor-pointer"
                onClick={() => setSelectedImage(item)}
              >
                <img
                  src={item.thumbnail}
                  alt={item.title}
                  className="w-full h-full object-cover"
                />

                {/* Type Indicator */}
                <div className="absolute top-2 left-2">
                  {item.type === "video" ? (
                    <div className="bg-black/70 backdrop-blur-sm p-1.5 rounded">
                      <Play className="w-4 h-4 text-white" />
                    </div>
                  ) : (
                    <div className="bg-black/70 backdrop-blur-sm p-1.5 rounded">
                      <Image className="w-4 h-4 text-white" />
                    </div>
                  )}
                </div>

                {/* Duration for videos */}
                {item.duration && (
                  <div className="absolute bottom-2 right-2">
                    <div className="bg-black/70 backdrop-blur-sm px-2 py-1 rounded text-white text-xs font-medium">
                      {item.duration}
                    </div>
                  </div>
                )}

                {/* Hover Actions */}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <div className="flex gap-2">
                    {item.dataUrl && (
                      <a href={item.dataUrl} download={`${item.title}.${item.type === 'video' ? 'webm' : 'jpg'}`}>
                        <Button size="icon" variant="secondary" className="rounded-full">
                          <Download className="w-4 h-4" />
                        </Button>
                      </a>
                    )}
                    <Button
                      size="icon"
                      variant="secondary"
                      className="rounded-full"
                      onClick={() => {
                        if (navigator.share && item.dataUrl) {
                          fetch(item.dataUrl)
                            .then(res => res.blob())
                            .then(blob => {
                              const file = new File([blob], `${item.title}.${item.type === 'video' ? 'webm' : 'jpg'}`, { type: blob.type });
                              navigator.share({ files: [file], title: item.title });
                            });
                        }
                      }}
                    >
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

        {/* Load More Button */}
        <div className="flex justify-center pb-20">
          <Button variant="outline" className="w-full max-w-md">
            Charger plus de médias
          </Button>
        </div>
      </div>

      {/* Bottom Right Menu */}
      <BottomRightMenu />

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

      {/* Image Viewer 360 */}
      {selectedImage && (
        <ImageViewer360
          image={selectedImage}
          onClose={() => setSelectedImage(null)}
          onDelete={() => {
            handleDeleteClick(selectedImage);
            setSelectedImage(null);
          }}
        />
      )}
    </div>
  );
};

export default Gallery;
