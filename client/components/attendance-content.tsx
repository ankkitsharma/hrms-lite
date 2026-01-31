"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ErrorState } from "@/components/error-state";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LoadingState } from "@/components/loading-state";
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
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import {
  useAttendance,
  useCreateAttendance,
  useUpdateAttendance,
} from "@/hooks/use-attendance";
import { useEmployees } from "@/hooks/use-employees";
import { PresentDaysByEmployeeCard } from "@/components/present-days-by-employee-card";
import type { Attendance, AttendanceStatus } from "@/types";
import { ListFilter as Filter } from "lucide-react";
import { useMemo, useEffect, useRef, useState } from "react";

const FILTER_DEBOUNCE_MS = 300;

type AttendanceFilterColumn = "date" | "employee" | "dept" | "status";

const PAGE_SIZE_OPTIONS = [10, 25, 50] as const;
const DEFAULT_LIMIT = 10;

const STATUS_OPTIONS: { value: AttendanceStatus; label: string }[] = [
  { value: "PRESENT", label: "Present" },
  { value: "ABSENT", label: "Absent" },
  { value: "NULL", label: "Not set" },
];

export function AttendanceContent() {
  const [limit, setLimit] = useState(DEFAULT_LIMIT);
  const [offset, setOffset] = useState(0);
  const [dateFilter, setDateFilter] = useState("");
  const [employeeNameFilter, setEmployeeNameFilter] = useState("");
  const [deptFilter, setDeptFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const debouncedDeptFilter = useDebouncedValue(deptFilter, FILTER_DEBOUNCE_MS);
  const debouncedEmployeeNameFilter = useDebouncedValue(
    employeeNameFilter,
    FILTER_DEBOUNCE_MS,
  );

  const {
    data: employeesListData,
    isLoading: employeesLoading,
    error: employeesError,
    refetch: refetchEmployees,
  } = useEmployees({ limit: 500, offset: 0 });
  const employees = employeesListData?.items;
  const {
    data: attendanceListData,
    isLoading: attendanceLoading,
    error: attendanceError,
    refetch: refetchAttendance,
  } = useAttendance({
    limit,
    offset,
    date: dateFilter || undefined,
    name: debouncedEmployeeNameFilter || undefined,
    dept: debouncedDeptFilter || undefined,
    status: statusFilter || undefined,
  });
  const attendance = attendanceListData?.items;
  const total = attendanceListData?.total ?? 0;
  const createMutation = useCreateAttendance();
  const updateMutation = useUpdateAttendance();
  const [open, setOpen] = useState(false);
  const [editRecord, setEditRecord] = useState<Attendance | null>(null);
  const [editForm, setEditForm] = useState<{
    status: AttendanceStatus;
    date: string;
  }>({
    status: "PRESENT",
    date: "",
  });
  const [editFormError, setEditFormError] = useState<string | null>(null);
  const [form, setForm] = useState({
    emp_id: 0,
    status: "PRESENT" as AttendanceStatus,
    date: new Date().toISOString().slice(0, 10),
  });
  const [formError, setFormError] = useState<string | null>(null);
  const [openFilterColumn, setOpenFilterColumn] =
    useState<AttendanceFilterColumn | null>(null);
  const filterHeaderRef = useRef<HTMLTableSectionElement>(null);
  const filterPanelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!openFilterColumn) return;
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      const el = target as Element;
      const isInsideHeader = filterHeaderRef.current?.contains(target);
      const isInsidePanel = filterPanelRef.current?.contains(target);
      // Don't close when click is inside the portaled Select dropdown (not under the panel)
      const isInsideSelectPortal =
        el?.closest?.(
          "[role='listbox'], [role='option'], [data-radix-select-content], [data-slot='select-content'], [data-slot='select-item']",
        ) ?? false;
      if (isInsideHeader || isInsidePanel || isInsideSelectPortal) return;
      setOpenFilterColumn(null);
    };
    // Use click instead of mousedown so Select's onValueChange runs first and state updates before we close
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, [openFilterColumn]);

  const employeeMap = useMemo(() => {
    if (!employees) return new Map<number, { name: string; dept: string }>();
    return new Map(
      employees.map((e) => [e.id, { name: e.name, dept: e.dept }]),
    );
  }, [employees]);

  const hasFilters =
    !!dateFilter || !!employeeNameFilter || !!deptFilter || !!statusFilter;
  const clearFilters = () => {
    setDateFilter("");
    setEmployeeNameFilter("");
    setDeptFilter("");
    setStatusFilter("");
    setOffset(0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    if (!form.emp_id) {
      setFormError("Please select an employee");
      return;
    }
    try {
      await createMutation.mutateAsync({
        emp_id: form.emp_id,
        status: form.status,
        date: form.date,
      });
      setForm((f) => ({ ...f, date: new Date().toISOString().slice(0, 10) }));
      setOpen(false);
    } catch (err) {
      setFormError(
        err instanceof Error ? err.message : "Failed to mark attendance",
      );
    }
  };

  const handleEditOpen = (record: Attendance) => {
    setEditRecord(record);
    setEditForm({ status: record.status, date: record.date });
    setEditFormError(null);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editRecord) return;
    setEditFormError(null);
    try {
      await updateMutation.mutateAsync({
        id: editRecord.id,
        data: { status: editForm.status, date: editForm.date },
      });
      setEditRecord(null);
    } catch (err) {
      setEditFormError(
        err instanceof Error ? err.message : "Failed to update attendance",
      );
    }
  };

  const error = employeesError || attendanceError;

  if (employeesLoading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Mark attendance</CardTitle>
          </CardHeader>
          <CardContent>
            <LoadingState rows={2} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Attendance records</CardTitle>
          </CardHeader>
          <CardContent>
            <LoadingState rows={6} />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <ErrorState
        message={error.message}
        onRetry={() => {
          refetchEmployees();
          refetchAttendance();
        }}
      />
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle>Mark attendance</CardTitle>
            <CardDescription>
              Record present or absent for an employee on a date
            </CardDescription>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button disabled={!employees?.length}>Mark attendance</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <form onSubmit={handleSubmit}>
                <DialogHeader>
                  <DialogTitle>Mark attendance</DialogTitle>
                  <DialogDescription>
                    Select employee, date, and status
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label>Employee</Label>
                    <Select
                      value={form.emp_id ? String(form.emp_id) : ""}
                      onValueChange={(v) =>
                        setForm((f) => ({ ...f, emp_id: Number(v) }))
                      }
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select employee" />
                      </SelectTrigger>
                      <SelectContent>
                        {employees?.map((e) => (
                          <SelectItem key={e.id} value={String(e.id)}>
                            {e.name} ({e.dept})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="att-date">Date</Label>
                    <Input
                      id="att-date"
                      type="date"
                      value={form.date}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, date: e.target.value }))
                      }
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label>Status</Label>
                    <Select
                      value={form.status}
                      onValueChange={(v) =>
                        setForm((f) => ({
                          ...f,
                          status: v as AttendanceStatus,
                        }))
                      }
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {STATUS_OPTIONS.map((o) => (
                          <SelectItem key={o.value} value={o.value}>
                            {o.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  {formError && (
                    <p className="text-sm text-destructive">{formError}</p>
                  )}
                </div>
                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={createMutation.isPending}>
                    {createMutation.isPending ? "Saving…" : "Save"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle>Attendance records</CardTitle>
            <CardDescription>View and filter by column</CardDescription>
          </div>
          {hasFilters && (
            <Button variant="outline" size="sm" onClick={clearFilters}>
              Clear filters
            </Button>
          )}
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader ref={filterHeaderRef}>
              <TableRow>
                <TableHead className="relative">
                  <div className="flex items-center gap-1">
                    <span>Date</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() =>
                        setOpenFilterColumn((c) =>
                          c === "date" ? null : "date",
                        )
                      }
                      title="Filter by date"
                    >
                      <Filter
                        className={`h-3.5 w-3.5 ${dateFilter ? "text-primary" : ""}`}
                      />
                    </Button>
                    {openFilterColumn === "date" && (
                      <div
                        ref={filterPanelRef}
                        className="absolute left-0 top-full z-10 mt-1 rounded-md border bg-popover p-2 shadow-md"
                      >
                        <Input
                          type="date"
                          value={dateFilter}
                          onChange={(e) => {
                            setDateFilter(e.target.value);
                            setOffset(0);
                          }}
                          className="h-8 w-40"
                          autoFocus
                        />
                      </div>
                    )}
                  </div>
                </TableHead>
                <TableHead className="relative">
                  <div className="flex items-center gap-1">
                    <span>Employee</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() =>
                        setOpenFilterColumn((c) =>
                          c === "employee" ? null : "employee",
                        )
                      }
                      title="Filter by employee"
                    >
                      <Filter
                        className={`h-3.5 w-3.5 ${employeeNameFilter ? "text-primary" : ""}`}
                      />
                    </Button>
                    {openFilterColumn === "employee" && (
                      <div
                        ref={filterPanelRef}
                        className="absolute left-0 top-full z-10 mt-1 rounded-md border bg-popover p-2 shadow-md"
                      >
                        <Input
                          placeholder="Filter by name…"
                          value={employeeNameFilter}
                          onChange={(e) => {
                            setEmployeeNameFilter(e.target.value);
                            setOffset(0);
                          }}
                          className="h-8 w-44"
                          autoFocus
                        />
                      </div>
                    )}
                  </div>
                </TableHead>
                <TableHead className="relative">
                  <div className="flex items-center gap-1">
                    <span>Department</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() =>
                        setOpenFilterColumn((c) =>
                          c === "dept" ? null : "dept",
                        )
                      }
                      title="Filter by department"
                    >
                      <Filter
                        className={`h-3.5 w-3.5 ${deptFilter ? "text-primary" : ""}`}
                      />
                    </Button>
                    {openFilterColumn === "dept" && (
                      <div
                        ref={filterPanelRef}
                        className="absolute left-0 top-full z-10 mt-1 rounded-md border bg-popover p-2 shadow-md"
                      >
                        <Input
                          placeholder="Filter dept…"
                          value={deptFilter}
                          onChange={(e) => {
                            setDeptFilter(e.target.value);
                            setOffset(0);
                          }}
                          className="h-8 w-44"
                          autoFocus
                        />
                      </div>
                    )}
                  </div>
                </TableHead>
                <TableHead className="relative">
                  <div className="flex items-center gap-1">
                    <span>Status</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() =>
                        setOpenFilterColumn((c) =>
                          c === "status" ? null : "status",
                        )
                      }
                      title="Filter by status"
                    >
                      <Filter
                        className={`h-3.5 w-3.5 ${statusFilter ? "text-primary" : ""}`}
                      />
                    </Button>
                    {openFilterColumn === "status" && (
                      <div
                        ref={filterPanelRef}
                        className="absolute left-0 top-full z-10 mt-1 w-40 rounded-md border bg-popover p-2 shadow-md"
                      >
                        <Select
                          value={statusFilter || "all"}
                          onValueChange={(v) => {
                            setStatusFilter(v === "all" ? "" : v);
                            setOffset(0);
                          }}
                        >
                          <SelectTrigger className="h-8">
                            <SelectValue placeholder="All statuses" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All statuses</SelectItem>
                            {STATUS_OPTIONS.map((o) => (
                              <SelectItem key={o.value} value={o.value}>
                                {o.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                  </div>
                </TableHead>
                <TableHead className="w-[80px]">
                  <span className="sr-only">Actions</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {attendanceLoading ? (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="h-24 text-center text-muted-foreground"
                  >
                    Loading…
                  </TableCell>
                </TableRow>
              ) : attendance && attendance.length === 0 && offset === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="py-8 text-center">
                    <p className="font-medium">
                      {hasFilters
                        ? "No records match filters"
                        : "No attendance records yet"}
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      {hasFilters
                        ? "Try different filters or mark attendance"
                        : "Mark attendance using the button above"}
                    </p>
                  </TableCell>
                </TableRow>
              ) : (
                attendance?.map((a) => {
                  const emp = employeeMap.get(a.emp_id);
                  return (
                    <TableRow key={a.id}>
                      <TableCell className="font-mono">{a.date}</TableCell>
                      <TableCell className="font-medium">
                        {emp?.name ?? `Employee #${a.emp_id}`}
                      </TableCell>
                      <TableCell>{emp?.dept ?? "—"}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            a.status === "PRESENT" ? "default" : "secondary"
                          }
                          className={
                            a.status === "PRESENT"
                              ? "bg-green-600 hover:bg-green-600/90"
                              : a.status === "ABSENT"
                                ? "bg-amber-600 hover:bg-amber-600/90"
                                : ""
                          }
                        >
                          {a.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditOpen(a)}
                        >
                          Edit
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
          {!attendanceLoading &&
            !(attendance && attendance.length === 0 && offset === 0) &&
            total > 10 &&
            (offset > 0 || (attendance?.length ?? 0) > 0) && (
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
                    disabled={offset + (attendance?.length ?? 0) >= total}
                    onClick={() => setOffset((o) => o + limit)}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
        </CardContent>
      </Card>

      <Dialog
        open={editRecord !== null}
        onOpenChange={(open) => !open && setEditRecord(null)}
      >
        <DialogContent className="sm:max-w-[425px]">
          <form onSubmit={handleEditSubmit}>
            <DialogHeader>
              <DialogTitle>Edit attendance</DialogTitle>
              <DialogDescription>
                Update status or date for this record
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-att-date">Date</Label>
                <Input
                  id="edit-att-date"
                  type="date"
                  value={editForm.date}
                  onChange={(e) =>
                    setEditForm((f) => ({ ...f, date: e.target.value }))
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label>Status</Label>
                <Select
                  value={editForm.status}
                  onValueChange={(v) =>
                    setEditForm((f) => ({
                      ...f,
                      status: v as AttendanceStatus,
                    }))
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {STATUS_OPTIONS.map((o) => (
                      <SelectItem key={o.value} value={o.value}>
                        {o.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {editFormError && (
                <p className="text-sm text-destructive">{editFormError}</p>
              )}
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setEditRecord(null)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={updateMutation.isPending}>
                {updateMutation.isPending ? "Saving…" : "Save changes"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <PresentDaysByEmployeeCard />
    </div>
  );
}
