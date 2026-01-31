"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { employeesApi } from "@/lib/api";
import type { EmployeeCreate } from "@/types";

const EMPLOYEES_QUERY_KEY = ["employees"] as const;

export function useEmployees() {
  return useQuery({
    queryKey: EMPLOYEES_QUERY_KEY,
    queryFn: employeesApi.list,
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
    },
  });
}
