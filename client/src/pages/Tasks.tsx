import { AppLayout } from "@/components/AppLayout";
import { useTasks, useCreateTask, useUpdateTask, useDeleteTask } from "@/hooks/use-tasks";
import { useProfile } from "@/hooks/use-business-data";
import { Button } from "@/components/ui/button";
import { Plus, GripVertical, AlertCircle, Trash2 } from "lucide-react";
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
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertTaskSchema, type Task } from "@shared/schema";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";

export default function Tasks() {
  const { data: profile } = useProfile();
  const { data: tasks, isLoading } = useTasks(profile?.business?.id);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  if (isLoading || !profile?.business?.id) return <AppLayout><div className="p-8">Loading tasks...</div></AppLayout>;

  const columns = [
    { id: "todo", title: "To Do", tasks: tasks?.filter(t => t.status === "todo") },
    { id: "in_progress", title: "In Progress", tasks: tasks?.filter(t => t.status === "in_progress") },
    { id: "done", title: "Done", tasks: tasks?.filter(t => t.status === "done") },
  ];

  return (
    <AppLayout>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-display font-bold">Tasks</h1>
          <p className="text-muted-foreground">Manage your team's workload.</p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2 shadow-lg shadow-primary/20">
              <Plus size={18} /> New Task
            </Button>
          </DialogTrigger>
          <CreateTaskDialog 
            businessId={profile.business.id} 
            onClose={() => setIsCreateOpen(false)} 
          />
        </Dialog>
      </div>

      <div className="grid md:grid-cols-3 gap-6 h-full items-start">
        {columns.map((col) => (
          <div key={col.id} className="bg-muted/30 rounded-2xl p-4 border border-border/50">
            <h3 className="font-semibold mb-4 px-2 flex items-center justify-between text-sm uppercase tracking-wider text-muted-foreground">
              {col.title}
              <span className="bg-background border border-border px-2 py-0.5 rounded-md text-xs">
                {col.tasks?.length || 0}
              </span>
            </h3>
            <div className="space-y-3">
              <AnimatePresence>
                {col.tasks?.map((task) => (
                  <TaskCard key={task.id} task={task} businessId={profile.business!.id} />
                ))}
              </AnimatePresence>
              {col.tasks?.length === 0 && (
                <div className="h-24 border-2 border-dashed border-border/50 rounded-xl flex items-center justify-center text-muted-foreground text-sm italic">
                  No tasks
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </AppLayout>
  );
}

function TaskCard({ task, businessId }: { task: Task; businessId: number }) {
  const { mutate: updateTask } = useUpdateTask(businessId);
  const { mutate: deleteTask } = useDeleteTask(businessId);
  const { toast } = useToast();

  const handleStatusChange = (newStatus: string) => {
    updateTask({ id: task.id, status: newStatus as any });
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="bg-card p-4 rounded-xl border border-border shadow-sm hover:shadow-md transition-all group"
    >
      <div className="flex justify-between items-start mb-2">
        <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wide border ${
          task.priority === 'high' ? 'bg-red-50 text-red-600 border-red-100' :
          task.priority === 'medium' ? 'bg-amber-50 text-amber-600 border-amber-100' :
          'bg-green-50 text-green-600 border-green-100'
        }`}>
          {task.priority}
        </span>
        <button 
          onClick={() => {
            if (confirm("Delete this task?")) {
              deleteTask(task.id);
              toast({ title: "Task deleted" });
            }
          }}
          className="text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <Trash2 size={14} />
        </button>
      </div>
      <h4 className="font-semibold text-foreground mb-1">{task.title}</h4>
      <p className="text-xs text-muted-foreground line-clamp-2 mb-4">
        {task.description || "No description"}
      </p>
      
      <div className="flex gap-2">
        {task.status !== 'todo' && (
          <Button 
            variant="outline" 
            size="sm" 
            className="h-7 text-xs flex-1"
            onClick={() => handleStatusChange('todo')}
          >
            ← Todo
          </Button>
        )}
        {task.status !== 'in_progress' && (
          <Button 
            variant="outline" 
            size="sm" 
            className="h-7 text-xs flex-1"
            onClick={() => handleStatusChange('in_progress')}
          >
            {task.status === 'todo' ? 'Start' : '← WIP'}
          </Button>
        )}
        {task.status !== 'done' && (
          <Button 
            variant="outline" 
            size="sm" 
            className="h-7 text-xs flex-1 bg-green-50 hover:bg-green-100 text-green-700 border-green-200"
            onClick={() => handleStatusChange('done')}
          >
            Done ✓
          </Button>
        )}
      </div>
    </motion.div>
  );
}

function CreateTaskDialog({ businessId, onClose }: { businessId: number, onClose: () => void }) {
  const { mutate: createTask, isPending } = useCreateTask(businessId);
  const { toast } = useToast();
  
  const formSchema = insertTaskSchema.omit({ businessId: true, id: true, createdAt: true });
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      priority: "medium",
      status: "todo"
    }
  });

  const onSubmit = (data: z.infer<typeof formSchema>) => {
    createTask(data, {
      onSuccess: () => {
        toast({ title: "Task created successfully" });
        onClose();
      },
      onError: () => {
        toast({ title: "Failed to create task", variant: "destructive" });
      }
    });
  };

  return (
    <DialogContent className="sm:max-w-[425px]">
      <DialogHeader>
        <DialogTitle>Create New Task</DialogTitle>
      </DialogHeader>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Title</label>
          <Input {...form.register("title")} placeholder="e.g. Update homepage banner" />
          {form.formState.errors.title && <p className="text-xs text-destructive">{form.formState.errors.title.message}</p>}
        </div>
        
        <div className="space-y-2">
          <label className="text-sm font-medium">Description</label>
          <Textarea {...form.register("description")} placeholder="Add details..." />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Priority</label>
          <Select 
            defaultValue="medium" 
            onValueChange={(val) => form.setValue("priority", val as any)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="low">Low</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="high">High</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <DialogFooter className="pt-4">
          <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
          <Button type="submit" disabled={isPending}>
            {isPending ? "Creating..." : "Create Task"}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  );
}
