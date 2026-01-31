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
import { EmptyState } from "@/components/empty-state";
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
import {
  useAttendance,
  useCreateAttendance,
  useUpdateAttendance,
} from "@/hooks/use-attendance";
import { useEmployees } from "@/hooks/use-employees";
import type { Attendance, AttendanceStatus } from "@/types";
import { useMemo, useState } from "react";

const STATUS_OPTIONS: { value: AttendanceStatus; label: string }[] = [
  { value: "PRESENT", label: "Present" },
  { value: "ABSENT", label: "Absent" },
  { value: "NULL", label: "Not set" },
];

export function AttendanceContent() {
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
  const [dateFilter, setDateFilter] = useState("");
  const [form, setForm] = useState({
    emp_id: 0,
    status: "PRESENT" as AttendanceStatus,
    date: new Date().toISOString().slice(0, 10),
  });
  const [formError, setFormError] = useState<string | null>(null);

  const employeeMap = useMemo(() => {
    if (!employees) return new Map<number, { name: string; dept: string }>();
    return new Map(
      employees.map((e) => [e.id, { name: e.name, dept: e.dept }]),
    );
  }, [employees]);

  const filteredAttendance = useMemo(() => {
    if (!attendance) return [];
    if (!dateFilter) return attendance;
    return attendance.filter((a) => a.date === dateFilter);
  }, [attendance, dateFilter]);

  const presentByEmployee = useMemo(() => {
    if (!attendance) return new Map<number, number>();
    const map = new Map<number, number>();
    for (const a of attendance) {
      if (a.status === "PRESENT")
        map.set(a.emp_id, (map.get(a.emp_id) ?? 0) + 1);
    }
    return map;
  }, [attendance]);

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

  const isLoading = employeesLoading || attendanceLoading;
  const error = employeesError || attendanceError;

  if (isLoading) {
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
        <CardHeader className="flex flex-row flex-wrap items-end justify-between gap-4 space-y-0">
          <div>
            <CardTitle>Attendance records</CardTitle>
            <CardDescription>View and filter by date</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Label
              htmlFor="date-filter"
              className="text-sm text-muted-foreground whitespace-nowrap"
            >
              Filter by date
            </Label>
            <Input
              id="date-filter"
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="w-[160px]"
            />
            {dateFilter && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setDateFilter("")}
              >
                Clear
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {filteredAttendance.length === 0 ? (
            <EmptyState
              title={
                dateFilter
                  ? "No records for this date"
                  : "No attendance records yet"
              }
              description={
                dateFilter
                  ? "Try another date or mark attendance"
                  : "Mark attendance using the button above"
              }
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Employee</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-[80px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAttendance.map((a) => {
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
                })}
              </TableBody>
            </Table>
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

      {employees && employees.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Present days per employee</CardTitle>
            <CardDescription>
              Total present marks for each employee
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employee</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead className="text-right">Present days</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {employees.map((e) => (
                  <TableRow key={e.id}>
                    <TableCell className="font-medium">{e.name}</TableCell>
                    <TableCell>{e.dept}</TableCell>
                    <TableCell className="text-right">
                      {presentByEmployee.get(e.id) ?? 0}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
