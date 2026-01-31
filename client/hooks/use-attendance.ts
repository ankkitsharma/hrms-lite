"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { attendanceApi } from "@/lib/api";
import type { AttendanceCreate } from "@/types";
import type { AttendanceListParams } from "@/lib/api";

export type AttendanceUpdate = Partial<AttendanceCreate>;

const ATTENDANCE_QUERY_KEY = ["attendance"] as const;

const DEFAULT_LIST_PARAMS: AttendanceListParams = { limit: 10, offset: 0 };

export function useAttendance(params?: AttendanceListParams) {
  const listParams = params ?? DEFAULT_LIST_PARAMS;
  return useQuery({
    queryKey: [...ATTENDANCE_QUERY_KEY, listParams],
    queryFn: () => attendanceApi.list(listParams),
  });
}

export function useAttendanceByEmployee(empId: number | null) {
  return useQuery({
    queryKey: [...ATTENDANCE_QUERY_KEY, "employee", empId],
    queryFn: () => attendanceApi.list({ limit: 1000, offset: 0 }),
    select: (data) => data.items.filter((a) => a.emp_id === empId),
    enabled: empId != null,
  });
}

export function useCreateAttendance() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: AttendanceCreate) => attendanceApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ATTENDANCE_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["present-days"] });
    },
  });
}

export function useUpdateAttendance() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: AttendanceUpdate }) =>
      attendanceApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ATTENDANCE_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["present-days"] });
    },
  });
}

export function useDeleteAttendance() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => attendanceApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ATTENDANCE_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["present-days"] });
    },
  });
}
