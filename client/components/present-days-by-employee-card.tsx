"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ErrorState } from "@/components/error-state";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { usePresentDays } from "@/hooks/use-present-days";
import { useState } from "react";

const PAGE_SIZE_OPTIONS = [10, 25, 50] as const;
const DEFAULT_LIMIT = 10;

export function PresentDaysByEmployeeCard() {
  const [limit, setLimit] = useState(DEFAULT_LIMIT);
  const [offset, setOffset] = useState(0);

  const {
    data: listData,
    isLoading,
    error,
    refetch,
  } = usePresentDays({ limit, offset });

  const items = listData?.items ?? [];
  const total = listData?.total ?? 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Present days by employee</CardTitle>
        <CardDescription>Count of present marks per employee</CardDescription>
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
            {isLoading ? (
              <TableRow>
                <TableCell
                  colSpan={3}
                  className="h-24 text-center text-muted-foreground"
                >
                  Loading…
                </TableCell>
              </TableRow>
            ) : error ? (
              <TableRow>
                <TableCell colSpan={3} className="py-8 text-center">
                  <ErrorState
                    message={
                      error instanceof Error ? error.message : "Failed to load"
                    }
                    onRetry={() => refetch()}
                  />
                </TableCell>
              </TableRow>
            ) : items.length === 0 && offset === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={3}
                  className="py-8 text-center text-muted-foreground"
                >
                  No employees yet. Add employees and mark attendance.
                </TableCell>
              </TableRow>
            ) : (
              items.map((row) => (
                <TableRow key={row.emp_id}>
                  <TableCell className="font-medium">{row.name}</TableCell>
                  <TableCell>{row.dept}</TableCell>
                  <TableCell className="text-right">
                    {row.present_count}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
        {!isLoading &&
          !error &&
          total > 10 &&
          (offset > 0 || items.length > 0) && (
            <div className="flex items-center justify-between border-t pt-4 mt-4">
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">
                  Rows per page
                </span>
                <Select
                  value={String(limit)}
                  onValueChange={(v) => {
                    setLimit(Number(v));
                    setOffset(0);
                  }}
                >
                  <SelectTrigger className="w-[70px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PAGE_SIZE_OPTIONS.map((n) => (
                      <SelectItem key={n} value={String(n)}>
                        {n}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">
                  Page {Math.floor(offset / limit) + 1} of{" "}
                  {Math.ceil(total / limit) || 1}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={offset === 0}
                  onClick={() => setOffset((o) => Math.max(0, o - limit))}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={offset + items.length >= total}
                  onClick={() => setOffset((o) => o + limit)}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
      </CardContent>
    </Card>
  );
}
