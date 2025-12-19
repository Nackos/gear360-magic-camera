import { Switch } from "@/components/ui/switch";
import { ChevronRight } from "lucide-react";

interface SettingsItemProps {
  label: string;
  description?: string;
  defaultChecked?: boolean;
  type?: "switch" | "link" | "action";
  actionText?: string;
  onClick?: () => void;
  onChange?: (checked: boolean) => void;
}

const SettingsItem = ({ 
  label, 
  description, 
  defaultChecked = false,
  type = "switch",
  actionText,
  onClick,
  onChange
}: SettingsItemProps) => {
  if (type === "link") {
    return (
      <div 
        className="flex items-center justify-between cursor-pointer hover:opacity-80 transition-opacity py-2"
        onClick={onClick}
      >
        <span className="text-sm">{label}</span>
        <ChevronRight className="w-5 h-5 text-muted-foreground" />
      </div>
    );
  }

  if (type === "action") {
    return (
      <div className="py-2">
        <div className="text-sm">{label}</div>
        {actionText && (
          <div className="text-sm text-primary mt-1">{actionText}</div>
        )}
      </div>
    );
  }

  return (
    <div className="flex items-start justify-between py-2">
      <div className="flex-1 pr-4">
        <div className="text-sm">{label}</div>
        {description && (
          <div className="text-xs text-muted-foreground mt-1">{description}</div>
        )}
      </div>
      <Switch 
        checked={defaultChecked} 
        onCheckedChange={onChange}
      />
    </div>
  );
};

export default SettingsItem;
