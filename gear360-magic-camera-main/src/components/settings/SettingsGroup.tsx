import { LucideIcon } from "lucide-react";

interface SettingsGroupProps {
  title: string;
  icon: LucideIcon;
  children: React.ReactNode;
}

const SettingsGroup = ({ title, icon: Icon, children }: SettingsGroupProps) => {
  return (
    <div className="bg-card rounded-2xl p-4 space-y-4">
      <div className="flex items-center gap-2 pb-2 border-b border-border">
        <Icon className="w-5 h-5 text-primary" />
        <h2 className="text-sm font-semibold">{title}</h2>
      </div>
      <div className="space-y-3">{children}</div>
    </div>
  );
};

export default SettingsGroup;
