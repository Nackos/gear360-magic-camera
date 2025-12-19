import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Camera from "./pages/Camera";
import Gallery from "./pages/Gallery";
import Settings from "./pages/Settings";
import LiveBroadcast from "./pages/LiveBroadcast";
import Modes from "./pages/Modes";
import DeviceInfo from "./pages/DeviceInfo";
import Gear360Control from "./pages/Gear360Control";
import AI3DStudio from "./pages/AI3DStudio";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/camera" element={<Camera />} />
          <Route path="/gallery" element={<Gallery />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/live" element={<LiveBroadcast />} />
          <Route path="/modes" element={<Modes />} />
          <Route path="/device-info" element={<DeviceInfo />} />
          <Route path="/gear360-control" element={<Gear360Control />} />
          <Route path="/ai-3d-studio" element={<AI3DStudio />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
