import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import { type InsertForm, type InsertFormSubmission } from "@shared/schema";

// Forms
export function useForms(businessId?: number) {
  return useQuery({
    queryKey: [api.forms.list.path, businessId],
    enabled: !!businessId,
    queryFn: async () => {
      if (!businessId) throw new Error("Business ID required");
      const url = buildUrl(api.forms.list.path, { businessId });
      const res = await fetch(url, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch forms");
      return api.forms.list.responses[200].parse(await res.json());
    },
  });
}

export function useForm(id?: number) {
  return useQuery({
    queryKey: [api.forms.get.path, id],
    enabled: !!id,
    queryFn: async () => {
      if (!id) throw new Error("Form ID required");
      const url = buildUrl(api.forms.get.path, { id });
      const res = await fetch(url, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch form");
      return api.forms.get.responses[200].parse(await res.json());
    },
  });
}

export function useCreateForm(businessId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: Omit<InsertForm, "businessId">) => {
      const url = buildUrl(api.forms.create.path, { businessId });
      const res = await fetch(url, {
        method: api.forms.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to create form");
      return api.forms.create.responses[201].parse(await res.json());
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [api.forms.list.path, businessId] }),
  });
}

export function useDeleteForm(businessId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const url = buildUrl(api.forms.delete.path, { id });
      const res = await fetch(url, { method: api.forms.delete.method, credentials: "include" });
      if (!res.ok) throw new Error("Failed to delete form");
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [api.forms.list.path, businessId] }),
  });
}

// Submissions
export function useFormSubmissions(formId?: number) {
  return useQuery({
    queryKey: [api.submissions.list.path, formId],
    enabled: !!formId,
    queryFn: async () => {
      if (!formId) throw new Error("Form ID required");
      const url = buildUrl(api.submissions.list.path, { formId });
      const res = await fetch(url, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch submissions");
      return api.submissions.list.responses[200].parse(await res.json());
    },
  });
}

export function useCreateSubmission(formId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: { data: any }) => {
      const url = buildUrl(api.submissions.create.path, { formId });
      const res = await fetch(url, {
        method: api.submissions.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to submit form");
      return api.submissions.create.responses[201].parse(await res.json());
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [api.submissions.list.path, formId] }),
  });
}
