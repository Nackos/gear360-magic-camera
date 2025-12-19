import { Download } from "lucide-react";

interface ModeCardProps {
  label: string;
  icon: string;
  badge?: boolean;
}

const ModeCard = ({ label, icon, badge }: ModeCardProps) => {
  return (
    <button className="relative flex flex-col items-center gap-3 p-4 rounded-2xl bg-card hover:bg-card/80 transition-colors group">
      {/* Icon Container */}
      <div className="relative w-16 h-16 rounded-full bg-secondary flex items-center justify-center group-hover:scale-105 transition-transform">
        <span className="text-2xl">{icon}</span>
        {badge && (
          <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-primary flex items-center justify-center">
            <Download className="w-3 h-3 text-background" />
          </div>
        )}
      </div>

      {/* Label */}
      <span className="text-xs text-center font-medium leading-tight">
        {label}
      </span>
    </button>
  );
};

export default ModeCard;
