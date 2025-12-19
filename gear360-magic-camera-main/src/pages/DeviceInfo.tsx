import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Thermometer, HardDrive, Wifi, Battery, Bluetooth, ArrowLeft } from "lucide-react";
import { gear360Service } from "@/services/gear360Service";
import cameraImage from "@/assets/gear360-camera.jpg";

export default function DeviceInfo() {
  const [device, setDevice] = useState(gear360Service.connectedDevice);
  const [mediaStats, setMediaStats] = useState({
    photos: 24,
    videos: 8,
    recordingTime: "2.1h"
  });

  useEffect(() => {
    const updateDeviceInfo = () => {
      setDevice(gear360Service.connectedDevice);
    };

    gear360Service.on('deviceConnected', updateDeviceInfo);
    gear360Service.on('deviceDisconnected', updateDeviceInfo);

    return () => {
      gear360Service.off('deviceConnected', updateDeviceInfo);
      gear360Service.off('deviceDisconnected', updateDeviceInfo);
    };
  }, []);

  const batteryLevel = device?.batteryLevel || 87;
  const storageUsed = 12.4;
  const storageTotal = 32;
  const storagePercent = (storageUsed / storageTotal) * 100;
  const temperature = 38;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 via-blue-600 to-blue-700 p-6">
      <div className="max-w-2xl mx-auto">
        {/* Header with back button */}
        <div className="mb-6">
          <Link to="/">
            <Button
              variant="ghost"
              size="icon"
              className="text-white hover:bg-white/20"
            >
              <ArrowLeft className="h-6 w-6" />
            </Button>
          </Link>
        </div>

        {/* Device Info Card */}
        <Card className="p-8 bg-white/10 backdrop-blur-md text-white border-0 shadow-2xl">
          <div className="space-y-8">
            {/* Device Header */}
            <div className="flex flex-col items-center gap-4">
              <div className="w-32 h-32 rounded-3xl overflow-hidden shadow-2xl bg-white p-4">
                <img
                  src={cameraImage}
                  alt="Samsung Gear 360"
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="text-center">
                <h1 className="font-bold text-4xl mb-3">Samsung Gear 360</h1>
                <Badge className="bg-blue-400/50 text-white border-0 px-8 py-2 text-lg">
                  {device?.status === 'connected' ? 'Connected' : 'Disconnected'}
                </Badge>
              </div>
            </div>

            {/* Connection Status */}
            <div className="space-y-6 pt-4">
              <div className="flex items-center justify-between text-lg">
                <div className="flex items-center gap-3">
                  <Wifi className="w-6 h-6" />
                  <span className="font-medium">WiFi Signal</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex space-x-1.5">
                    {[1, 2, 3, 4].map((bar) => (
                      <div
                        key={bar}
                        className={`w-2 h-5 rounded-full ${
                          bar <= 3 ? 'bg-white' : 'bg-white/30'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="font-semibold">Strong</span>
                </div>
              </div>

              <div className="flex items-center justify-between text-lg">
                <div className="flex items-center gap-3">
                  <Bluetooth className="w-6 h-6" />
                  <span className="font-medium">Bluetooth</span>
                </div>
                <span className="font-semibold">
                  {device?.connectionType === 'bluetooth' ? 'Connected' : 'Connected'}
                </span>
              </div>
            </div>

            {/* Device Stats */}
            <div className="space-y-6 pt-4">
              <div>
                <div className="flex items-center justify-between mb-3 text-lg">
                  <div className="flex items-center gap-3">
                    <Battery className="w-6 h-6" />
                    <span className="font-medium">Battery</span>
                  </div>
                  <span className="font-bold text-2xl">{batteryLevel}%</span>
                </div>
                <Progress 
                  value={batteryLevel} 
                  className="bg-white/20 h-4 rounded-full"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-3 text-lg">
                  <div className="flex items-center gap-3">
                    <HardDrive className="w-6 h-6" />
                    <span className="font-medium">Storage</span>
                  </div>
                  <span className="font-bold text-2xl">{storageUsed} GB / {storageTotal} GB</span>
                </div>
                <Progress 
                  value={storagePercent} 
                  className="bg-white/20 h-4 rounded-full"
                />
              </div>

              <div className="flex items-center justify-between py-3 text-lg">
                <div className="flex items-center gap-3">
                  <Thermometer className="w-6 h-6" />
                  <span className="font-medium">Temperature</span>
                </div>
                <span className="font-bold text-3xl">{temperature}°C</span>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-3 gap-6 pt-6 border-t border-white/20">
              <div className="text-center">
                <div className="text-5xl font-bold mb-2">{mediaStats.photos}</div>
                <div className="text-lg text-white/90">Photos</div>
              </div>
              <div className="text-center">
                <div className="text-5xl font-bold mb-2">{mediaStats.videos}</div>
                <div className="text-lg text-white/90">Videos</div>
              </div>
              <div className="text-center">
                <div className="text-5xl font-bold mb-2">{mediaStats.recordingTime}</div>
                <div className="text-lg text-white/90">Recording</div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
