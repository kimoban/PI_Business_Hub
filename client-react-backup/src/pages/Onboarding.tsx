import { useAuth } from "@/hooks/use-auth";
import { useCreateBusiness, useCreateProfile, useProfile } from "@/hooks/use-business-data";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useLocation } from "wouter";
import { Building2 } from "lucide-react";

const onboardingSchema = z.object({
  businessName: z.string().min(1, "Business name is required"),
});

export default function Onboarding() {
  const { user } = useAuth();
  const { data: profile } = useProfile();
  const { mutateAsync: createBusiness, isPending: creatingBusiness } = useCreateBusiness();
  const { mutateAsync: createProfile, isPending: creatingProfile } = useCreateProfile();
  const [, setLocation] = useLocation();

  // If already has profile and business, go to dashboard
  if (profile?.business) {
    setLocation("/");
    return null;
  }

  const form = useForm<z.infer<typeof onboardingSchema>>({
    resolver: zodResolver(onboardingSchema),
  });

  const onSubmit = async (data: z.infer<typeof onboardingSchema>) => {
    try {
      // 1. Create Business
      const business = await createBusiness({
        name: data.businessName,
        email: user?.email || "",
      } as any);

      // 2. Create Profile linked to business
      await createProfile({
        businessId: business.id,
        role: "admin",
      });

      // 3. Redirect
      window.location.href = "/";
    } catch (error) {
      console.error("Onboarding failed", error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/20 p-4">
      <Card className="max-w-md w-full shadow-xl">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary mb-4">
            <Building2 size={24} />
          </div>
          <CardTitle className="text-2xl font-display">Setup your business</CardTitle>
          <CardDescription>
            Create a workspace to manage your team and tasks.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium">Business Name</label>
              <Input 
                {...form.register("businessName")} 
                placeholder="Acme Corp" 
                className="h-12"
              />
              {form.formState.errors.businessName && (
                <p className="text-xs text-destructive">{form.formState.errors.businessName.message}</p>
              )}
            </div>
            <Button 
              type="submit" 
              className="w-full h-12 text-base shadow-lg shadow-primary/20" 
              disabled={creatingBusiness || creatingProfile}
            >
              {(creatingBusiness || creatingProfile) ? "Setting up..." : "Create Workspace"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
