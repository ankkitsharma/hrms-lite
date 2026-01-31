"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

type StatCardProps = {
  value: number | string;
  title: string;
  description: string;
  className?: string;
};

export function StatCard({
  value,
  title,
  description,
  className,
}: StatCardProps) {
  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardContent className="flex flex-col gap-3 px-5 py-4">
        <p className="tabular-nums text-3xl font-semibold tracking-tight leading-none text-amber-600 dark:text-amber-500">
          {value}
        </p>
        <div className="flex flex-col gap-0.5">
          <p className="font-medium leading-tight text-foreground">{title}</p>
          <p className="leading-tight text-muted-foreground">{description}</p>
        </div>
      </CardContent>
    </Card>
  );
}

type StatCardSkeletonProps = {
  className?: string;
};

export function StatCardSkeleton({ className }: StatCardSkeletonProps) {
  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardContent className="flex flex-col gap-3 px-5 py-4">
        <Skeleton className="h-8 w-14 rounded-md" />
        <div className="flex flex-col gap-1">
          <Skeleton className="h-4 w-24 rounded-md" />
          <Skeleton className="h-3 w-32 rounded-md" />
        </div>
      </CardContent>
    </Card>
  );
}
