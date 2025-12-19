import { Smartphone, Camera } from "lucide-react";

const ConnectionIllustration = () => {
  return (
    <div className="flex items-center justify-center gap-6 py-12">
      <div className="relative">
        <div className="w-20 h-36 border-[3px] border-primary rounded-xl flex items-center justify-center">
          <Smartphone className="w-8 h-8 text-primary" strokeWidth={2.5} />
        </div>
      </div>
      
      <div className="flex gap-2">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className="w-2 h-2 rounded-full bg-primary animate-pulse"
            style={{
              animationDelay: `${i * 0.2}s`,
              opacity: 0.6 + (i * 0.1)
            }}
          />
        ))}
      </div>
      
      <div className="relative">
        <div className="w-16 h-36 border-[3px] border-primary rounded-full flex items-center justify-center">
          <Camera className="w-8 h-8 text-primary" strokeWidth={2.5} />
        </div>
      </div>
    </div>
  );
};

export default ConnectionIllustration;
