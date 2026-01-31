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
import { dashboardApi } from "@/lib/api";
import { PresentDaysByEmployeeCard } from "@/components/present-days-by-employee-card";
import { useQuery } from "@tanstack/react-query";

export function DashboardContent() {
  const {
    data: stats,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["dashboard", "stats"],
    queryFn: () => dashboardApi.stats(),
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {[1, 2, 3, 4, 5].map((i) => (
            <Card key={i}>
              <CardHeader>
                <CardTitle>—</CardTitle>
              </CardHeader>
              <CardContent>
                <LoadingState rows={1} />
              </CardContent>
            </Card>
          ))}
        </div>
        <PresentDaysByEmployeeCard />
      </div>
    );
  }

  if (error) {
    return (
      <ErrorState
        message={error instanceof Error ? error.message : "Failed to load"}
        onRetry={() => refetch()}
      />
    );
  }

  const {
    total_employees,
    present_days,
    absent_days,
    total_present_today,
    total_absent_today,
  } = stats ?? {
    total_employees: 0,
    present_days: 0,
    absent_days: 0,
    total_present_today: 0,
    total_absent_today: 0,
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        <Card>
          <CardHeader>
            <CardTitle>Total Employees</CardTitle>
            <CardDescription>Registered in the system</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold">{total_employees}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Present Days</CardTitle>
            <CardDescription>Total present marks</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold text-green-600 dark:text-green-500">
              {present_days}
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
              {absent_days}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Total Present Today</CardTitle>
            <CardDescription>Present marks for today</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold text-green-600 dark:text-green-500">
              {total_present_today}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Total Absent Today</CardTitle>
            <CardDescription>Absent marks for today</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold text-amber-600 dark:text-amber-500">
              {total_absent_today}
            </p>
          </CardContent>
        </Card>
      </div>

      <PresentDaysByEmployeeCard />
    </div>
  );
}
