"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ErrorState } from "@/components/error-state";
import { LoadingState } from "@/components/loading-state";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useAttendance } from "@/hooks/use-attendance";
import { useEmployees } from "@/hooks/use-employees";
import { useMemo } from "react";

export function DashboardContent() {
  const {
    data: employees,
    isLoading: employeesLoading,
    error: employeesError,
    refetch: refetchEmployees,
  } = useEmployees();
  const {
    data: attendance,
    isLoading: attendanceLoading,
    error: attendanceError,
    refetch: refetchAttendance,
  } = useAttendance();

  const summary = useMemo(() => {
    if (!employees || !attendance) return null;
    const presentCount = attendance.filter(
      (a) => a.status === "PRESENT",
    ).length;
    const absentCount = attendance.filter((a) => a.status === "ABSENT").length;
    const presentByEmployee = attendance.reduce<Record<number, number>>(
      (acc, a) => {
        if (a.status === "PRESENT") acc[a.emp_id] = (acc[a.emp_id] ?? 0) + 1;
        return acc;
      },
      {},
    );
    const topByPresent = employees
      .map((e) => ({ ...e, present: presentByEmployee[e.id] ?? 0 }))
      .sort((a, b) => b.present - a.present)
      .slice(0, 5);
    return { presentCount, absentCount, topByPresent };
  }, [employees, attendance]);

  if (employeesLoading || attendanceLoading) {
    return (
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Employees</CardTitle>
          </CardHeader>
          <CardContent>
            <LoadingState rows={1} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Attendance</CardTitle>
          </CardHeader>
          <CardContent>
            <LoadingState rows={1} />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (employeesError || attendanceError) {
    return (
      <ErrorState
        message={
          employeesError?.message ??
          attendanceError?.message ??
          "Failed to load"
        }
        onRetry={() => {
          refetchEmployees();
          refetchAttendance();
        }}
      />
    );
  }

  const employeeCount = employees?.length ?? 0;
  const presentCount = summary?.presentCount ?? 0;
  const absentCount = summary?.absentCount ?? 0;

  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Total Employees</CardTitle>
            <CardDescription>Registered in the system</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold">{employeeCount}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Present Days</CardTitle>
            <CardDescription>Total present marks</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold text-green-600 dark:text-green-500">
              {presentCount}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Absent Days</CardTitle>
            <CardDescription>Total absent marks</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold text-amber-600 dark:text-amber-500">
              {absentCount}
            </p>
          </CardContent>
        </Card>
      </div>

      {summary && summary.topByPresent.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Present days by employee</CardTitle>
            <CardDescription>Top 5 by present count</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead className="text-right">Present days</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {summary.topByPresent.map((e) => (
                  <TableRow key={e.id}>
                    <TableCell className="font-medium">{e.name}</TableCell>
                    <TableCell>{e.dept}</TableCell>
                    <TableCell className="text-right">{e.present}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {employees && employees.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            No employees yet. Add employees from the Employees page.
          </CardContent>
        </Card>
      )}
    </div>
  );
}
