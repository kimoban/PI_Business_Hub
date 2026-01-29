import { AppLayout } from "@/components/AppLayout";
import { useCustomers, useCreateCustomer } from "@/hooks/use-customers";
import { useProfile } from "@/hooks/use-business-data";
import { Button } from "@/components/ui/button";
import { Plus, Search, Mail, Phone, MoreHorizontal } from "lucide-react";
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
import { createCustomerSchema, type CreateCustomer } from "@shared/schema";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export default function Customers() {
  const { data: profile } = useProfile();
  const { data: customers, isLoading } = useCustomers(profile?.business?.id);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [search, setSearch] = useState("");

  if (isLoading || !profile?.business?.id) return <AppLayout><div className="p-8">Loading...</div></AppLayout>;

  const filteredCustomers = customers?.filter(c => 
    c.name.toLowerCase().includes(search.toLowerCase()) || 
    c.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AppLayout>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold">Customers</h1>
          <p className="text-muted-foreground">Manage your client relationships.</p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2 shadow-lg shadow-primary/20">
              <Plus size={18} /> Add Customer
            </Button>
          </DialogTrigger>
          <CreateCustomerDialog 
            businessId={profile.business.id} 
            onClose={() => setIsCreateOpen(false)} 
          />
        </Dialog>
      </div>

      <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
        <div className="p-4 border-b border-border flex gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input 
              placeholder="Search customers..." 
              className="pl-9 bg-muted/20 border-border/50"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
        
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead>Customer</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Added</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredCustomers?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-32 text-center text-muted-foreground">
                  No customers found.
                </TableCell>
              </TableRow>
            ) : (
              filteredCustomers?.map((customer) => (
                <TableRow key={customer.id} className="hover:bg-muted/30">
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="w-9 h-9 border border-border">
                        <AvatarFallback className="bg-primary/10 text-primary text-xs">
                          {customer.name.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <span className="font-medium">{customer.name}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Mail size={14} />
                      {customer.email || "-"}
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Phone size={14} />
                      {customer.phone || "-"}
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {new Date(customer.createdAt!).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground">
                      <MoreHorizontal size={16} />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </AppLayout>
  );
}

function CreateCustomerDialog({ businessId, onClose }: { businessId: number, onClose: () => void }) {
  const { mutate: createCustomer, isPending } = useCreateCustomer(businessId);
  const { toast } = useToast();
  
  const form = useForm<CreateCustomer>({
    resolver: zodResolver(createCustomerSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      notes: ""
    }
  });

  const onSubmit = (data: CreateCustomer) => {
    createCustomer(data, {
      onSuccess: () => {
        toast({ title: "Customer added" });
        onClose();
      },
      onError: () => {
        toast({ title: "Failed to add customer", variant: "destructive" });
      }
    });
  };

  return (
    <DialogContent className="sm:max-w-[425px]">
      <DialogHeader>
        <DialogTitle>Add Customer</DialogTitle>
      </DialogHeader>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Name</label>
          <Input {...form.register("name")} placeholder="John Doe" />
          {form.formState.errors.name && <p className="text-xs text-destructive">{form.formState.errors.name.message}</p>}
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Email</label>
            <Input {...form.register("email")} placeholder="john@example.com" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Phone</label>
            <Input {...form.register("phone")} placeholder="+1 234..." />
          </div>
        </div>
        
        <div className="space-y-2">
          <label className="text-sm font-medium">Notes</label>
          <Input {...form.register("notes")} placeholder="Additional details..." />
        </div>

        <DialogFooter className="pt-4">
          <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
          <Button type="submit" disabled={isPending}>
            {isPending ? "Adding..." : "Add Customer"}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  );
}
