import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface MenuItemProps {
  icon: LucideIcon;
  title: string;
  description: string;
  onClick?: () => void;
  className?: string;
}

const MenuItem = ({ icon: Icon, title, description, onClick, className }: MenuItemProps) => {
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full flex items-center gap-6 p-6 bg-card hover:bg-muted/50 transition-all duration-200 border-b border-border active:scale-[0.98]",
        className
      )}
    >
      <div className="flex-shrink-0 w-12 h-12 flex items-center justify-center">
        <Icon className="w-8 h-8 text-primary" strokeWidth={1.5} />
      </div>
      <div className="flex-1 text-left">
        <h3 className="text-lg font-semibold text-foreground mb-1">{title}</h3>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
    </button>
  );
};

export default MenuItem;
