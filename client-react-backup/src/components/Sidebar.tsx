import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  CheckSquare,
  FileSpreadsheet,
  Users,
  Settings,
  LogOut,
  Building2
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useProfile } from "@/hooks/use-business-data";

export function Sidebar() {
  const [location] = useLocation();
  const { logout } = useAuth();
  const { data: profile } = useProfile();

  const menuItems = [
    { href: "/", icon: LayoutDashboard, label: "Overview" },
    { href: "/tasks", icon: CheckSquare, label: "Tasks" },
    { href: "/forms", icon: FileSpreadsheet, label: "Forms & Data" },
    { href: "/customers", icon: Users, label: "Customers" },
    { href: "/settings", icon: Settings, label: "Settings" },
  ];

  return (
    <aside className="w-64 bg-card border-r border-border h-screen sticky top-0 hidden md:flex flex-col">
      <div className="p-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
            <Building2 size={20} />
          </div>
          <div className="flex flex-col">
            <h1 className="font-display font-bold text-lg leading-tight truncate w-36">
              {profile?.business?.name || "My Business"}
            </h1>
            <span className="text-xs text-muted-foreground capitalize">
              {profile?.business?.subscriptionStatus || "Free Plan"}
            </span>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-4 space-y-1">
        {menuItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200",
              location === item.href
                ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
            )}
          >
            <item.icon size={18} />
            {item.label}
          </Link>
        ))}
      </nav>

      <div className="p-4 border-t border-border">
        <button
          onClick={() => logout()}
          className="flex items-center gap-3 px-4 py-3 w-full text-sm font-medium text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-xl transition-colors"
        >
          <LogOut size={18} />
          Sign Out
        </button>
      </div>
    </aside>
  );
}
