import { Plus, Clock, Globe, Home, HelpCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface SidebarProps {
  className?: string;
}

export default function Sidebar({ className }: SidebarProps) {
  const menuItems = [
    { icon: Plus, label: "New Chat", active: true },
    { icon: Clock, label: "History", active: false },
    { icon: Globe, label: "Language", active: false },
    { icon: Home, label: "Home", active: false },
    { icon: HelpCircle, label: "Help", active: false },
  ];

  return (
    <div className={cn("w-80 bg-navy-900 h-screen flex flex-col", className)}>
      <div className="p-6 hidden lg:block">
        <h1 className="text-xl font-semibold text-white">ChikitsaAI</h1>
      </div>

      <div className="flex-1 px-6">
        <nav className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.label}
                className={cn(
                  "w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors",
                  item.active
                    ? "bg-navy-700 text-white"
                    : "text-gray-400 hover:text-white hover:bg-navy-800",
                )}
              >
                <Icon className="w-5 h-5" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
