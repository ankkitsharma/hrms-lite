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

export type ListParams = { limit?: number; offset?: number };

export type PagedResponse<T> = { items: T[]; total: number };

export type EmployeeListParams = ListParams & {
  name?: string;
  email?: string;
  dept?: string;
};

export type AttendanceListParams = ListParams & {
  date?: string;
  emp_id?: number;
  status?: string;
  dept?: string;
  name?: string;
};

function toSearchParams(
  params: Record<string, string | number | undefined>,
): string {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value != null && value !== "") search.set(key, String(value));
  }
  return search.toString();
}

export const employeesApi = {
  list: (params?: EmployeeListParams) => {
    const qs = toSearchParams({
      limit: params?.limit,
      offset: params?.offset,
      name: params?.name,
      email: params?.email,
      dept: params?.dept,
    });
    return api<PagedResponse<Employee>>(`/employees/${qs ? `?${qs}` : ""}`);
  },
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
  list: (params?: AttendanceListParams) => {
    const qs = toSearchParams({
      limit: params?.limit,
      offset: params?.offset,
      date: params?.date,
      emp_id: params?.emp_id,
      status: params?.status,
      dept: params?.dept,
      name: params?.name,
    });
    return api<PagedResponse<Attendance>>(`/attendance/${qs ? `?${qs}` : ""}`);
  },
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

export type DashboardStats = {
  total_employees: number;
  present_days: number;
  absent_days: number;
  total_present_today: number;
  total_absent_today: number;
};

export type PresentDaysRow = {
  emp_id: number;
  name: string;
  dept: string;
  present_count: number;
};

export const dashboardApi = {
  stats: () => api<DashboardStats>("/dashboard/stats"),
};

export type PresentDaysListParams = ListParams;

export const presentDaysApi = {
  list: (params?: PresentDaysListParams) => {
    const qs = toSearchParams({
      limit: params?.limit,
      offset: params?.offset,
    });
    return api<PagedResponse<PresentDaysRow>>(
      `/present-days${qs ? `?${qs}` : ""}`,
    );
  },
};
