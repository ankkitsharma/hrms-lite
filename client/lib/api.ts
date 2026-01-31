import type {
  Attendance,
  AttendanceCreate,
  Employee,
  EmployeeCreate,
} from "@/types";

const API_BASE =
  typeof window !== "undefined"
    ? (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000")
    : (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000");

function getMessage(detail: unknown): string {
  if (typeof detail === "string") return detail;
  if (Array.isArray(detail)) {
    const first = detail[0];
    if (first && typeof first === "object" && "msg" in first)
      return (first as { msg: string }).msg;
  }
  return "An error occurred";
}

export async function api<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    const message = getMessage((body as { detail?: unknown })?.detail);
    throw new Error(message || res.statusText);
  }
  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

export const employeesApi = {
  list: () => api<Employee[]>("/employees/"),
  get: (id: number) => api<Employee>(`/employees/${id}`),
  create: (data: EmployeeCreate) =>
    api<Employee>("/employees/", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  update: (id: number, data: Partial<EmployeeCreate>) =>
    api<Employee>(`/employees/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),
  delete: (id: number) => api<void>(`/employees/${id}`, { method: "DELETE" }),
};

export const attendanceApi = {
  list: () => api<Attendance[]>("/attendance/"),
  get: (id: number) => api<Attendance>(`/attendance/${id}`),
  create: (data: AttendanceCreate) =>
    api<Attendance>("/attendance/", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  update: (id: number, data: Partial<AttendanceCreate>) =>
    api<Attendance>(`/attendance/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),
  delete: (id: number) => api<void>(`/attendance/${id}`, { method: "DELETE" }),
};
