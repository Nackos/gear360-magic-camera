import { Smile, Droplet, Circle, Waves, Eye } from "lucide-react";

const CameraControls = () => {
  const controls = [
    { icon: Smile, label: "On", value: "", active: true },
    { icon: Droplet, label: "2", value: "" },
    { icon: Circle, label: "0", value: "" },
    { icon: Waves, label: "0", value: "" },
    { icon: Eye, label: "0", value: "" },
  ];

  return (
    <div className="px-6 pb-4">
      {/* Controls Row */}
      <div className="flex items-center justify-center gap-8 mb-4">
        {controls.map((control, index) => (
          <button
            key={index}
            className={`flex flex-col items-center gap-1 ${
              control.active ? "text-primary" : "text-foreground"
            }`}
          >
            <div
              className={`w-12 h-12 rounded-full flex items-center justify-center ${
                control.active
                  ? "bg-primary text-background"
                  : "border-2 border-foreground"
              }`}
            >
              <control.icon className="w-5 h-5" />
            </div>
            <span className="text-xs">{control.label}</span>
          </button>
        ))}
      </div>

      {/* Finesse Slider */}
      <div className="space-y-2">
        <div className="flex items-center justify-between px-4">
          <span className="text-sm text-foreground">Finesse</span>
          <span className="text-sm text-primary font-medium">2</span>
        </div>
        <div className="relative h-12 flex items-center justify-center px-8">
          <div className="absolute inset-x-8 h-1 bg-muted rounded-full" />
          <div className="flex items-center justify-between w-full px-8 relative z-10">
            {[...Array(9)].map((_, i) => (
              <div
                key={i}
                className={`w-0.5 ${
                  i === 4 ? "h-8 bg-primary" : "h-4 bg-muted-foreground"
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CameraControls;
