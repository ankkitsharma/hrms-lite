"use client";

import { ErrorState } from "@/components/error-state";
import { dashboardApi } from "@/lib/api";
import { PresentDaysByEmployeeCard } from "@/components/present-days-by-employee-card";
import { StatCard, StatCardSkeleton } from "@/components/stat-card";
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
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {[1, 2, 3, 4, 5].map((i) => (
            <StatCardSkeleton key={i} />
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
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        <StatCard
          value={total_employees}
          title="Total Employees"
          description="Registered in the system"
        />
        <StatCard
          value={present_days}
          title="Present Days"
          description="Total present marks"
          variant="green"
        />
        <StatCard
          value={absent_days}
          title="Absent Days"
          description="Total absent marks"
          variant="amber"
        />
        <StatCard
          value={total_present_today}
          title="Total Present Today"
          description="Present marks for today"
          variant="green"
        />
        <StatCard
          value={total_absent_today}
          title="Total Absent Today"
          description="Absent marks for today"
          variant="amber"
        />
      </div>

      <PresentDaysByEmployeeCard />
    </div>
  );
}
