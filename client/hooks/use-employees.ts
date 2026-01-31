"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { employeesApi } from "@/lib/api";
import type { EmployeeCreate } from "@/types";
import type { EmployeeListParams } from "@/lib/api";

export type EmployeeUpdate = Partial<EmployeeCreate>;

const EMPLOYEES_QUERY_KEY = ["employees"] as const;

const DEFAULT_LIST_PARAMS: EmployeeListParams = { limit: 10, offset: 0 };

export function useEmployees(params?: EmployeeListParams) {
  const listParams = params ?? DEFAULT_LIST_PARAMS;
  return useQuery({
    queryKey: [...EMPLOYEES_QUERY_KEY, listParams],
    queryFn: () => employeesApi.list(listParams),
  });
}

export function useEmployee(id: number | null) {
  return useQuery({
    queryKey: [...EMPLOYEES_QUERY_KEY, id],
    queryFn: () => employeesApi.get(id!),
    enabled: id != null,
  });
}

export function useCreateEmployee() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: EmployeeCreate) => employeesApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: EMPLOYEES_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["present-days"] });
    },
  });
}

export function useUpdateEmployee() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: EmployeeUpdate }) =>
      employeesApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: EMPLOYEES_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ["attendance"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["present-days"] });
    },
  });
}

export function useDeleteEmployee() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => employeesApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: EMPLOYEES_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ["attendance"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["present-days"] });
    },
  });
}
