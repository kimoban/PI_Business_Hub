import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import { type InsertTask } from "@shared/schema";

export function useTasks(businessId?: number) {
  return useQuery({
    queryKey: [api.tasks.list.path, businessId],
    enabled: !!businessId,
    queryFn: async () => {
      if (!businessId) throw new Error("Business ID required");
      const url = buildUrl(api.tasks.list.path, { businessId });
      const res = await fetch(url, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch tasks");
      return api.tasks.list.responses[200].parse(await res.json());
    },
  });
}

export function useCreateTask(businessId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: Omit<InsertTask, "businessId">) => {
      const url = buildUrl(api.tasks.create.path, { businessId });
      const res = await fetch(url, {
        method: api.tasks.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to create task");
      return api.tasks.create.responses[201].parse(await res.json());
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [api.tasks.list.path, businessId] }),
  });
}

export function useUpdateTask(businessId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...data }: { id: number } & Partial<InsertTask>) => {
      const url = buildUrl(api.tasks.update.path, { id });
      const res = await fetch(url, {
        method: api.tasks.update.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to update task");
      return api.tasks.update.responses[200].parse(await res.json());
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [api.tasks.list.path, businessId] }),
  });
}

export function useDeleteTask(businessId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const url = buildUrl(api.tasks.delete.path, { id });
      const res = await fetch(url, { method: api.tasks.delete.method, credentials: "include" });
      if (!res.ok) throw new Error("Failed to delete task");
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [api.tasks.list.path, businessId] }),
  });
}
