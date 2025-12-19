import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Info } from "lucide-react";
import { DeviceInfoDialog } from "./DeviceInfoDialog";

export const DeviceStatus = () => {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon"
          className="relative hover:bg-blue-500/10"
        >
          <Info className="h-6 w-6 text-blue-500 fill-blue-500" />
          <span className="absolute top-0.5 right-0.5 w-2 h-2 bg-green-500 rounded-full animate-pulse border border-white" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md p-0 border-0 overflow-hidden bg-transparent">
        <DialogHeader className="sr-only">
          <DialogTitle>Informations de l'appareil</DialogTitle>
        </DialogHeader>
        <DeviceInfoDialog />
      </DialogContent>
    </Dialog>
  );
};