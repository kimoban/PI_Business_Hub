import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import { type InsertBusiness, type InsertProfile } from "@shared/schema";

// Profile & Business Context
export function useProfile() {
  return useQuery({
    queryKey: [api.profiles.me.path],
    queryFn: async () => {
      const res = await fetch(api.profiles.me.path, { credentials: "include" });
      if (res.status === 401) return null;
      if (!res.ok) throw new Error("Failed to fetch profile");
      return api.profiles.me.responses[200].parse(await res.json());
    },
  });
}

export function useCreateProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: Omit<InsertProfile, "userId">) => {
      const res = await fetch(api.profiles.create.path, {
        method: api.profiles.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to create profile");
      return api.profiles.create.responses[201].parse(await res.json());
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [api.profiles.me.path] }),
  });
}

export function useBusiness(id?: number) {
  return useQuery({
    queryKey: [api.businesses.get.path, id],
    enabled: !!id,
    queryFn: async () => {
      if (!id) throw new Error("Business ID required");
      const url = buildUrl(api.businesses.get.path, { id });
      const res = await fetch(url, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch business");
      return api.businesses.get.responses[200].parse(await res.json());
    },
  });
}

export function useUpdateBusiness() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...data }: { id: number } & Partial<InsertBusiness>) => {
      const url = buildUrl(api.businesses.update.path, { id });
      const res = await fetch(url, {
        method: api.businesses.update.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to update business");
      return api.businesses.update.responses[200].parse(await res.json());
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: [api.businesses.get.path, id] });
      queryClient.invalidateQueries({ queryKey: [api.profiles.me.path] });
    },
  });
}

export function useCreateBusiness() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: InsertBusiness) => {
      const res = await fetch(api.businesses.create.path, {
        method: api.businesses.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to create business");
      return api.businesses.create.responses[201].parse(await res.json());
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [api.profiles.me.path] }),
  });
}
