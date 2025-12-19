import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Thermometer, HardDrive, Wifi, Battery, Bluetooth } from "lucide-react";
import cameraImage from "@/assets/gear360-camera.jpg";

export const DeviceInfoDialog = () => {
  return (
    <Card className="p-6 bg-samsung-gradient text-white border-0 shadow-2xl">
      <div className="space-y-6">
        {/* Device Header */}
        <div className="flex flex-col items-center gap-4">
          <div className="w-24 h-24 rounded-2xl overflow-hidden shadow-2xl bg-white p-3">
            <img
              src={cameraImage}
              alt="Samsung Gear 360"
              className="w-full h-full object-contain"
            />
          </div>
          <div className="text-center">
            <h3 className="font-bold text-2xl mb-2">Samsung Gear 360</h3>
            <Badge variant="secondary" className="bg-white/20 text-white border-0 px-6 py-1">
              Connected
            </Badge>
          </div>
        </div>

        {/* Connection Status */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Wifi className="w-5 h-5" />
              <span>WiFi Signal</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex space-x-1">
                {[1, 2, 3, 4].map((bar) => (
                  <div
                    key={bar}
                    className={`w-1.5 h-4 rounded-full ${
                      bar <= 3 ? 'bg-white' : 'bg-white/30'
                    }`}
                  />
                ))}
              </div>
              <span className="font-semibold">Strong</span>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bluetooth className="w-5 h-5" />
              <span>Bluetooth</span>
            </div>
            <span className="font-semibold">Connected</span>
          </div>
        </div>

        {/* Device Stats */}
        <div className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Battery className="w-5 h-5" />
                <span>Battery</span>
              </div>
              <span className="font-semibold">87%</span>
            </div>
            <Progress value={87} className="bg-white/20 h-3" />
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <HardDrive className="w-5 h-5" />
                <span>Storage</span>
              </div>
              <span className="font-semibold">12.4 GB / 32 GB</span>
            </div>
            <Progress value={38.75} className="bg-white/20 h-3" />
          </div>

          <div className="flex items-center justify-between py-2">
            <div className="flex items-center gap-2">
              <Thermometer className="w-5 h-5" />
              <span>Temperature</span>
            </div>
            <span className="font-semibold text-xl">38°C</span>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-4 pt-4 border-t border-white/20">
          <div className="text-center">
            <div className="text-3xl font-bold">24</div>
            <div className="text-sm text-white/80 mt-1">Photos</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold">8</div>
            <div className="text-sm text-white/80 mt-1">Videos</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold">2.1h</div>
            <div className="text-sm text-white/80 mt-1">Recording</div>
          </div>
        </div>
      </div>
    </Card>
  );
};
