"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { attendanceApi } from "@/lib/api";
import type { AttendanceCreate } from "@/types";

export type AttendanceUpdate = Partial<AttendanceCreate>;

const ATTENDANCE_QUERY_KEY = ["attendance"] as const;

export function useAttendance() {
  return useQuery({
    queryKey: ATTENDANCE_QUERY_KEY,
    queryFn: attendanceApi.list,
  });
}

export function useAttendanceByEmployee(empId: number | null) {
  return useQuery({
    queryKey: [...ATTENDANCE_QUERY_KEY, "employee", empId],
    queryFn: attendanceApi.list,
    select: (data) => data.filter((a) => a.emp_id === empId),
    enabled: empId != null,
  });
}

export function useCreateAttendance() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: AttendanceCreate) => attendanceApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ATTENDANCE_QUERY_KEY });
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
    },
  });
}

export function useDeleteAttendance() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => attendanceApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ATTENDANCE_QUERY_KEY });
    },
  });
}
