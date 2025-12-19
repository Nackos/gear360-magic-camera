import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreVertical, Info } from "lucide-react";

export const BottomRightMenu = () => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="fixed bottom-4 right-4 z-50 bg-black/40 hover:bg-black/60 text-white backdrop-blur-sm border border-white/20 rounded-full w-12 h-12"
        >
          <MoreVertical className="h-5 w-5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        align="end" 
        className="bg-black/90 border-white/20 text-white backdrop-blur-md mb-2"
      >
        <Link to="/device-info">
          <DropdownMenuItem 
            className="hover:bg-white/10 cursor-pointer flex items-center gap-2"
          >
            <Info className="h-4 w-4 text-blue-500" />
            Informations de l'appareil
          </DropdownMenuItem>
        </Link>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
