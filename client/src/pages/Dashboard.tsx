import { useProfile } from "@/hooks/use-business-data";
import { useTasks } from "@/hooks/use-tasks";
import { useCustomers } from "@/hooks/use-customers";
import { useForms } from "@/hooks/use-forms";
import { AppLayout } from "@/components/AppLayout";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { CheckCircle2, Users, FileText, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";

export default function Dashboard() {
  const { data: profile, isLoading: loadingProfile } = useProfile();
  
  if (loadingProfile) {
    return (
      <AppLayout>
        <div className="space-y-4">
          <Skeleton className="h-12 w-1/3" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="flex flex-col space-y-8">
        <div>
          <h2 className="text-3xl font-display font-bold tracking-tight text-foreground">
            Welcome back, {profile?.user?.firstName || "User"}
          </h2>
          <p className="text-muted-foreground mt-1">
            Here's what's happening with your business today.
          </p>
        </div>

        {/* Stats Grid */}
        <DashboardStats businessId={profile?.business?.id} />
        
        {/* Charts & Activity */}
        <div className="grid lg:grid-cols-2 gap-8">
          <TaskActivityChart businessId={profile?.business?.id} />
          <RecentActivity businessId={profile?.business?.id} />
        </div>
      </div>
    </AppLayout>
  );
}

function DashboardStats({ businessId }: { businessId?: number }) {
  const { data: tasks } = useTasks(businessId);
  const { data: customers } = useCustomers(businessId);
  const { data: forms } = useForms(businessId);

  const stats = [
    {
      label: "Active Tasks",
      value: tasks?.filter(t => t.status !== "done").length || 0,
      icon: CheckCircle2,
      color: "text-blue-500",
      bg: "bg-blue-500/10"
    },
    {
      label: "Total Customers",
      value: customers?.length || 0,
      icon: Users,
      color: "text-indigo-500",
      bg: "bg-indigo-500/10"
    },
    {
      label: "Forms Created",
      value: forms?.length || 0,
      icon: FileText,
      color: "text-amber-500",
      bg: "bg-amber-500/10"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {stats.map((stat, i) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.1 }}
        >
          <Card className="border-border/60 shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-6 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
                <p className="text-3xl font-display font-bold mt-2">{stat.value}</p>
              </div>
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${stat.bg} ${stat.color}`}>
                <stat.icon className="w-6 h-6" />
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}

function TaskActivityChart({ businessId }: { businessId?: number }) {
  const { data: tasks } = useTasks(businessId);

  const data = [
    { name: "Todo", value: tasks?.filter(t => t.status === "todo").length || 0, color: "#94a3b8" },
    { name: "In Progress", value: tasks?.filter(t => t.status === "in_progress").length || 0, color: "#3b82f6" },
    { name: "Done", value: tasks?.filter(t => t.status === "done").length || 0, color: "#22c55e" },
  ];

  return (
    <Card className="border-border/60 shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg font-bold flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-muted-foreground" />
          Task Status
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] w-full mt-4">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <XAxis 
                dataKey="name" 
                stroke="#888888" 
                fontSize={12} 
                tickLine={false} 
                axisLine={false} 
              />
              <YAxis 
                stroke="#888888" 
                fontSize={12} 
                tickLine={false} 
                axisLine={false} 
                allowDecimals={false}
              />
              <Tooltip 
                cursor={{ fill: 'transparent' }}
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
              />
              <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

function RecentActivity({ businessId }: { businessId?: number }) {
  const { data: tasks } = useTasks(businessId);
  const recentTasks = tasks?.slice(0, 5) || [];

  return (
    <Card className="border-border/60 shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg font-bold">Recent Tasks</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {recentTasks.length === 0 ? (
            <p className="text-muted-foreground text-sm">No recent activity.</p>
          ) : (
            recentTasks.map((task) => (
              <div key={task.id} className="flex items-start gap-4">
                <div className={`mt-1 w-2 h-2 rounded-full ${
                  task.status === "done" ? "bg-green-500" : 
                  task.status === "in_progress" ? "bg-blue-500" : "bg-slate-300"
                }`} />
                <div className="flex-1 space-y-1">
                  <p className="text-sm font-medium leading-none">{task.title}</p>
                  <p className="text-xs text-muted-foreground capitalize">
                    {task.status.replace("_", " ")} • {task.priority} priority
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
