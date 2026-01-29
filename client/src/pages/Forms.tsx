import { AppLayout } from "@/components/AppLayout";
import { useForms, useCreateForm } from "@/hooks/use-forms";
import { useProfile } from "@/hooks/use-business-data";
import { Button } from "@/components/ui/button";
import { Plus, FileText, ArrowUpRight } from "lucide-react";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createFormSchema, type CreateForm } from "@shared/schema";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Forms() {
  const { data: profile } = useProfile();
  const { data: forms, isLoading } = useForms(profile?.business?.id);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  if (isLoading || !profile?.business?.id) return <AppLayout><div className="p-8">Loading...</div></AppLayout>;

  return (
    <AppLayout>
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-display font-bold">Forms</h1>
          <p className="text-muted-foreground">Collect data from your team in the field.</p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2 shadow-lg shadow-primary/20">
              <Plus size={18} /> Create Form
            </Button>
          </DialogTrigger>
          <CreateFormDialog 
            businessId={profile.business.id} 
            onClose={() => setIsCreateOpen(false)} 
          />
        </Dialog>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {forms?.map((form) => (
          <Card key={form.id} className="hover:shadow-lg transition-shadow border-border/60">
            <CardHeader className="flex flex-row items-start justify-between pb-2">
              <div className="w-10 h-10 rounded-lg bg-orange-100 text-orange-600 flex items-center justify-center">
                <FileText size={20} />
              </div>
            </CardHeader>
            <CardContent>
              <CardTitle className="text-lg font-bold mb-2">{form.title}</CardTitle>
              <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                {form.description || "No description provided."}
              </p>
              <Button variant="outline" className="w-full gap-2 text-xs">
                View Submissions <ArrowUpRight size={14} />
              </Button>
            </CardContent>
          </Card>
        ))}
        {forms?.length === 0 && (
          <div className="col-span-full h-48 border-2 border-dashed border-border/50 rounded-2xl flex flex-col items-center justify-center text-muted-foreground">
            <p>No forms created yet.</p>
            <Button variant="link" onClick={() => setIsCreateOpen(true)}>Create your first form</Button>
          </div>
        )}
      </div>
    </AppLayout>
  );
}

function CreateFormDialog({ businessId, onClose }: { businessId: number, onClose: () => void }) {
  const { mutate: createForm, isPending } = useCreateForm(businessId);
  const { toast } = useToast();
  
  const form = useForm<CreateForm>({
    resolver: zodResolver(createFormSchema),
    defaultValues: {
      title: "",
      description: "",
    }
  });

  const onSubmit = (data: CreateForm) => {
    // For prototype, we just send a static schema
    const payload = {
      ...data,
      schema: { fields: [{ name: "notes", type: "text" }] }
    };

    createForm(payload, {
      onSuccess: () => {
        toast({ title: "Form created" });
        onClose();
      },
      onError: () => {
        toast({ title: "Failed to create form", variant: "destructive" });
      }
    });
  };

  return (
    <DialogContent className="sm:max-w-[425px]">
      <DialogHeader>
        <DialogTitle>Create New Form</DialogTitle>
      </DialogHeader>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Form Title</label>
          <Input {...form.register("title")} placeholder="e.g. Site Inspection" />
          {form.formState.errors.title && <p className="text-xs text-destructive">{form.formState.errors.title.message}</p>}
        </div>
        
        <div className="space-y-2">
          <label className="text-sm font-medium">Description</label>
          <Input {...form.register("description")} placeholder="Purpose of this form..." />
        </div>

        <div className="bg-muted/30 p-3 rounded-lg text-xs text-muted-foreground">
          Note: This prototype creates a default form schema. Field builder coming soon.
        </div>

        <DialogFooter className="pt-4">
          <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
          <Button type="submit" disabled={isPending}>
            {isPending ? "Creating..." : "Create Form"}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  );
}
