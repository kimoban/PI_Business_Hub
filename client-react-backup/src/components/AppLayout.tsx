import { Sidebar } from "./Sidebar";
import { Menu } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import {
  LayoutDashboard,
  CheckSquare,
  FileSpreadsheet,
  Users,
  Settings,
  LogOut,
  Building2
} from "lucide-react";
import { cn } from "@/lib/utils";

export function AppLayout({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [location] = useLocation();
  const { logout } = useAuth();

  const menuItems = [
    { href: "/", icon: LayoutDashboard, label: "Overview" },
    { href: "/tasks", icon: CheckSquare, label: "Tasks" },
    { href: "/forms", icon: FileSpreadsheet, label: "Forms & Data" },
    { href: "/customers", icon: Users, label: "Customers" },
    { href: "/settings", icon: Settings, label: "Settings" },
  ];

  const MobileNav = () => (
    <div className="flex flex-col h-full">
      <div className="p-6 border-b border-border">
         <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
            <Building2 size={20} />
          </div>
          <span className="font-display font-bold text-lg">Menu</span>
        </div>
      </div>
      <nav className="flex-1 px-4 py-6 space-y-1">
        {menuItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            onClick={() => setIsOpen(false)}
            className={cn(
              "flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200",
              location === item.href
                ? "bg-primary text-primary-foreground"
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
    </div>
  );

  return (
    <div className="flex h-screen bg-muted/20">
      <Sidebar />
      <main className="flex-1 overflow-auto">
        <div className="md:hidden sticky top-0 z-20 bg-background/80 backdrop-blur-md border-b border-border px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground">
              <Building2 size={16} />
            </div>
            <span className="font-display font-bold text-lg">App</span>
          </div>
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <button className="p-2 -mr-2 text-muted-foreground hover:text-foreground">
                <Menu size={24} />
              </button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 w-80">
              <MobileNav />
            </SheetContent>
          </Sheet>
        </div>
        <div className="p-4 md:p-8 lg:p-12 max-w-7xl mx-auto space-y-8">
          {children}
        </div>
      </main>
    </div>
  );
}
