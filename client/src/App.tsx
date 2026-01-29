import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/use-auth";
import { useProfile } from "@/hooks/use-business-data";
import { Loader2 } from "lucide-react";

import NotFound from "@/pages/not-found";
import LandingPage from "@/pages/LandingPage";
import Dashboard from "@/pages/Dashboard";
import Tasks from "@/pages/Tasks";
import Customers from "@/pages/Customers";
import Forms from "@/pages/Forms";
import Settings from "@/pages/Settings";
import Onboarding from "@/pages/Onboarding";

function ProtectedRoute({ component: Component }: { component: React.ComponentType }) {
  const { user, isLoading: authLoading } = useAuth();
  const { data: profile, isLoading: profileLoading } = useProfile();
  const [, setLocation] = useLocation();

  if (authLoading || profileLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-muted/20">
        <Loader2 className="animate-spin text-primary w-8 h-8" />
      </div>
    );
  }

  if (!user) {
    // Rely on landing page to show public content or redirect
    return <LandingPage />;
  }

  // If user is logged in but has no profile/business, send to onboarding
  // Unless we are already on the onboarding page logic handled inside Onboarding component mostly
  // But here we need to ensure they don't access dashboard without a business
  if (!profile && window.location.pathname !== "/onboarding") {
    // Special case handling via Router below might be better, but this works
    return <Onboarding />;
  }

  return <Component />;
}

function Router() {
  const { user, isLoading } = useAuth();

  if (isLoading) return null;

  return (
    <Switch>
      <Route path="/">
        {user ? <ProtectedRoute component={Dashboard} /> : <LandingPage />}
      </Route>
      
      <Route path="/onboarding" component={Onboarding} />
      
      <Route path="/tasks">
        <ProtectedRoute component={Tasks} />
      </Route>
      
      <Route path="/customers">
        <ProtectedRoute component={Customers} />
      </Route>
      
      <Route path="/forms">
        <ProtectedRoute component={Forms} />
      </Route>
      
      <Route path="/settings">
        <ProtectedRoute component={Settings} />
      </Route>

      {/* Fallback to 404 */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
