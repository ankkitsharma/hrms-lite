export interface Employee {
  id: number;
  name: string;
  email: string;
  dept: string;
}

export interface EmployeeCreate {
  name: string;
  email: string;
  dept: string;
}

export type AttendanceStatus = "PRESENT" | "ABSENT" | "NULL";

export interface Attendance {
  id: number;
  emp_id: number;
  status: AttendanceStatus;
  date: string; // ISO date YYYY-MM-DD
}

export interface AttendanceCreate {
  emp_id: number;
  status: AttendanceStatus;
  date: string;
}

export interface ApiError {
  detail: string | { msg: string; loc: string[] }[];
}
