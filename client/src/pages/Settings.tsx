import { AppLayout } from "@/components/AppLayout";
import { useProfile, useUpdateBusiness } from "@/hooks/use-business-data";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertBusinessSchema } from "@shared/schema";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export default function Settings() {
  const { data: profile } = useProfile();

  if (!profile?.business) return <AppLayout><div className="p-8">Loading...</div></AppLayout>;

  return (
    <AppLayout>
      <div className="max-w-3xl space-y-8">
        <div>
          <h1 className="text-3xl font-display font-bold">Settings</h1>
          <p className="text-muted-foreground">Manage your business profile and preferences.</p>
        </div>

        <BusinessSettingsForm business={profile.business} />
        
        <Card className="border-border/60">
          <CardHeader>
            <CardTitle>Subscription</CardTitle>
            <CardDescription>Manage your plan and billing.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between p-4 bg-muted/20 rounded-xl border border-border">
              <div>
                <p className="font-semibold">Current Plan: Free</p>
                <p className="text-sm text-muted-foreground">Basic features for small teams.</p>
              </div>
              <Button variant="outline">Upgrade Plan</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}

function BusinessSettingsForm({ business }: { business: any }) {
  const { mutate: updateBusiness, isPending } = useUpdateBusiness();
  const { toast } = useToast();
  
  const formSchema = insertBusinessSchema.omit({ id: true, createdAt: true });
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: business.name,
      email: business.email || "",
      phone: business.phone || "",
      industry: business.industry || "",
    }
  });

  const onSubmit = (data: z.infer<typeof formSchema>) => {
    updateBusiness({ id: business.id, ...data }, {
      onSuccess: () => toast({ title: "Settings updated" }),
      onError: () => toast({ title: "Failed to update", variant: "destructive" })
    });
  };

  return (
    <Card className="border-border/60">
      <CardHeader>
        <CardTitle>Business Profile</CardTitle>
        <CardDescription>Update your company details.</CardDescription>
      </CardHeader>
      <Separator />
      <CardContent className="pt-6">
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Company Name</label>
            <Input {...form.register("name")} />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
             <div className="space-y-2">
              <label className="text-sm font-medium">Business Email</label>
              <Input {...form.register("email")} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Phone</label>
              <Input {...form.register("phone")} />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Industry</label>
            <Input {...form.register("industry")} />
          </div>

          <div className="pt-2 flex justify-end">
            <Button type="submit" disabled={isPending}>
              {isPending ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
